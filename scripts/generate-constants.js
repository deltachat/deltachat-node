#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const split = require('split2')

const rows = []
const regex = /^#define\s+(\w+)\s+(\w+)/i
const header = path.resolve(__dirname, '../deltachat-core/src/deltachat.h')

fs.createReadStream(header)
  .pipe(split())
  .on('data', line => {
    const match = regex.exec(line)
    if (match) {
      rows.push({ key: match[1], value: parseInt(match[2]) })
    }
  })
  .on('end', () => {
    const file = path.resolve(__dirname, '../constants.js')
    const data = rows.sort((lhs, rhs) => {
      if (lhs.key < rhs.key) return -1
      else if (lhs.key > rhs.key) return 1
      return 0
    }).map(row => {
      return `  ${row.key}: ${row.value}`
    }).join(',\n')
    fs.writeFileSync(file, `// Generated!\n\nmodule.exports = {\n${data}\n}\n`)
  })
