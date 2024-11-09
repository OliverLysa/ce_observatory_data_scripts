# antlr4-vensim Vensim grammar in ANTLR 4

## Using the parser

Install Node 14 or later. ANTLR 4 now requires Node 14+ for ES module support.

Install the package with npm in your project.

```
npm install antlr4-vensim
```

Import the lexer, parser, and/or visitor.

```
import { ModelLexer, ModelParser, ModelVisitor } from 'antlr4-vensim'
```

Refer to the [ANTLR 4 JavaScript](https://github.com/antlr/antlr4/blob/master/doc/javascript-target.md) runtime documentation for further details about using the parser.

## Installing tools

The grammar development tools in this package require macOS. They are not required to use the parser.

Vensim grammar development uses the [ANTLR 4](http://www.antlr.org/) parser generator.

Install Node 14 or later. ANTLR 4 now requires Node 14+ for ES module support.

Install the latest [Java SE JDK](https://www.oracle.com/java/technologies/javase-downloads.html). We are only using Java for development purposes, which is [covered](https://www.oracle.com/technetwork/java/javase/overview/oracle-jdk-faqs.html) by the license for Java SE.

Install ANTLR 4 Java tools version 4.12.0.

```
cd /usr/local/lib
sudo curl -O https://www.antlr.org/download/antlr-4.12.0-complete.jar
```

Set up ANTLR 4 in `.bash_profile`.

```
export CLASSPATH=".:/usr/local/lib/antlr-4.12.0-complete.jar:$CLASSPATH"
```

## Developing the parser

Build the parser after modifying the grammar.

```
pnpm i
pnpm build
```

The build process generates a Vensim parser in JavaScript in the `parser` directory.

```
ModelLexer.js
ModelParser.js
ModelVisitor.js
```

## Command line utility

The `a4` script generates and runs a lexer and parser in Java. It is useful in development when you are trying to understand how the lexer is tokenizing your model and what parse tree the parser is generating.

### generate

```
./a4 generate
```

Generate the parser in Java (not JavaScript) in the `java` directory.

### lex

```
./a4 lex <mdl-file-pathname>
```

Run the lexer on the .mdl file to print the token stream. The generate command must be run first.

### tree

```
./a4 tree <mdl-file-pathname>
```

Run the parser on the .mdl file to print the parse tree. The generate command must be run first.

### clean

```
./a4 clean
```

Clean out the generated parser files in the `java` directory.

### tokens

```
./a4 tokens
```

Print the lexer token list.
