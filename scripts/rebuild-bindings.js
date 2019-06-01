const path = require('path')
const { spawn } = require('./_commons.js')
const opts = {
  cwd: path.resolve(__dirname, '../'),
  stdio: 'inherit'
}

if (process.platform === 'win32') {
  spawn('node-gyp.cmd', [ 'rebuild', '--debug' ], opts)
} else {
  spawn('node-gyp', [ 'rebuild' ], opts)
}
