/* eslint-disable camelcase */

const binding = require('.')
const minimist = require('minimist')

var argv = minimist(process.argv.slice(2))

if (!argv.email || !argv.password) {
  console.error('--email and --password required')
  process.exit(1)
}
console.log('Logging in with', argv.email, argv.password)

let dcn_context = binding.dcn_context_new()
console.log('result of dcn_context_new', dcn_context)

let res

res = binding.dcn_set_event_handler(dcn_context, (event, data1, data2) => {
  console.log('> event', event, 'data1', data1, 'data2', data2)
})

res = binding.dcn_open(dcn_context, './test.sqlite', './blobdir')
console.log('result from open:', res)

res = binding.dcn_set_config(dcn_context, 'addr', argv.email)
console.log('result from set_event_handler:', res)
res = binding.dcn_get_config(dcn_context, 'addr', 'no')
console.log('result from dcn_get_config addr:', res)

res = binding.dcn_get_config(dcn_context, 'notexists', 'DEFAULT')
console.log('result from dcn_get_config for notexist:', res)

res = binding.dcn_set_config(dcn_context, 'mail_pw', argv.password)
console.log('result from set_event_handler:', res)

res = binding.dcn_set_config_int(dcn_context, 'anumber', 314)
console.log('result from dcn_set_config_int:', res)
res = binding.dcn_get_config_int(dcn_context, 'anumber', 1)
console.log('result from dcn_get_config_int anumber:', res)
res = binding.dcn_get_config_int(dcn_context, 'anumber2', 444)
console.log('result from dcn_get_config_int anumber2:', res)

res = binding.dcn_is_configured(dcn_context)
console.log('result from is_configured:', res)

res = binding.dcn_configure(dcn_context)
console.log('result from configure:', res)

res = binding.dcn_is_configured(dcn_context)
console.log('result from is_configured:', res)

res = binding.dcn_start_threads(dcn_context)
console.log('result from start_threads:', res)

setTimeout(function () {
  res = binding.dcn_get_info(dcn_context)
  console.log('\n\n\n>>>>>>> BEGIN INFO')
  console.log(res)
  console.log('<<<<<<< END INFO\n\n\n')
  setTimeout(function () {
    console.log('Stopping threads ...')
    binding.dcn_stop_threads(dcn_context)
    console.log('Done.')
  }, 2000)
}, 5000)
