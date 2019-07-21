const path = require('path')
const { spawn } = require('./common')
const opts = {
  cwd: path.resolve(__dirname, '../'),
  stdio: 'inherit'
}

if (process.env.npm_config_dc_system_lib === 'true') {
  spawn('npx', ['node-gyp', 'rebuild', '--', '-Dsystem_dc_core=true'], opts)
} else {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  spawn(npm, ['run', 'node-gyp-build'], opts)
}
