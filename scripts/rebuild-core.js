const path = require('path')
const { verbose, spawn } = require('./_commons.js')
const coreDir = path.resolve(__dirname, '../deltachat-core-rust')

const cargoArgs = [
  'build',
  '--release',
  '--features',
  'vendored',
  '-p',
  'deltachat_ffi'
]

if (verbose) cargoArgs.push('-v')

spawn('cargo', cargoArgs, {
  cwd: coreDir,
  stdio: 'inherit'
})
