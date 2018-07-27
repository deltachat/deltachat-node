const binding = require('node-gyp-build')(__dirname)
const keys = Object.keys(binding).sort().filter(key => {
  return key !== 'dcn_context_t_dc_context_new'
})

exports.dc_context_new = binding.dcn_context_t_dc_context_new

exports.dcn_context_t = {}
keys.forEach(key => {
  const method = key.replace('dcn_context_t_', '')
  exports.dcn_context_t[method] = binding[key]
})

if (!module.parent) {
  console.log(exports)
}
