const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const spawnSync = require('child_process').spawnSync

const verbose = process.env.npm_config_loglevel === 'verbose'
const debug = process.env.npm_config_debug === 'true'

const coreBuildDir = path.resolve(__dirname, '../deltachat-core/builddir')
log(`>> Removing ${coreBuildDir}`)
rimraf.sync(coreBuildDir)

log(`>> Creating ${coreBuildDir}`)
mkdirp.sync(coreBuildDir)

log('>> meson')
const mesonOpts = { cwd: coreBuildDir }
if (verbose) mesonOpts.stdio = 'inherit'
spawn('meson', [
  '--default-library=static',
  '--wrap-mode=forcefallback'
], mesonOpts)

log('>> ninja')
spawn('ninja', verbose ? [ '-v' ] : [], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})

const buildDir = path.resolve(__dirname, '../build')
log(`>> Removing ${buildDir}`)
rimraf.sync(buildDir)

log('>> Rebuilding bindings')
const gypArgs = [ 'rebuild' ]
if (debug) gypArgs.push('--debug')
if (verbose) gypArgs.push('--verbose')
spawn('node-gyp', gypArgs, {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
})

function spawn (cmd, args, opts) {
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
