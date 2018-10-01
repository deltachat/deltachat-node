const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')

test('open', t => {
  const dc = new DeltaChat()
  t.is(dc.isOpen(), false, 'context database is not open')
  dc.open(tempy.directory(), err => {
    t.error(err, 'no error during open')
    t.is(dc.isOpen(), true, 'context database is open')
    t.is(dc.isConfigured(), false, 'should not be configured')

    t.test('> missing addr or mail_pw errors', t => {
      dc.configure({ addr: 'delta1@delta.localhost' }, err => {
        t.is(err.message, 'Missing .mail_pw')
      })
      dc.configure({ mail_pw: 'delta1' }, err => {
        t.is(err.message, 'Missing .addr')
      })
      t.end()
    })

    t.test('> autoconfigure', t => {
      t.plan(2)
      dc.on('DC_EVENT_INFO', info => {
        if (info.startsWith('Got autoconfig:')) {
          t.pass('Got autoconfig!')
        }
      })
      dc.configure({
        addr: 'hpk2@hq5.merlinux.eu',
        mail_pw: 'whatever'
      }, err => {
        t.is(typeof err.message, 'string', 'Configure failed!')
      })
    })

    t.test('> close', t => {
      dc.close()
      t.end()
    })
  })
})
