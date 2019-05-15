const path = require('path')
// const rimraf = require('rimraf')
// const mkdirp = require('mkdirp')
// const { verbose, log, spawn } = require('./_commons.js')
const { verbose, spawn } = require('./_commons.js')

const coreDir = path.resolve(__dirname, '../deltachat-core-rust')

// log(`>> Removing ${coreBuildDir}`)
// rimraf.sync(coreBuildDir)

// log(`>> Creating ${coreBuildDir}`)
// mkdirp.sync(coreBuildDir)

// const mesonOpts = { cwd: coreBuildDir }

// let mesonArgs = [
//   '-Drpgp=true'
// ]

// if (verbose) mesonOpts.stdio = 'inherit'
// spawn('meson', mesonArgs, mesonOpts)

// spawn('ninja', verbose ? [ '-v' ] : [], {
//   cwd: coreBuildDir,
//   stdio: 'inherit'
// })

let cargoArgs = [
  'build',
  '--release',
  '-p',
  'deltachat_ffi'
]

if (verbose) cargoArgs.push('-v')

spawn('cargo', cargoArgs, {
  cwd: coreDir,
  stdio: 'inherit'
})
