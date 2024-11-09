grammar Expr;

expr:   Id '(' exprList? ')'              # Call
    |   Id ('[' subscriptList ']')? '(' expr ')' # LookupCall
    |   ':NOT:' expr                      # Not
    |   '-' expr                          # Negative
    |   '+' expr                          # Positive
    |   expr '^' expr                     # Power
    |   expr op=('*'|'/') expr            # MulDiv
    |   expr op=('+'|'-') expr            # AddSub
    |   expr op=('<'|'>'|'<='|'>=') expr  # Relational
    |   expr op=('='|'<>') expr           # Equality
    |   expr ':AND:' expr                 # And
    |   expr ':OR:' expr                  # Or
    |   Id ('[' subscriptList ']')?       # Var
    |   Const                             # Const
    |   Keyword                           # Keyword
    |   lookup                            # LookupArg
    |   '(' expr ')'                      # Parens
    ;

exprList : expr (',' expr)* ;
subscriptList : Id (',' Id)* ;
lookup : '(' lookupRange? lookupPointList ')' ;
lookupRange : '[' lookupPoint '-' lookupPoint ']' ',' ;
lookupPointList : lookupPoint (',' lookupPoint)* ;
lookupPoint : '(' expr ',' expr ')' ;
constList : ( expr ( ',' expr )+ | ( expr ( ',' expr )+ ';' )+ ) ;

Star : '*' ;
Div : '/' ;
Plus : '+' ;
Minus : '-' ;
Less : '<' ;
LessEqual : '<=' ;
Greater : '>' ;
GreaterEqual : '>=' ;
Equal : '=' ;
TwoEqual : '==' ;
NotEqual : '<>' ;
Exclamation : '!' ;

Id : ( ( IdHead IdChar* ) | ( IdHead ( IdChar | ' ' )* IdChar ) | StringLiteral ) ( Whitespace* Exclamation )? ;

// IdHead includes characters that can appear at the beginning of an identifier.
// This includes the underscore character, the basic Latin ranges [A-Z] and [a-z],
// and other Unicode ranges that are valid for an identifier in non-Latin languages
// (e.g., Chinese, Cyrillic, and many others).  This set is based on a similar
// definition from the Swift 5 grammar:
//   https://github.com/antlr/grammars-v4/blob/cc1e848/swift/swift5/Swift5Lexer.g4#L160
fragment
IdHead
    : [a-zA-Z]
    | '_'
    | '\u00A8'
    | '\u00AA'
    | '\u00AD'
    | '\u00AF'
    | [\u00B2-\u00B5]
    | [\u00B7-\u00BA]
    | [\u00BC-\u00BE]
    | [\u00C0-\u00D6]
    | [\u00D8-\u00F6]
    | [\u00F8-\u00FF]
    | [\u0100-\u02FF]
    | [\u0370-\u167F]
    | [\u1681-\u180D]
    | [\u180F-\u1DBF]
    | [\u1E00-\u1FFF]
    | [\u200B-\u200D]
    | [\u202A-\u202E]
    | [\u203F-\u2040]
    | '\u2054'
    | [\u2060-\u206F]
    | [\u2070-\u20CF]
    | [\u2100-\u218F]
    | [\u2460-\u24FF]
    | [\u2776-\u2793]
    | [\u2C00-\u2DFF]
    | [\u2E80-\u2FFF]
    | [\u3004-\u3007]
    | [\u3021-\u302F]
    | [\u3031-\u303F]
    | [\u3040-\uD7FF]
    | [\uF900-\uFD3D]
    | [\uFD40-\uFDCF]
    | [\uFDF0-\uFE1F]
    | [\uFE30-\uFE44]
    | [\uFE47-\uFFFD]
    | [\u{10000}-\u{1FFFD}]
    | [\u{20000}-\u{2FFFD}]
    | [\u{30000}-\u{3FFFD}]
    | [\u{40000}-\u{4FFFD}]
    | [\u{50000}-\u{5FFFD}]
    | [\u{60000}-\u{6FFFD}]
    | [\u{70000}-\u{7FFFD}]
    | [\u{80000}-\u{8FFFD}]
    | [\u{90000}-\u{9FFFD}]
    | [\u{A0000}-\u{AFFFD}]
    | [\u{B0000}-\u{BFFFD}]
    | [\u{C0000}-\u{CFFFD}]
    | [\u{D0000}-\u{DFFFD}]
    | [\u{E0000}-\u{EFFFD}]
    ;

// IdChar includes all characters that can appear after the first character in
// an identifier.  This includes all characters from the IdHead definition plus
// digits [0-9] and a few other symbols that are allowed in identifiers.
fragment
IdChar
    : [0-9]
    | [$'&%]
    | IdHead
    ;

fragment
Digit
    :   [0-9]
    ;

Const
    :   IntegerConst
    |   FloatingConst
    |   StringConst
    ;

fragment
IntegerConst
    :   Digit+
    ;

fragment
NonzeroDigit
    :   [1-9]
    ;

fragment
FloatingConst
    :   FractionalConstant ExponentPart?
    |   DigitSeq ExponentPart
    ;

fragment
FractionalConstant
    :   DigitSeq? '.' DigitSeq
    |   DigitSeq '.'
    ;

fragment
ExponentPart
    :   'e' Sign? DigitSeq
    |   'E' Sign? DigitSeq
    ;

fragment
Sign
    :   '+' | '-'
    ;

fragment
DigitSeq
    :   Digit+
    ;

StringLiteral
    :   '"' SCharSequence? '"'
    ;

StringConst
    :   '\'' SCharSequence? '\''
    ;

fragment
SCharSequence
    :   SChar+
    ;

fragment
SChar
    :   ~['"\\\r\n]
    ;

Keyword
    :   ':NA:'
    ;

Whitespace : [ \t\n\r]+ -> skip ;
