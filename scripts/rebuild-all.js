const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const spawnSync = require('child_process').spawnSync

const coreBuildDir = path.resolve(__dirname, '../deltachat-core/builddir')
console.log(`>> Removing ${coreBuildDir}`)
rimraf.sync(coreBuildDir)

console.log(`>> Creating ${coreBuildDir}`)
mkdirp.sync(coreBuildDir)

console.log('>> meson')
spawnSync('meson', [
  '--default-library=static',
  '--wrap-mode=forcefallback'
], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})

console.log('>> ninja')
spawnSync('ninja', [ '-v' ], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})

const buildDir = path.resolve(__dirname, '../build')
console.log(`>> Removing ${buildDir}`)
rimraf.sync(buildDir)

console.log('>> Rebuilding bindings')
spawnSync('npm', [ 'run', 'rebuild' ], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
})
