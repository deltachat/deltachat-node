/* eslint-disable camelcase */
const binding = require('./binding')
const EventEmitter = require('events').EventEmitter
const xtend = require('xtend')
const path = require('path')
const debug = require('debug')('deltachat')

const DEFAULTS = { root: process.cwd() }

/**
 *
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
    return binding.dcn_chat_is_self_talk(this.dc_chat)
  }

  isUnpromoted () {
    return binding.dcn_chat_is_unpromoted(this.dc_chat)
  }

  isVerified () {
    return binding.dcn_chat_is_verified(this.dc_chat)
  }
}

/**
 *
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

  getMsgId (index) {
    return binding.dcn_chatlist_get_msg_id(this.dc_chatlist, index)
  }

  getSummary (index, chat) {
    const dc_chat = (chat && chat.dc_chat) || null
    const dc_lot = binding.dcn_chatlist_get_summary(this.dc_chatlist,
      index, dc_chat)
    return new Lot(dc_lot)
  }
}

/**
 *
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
 *
 */
class Contact {
  constructor (dc_contact) {
    this.dc_contact = dc_contact
  }

  getAddr () {
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

  getNameNAddr () {
    return binding.dcn_contact_get_name_n_addr(this.dc_contact)
  }

  isBlocked () {
    return binding.dcn_contact_is_blocked(this.dc_contact)
  }

  isVerified () {
    return binding.dcn_contact_is_verified(this.dc_contact)
  }
}

/**
 *
 */
class Message {
  constructor (dc_msg) {
    this.dc_msg = dc_msg
  }
}

/**
 *
 */
class DeltaChat extends EventEmitter {
  constructor (opts) {
    super()
    // EventEmitter.call(this)

    opts = xtend(DEFAULTS, opts || {})

    if (typeof opts.email !== 'string') throw new Error('Missing .email')
    if (typeof opts.password !== 'string') throw new Error('Missing .password')

    this.dcn_context = binding.dcn_context_new()

    this.setEventHandler((event, data1, data2) => {
      debug('event', event, 'data1', data1, 'data2', data2)
    })

    this.open(path.join(opts.root, 'db.sqlite'), '')

    if (!this.isConfigured()) {
      this.setConfig('addr', opts.email)
      this.setConfig('mail_pw', opts.password)
      this.configure()
    }

    this.startThreads()
  }

  configure () {
    return binding.dcn_configure(this.dcn_context)
  }

  createChatByContactId (contactId) {
    return binding.dcn_create_chat_by_contact_id(this.dcn_context, contactId)
  }

  createChatByMsgId (msgId) {
    return binding.dcn_create_chat_by_msg_id(this.dcn_context, msgId)
  }

  createContact (name, addr) {
    return binding.dcn_create_contact(this.dcn_context, name, addr)
  }

  createGroupChat (verified, chatName) {
    return binding.dcn_create_group_chat(this.dcn_context, verified, chatName)
  }

  getChat (chatId) {
    const dc_chat = binding.dcn_get_chat(this.dcn_context, chatId)
    if (dc_chat === null) {
      // TODO callback with error
      throw new Error(`No chat found with id ${chatId}`)
    }
    return new Chat(dc_chat)
  }

  getChatList (listFlags, queryStr, queryContactId) {
    // TODO figure out how to do flags correctly, compare with the docs for
    // https://deltachat.github.io/api/classdc__context__t.html#a709a7b5b9b606d85f21e988e89d99fef
    if (!listFlags) listFlags = 0
    if (!queryStr) queryStr = ''
    if (!queryContactId) queryContactId = 0

    const dc_chatlist = binding.dcn_get_chatlist(this.dcn_context,
      listFlags,
      queryStr,
      queryContactId)
    return new ChatList(dc_chatlist)
  }

  getConfig (key, def) {
    return binding.dcn_get_config(this.dcn_context, key, def)
  }

  getConfigInt (key, def) {
    return binding.dcn_get_config_int(this.dcn_context, key, def)
  }

  getContact (contactId) {
    const dc_contact = binding.dcn_get_contact(this.dcn_context, contactId)
    if (dc_contact === null) {
      // TODO callback with error
      throw new Error(`No contact found with id ${contactId}`)
    }
    return new Contact(dc_contact)
  }

  getInfo () {
    return binding.dcn_get_info(this.dcn_context)
  }

  getMsg (msgId) {
    const dc_msg = binding.dcn_get_msg(this.dcn_context, msgId)
    if (dc_msg === null) {
      // TODO callback with error
      throw new Error(`No msg found with id ${msgId}`)
    }
    return new Message(dc_msg)
  }

  getMsgCount (chatId) {
    return binding.dcn_get_msg_cnt(this.dcn_context, chatId)
  }

  getMsgInfo (msgId) {
    return binding.dcn_get_msg_info(this.dcn_context, msgId)
  }

  isConfigured () {
    return binding.dcn_is_configured(this.dcn_context)
  }

  open (dbFile, blobDir) {
    return binding.dcn_open(this.dcn_context, dbFile, blobDir)
  }

  sendTextMsg (chatId, text) {
    return binding.dcn_send_text_msg(this.dcn_context, chatId, text)
  }

  setConfig (key, value) {
    return binding.dcn_set_config(this.dcn_context, key, value)
  }

  setConfigInt (key, value) {
    return binding.dcn_set_config_int(this.dcn_context, key, value)
  }

  setEventHandler (cb) {
    return binding.dcn_set_event_handler(this.dcn_context, cb)
  }

  setOffline (isOffline) {
    return binding.dcn_set_offline(this.dcn_context, isOffline)
  }

  startThreads () {
    return binding.dcn_start_threads(this.dcn_context)
  }

  stopThreads () {
    return binding.dcn_stop_threads(this.dcn_context)
  }

  unsetEventHandler () {
    return binding.dcn_unset_event_handler(this.dcn_context)
  }
}

module.exports = DeltaChat
