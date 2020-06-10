const DeltaChat = require('../dist/index').default
const test = require('tape')
const tempy = require('tempy')
const path = require('path')
const fs = require('fs')
const { EventId2EventName, C: c } = require('../dist/constants')

test('reverse lookup of events', t => {
  const eventKeys = Object.keys(EventId2EventName).map(k => Number(k))
  const eventValues = Object.values(EventId2EventName)
  const reverse = eventValues.map(v => c[v])
  t.same(reverse, eventKeys, 'reverse lookup ok')
  t.end()
})

test('event constants are consistent', t => {
  const eventKeys = Object.keys(c).filter(k => k.startsWith('DC_EVENT_')).sort()
  const eventValues = Object.values(EventId2EventName).sort()
  t.same(eventKeys, eventValues, 'identical')
  t.end()
})

test('static method maybeValidAddr()', t => {
  t.is(DeltaChat.maybeValidAddr(null), false)
  t.is(DeltaChat.maybeValidAddr(''), false)
  t.is(DeltaChat.maybeValidAddr('uuu'), false)
  t.is(DeltaChat.maybeValidAddr('dd.tt'), false)
  t.is(DeltaChat.maybeValidAddr('tt.dd@uu'), false)
  t.is(DeltaChat.maybeValidAddr('u@d'), false)
  t.is(DeltaChat.maybeValidAddr('u@d.'), false)
  t.is(DeltaChat.maybeValidAddr('u@d.t'), false)
  t.is(DeltaChat.maybeValidAddr('u@.tt'), false)
  t.is(DeltaChat.maybeValidAddr('@d.tt'), false)
  t.is(DeltaChat.maybeValidAddr('user@domain.tld'), true)
  t.is(DeltaChat.maybeValidAddr('u@d.tt'), true)
  t.end()
})

test('invalid input to configure throws', dc(async (t, dc) => {
  let configure_threw = false
  try {
    await dc.configure({ addr: 'delta1@delta.localhost' })
  } catch (err) {
    configure_threw = true
  }

  t.is(configure_threw, true, 'Threw error one')
  
  configure_threw = false
  try {
    await dc.configure({ mail_pw: 'delta1' })
  } catch (err) {
    configure_threw = true
  }

  t.is(configure_threw, true, 'Threw error two')

  t.end()
}))

test('dc.getInfo()', dc((t, dc) => {
  const info = dc.getInfo()
  t.same(Object.keys(info).sort(), [
    'arch',
    'bcc_self',
    'blobdir', 
    'configured_mvbox_folder', 
    'configured_sentbox_folder', 
    'database_dir', 
    'database_version', 
    'deltachat_core_version', 
    'display_name', 
    'e2ee_enabled', 
    'entered_account_settings', 
    'fingerprint', 
    'folders_configured', 
    'inbox_watch', 
    'is_configured', 
    'journal_mode', 
    'level', 
    'mdns_enabled', 
    'messages_in_contact_requests', 
    'mvbox_move', 
    'mvbox_watch', 
    'number_of_chat_messages', 
    'number_of_chats', 
    'number_of_contacts', 
    'private_key_count', 
    'public_key_count', 
    'selfavatar', 
    'sentbox_watch', 
    'sqlite_version', 
    'uptime', 
    'used_account_settings'
  ])

  t.is(Object.values(info).every(v => {
    return typeof v === 'string'
  }), true, 'all values are strings')
  // t.is(info.fingerprint, '<Not yet calculated>', 'fingerprint')

  t.end()
}))

test('static getSystemInfo()', t => {
  const info = DeltaChat.getSystemInfo()
  t.same(Object.keys(info).sort(), [
    'arch',
    'deltachat_core_version',
    'sqlite_version'
  ])
  t.is(Object.values(info).every(v => {
    return typeof v === 'string'
  }), true, 'all values are strings')
  t.end()
})

test('basic configuration', dc((t, dc, cwd) => {
  t.is(dc.getConfig('e2ee_enabled'), '1', 'e2eeEnabled correct')
  t.is(
    dc.getBlobdir(),
    path.join(cwd, 'db.sqlite-blobs'),
    'correct blobdir'
  )
  t.end()
}))

test('create chat from contact and Chat methods', dc((t, dc) => {
  const contactId = dc.createContact('aaa', 'aaa@site.org')

  t.is(dc.lookupContactIdByAddr('aaa@site.org'), true)
  t.is(dc.lookupContactIdByAddr('nope@site.net'), false)

  let chatId = dc.createChatByContactId(contactId)
  let chat = dc.getChat(chatId)

  t.is(chat.getArchived(), 0, 'not archived')
  t.is(chat.getId(), chatId, 'chat id matches')
  t.is(chat.getName(), 'aaa', 'chat name matches')
  t.is(chat.getProfileImage(), null, 'no profile image')
  t.is(chat.getType(), c.DC_CHAT_TYPE_SINGLE, 'single chat')
  t.is(chat.isSelfTalk(), false, 'no self talk')
  // TODO make sure this is really the case!
  t.is(chat.isUnpromoted(), false, 'not unpromoted')
  t.is(chat.isVerified(), false, 'not verified')
  t.is(typeof chat.getColor(), 'number', 'color is a number')

  t.is(dc.getDraft(chatId), null, 'no draft message')
  dc.setDraft(chatId, dc.messageNew().setText('w00t!'))
  t.is(dc.getDraft(chatId).toJson().text, 'w00t!', 'draft text correct')
  dc.setDraft(chatId, null)
  t.is(dc.getDraft(chatId), null, 'draft removed')

  t.is(dc.getChatIdByContactId(contactId), chatId)
  t.same(dc.getChatContacts(chatId), [contactId])

  dc.archiveChat(chatId, true)
  t.is(dc.getChat(chatId).getArchived(), 1, 'chat archived')
  dc.archiveChat(chatId, false)
  t.is(dc.getChat(chatId).getArchived(), 0, 'chat unarchived')

  chatId = dc.createUnverifiedGroupChat('unverified group')
  chat = dc.getChat(chatId)
  t.is(chat.isVerified(), false, 'is not verified')
  t.is(chat.getType(), c.DC_CHAT_TYPE_GROUP, 'group chat')
  t.same(dc.getChatContacts(chatId), [c.DC_CONTACT_ID_SELF])

  const draft2 = dc.getDraft(chatId)
  t.ok(draft2, 'unverified group has a draft by default')
  const draftJson = draft2.toJson()
  t.ok(
    draftJson.text.startsWith(
      'Hello, I\'ve just created the group'
    ),
    'default text'
  )

  dc.setChatName(chatId, 'NEW NAME')
  t.is(dc.getChat(chatId).getName(), 'NEW NAME', 'name updated')

  chatId = dc.createVerifiedGroupChat('a verified group')
  chat = dc.getChat(chatId)
  t.is(chat.isVerified(), true, 'is verified')
  t.is(chat.getType(), c.DC_CHAT_TYPE_VERIFIED_GROUP, 'verified group chat')

  t.end()
}))

test('test setting profile image', dc((t, dc) => {
  const chatId = dc.createUnverifiedGroupChat('testing profile image group')
  const image = 'image.jpeg'
  const imagePath = path.join(__dirname, 'fixtures', image)
  const blobs = dc.getBlobdir()

  dc.setChatProfileImage(chatId, imagePath)
  const blobPath = dc.getChat(chatId).getProfileImage()
  t.is(blobPath.startsWith(blobs), true)
  t.is(blobPath.endsWith(image), true)

  dc.setChatProfileImage(chatId)
  t.same(
    dc.getChat(chatId).getProfileImage(),
    null,
    'image is null'
  )

  t.end()
}))

test('create and delete chat', dc((t, dc) => {
  const chatId = dc.createUnverifiedGroupChat('GROUPCHAT')
  const chat = dc.getChat(chatId)
  t.is(chat.getId(), chatId, 'correct chatId')
  dc.deleteChat(chat.getId())
  t.same(dc.getChat(chatId), null, 'chat removed')
  t.end()
}))

test('new message and Message methods', dc((t, dc) => {
  const text = 'w00t!'
  const msg = dc.messageNew().setText(text)

  t.is(msg.getChatId(), 0, 'chat id 0 before sent')
  t.is(msg.getDuration(), 0, 'duration 0 before sent')
  t.is(msg.getFile(), '', 'no file set by default')
  t.is(msg.getFilebytes(), 0, 'and file bytes is 0')
  t.is(msg.getFilemime(), '', 'no filemime by default')
  t.is(msg.getFilename(), '', 'no filename set by default')
  t.is(msg.getFromId(), 0, 'no contact id set by default')
  t.is(msg.getHeight(), 0, 'plain text message have height 0')
  t.is(msg.getId(), 0, 'id 0 before sent')
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

  const summary = msg.getSummary()
  t.is(summary.getId(), 0, 'no summary id')
  t.is(summary.getState(), 0, 'no summary state')
  t.is(summary.getText1(), null, 'no summary text1')
  t.is(summary.getText1Meaning(), 0, 'no summary text1 meaning')
  t.is(summary.getText2(), null, 'no summary text2')
  t.is(summary.getTimestamp(), 0, 'no summary timestamp')

  t.is(msg.getSummarytext(), text, 'summary text is text')
  t.is(msg.getText(), text, 'msg text set correctly')
  t.is(msg.getTimestamp(), 0, 'no timestamp')

  const viewType = msg.getViewType()
  t.is(viewType.isText(), true)
  t.is(viewType.isImage(), false)
  t.is(viewType.isGif(), false)
  t.is(viewType.isAudio(), false)
  t.is(viewType.isVoice(), false)
  t.is(viewType.isVideo(), false)
  t.is(viewType.isFile(), false)

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

  const logo = path.join(__dirname, 'fixtures', 'logo.png')
  const stat = fs.statSync(logo)
  msg.setFile(logo)
  t.is(msg.getFilebytes(), stat.size, 'correct file size')
  t.is(msg.getFile(), logo, 'correct file name')
  t.is(msg.getFilemime(), 'image/png', 'mime set implicitly')
  msg.setFile(logo, 'image/gif')
  t.is(msg.getFilemime(), 'image/gif', 'mime set (in)correctly')
  msg.setFile(logo, 'image/png')
  t.is(msg.getFilemime(), 'image/png', 'mime set correctly')

  const json = msg.toJson()
  t.notEqual(json, null, 'not null')
  t.is(typeof json, 'object', 'json object')

  t.end()
}))

test('Contact methods', dc((t, dc) => {
  const contactId = dc.createContact('First Last', 'first.last@site.org')
  const contact = dc.getContact(contactId)

  t.is(contact.getAddress(), 'first.last@site.org', 'correct address')
  t.is(typeof contact.getColor(), 'number', 'color is a number')
  t.is(contact.getDisplayName(), 'First Last', 'correct display name')
  t.is(contact.getFirstName(), 'First', 'correct first name')
  t.is(contact.getId(), contactId, 'contact id matches')
  t.is(contact.getName(), 'First Last', 'correct name')
  t.is(contact.getNameAndAddress(), 'First Last (first.last@site.org)')
  t.is(contact.getProfileImage(), null, 'no contact image')
  t.is(contact.isBlocked(), false, 'not blocked')
  t.is(contact.isVerified(), false, 'unverified status')

  t.end()
}))

test('create contacts from address book', dc((t, dc) => {
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
}))

test('delete contacts', dc((t, dc) => {
  const id = dc.createContact('someuser', 'someuser@site.com')
  const contact = dc.getContact(id)
  t.is(contact.getId(), id, 'contact id matches')
  t.is(dc.deleteContact(id), true, 'delete call succesful')
  t.is(dc.getContact(id), null, 'contact is gone')
  t.end()
}))

test('adding and removing a contact from a chat', dc((t, dc) => {
  const chatId = dc.createUnverifiedGroupChat('adding_and_removing')
  const contactId = dc.createContact('Add Remove', 'add.remove@site.com')
  t.is(dc.addContactToChat(chatId, contactId), true, 'contact added')
  t.is(dc.isContactInChat(chatId, contactId), true, 'contact in chat')
  t.is(dc.removeContactFromChat(chatId, contactId), true, 'contact removed')
  t.is(dc.isContactInChat(chatId, contactId), false, 'contact not in chat')
  t.end()
}))

test('blocking contacts', dc((t, dc) => {
  const id = dc.createContact('badcontact', 'bad@site.com')

  t.is(dc.getBlockedCount(), 0)
  t.same(dc.getContact(id).isBlocked(), false)
  t.same(dc.getBlockedContacts(), [])

  dc.blockContact(id, true)
  t.is(dc.getBlockedCount(), 1)
  t.same(dc.getContact(id).isBlocked(), true)
  t.same(dc.getBlockedContacts(), [id])

  dc.blockContact(id, false)
  t.is(dc.getBlockedCount(), 0)
  t.same(dc.getContact(id).isBlocked(), false)
  t.same(dc.getBlockedContacts(), [])

  t.end()
}))

test('ChatList methods', dc((t, dc) => {
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

  const lot = chatList.getSummary(0)
  t.is(lot.getId(), 0, 'lot has no id')
  t.is(lot.getState(), c.DC_STATE_OUT_DRAFT, 'correct state')
  t.is(lot.getText1(), 'Draft', 'text1 is set')
  t.is(lot.getText1Meaning(), c.DC_TEXT1_DRAFT, 'text1 meaning')
  t.ok(
    lot.getText2().startsWith('Hello, I\'ve just created'),
    'new group draft message'
  )
  t.ok(lot.getTimestamp() > 0, 'timestamp set')

  const text = 'Custom new group message, yo!'
  dc.setStockTranslation(c.DC_STR_NEWGROUPDRAFT, text)
  dc.createUnverifiedGroupChat('groupchat1111')
  chatList = dc.getChatList(0, 'groupchat1111')
  t.is(
    chatList.getSummary(0).getText2(), text,
    'custom new group message'
  )

  dc.archiveChat(ids[0], true)
  chatList = dc.getChatList(c.DC_GCL_ARCHIVED_ONLY, 'groupchat1')
  t.is(chatList.getCount(), 1, 'only one archived')

  t.end()
}))

test('Device Chat', dc((t, dc) => {
  const deviceChatMessageText = 'test234'

  t.is(dc.getChatList(0).getCount(), 0, 'no device chat after setup')

  dc.addDeviceMessage('test', deviceChatMessageText)

  const chatList = dc.getChatList(0)
  t.is(chatList.getCount(), 1, 'device chat after adding device msg')
  const deviceChatId = chatList.getChatId(0)
  const deviceChat = dc.getChat(deviceChatId)
  t.is(deviceChat.isDeviceTalk(), true, 'device chat is device chat')
  t.is(deviceChat.toJson().isDeviceTalk, true, 'toJson contains isDeviceTalk key')

  const deviceChatMessages = dc.getChatMessages(deviceChatId, 0, 0)
  t.is(deviceChatMessages.length, 1, 'device chat has added message')

  const deviceChatMessage = dc.getMessage(deviceChatMessages[0])
  t.is(deviceChatMessage.getText(), deviceChatMessageText, 'device chat message has the inserted text')

  t.end()
}))

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

    t.is(dc.isOpen(), false, 'context database is not open')
    dc.on('ALL', console.log)

    await dc.open(cwd)

    t.is(dc.isOpen(), true, 'context database is open')
    t.is(dc.isConfigured(), false, 'should not be configured')
    fn(t, dc, cwd)
  }
}

test('dc.getProviderFromEmail("example@example.com")', t => {
  const provider = DeltaChat.getProviderFromEmail('example@example.com')

  t.same(provider, {
    before_login_hint: 'Hush this provider doesn\'t exist!',
    overview_page: 'https://providers.delta.chat/example-com',
    status: 3
  })

  t.end()
})

test('dc.getProviderFromEmail("example@example.com")', dc((t, dc) => {
  dc.joinSecurejoin('test', (chatId) => {
    t.is(chatId, 0, 'chatId should be zero as we didn\'t pass a valid qrString')
    t.end()
  })
}))
