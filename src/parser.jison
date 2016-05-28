%{
	var ast = require("./ast");
	var debug = false;
	
	function print(t) {
		if(debug) {
			console.log(t);
		}
	}
	
	// Depth tracking
	var depth = 0;
	
	function incDepth() {
		depth += 1;
	}
	
	function decDepth() {
		depth -= 1;
	}
	
	// Post-processing
	
	var top_level_if = [];
	
	function pruneTopIfs(currentDepth, same) {
		if(!same) {
			currentDepth++;
		}
		while(top_level_if.length > 0 && top_level_if[top_level_if.length-1]._depth >= currentDepth) {
			var top = top_level_if.pop();
			print("Popped if at "+top._depth);
		}
	}
	
	function processTopLevelExpression(yy, e, nameAnon) {
		// Move if-else/else into alternate slots
		if(e._if) {
			print("!Start if: "+depth);
			e._depth = depth;
			top_level_if.push(e);
			return e;
		}
		if(e._if_else || e._else) {
			print("!Start if-else/else: "+depth);
			pruneTopIfs(depth);
			
			if(top_level_if.length === 0) {
				throw Error("No previous ifs for else")
			}
			
			var top = top_level_if[top_level_if.length-1];
			print("  Top if depth: "+top._depth);
			if(top._depth !== depth) {
				throw Error("else-if/else found before if");
			}
			
			top.alternate = e;
			top_level_if.pop();
			if(e._if_else) {
				e._depth = depth;
				top_level_if.push(e);
			}
			return null;
		}
		
		print("Processing other top-level thing");
		print("  Depth: "+depth);
		print("  Type: "+e.type);
		pruneTopIfs(depth, true);
		
		// Wrap or declarize functions
		if(e._anon) {
			// Wrap non-named anonymous functions
			if(nameAnon) {
				return ast.toFuncDeclaration(e, ast.getUID("anon"));
			}
			else {
				return ast.ExecExpression(null, e);
			}
		}
		if(e._func) {
			// Change named functions to declarations
			return ast.toFuncDeclaration(e);
		}
		// Wrap plain expressions
		if(e._expr) {
			return ast.Expression(e);
		}
		
		return e;
	}
	
	function noNullPush(list, thing) {
		if(thing !== undefined && thing !== null) {
			list.push(thing);
		}
	}
	
	// Exports
	
	if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
		exports.reset = function() {
			depth = 0;
			top_level_if = [];
		};
	}
%}

%left INSTANCEOF IN MAX MIN
%left BITAND BITOR BITXOR
%left AND OR
%right NOT
%left PLUS MINUS
%left MULTIPLY DIVIDE DIVIDEINT MODULUS
%left POWER
%right UMINUS

%start program

%%

program
	: expressions EOF										{return ast.Program($1);}
	;

expressions
	: w expression_list expression w						{$$ = $2; noNullPush($$, processTopLevelExpression(yy, $3));}
	| w expression w										{$$ = []; noNullPush($$, processTopLevelExpression(yy, $2));}
	| w expression_list statement w							{$$ = $2; noNullPush($$, processTopLevelExpression(yy, $3));}
	| w statement w											{$$ = []; noNullPush($$, processTopLevelExpression(yy, $2));}
	| w														{$$ = [];}
	;
	
	expression_list
		: expression_list expression W						{noNullPush($1, processTopLevelExpression(yy, $2));}
		| expression W										{$$ = []; noNullPush($$, processTopLevelExpression(yy, $1));}
		| expression_list statement W						{noNullPush($1, processTopLevelExpression(yy, $2));}
		| statement W										{$$ = []; noNullPush($$, processTopLevelExpression(yy, $1));}
		;

// Statements

statement
	: var_declaration										{$$ = $1;}
	| import_declaration									{$$ = $1;}
	| THROW expression										{$$ = ast.ThrowStatement($2);}
	;

var_declaration
	: VARIABLE var_declarators								{$$ = ast.VarDeclarations($1, $2);}
	;
	
	var_declarators
		: IDENTIFIER															{$$ = [ast.VarDeclaration($1)];}
		| IDENTIFIER assignment_operator expression								{$$ = [ast.VarDeclaration($1, $3)];}
		| var_declarators COMMA w IDENTIFIER									{$1.push(ast.VarDeclaration($4));}
		| var_declarators COMMA w IDENTIFIER assignment_operator expression		{$1.push(ast.VarDeclaration($4, $6));}
		;

import_declaration
	: IMPORT STRING											{$$ = ast.ImportDeclaration($2);}
	| IMPORT import_members FROM STRING						{$$ = ast.ImportDeclaration($4, $2);}
	| IMPORT AS IDENTIFIER FROM STRING						{$$ = ast.ImportAllDeclaration($5, $3);}
	;
	
	import_members
		: IDENTIFIER										{$$ = [ast.ImportMember($1)];}
		| IDENTIFIER AS IDENTIFIER							{$$ = [ast.ImportMember($1, $3)];}
		| IDENTIFIER COMMA import_members					{$$ = $3; $$.unshift(ast.ImportMember($1, $1));} /* Make non-default specifier if chained */
		| IDENTIFIER AS IDENTIFIER COMMA import_members		{$$ = $5; $$.unshift(ast.ImportMember($1, $3));}
		;

// Expressions

expression
	: alias_call_expressions								{$$ = $1;}
	| execution_expression									{$$ = $1;}
	//| anon_expression										{$$ = $1;}
	//| object_expression										{$$ = $1;}
	//| array_expression										{$$ = $1;}
	| function_expression									{$$ = $1;}
	| control_expression									{$$ = $1;}
	| loop_expression										{$$ = $1;}
	| assignment_expression									{$$ = $1;}
	| try_catch_expression									{$$ = $1;}
	;

alias_call_expressions
	: PRINT alias_call										{$$ = ast.AliasPrint($2);}
	| ERROR alias_call										{$$ = ast.AliasError($2);}
	;
	
	alias_call
		: LPAREN w RPAREN									{$$ = [];}
		| LPAREN w call_arguments w RPAREN					{$$ = $3;}
		;

execution_expression
	: IDENTIFIER anon_expression							{$$ = ast.ExecExpression($1, $2);}
	;

object_expression
	: LBRACKET object_contents RBRACKET						{$$ = ast.ObjectExpression($2);}
	;
	
	object_contents
		: w object_content_thing w							{$$ = [$2];}
		| w object_content_thing COMMA object_contents		{$$ = $4; $$.unshift($2);}
		| w													{$$ = [];}
		;
		
		object_content_thing
			: IDENTIFIER COLON w expression					{$$ = ast.ObjectThing(ast.Identifier($1), $4);}
			| STRING COLON w expression						{$$ = ast.ObjectThing(ast.StringLiteral($1), $4);}
			;

array_expression
	: LSQUARE array_contents RSQUARE						{$$ = ast.ArrayExpression($2);}
	;
	
	array_contents
		: w expression w									{$$ = [$2];}
		| w expression COMMA array_contents					{$$ = $4; $$.unshift($2);}
		| w													{$$ = [];}
		;

function_expression
	: FUNCTION w block_expression														{$$ = ast.AnonFuncExpression(null, $3);}
	| FUNCTION IDENTIFIER w block_expression											{$$ = ast.FuncExpression($2, null, $4);}
	| FUNCTION LPAREN w function_arguments_opt RPAREN w block_expression				{$$ = ast.AnonFuncExpression($4, $7);}
	| FUNCTION IDENTIFIER LPAREN w function_arguments_opt RPAREN w block_expression		{$$ = ast.FuncExpression($2, $5, $8);}
	;
	
	function_arguments_opt
		: function_arguments w								{$$ = $1;}
		| 													{$$ = [];}
		;
	
		function_arguments
			: IDENTIFIER									{$$ = [ast.Identifier($1)];}
			| function_arguments COMMA w IDENTIFIER			{$1.push(ast.Identifier($4));}
			;

anon_expression
	: LEXEC expressions REXEC								{$$ = ast.AnonFuncExpression(null, ast.BlockExpression($2));}
	//| BITOR anon_arguments BITOR LEXEC expressions REXEC	{$$ = ast.AnonFuncExpression($2, ast.BlockExpression($5));}
	| LEXEC w COLON anon_arguments COLON expressions REXEC	{$$ = ast.AnonFuncExpression($4, ast.BlockExpression($6));}
	| LEXEC w ARGMARK anon_arguments expressions REXEC		{$$ = ast.AnonFuncExpression($4, ast.BlockExpression($5));}
	;
	
	anon_arguments
		: IDENTIFIER										{$$ = [ast.Identifier($1)];}
		| anon_arguments COMMA w IDENTIFIER					{$1.push(ast.Identifier($4));}
		;

control_expression
	: if_control_expression												{$$ = $1;}
	| conditional_expression TERNARY w expression COLON w expression	{$$ = ast.TernaryExpression($1, $4, $7);}
	| BREAK																{$$ = ast.Break();}
	| CONTINUE															{$$ = ast.Continue();}
	| RETURN															{$$ = ast.Return();}
	| RETURN expression													{$$ = ast.Return($2);}
	;
	
	if_control_expression
		: IF conditional_expression w block_expression			{$$ = ast.IfExpression($2, $4);}
		| ELSE IF conditional_expression w block_expression		{$$ = ast.ElseIfExpression($3, $5);}
		| ELIF conditional_expression w block_expression		{$$ = ast.ElseIfExpression($2, $4);}
		| ELSE w block_expression								{$$ = ast.ElseExpression($3);}
		;
	
loop_expression
	: LOOP w block_expression													{$$ = ast.LoopExpression($3);}
	| WHILE conditional_expression w block_expression							{$$ = ast.WhileLoop($2, $4);}
	| for_loop_expressions
	;
	
	for_loop_expressions
		: FOR IDENTIFIER IN post_expression w block_expression				{$$ = ast.ForEachLoop($4, $2, $6);}
		| FOR IDENTIFIER IN post_expression REVERSE w block_expression				{$$ = ast.ForEachLoop($4, $2, $7, true);}
		| FOR IDENTIFIER IN op_expression range_operator op_expression w block_expression		{$$ = ast.ForLoop($2, $5, $4, $6, 1, $8);}
		| FOR IDENTIFIER IN op_expression range_operator op_expression STEP op_expression w block_expression		{$$ = ast.ForLoop($2, $5, $4, $6, $8, $10);}
		| FOR IDENTIFIER COMMA IDENTIFIER IN op_expression range_operator op_expression WITH op_expression w block_expression		{$$ = ast.ForLoop($2, $7, $6, $8, 1, $12, $4, $10);}
		| FOR IDENTIFIER COMMA IDENTIFIER IN op_expression range_operator op_expression STEP op_expression WITH op_expression w block_expression		{$$ = ast.ForLoop($2, $7, $6, $8, $10, $14, $4, $12);}
		;
		
		range_operator
			: RANGE					{$$ = "<";}
			| RANGEINC				{$$ = "<=";}
			;

try_catch_expression
	: TRY expression w CATCH IDENTIFIER w block_expression		{
		$$ = ast.TryExpression(ast.BlockExpression([processTopLevelExpression(yy, $2)]),
								ast.CatchClause(ast.Identifier($5), $7));
	}
	| IF expression CATCH IDENTIFIER w block_expression {
		$$ = ast.TryExpression(ast.BlockExpression([processTopLevelExpression(yy, $2)]),
								ast.CatchClause(ast.Identifier($4), $6));
	}
	;

	block_expression
		: LBRACKET inc_depth expressions dec_depth RBRACKET			{$$ = ast.BlockExpression($3);}
		;
		
		inc_depth:	{incDepth();};
		dec_depth:	{decDepth();};

// Begin "normal" expression chain

assignment_expression
	: conditional_expression								{$$ = $1;}
	| post_expression assignment_operator expression		{$$ = ast.AssignExpression($2, $1, $3);}
	;

	assignment_operator
		: ASSIGN					{$$ = "=";}
		| PLUSASSIGN				{$$ = "+=";}
		| MINUSASSIGN				{$$ = "-=";}
		| MULTIPLYASSIGN			{$$ = "*=";}
		| DIVIDEASSIGN				{$$ = "/=";}
		| ORASSIGN					{$$ = "|=";}
		| ANDASSIGN					{$$ = "&=";}
		;

conditional_expression
	: compare_expression									{$$ = $1;}
	| conditional_expression OR conditional_expression		{$$ = ast.LogicExpression("||", $1, $3);}
	| conditional_expression AND conditional_expression		{$$ = ast.LogicExpression("&&", $1, $3);}
	| NOT conditional_expression							{$$ = ast.UnaryExpression("!", $2);}
	;
	
compare_expression
	: op_expression											{$$ = $1;}
	| compare_expression compare_operator op_expression		{$$ = ast.BinaryExpression($2, $1, $3);}
	;
	
	compare_operator
		: GT					{$$ = ">";}
		| LT					{$$ = "<";}
		| GTE					{$$ = ">=";}
		| LTE					{$$ = "<=";}
		| EQUALS				{$$ = "===";}
		| NOTEQUALS				{$$ = "!==";}
		;

op_expression
	: unary_expression									{$$ = $1;}
	| op_expression PLUS op_expression					{$$ = ast.BinaryExpression("+", $1, $3);}
	| op_expression MINUS op_expression					{$$ = ast.BinaryExpression("-", $1, $3);}
	| op_expression MULTIPLY op_expression				{$$ = ast.BinaryExpression("*", $1, $3);}
	| op_expression DIVIDE op_expression				{$$ = ast.BinaryExpression("/", $1, $3);}
	| op_expression DIVIDEINT op_expression				{$$ = ast.DivideInt($1, $3);}
	| op_expression MODULUS op_expression				{$$ = ast.BinaryExpression("%", $1, $3);}
	| op_expression BITAND op_expression				{$$ = ast.BinaryExpression("&", $1, $3);}
	| op_expression BITOR op_expression					{$$ = ast.BinaryExpression("|", $1, $3);}
	| op_expression BITXOR op_expression				{$$ = ast.BinaryExpression("^", $1, $3);}
	| op_expression INSTANCEOF op_expression			{$$ = ast.BinaryExpression("instanceof", $1, $3);}
	| op_expression IN op_expression					{$$ = ast.BinaryExpression("in", $1, $3);}
	| op_expression MAX op_expression					{$$ = ast.CustomBinaryExpression("max", $1, $3);}
	| op_expression MIN op_expression					{$$ = ast.CustomBinaryExpression("min", $1, $3);}
	| op_expression POWER op_expression					{$$ = ast.CustomBinaryExpression("pow", $1, $3);}
	;

unary_expression
	: post_expression										{$$ = $1;}
	| MINUS unary_expression %prec UMINUS					{$$ = ast.UnaryExpression("-", $2);}
	| NEW post_expression LPAREN w RPAREN					{$$ = ast.NewExpression($2);}
	| NEW post_expression LPAREN w call_arguments w RPAREN	{$$ = ast.NewExpression($2, $5);}
	| TYPEOF post_expression								{$$ = ast.UnaryExpression("typeof", $2);}
	| DELETE post_expression								{$$ = ast.UnaryExpression("delete", $2);}
	;

post_expression
	: primary_expression									{$$ = $1;}
	| post_expression LPAREN w RPAREN						{$$ = ast.CallExpression($1);}
	| post_expression LPAREN w call_arguments w RPAREN		{$$ = ast.CallExpression($1, $4);}
	| post_expression LSQUARE expression RSQUARE			{$$ = ast.MemberExpression($1, $3);}
	| post_expression DOT IDENTIFIER						{$$ = ast.PropertyExpression($1, ast.Identifier($3));}
	;
	
	call_arguments
		: expression										{$$ = [$1];}
		| call_arguments COMMA w expression					{$1.push($4);}
		;

primary_expression
	: IDENTIFIER											{$$ = ast.Identifier($1);}
	| constant												{$$ = $1;}
	| LPAREN w expression w RPAREN							{$$ = $3;}
	| anon_expression										{$$ = $1;}
	| object_expression										{$$ = $1;}
	| array_expression										{$$ = $1;}
	;

constant
	: NUMBER												{$$ = ast.NumericLiteral($1);}
	| HEXNUMBER												{$$ = ast.NumericLiteral($1);}
	| OCTALNUMBER											{$$ = ast.NumericLiteral($1);}
	| BINARYNUMBER											{$$ = ast.NumericLiteral($1);}
	| STRING												{$$ = ast.StringLiteral($1);}
	| THIS													{$$ = ast.ThisExpression();}
	| TRUE													{$$ = ast.BooleanLiteral(true);}
	| FALSE													{$$ = ast.BooleanLiteral(false);}
	| NULL													{$$ = ast.NullLiteral();}
	| UNDEFINED												{$$ = ast.Undefined();}
	| REGEX													{$$ = ast.Regex($1);}
	;

// Utilities because I'm bad at grammars

W
	: W NEWLINE
	| NEWLINE
	;

w
	: W
	|
	;
