The bufx library contains various utility functions that read and write line-oriented string buffers. These functions are particularly useful for emitting output a bit at a time, and then writing them or printing them to the console. JSON, YAML, and JavaScript are supported. You can split your output into multiple channels going to separate buffers, or work with one default buffer. Please refer to the `bufx.js` source file for details about function arguments.

| Function name  | What it does                                                          |
|----------------|:----------------------------------------------------------------------|
| clearBuf       | Clear a buffer                                                        |
| emit           | Emit a string to a buffer                                             |
| emitJs         | Emit a JavaScript string to a buffer with formatting                  |
| emitJson       | Emit an object to a buffer as compact JSON                            |
| emitLine       | Emit a string to a buffer terminated by a newline                     |
| emitPrettyJson | Emit an object to a buffer as formatted JSON                          |
| emitYaml       | Emit an object to a buffer as YAML                                    |
| getBuf         | Get buffer contents as a string                                       |
| lines          | Split a string into lines that may have Windows or Unix line endings  |
| loadYaml       | Parse a YAML string into an object                                    |
| num            | Numeric value of a string or number                                   |
| open           | Open a buffer for writing                                             |
| pr             | Print a string to the console                                         |
| print          | Print a string to the console                                         |
| printa         | Print an array                                                        |
| printBuf       | Print a buffer to the console                                         |
| printJson      | Print an array or object as JSON                                      |
| printYaml      | Print an array or object as YAML                                      |
| printu         | Print a sorted, unique array                                          |
| read           | Read a UTF-8 file into a string                                       |
| readYaml       | Read an array or object from a YAML file                              |
| sorta          | alphanumeric sort                                                     |
| sortn          | numeric sort                                                          |
| sortu          | sort -u equivalent                                                    |
| write          | Write a string to a UTF-8 file                                        |
| writeBuf       | Write a buffer to a file                                              |
| writeJson      | Write an array or object as JSON to a file                            |
| writeYaml      | Write an array or object as YAML to a file                            |

This example reads a JSON file and prints a formatted version to the console.
```
const B = require('bufx')
const pr = B.pr
let pathname = process.argv[2]
if (!pathname) {
  pr('usage: pretty-json js-file')
  process.exit()
}
let input = B.read(pathname)
let o = eval(input)
B.emitPrettyJson(o)
B.printBuf()
```
