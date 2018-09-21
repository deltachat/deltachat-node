const path = require('path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const cp = require('child_process')

const coreBuildDir = path.resolve(__dirname, '../deltachat-core/builddir')
console.log(`>> Removing ${coreBuildDir}`)
rimraf.sync(coreBuildDir)

console.log(`>> Creating ${coreBuildDir}`)
mkdirp.sync(coreBuildDir)

console.log('>> meson')
cp.spawnSync('meson', [
  '--default-library=static',
  '--wrap-mode=forcefallback'
], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})

console.log('>> ninja')
cp.spawnSync('ninja', [ '-v' ], {
  cwd: coreBuildDir,
  stdio: 'inherit'
})

const buildDir = path.resolve(__dirname, '../build')
console.log(`>> Removing ${buildDir}`)
rimraf.sync(buildDir)

console.log('>> Rebuilding bindings')
cp.spawnSync('npm', [ 'run', 'rebuild' ], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
})
