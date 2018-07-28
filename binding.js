const binding = require('node-gyp-build')(__dirname)
const keys = Object.keys(binding).sort()

exports.dcn_context_new = binding.dcn_context_new

exports.dcn_context_t = {}
keys.filter(key => key.startsWith('dcn_context_t_')).forEach(key => {
  const method = key.replace('dcn_context_t_', '')
  exports.dcn_context_t[method] = binding[key]
})

exports.dc_chat_t = {}
keys.filter(key => key.startsWith('dc_chat_t_')).forEach(key => {
  const method = key.replace('dc_chat_t_', '')
  exports.dc_chat_t[method] = binding[key]
})

if (!module.parent) {
  console.log(exports)
}
