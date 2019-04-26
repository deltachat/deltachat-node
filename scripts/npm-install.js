const path = require('path')
const { spawn } = require('./_commons.js')

if (process.env.npm_config_dc_system_lib === 'true') {
  spawn('npx', [ 'node-gyp', 'rebuild', '--', '-Dsystem_dc_core=true' ], {
    cwd: path.resolve(__dirname, '../'),
    stdio: 'inherit'
  })
} else {
  spawn('npm', [ 'run', 'rebuild-all' ], {
    cwd: path.resolve(__dirname, '../'),
    stdio: 'inherit'
  })
}
