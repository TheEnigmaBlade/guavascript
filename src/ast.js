var escodegen = require("escodegen");
var x = module.exports = {};

// Helpers

function identifier(name) {
	return {
		type: "Identifier",
		name: name,
		_expr: true
	};
}

function literal(raw_val, val) {
	return {
		type: "Literal",
		raw: raw_val,
		value: val,
		_expr: true
	};
}

function singleVarDeclare(type, id, init, rawId) {
	return x.VarDeclarations(type, [x.VarDeclaration(id, init, rawId)]);
}

// UID generation
var _uid = 0;

function getUID(prefix) {
	_uid += 1;
	hex = ("00000000" + _uid.toString(16)).substr(-8);
	return "$$"+prefix+"_"+hex+"$$";
}

x.getUID = getUID;

// Public

x.Program = function(body) {
	function line(str) {
		return {
			type: "Line",
			value: str
		};
	}
	
	var d = new Date();
	
	return {
		type: "Program",
		body: body,
		leadingComments: [
			line("   ,:."),
			line("  (:::) Script"),
			line("   `-'"),
			line(" Generated by GuavaScript (guavac) v0.1"),
			line(" Last modified: "+d.toLocaleString())
		]
	};
};

x.Expression = function(e) {
	return {
		type: "ExpressionStatement",
		expression: e
	};
};

x.ExecExpression = function(id, func) {
	if(id) {
		func = x.CallExpression(identifier(id), [func]);
	}
	
	return {
		type: "ExpressionStatement",
		expression: x.CallExpression(func)
	};
};

x.FuncExpression = function(id, params, body) {
	if(!params) {
		params = [];
	}
	
	return {
		type: "FunctionExpression",
		id: id ? identifier(id) : null,
		params: params || [],
		body: body,
		_func: true
	};
};

x.AnonFuncExpression = function(params, body) {
	if(!params) {
		params = [];
	}
	
	var f = x.FuncExpression(null, params, body);
	f._anon = true;
	return f;
};

x.toFuncDeclaration = function(funcExpression, newName) {
	if(newName) {
		funcExpression.id = identifier(newName);
	}
	funcExpression.type = "FunctionDeclaration";
	return funcExpression;
};

x.BlockExpression = function(body) {
	return {
		type: "BlockStatement",
		body: body
	};
};

x.ObjectExpression = function(body) {
	return {
		type: "ObjectExpression",
		properties: body
	};
};

x.ObjectThing = function(label, body) {
	return {
		type: "Property",
		key: label,
		value: body,
		// Don't know what these do D:
		computed: false,
		kind: "init"
	};
};

x.ArrayExpression = function(body) {
	return {
		type: "ArrayExpression",
		elements: body
	};
};

x.CallExpression = function(callee, args) {
	return {
		type: "CallExpression",
		callee: callee,
		arguments: args || [],
		_expr: true
	};
};

x.IfExpression = function(cond, body) {
	//console.log("Making if");
	return {
		type: "IfStatement",
		test: cond,
		consequent: body,
		alternate: null,
		_if: true
	};
};

x.ElseIfExpression = function(cond, body) {
	//console.log("Making else if");
	return {
		type: "IfStatement",
		test: cond,
		consequent: body,
		alternate: null,
		_if_else: true
	};
};

x.ElseExpression = function(body) {
	//console.log("Making else");
	body._else = true;
	return body;
};

x.TernaryExpression = function(cond, body, altBody) {
	return {
		type: "ConditionalExpression",
		test: cond,
		consequent: body,
		alternate: altBody
	};
}

x.LoopExpression = function(body) {
	return {
		type: "WhileStatement",
		test: x.BooleanLiteral(true),
		body: body
	};
};

x.WhileLoop = function(test, body) {
	return {
		type: "WhileStatement",
		test: test,
		body: body
	};
};

x.ForLoop = function(varId, op, fromExpr, toExpr, stepExpr, body, extraId, extraExpr) {
	varId = identifier(varId);
	
	var step
	if(stepExpr === 1) {
		step = {
			type: "UpdateExpression",
			operator: "++",
			argument: varId,
			prefix: false
		};
	}
	else if(stepExpr.type === "UnaryExpression" && stepExpr.operator === "-") {
		if(op === "<") {
			op = ">";
		}
		else if(op === "<=") {
			op = ">=";
		}
		
		var stepExpr = stepExpr.argument;
		if(stepExpr.type === "Literal" && stepExpr.value === 1) {
			step = {
				type: "UpdateExpression",
				operator: "--",
				argument: varId,
				prefix: false
			};
		}
		else {
			step = {
				type: "AssignmentExpression",
				operator: "-=",
				left: varId,
				right: stepExpr
			};
		}
	}
	else {
		step = {
			type: "AssignmentExpression",
			operator: "+=",
			left: varId,
			right: stepExpr
		};
	}
	
	if(extraId) {
		body.body.unshift(singleVarDeclare("var", extraId, extraExpr));
	}
	
	return {
		type: "ForStatement",
		init: singleVarDeclare("var", varId, fromExpr, true),
		test: x.BinaryExpression(op, varId, toExpr),
		update: step,
		body: body
	};
};

x.ForEachLoop = function(iter, varId, body, reversed) {
	var iterId = identifier(getUID("for"));
	body.body.unshift(singleVarDeclare("var", varId, x.MemberExpression(iter, iterId)));
	
	var start, end, endOp;
	if(reversed) {
		start = x.BinaryExpression("-", x.PropertyExpression(iter, identifier("length")), 1);
		end = x.NumericLiteral("0");
		endOp = ">=";
	}
	else {
		start = x.NumericLiteral("0");
		end = x.PropertyExpression(iter, identifier("length"));
		endOp = "<";
	}
	
	return {
		type: "ForStatement",
		init: singleVarDeclare("var", iterId, start, true),
		test: x.BinaryExpression(endOp, iterId, end),
		update: {
			type: "UpdateExpression",
			operator: reversed ? "--" : "++",
			argument: iterId,
			prefix: false
		},
		body: body
	};
};

x.Return = function(arg) {
	if(arg === undefined) {
		arg = null;
	}
	
	return {
		type: "ReturnStatement",
		argument: arg
	};
};

x.Break = function() {
	return {
		type: "BreakStatement",
		label: null
	};
};

x.Continue = function() {
	return {
		type: "ContinueStatement",
		label: null
	};
};

x.VarDeclarations = function(type, decs) {
	return {
		type: "VariableDeclaration",
		kind: type,
		declarations: decs
	};
};

x.VarDeclaration = function(id, init, rawId) {
	if(init === undefined) {
		init = null;
	}
	
	return {
		type: "VariableDeclarator",
		id: rawId ? id : identifier(id),
		init: init
	};
};

x.ThrowStatement = function(arg) {
	return {
		type: "ThrowStatement",
		argument: arg
	};
};

x.TryExpression = function(body, catchBlock, finallyBlock) {
	if(catchBlock === undefined) {
		catchBlock = null;
	}
	if(finallyBlock === undefined) {
		finallyBlock = null;
	}
	
	return {
		type: "TryStatement",
		block: body,
		handler: catchBlock,
		finalizer: finallyBlock
	};
};

x.CatchClause = function(param, body) {
	return {
		type: "CatchClause",
		param: param,
		body: body
	};
};

x.UnaryExpression = function(op, arg, prefix) {
	if(prefix === undefined) {
		prefix = true;
	}
	
	return {
		type: "UnaryExpression",
		operator: op,
		argument: arg,
		prefix: prefix,
		_expr: true
	};
};

x.NewExpression = function(callee, args) {
	return {
		type: "NewExpression",
		callee: callee,
		arguments: args || [],
		_expr: true
	};
};

x.BinaryExpression = function(op, left, right) {
	return {
		type: "BinaryExpression",
		operator: op,
		left: left,
		right: right,
		_expr: true
	};
};

x.LogicExpression = function(op, left, right) {
	return {
		type: "LogicalExpression",
		operator: op,
		left: left,
		right: right,
		_expr: true
	};
};

x.MemberExpression = function(obj, prop) {
	return {
		type: "MemberExpression",
		computed: true,
		object: obj,
		property: prop,
		_expr: true
	};
};

x.PropertyExpression = function(obj, prop) {
	return {
		type: "MemberExpression",
		computed: false,
		object: obj,
		property: prop,
		_expr: true
	};
};

x.AssignExpression = function(op, left, right) {
	return {
		type: "AssignmentExpression",
		operator: op,
		left: left,
		right: right,
		_expr: true
	};
};

x.NumericLiteral = function(raw_val) {
	raw_val = raw_val.replace(/_/g, "");
	return literal(raw_val, Number(raw_val));
};

x.StringLiteral = function(raw_val) {
	return literal("'"+raw_val+"'", raw_val);
};

x.BooleanLiteral = function(val) {
	return literal(val.toString(), val);
};

x.ThisExpression = function() {
	return {
		type: "ThisExpression"
	};
};

x.NullLiteral = function() {
	return literal("null", null);
};

x.Undefined = function() {
	return identifier("undefined");
};

x.Regex = function(regex) {
	var end = regex.lastIndexOf("/");
	
	var l = literal(regex, {});
	l.regex = {
		pattern: regex.substring(1, end),
		flags: end+1 < regex.length ? regex.substring(end+1) : ""
	};
	// Despite being the output from other parsers, escodegen doesn't output the literal
	// regexp properly. Overriding with the verbatim property for now.
	l._verbatim = {
		content: regex,
		precedence : escodegen.Precedence.Primary,
	};
	return l;
};

x.Identifier = identifier;

// Special ops

x.DivideInt = function(left, right){
	return x.CallExpression(
		x.PropertyExpression(identifier("Math"), identifier("floor")),
		[x.BinaryExpression("/", left, right)]
	);
};

// Function aliases

x.AliasPrint = function(args, funcName) {
	return x.CallExpression(x.PropertyExpression(identifier("console"), identifier(funcName ? funcName : "log")), args);
};

x.AliasError = function(args) {
	return x.AliasPrint(args, "error");
};
