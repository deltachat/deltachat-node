const DeltaChat = require('../').default
const binding = require('../binding')
const test = require('tape')
const tempy = require('tempy')


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
