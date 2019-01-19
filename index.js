/* eslint-disable camelcase */

const binding = require('./binding')
const C = require('./constants')
const events = require('./events')
const Chat = require('./chat')
const ChatList = require('./chatlist')
const Contact = require('./contact')
const Message = require('./message')
const Lot = require('./lot')
const EventEmitter = require('events').EventEmitter
const mkdirp = require('mkdirp')
const path = require('path')
const got = require('got')
const pick = require('lodash.pick')
const debug = require('debug')('deltachat:index')

/**
 * Wrapper around dcn_context_t*
 */
class DeltaChat extends EventEmitter {
  constructor () {
    debug('DeltaChat constructor')
    super()

    this.dcn_context = binding.dcn_context_new()
    binding.dcn_set_event_handler(this.dcn_context, (event, data1, data2) => {
      handleEvent(this, event, data1, data2)
    })
  }

  addAddressBook (addressBook) {
    debug(`addAddressBook ${addressBook}`)
    return binding.dcn_add_address_book(this.dcn_context, addressBook)
  }

  addContactToChat (chatId, contactId) {
    debug(`addContactToChat ${chatId} ${contactId}`)
    return Boolean(
      binding.dcn_add_contact_to_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  archiveChat (chatId, archive) {
    debug(`archiveChat ${chatId} ${archive}`)
    binding.dcn_archive_chat(
      this.dcn_context,
      Number(chatId),
      archive ? 1 : 0
    )
  }

  blockContact (contactId, block) {
    debug(`blockContact ${contactId} ${block}`)
    binding.dcn_block_contact(
      this.dcn_context,
      Number(contactId),
      block ? 1 : 0
    )
  }

  checkPassword (password) {
    debug('checkPassword')
    return Boolean(binding.dcn_check_password(this.dcn_context, password))
  }

  checkQrCode (qrCode) {
    debug(`checkQrCode ${qrCode}`)
    const dc_lot = binding.dcn_check_qr(this.dcn_context, qrCode)
    return dc_lot ? new Lot(dc_lot) : null
  }

  clearStringTable () {
    debug('clearStringTable')
    binding.dcn_clear_string_table(this.dcn_context)
  }

  close () {
    debug('close')
    this.removeAllListeners()
    binding.dcn_unset_event_handler(this.dcn_context)
    binding.dcn_stop_threads(this.dcn_context)
  }

  configure (opts, cb) {
    debug('configure')
    if (!opts) opts = {}
    const ready = () => {
      this.emit('ready')
      cb && cb()
    }

    if (this.isConfigured()) {
      return process.nextTick(ready)
    }

    if (typeof opts.addr !== 'string') {
      throw new Error('Missing .addr')
    }

    if (typeof opts.mailPw !== 'string') {
      throw new Error('Missing .mailPw')
    }

    this.once('_configured', ready)

    if (typeof opts.e2eeEnabled === 'undefined') opts.e2eeEnabled = 1

    this.setConfig('addr', opts.addr)

    this.setConfig('mail_server', opts.mailServer)
    this.setConfig('mail_user', opts.mailUser)
    this.setConfig('mail_pw', opts.mailPw)
    this.setConfig('mail_port', String(opts.mailPort))

    this.setConfig('send_server', opts.sendServer)
    this.setConfig('send_user', opts.sendUser)
    this.setConfig('send_pw', opts.sendPw)
    this.setConfig('send_port', String(opts.sendPort))

    this.setConfig('server_flags', String(opts.serverFlags))
    this.setConfig('imap_folder', opts.imapFolder)
    this.setConfig('displayname', opts.displayName)
    this.setConfig('selfstatus', opts.selfStatus)
    this.setConfig('selfavatar', opts.selfAvatar)
    this.setConfig('e2ee_enabled', String(opts.e2eeEnabled ? 1 : 0))
    this.setConfig('mdns_enabled', String(opts.mdnsEnabled ? 1 : 0))
    this.setConfig('save_mime_headers', String(opts.saveMimeHeaders ? 1 : 0))

    binding.dcn_configure(this.dcn_context)
  }

  continueKeyTransfer (messageId, setupCode, cb) {
    debug(`continueKeyTransfer ${messageId}`)
    binding.dcn_continue_key_transfer(this.dcn_context, Number(messageId), setupCode, result => {
      if (result === 0) {
        return cb(new Error('Key transfer failed due to bad setup code'))
      }
      cb(null)
    })
  }

  createChatByContactId (contactId) {
    debug(`createChatByContactId ${contactId}`)
    return binding.dcn_create_chat_by_contact_id(
      this.dcn_context,
      Number(contactId)
    )
  }

  createChatByMessageId (messageId) {
    debug(`createChatByMessageId ${messageId}`)
    return binding.dcn_create_chat_by_msg_id(
      this.dcn_context,
      Number(messageId)
    )
  }

  createContact (name, addr) {
    debug(`createContact ${name} ${addr}`)
    return binding.dcn_create_contact(this.dcn_context, name, addr)
  }

  createUnverifiedGroupChat (chatName) {
    debug(`createUnverifiedGroupChat ${chatName}`)
    return binding.dcn_create_group_chat(this.dcn_context, 0, chatName)
  }

  createVerifiedGroupChat (chatName) {
    debug(`createVerifiedGroupChat ${chatName}`)
    return binding.dcn_create_group_chat(this.dcn_context, 1, chatName)
  }

  deleteChat (chatId) {
    debug(`deleteChat ${chatId}`)
    binding.dcn_delete_chat(this.dcn_context, Number(chatId))
  }

  deleteContact (contactId) {
    debug(`deleteContact ${contactId}`)
    return Boolean(
      binding.dcn_delete_contact(
        this.dcn_context,
        Number(contactId)
      )
    )
  }

  deleteMessages (messageIds) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('deleteMessages', messageIds)
    binding.dcn_delete_msgs(this.dcn_context, messageIds)
  }

  forwardMessages (messageIds, chatId) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('forwardMessages', messageIds)
    binding.dcn_forward_msgs(this.dcn_context, messageIds, chatId)
  }

  getBlobdir () {
    debug('getBlobdir')
    return binding.dcn_get_blobdir(this.dcn_context)
  }

  getBlockedCount () {
    debug('getBlockedCount')
    return binding.dcn_get_blocked_cnt(this.dcn_context)
  }

  getBlockedContacts () {
    debug('getBlockedContacts')
    return binding.dcn_get_blocked_contacts(this.dcn_context)
  }

  getChat (chatId) {
    debug(`getChat ${chatId}`)
    const dc_chat = binding.dcn_get_chat(this.dcn_context, Number(chatId))
    return dc_chat ? new Chat(dc_chat) : null
  }

  getChatContacts (chatId) {
    debug(`getChatContacts ${chatId}`)
    return binding.dcn_get_chat_contacts(this.dcn_context, Number(chatId))
  }

  getChatIdByContactId (contactId) {
    debug(`getChatIdByContactId ${contactId}`)
    return binding.dcn_get_chat_id_by_contact_id(this.dcn_context, Number(contactId))
  }

  getChatMedia (chatId, msgType1, msgType2, msgType3) {
    debug(`getChatMedia ${chatId}`)
    return binding.dcn_get_chat_media(
      this.dcn_context,
      Number(chatId),
      msgType1,
      msgType2 || 0,
      msgType3 || 0
    )
  }

  getMimeHeaders (messageId) {
    debug(`getMimeHeaders ${messageId}`)
    return binding.dcn_get_mime_headers(this.dcn_context, Number(messageId))
  }

  getChatMessages (chatId, flags, marker1before) {
    debug(`getChatMessages ${chatId} ${flags} ${marker1before}`)
    return binding.dcn_get_chat_msgs(
      this.dcn_context,
      Number(chatId),
      flags,
      marker1before
    )
  }

  getChats (listFlags, queryStr, queryContactId) {
    debug('getChats')
    const result = []
    const list = this.getChatList(listFlags, queryStr, queryContactId)
    const count = list.getCount()
    for (let i = 0; i < count; i++) {
      result.push(list.getChatId(i))
    }
    return result
  }

  getChatList (listFlags, queryStr, queryContactId) {
    listFlags = listFlags || 0
    queryStr = queryStr || ''
    queryContactId = queryContactId || 0
    debug(`getChatList ${listFlags} ${queryStr} ${queryContactId}`)
    return new ChatList(
      binding.dcn_get_chatlist(
        this.dcn_context,
        listFlags,
        queryStr,
        Number(queryContactId)
      )
    )
  }

  static getConfig (dir, cb) {
    debug(`DeltaChat.getConfig ${dir}`)
    let dc = new DeltaChat()
    function done (err, config) {
      dc.close()
      dc = null
      cb(err, config)
    }
    const db = dir.endsWith('db.sqlite') ? dir : path.join(dir, 'db.sqlite')
    binding.dcn_open(dc.dcn_context, db, '', err => {
      if (err) return done(err)
      if (dc.isConfigured()) {
        const addr = dc.getConfig('addr')
        return done(null, { addr })
      }
      done(null, {})
    })
  }

  getConfig (key) {
    debug(`getConfig ${key}`)
    return binding.dcn_get_config(this.dcn_context, key)
  }

  getContact (contactId) {
    debug(`getContact ${contactId}`)
    const dc_contact = binding.dcn_get_contact(
      this.dcn_context,
      Number(contactId)
    )
    return dc_contact ? new Contact(dc_contact) : null
  }

  getContactEncryptionInfo (contactId) {
    debug(`getContactEncryptionInfo ${contactId}`)
    return binding.dcn_get_contact_encrinfo(this.dcn_context, Number(contactId))
  }

  getContacts (listFlags, query) {
    listFlags = listFlags || 0
    query = query || ''
    debug(`getContacts ${listFlags} ${query}`)
    return binding.dcn_get_contacts(this.dcn_context, listFlags, query)
  }

  getDraft (chatId) {
    debug(`getDraft ${chatId}`)
    const dc_msg = binding.dcn_get_draft(this.dcn_context, Number(chatId))
    return dc_msg ? new Message(dc_msg) : null
  }

  getFreshMessageCount (chatId) {
    debug(`getFreshMessageCount ${chatId}`)
    return binding.dcn_get_fresh_msg_cnt(this.dcn_context, Number(chatId))
  }

  getFreshMessages () {
    debug('getFreshMessages')
    return binding.dcn_get_fresh_msgs(this.dcn_context)
  }

  getInfo () {
    debug('getInfo')
    const result = {}

    const regex = /^(\w+)=(.*)$/i
    binding.dcn_get_info(this.dcn_context)
      .split('\n')
      .filter(Boolean)
      .forEach(line => {
        const match = regex.exec(line)
        if (match) {
          result[match[1]] = match[2]
        }
      })

    return result
  }

  getMessage (messageId) {
    debug(`getMessage ${messageId}`)
    const dc_msg = binding.dcn_get_msg(this.dcn_context, Number(messageId))
    return dc_msg ? new Message(dc_msg) : null
  }

  getMessageCount (chatId) {
    debug(`getMessageCount ${chatId}`)
    return binding.dcn_get_msg_cnt(this.dcn_context, Number(chatId))
  }

  getMessageInfo (messageId) {
    debug(`getMessageInfo ${messageId}`)
    return binding.dcn_get_msg_info(this.dcn_context, Number(messageId))
  }

  getNextMediaMessage (messageId, msgType1, msgType2, msgType3) {
    debug(`getNextMediaMessage ${messageId} ${msgType1} ${msgType2} ${msgType3}`)
    return this._getNextMedia(
      messageId,
      1,
      msgType1,
      msgType2,
      msgType3
    )
  }

  getPreviousMediaMessage (messageId, msgType1, msgType2, msgType3) {
    debug(`getPreviousMediaMessage ${messageId} ${msgType1} ${msgType2} ${msgType3}`)
    return this._getNextMedia(
      messageId,
      -1,
      msgType1,
      msgType2,
      msgType3
    )
  }

  _getNextMedia (messageId, dir, msgType1, msgType2, msgType3) {
    return binding.dcn_get_next_media(
      this.dcn_context,
      Number(messageId),
      dir,
      msgType1 || 0,
      msgType2 || 0,
      msgType3 || 0
    )
  }

  getSecurejoinQrCode (chatId) {
    debug(`getSecurejoinQrCode ${chatId}`)
    return binding.dcn_get_securejoin_qr(this.dcn_context, Number(chatId))
  }

  getStarredMessages () {
    debug('getStarredMessages')
    return this.getChatMessages(C.DC_CHAT_ID_STARRED, 0, 0)
  }

  static getSystemInfo () {
    debug('DeltaChat.getSystemInfo')
    let dc = new DeltaChat()
    const result = pick(dc.getInfo(), [
      'deltachat_core_version',
      'sqlite_version',
      'sqlite_thread_safe',
      'libetpan_version',
      'openssl_version',
      'compile_date',
      'arch'
    ])
    dc.close()
    dc = null
    return result
  }

  importExport (what, param1, param2) {
    debug(`importExport ${what} ${param1} ${param2}`)
    binding.dcn_imex(this.dcn_context, what, param1, param2 || '')
  }

  importExportHasBackup (dir) {
    debug(`importExportHasBackup ${dir}`)
    return binding.dcn_imex_has_backup(this.dcn_context, dir)
  }

  initiateKeyTransfer (cb) {
    debug('initiateKeyTransfer')
    return binding.dcn_initiate_key_transfer(this.dcn_context, statusCode => {
      if (typeof statusCode === 'string') {
        return cb(null, statusCode)
      }
      cb(new Error('Could not initiate key transfer'))
    })
  }

  isConfigured () {
    debug('isConfigured')
    return Boolean(binding.dcn_is_configured(this.dcn_context))
  }

  isContactInChat (chatId, contactId) {
    debug(`isContactInChat ${chatId} ${contactId}`)
    return Boolean(
      binding.dcn_is_contact_in_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  isOpen () {
    debug('isOpen')
    return Boolean(binding.dcn_is_open(this.dcn_context))
  }

  // TODO this should most likely be async, see
  // https://c.delta.chat/classdc__context__t.html#ae49176cbc26d4d40d52de4f5301d1fa7
  joinSecurejoin (qrCode) {
    debug(`joinSecurejoin ${qrCode}`)
    return binding.dcn_join_securejoin(this.dcn_context, qrCode)
  }

  lookupContactIdByAddr (addr) {
    debug(`lookupContactIdByAddr ${addr}`)
    return Boolean(
      binding.dcn_lookup_contact_id_by_addr(this.dcn_context, addr)
    )
  }

  markNoticedChat (chatId) {
    debug(`markNoticedChat ${chatId}`)
    binding.dcn_marknoticed_chat(this.dcn_context, Number(chatId))
  }

  markNoticedAllChats () {
    debug('markNoticedAllChats')
    binding.dcn_marknoticed_all_chats(this.dcn_context)
  }

  markNoticedContact (contactId) {
    debug(`markNoticedContact ${contactId}`)
    binding.dcn_marknoticed_contact(this.dcn_context, Number(contactId))
  }

  markSeenMessages (messageIds) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('markSeenMessages', messageIds)
    binding.dcn_markseen_msgs(this.dcn_context, messageIds)
  }

  static maybeValidAddr (addr) {
    debug('DeltaChat.maybeValidAddr')
    if (addr === null) return false
    return Boolean(binding.dcn_maybe_valid_addr(addr))
  }

  maybeNetwork () {
    debug('maybeNetwork')
    binding.dcn_maybe_network(this.dcn_context)
  }

  messageNew (viewType = C.DC_MSG_TEXT) {
    debug(`messageNew ${viewType}`)
    return new Message(binding.dcn_msg_new(this.dcn_context, viewType))
  }

  open (cwd, cb) {
    debug(`open ${cwd}`)
    if (typeof cwd === 'function') {
      cb = cwd
      cwd = process.cwd()
    }
    if (typeof cb !== 'function') {
      throw new Error('open callback required')
    }
    mkdirp(cwd, err => {
      if (err) return cb(err)
      const db = path.join(cwd, 'db.sqlite')
      binding.dcn_open(this.dcn_context, db, '', err => {
        if (err) return cb(err)
        binding.dcn_start_threads(this.dcn_context)
        cb()
      })
    })
  }

  removeContactFromChat (chatId, contactId) {
    debug(`removeContactFromChat ${chatId} ${contactId}`)
    return Boolean(
      binding.dcn_remove_contact_from_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  searchMessages (chatId, query) {
    debug(`searchMessages ${chatId} ${query}`)
    return binding.dcn_search_msgs(this.dcn_context, Number(chatId), query)
  }

  sendMessage (chatId, msg) {
    debug(`sendMessage ${chatId}`)
    if (!msg) {
      throw new Error('invalid msg parameter')
    }
    if (typeof msg === 'string') {
      const msgObj = this.messageNew()
      msgObj.setText(msg)
      msg = msgObj
    }
    if (!msg.dc_msg) {
      throw new Error('invalid msg object')
    }
    return binding.dcn_send_msg(this.dcn_context, Number(chatId), msg.dc_msg)
  }

  setChatName (chatId, name) {
    debug(`setChatName ${chatId} ${name}`)
    return Boolean(
      binding.dcn_set_chat_name(
        this.dcn_context,
        Number(chatId),
        name
      )
    )
  }

  setChatProfileImage (chatId, image) {
    debug(`setChatProfileImage ${chatId} ${image}`)
    return Boolean(
      binding.dcn_set_chat_profile_image(
        this.dcn_context,
        Number(chatId),
        image || ''
      )
    )
  }

  setConfig (key, value) {
    debug(`setConfig ${key} ${value}`)
    return binding.dcn_set_config(this.dcn_context, key, value || '')
  }

  setDraft (chatId, msg) {
    debug(`setDraft ${chatId}`)
    binding.dcn_set_draft(
      this.dcn_context,
      Number(chatId),
      msg ? msg.dc_msg : null
    )
  }

  setStringTable (index, str) {
    debug(`setStringTable ${index} ${str}`)
    binding.dcn_set_string_table(this.dcn_context, Number(index), str)
  }

  starMessages (messageIds, star) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('starMessages', messageIds)
    binding.dcn_star_msgs(this.dcn_context, messageIds, star ? 1 : 0)
  }
}

function handleEvent (self, event, data1, data2) {
  debug('event', event, 'data1', data1, 'data2', data2)

  self.emit('ALL', event, data1, data2)

  const eventStr = events[event]

  async function handleHttpGetEvent (url) {
    try {
      debug(`handleHttpGetEvent ${url}`)
      const response = await got(url, {})
      debug('handleHttpGetEvent response.body', response.body)
      binding.dcn_set_http_get_response(self.dcn_context, response.body)
    } catch (err) {
      debug('handleHttpGetEvent err', err)
      binding.dcn_set_http_get_response(self.dcn_context, '')
    }
  }

  switch (eventStr) {
    case 'DC_EVENT_INFO': // 100
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_SMTP_CONNECTED': // 101
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_IMAP_CONNECTED': // 102
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_SMTP_MESSAGE_SENT': // 103
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_WARNING': // 300
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_ERROR': // 400
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_ERROR_NETWORK': // 401
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_ERROR_SELF_NOT_IN_GROUP': // 410
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_MSGS_CHANGED': // 2000
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_INCOMING_MSG': // 2005
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSG_DELIVERED': // 2010
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSG_FAILED': // 2012
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSG_READ': // 2015
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_CHAT_MODIFIED': // 2020
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_CONTACTS_CHANGED': // 2030
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_CONFIGURE_PROGRESS': // 2041
      if (data1 === 1000) self.emit('_configured')
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_IMEX_PROGRESS': // 2051
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_IMEX_FILE_WRITTEN': // 2052
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_SECUREJOIN_INVITER_PROGRESS': // 2060
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_SECUREJOIN_JOINER_PROGRESS': // 2061
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_HTTP_GET': // 2100
      handleHttpGetEvent(data1)
      break
    default:
      debug(`Unknown event ${eventStr}`)
  }
}

module.exports = DeltaChat
