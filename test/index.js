const DeltaChat = require('../')

const dc = new DeltaChat({
  email: 'FOO',
  password: 'FOO'
})

// TODO it would be nice if we could get some sort of event
// when we're 'ready' because right now we are blocked by
// the constructor

const rtn2 = dc.createContact('rtn2', 'rtn2@deltachat.de')
console.log('rtn2 id', rtn2)
const rtn3 = dc.createContact('rtn3', 'rtn3@deltachat.de')
console.log('rtn3 id', rtn3)

const chat2 = dc.createChatByContactId(rtn2)
console.log('rtn2 chat id', chat2)
const chat3 = dc.createChatByContactId(rtn3)
console.log('rtn3 chat id', chat3)

// Seems the group chats are not unique, so calling these
// lines below will create new groups each time
const group1 = dc.createGroupChat(0, 'AAA')
console.log('AAA id', group1)
const group2 = dc.createGroupChat(1, 'BBB')
console.log('BBB id', group2)

// TODO test dc.createChatByMsgId()

let chat = dc.getChat(chat2)
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
console.log('contact', contact)
console.log('contact addr', contact.getAddr())
console.log('contact display name', contact.getDisplayName())
console.log('contact first name', contact.getFirstName())
console.log('contact id', contact.getId())
console.log('contact name', contact.getName())
console.log('contact name & addr', contact.getNameNAddr())
console.log('contact is blocked', contact.isBlocked())
console.log('contact is verified', contact.isVerified())

let chatList = dc.getChatList(0, 'AAA')
console.log('chat list', chatList)
console.log('chat list chat id', chatList.getChatId(0))
console.log('chat list count', chatList.getCount())
console.log('chat list message id', chatList.getMsgId(0))

let lot = chatList.getSummary(0)
console.log('chat list summary', lot)
let lot2 = chatList.getSummary(0, chat)
console.log('chat list summary (speed up)', lot2)

console.log('lot id', lot.getId())
console.log('lot state', lot.getState())
console.log('lot text1', lot.getText1())
console.log('lot text1 meaning', lot.getText1Meaning())
console.log('lot text2', lot.getText2())
console.log('lot timestamp', lot.getTimestamp())

// Testing gc
//if (global.gc) {
  //chat = null
  //contact = null
  //chatList = null
  //lot2 = null
  //global.gc()
//}
