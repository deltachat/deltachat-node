/* eslint-disable no-new */

const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')
const path = require('path')
const fs = require('fs')
const c = require('../constants')
const events = require('../events')

let dc = null

test('missing addr and/or mail_pw throws', t => {
  t.throws(function () {
    new DeltaChat({
      addr: 'delta1@delta.localhost'
    })
  }, /Missing \.mail_pw/)
  t.throws(function () {
    new DeltaChat({
      mail_pw: 'delta1'
    })
  }, /Missing \.addr/)
  t.end()
})

// TODO 1. to 4. below would cover dc.open() completely
// 1. test dc.open() where mkdirp fails (e.g. with no permissions)
// 2. test failing dc._open() (what would make it fail in core?)
// 3. test setting up context with e2ee_enabled set to false + close
// 4. test opening an already configured account (re-open above)

test('setUp dc context', t => {
  t.plan(19)
  const cwd = tempy.directory()
  dc = new DeltaChat({
    addr: 'delta1@delta.localhost',
    mail_server: '127.0.0.1',
    mail_port: 3143,
    mail_user: 'delta1',
    mail_pw: 'delta1',
    send_server: '127.0.0.1',
    send_port: 3025,
    send_user: 'delta1',
    send_pw: 'delta1',
    server_flags: 0x400 | 0x40000,
    displayname: 'Delta One',
    selfstatus: 'From Delta One with <3',
    e2ee_enabled: true,
    cwd
  })
  dc.once('ready', () => {
    t.is(dc.getConfig('addr'), 'delta1@delta.localhost', 'addr correct')
    t.is(dc.getConfig('mail_server'), '127.0.0.1', 'mail_server correct')
    t.is(dc.getConfig('mail_port'), '3143', 'mail_port correct')
    t.is(dc.getConfigInt('mail_port'), 3143, 'mail_port correct')
    t.is(dc.getConfig('mail_user'), 'delta1', 'mail_user correct')
    t.is(dc.getConfig('mail_pw'), 'delta1', 'mail_pw correct')
    t.is(dc.getConfig('send_server'), '127.0.0.1', 'send_server correct')
    t.is(dc.getConfig('send_port'), '3025', 'send_port correct')
    t.is(dc.getConfigInt('send_port'), 3025, 'send_port correct')
    t.is(dc.getConfig('send_user'), 'delta1', 'send_user correct')
    t.is(dc.getConfig('send_pw'), 'delta1', 'send_pw correct')
    t.is(dc.getConfigInt('server_flags'), 0x400 | 0x40000, 'server_flags correct')
    t.is(dc.getConfig('displayname'), 'Delta One', 'displayname correct')
    t.is(dc.getConfig('selfstatus'), 'From Delta One with <3', 'selfstatus correct')
    t.is(dc.getConfigInt('e2ee_enabled'), 1, 'e2ee enabled')
    t.is(typeof dc.getInfo(), 'string', 'info is a string')
    t.is(dc.getBlobdir(), `${cwd}/db.sqlite-blobs`, 'correct blobdir')
  })
  dc.on('DC_EVENT_ERROR', (data1, data2) => {
    throw new Error(data1 || data2)
  })
  dc.once('ALL', () => t.pass('ALL event fired at least once'))
  dc.open(err => t.error(err, 'no error during open'))
})

test('create chat from contact and Chat methods', t => {
  const contactId = dc.createContact('aaa', 'aaa@site.org')

  let chatId = dc.createChatByContactId(contactId)
  let chat = dc.getChat(chatId)

  t.is(chat.getArchived(), 0, 'not archived')
  t.is(chat.getDraftTimestamp(), 0, 'no timestamp')
  t.is(chat.getId(), chatId, 'chat id matches')
  t.is(chat.getName(), 'aaa', 'chat name matches')
  t.is(chat.getProfileImage(), null, 'no profile image')
  t.is(chat.getSubtitle(), 'aaa@site.org', 'correct subtitle')
  t.is(chat.getTextDraft(), null, 'no text draft')
  t.is(chat.getType(), c.DC_CHAT_TYPE_SINGLE, 'single chat')
  t.is(chat.isSelfTalk(), false, 'no self talk')
  // TODO make sure this is really the case!
  t.is(chat.isUnpromoted(), false, 'not unpromoted')
  t.is(chat.isVerified(), false, 'not verified')

  t.is(dc.getChatIdByContactId(contactId), chatId)
  t.same(dc.getChatContacts(chatId), [ contactId ])

  dc.archiveChat(chatId, true)
  t.is(dc.getChat(chatId).getArchived(), 1, 'chat archived')
  dc.archiveChat(chatId, false)
  t.is(dc.getChat(chatId).getArchived(), 0, 'chat unarchived')

  chatId = dc.createUnverifiedGroupChat('unverified group')
  chat = dc.getChat(chatId)
  t.is(chat.isVerified(), false, 'is not verified')
  t.is(chat.getType(), c.DC_CHAT_TYPE_GROUP, 'group chat')
  t.same(dc.getChatContacts(chatId), [ c.DC_CONTACT_ID_SELF ])

  dc.setChatName(chatId, 'NEW NAME')
  t.is(dc.getChat(chatId).getName(), 'NEW NAME', 'name updated')

  dc.setTextDraft(chatId, 'NEW DRAFT')
  t.is(dc.getChat(chatId).getTextDraft(), 'NEW DRAFT', 'draft updated')

  chatId = dc.createVerifiedGroupChat('a verified group')
  chat = dc.getChat(chatId)
  t.is(chat.isVerified(), true, 'is verified')
  t.is(chat.getType(), c.DC_CHAT_TYPE_VERIFIED_GROUP, 'verified group chat')

  t.end()
})

test('test setting profile image and DC_EVENT_FILE_COPIED', t => {
  const chatId = dc.createUnverifiedGroupChat('testing profile image group')
  const image = 'image.jpeg'
  const imagePath = path.join(__dirname, image)
  const blobs = dc.getBlobdir()

  dc.once('DC_EVENT_FILE_COPIED', fileName => {
    t.is(fileName, imagePath, `${fileName} was copied`)
    t.is(
      dc.getChat(chatId).getProfileImage(),
      `${blobs}/${image}`,
      'image in blobdir'
    )
    t.end()
  })

  dc.setChatProfileImage(chatId, imagePath)
})

test('create and delete chat', t => {
  let chatId = dc.createUnverifiedGroupChat('GROUPCHAT')
  let chat = dc.getChat(chatId)
  t.is(chat.getId(), chatId, 'correct chatId')
  dc.deleteChat(chat.getId())
  t.same(dc.getChat(chatId), null, 'chat removed')
  t.end()
})

test('new message and Message methods', t => {
  const text = 'w00t!'
  let msg = dc.messageNew()
  msg.setText(text)

  t.is(msg.getChatId(), 0, 'chat id 0 before sent')
  t.is(msg.getDuration(), 0, 'duration 0 before sent')
  t.is(msg.getFile(), '', 'no file set by default')
  t.is(msg.getFilebytes(), 0, 'and file bytes is 0')
  t.is(msg.getFilemime(), '', 'no filemime by default')
  t.is(msg.getFilename(), '', 'no filename set by default')
  t.is(msg.getFromId(), 0, 'no contact id set by default')
  t.is(msg.getHeight(), 0, 'plain text message have height 0')
  t.is(msg.getId(), 0, 'id 0 before sent')

  let mi = msg.getMediainfo()
  t.is(mi.getId(), 0, 'no mediainfo id')
  t.is(mi.getState(), 0, 'no mediainfo state')
  t.is(mi.getText1(), null, 'no mediainfo text1')
  t.is(mi.getText1Meaning(), 0, 'no mediainfo text1 meaning')
  t.is(mi.getText2(), null, 'no mediainfo text2')
  t.is(mi.getTimestamp(), 0, 'no mediainfo timestamp')

  t.is(msg.getSetupcodebegin(), '', 'no setupcode begin')
  t.is(msg.getShowpadlock(), false, 'no padlock by default')

  const state = msg.getState()
  t.is(state.isUndefined(), true, 'no state by default')
  t.is(state.isFresh(), false, 'no state by default')
  t.is(state.isNoticed(), false, 'no state by default')
  t.is(state.isSeen(), false, 'no state by default')
  t.is(state.isPending(), false, 'no state by default')
  t.is(state.isFailed(), false, 'no state by default')
  t.is(state.isDelivered(), false, 'no state by default')
  t.is(state.isReceived(), false, 'no state by default')

  let summary = msg.getSummary()
  t.is(summary.getId(), 0, 'no summary id')
  t.is(summary.getState(), 0, 'no summary state')
  t.is(summary.getText1(), null, 'no summary text1')
  t.is(summary.getText1Meaning(), 0, 'no summary text1 meaning')
  t.is(summary.getText2(), null, 'no summary text2')
  t.is(summary.getTimestamp(), 0, 'no summary timestamp')

  t.is(msg.getSummarytext(), text, 'summary text is text')
  t.is(msg.getText(), text, 'msg text set correctly')
  t.is(msg.getTimestamp(), 0, 'no timestamp')

  let type = msg.getType()
  t.is(type.isUndefined(), true, 'no message type set')
  t.is(type.isText(), false, 'no message type set')
  t.is(type.isImage(), false, 'no message type set')
  t.is(type.isGif(), false, 'no message type set')
  t.is(type.isAudio(), false, 'no message type set')
  t.is(type.isVoice(), false, 'no message type set')
  t.is(type.isVideo(), false, 'no message type set')
  t.is(type.isFile(), false, 'no message type set')

  t.is(msg.getWidth(), 0, 'no message width')
  t.is(msg.isDeadDrop(), false, 'not deaddrop')
  t.is(msg.isForwarded(), false, 'not forwarded')
  t.is(msg.isIncreation(), false, 'not in creation')
  t.is(msg.isInfo(), false, 'not an info message')
  t.is(msg.isSent(), false, 'messge is not sent')
  t.is(msg.isSetupmessage(), false, 'not an autocrypt setup message')
  t.is(msg.isStarred(), false, 'not starred')

  msg.latefilingMediasize(10, 20, 30)
  t.is(msg.getWidth(), 10, 'message width set correctly')
  t.is(msg.getHeight(), 20, 'message height set correctly')
  t.is(msg.getDuration(), 30, 'message duration set correctly')

  msg.setDimension(100, 200)
  t.is(msg.getWidth(), 100, 'message width set correctly')
  t.is(msg.getHeight(), 200, 'message height set correctly')

  msg.setDuration(314)
  t.is(msg.getDuration(), 314, 'message duration set correctly')

  t.throws(function () { msg.setFile() }, /Missing filename/)

  msg.setMediainfo()
  mi = msg.getMediainfo()
  t.is(mi.getText1(), null, 'text1 not set')
  t.is(mi.getText2(), null, 'text2 not set')

  const logo = path.join(__dirname, 'logo.png')
  const stat = fs.statSync(logo)
  msg.setFile(logo)
  t.is(msg.getFilebytes(), stat.size, 'correct file size')
  t.is(msg.getFile(), logo, 'correct file name')
  t.is(msg.getFilemime(), 'image/png', 'mime set implicitly')
  msg.setFile(logo, 'image/gif')
  t.is(msg.getFilemime(), 'image/gif', 'mime set (in)correctly')
  msg.setFile(logo, 'image/png')
  t.is(msg.getFilemime(), 'image/png', 'mime set correctly')

  msg.setMediainfo('deltaX', 'rules')

  mi = msg.getMediainfo()
  t.is(mi.getText1(), 'deltaX', 'text1 set')
  t.is(mi.getText2(), 'rules', 'text2 set')

  msg.setType(c.DC_MSG_AUDIO)
  t.is(msg.getType().isAudio(), true, 'type set correctly')

  const json = msg.toJson()
  t.notEqual(json, null, 'not null')
  t.is(typeof json, 'object', 'json object')

  t.end()
})

// TODO send text message to chat, check message count and
// delivered status etc

// TODO test dc.createChatByMsgId()

test('Contact methods', t => {
  const contactId = dc.createContact('First Last', 'first.last@site.org')
  let contact = dc.getContact(contactId)

  t.is(contact.getAddress(), 'first.last@site.org', 'correct address')
  t.is(contact.getDisplayName(), 'First Last', 'correct display name')
  t.is(contact.getFirstName(), 'First', 'correct first name')
  t.is(contact.getId(), contactId, 'contact id matches')
  t.is(contact.getName(), 'First Last', 'correct name')
  t.is(contact.getNameAndAddress(), 'First Last (first.last@site.org)')
  t.is(contact.isBlocked(), false, 'not blocked')
  t.is(contact.isVerified(), false, 'unverified status')

  // TODO test verifying a contact

  t.end()
})

test('create contacts from address book', t => {
  const addresses = [
    'Name One',
    'name1@site.org',
    'Name Two',
    'name2@site.org',
    'Name Three',
    'name3@site.org'
  ]

  const count = dc.addAddressBook(addresses.join('\n'))
  t.is(count, addresses.length / 2)

  dc.getContacts(0, 'Name ')
    .map(id => dc.getContact(id))
    .forEach(contact => {
      t.ok(contact.getName().startsWith('Name '))
    })

  t.end()
})

test('delete contacts', t => {
  let id = dc.createContact('someuser', 'someuser@site.com')
  let contact = dc.getContact(id)

  t.is(contact.getId(), id, 'contact id matches')
  t.is(dc.deleteContact(id), true, 'delete call succesful')
  t.is(dc.getContact(id), null, 'contact is gone')

  t.end()
})

test('adding and removing a contact from a chat', t => {
  const chatId = dc.createUnverifiedGroupChat('adding_and_removing')
  const contactId = dc.createContact('Add Remove', 'add.remove@site.com')

  t.is(dc.addContactToChat(chatId, contactId), true, 'contact added')
  t.is(dc.isContactInChat(chatId, contactId), true, 'contact in chat')
  t.is(dc.removeContactFromChat(chatId, contactId), true, 'contact removed')
  t.is(dc.isContactInChat(chatId, contactId), false, 'contact not in chat')

  t.end()
})

test('blocking contacts', t => {
  let id = dc.createContact('badcontact', 'bad@site.com')

  t.is(dc.getBlockedCount(), 0)
  t.same(dc.getContact(id).isBlocked(), false)
  t.same(dc.getBlockedContacts(), [])

  dc.blockContact(id, true)
  t.is(dc.getBlockedCount(), 1)
  t.same(dc.getContact(id).isBlocked(), true)
  t.same(dc.getBlockedContacts(), [ id ])

  dc.blockContact(id, false)
  t.is(dc.getBlockedCount(), 0)
  t.same(dc.getContact(id).isBlocked(), false)
  t.same(dc.getBlockedContacts(), [])

  t.end()
})

test('ChatList methods', t => {
  const ids = [
    dc.createUnverifiedGroupChat('groupchat1'),
    dc.createUnverifiedGroupChat('groupchat11'),
    dc.createUnverifiedGroupChat('groupchat111')
  ]

  let chatList = dc.getChatList(0, 'groupchat1')
  t.is(chatList.getCount(), 3, 'should contain above chats')
  t.notEqual(ids.indexOf(chatList.getChatId(0)), -1)
  t.notEqual(ids.indexOf(chatList.getChatId(1)), -1)
  t.notEqual(ids.indexOf(chatList.getChatId(2)), -1)

  let lot = chatList.getSummary(0)
  t.is(lot.getId(), 0, 'lot has no id')
  t.is(lot.getState(), 0, 'lot has no state')
  t.is(lot.getText1(), 'Draft', 'text1 is set')
  t.is(lot.getText1Meaning(), c.DC_TEXT1_DRAFT)
  t.ok(lot.getText2().startsWith('Hello, I\'ve just created'))
  t.ok(lot.getTimestamp() > 0, 'timestamp set')

  dc.archiveChat(ids[0], true)
  chatList = dc.getChatList(c.DC_GCL_ARCHIVED_ONLY, 'groupchat1')
  t.is(chatList.getCount(), 1, 'only one archived')

  t.end()
})

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

test('tearDown dc context', t => {
  // TODO dc.close() should callback
  dc.close()
  t.end()
})
