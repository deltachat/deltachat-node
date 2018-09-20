const test = require('tape')
const events = require('../events')
const c = require('../constants')

test('reverse lookup of events', t => {
  const eventKeys = Object.keys(events).map(k => Number(k))
  const eventValues = Object.values(events)
  const reverse = eventValues.map(v => c[v])
  t.same(reverse, eventKeys, 'reverse lookup ok')
  t.end()
})

test('event constants are consistent', t => {
  const eventKeys = Object.keys(c).filter(k => k.startsWith('DC_EVENT_')).sort()
  const eventValues = Object.values(events).sort()
  t.same(eventKeys, eventValues, 'identical')
  t.end()
})
