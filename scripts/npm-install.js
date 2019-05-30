const path = require('path')
const { spawn } = require('./_commons.js')
const opts = {
  cwd: path.resolve(__dirname, '../'),
  env: process.env,
  stdio: 'inherit'
}

if (process.env.npm_config_dc_system_lib === 'true') {
  spawn('npx', [ 'node-gyp', 'rebuild', '--', '-Dsystem_dc_core=true' ], opts)
} else {
  spawn('npm', [ 'run', 'rebuild-all' ], opts)
}
