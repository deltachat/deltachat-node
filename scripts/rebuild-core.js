#!/usr/bin/env node

const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const spawnSync = require('child_process').spawnSync

const verbose = process.env.npm_config_loglevel === 'verbose'
const coreBuildDir = path.resolve(__dirname, '../deltachat-core/builddir')
log(`>> Removing ${coreBuildDir}`)
rimraf.sync(coreBuildDir)

log(`>> Creating ${coreBuildDir}`)
mkdirp.sync(coreBuildDir)

const mesonOpts = { cwd: coreBuildDir }
const mesonArgs = [
  '--default-library=static',
  '--wrap-mode=nofallback'
]
if (verbose) mesonOpts.stdio = 'inherit'
spawn('meson', mesonArgs, mesonOpts)

spawn('ninja', verbose ? [ '-v' ] : [], {
  cwd: coreBuildDir,
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
