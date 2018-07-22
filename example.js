const dc = require('.')

console.log('result of dc.create', dc.create())

console.log('result from set_event_handler:', dc.set_event_handler(event => {
  console.log('this is really js event int', event)
}))

console.log('result from start_threads:', dc.start_threads())
