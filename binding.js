module.exports = require('node-gyp-build')(__dirname)

if (!module.parent) {
  console.log(module.exports)
}
