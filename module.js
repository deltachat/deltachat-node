const binding = require('node-gyp-build')(__dirname)
const context = binding.dc_context_new()

console.log('context', context)
console.log(binding.dc_set_event_handler_cb(context, event => {
  console.log('this is really js event int', event)
}))

console.log(binding.dc_perform_jobs_start(context))
