%{
	if(!yy._setup) {
		yy._setup = true;
		yy.commentDepth = 0;
		//yy.blockDepth = 0;
	}
%}

newline			[\n\r]
space			[ \t]
number			([0-9]([_]?[0-9])*)([\.][0-9]+)?|[\.][0-9]+
hexnumber		[0-9a-fA-F]([_]?[0-9a-fA-F])*
octalnumber		[0-7]([_]?[0-7])*
binarynumber	[01]([_]?[01])*
id				[a-zA-Z_$][a-zA-Z0-9_$]*

%x dstring
%x sstring
%x esc
%x comment

%s anonfunc
%s block

%%

"//".*						/* Ignore comments */
"/*"						{yy.commentDepth++; this.begin("comment");}
<comment>.*?("/*")			{yy.commentDepth++;}
<comment>.*?("*/")			{yy.commentDepth--; if(yy.commentDepth === 0) {this.popState();}}
<comment>.*?{newline}		/* Ignore comments */

{newline}+					return "NEWLINE";
{space}+					/* Ignore whitespace */

\"							{this.begin("dstring"); string = "";}
<dstring>\"					{this.popState(); yytext = string; return "STRING";}
<dstring>\\					{this.begin("esc");}
<dstring>[^"\\]*			{string += yytext;}

\'							{this.begin("sstring"); string = "";}
<sstring>\'					{this.popState(); yytext = string; return "STRING";}
<sstring>\\					{this.begin("esc");}
<sstring>[^'\\]*			{string += yytext;}

<esc>[n]					{string += "\n"; this.popState();}	/* There has to be a better way to do this... */
<esc>[r]					{string += "\r"; this.popState();}
<esc>[t]					{string += "\t"; this.popState();}
<esc>[0]					{string += "\0"; this.popState();}
<esc>[']					{string += "\'"; this.popState();}
<esc>["]					{string += "\""; this.popState();}
<esc>[\\]					{string += "\\"; this.popState();}

"0x"{hexnumber}\b			return "HEXNUMBER";
"0o"{octalnumber}\b			return "OCTALNUMBER";
"0b"{binarynumber}\b		return "BINARYNUMBER";
{number}\b					return "NUMBER";

"/"(\\\/|[^\n\r])+"/"[a-z]*		return "REGEX";

"{{"						{this.begin("anonfunc"); return "LEXEC";}
"{"							{this.begin("block");	 return "LBRACKET";}
<block>"}"					{this.popState();		 return "RBRACKET";}
<anonfunc>"}}"				{this.popState();		 return "REXEC";}
"..."						return "RANGEINC";
".."						return "RANGE";

"+="						return "PLUSASSIGN";
"-="						return "MINUSASSIGN";
"*="						return "MULTIPLYASSIGN";
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
"/#"						return "DIVIDEINT";
"/"							return "DIVIDE";
"-"							return "MINUS";
"+"							return "PLUS";
"%"							return "MODULUS";
"="							return "ASSIGN";
"|"							return "BITOR";
"&"							return "BITAND";
"^"							return "BITXOR";

"["							return "LSQUARE";
"]"							return "RSQUARE";
"("							return "LPAREN";
")"							return "RPAREN";
"."							return "DOT";
","							return "COMMA";
":"							return "COLON";
"?"							return "TERNARY";
"@"|"#"						return "ARGMARK";

"true"						return "TRUE";
"false"						return "FALSE";
"null"						return "NULL";
"undefined"					return "UNDEFINED";

("function"|"func"|"fun")\b	return "FUNCTION";
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
"with"						return "WITH";
"return"					return "RETURN";
"break"						return "BREAK";
"continue"					return "CONTINUE";
"print"						return "PRINT";
"error"						return "ERROR";
"this"						return "THIS";
"new"						return "NEW";
"instanceof"				return "INSTANCEOF";
"typeof"					return "TYPEOF";
"throw"						return "THROW";
("try"|"protect"|"guard")\b	return "TRY";
("catch"|"except")\b		return "CATCH";
"always"					return "FINALLY";
"delete"					return "DELETE";
"del"						return "DELETE";

{id}						return "IDENTIFIER";

<<EOF>>						return "EOF";
.							return "INVALID";
