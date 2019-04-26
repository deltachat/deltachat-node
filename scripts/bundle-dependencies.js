const { execSync } = require('child_process')
const { basename, dirname } = require('path')
const fs = require('fs-extra')

const librariesToBundle = ['libsasl', 'libssl', 'libcrypto', 'libsqlite', 'libz']

function parseOtool(output) {
  outputSplitted = output.split('\n')
  parsed = {}
  parsed.libraryName = outputSplitted[0].substring(0, outputSplitted[0].length -1)
  parsed.libs = []
  for(let i = 1; i < outputSplitted.length; i++) {
    let line = outputSplitted[i]
    if (line == "") continue
    let path = line.match(/\t(.*)\s\((.*) (.*)\)/)[1]
    parsed.libs.push({path, basename: basename(path)})
  }
  return parsed
}

function otool(file) {
  let cmd = execSync(`otool -L "${file}"`)
  //console.log('Otool output: ', cmd.toString())
  return parseOtool(cmd.toString())
}

function copyLibIfNotExists(lib) {
  if(fs.existsSync(`./${lib.basename}`)) {
    console.log(' - skipping copying ${lib.basename}')
    return
  }
  fs.copySync(lib.path, `./${lib.basename}`)
  console.log(' - copied ${lib.basename}')
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
  let cwdTo = dirname(libFile)
  process.chdir(cwdTo)
  console.log(`Changed directory to: ${cwdTo}`) 

  libFile = `./${basename(libFile)}`

  library = otool(libFile)
  console.log(`Bundling libraries for: ${libFile}`)
  for(let lib of library.libs) {
    if(libFile.indexOf(lib.basename) !== -1) continue
    if(!strContainsAny(lib.basename, librariesToBundle)) continue
    console.log(` - found library to bundle: ${lib.basename}`)
    copyLibIfNotExists(lib)
    installNameToolChange(`./${libFile}`, lib.path, `@loader_path/${lib.basename}`)
    patchBundleLibraries(lib.basename, librariesToPatch) 
  }
}

function main() {
  if(process.env.SKIP_BUNDLING_DEPENDENCIES === 'false') {
    console.log('Found environment variable SKIP_BUNDLING_DEPENDENCIES set to "false", skipping...')
    return
  }

  if (process.platform === 'darwin') {
    patchBundleLibraries('./build/Release/deltachat.node', librariesToBundle)
  } else {
    console.log('Bundling dependencies is currently only supported on Mac/Darwin')
  }
}

main()
