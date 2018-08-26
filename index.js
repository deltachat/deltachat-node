/* eslint-disable camelcase */
const binding = require('./binding')
const C = require('./constants')
const events = require('./events')
const EventEmitter = require('events').EventEmitter
const xtend = require('xtend')
const mkdirp = require('mkdirp')
const path = require('path')
const debug = require('debug')('deltachat')

/**
 * Wrapper around dc_chat_t*
 */
class Chat {
  constructor (dc_chat) {
    this.dc_chat = dc_chat
  }

  getArchived () {
    return binding.dcn_chat_get_archived(this.dc_chat)
  }

  getDraftTimestamp () {
    return binding.dcn_chat_get_draft_timestamp(this.dc_chat)
  }

  getId () {
    return binding.dcn_chat_get_id(this.dc_chat)
  }

  getName () {
    return binding.dcn_chat_get_name(this.dc_chat)
  }

  getProfileImage () {
    return binding.dcn_chat_get_profile_image(this.dc_chat)
  }

  getSubtitle () {
    return binding.dcn_chat_get_subtitle(this.dc_chat)
  }

  getTextDraft () {
    return binding.dcn_chat_get_text_draft(this.dc_chat)
  }

  getType () {
    return binding.dcn_chat_get_type(this.dc_chat)
  }

  isSelfTalk () {
    return Boolean(binding.dcn_chat_is_self_talk(this.dc_chat))
  }

  isUnpromoted () {
    return Boolean(binding.dcn_chat_is_unpromoted(this.dc_chat))
  }

  isVerified () {
    return Boolean(binding.dcn_chat_is_verified(this.dc_chat))
  }
}

/**
 * Wrapper around dc_chatlist_t*
 */
class ChatList {
  constructor (dc_chatlist) {
    this.dc_chatlist = dc_chatlist
  }

  getChatId (index) {
    return binding.dcn_chatlist_get_chat_id(this.dc_chatlist, index)
  }

  getCount () {
    return binding.dcn_chatlist_get_cnt(this.dc_chatlist)
  }

  getMessageId (index) {
    return binding.dcn_chatlist_get_msg_id(this.dc_chatlist, index)
  }

  getSummary (index, chat) {
    const dc_chat = (chat && chat.dc_chat) || null
    return new Lot(
      binding.dcn_chatlist_get_summary(
        this.dc_chatlist,
        index,
        dc_chat
      )
    )
  }
}

/**
 * Wrapper around dc_contact_t*
 */
class Contact {
  constructor (dc_contact) {
    this.dc_contact = dc_contact
  }

  getAddress () {
    return binding.dcn_contact_get_addr(this.dc_contact)
  }

  getDisplayName () {
    return binding.dcn_contact_get_display_name(this.dc_contact)
  }

  getFirstName () {
    return binding.dcn_contact_get_first_name(this.dc_contact)
  }

  getId () {
    return binding.dcn_contact_get_id(this.dc_contact)
  }

  getName () {
    return binding.dcn_contact_get_name(this.dc_contact)
  }

  getNameAndAddress () {
    return binding.dcn_contact_get_name_n_addr(this.dc_contact)
  }

  isBlocked () {
    return Boolean(binding.dcn_contact_is_blocked(this.dc_contact))
  }

  isVerified () {
    return Boolean(binding.dcn_contact_is_verified(this.dc_contact))
  }
}

/**
 * Wrapper around dc_lot_t*
 */
class Lot {
  constructor (dc_lot) {
    this.dc_lot = dc_lot
  }

  getId () {
    return binding.dcn_lot_get_id(this.dc_lot)
  }

  getState () {
    return binding.dcn_lot_get_state(this.dc_lot)
  }

  getText1 () {
    return binding.dcn_lot_get_text1(this.dc_lot)
  }

  getText1Meaning () {
    return binding.dcn_lot_get_text1_meaning(this.dc_lot)
  }

  getText2 () {
    return binding.dcn_lot_get_text2(this.dc_lot)
  }

  getTimestamp () {
    return binding.dcn_lot_get_timestamp(this.dc_lot)
  }
}

/**
 * Helper class for message states so you can do e.g.
 *
 * if (msg.getState().isPending()) { .. }
 *
 */
class MessageState {
  constructor (state) {
    this.state = state
  }

  isUndefined () {
    return this.state === C.DC_STATE_UNDEFINED
  }

  isFresh () {
    return this.state === C.DC_STATE_IN_FRESH
  }

  isNoticed () {
    return this.state === C.DC_STATE_IN_NOTICED
  }

  isSeen () {
    return this.state === C.DC_STATE_IN_SEEN
  }

  isPending () {
    return this.state === C.DC_STATE_OUT_PENDING
  }

  isFailed () {
    return this.state === C.DC_STATE_OUT_FAILED
  }

  isDelivered () {
    return this.state === C.DC_STATE_OUT_DELIVERED
  }

  isReceived () {
    return this.state === C.DC_STATE_OUT_MDN_RCVD
  }
}

/**
 * Helper class for message types so you can do e.g.
 *
 * if (msg.getType().isVideo()) { .. }
 *
 */
class MessageType {
  constructor (type) {
    this.type = type
  }

  isUndefined () {
    return this.type === C.DC_MSG_UNDEFINED
  }

  isText () {
    return this.type === C.DC_MSG_TEXT
  }

  isImage () {
    return this.type === C.DC_MSG_IMAGE || this.type === C.DC_MSG_GIF
  }

  isGif () {
    return this.type === C.DC_MSG_GIF
  }

  isAudio () {
    return this.type === C.DC_MSG_AUDIO || this.type === C.DC_MSG_VOICE
  }

  isVoice () {
    return this.type === C.DC_MSG_VOICE
  }

  isVideo () {
    return this.type === C.DC_MSG_VIDEO
  }

  isFile () {
    return this.type === C.DC_MSG_FILE
  }
}

/**
 * Wrapper around dc_msg_t*
 */
class Message {
  constructor (dc_msg) {
    this.dc_msg = dc_msg
  }

  getChatId () {
    return binding.dcn_msg_get_chat_id(this.dc_msg)
  }

  getDuration () {
    return binding.dcn_msg_get_duration(this.dc_msg)
  }

  getFile () {
    return binding.dcn_msg_get_file(this.dc_msg)
  }

  getFilebytes () {
    return binding.dcn_msg_get_filebytes(this.dc_msg)
  }

  getFilemime () {
    return binding.dcn_msg_get_filemime(this.dc_msg)
  }

  getFilename () {
    return binding.dcn_msg_get_filename(this.dc_msg)
  }

  getFromId () {
    return binding.dcn_msg_get_from_id(this.dc_msg)
  }

  getHeight () {
    return binding.dcn_msg_get_height(this.dc_msg)
  }

  getId () {
    return binding.dcn_msg_get_id(this.dc_msg)
  }

  getMediainfo () {
    return new Lot(binding.dcn_msg_get_mediainfo(this.dc_msg))
  }

  getSetupcodebegin () {
    return binding.dcn_msg_get_setupcodebegin(this.dc_msg)
  }

  getShowpadlock () {
    return Boolean(binding.dcn_msg_get_showpadlock(this.dc_msg))
  }

  getState () {
    return new MessageState(binding.dcn_msg_get_state(this.dc_msg))
  }

  getSummary (chat) {
    const dc_chat = (chat && chat.dc_chat) || null
    return new Lot(binding.dcn_msg_get_summary(this.dc_msg, dc_chat))
  }

  getSummarytext (approxCharacters) {
    approxCharacters = approxCharacters || 0
    return binding.dcn_msg_get_summarytext(this.dc_msg, approxCharacters)
  }

  getText () {
    return binding.dcn_msg_get_text(this.dc_msg)
  }

  getTimestamp () {
    return binding.dcn_msg_get_timestamp(this.dc_msg)
  }

  getType () {
    return new MessageType(binding.dcn_msg_get_type(this.dc_msg))
  }

  getWidth () {
    return binding.dcn_msg_get_width(this.dc_msg)
  }

  isDeadDrop () {
    return this.getChatId() === C.DC_CHAT_ID_DEADDROP
  }

  isForwarded () {
    return Boolean(binding.dcn_msg_is_forwarded(this.dc_msg))
  }

  isIncreation () {
    return Boolean(binding.dcn_msg_is_increation(this.dc_msg))
  }

  isInfo () {
    return Boolean(binding.dcn_msg_is_info(this.dc_msg))
  }

  isSent () {
    return Boolean(binding.dcn_msg_is_sent(this.dc_msg))
  }

  isSetupmessage () {
    return Boolean(binding.dcn_msg_is_setupmessage(this.dc_msg))
  }

  isStarred () {
    return Boolean(binding.dcn_msg_is_starred(this.dc_msg))
  }

  latefilingMediasize (width, height, duration) {
    width = width || 0
    height = height || 0
    duration = duration || 0
    binding.dcn_msg_latefiling_mediasize(this.dc_msg, width, height, duration)
  }

  setDimension (width, height) {
    width = width || 0
    height = height || 0
    binding.dcn_msg_set_dimension(this.dc_msg, width, height)
  }

  setDuration (duration) {
    duration = duration || 0
    binding.dcn_msg_set_duration(this.dc_msg, duration)
  }

  setFile (file, mime) {
    if (typeof file !== 'string' && !mime) throw new Error('Missing filename')
    binding.dcn_msg_set_file(this.dc_msg, file, mime || '')
  }

  setMediainfo (author, trackName) {
    binding.dcn_msg_set_mediainfo(this.dc_msg, author || '', trackName || '')
  }

  setText (text) {
    binding.dcn_msg_set_text(this.dc_msg, text)
  }

  setType (type) {
    binding.dcn_msg_set_type(this.dc_msg, type)
  }
}

/**
 * Wrapper around dcn_context_t*
 */
class DeltaChat extends EventEmitter {
  constructor (opts) {
    super()

    this.opts = xtend({ cwd: process.cwd() }, opts)
    this._pollInterval = null

    if (typeof this.opts.addr !== 'string') {
      throw new Error('Missing .addr')
    }
    if (typeof this.opts.mail_pw !== 'string') {
      throw new Error('Missing .mail_pw')
    }

    this.dcn_context = binding.dcn_context_new()
    // TODO comment back in once polling is gone
    // this._setEventHandler(this._eventHandler.bind(this))
  }

  addAddressBook (addressBook) {
    if (typeof addressBook !== 'string') {
      throw new Error('address book must be a string')
    }
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
    // _stopOngoingProcess() and _close() seems to mess it up
    // even more
    // this._stopOngoingProcess()
    // this._close()

    // TODO temporary polling interval
    if (this._pollInterval) {
      clearInterval(this._pollInterval)
      this._pollInterval = null
    }

    // TODO comment back in once polling is gone
    // this._unsetEventHandler()
    this._stopThreads()
  }

  _close () {
    binding.dcn_close(this.dcn_context)
  }

  _configure () {
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

  _eventHandler (event, data1, data2) {
    debug('event', event, 'data1', data1, 'data2', data2)

    this.emit('ALL', event, data1, data2)

    const eventStr = events[event]

    switch (eventStr) {
      case 'DC_EVENT_INFO':
        this.emit(eventStr, data2)
        break
      case 'DC_EVENT_WARNING':
        this.emit(eventStr, data2)
        break
      case 'DC_EVENT_ERROR':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_MSGS_CHANGED':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_INCOMING_MSG':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_MSG_DELIVERED':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_MSG_FAILED':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_MSG_READ':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_CHAT_MODIFIED':
        this.emit(eventStr, data1)
        break
      case 'DC_EVENT_CONTACTS_CHANGED':
        this.emit(eventStr, data1)
        break
      case 'DC_EVENT_CONFIGURE_PROGRESS':
        if (data1 === 1000) this.emit('_configured')
        this.emit(eventStr, data1)
        break
      case 'DC_EVENT_IMEX_PROGRESS':
        this.emit(eventStr, data1)
        break
      case 'DC_EVENT_IMEX_FILE_WRITTEN':
        this.emit(eventStr, data1)
        break
      case 'DC_EVENT_SECUREJOIN_INVITER_PROGRESS':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_SECUREJOIN_JOINER_PROGRESS':
        this.emit(eventStr, data1, data2)
        break
      case 'DC_EVENT_IS_OFFLINE':
      case 'DC_EVENT_GET_STRING':
      case 'DC_EVENT_GET_QUANTITY_STRING':
      case 'DC_EVENT_HTTP_GET':
        break
      default:
        debug('Unknown event')
    }
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
    return binding.dcn_get_config(this.dcn_context, key, def)
  }

  getConfigInt (key, def) {
    return binding.dcn_get_config_int(this.dcn_context, key, def)
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

  initiateKeyTransfer () {
    return binding.dcn_initiate_key_transfer(this.dcn_context)
  }

  _isConfigured () {
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

  open (cb) {
    const opts = this.opts
    mkdirp(opts.cwd, err => {
      if (err) {
        cb && cb(err)
        return
      }
      const db = path.join(opts.cwd, 'db.sqlite')
      this._open(db, '', err => {
        if (err) {
          cb && cb(err)
          return
        }

        this._startThreads()

        const ready = () => {
          this.emit('ready')
          cb && cb(null)
        }

        // TODO temporary timer for polling events
        this._pollInterval = setInterval(() => {
          const event = this._pollEvent()
          if (event) {
            this._eventHandler(event.event, event.data1, event.data2)
          }
        }, 50)

        if (!this._isConfigured()) {
          this.once('_configured', ready)
          this.setConfig('addr', opts.addr)
          this.setConfig('mail_pw', opts.mail_pw)
          this._configure()
        } else {
          ready()
        }
      })
    })
  }

  _open (dbFile, blobDir, cb) {
    return binding.dcn_open(this.dcn_context, dbFile, blobDir, cb)
  }

  _pollEvent () {
    return binding.dcn_poll_event(this.dcn_context)
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

  _setEventHandler (cb) {
    binding.dcn_set_event_handler(this.dcn_context, cb)
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

  _startThreads () {
    binding.dcn_start_threads(this.dcn_context)
  }

  _stopThreads () {
    binding.dcn_stop_threads(this.dcn_context)
  }

  _stopOngoingProcess () {
    binding.dcn_stop_ongoing_process(this.dcn_context)
  }

  _unsetEventHandler () {
    binding.dcn_unset_event_handler(this.dcn_context)
  }
}

module.exports = DeltaChat
