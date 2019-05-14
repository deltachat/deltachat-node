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

let mesonArgs = [
]

if (process.env.RPGP === 'false') {
  console.log('[i] Disbaling RPGP, falling back to netpgp')
} else {
  mesonArgs.push('-Drpgp=true')
}

if (verbose) mesonOpts.stdio = 'inherit'
spawn('meson', mesonArgs, mesonOpts)

spawn('ninja', verbose ? [ '-v' ] : [], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})
