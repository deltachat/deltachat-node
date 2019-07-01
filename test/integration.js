const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')
const path = require('path')

let dc = null

if (typeof process.env.DC_ADDR !== 'string') {
  console.error('Missing DC_ADDR environment variable!')
  process.exit(1)
}

if (typeof process.env.DC_MAIL_PW !== 'string') {
  console.error('Missing DC_MAIL_PW environment variable!')
  process.exit(1)
}

const ADDR = process.env.DC_ADDR
const SERVER = ADDR.split('@')[1]

function configureDefaultDC (dc) {
  dc.configure({
    addr: ADDR,

    mail_server: SERVER,
    mail_user: ADDR,
    mail_pw: process.env.DC_MAIL_PW,

    send_server: SERVER,
    send_user: ADDR,
    send_pw: process.env.DC_MAIL_PW,

    displayname: 'Delta One',
    selfstatus: 'From Delta One with <3',
    selfavatar: path.join(__dirname, 'fixtures', 'avatar.png'),

    e2ee_enabled: true,
    save_mime_headers: true
  })
}

// TODO 1. to 4. below would cover dc.open() completely
// 1. test dc.open() where mkdirp fails (e.g. with no permissions)
// 2. test failing dc._open() (what would make it fail in core?)
// 3. test setting up context with e2ee_enabled set to false + close
// 4. test opening an already configured account (re-open above)

test('setUp dc context', t => {
  t.plan(17)
  const cwd = tempy.directory()
  dc = new DeltaChat()
  dc.once('ready', () => {
    t.is(dc.getConfig('addr'), ADDR, 'addr correct')
    t.is(dc.getConfig('mail_server'), SERVER, 'mailServer correct')
    t.is(dc.getConfig('mail_user'), ADDR, 'mailUser correct')
    t.is(dc.getConfig('send_server'), SERVER, 'sendServer correct')
    t.is(dc.getConfig('send_user'), ADDR, 'sendUser correct')
    t.is(dc.getConfig('displayname'), 'Delta One', 'displayName correct')
    t.is(dc.getConfig('selfstatus'), 'From Delta One with <3', 'selfStatus correct')
    // TODO comment back in once fixed in core
    // t.is(
    //   dc.getConfig('selfavatar'),
    //   path.join(cwd,
    //             'db.sqlite-blobs',
    //             'avatar.png'),
    //   'selfavatar correct'
    // )
    t.is(dc.getConfig('e2ee_enabled'), '1', 'e2ee_enabled correct')
    t.is(dc.getConfig('inbox_watch'), '1', 'inbox_watch')
    t.is(dc.getConfig('sentbox_watch'), '1', 'sentbox_watch')
    t.is(dc.getConfig('mvbox_watch'), '1', 'mvbox_watch')
    t.is(dc.getConfig('mvbox_move'), '1', 'mvbox_move')
    t.is(dc.getConfig('save_mime_headers'), '1', 'save_mime_headers correct')
    t.is(
      dc.getBlobdir(),
      path.join(cwd, 'db.sqlite-blobs'),
      'correct blobdir'
    )
  })
  dc.once('DC_EVENT_CONFIGURE_PROGRESS', data => {
    t.pass('DC_EVENT_CONFIGURE_PROGRESS called at least once')
  })
  dc.on('DC_EVENT_ERROR', error => {
    console.error('DC_EVENT_ERROR', error)
    process.exit(1)
  })
  dc.on('DC_EVENT_ERROR_NETWORK', (first, error) => {
    console.error('DC_EVENT_ERROR_NETWORK', error)
    process.exit(1)
  })
  dc.on('ALL', (event, data1, data2) => {
    console.log('ALL', event, data1, data2)
  })
  dc.open(cwd, err => {
    t.error(err, 'no error during open')
    t.is(dc.isConfigured(), false, 'should not be configured')
    configureDefaultDC(dc)
  })
})

test('static getConfig()', t => {
  const info = dc.getInfo()
  const dir = info.database_dir
  DeltaChat.getConfig(dir, (err, config) => {
    t.error(err, 'no error')
    t.is(config.addr, ADDR)
    t.end()
  })
})

// TODO send text message to chat, check message count and
// delivered status etc
// TODO test dc.createChatByMsgId()

test.skip('key transfer', t => {
  t.timeoutAfter(900)

  // Spawn a second dc instance with same account
  let dc2 = new DeltaChat()

  dc2.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
    t.comment('incoming msg')
    dc2.close()
    t.end()
  })

  dc2.once('ready', () => {
    dc.initiateKeyTransfer((err, setupCode) => {
      t.error(err, 'no err')
      t.is(typeof setupCode, 'string', 'setupCode is string')
    })
  })

  dc2.open(tempy.directory(), err => {
    t.error(err, 'no err')
    configureDefaultDC(dc2)
  })
})

test('initiate key transfer', t => {
  dc.initiateKeyTransfer((err, setupCode) => {
    t.error(err, 'no err')
    t.is(typeof setupCode, 'string', 'setupCode is string')
    t.end()
  })
})

test('tearDown dc context', t => {
  console.time('dc.close')
  dc.close(() => {
    console.timeEnd('dc.close')
    t.end()
  })
})
