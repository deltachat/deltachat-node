const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const spawnSync = require('child_process').spawnSync

const verbose = isVerbose()
const coreBuildDir = path.resolve(__dirname, '../deltachat-core/builddir')
log(`>> Removing ${coreBuildDir}`)
rimraf.sync(coreBuildDir)

log(`>> Creating ${coreBuildDir}`)
mkdirp.sync(coreBuildDir)

const mesonOpts = { cwd: coreBuildDir }

let mesonArgs = [
    // '-Drpgp=true'
]

if (verbose) mesonOpts.stdio = 'inherit'
spawn('meson', mesonArgs, mesonOpts)

spawn('ninja', verbose ? [ '-v' ] : [], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})

spawn('npx', [ 'node-gyp', 'rebuild' ], {
  cwd: path.resolve(__dirname, '../'),
  stdio: 'inherit'
})

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
