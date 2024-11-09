grammar Model;
import Expr;

// A Vensim model is a sequence of equations and subscript ranges.
model: ( subscriptRange | equation )+ ;

// A subscript range definition names subscripts in a dimension.
subscriptRange : ( ( Id ':' ( subscriptDefList | expr ) subscriptMappingList? ) | ( Id '<->' Id ) ) '|' ;
subscriptDefList : ( Id | subscriptSequence ) ( ',' ( Id | subscriptSequence ) )* ;
subscriptSequence : '(' Id '-' Id ')' ;
subscriptMappingList : '->' subscriptMapping ( ',' subscriptMapping )* ;
subscriptMapping : Id | '(' Id ':' subscriptList ')' ;

// An equation has a left-hand side and a right-hand side.
// The RHS is a formula expression, a constant list, or a Vensim lookup.
// The RHS is empty for data equations.
equation : lhs ( ( ':=' | '==' | '=' ) ( expr | constList ) | lookup )? '|' ;
lhs : Id ( '[' subscriptList ']' )? ':INTERPOLATE:'? ( ':EXCEPT:' '[' subscriptList ']' ( ',' '[' subscriptList ']' )* )? ;

// The lexer strips some tokens we are not interested in.
// The character encoding is given at the start of a Vensim file.
// The units and documentation sections and group markings are skipped for now.
// Line continuation characters and the sketch must be stripped by a preprocessor.
Encoding : '{' [A-Za-z0-9-]+ '}' -> skip ;
Group : '****' .*? '|' -> skip ;
UnitsDoc : '~' ~'|'* -> skip ;
