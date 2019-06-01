const path = require('path')
const { spawn } = require('./_commons.js')
const opts = {
  cwd: path.resolve(__dirname, '../deltachat-core-rust'),
  stdio: 'inherit'
}

spawn('cargo', [ 'update' ], opts)

const buildArgs = [
  'build',
  '--features',
  'vendored',
  '-p',
  'deltachat_ffi'
]

if (process.platform !== 'win32') {
  buildArgs.push('--release')
}

spawn('cargo', buildArgs, opts)
