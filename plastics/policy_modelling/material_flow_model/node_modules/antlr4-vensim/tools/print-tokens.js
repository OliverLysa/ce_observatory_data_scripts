import getStdin from 'get-stdin'
import { pr, lines } from 'bufx'

// Print an ANTLR 4 lex listing from stdin.
let readToken = token => {
  let result = ''
  let re = /\[@(\d+),(\d+):(\d+)='(.+)',(<[^>]+>),(\d+):(\d+)\]/
  let m = token.match(re)
  if (m) {
    let seq = m[1]
    let iStart = m[2]
    let iEnd = m[3]
    let str = m[4]
    let tok = m[5]
    let line = m[6]
    let col = m[7]
    result = `${tok}\t${str}\tline ${line}\tcol ${col}`
  }
  return result
}
getStdin().then(data => {
  for (let line of lines(data)) {
    pr(readToken(line))
  }
})
