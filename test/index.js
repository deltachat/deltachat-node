const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')

let dc = null

test('setUp dc context', t => {
  dc = new DeltaChat({
    email: process.env.DC_EMAIL,
    password: process.env.DC_PASSWORD,
    root: tempy.directory()
  })
  dc.on('open', t.end.bind(t))
})

test('create chat from contact and chat methods', t => {
  const contactId = dc.createContact('aaa', 'aaa@site.org')

  let chatId = dc.createChatByContactId(contactId)
  let chat = dc.getChat(chatId)

  // TODO test archiving and unarchiving chats when
  // dcn_archive_chat has been implemented

  t.is(chat.getArchived(), 0, 'not archived')
  t.is(chat.getDraftTimestamp(), 0, 'no timestamp')
  t.is(chat.getId(), chatId, 'chat id matches')
  t.is(chat.getName(), 'aaa', 'chat name matches')
  t.is(chat.getProfileImage(), null, 'no profile image')
  t.is(chat.getSubtitle(), 'aaa@site.org', 'correct subtitle')
  t.is(chat.getTextDraft(), null, 'no text draft')
  t.is(chat.getType(), 100, 'type 100 with single chat')
  t.is(chat.isSelfTalk(), false, 'no self talk')
  // TODO make sure this is really the case!
  t.is(chat.isUnpromoted(), false, 'not unpromoted')
  t.is(chat.isVerified(), false, 'not verified')

  chatId = dc.createGroupChat(0, 'unverified group')
  chat = dc.getChat(chatId)
  t.is(chat.isVerified(), false, 'is not verified')
  t.is(chat.getType(), 120, 'type 120 for group chat')

  chatId = dc.createGroupChat(1, 'a verified group')
  chat = dc.getChat(chatId)
  t.is(chat.isVerified(), true, 'is verified')
  t.is(chat.getType(), 130, 'type 130 for verified group chat')

  t.end()
})

test('create and delete chat', t => {
  let chatId = dc.createGroupChat(0, 'GROUPCHAT')
  let chat = dc.getChat(chatId)
  t.is(chat.getId(), chatId, 'correct chatId')
  dc.deleteChat(chat)
  t.same(dc.getChat(chatId), null, 'chat removed using chat object')
  chatId = dc.createGroupChat(0, 'GROUPCHAT')
  chat = dc.getChat(chatId)
  dc.deleteChat(chat.getId())
  t.same(dc.getChat(chatId), null, 'chat removed using id')
  t.end()
})

test('new message and basic methods', t => {
  const text = 'w00t!'
  let msg = dc.msgNew()
  msg.setText(text)

  t.is(msg.getChatId(), 0, 'chat id 0 before sent')
  t.is(msg.getDuration(), 0, 'duration 0 before sent')
  t.is(msg.getFile(), '', 'no file set by default')
  t.is(msg.getFilename(), '', 'no filename set by default')
  // TODO standard can't parse 0 bigint
  // t.is(msg.getFilebytes(), 0n, 'and file bytes is 0n')
  t.is(msg.getFilemime(), '', 'no filemime by default')
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
  t.is(msg.getState(), 0, 'no state by default')

  let summary = msg.getSummary()
  t.is(summary.getId(), 0, 'no summary id')
  t.is(summary.getState(), 0, 'no summary state')
  t.is(summary.getText1(), null, 'no summary text1')
  t.is(summary.getText1Meaning(), 0, 'no summary text1 meaning')
  t.is(summary.getText2(), null, 'no summary text2')
  t.is(summary.getTimestamp(), 0, 'no summary timestamp')

  t.is(msg.getSummarytext(), text, 'summary text is text')
  t.is(msg.getText(), text, 'msg text set correctly')
  t.is(msg.getType(), 0, 'no message type set')
  t.is(msg.getWidth(), 0, 'no message width')
  t.is(msg.isForwarded(), false, 'not forwarded')
  // TODO check this, shouldn't this be true for a new message?
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

  msg.setFile('notexisting.jpeg', 'image/jpeg')
  t.is(msg.getFile(), 'notexisting.jpeg', 'file set correctly')
  t.is(msg.getFilemime(), 'image/jpeg', 'mime set correctly')

  msg.setMediainfo('deltaX', 'rules')

  mi = msg.getMediainfo()
  t.is(mi.getText1(), 'deltaX', 'text1 set')
  t.is(mi.getText2(), 'rules', 'text2 set')

  msg.setType(40)
  t.is(msg.getType(), 40, 'type set correctly')

  t.end()
})

// TODO send message and check status delivered etc

// TODO test dc.createChatByMsgId()

test('create and delete contacts', t => {
  let id = dc.createContact('someuser', 'someuser@site.com')
  let contact = dc.getContact(id)

  t.is(contact.getId(), id, 'contact id matches')
  t.is(dc.deleteContact(id), true, 'delete call succesful')
  t.is(dc.getContact(id), null, 'contact is gone')

  t.end()
})

test('blocking contacts', t => {
  let id = dc.createContact('badcontact', 'bad@site.com')

  t.is(dc.getBlockedCount(), 0)
  t.same(dc.getContact(id).isBlocked(), false)
  t.same(dc.getBlockedContacts(), [])

  dc.blockContact(dc.getContact(id), true)
  t.is(dc.getBlockedCount(), 1)
  t.same(dc.getContact(id).isBlocked(), true)
  t.same(dc.getBlockedContacts(), [ id ])

  dc.blockContact(dc.getContact(id), false)
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

test('tearDown dc context', t => {
  // TODO dc.close() should callback
  dc.close()
  t.end()
})

/*
let contact = dc.getContact(rtn2)
console.log('contact addr', contact.getAddr())
console.log('contact display name', contact.getDisplayName())
console.log('contact first name', contact.getFirstName())
console.log('contact id', contact.getId())
console.log('contact name', contact.getName())
console.log('contact name & addr', contact.getNameNAddr())
console.log('contact is blocked', contact.isBlocked())
console.log('contact is verified', contact.isVerified())

let chatList = dc.getChatList(0, 'AAA')
console.log('chat list chat id', chatList.getChatId(0))
console.log('chat list count', chatList.getCount())
console.log('chat list message id', chatList.getMsgId(0))

let lot = chatList.getSummary(0)
console.log('lot id', lot.getId())
console.log('lot state', lot.getState())
console.log('lot text1', lot.getText1())
console.log('lot text1 meaning', lot.getText1Meaning())
console.log('lot text2', lot.getText2())
console.log('lot timestamp', lot.getTimestamp())

// Lets send a message to chat2
const msgId = dc.sendTextMsg(chat2Id, 'Hi!' + Math.random())
// const msgId = 10
console.log('sent message to chat2 got msgId', msgId)
console.log('message info', dc.getMsgInfo(msgId))
console.log('number of messages in chat2', dc.getMsgCount(chat2Id))
*/
