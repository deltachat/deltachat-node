#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const split = require('split2')

const data = []
const regex = /^#define\s+(\w+)\s+(\w+)/i
const header = path.resolve(__dirname, '../deltachat-core-rust/deltachat-ffi/deltachat.h')

fs.createReadStream(header)
  .pipe(split())
  .on('data', line => {
    const match = regex.exec(line)
    if (match) {
      data.push({ key: match[1], value: parseInt(match[2]) })
    }
  })
  .on('end', () => {
    const constants = data.sort((lhs, rhs) => {
      if (lhs.key < rhs.key) return -1
      else if (lhs.key > rhs.key) return 1
      return 0
    }).map(row => {
      return `  ${row.key}: ${row.value}`
    }).join(',\n')

    fs.writeFileSync(
      path.resolve(__dirname, '../constants.js'),
      `// Generated!\n\nmodule.exports = {\n${constants}\n}\n`
    )

    fs.writeFileSync(
      path.resolve(__dirname, '../constants.enum.ts'),
      `// Generated!\n\n export default enum C {\n${constants.replace(/:/g, '=')}\n}\n`
    )

    const events = data.sort((lhs, rhs) => {
      if (lhs.value < rhs.value) return -1
      else if (lhs.value > rhs.value) return 1
      return 0
    }).filter(i => {
      return i.key.startsWith('DC_EVENT_')
    }).map(i => {
      return `  ${i.value}: '${i.key}'`
    }).join(',\n')

    fs.writeFileSync(
      path.resolve(__dirname, '../events.js'),
      `// Generated!\n\nmodule.exports = {\n${events}\n}\n`
    )
  })
