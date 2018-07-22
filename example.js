const binding = require('.')


let dcn_context = binding.dcn_context_new()
console.log('result of dcn_context_new', dcn_context)

let result
result = binding.dcn_set_event_handler(dcn_context, (event, data1, data2) => {
  console.log('this is really js event int', event, data1, data2)
})
console.log('result from set_event_handler:', result)

result = binding.dcn_start_threads(dcn_context)
console.log('result from start_threads:', result)
