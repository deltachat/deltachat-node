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
const debug = require('debug')('deltachat')

/**
 * Wrapper around dcn_context_t*
 */
class DeltaChat extends EventEmitter {
  constructor () {
    super()

    this._pollInterval = null
    this.dcn_context = binding.dcn_context_new()
    // TODO comment back in once polling is gone
    // binding.dcn_set_event_handler(this.dcn_context, (event, data1, data2) => {
    //   handleEvent(this, event, data1, data2)
    // })
  }

  addAddressBook (addressBook) {
    return binding.dcn_add_address_book(this.dcn_context, addressBook)
  }

  addContactToChat (chatId, contactId) {
    return Boolean(
      binding.dcn_add_contact_to_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  archiveChat (chatId, archive) {
    binding.dcn_archive_chat(
      this.dcn_context,
      Number(chatId),
      archive ? 1 : 0
    )
  }

  blockContact (contactId, block) {
    binding.dcn_block_contact(
      this.dcn_context,
      Number(contactId),
      block ? 1 : 0
    )
  }

  checkPassword (password) {
    return Boolean(binding.dcn_check_password(this.dcn_context, password))
  }

  checkQrCode (qrCode) {
    const dc_lot = binding.dcn_check_qr(this.dcn_context, qrCode)
    return dc_lot ? new Lot(dc_lot) : null
  }

  // TODO close should take a cb
  close () {
    // TODO close() doesn't always work, figure out a way to be
    // sure we can stop and callback when done
    // binding.dcn_close(this.dcn_context)

    // TODO temporary polling interval
    if (this._pollInterval) {
      clearInterval(this._pollInterval)
      this._pollInterval = null
    }

    // TODO comment back in once polling is gone
    // binding.dcn_unset_event_handler(this.dcn_context)
    binding.dcn_stop_threads(this.dcn_context)
  }

  configure (opts, cb) {
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

    if (typeof opts.mail_pw !== 'string') {
      throw new Error('Missing .mail_pw')
    }

    this.once('_configured', ready)

    this.setConfig('addr', opts.addr)
    this.setConfig('mail_pw', opts.mail_pw)

    if (typeof opts.mail_server === 'string') {
      this.setConfig('mail_server', opts.mail_server)
    }

    if (opts.mail_port) {
      this.setConfig('mail_port', String(opts.mail_port))
    }

    if (typeof opts.mail_user === 'string') {
      this.setConfig('mail_user', opts.mail_user)
    }

    if (typeof opts.send_server === 'string') {
      this.setConfig('send_server', opts.send_server)
    }

    if (opts.send_port) {
      this.setConfig('send_port', String(opts.send_port))
    }

    if (typeof opts.send_user === 'string') {
      this.setConfig('send_user', opts.send_user)
    }

    if (typeof opts.send_pw === 'string') {
      this.setConfig('send_pw', opts.send_pw)
    }

    if (typeof opts.server_flags === 'number') {
      this.setConfigInt('server_flags', opts.server_flags)
    }

    if (typeof opts.displayname === 'string') {
      this.setConfig('displayname', opts.displayname)
    }

    if (typeof opts.selfstatus === 'string') {
      this.setConfig('selfstatus', opts.selfstatus)
    }

    if (opts.e2ee_enabled === false || opts.e2ee_enabled === true) {
      this.setConfigInt('e2ee_enabled', opts.e2ee_enabled ? 1 : 0)
    }

    binding.dcn_configure(this.dcn_context)
  }

  continueKeyTransfer (messageId, setupCode) {
    return Boolean(
      binding.dcn_continue_key_transfer(
        this.dcn_context,
        Number(messageId),
        setupCode
      )
    )
  }

  createChatByContactId (contactId) {
    return binding.dcn_create_chat_by_contact_id(
      this.dcn_context,
      Number(contactId)
    )
  }

  createChatByMessageId (messageId) {
    return binding.dcn_create_chat_by_msg_id(
      this.dcn_context,
      Number(messageId)
    )
  }

  createContact (name, addr) {
    return binding.dcn_create_contact(this.dcn_context, name, addr)
  }

  createUnverifiedGroupChat (chatName) {
    return binding.dcn_create_group_chat(this.dcn_context, 0, chatName)
  }

  createVerifiedGroupChat (chatName) {
    return binding.dcn_create_group_chat(this.dcn_context, 1, chatName)
  }

  deleteChat (chatId) {
    binding.dcn_delete_chat(this.dcn_context, Number(chatId))
  }

  deleteContact (contactId) {
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
    binding.dcn_delete_msgs(this.dcn_context, messageIds)
  }

  forwardMessages (messageIds, chatId) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    binding.dcn_forward_msgs(this.dcn_context, messageIds, chatId)
  }

  getBlobdir () {
    return binding.dcn_get_blobdir(this.dcn_context)
  }

  getBlockedCount () {
    return binding.dcn_get_blocked_cnt(this.dcn_context)
  }

  getBlockedContacts () {
    return binding.dcn_get_blocked_contacts(this.dcn_context)
  }

  getChat (chatId) {
    const dc_chat = binding.dcn_get_chat(this.dcn_context, Number(chatId))
    return dc_chat ? new Chat(dc_chat) : null
  }

  getChatContacts (chatId) {
    return binding.dcn_get_chat_contacts(this.dcn_context, Number(chatId))
  }

  getChatIdByContactId (contactId) {
    return binding.dcn_get_chat_id_by_contact_id(this.dcn_context, Number(contactId))
  }

  getChatMedia (chatId, msgType, orMsgType) {
    return binding.dcn_get_chat_media(
      this.dcn_context,
      Number(chatId),
      msgType,
      orMsgType
    )
  }

  getStarredMessages () {
    return this.getChatMessages(C.DC_CHAT_ID_STARRED, 0, 0)
  }

  getChatMessages (chatId, flags, marker1before) {
    return binding.dcn_get_chat_msgs(
      this.dcn_context,
      Number(chatId),
      flags,
      marker1before
    )
  }

  getChats (listFlags, queryStr, queryContactId) {
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
    return new ChatList(
      binding.dcn_get_chatlist(
        this.dcn_context,
        listFlags,
        queryStr,
        Number(queryContactId)
      )
    )
  }

  getConfig (key, def) {
    return binding.dcn_get_config(this.dcn_context, key, def || '')
  }

  getConfigInt (key, def) {
    return binding.dcn_get_config_int(this.dcn_context, key, def || 0)
  }

  getContact (contactId) {
    const dc_contact = binding.dcn_get_contact(
      this.dcn_context,
      Number(contactId)
    )
    return dc_contact ? new Contact(dc_contact) : null
  }

  getContactEncryptionInfo (contactId) {
    return binding.dcn_get_contact_encrinfo(this.dcn_context, Number(contactId))
  }

  getContacts (listFlags, query) {
    listFlags = listFlags || 0
    query = query || ''
    return binding.dcn_get_contacts(this.dcn_context, listFlags, query)
  }

  getFreshMessageCount (chatId) {
    return binding.dcn_get_fresh_msg_cnt(this.dcn_context, Number(chatId))
  }

  getFreshMessages () {
    return binding.dcn_get_fresh_msgs(this.dcn_context)
  }

  getInfo () {
    return binding.dcn_get_info(this.dcn_context)
  }

  getMessage (messageId) {
    const dc_msg = binding.dcn_get_msg(this.dcn_context, Number(messageId))
    return dc_msg ? new Message(dc_msg) : null
  }

  getMessageCount (chatId) {
    return binding.dcn_get_msg_cnt(this.dcn_context, Number(chatId))
  }

  getMessageInfo (messageId) {
    return binding.dcn_get_msg_info(this.dcn_context, Number(messageId))
  }

  getNextMediaMessage (messageId) {
    return binding.dcn_get_next_media(this.dcn_context, Number(messageId), 1)
  }

  getPreviousMediaMessage (messageId) {
    return binding.dcn_get_next_media(this.dcn_context, Number(messageId), -1)
  }

  getSecurejoinQrCode (groupChatId) {
    return binding.dcn_get_securejoin_qr(this.dcn_context, Number(groupChatId))
  }

  importExport (what, param1, param2) {
    binding.dcn_imex(this.dcn_context, what, param1, param2)
  }

  importExportHasBackup (dirName) {
    return binding.dcn_imex_has_backup(this.dcn_context, dirName)
  }

  initiateKeyTransfer (cb) {
    return binding.dcn_initiate_key_transfer(this.dcn_context, statusCode => {
      if (typeof statusCode === 'string') {
        return cb(null, statusCode)
      }
      cb(new Error('could not initiate key transfer'))
    })
  }

  isConfigured () {
    return Boolean(binding.dcn_is_configured(this.dcn_context))
  }

  isContactInChat (chatId, contactId) {
    return Boolean(
      binding.dcn_is_contact_in_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  // TODO this should most likely be async, see
  // https://deltachat.github.io/api/classdc__context__t.html#ae49176cbc26d4d40d52de4f5301d1fa7
  joinSecurejoin (qrCode) {
    return binding.dcn_join_securejoin(this.dcn_context, qrCode)
  }

  markNoticedChat (chatId) {
    binding.dcn_marknoticed_chat(this.dcn_context, Number(chatId))
  }

  markNoticedAllChats () {
    binding.dcn_marknoticed_all_chats(this.dcn_context)
  }

  markNoticedContact (contactId) {
    binding.dcn_marknoticed_contact(this.dcn_context, Number(contactId))
  }

  markSeenMessages (messageIds) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    binding.dcn_markseen_msgs(this.dcn_context, messageIds)
  }

  messageNew () {
    return new Message(binding.dcn_msg_new(this.dcn_context))
  }

  open (cwd, cb) {
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

        // TODO temporary timer for polling events
        this._pollInterval = setInterval(() => {
          const event = binding.dcn_poll_event(this.dcn_context)
          if (event) {
            handleEvent(this, event.event, event.data1, event.data2)
          }
        }, 50)

        cb()
      })
    })
  }

  removeContactFromChat (chatId, contactId) {
    return Boolean(
      binding.dcn_remove_contact_from_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  searchMessages (chatId, query) {
    return binding.dcn_search_msgs(this.dcn_context, Number(chatId), query)
  }

  sendAudioMessage (chatId, file, fileMime, duration, author, trackName) {
    return binding.dcn_send_audio_msg(
      this.dcn_context,
      Number(chatId),
      file,
      fileMime,
      duration,
      author,
      trackName
    )
  }

  sendFileMessage (chatId, file, fileMime) {
    return binding.dcn_send_file_msg(
      this.dcn_context,
      Number(chatId),
      file,
      fileMime
    )
  }

  sendImageMessage (chatId, file, fileMime, width, height) {
    return binding.dcn_send_image_msg(
      this.dcn_context,
      Number(chatId),
      file,
      fileMime,
      width,
      height
    )
  }

  sendMessage (chatId, msg) {
    if (!msg || !msg.dc_msg) {
      throw new Error('msg parameter is not a valid Message object')
    }
    return binding.dcn_send_msg(this.dcn_context, Number(chatId), msg.dc_msg)
  }

  sendTextMessage (chatId, text) {
    return binding.dcn_send_text_msg(this.dcn_context, Number(chatId), text)
  }

  sendVcardMessage (chatId, contactId) {
    return binding.dcn_send_vcard_msg(
      this.dcn_context,
      Number(chatId),
      Number(contactId)
    )
  }

  sendVideoMessage (chatId, file, fileMime, width, height, duration) {
    return binding.dcn_send_video_msg(
      this.dcn_context,
      Number(chatId),
      file,
      fileMime,
      width,
      height,
      duration
    )
  }

  sendVoiceMessage (chatId, file, fileMime, duration) {
    return binding.dcn_send_voice_msg(
      this.dcn_context,
      Number(chatId),
      file,
      fileMime,
      duration
    )
  }

  setChatName (chatId, name) {
    return Boolean(
      binding.dcn_set_chat_name(
        this.dcn_context,
        Number(chatId),
        name
      )
    )
  }

  setChatProfileImage (chatId, image) {
    return Boolean(
      binding.dcn_set_chat_profile_image(
        this.dcn_context,
        Number(chatId),
        image
      )
    )
  }

  setConfig (key, value) {
    return binding.dcn_set_config(this.dcn_context, key, value)
  }

  setConfigInt (key, value) {
    return binding.dcn_set_config_int(this.dcn_context, key, value)
  }

  setOffline (offline) {
    binding.dcn_set_offline(this.dcn_context, offline ? 1 : 0)
  }

  setTextDraft (chatId, text) {
    binding.dcn_set_text_draft(this.dcn_context, Number(chatId), text)
  }

  starMessages (messageIds, star) {
    if (!Array.isArray(messageIds)) {
      messageIds = [ messageIds ]
    }
    messageIds = messageIds.map(id => Number(id))
    binding.dcn_star_msgs(this.dcn_context, messageIds, star ? 1 : 0)
  }
}

function handleEvent (self, event, data1, data2) {
  debug('event', event, 'data1', data1, 'data2', data2)

  self.emit('ALL', event, data1, data2)

  const eventStr = events[event]

  async function handleHttpGetEvent (url) {
    try {
      debug('handleHttpGetEvent url', url)
      const response = await got(url, {})
      debug('handleHttpGetEvent response.body', response.body)
      binding.dcn_set_http_get_response(self.dcn_context, response.body)
    } catch (err) {
      debug('handleHttpGetEvent err', err)
      binding.dcn_set_http_get_response(self.dcn_context, '')
    }
  }

  switch (eventStr) {
    case 'DC_EVENT_INFO':
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_SMTP_CONNECTED':
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_IMAP_CONNECTED':
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_SMTP_MESSAGE_SENT':
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_WARNING':
      self.emit(eventStr, data2)
      break
    case 'DC_EVENT_ERROR':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSGS_CHANGED':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_INCOMING_MSG':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSG_DELIVERED':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSG_FAILED':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_MSG_READ':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_CHAT_MODIFIED':
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_CONTACTS_CHANGED':
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_CONFIGURE_PROGRESS':
      if (data1 === 1000) self.emit('_configured')
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_IMEX_PROGRESS':
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_IMEX_FILE_WRITTEN':
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_FILE_COPIED':
      self.emit(eventStr, data1)
      break
    case 'DC_EVENT_SECUREJOIN_INVITER_PROGRESS':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_SECUREJOIN_JOINER_PROGRESS':
      self.emit(eventStr, data1, data2)
      break
    case 'DC_EVENT_HTTP_GET':
      handleHttpGetEvent(data1)
      break
    case 'DC_EVENT_IS_OFFLINE':
    case 'DC_EVENT_GET_STRING':
    case 'DC_EVENT_GET_QUANTITY_STRING':
    default:
      debug('Unknown event')
  }
}

module.exports = DeltaChat
