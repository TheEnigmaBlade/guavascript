newline			[\n\r]
number			([0-9]+(\.[0-9]+)?)|(\.[0-9]+)
id				[a-zA-Z_$][a-zA-Z0-9_$]*

%%

"//".*						/* Ignore comments */
"#".*						/* Ignore comments */
"/*"(.|{newline})*?"*/"		/* Ignore multiline comment */
{newline}+					return "NEWLINE"
\s+							/* Ignore whitespace */

"{{"						return "LEXEC"
"}}"						return "REXEC"
".."						return "RANGE"

"+="						return "PLUSASSIGN"
"-="						return "MINUSASSIGN"
"*="						return "MULTIPLAYASSIGN"
"/="						return "DIVIDEASSIGN"
"=="						return "EQUALS"
"!="						return "NOTEQUALS"
">="						return "GTE"
"<="						return "LTE"
">"							return "GT"
"<"							return "LT"
"and"						return "AND"
"or"						return "OR"
"not"						return "NOT"

"*"							return "MULTIPLY"
"/"							return "DIVIDE"
"-"							return "MINUS"
"+"							return "PLUS"
"="							return "ASSIGN"
"|"							return "BITOR"
"&"							return "BITAND"

"{"							return "LBRACKET"
"}"							return "RBRACKET"
"["							return "LSQUARE"
"]"							return "RSQUARE"
"("							return "LPAREN"
")"							return "RPAREN"
"."							return "DOT"
","							return "COMMA"
":"							return "COLON"
"?"							return "TERNARY"

"true"						return "TRUE"
"false"						return "FALSE"
"null"						return "NULL"
"undefined"					return "UNDEFINED"

"function"					return "FUNCTION"
"func"						return "FUNCTION"
"fun"						return "FUNCTION"
"var"						return "VARIABLE"
"let"						return "VARIABLE"
"if"						return "IF"
"else"						return "ELSE"
"loop"						return "LOOP"
"while"						return "WHILE"
"for"						return "FOR"
"in"						return "IN"
"step"						return "STEP"
"by"						return "STEP"
"return"					return "RETURN"
"break"						return "BREAK"
"continue"					return "CONTINUE"
"print"						return "PRINT"
"error"						return "ERROR"

{id}						return "IDENTIFIER"
{number}\b					return "NUMBER"
\"[^\"]*\"|\'[^\']*\'		yytext = yytext.substr(1, yyleng-2); return 'STRING';

<<EOF>>						return "EOF"
.							return "INVALID"
