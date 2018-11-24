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

    t.test('> missing addr or mail_pw throws', t => {
      t.throws(function () {
        dc.configure({ addr: 'delta1@delta.localhost' })
      }, /Missing \.mailPw/, 'missing mailPw throws')
      t.throws(function () {
        dc.configure({ mailPw: 'delta1' })
      }, /Missing \.addr/, 'missing addr throws')
      t.end()
    })

    t.test('> autoconfigure (using invalid password)', t => {
      t.plan(3)
      dc.on('DC_EVENT_INFO', info => {
        if (info.startsWith('Got autoconfig:')) {
          t.pass('Got autoconfig!')
        }
      })
      dc.once('DC_EVENT_ERROR_NETWORK', (first, error) => {
        t.is(first, 1, 'first network error')
        if (error.startsWith('Cannot login as')) {
          t.pass('Got correct login error')
        } else {
          t.pass('Got incorrect login error: ' + error)
        }
      })
      dc.configure({
        addr: 'hpk2@hq5.merlinux.eu',
        mailPw: 'whatever'
      })
    })

    t.test('> close', t => {
      dc.close()
      t.end()
    })
  })
})
