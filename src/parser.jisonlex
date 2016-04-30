%{
	if(!(yy.commentDepth)) {
		yy.string = "";
		yy.commentDepth = 0;
	}
%}

newline			[\n\r]
number			([0-9]+(\.[0-9]+)?)|(\.[0-9]+)
hexnumber		[0-9a-fA-F]+
octalnumber		[0-7]+
binarynumber	[01]+
id				[a-zA-Z_$][a-zA-Z0-9_$]*

%x dstring
%x sstring
%x esc
%x comment

%%

"//".*						/* Ignore comments */
"#".*						/* Ignore comments */
"/*"						{yy.commentDepth++; this.begin("comment");}
<comment>.*?("/*")			{yy.commentDepth++;}
<comment>.*?("*/")			{yy.commentDepth--; if(yy.commentDepth === 0) {this.popState();}}

{newline}+					return "NEWLINE";
\s+							/* Ignore whitespace */

\"							{this.begin("dstring"); yy.string = "";}
<dstring>\"					{this.popState(); yytext = yy.string; return "STRING";}
<dstring>\\					{this.begin("esc");}
<dstring>[^"\\]*			{yy.string += yytext;}

\'							{this.begin("sstring"); yy.string = "";}
<sstring>\'					{this.popState(); yytext = yy.string; return "STRING";}
<sstring>\\					{this.begin("esc");}
<sstring>[^'\\]*			{yy.string += yytext;}

<esc>[n]					{yy.string += "\n"; this.popState();}	/* There has to be a better way to do this... */
<esc>[r]					{yy.string += "\r"; this.popState();}
<esc>[t]					{yy.string += "\t"; this.popState();}
<esc>[0]					{yy.string += "\0"; this.popState();}
<esc>[']					{yy.string += "\'"; this.popState();}
<esc>["]					{yy.string += "\""; this.popState();}

"{{"						return "LEXEC";
"}}"						return "REXEC";
".."						return "RANGE";

"+="						return "PLUSASSIGN";
"-="						return "MINUSASSIGN";
"*="						return "MULTIPLAYASSIGN";
"/="						return "DIVIDEASSIGN";
"=="						return "EQUALS";
"!="						return "NOTEQUALS";
">="						return "GTE";
"<="						return "LTE";
">"							return "GT";
"<"							return "LT";
"and"						return "AND";
"or"						return "OR";
"not"						return "NOT";

"*"							return "MULTIPLY";
"/"							return "DIVIDE";
"-"							return "MINUS";
"+"							return "PLUS";
"="							return "ASSIGN";
"|"							return "BITOR";
"&"							return "BITAND";

"{"							return "LBRACKET";
"}"							return "RBRACKET";
"["							return "LSQUARE";
"]"							return "RSQUARE";
"("							return "LPAREN";
")"							return "RPAREN";
"."							return "DOT";
","							return "COMMA";
":"							return "COLON";
"?"							return "TERNARY";

"true"						return "TRUE";
"false"						return "FALSE";
"null"						return "NULL";
"undefined"					return "UNDEFINED";

"function"					return "FUNCTION";
"func"						return "FUNCTION";
"fun"						return "FUNCTION";
"var"						return "VARIABLE";
"let"						return "VARIABLE";
"if"						return "IF";
"else"						return "ELSE";
"loop"						return "LOOP";
"while"						return "WHILE";
"for"						return "FOR";
"in"						return "IN";
"step"						return "STEP";
"by"						return "STEP";
"return"					return "RETURN";
"break"						return "BREAK";
"continue"					return "CONTINUE";
"print"						return "PRINT";
"error"						return "ERROR";

{id}						return "IDENTIFIER";
"0x"{hexnumber}\b			return "HEXNUMBER";
"0o"{octalnumber}\b			return "OCTALNUMBER";
"0b"{binarynumber}\b		return "BINARYNUMBER";
{number}\b					return "NUMBER";

<<EOF>>						return "EOF";
.							return "INVALID";
