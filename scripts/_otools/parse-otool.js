const { execSync } = require('child_process')
const { basename } = require('path')
const fs = require('fs-extra')

const librariesToBundle = ['libsasl', 'libssl', 'libcrypto', 'libsqlite', 'libz']

function parseOtool(output) {
  outputSplitted = output.split('\n')
  parsed = {}
  parsed.libraryName = outputSplitted[0].substring(0, outputSplitted[0].length -1)
  parsed.libs = []
  for(let i = 1; i < outputSplitted.length; i++) {
    let path = outputSplitted[i].match(/\t(.*)\s\((.*) (.*)\)/)[1]
    parsed.libs.push({path, basename: path.basename(path)})
  }
  return parsed
}

function otool(file) {
  let cmd = execSync(`otool -L "${file}"`)
  return parseOtool(cmd.stdout)
}

function copyLibIfNotExists(lib) {
  if(fs.existsSync(`./${lib.basename}`)) return
  fs.copy(lib.path, '.')
}

function strContainsAny(str, any) {
  for(let a of any) {
    if (str.indexOf(a) !== -1) return true
  }
  return false
}
function installNameToolChange(file, oldLib, newLib) {
  let cmd = execSync(`install_name_tool -change "${oldLib}" "${newLib}" "${file}"`)
}

function patchBundleLibraries(libFile, librariesToPatch) {
  library = otool(libFile)
  for(let lib of library.libs) {
    if(!strContainsAny(lib.basename, librariesToBundle)) continue
    
    copyLibIfNotExists(lib)
    installNameToolChange(`./${libFile}`, lib.path, `@loader_path/${lib.basename}`)
    patchBundleLibraries(lib.basename, librariesToPatch) 
  }
}


//console.log(parseOtool(str))

otool('./deltachat.node')
