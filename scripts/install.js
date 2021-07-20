const {exec} = require('child_process');

if (process.env.USE_SYSTEM_LIBDELTACHAT === 'true') {
  console.log('[i] USE_SYSTEM_LIBDELTACHAT is true, using pkg-config to retrieve lib paths and cflags')
  exec('npm run install:system')	
} else {
  exec('npm run install:vendored')	
}
