const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { verbose, log, spawn } = require('./_commons.js')

const coreBuildDir = path.resolve(__dirname, '../deltachat-core/builddir')
log(`>> Removing ${coreBuildDir}`)
rimraf.sync(coreBuildDir)

log(`>> Creating ${coreBuildDir}`)
mkdirp.sync(coreBuildDir)

const mesonOpts = { cwd: coreBuildDir }

let mesonArgs
if (process.platform === 'darwin') {
  mesonArgs = [
    '--default-library=static',
    '-Drpgp=true'
  ]
} else {
  mesonArgs = [
    '--default-library=static',
    '-Dforce-etpan-fallback=true'
  ]
}

if (verbose) mesonOpts.stdio = 'inherit'
spawn('meson', mesonArgs, mesonOpts)

spawn('ninja', verbose ? [ '-v' ] : [], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})
