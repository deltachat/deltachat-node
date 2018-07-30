const DeltaChat = require('../')
const test = require('tape')
const tempy = require('tempy')

let dc = null

test('setUp dc context', t => {
  const root = tempy.directory()
  dc = new DeltaChat({
    email: process.env.DC_EMAIL,
    password: process.env.DC_PASSWORD,
    root: root
  })
  dc.on('open', t.end.bind(t))
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

// TODO it would be nice if we could get some sort of event
// when we're 'ready' because right now we are blocked by
// the constructor
/*
const rtn2 = dc.createContact('rtn2', 'rtn2@deltachat.de')
console.log('rtn2 id', rtn2)
const rtn3 = dc.createContact('rtn3', 'rtn3@deltachat.de')
console.log('rtn3 id', rtn3)

const chat2Id = dc.createChatByContactId(rtn2)
console.log('rtn2 chat id', chat2Id)
const chat3Id = dc.createChatByContactId(rtn3)
console.log('rtn3 chat id', chat3Id)

// Seems the group chats are not unique, so calling these
// lines below will create new groups each time
const group1 = dc.createGroupChat(0, 'AAA')
console.log('AAA id', group1)
const group2 = dc.createGroupChat(1, 'BBB')
console.log('BBB id', group2)

// TODO test dc.createChatByMsgId()

let chat = dc.getChat(chat2Id)
console.log('chat archived', chat.getArchived())
console.log('chat draft timestamp', chat.getDraftTimestamp())
console.log('chat id', chat.getId())
console.log('chat name', chat.getName())
console.log('chat profile image', chat.getProfileImage())
console.log('chat sub title', chat.getSubtitle())
console.log('chat text draft', chat.getTextDraft())
console.log('chat type', chat.getType())
console.log('chat self talk', chat.isSelfTalk())
console.log('chat is unpromoted', chat.isUnpromoted())
console.log('chat is verified', chat.isVerified())

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

let msg = dc.getMsg(msgId)
console.log('msg chat id', msg.getChatId())
console.log('msg duration', msg.getDuration())
console.log('msg file', msg.getFile())
console.log('msg filebytes', msg.getFilebytes())
console.log('msg filemime', msg.getFilemime())
console.log('msg filename', msg.getFilename())
console.log('msg from id', msg.getFromId())
console.log('msg height', msg.getHeight())
console.log('msg id', msg.getId())

let mediainfo = msg.getMediainfo()
console.log('    mediainfo id', mediainfo.getId())
console.log('    mediainfo state', mediainfo.getState())
console.log('    mediainfo text1', mediainfo.getText1())
console.log('    mediainfo text1 meaning', mediainfo.getText1Meaning())
console.log('    mediainfo text2', mediainfo.getText2())
console.log('    mediainfo timestamp', mediainfo.getTimestamp())

console.log('msg setupcodebegin', msg.getSetupcodebegin())
console.log('msg showpadlock', msg.getShowpadlock())
console.log('msg state', msg.getState())

let summary = msg.getSummary()
console.log('    summary id', summary.getId())
console.log('    summary state', summary.getState())
console.log('    summary text1', summary.getText1())
console.log('    summary text1 meaning', summary.getText1Meaning())
console.log('    summary text2', summary.getText2())
console.log('    summary timestamp', summary.getTimestamp())

console.log('msg summary text', msg.getSummarytext())
console.log('msg summary text (5)', msg.getSummarytext(5))
console.log('msg text', msg.getText())
console.log('msg timestamp', msg.getTimestamp())
console.log('msg type', msg.getType())
console.log('msg width', msg.getWidth())
console.log('msg forwarded', msg.isForwarded())
console.log('msg increation', msg.isIncreation())
console.log('msg is info', msg.isInfo())
console.log('msg is sent', msg.isSent())
console.log('msg is setupmessage', msg.isSetupmessage())
console.log('msg is starred', msg.isStarred())

console.log('msg latefiling mediasize')
msg.latefilingMediasize(10, 20, 30)
console.log('  after latefiling width', msg.getWidth())
console.log('  after latefiling height', msg.getHeight())
console.log('  after latefiling duration', msg.getDuration())

console.log('msg setting dimension')
msg.setDimension(100, 200)
console.log('  width after', msg.getWidth())
console.log('  height after', msg.getHeight())

console.log('msg setting duration')
msg.setDuration(314)
console.log('  duration after', msg.getDuration())

console.log('msg setting file data')
msg.setFile('notexisting.jpeg', 'image/jpeg')
console.log('  file after', msg.getFile())
console.log('  filemime after', msg.getFilemime())
console.log('  filename after', msg.getFilename())

console.log('msg set mediainfo')
msg.setMediainfo('deltaX', 'rules')

let mediainfo2 = msg.getMediainfo()
console.log('    mediainfo id', mediainfo2.getId())
console.log('    mediainfo state', mediainfo2.getState())
console.log('    mediainfo text1', mediainfo2.getText1())
console.log('    mediainfo text1 meaning', mediainfo2.getText1Meaning())
console.log('    mediainfo text2', mediainfo2.getText2())
console.log('    mediainfo timestamp', mediainfo2.getTimestamp())

console.log('msg set text')
msg.setText('NEW TEXT WOOOHOOO!!11oneone')
console.log('  msg text after', msg.getText())

console.log('msg set type')
msg.setType(40)
console.log('  msg type after', msg.getType())
msg.setType(40000)
console.log('  msg type after (2)', msg.getType())

let msg2 = dc.msgNew()
msg2.setText('created a new message')
console.log('msg2 text', msg2.getText())
console.log('msg2 id', msg2.getId())

msg2.setText('lets send it')
let msg2Id = dc.sendMsg(chat3Id, msg2)
console.log('msg2 id after sent', msg2Id)
console.log('msg2 state', msg2.getState())
*/
