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
spawnSync('meson', [
  '--default-library=static',
  '--wrap-mode=forcefallback'
], mesonOpts)

log('>> ninja')
spawnSync('ninja', verbose ? [ '-v' ] : [], {
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
spawnSync('node-gyp', gypArgs, {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
})

function log (...args) {
  if (verbose) console.log(...args)
}
