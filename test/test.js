// @ts-check
import DeltaChat from '../dist'
import tempy from 'tempy'

import { strictEqual } from 'assert'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { EventId2EventName, C } from '../dist/constants'
import { join } from 'path'
import { statSync } from 'fs'
chai.use(chaiAsPromised)

describe('static tests', function () {
  it('reverse lookup of events', function () {
    const eventKeys = Object.keys(EventId2EventName).map((k) => Number(k))
    const eventValues = Object.values(EventId2EventName)
    const reverse = eventValues.map((v) => C[v])
    expect(reverse).to.be.deep.equal(eventKeys)
  })

  it('event constants are consistent', function () {
    const eventKeys = Object.keys(C)
      .filter((k) => k.startsWith('DC_EVENT_'))
      .sort()
    const eventValues = Object.values(EventId2EventName).sort()
    expect(eventKeys).to.be.deep.equal(eventValues)
  })

  it('static method maybeValidAddr()', function () {
    expect(DeltaChat.maybeValidAddr(null)).to.equal(false)
    expect(DeltaChat.maybeValidAddr('')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('uuu')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('dd.tt')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('tt.dd@uu')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('u@d')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('u@d.')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('u@d.t')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('u@.tt')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('@d.tt')).to.equal(false)
    expect(DeltaChat.maybeValidAddr('user@domain.tld')).to.equal(true)
    expect(DeltaChat.maybeValidAddr('u@d.tt')).to.equal(true)
  })

  it('static getSystemInfo()', function () {
    const info = DeltaChat.getSystemInfo()
    expect(info).to.contain.keys([
      'arch',
      'deltachat_core_version',
      'sqlite_version',
    ])
  })

  it('static dc.getProviderFromEmail("example@example.com")', function () {
    const provider = DeltaChat.getProviderFromEmail('example@example.com')

    expect(provider).to.deep.equal({
      before_login_hint: "Hush this provider doesn't exist!",
      overview_page: 'https://providers.delta.chat/example-com',
      status: 3,
    })
  })
})

describe('Basic offline Tests', function () {
  it('opens a context', async function () {
    const dc = new DeltaChat()
    await dc.open(tempy.directory())
    strictEqual(dc.isConfigured(), false)
    dc.close()
  })

  it('set config', async function () {
    const dc = new DeltaChat()
    await dc.open(tempy.directory())

    dc.setConfig('bot', true)
    strictEqual(dc.getConfig('bot'), '1')
    dc.setConfig('bot', false)
    strictEqual(dc.getConfig('bot'), '0')
    dc.setConfig('bot', '1')
    strictEqual(dc.getConfig('bot'), '1')
    dc.setConfig('bot', '0')
    strictEqual(dc.getConfig('bot'), '0')
    dc.setConfig('bot', 1)
    strictEqual(dc.getConfig('bot'), '1')
    dc.setConfig('bot', 0)
    strictEqual(dc.getConfig('bot'), '0')

    dc.setConfig('bot', null)
    strictEqual(dc.getConfig('bot'), '')

    strictEqual(
      dc.getConfig('selfstatus'),
      'Sent with my Delta Chat Messenger: https://delta.chat'
    )
    dc.setConfig('selfstatus', 'hello')
    strictEqual(dc.getConfig('selfstatus'), 'hello')
    dc.setConfig('selfstatus', '')
    strictEqual(dc.getConfig('selfstatus'), '')
    dc.setConfig('selfstatus', null)
    strictEqual(
      dc.getConfig('selfstatus'),
      'Sent with my Delta Chat Messenger: https://delta.chat'
    )

    dc.close()
  })

  it('configure with either missing addr or missing mail_pw throws', async function () {
    const dc = new DeltaChat()
    await dc.open(tempy.directory())

    await expect(
      dc.configure({ addr: 'delta1@delta.localhost' })
    ).to.eventually.be.rejectedWith('Please enter a password.')
    await expect(dc.configure({ mailPw: 'delta1' })).to.eventually.be.rejected

    dc.close()
  })

  it('dc.getInfo()', async function () {
    const dc = new DeltaChat()
    await dc.open(tempy.directory())

    const info = await dc.getInfo()
    expect(typeof info).to.be.equal('object')
    expect(info).to.contain.keys([
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
      'used_account_settings',
    ])

    dc.close()
  })
})

describe('Offline Tests with unconfigured account', function () {
  /** @type {DeltaChat} */
  let dc = null
  let directory = ''

  this.beforeEach(async function () {
    dc = new DeltaChat()
    directory = tempy.directory()
    await dc.open(directory)
  })

  this.afterEach(async function () {
    if (dc) {
      try {
        dc.close()
        dc = null
      } catch (error) {
        console.error(error)
      }
    }
    directory = ''
  })

  it('calling a method without an open context should fail with an error', async function () {
    dc.close()
    await expect(() => dc.getConfig('addr')).to.throw(
      'Provided dc_context is null, did you close the context or not open it?',
      'Call to dc method after context got unrefed failed'
    )

    // Yeyy no segmentation fault :)
    dc = null
  })

  it('invalid dc.joinSecurejoin', async function () {
    expect(dc.joinSecurejoin('test')).to.be.eventually.rejected
  })

  it('Device Chat', async function () {
    const deviceChatMessageText = 'test234'

    expect((await dc.getChatList(0, '', null)).getCount()).to.equal(
      0,
      'no device chat after setup'
    )

    await dc.addDeviceMessage('test', deviceChatMessageText)

    const chatList = await dc.getChatList(0, '', null)
    expect(chatList.getCount()).to.equal(
      1,
      'device chat after adding device msg'
    )

    const deviceChatId = await chatList.getChatId(0)
    const deviceChat = await dc.getChat(deviceChatId)
    expect(deviceChat.isDeviceTalk()).to.be.true
    expect(deviceChat.toJson().isDeviceTalk).to.be.true

    const deviceChatMessages = await dc.getChatMessages(deviceChatId, 0, 0)
    expect(deviceChatMessages.length).to.be.equal(
      1,
      'device chat has added message'
    )

    const deviceChatMessage = await dc.getMessage(deviceChatMessages[0])
    expect(deviceChatMessage.getText()).to.equal(
      deviceChatMessageText,
      'device chat message has the inserted text'
    )
  })

  it('should have e2ee enabled and right blobdir', function () {
    expect(dc.getConfig('e2ee_enabled')).to.equal('1', 'e2eeEnabled correct')
    expect(dc.getBlobdir()).to.equal(
      join(directory, 'db.sqlite-blobs'),
      'correct blobdir'
    )
  })

  it('should create chat from contact and Chat methods', async function () {
    const contactId = dc.createContact('aaa', 'aaa@site.org')

    strictEqual(dc.lookupContactIdByAddr('aaa@site.org'), contactId)
    strictEqual(dc.lookupContactIdByAddr('nope@site.net'), 0)

    let chatId = dc.createChatByContactId(contactId)
    let chat = dc.getChat(chatId)

    strictEqual(
      chat.getVisibility(),
      C.DC_CHAT_VISIBILITY_NORMAL,
      'not archived'
    )
    strictEqual(chat.getId(), chatId, 'chat id matches')
    strictEqual(chat.getName(), 'aaa', 'chat name matches')
    strictEqual(chat.getProfileImage(), null, 'no profile image')
    strictEqual(chat.getType(), C.DC_CHAT_TYPE_SINGLE, 'single chat')
    strictEqual(chat.isSelfTalk(), false, 'no self talk')
    // TODO make sure this is really the case!
    strictEqual(chat.isUnpromoted(), false, 'not unpromoted')
    strictEqual(chat.isProtected(), false, 'not verified')
    strictEqual(typeof chat.color, 'string', 'color is a string')

    strictEqual(dc.getDraft(chatId), null, 'no draft message')
    dc.setDraft(chatId, dc.messageNew().setText('w00t!'))
    strictEqual(
      dc.getDraft(chatId).toJson().text,
      'w00t!',
      'draft text correct'
    )
    dc.setDraft(chatId, null)
    strictEqual(dc.getDraft(chatId), null, 'draft removed')

    strictEqual(dc.getChatIdByContactId(contactId), chatId)
    expect(dc.getChatContacts(chatId)).to.deep.equal([contactId])

    dc.setChatVisibility(chatId, C.DC_CHAT_VISIBILITY_ARCHIVED)
    strictEqual(
      dc.getChat(chatId).getVisibility(),
      C.DC_CHAT_VISIBILITY_ARCHIVED,
      'chat archived'
    )
    dc.setChatVisibility(chatId, C.DC_CHAT_VISIBILITY_NORMAL)
    strictEqual(
      chat.getVisibility(),
      C.DC_CHAT_VISIBILITY_NORMAL,
      'chat unarchived'
    )

    chatId = dc.createGroupChat('unverified group', false)
    chat = dc.getChat(chatId)
    strictEqual(chat.isProtected(), false, 'is not verified')
    strictEqual(chat.getType(), C.DC_CHAT_TYPE_GROUP, 'group chat')
    expect(dc.getChatContacts(chatId)).to.deep.equal([C.DC_CONTACT_ID_SELF])

    const draft2 = dc.getDraft(chatId)
    expect(draft2, 'unptomoted group has a draft by default')
    const draftJson = draft2.toJson()
    expect(
      draftJson.text.startsWith("Hello, I've just created the group"),
      'default text'
    ).to.be.true

    dc.setChatName(chatId, 'NEW NAME')
    strictEqual(dc.getChat(chatId).getName(), 'NEW NAME', 'name updated')

    chatId = dc.createGroupChat('a verified group', true)
    chat = dc.getChat(chatId)
    strictEqual(chat.isProtected(), true, 'is verified')
  })

  it('test setting profile image', async function () {
    const chatId = dc.createGroupChat('testing profile image group', false)
    const image = 'image.jpeg'
    const imagePath = join(__dirname, 'fixtures', image)
    const blobs = dc.getBlobdir()

    dc.setChatProfileImage(chatId, imagePath)
    const blobPath = dc.getChat(chatId).getProfileImage()
    expect(blobPath.startsWith(blobs)).to.be.true
    expect(blobPath.endsWith(image)).to.be.true

    dc.setChatProfileImage(chatId, null)
    expect(dc.getChat(chatId).getProfileImage()).to.be.equal(
      null,
      'image is null'
    )
  })

  it('test setting ephemeral timer', function () {
    const chatId = dc.createGroupChat('testing ephemeral timer')

    strictEqual(
      dc.getChatEphemeralTimer(chatId),
      0,
      'ephemeral timer is not set by default'
    )

    dc.setChatEphemeralTimer(chatId, 60)
    strictEqual(
      dc.getChatEphemeralTimer(chatId),
      60,
      'ephemeral timer is set to 1 minute'
    )

    dc.setChatEphemeralTimer(chatId, 0)
    strictEqual(dc.getChatEphemeralTimer(chatId), 0, 'ephemeral timer is reset')
  })

  it('should create and delete chat', function () {
    const chatId = dc.createGroupChat('GROUPCHAT')
    const chat = dc.getChat(chatId)
    strictEqual(chat.getId(), chatId, 'correct chatId')
    dc.deleteChat(chat.getId())
    strictEqual(dc.getChat(chatId), null, 'chat removed')
  })

  it('new message and Message methods', function () {
    const text = 'w00t!'
    const msg = dc.messageNew().setText(text)

    strictEqual(msg.getChatId(), 0, 'chat id 0 before sent')
    strictEqual(msg.getDuration(), 0, 'duration 0 before sent')
    strictEqual(msg.getFile(), '', 'no file set by default')
    strictEqual(msg.getFilebytes(), 0, 'and file bytes is 0')
    strictEqual(msg.getFilemime(), '', 'no filemime by default')
    strictEqual(msg.getFilename(), '', 'no filename set by default')
    strictEqual(msg.getFromId(), 0, 'no contact id set by default')
    strictEqual(msg.getHeight(), 0, 'plain text message have height 0')
    strictEqual(msg.getId(), 0, 'id 0 before sent')
    strictEqual(msg.getSetupcodebegin(), '', 'no setupcode begin')
    strictEqual(msg.getShowpadlock(), false, 'no padlock by default')

    const state = msg.getState()
    strictEqual(state.isUndefined(), true, 'no state by default')
    strictEqual(state.isFresh(), false, 'no state by default')
    strictEqual(state.isNoticed(), false, 'no state by default')
    strictEqual(state.isSeen(), false, 'no state by default')
    strictEqual(state.isPending(), false, 'no state by default')
    strictEqual(state.isFailed(), false, 'no state by default')
    strictEqual(state.isDelivered(), false, 'no state by default')
    strictEqual(state.isReceived(), false, 'no state by default')

    const summary = msg.getSummary()
    strictEqual(summary.getId(), 0, 'no summary id')
    strictEqual(summary.getState(), 0, 'no summary state')
    strictEqual(summary.getText1(), null, 'no summary text1')
    strictEqual(summary.getText1Meaning(), 0, 'no summary text1 meaning')
    strictEqual(summary.getText2(), null, 'no summary text2')
    strictEqual(summary.getTimestamp(), 0, 'no summary timestamp')

    strictEqual(msg.getSummarytext(50), text, 'summary text is text')
    strictEqual(msg.getText(), text, 'msg text set correctly')
    strictEqual(msg.getTimestamp(), 0, 'no timestamp')

    const viewType = msg.getViewType()
    strictEqual(viewType.isText(), true)
    strictEqual(viewType.isImage(), false)
    strictEqual(viewType.isGif(), false)
    strictEqual(viewType.isAudio(), false)
    strictEqual(viewType.isVoice(), false)
    strictEqual(viewType.isVideo(), false)
    strictEqual(viewType.isFile(), false)

    strictEqual(msg.getWidth(), 0, 'no message width')
    strictEqual(msg.isDeadDrop(), false, 'not deaddrop')
    strictEqual(msg.isForwarded(), false, 'not forwarded')
    strictEqual(msg.isIncreation(), false, 'not in creation')
    strictEqual(msg.isInfo(), false, 'not an info message')
    strictEqual(msg.isSent(), false, 'messge is not sent')
    strictEqual(msg.isSetupmessage(), false, 'not an autocrypt setup message')

    msg.latefilingMediasize(10, 20, 30)
    strictEqual(msg.getWidth(), 10, 'message width set correctly')
    strictEqual(msg.getHeight(), 20, 'message height set correctly')
    strictEqual(msg.getDuration(), 30, 'message duration set correctly')

    msg.setDimension(100, 200)
    strictEqual(msg.getWidth(), 100, 'message width set correctly')
    strictEqual(msg.getHeight(), 200, 'message height set correctly')

    msg.setDuration(314)
    strictEqual(msg.getDuration(), 314, 'message duration set correctly')

    expect(() => {
      msg.setFile(null)
    }).to.throw('Missing filename')

    const logo = join(__dirname, 'fixtures', 'logo.png')
    const stat = statSync(logo)
    msg.setFile(logo)
    strictEqual(msg.getFilebytes(), stat.size, 'correct file size')
    strictEqual(msg.getFile(), logo, 'correct file name')
    strictEqual(msg.getFilemime(), 'image/png', 'mime set implicitly')
    msg.setFile(logo, 'image/gif')
    strictEqual(msg.getFilemime(), 'image/gif', 'mime set (in)correctly')
    msg.setFile(logo, 'image/png')
    strictEqual(msg.getFilemime(), 'image/png', 'mime set correctly')

    const json = msg.toJson()
    expect(json).to.not.equal(null, 'not null')
    strictEqual(typeof json, 'object', 'json object')
  })

  it('Contact methods', function () {
    const contactId = dc.createContact('First Last', 'first.last@site.org')
    const contact = dc.getContact(contactId)

    strictEqual(contact.getAddress(), 'first.last@site.org', 'correct address')
    strictEqual(typeof contact.color, 'string', 'color is a string')
    strictEqual(contact.getDisplayName(), 'First Last', 'correct display name')
    strictEqual(contact.getId(), contactId, 'contact id matches')
    strictEqual(contact.getName(), 'First Last', 'correct name')
    strictEqual(contact.getNameAndAddress(), 'First Last (first.last@site.org)')
    strictEqual(contact.getProfileImage(), null, 'no contact image')
    strictEqual(contact.isBlocked(), false, 'not blocked')
    strictEqual(contact.isVerified(), false, 'unverified status')
  })

  it('create contacts from address book', function () {
    const addresses = [
      'Name One',
      'name1@site.org',
      'Name Two',
      'name2@site.org',
      'Name Three',
      'name3@site.org',
    ]
    const count = dc.addAddressBook(addresses.join('\n'))
    strictEqual(count, addresses.length / 2)
    dc.getContacts(0, 'Name ')
      .map((id) => dc.getContact(id))
      .forEach((contact) => {
        expect(contact.getName().startsWith('Name ')).to.be.true
      })
  })

  it('delete contacts', function () {
    const id = dc.createContact('someuser', 'someuser@site.com')
    const contact = dc.getContact(id)
    strictEqual(contact.getId(), id, 'contact id matches')
    strictEqual(dc.deleteContact(id), true, 'delete call succesful')
    strictEqual(dc.getContact(id), null, 'contact is gone')
  })

  it('adding and removing a contact from a chat', function () {
    const chatId = dc.createGroupChat('adding_and_removing')
    const contactId = dc.createContact('Add Remove', 'add.remove@site.com')
    strictEqual(dc.addContactToChat(chatId, contactId), true, 'contact added')
    strictEqual(dc.isContactInChat(chatId, contactId), true, 'contact in chat')
    strictEqual(
      dc.removeContactFromChat(chatId, contactId),
      true,
      'contact removed'
    )
    strictEqual(
      dc.isContactInChat(chatId, contactId),
      false,
      'contact not in chat'
    )
  })

  it('blocking contacts', function () {
    const id = dc.createContact('badcontact', 'bad@site.com')

    strictEqual(dc.getBlockedCount(), 0)
    strictEqual(dc.getContact(id).isBlocked(), false)
    expect(dc.getBlockedContacts()).to.be.empty

    dc.blockContact(id, true)
    strictEqual(dc.getBlockedCount(), 1)
    strictEqual(dc.getContact(id).isBlocked(), true)
    expect(dc.getBlockedContacts()).to.deep.equal([id])

    dc.blockContact(id, false)
    strictEqual(dc.getBlockedCount(), 0)
    strictEqual(dc.getContact(id).isBlocked(), false)
    expect(dc.getBlockedContacts()).to.be.empty
  })

  it('ChatList methods', function () {
    const ids = [
      dc.createGroupChat('groupchat1'),
      dc.createGroupChat('groupchat11'),
      dc.createGroupChat('groupchat111'),
    ]

    let chatList = dc.getChatList(0, 'groupchat1', null)
    strictEqual(chatList.getCount(), 3, 'should contain above chats')
    expect(ids.indexOf(chatList.getChatId(0))).not.to.equal(-1)
    expect(ids.indexOf(chatList.getChatId(1))).not.to.equal(-1)
    expect(ids.indexOf(chatList.getChatId(2))).not.to.equal(-1)

    const lot = chatList.getSummary(0)
    strictEqual(lot.getId(), 0, 'lot has no id')
    strictEqual(lot.getState(), C.DC_STATE_OUT_DRAFT, 'correct state')
    strictEqual(lot.getText1(), 'Draft', 'text1 is set')
    strictEqual(lot.getText1Meaning(), C.DC_TEXT1_DRAFT, 'text1 meaning')
    expect(
      lot.getText2().startsWith("Hello, I've just created"),
      'new group draft message'
    ).to.be.true
    expect(lot.getTimestamp() > 0, 'timestamp set').to.be.true

    const text = 'Custom new group message, yo!'
    dc.setStockTranslation(C.DC_STR_NEWGROUPDRAFT, text)
    dc.createGroupChat('groupchat1111')
    chatList = dc.getChatList(0, 'groupchat1111', null)
    strictEqual(
      chatList.getSummary(0).getText2(),
      text,
      'custom new group message'
    )

    dc.setChatVisibility(ids[0], C.DC_CHAT_VISIBILITY_ARCHIVED)
    chatList = dc.getChatList(C.DC_GCL_ARCHIVED_ONLY, 'groupchat1', null)
    strictEqual(chatList.getCount(), 1, 'only one archived')
  })
})

describe('Integration tests', function () {
  this.timeout(60 * 1000) // increase timeout to 1min
  /** @type {DeltaChat} */
  let dc = null
  let dc2 = null
  let directory = ''
  let account = null

  this.beforeEach(async function () {
    dc = new DeltaChat()
    directory = tempy.directory()
    await dc.open(directory)
  })

  this.afterEach(async function () {
    if (dc) {
      try {
        try {
          dc.stopIO()
          dc2.stopIO()
        } catch (_e) {}
        dc.close()
        dc = null
        if (dc2) {
          try {
            dc2.close()
          } catch (_e) {}
          dc2 = null
        }
      } catch (error) {
        console.error(error)
      }
    }
    directory = ''
  })

  this.beforeAll(async function () {
    if (!process.env.DCC_NEW_TMP_EMAIL) {
      console.log(
        'Missing DCC_NEW_TMP_EMAIL environment variable!, skip intergration tests'
      )
      this.skip()
    }

    account = await DeltaChat.createTempUser(process.env.DCC_NEW_TMP_EMAIL)
    if (!account || !account.email || !account.password) {
      console.log(
        "We didn't got back an account from the api, skip intergration tests"
      )
      this.skip()
    }
  })

  // TODO 1. to 4. below would cover dc.open() completely
  // 1. test dc.open() where mkdirp fails (e.g. with no permissions)
  // 2. test failing dc._open() (what would make it fail in core?)
  // 3. test setting up context with e2ee_enabled set to false + close
  // 4. test opening an already configured account (re-open above)

  it('test dc.open() where mkdirp fails (e.g. with no permissions)')

  it('test failing dc._open() (what would make it fail in core?)')

  it('test setting up context with e2ee_enabled set to false + close')

  it('test opening an already configured account (re-open above)')

  it('configure', async function () {
    strictEqual(dc.isConfigured(), false, 'should not be configured')

    // Not sure what's the best way to check the events
    // TODO: check the events

    // dc.once('DC_EVENT_CONFIGURE_PROGRESS', (data) => {
    //   t.pass('DC_EVENT_CONFIGURE_PROGRESS called at least once')
    // })
    // dc.on('DC_EVENT_ERROR', (error) => {
    //   console.error('DC_EVENT_ERROR', error)
    // })
    // dc.on('DC_EVENT_ERROR_NETWORK', (first, error) => {
    //   console.error('DC_EVENT_ERROR_NETWORK', error)
    // })

    // dc.on('ALL', (event, data1, data2) => console.log('ALL', event, data1, data2))

    await expect(
      dc.configure({
        addr: account.email,
        mail_pw: account.password,

        displayname: 'Delta One',
        selfstatus: 'From Delta One with <3',
        selfavatar: join(__dirname, 'fixtures', 'avatar.png'),
      })
    ).to.be.eventually.fulfilled

    strictEqual(dc.getConfig('addr'), account.email, 'addr correct')
    strictEqual(dc.getConfig('displayname'), 'Delta One', 'displayName correct')
    strictEqual(
      dc.getConfig('selfstatus'),
      'From Delta One with <3',
      'selfStatus correct'
    )
    strictEqual(
      dc.getConfig('selfavatar'),
      join(directory, 'db.sqlite-blobs', 'avatar.png'),
      'selfavatar correct'
    )
    strictEqual(dc.getConfig('e2ee_enabled'), '1', 'e2ee_enabled correct')
    strictEqual(dc.getConfig('inbox_watch'), '1', 'inbox_watch')
    strictEqual(dc.getConfig('sentbox_watch'), '0', 'sentbox_watch')
    strictEqual(dc.getConfig('mvbox_watch'), '0', 'mvbox_watch')
    strictEqual(dc.getConfig('mvbox_move'), '0', 'mvbox_move')
    strictEqual(
      dc.getConfig('save_mime_headers'),
      '',
      'save_mime_headers correct'
    )
    strictEqual(
      dc.getBlobdir(),
      join(directory, 'db.sqlite-blobs'),
      'correct blobdir'
    )
    strictEqual(dc.isConfigured(), true, 'is configured')

    // whole re-configure to only change displayname: what the heck? (copied this from the old test)
    await expect(
      dc.configure({
        addr: account.email,
        mail_pw: account.password,
        displayname: 'Delta Two',
        selfstatus: 'From Delta One with <3',
        selfavatar: join(__dirname, 'fixtures', 'avatar.png'),
      })
    ).to.be.eventually.fulfilled
    strictEqual(
      dc.getConfig('displayname'),
      'Delta Two',
      'updated displayName correct'
    )
  })

  // TODO send text message to chat, check message count and delivered status etc
  it('send text message to chat, check message count and delivered status etc')

  // TODO test dc.createChatByMsgId()
  it('test deaddrop: dc.createChatByMsgId()')

  it('Autocrypt setup - key transfer', async function () {
    // Spawn a second dc instance with same account
    // dc.on('ALL', (event, data1, data2) =>
    //   console.log('FIRST ', event, data1, data2)
    // )
    await expect(
      dc.configure({
        addr: account.email,
        mail_pw: account.password,

        displayname: 'Delta One',
        selfstatus: 'From Delta One with <3',
        selfavatar: join(__dirname, 'fixtures', 'avatar.png'),
      })
    ).to.be.eventually.fulfilled
    dc.startIO()
    dc2 = new DeltaChat()
    await dc2.open(tempy.directory())
    let setupCode = null
    const waitForSetupCode = waitForSomething()
    const waitForEnd = waitForSomething()
    dc.on('DC_EVENT_MSGS_CHANGED', async (chatId, msgId) => {
      if (
        !dc.getChat(chatId).isSelfTalk() ||
        !dc.getMessage(msgId).isSetupmessage()
      ) {
        return
      }
      let setupCode = await waitForSetupCode.promise
      // console.log('incoming msg', { setupCode })
      const messages = dc.getChatMessages(chatId, 0, 0)
      expect(messages.indexOf(msgId) !== -1, 'msgId is in chat messages').to.be
        .true
      const result = await dc.continueKeyTransfer(msgId, setupCode)
      expect(result === true, 'continueKeyTransfer was successful').to.be.true

      waitForEnd.done()
    })

    // dc2.on('ALL', (event, data1, data2) =>
    //   console.log('SECOND', event, data1, data2)
    // )
    await expect(
      dc2.configure({
        addr: account.email,
        mail_pw: account.password,

        displayname: 'Delta One',
        selfstatus: 'From Delta One with <3',
        selfavatar: join(__dirname, 'fixtures', 'avatar.png'),
      })
    ).to.be.eventually.fulfilled
    dc2.startIO()
    setupCode = await dc2.initiateKeyTransfer()
    waitForSetupCode.done(setupCode)
    // console.log('setupCode is: ' + setupCode)
    expect(typeof setupCode).to.equal('string', 'setupCode is string')

    await waitForEnd.promise
  })

  it('configure using invalid password should fail', async function () {
    await expect(
      dc.configure({
        addr: 'hpk5@testrun.org',
        mail_pw: 'asd',
      })
    ).to.be.eventually.rejected
  })
})

/**
 * @returns {{done: (result?)=>void, promise:Promise<any> }}
 */
function waitForSomething() {
  let resolvePromise
  const promise = new Promise((res, rej) => {
    resolvePromise = res
  })
  return {
    done: resolvePromise,
    promise,
  }
}
