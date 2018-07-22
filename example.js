const binding = require('.')


let dc_context = binding.dcn_context_new()
console.log('result of dcn_context_new', dc_context)

let result
result = binding.dcn_set_event_handler(dc_context, event => {
  console.log('this is really js event int', event)
})
console.log('result from set_event_handler:', result)

result = binding.dcn_start_threads(dc_context)
console.log('result from start_threads:', result)
