%{
	var ast = require("./ast");
	
	// Depth tracking
	var depth = 0;
	
	function incDepth() {
		depth += 1;
	}
	
	function decDepth() {
		depth -= 1;
	}
	
	var top_level_if = [];
	
	function processTopLevelExpression(e, nameAnon) {
		// Move if-else/else into alternate slots
		if(e._if) {
			e._depth = depth;
			top_level_if.push(e);
			return e;
		}
		if(e._if_else || e._else) {
			var top;
			if(top_level_if.length === 0 || (top = top_level_if[top_level_if.length-1])._depth !== depth) {
				throw "else-if/else found before if";
			}
			
			top.alternate = e;
			if(e._else) {
				top_level_if.pop();
			}
			return null;
		}
		
		//console.log("Processing top level thing");
		while(top_level_if.length > 0 && top_level_if[top_level_if.length-1]._depth >= depth) {
			top_level_if.pop();
		}
		
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
%}

/* operator associations and precedence */

%left BITOR
%left BITAND
%left AND OR
%left NOT
%left PLUS MINUS
%left MULTIPLY DIVIDE
%right UMINUS

%start program

%%

program
	: expressions EOF										{return ast.Program($1);}
	;

/* Expressions */

expressions
	: w expression_list expression w						{$$ = $2; noNullPush($$, processTopLevelExpression($3));}
	| w expression w										{$$ = []; noNullPush($$, processTopLevelExpression($2));}
	| w														{$$ = [];}
	;
	
	expression_list
		: expression_list expression W						{noNullPush($1, processTopLevelExpression($2));}
		| expression W										{$$ = []; noNullPush($$, processTopLevelExpression($1));}
		;

expression
	: declaration											{$$ = $1;}
	| alias_call_expressions								{$$ = $1;}
	| execution_expression									{$$ = $1;}
	| anon_expression										{$$ = $1;}
	| object_expression										{$$ = $1;}
	| array_expression										{$$ = $1;}
	| function_expression									{$$ = $1;}
	| control_expression									{$$ = $1;}
	| loop_expression										{$$ = $1;}
	| assignment_expression									{$$ = $1;}
	;

alias_call_expressions
	: PRINT alias_call										{$$ = ast.AliasPrint($2);}
	| ERROR alias_call										{$$ = ast.AliasError($2);}
	;
	
	alias_call
		: LPAREN w RPAREN									{$$ = [];}
		| LPAREN w call_arguments w RPAREN					{$$ = $3;}
		;

declaration
	: VARIABLE IDENTIFIER									{$$ = ast.VarDeclaration($1, $2);}
	| VARIABLE IDENTIFIER assignment_operator expression	{$$ = ast.VarDeclaration($1, $2, $4);}
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
	: LEXEC expressions REXEC								{$$ = ast.AnonFuncExpression(null, $2);}
	| LEXEC BITOR anon_arguments BITOR expressions REXEC	{$$ = ast.AnonFuncExpression($2, $4);}
	;
	
	anon_arguments
		: IDENTIFIER										{$$ = [ast.Identifier($1)];}
		| anon_arguments COMMA IDENTIFIER					{$1.push(ast.Identifier($3));}
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
		| ELSE w block_expression								{$$ = ast.ElseExpression($3);}
		;
	
loop_expression
	: LOOP block_expression														{$$ = ast.LoopExpression($2);}
	| WHILE conditional_expression w block_expression							{$$ = ast.WhileLoop($2, $4);}
	| FOR IDENTIFIER IN iterable w block_expression								{$$ = ast.ForEachLoop($4, $2, $6);}
	| FOR IDENTIFIER IN op_expression RANGE op_expression w block_expression	{$$ = ast.ForLoop($2, $4, $6, 1, $8);}
	| FOR IDENTIFIER IN op_expression RANGE op_expression STEP op_expression w block_expression		{$$ = ast.ForLoop($2, $4, $6, $8, $10);}
	;
	
	iterable
		: op_expression
		| array_expression
		;

block_expression
	: LBRACKET inc_depth expressions dec_depth RBRACKET			{$$ = ast.BlockExpression($3);}
	;
	
	inc_depth:	{incDepth();};
	dec_depth:	{decDepth();};

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
	: unary_expression										{$$ = $1;}
	| op_expression op_operator unary_expression			{$$ = ast.BinaryExpression($2, $1, $3);}
	;
	
	op_operator
		: PLUS					{$$ = "+";}
		| MINUS					{$$ = "-";}
		| MULTIPLY				{$$ = "*";}
		| DIVIDE				{$$ = "/";}
		;

unary_expression
	: post_expression										{$$ = $1;}
	| MINUS unary_expression %prec UMINUS					{$$ = ast.UnaryExpression("-", $2);}
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
	| LPAREN w conditional_expression w RPAREN				{$$ = $2;}
	;

constant
	: NUMBER												{$$ = ast.NumericLiteral($1);}
	| STRING												{$$ = ast.StringLiteral($1);}
	| TRUE													{$$ = ast.BooleanLiteral(true);}
	| FALSE													{$$ = ast.BooleanLiteral(false);}
	| NULL													{$$ = ast.NullLiteral();}
	| UNDEFINED												{$$ = ast.Undefined();}
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
