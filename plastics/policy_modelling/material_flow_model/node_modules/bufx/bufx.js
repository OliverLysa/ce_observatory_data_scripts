const fs = require('fs')
const R = require('ramda')
const yaml = require('js-yaml')
const prettier = require('prettier')
const stripBom = require('strip-bom')

// Numeric value of a string or number
let num = x => (typeof x === 'number' ? x : Number.parseFloat(x))
// String sort comparison function
let acmp = R.comparator((a, b) => a < b)
// Numeric string sort comparison function
let ncmp = R.comparator((a, b) => num(a) < num(b))
// alphanumeric sort
let sorta = R.sort(acmp)
// numeric sort
let sortn = R.sort(ncmp)
// sort -u equivalent
let sortu = a => R.sort(acmp, R.uniq(a))
// Print an array
let printa = a => R.forEach(x => print(x), a)
// Print a sorted, unique array
let printu = a => printa(sortu(a))
// Split a string into lines that may have Windows, Unix, or old Mac line endings.
let lines = s => s.split(/\r\n|\n|\r/)
// Print a string to the console
let print = s => {
  console.log(s)
}
// Print a string to the console
let pr = print
// Read a UTF-8 file into a string. Strip the BOM if present.
let read = pathname => stripBom(fs.readFileSync(pathname, 'utf8'))
// Write a string to a UTF-8 file
let write = (s, pathname) => {
  fs.writeFileSync(pathname, s, { encoding: 'utf8' })
}
// Print an array or object as JSON
let printJson = o => {
  print(JSON.stringify(o))
}
// Write an array or object as JSON to a file
let writeJson = (o, pathname) => {
  write(JSON.stringify(o), pathname)
}
// Print an array or object as YAML
let printYaml = o => {
  print(yaml.dump(o))
}
// Parse a YAMl string into an object.
let loadYaml = s => {
  return yaml.load(s)
}
// Read a YAML file into an array or object.
let readYaml = pathname => {
  let s = read(pathname)
  return loadYaml(s)
}
// Write an array or object as YAML to a file
let writeYaml = (o, pathname) => {
  write(yaml.dump(o), pathname)
}

// Output buffer
let bufs = { _: '' }
// Open a buffer for writing
let open = channel => (bufs[channel] = '')
// Emit a string to a buffer
let emit = (a, channel = null) => {
  channel = channel || '_'
  bufs[channel] += a
}
// Emit a string to a buffer terminated by a newline
let emitLine = (a, channel = null) => {
  channel = channel || '_'
  bufs[channel] += a + '\n'
}
// Emit an object to a buffer as compact JSON
let emitJson = (o, channel = null) => {
  channel = channel || '_'
  bufs[channel] += JSON.stringify(o)
}
// Emit an object to a buffer as formatted JSON
let emitPrettyJson = (o, channel = null) => {
  let json = JSON.stringify(o)
  channel = channel || '_'
  bufs[channel] += prettier.format(json, { parser: 'json' })
}
// Emit a JavaScript string to a buffer with formatting
let emitJs = (js, opts = null) => {
  let options = opts || { semi: false, singleQuote: true, parser: 'babel' }
  let s = prettier.format(js, options)
  emit(s)
}
// Emit an object to a buffer as YAML
let emitYaml = (o, channel = null) => {
  channel = channel || '_'
  bufs[channel] += yaml.dump(o)
}
// Print a buffer to the console
let printBuf = (channel = null) => {
  channel = channel || '_'
  print(bufs[channel])
}
// Write a buffer to a file
let writeBuf = (pathname, channel = null) => {
  channel = channel || '_'
  write(bufs[channel], pathname)
}
// Get buffer contents as a string
let getBuf = (channel = null) => {
  channel = channel || '_'
  return bufs[channel]
}
// Clear a buffer
let clearBuf = (channel = null) => {
  channel = channel || '_'
  bufs[channel] = ''
}

module.exports = {
  clearBuf,
  emit,
  emitJs,
  emitJson,
  emitLine,
  emitPrettyJson,
  emitYaml,
  getBuf,
  lines,
  loadYaml,
  num,
  open,
  pr,
  print,
  printa,
  printBuf,
  printJson,
  printYaml,
  printu,
  read,
  readYaml,
  sorta,
  sortn,
  sortu,
  write,
  writeBuf,
  writeJson,
  writeYaml
}
