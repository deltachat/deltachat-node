const path = require('path')
const { spawn } = require('./_commons.js')
const opts = {
  cwd: path.resolve(__dirname, '../deltachat-core-rust'),
  stdio: 'inherit'
}

spawn('cargo', [ 'update' ], opts)

const buildArgs = [
  'build',
  '--release',
  '--features',
  'vendored',
  '-p',
  'deltachat_ffi'
]

spawn('cargo', buildArgs, opts)
