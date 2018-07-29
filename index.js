/* eslint-disable camelcase */
const binding = require('./binding')
const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits
const xtend = require('xtend')
const path = require('path')
const debug = require('debug')('deltachat')

const DEFAULTS = { root: process.cwd() }

/**
 *
 */
function Chat (dc_chat) {
  if (!(this instanceof Chat)) {
    return new Chat(dc_chat)
  }
  this.dc_chat = dc_chat
}

Chat.prototype.getArchived = function () {
  return binding.dcn_chat_get_archived(this.dc_chat)
}

Chat.prototype.getDraftTimestamp = function () {
  return binding.dcn_chat_get_draft_timestamp(this.dc_chat)
}

Chat.prototype.getId = function () {
  return binding.dcn_chat_get_id(this.dc_chat)
}

Chat.prototype.getName = function () {
  return binding.dcn_chat_get_name(this.dc_chat)
}

Chat.prototype.getProfileImage = function () {
  return binding.dcn_chat_get_profile_image(this.dc_chat)
}

Chat.prototype.getSubtitle = function () {
  return binding.dcn_chat_get_subtitle(this.dc_chat)
}

Chat.prototype.getTextDraft = function () {
  return binding.dcn_chat_get_text_draft(this.dc_chat)
}

Chat.prototype.getType = function () {
  return binding.dcn_chat_get_type(this.dc_chat)
}

Chat.prototype.isSelfTalk = function () {
  return binding.dcn_chat_is_self_talk(this.dc_chat)
}

Chat.prototype.isUnpromoted = function () {
  return binding.dcn_chat_is_unpromoted(this.dc_chat)
}

Chat.prototype.isVerified = function () {
  return binding.dcn_chat_is_verified(this.dc_chat)
}

/**
 *
 */
function ChatList (dc_chatlist) {
  if (!(this instanceof ChatList)) {
    return new ChatList(dc_chatlist)
  }
  this.dc_chatlist = dc_chatlist
}

ChatList.prototype.getChatId = function (index) {
  return binding.dcn_chatlist_get_chat_id(this.dc_chatlist, index)
}

ChatList.prototype.getCount = function () {
  return binding.dcn_chatlist_get_cnt(this.dc_chatlist)
}

ChatList.prototype.getMsgId = function (index) {
  return binding.dcn_chatlist_get_msg_id(this.dc_chatlist, index)
}

ChatList.prototype.getSummary = function (index, chat) {
  const dc_chat = chat && chat.dc_chat || null
  console.log('passed in dc_chat', dc_chat)
  return binding.dcn_chatlist_get_summary(this.dc_chatlist, index, dc_chat)
  // TODO We should return a wrapped object here
  // const dc_lot = binding.dcn_chatlist_get_summary(this.dc_chatlist, index, dc_chat)
  // return Lot(dc_lot)
}

/**
 *
 */
function Contact (dc_contact) {
  if (!(this instanceof Contact)) {
    return new Contact(dc_contact)
  }
  this.dc_contact = dc_contact
}

Contact.prototype.getAddr = function () {
  return binding.dcn_contact_get_addr(this.dc_contact)
}

Contact.prototype.getDisplayName = function () {
  return binding.dcn_contact_get_display_name(this.dc_contact)
}

Contact.prototype.getFirstName = function () {
  return binding.dcn_contact_get_first_name(this.dc_contact)
}

Contact.prototype.getId = function () {
  return binding.dcn_contact_get_id(this.dc_contact)
}

Contact.prototype.getName = function () {
  return binding.dcn_contact_get_name(this.dc_contact)
}

Contact.prototype.getNameNAddr = function () {
  return binding.dcn_contact_get_name_n_addr(this.dc_contact)
}

Contact.prototype.isBlocked = function () {
  return binding.dcn_contact_is_blocked(this.dc_contact)
}

Contact.prototype.isVerified = function () {
  return binding.dcn_contact_is_verified(this.dc_contact)
}

/**
 *
 */
function DeltaChat (opts) {
  if (!(this instanceof DeltaChat)) {
    return new DeltaChat(opts)
  }

  EventEmitter.call(this)

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

DeltaChat.prototype.configure = function () {
  return binding.dcn_configure(this.dcn_context)
}

DeltaChat.prototype.createChatByContactId = function (contactId) {
  return binding.dcn_create_chat_by_contact_id(this.dcn_context, contactId)
}

DeltaChat.prototype.createChatByMsgId = function (msgId) {
  return binding.dcn_create_chat_by_msg_id(this.dcn_context, msgId)
}

DeltaChat.prototype.createContact = function (name, addr) {
  return binding.dcn_create_contact(this.dcn_context, name, addr)
}

DeltaChat.prototype.createGroupChat = function (verified, chatName) {
  return binding.dcn_create_group_chat(this.dcn_context, verified, chatName)
}

DeltaChat.prototype.getChat = function (chatId) {
  const dc_chat = binding.dcn_get_chat(this.dcn_context, chatId)
  if (dc_chat === null) {
    // TODO callback with error
    throw new Error(`No chat found with id ${chatId}`)
  }
  return Chat(dc_chat)
}

DeltaChat.prototype.getChatList = function (listFlags, queryStr, queryContactId) {
  // TODO figure out how to do flags correctly, compare with the docs for
  // https://deltachat.github.io/api/classdc__context__t.html#a709a7b5b9b606d85f21e988e89d99fef
  if (!listFlags) listFlags = 0
  if (!queryStr) queryStr = ''
  if (!queryContactId) queryContactId = 0

  const dc_chatlist = binding.dcn_get_chatlist(this.dcn_context,
                                               listFlags,
                                               queryStr,
                                               queryContactId)
  return ChatList(dc_chatlist)
}

DeltaChat.prototype.getConfig = function (key, def) {
  return binding.dcn_get_config(this.dcn_context, key, def)
}

DeltaChat.prototype.getConfigInt = function (key, def) {
  return binding.dcn_get_config_int(this.dcn_context, key, def)
}

DeltaChat.prototype.getContact = function (contactId) {
  const dc_contact = binding.dcn_get_contact(this.dcn_context, contactId)
  if (dc_contact === null) {
    // TODO callback with error
    throw new Error(`No contact found with id ${contactId}`)
  }
  return Contact(dc_contact)
}

DeltaChat.prototype.getInfo = function () {
  return binding.dcn_get_info(this.dcn_context)
}

DeltaChat.prototype.isConfigured = function () {
  return binding.dcn_is_configured(this.dcn_context)
}

DeltaChat.prototype.open = function (dbFile, blobDir) {
  return binding.dcn_open(this.dcn_context, dbFile, blobDir)
}

DeltaChat.prototype.sendTextMsg = function (chatId, text) {
  return binding.dcn_send_text_msg(this.dcn_context, chatId, text)
}

DeltaChat.prototype.setConfig = function (key, value) {
  return binding.dcn_set_config(this.dcn_context, key, value)
}

DeltaChat.prototype.setConfigInt = function (key, value) {
  return binding.dcn_set_config_int(this.dcn_context, key, value)
}

DeltaChat.prototype.setEventHandler = function (cb) {
  return binding.dcn_set_event_handler(this.dcn_context, cb)
}

DeltaChat.prototype.setOffline = function (isOffline) {
  return binding.dcn_set_offline(this.dcn_context, isOffline)
}

DeltaChat.prototype.startThreads = function () {
  return binding.dcn_start_threads(this.dcn_context)
}

DeltaChat.prototype.stopThreads = function () {
  return binding.dcn_stop_threads(this.dcn_context)
}

DeltaChat.prototype.unsetEventHandler = function () {
  return binding.dcn_unset_event_handler(this.dcn_context)
}

inherits(DeltaChat, EventEmitter)

module.exports = DeltaChat
