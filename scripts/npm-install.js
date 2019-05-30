const path = require('path')
const { spawn } = require('./_commons.js')
console.log('process.env', process.env)
console.log('process.env.PATH', process.env.PATH)
console.log('process.env.Path', process.env.Path)
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
