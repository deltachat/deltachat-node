const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')

test('open', t => {
  const dc = new DeltaChat()
  dc.open(tempy.directory(), err => {
    t.error(err, 'no error during open')
    t.is(dc.isConfigured(), false, 'should not be configured')

    t.test('> missing addr or mail_pw throws', t => {
      t.throws(function () {
        dc.configure({ addr: 'delta1@delta.localhost' })
      }, /Missing \.mail_pw/, 'missing mail_pw throws')
      t.throws(function () {
        dc.configure({ mail_pw: 'delta1' })
      }, /Missing \.addr/, 'missing addr throws')
      t.end()
    })

    t.test('> autoconfigure', t => {
      t.plan(2)
      dc.on('DC_EVENT_INFO', info => {
        if (info.startsWith('Got autoconfig:')) {
          t.pass('Got autoconfig!')
        }
      })
      dc.once('DC_EVENT_ERROR', (code, error) => {
        t.pass('Got _some_ error (either can\'t connect or can\'t login)')
      })
      dc.configure({
        addr: 'hpk2@hq5.merlinux.eu',
        mail_pw: 'whatever'
      })
    })

    t.test('> close', t => {
      dc.close()
      t.end()
    })
  })
})
