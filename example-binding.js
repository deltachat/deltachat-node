/* eslint-disable camelcase */

const binding = require('./binding')
const minimist = require('minimist')

var argv = minimist(process.argv.slice(2))

if (!argv.email || !argv.password) {
  console.error('--email and --password required')
  process.exit(1)
}
console.log('Logging in with', argv.email, argv.password)

let dcn_context = binding.dcn_context_new()
console.log('result from dcn_context_new:', dcn_context)

let b = binding.dcn_context_t
let res

res = b.dc_set_event_handler(dcn_context, (event, data1, data2) => {
  console.log('> event', event, 'data1', data1, 'data2', data2)
})

res = b.dc_open(dcn_context, './test.sqlite', './blobdir')
console.log('result from dc_open:', res)

res = b.dc_get_config(dcn_context, 'notexists', 'DEFAULT')
console.log('result from dc_get_config for notexist:', res)

res = b.dc_set_config_int(dcn_context, 'anumber', 314)
console.log('result from dc_set_config_int:', res)
res = b.dc_get_config_int(dcn_context, 'anumber', 1)
console.log('result from dc_get_config_int anumber:', res)
res = b.dc_get_config_int(dcn_context, 'anumber2', 444)
console.log('result from dc_get_config_int anumber2:', res)

if (b.dc_is_configured(dcn_context)) {
  console.log('IS configured. Skipping!')
} else {
  console.log('NOT configured so configuring')
  res = b.dc_set_config(dcn_context, 'addr', argv.email)
  res = b.dc_set_config(dcn_context, 'mail_pw', argv.password)

  res = b.dc_configure(dcn_context)
  res = b.dc_is_configured(dcn_context)
  console.log('result from dc_is_configured:', res)
}

console.log('Starting threads!')
b.dc_start_threads(dcn_context)

setTimeout(function () {
  console.log('\n\n\n>>>>>>> BEGIN INFO')
  console.log(b.dc_get_info(dcn_context))
  console.log('<<<<<<< END INFO\n\n\n')
  setTimeout(function () {
    console.log('Stopping threads ...')
    b.dc_stop_threads(dcn_context)
    console.log('Done.')
  }, 2000)
}, 5000)
