const DeltaChat = require('../').default
const test = require('tape')
const tempy = require('tempy')
const path = require('path')

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
const STARTTLS_FLAGS = '65792' // IMAP_SOCKET_STARTTLS & SMTP_SOCKET_STARTTLS
const SSL_FLAGS = '131584' // IMAP_SOCKET_SSL & SMTP_SOCKET_SSL

function dc (fn) {
  return async t => {
    const dc = new DeltaChat()
    const cwd = tempy.directory()
    const end = t.end.bind(t)

    t.end = () => {
      //dc.stopIO()
      dc.close()
      end()
    }
    t.endWithoutClose = () => {
      end()
    }

    t.is(dc.isOpen(), false, 'context database is not open')
    dc.on('ALL', console.log)

    await dc.open(cwd)

    t.is(dc.isOpen(), true, 'context database is open')
    t.is(dc.isConfigured(), false, 'should not be configured')
    fn(t, dc, cwd)
  }
}

function configureDefaultDC (dc) {
  return dc.configure({
    addr: ADDR,

    mail_server: SERVER,
    mail_user: ADDR,
    mail_pw: process.env.DC_MAIL_PW,

    send_server: SERVER,
    send_user: ADDR,
    send_pw: process.env.DC_MAIL_PW,

    server_flags: STARTTLS_FLAGS,

    displayname: 'Delta One',
    selfstatus: 'From Delta One with <3',
    selfavatar: path.join(__dirname, 'fixtures', 'avatar.png'),

    e2ee_enabled: true,
    save_mime_headers: true,
    imap_certificate_checks: 3,
    smtp_certificate_checks: 3
  })
}

function updateConfigurationDC (dc) {
  return dc.configure({
    addr: ADDR,

    mail_server: SERVER,
    mail_user: ADDR,
    mail_pw: process.env.DC_MAIL_PW,

    send_server: SERVER,
    send_user: ADDR,
    send_pw: process.env.DC_MAIL_PW,

    server_flags: SSL_FLAGS,

    displayname: 'Delta Two',
    selfstatus: 'From Delta One with <3',
    selfavatar: path.join(__dirname, 'fixtures', 'avatar.png'),

    e2ee_enabled: true,
    save_mime_headers: true,
    imap_certificate_checks: 3,
    smtp_certificate_checks: 3
  })
}

// TODO 1. to 4. below would cover dc.open() completely
// 1. test dc.open() where mkdirp fails (e.g. with no permissions)
// 2. test failing dc._open() (what would make it fail in core?)
// 3. test setting up context with e2ee_enabled set to false + close
// 4. test opening an already configured account (re-open above)

test('setUp dc context', dc(async (t, dc, cwd) => {
  t.plan(23)
  dc.once('DCN_EVENT_CONFIGURE_SUCCESSFUL', async () => {
    t.ok(true, 'Received DCN_EVENT_CONFIGURE_SUCCESSFUL event')
    t.is(dc.getConfig('addr'), ADDR, 'addr correct')
    t.is(dc.getConfig('mail_server'), SERVER, 'mailServer correct')
    t.is(dc.getConfig('mail_user'), ADDR, 'mailUser correct')
    t.is(dc.getConfig('send_server'), SERVER, 'sendServer correct')
    t.is(dc.getConfig('send_user'), ADDR, 'sendUser correct')
    t.is(dc.getConfig('displayname'), 'Delta One', 'displayName correct')
    t.is(dc.getConfig('selfstatus'), 'From Delta One with <3', 'selfStatus correct')
    t.is(dc.getConfig('server_flags'), STARTTLS_FLAGS, 'server flags correct')
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
    t.is(dc.isConfigured(), true, 'is configured')

    dc.once('DCN_EVENT_CONFIGURE_SUCCESSFUL', async () => {
      t.is(dc.getConfig('displayname'), 'Delta Two', 'updated displayName correct')
      t.is(dc.getConfig('server_flags'), SSL_FLAGS, 'updated server flags correct')
      t.end()
    })
    t.comment('Updating configuration')
    await updateConfigurationDC(dc)
  })
  dc.on('DCN_EVENT_CONFIGURE_FAILED', () => t.fail('configure failed, probably the provided DC_ADDR & DC_MAIL_PW are not correct?'))
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
  // dc.on('ALL', (event, data1, data2) => console.log('ALL', event, data1, data2))

  t.comment('Opening context')
  //t.is(dc.isConfigured(), false, 'should not be configured')
  await configureDefaultDC(dc)
}))


// TODO send text message to chat, check message count and
// delivered status etc
// TODO test dc.createChatByMsgId()

test.only('key transfer', dc(async (t, dc, cwd) => {

  // Spawn a second dc instance with same account
  dc.on('ALL', (event, data1, data2) => console.log('ACC1', event, data1, data2))
  await configureDefaultDC(dc)
  dc.startIO()
  const dc2 = new DeltaChat()
  await dc2.open(tempy.directory())
  let setupCode = null
  dc.on('DC_EVENT_MSGS_CHANGED', async (chatId, msgId) => {
    t.comment('incoming msg')
    const messages = dc.getChatMessages(chatId, 0, 0)
    t.ok(messages.indexOf(msgId) !== -1, 'msgId is in chat messages')
    const result = await dc.continueKeyTransfer(msgId, setupCode)
    t.ok(result === true, 'continueKeyTransfer was successful')
    dc2.stopIO()
    dc2.close()
    dc.stopIO()
    t.end()
  })

  dc2.once('DCN_EVENT_CONFIGURE_SUCCESSFUL', async () => {
    setupCode = await dc2.initiateKeyTransfer()
    t.comment('setupCode is: ' + setupCode)
    t.is(typeof setupCode, 'string', 'setupCode is string')
  })
  dc2.on('ALL', (event, data1, data2) => console.log('ACC2', event, data1, data2))
  await configureDefaultDC(dc2)
  dc2.startIO()

}))
