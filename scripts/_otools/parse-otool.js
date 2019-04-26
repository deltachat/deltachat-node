const { execSync } = require('child_process')

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
    parsed.libs.push(parseOtoolLibLine(outputSplitted[i]))
  }
  return parsed
}

function parseOtoolLibLine(libLine) {
  return libLine.match(/\t(.*)\s\((.*) (.*)\)/)[1]
}

function otool(file) {
  let cmd = execSync(`otool -L ${file}`)
  console.log(cmd)
}

//console.log(parseOtool(str))

otool('./deltachat.node')
