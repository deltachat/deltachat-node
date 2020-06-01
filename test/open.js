const DeltaChat = require('../').default
const binding = require('../binding')
const test = require('tape')
const tempy = require('tempy')

test('open', t => {
  const dc = new DeltaChat(tempy.directory())
  dc.open(tempy.directory())
  t.is(dc.isConfigured(), false)
  dc.close()
  t.end()
})
test('> missing addr or mail_pw throws', t => {
  const dc = new DeltaChat()
  dc.open(tempy.directory())
  t.throws(function () {
    dc.configure({ addr: 'delta1@delta.localhost' })
  }, 'Missing .mailPw', 'missing mailPw throws')
  t.throws(function () {
    dc.configure({ mailPw: 'delta1' })
  }, /Missing \.addr/, 'missing addr throws')
  dc.close()
  t.end()
})

// TODO move to integration tests
test('> autoconfigure (using invalid password)', t => {
  const dc = new DeltaChat()
  dc.open(tempy.directory())

  dc.on('DC_EVENT_CONFIGURE_PROGRESS', progress => {
    if(progress === 0) {
      t.pass('Login failed using invalid password')
      dc.stopIO()
      dc.close()
      t.end()
    }
  })

  dc.configure({
    addr: 'hpk5@testrun.org',
    mail_pw: 'asd'
  })

  dc.startIO()
})
