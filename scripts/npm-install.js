const path = require('path')
const { spawn } = require('./_commons.js')
const opts = {
  cwd: path.resolve(__dirname, '../'),
  stdio: 'inherit'
}

if (process.env.npm_config_dc_system_lib === 'true') {
  spawn('npx', [ 'node-gyp', 'rebuild', '--', '-Dsystem_dc_core=true' ], opts)
} else {
  const npmExec = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  spawn(npmExec, [ 'run', 'rebuild-all' ], opts)
}
