const path = require('path')
const spawnSync = require('child_process').spawnSync

const verbose = isVerbose()

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



function spawn (cmd, args, opts) {
  log(`>> ${cmd}`)
  const result = spawnSync(cmd, args, opts)
  if (result.status === null) {
    console.error(`Could not find ${cmd}`)
    process.exit(1)
  } else if (result.status !== 0) {
    console.error(`${cmd} failed with code ${result.status}`)
    process.exit(1)
  }
}

function log (...args) {
  if (verbose) console.log(...args)
}

function isVerbose () {
  const loglevel = process.env.npm_config_loglevel
  return loglevel === 'verbose' || process.env.CI === 'true'
}
