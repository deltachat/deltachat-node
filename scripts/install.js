const {execSync} = require('child_process');

if (process.env.USE_SYSTEM_LIBDELTACHAT === 'true') {
  console.log('[i] USE_SYSTEM_LIBDELTACHAT is true, using pkg-config to retrieve lib paths and cflags')
  execSync('npm run install:system')	
} else {
  execSync('npm run install:vendored')	
}
