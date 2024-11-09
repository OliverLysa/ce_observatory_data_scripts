import getStdin from 'get-stdin'
import B from 'bufx'

// Print an ANTLR 4 parse tree from stdin.
getStdin().then(tree => {
  let indent = -1
  for (const c of tree) {
    if (c == '(') {
      printBuf()
      indent++
    }
    B.emit(c)
    if (c == ')') {
      printBuf()
      indent--
    }
  }
  function printBuf() {
    let line = B.getBuf().trim()
    if (line) {
      B.print(`${'  '.repeat(indent)}${line}`)
      B.clearBuf()
    }
  }
})
