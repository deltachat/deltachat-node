const {execSync} = require('child_process');
const isProduction = process.env.NODE_ENV && process.env.NODE_ENV === 'production'

const run = (cmd) => {
  console.log('[i] running `' + cmd '`'
  execSync(cmd)
}

// Fetch submodule if needed
if(!isProduction) {
  console.log('Retrieving deltachat-core-rust submodule')
  run('npm run submodule')
}

// Build bindings
if (process.env.USE_SYSTEM_LIBDELTACHAT === 'true') {
  console.log('[i] USE_SYSTEM_LIBDELTACHAT is true, rebuilding c bindings and using pkg-config to retrieve lib paths and cflags of libdeltachat')
  run('npm run build:bindings:c:c)	
} else if(!isProduction) {
  console.log('[i] Building rust core & bindings')
  run('npm run build')
}
