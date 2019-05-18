const path = require('path')
const { spawn } = require('./_commons.js')
const coreDir = path.resolve(__dirname, '../deltachat-core-rust')

spawn('cargo', [ 'update' ], {
  cwd: coreDir,
  stdio: 'inherit'
})

spawn('cargo', [
  'build',
  '--release',
  '--features',
  'vendored',
  '-p',
  'deltachat_ffi'
], {
  cwd: coreDir,
  stdio: 'inherit'
})
