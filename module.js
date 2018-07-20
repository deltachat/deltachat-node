const addon = require('./build/Release/module');

let dc_context = addon.dc_context_new();

console.log(dc_context);
console.log(addon.dc_set_event_handler_cb(dc_context, (eventInteger) => {
  console.log("this is really js event int", eventInteger); 
}));

console.log(addon.dc_perform_jobs_start(dc_context));
