const { execSync } = require('child_process')
const { basename } = require('path')
const fs = require('fs-extra')

const librariesToBundle = ['libsasl', 'libssl', 'libcrypto', 'libsqlite', 'libz']

var str = `deltachat.node:
	/System/Library/Frameworks/CoreFoundation.framework/Versions/A/CoreFoundation (compatibility version 150.0.0, current version 1349.93.0)
	/System/Library/Frameworks/CoreServices.framework/Versions/A/CoreServices (compatibility version 1.0.0, current version 775.20.0)
	/System/Library/Frameworks/Security.framework/Versions/A/Security (compatibility version 1.0.0, current version 57740.60.29)
	/usr/lib/libsasl2.2.dylib (compatibility version 3.0.0, current version 3.15.0)
	/usr/lib/libssl.0.9.8.dylib (compatibility version 0.9.8, current version 0.9.8)
	/usr/lib/libsqlite3.dylib (compatibility version 9.0.0, current version 254.8.0)
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1238.60.2)
	/usr/lib/libc++.1.dylib (compatibility version 1.0.0, current version 307.5.0)`

function parseOtool(output) {
  outputSplitted = output.split('\n')
  parsed = {}
  parsed.libraryName = outputSplitted[0].substring(0, outputSplitted[0].length -1)
  parsed.libs = []
  for(let i = 1; i < outputSplitted.length; i++) {
    let libPath = parseOtoolLibLine(outputSplitted[i])
    parsed.libs.push({libPath: libBasename: path.basename(libpath)})
  }
  return parsed
}

function parseOtoolLibLine(libLine) {
  return libLine.match(/\t(.*)\s\((.*) (.*)\)/)[1]
}

function otool(file) {
  let cmd = execSync(`otool -L "${file}"`)
  console.log(cmd)
}

function installNameToolChange(file, oldLib, newLib) {
  let cmd = execSync(`install_name_tool -change "${oldLib}" "${newLib}" "${file}"`)
}

function patchBundleLibraries(libFile, librariesToPatch) {
  library = otool(libFile)
  for(let lib of library.libs) {
    if(!strContainsAny(lib.libBasename, librariesToBundle)) continue
    
    copyLibIfNotExists(lib)
    installNameToolChange(`./${lib.libBasename}`, lib.libPath, `@loader_path/${lib.libBasename}`)
    patchBundleLibraries(lib.libBasename, librariesToPatch) 
  }
}

function copyLibIfNotExists(lib) {
  if(fs.existsSync(`./${lib.libBasename}`)) return
  fs.copy(lib.libPath, '.')
}

function strContainsAny(str, any) {
  for(let a of any) {
    if (str.indexOf(a) !== -1) return true
  }
  return false
}

//console.log(parseOtool(str))

otool('./deltachat.node')
