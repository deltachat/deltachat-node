const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')

test('simple open test', t => {
  const dc = new DeltaChat()
  dc.open(tempy.directory(), err => {
    t.error(err, 'no error during open')
    t.is(dc.isConfigured(), false, 'should not be configured')
    dc.close()
    t.end()
  })
})
