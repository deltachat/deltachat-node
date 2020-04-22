/* eslint-disable camelcase */

import binding from '../binding'
import {C, EventId2EventName} from './constants'
import { EventEmitter } from 'events'
import {Chat} from './chat'
import {ChatList} from './chatlist'
import {Contact} from './contact'
import {Message} from './message'
import {Lot} from './lot'
import mkdirp from 'mkdirp'
import path from 'path'
import {Locations} from './locations'
import pick from 'lodash.pick'
import rawDebug from 'debug'
const debug = rawDebug('deltachat:node:index')

const noop = function () {}
const DC_SHOW_EMAILS = [
  C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS,
  C.DC_SHOW_EMAILS_ALL,
  C.DC_SHOW_EMAILS_OFF
]

interface NativeContext {}

/**
 * Wrapper around dcn_context_t*
 */
export class DeltaChat extends EventEmitter {
  dcn_context: NativeContext
  constructor () {
    debug('DeltaChat constructor')
    super()

    this.dcn_context = binding.dcn_context_new()
    binding.dcn_set_event_handler(this.dcn_context, (event, data1, data2) => {
      handleEvent(this, event, data1, data2)
    })
  }

  addAddressBook (addressBook:string) {
    debug(`addAddressBook ${addressBook}`)
    return binding.dcn_add_address_book(this.dcn_context, addressBook)
  }

  addContactToChat (chatId:number, contactId:number) {
    debug(`addContactToChat ${chatId} ${contactId}`)
    return Boolean(
      binding.dcn_add_contact_to_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  addDeviceMessage (label:string, msg:Message|string) {
    debug(`addDeviceMessage ${label} ${msg}`)
    if (!msg) {
      throw new Error('invalid msg parameter')
    }
    if (typeof label !== 'string') {
      throw new Error('invalid label parameter, must be a string')
    }
    if (typeof msg === 'string') {
      const msgObj = this.messageNew()
      msgObj.setText(msg)
      msg = msgObj
    }
    if (!msg.dc_msg) {
      throw new Error('invalid msg object')
    }
    return binding.dcn_add_device_msg(this.dcn_context, label, msg.dc_msg)
  }

  /** @deprecated use setChatVisibility instead */
  archiveChat (chatId:number, archive:boolean) {
    debug(`archiveChat ${chatId} ${archive}`)
    binding.dcn_archive_chat(
      this.dcn_context,
      Number(chatId),
      archive ? 1 : 0
    )
  }

  setChatVisibility(chatId:number, visibility: C.DC_CHAT_VISIBILITY_NORMAL | C.DC_CHAT_VISIBILITY_ARCHIVED | C.DC_CHAT_VISIBILITY_PINNED){
    debug(`setChatVisibility ${chatId} ${visibility}`)
    binding.dcn_set_chat_visibility(
      this.dcn_context,
      Number(chatId),
      visibility
    )
  }

  blockContact (contactId:number, block:boolean) {
    debug(`blockContact ${contactId} ${block}`)
    binding.dcn_block_contact(
      this.dcn_context,
      Number(contactId),
      block ? 1 : 0
    )
  }

  checkQrCode (qrCode:string) {
    debug(`checkQrCode ${qrCode}`)
    const dc_lot = binding.dcn_check_qr(this.dcn_context, qrCode)
    let result = dc_lot ? new Lot(dc_lot) : null
    if (result) {
      return {id: result.getId(), ...result.toJson()}
    }
    return result;
  }

  close (cb = noop) {
    debug('close')
    this.removeAllListeners()
    binding.dcn_close(this.dcn_context, cb)
  }

  configure (opts, cb?: () => void) {
    debug('configure')
    if (!opts) opts = {}
    const ready = () => {
      this.emit('ready')
      cb && cb()
    }

    if (typeof opts.addr !== 'string') {
      throw new Error('Missing .addr')
    }

    if (typeof opts.mail_pw !== 'string') {
      throw new Error('Missing .mail_pw')
    }

    this.once('_configured', ready)

    // set defaults
    const defaultOptions = ['e2ee_enabled', 'mdns_enabled', 'inbox_watch', 'sentbox_watch', 'mvbox_watch', 'mvbox_move']
    defaultOptions.map(
      option => {
        if (typeof opts[option] === 'undefined') opts[option] = 1
        this.setConfig(option, String(opts[option] ? 1 : 0))
      }
    )

    this.setConfig('addr', opts.addr)

    this.setConfig('mail_server', opts.mail_server)
    this.setConfig('mail_user', opts.mail_user)
    this.setConfig('mail_pw', opts.mail_pw)
    this.setConfig('mail_port', String(opts.mail_port))
    if ('imap_certificate_checks' in opts) {
      this.setConfig('imap_certificate_checks', String(opts.imap_certificate_checks))
    }

    this.setConfig('send_server', opts.send_server)
    this.setConfig('send_user', opts.send_user)
    this.setConfig('send_pw', opts.send_pw)
    this.setConfig('send_port', String(opts.send_port))
    if ('smtp_certificate_checks' in opts) {
      this.setConfig('smtp_certificate_checks', String(opts.smtp_certificate_checks))
    }

    this.setConfig('server_flags', String(opts.server_flags))
    this.setConfig('displayname', opts.displayname)

    this.setConfig('selfstatus', opts.selfstatus)
    this.setConfig('selfavatar', opts.selfavatar)

    if (DC_SHOW_EMAILS.indexOf(opts.show_emails) !== -1) {
      this.setConfig('show_emails', String(opts.show_emails))
    }

    this.setConfig('save_mime_headers', String(opts.save_mime_headers ? 1 : 0))

    binding.dcn_configure(this.dcn_context)
  }

  continueKeyTransfer (messageId:number, setupCode:string, cb:(err:Error)=>void) {
    debug(`continueKeyTransfer ${messageId}`)
    binding.dcn_continue_key_transfer(this.dcn_context, Number(messageId), setupCode, result => {
      if (result === 0) {
        return cb(new Error('Key transfer failed due to bad setup code'))
      }
      cb(null)
    })
  }


  /** @returns chatId */
  createChatByContactId (contactId:number):number {
    debug(`createChatByContactId ${contactId}`)
    return binding.dcn_create_chat_by_contact_id(
      this.dcn_context,
      Number(contactId)
    )
  }
  /** @returns chatId */
  createChatByMessageId (messageId:number):number {
    debug(`createChatByMessageId ${messageId}`)
    return binding.dcn_create_chat_by_msg_id(
      this.dcn_context,
      Number(messageId)
    )
  }

  /** @returns contactId */
  createContact (name:string, addr:string):number {
    debug(`createContact ${name} ${addr}`)
    return binding.dcn_create_contact(this.dcn_context, name, addr)
  }

  /** @returns chatId */
  createUnverifiedGroupChat (chatName:string):number {
    debug(`createUnverifiedGroupChat ${chatName}`)
    return binding.dcn_create_group_chat(this.dcn_context, 0, chatName)
  }

  /** @returns chatId */
  createVerifiedGroupChat (chatName:string):number {
    debug(`createVerifiedGroupChat ${chatName}`)
    return binding.dcn_create_group_chat(this.dcn_context, 1, chatName)
  }

  deleteChat (chatId:number) {
    debug(`deleteChat ${chatId}`)
    binding.dcn_delete_chat(this.dcn_context, Number(chatId))
  }

  deleteContact (contactId:number) {
    debug(`deleteContact ${contactId}`)
    return Boolean(
      binding.dcn_delete_contact(
        this.dcn_context,
        Number(contactId)
      )
    )
  }

  deleteMessages (messageIds:number[]) {
    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('deleteMessages', messageIds)
    binding.dcn_delete_msgs(this.dcn_context, messageIds)
  }

  forwardMessages (messageIds:number[], chatId:number) {
    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('forwardMessages', messageIds)
    binding.dcn_forward_msgs(this.dcn_context, messageIds, chatId)
  }

  getBlobdir ():string {
    debug('getBlobdir')
    return binding.dcn_get_blobdir(this.dcn_context)
  }

  getBlockedCount ():number {
    debug('getBlockedCount')
    return binding.dcn_get_blocked_cnt(this.dcn_context)
  }

  getBlockedContacts ():number[] {
    debug('getBlockedContacts')
    return binding.dcn_get_blocked_contacts(this.dcn_context)
  }

  getChat (chatId:number) {
    debug(`getChat ${chatId}`)
    const dc_chat = binding.dcn_get_chat(this.dcn_context, Number(chatId))
    return dc_chat ? new Chat(dc_chat) : null
  }

  getChatContacts (chatId:number):number[] {
    debug(`getChatContacts ${chatId}`)
    return binding.dcn_get_chat_contacts(this.dcn_context, Number(chatId))
  }

  getChatIdByContactId (contactId:number):number {
    debug(`getChatIdByContactId ${contactId}`)
    return binding.dcn_get_chat_id_by_contact_id(this.dcn_context, Number(contactId))
  }

  getChatMedia (chatId:number, msgType1:number, msgType2:number, msgType3:number):number[] {
    debug(`getChatMedia ${chatId}`)
    return binding.dcn_get_chat_media(
      this.dcn_context,
      Number(chatId),
      msgType1,
      msgType2 || 0,
      msgType3 || 0
    )
  }

  getMimeHeaders (messageId:number):string {
    debug(`getMimeHeaders ${messageId}`)
    return binding.dcn_get_mime_headers(this.dcn_context, Number(messageId))
  }

  getChatMessages (chatId:number, flags, marker1before) {
    debug(`getChatMessages ${chatId} ${flags} ${marker1before}`)
    return binding.dcn_get_chat_msgs(
      this.dcn_context,
      Number(chatId),
      flags,
      marker1before
    )
  }

  getChats (listFlags:number, queryStr:string, queryContactId:number) {
    debug('getChats')
    const result = []
    const list = this.getChatList(listFlags, queryStr, queryContactId)
    const count = list.getCount()
    for (let i = 0; i < count; i++) {
      result.push(list.getChatId(i))
    }
    return result
  }

  getChatList (listFlags:number, queryStr:string, queryContactId:number) {
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

  static getConfig (dir:string, cb:(err:Error, result)=>void) {
    debug(`DeltaChat.getConfig ${dir}`)
    const dcn_context = binding.dcn_context_new()
    const db = dir.endsWith('db.sqlite') ? dir : path.join(dir, 'db.sqlite')
    const done = (err, result) => {
      binding.dcn_close(dcn_context, () => {
        debug(`closed context for getConfig ${dir}`)
      })
      cb(err, result)
    }
    binding.dcn_open(dcn_context, db, '', err => {
      if (err) return done(err, null)
      if (binding.dcn_is_configured(dcn_context)) {
        const addr = binding.dcn_get_config(dcn_context, 'addr')
        return done(null, { addr })
      }
      done(null, {})
    })
  }

  getConfig (key:string):string {
    debug(`getConfig ${key}`)
    return binding.dcn_get_config(this.dcn_context, key)
  }

  getContact (contactId:number) {
    debug(`getContact ${contactId}`)
    const dc_contact = binding.dcn_get_contact(
      this.dcn_context,
      Number(contactId)
    )
    return dc_contact ? new Contact(dc_contact) : null
  }

  getContactEncryptionInfo (contactId:number) {
    debug(`getContactEncryptionInfo ${contactId}`)
    return binding.dcn_get_contact_encrinfo(this.dcn_context, Number(contactId))
  }

  getContacts (listFlags:number, query:string) {
    listFlags = listFlags || 0
    query = query || ''
    debug(`getContacts ${listFlags} ${query}`)
    return binding.dcn_get_contacts(this.dcn_context, listFlags, query)
  }

  updateDeviceChats () {
    debug('updateDeviceChats')
    binding.dcn_update_device_chats(this.dcn_context)
  }

  wasDeviceMessageEverAdded (label:string) {
    debug(`wasDeviceMessageEverAdded ${label}`)
    const added = binding.dcn_was_device_msg_ever_added(this.dcn_context, label)
    return added === 1
  }

  getDraft (chatId:number) {
    debug(`getDraft ${chatId}`)
    const dc_msg = binding.dcn_get_draft(this.dcn_context, Number(chatId))
    return dc_msg ? new Message(dc_msg) : null
  }

  getFreshMessageCount (chatId:number):number {
    debug(`getFreshMessageCount ${chatId}`)
    return binding.dcn_get_fresh_msg_cnt(this.dcn_context, Number(chatId))
  }

  getFreshMessages () {
    debug('getFreshMessages')
    return binding.dcn_get_fresh_msgs(this.dcn_context)
  }

  getInfo () {
    debug('getInfo')
    return DeltaChat._getInfo(this.dcn_context)
  }

  static _getInfo (dcn_context:NativeContext) {
    debug('static _getInfo')
    const result = {}

    const regex = /^(\w+)=(.*)$/i
    binding.dcn_get_info(dcn_context)
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

  getMessage (messageId:number) {
    debug(`getMessage ${messageId}`)
    const dc_msg = binding.dcn_get_msg(this.dcn_context, Number(messageId))
    return dc_msg ? new Message(dc_msg) : null
  }

  getMessageCount (chatId:number):number {
    debug(`getMessageCount ${chatId}`)
    return binding.dcn_get_msg_cnt(this.dcn_context, Number(chatId))
  }

  getMessageInfo (messageId:number):string {
    debug(`getMessageInfo ${messageId}`)
    return binding.dcn_get_msg_info(this.dcn_context, Number(messageId))
  }

  getNextMediaMessage (messageId:number, msgType1:number, msgType2:number, msgType3:number) {
    debug(`getNextMediaMessage ${messageId} ${msgType1} ${msgType2} ${msgType3}`)
    return this._getNextMedia(
      messageId,
      1,
      msgType1,
      msgType2,
      msgType3
    )
  }

  getPreviousMediaMessage (messageId:number, msgType1:number, msgType2:number, msgType3:number) {
    debug(`getPreviousMediaMessage ${messageId} ${msgType1} ${msgType2} ${msgType3}`)
    return this._getNextMedia(
      messageId,
      -1,
      msgType1,
      msgType2,
      msgType3
    )
  }

  _getNextMedia (messageId:number, dir:number, msgType1:number, msgType2:number, msgType3:number):number {
    return binding.dcn_get_next_media(
      this.dcn_context,
      Number(messageId),
      dir,
      msgType1 || 0,
      msgType2 || 0,
      msgType3 || 0
    )
  }

  static getProviderFromEmail (email:string) {
    debug('DeltaChat.getProviderFromEmail')
    const dcn_context = binding.dcn_context_new()
    const provider = binding.dcn_provider_new_from_email(dcn_context, email)
    binding.dcn_close(dcn_context, () => {
      debug('closed context for getProviderFromEmail')
    })
    if (!provider) {
      return undefined
    }
    return {
      before_login_hint: binding.dcn_provider_get_before_login_hint(provider),
      overview_page: binding.dcn_provider_get_overview_page(provider),
      status: binding.dcn_provider_get_status(provider)
    }
  }

  getSecurejoinQrCode (chatId:number) {
    debug(`getSecurejoinQrCode ${chatId}`)
    return binding.dcn_get_securejoin_qr(this.dcn_context, Number(chatId))
  }

  getStarredMessages () {
    debug('getStarredMessages')
    return this.getChatMessages(C.DC_CHAT_ID_STARRED, 0, 0)
  }

  static getSystemInfo () {
    debug('DeltaChat.getSystemInfo')
    const dcn_context = binding.dcn_context_new()
    const info = DeltaChat._getInfo(dcn_context)
    const result = pick(info, [
      'deltachat_core_version',
      'sqlite_version',
      'sqlite_thread_safe',
      'libetpan_version',
      'openssl_version',
      'compile_date',
      'arch'
    ])
    binding.dcn_close(dcn_context, () => {
      debug('closed context for getSystemInfo')
    })
    return result
  }

  importExport (what:number, param1:string, param2='') {
    debug(`importExport ${what} ${param1} ${param2}`)
    binding.dcn_imex(this.dcn_context, what, param1, param2)
  }

  importExportHasBackup (dir) {
    debug(`importExportHasBackup ${dir}`)
    return binding.dcn_imex_has_backup(this.dcn_context, dir)
  }

  initiateKeyTransfer (cb:(err:Error, statusCode:any)=>void) {
    debug('initiateKeyTransfer')
    return binding.dcn_initiate_key_transfer(this.dcn_context, statusCode => {
      if (typeof statusCode === 'string') {
        return cb(null, statusCode)
      }
      cb(new Error('Could not initiate key transfer'), null)
    })
  }

  isConfigured () {
    debug('isConfigured')
    return Boolean(binding.dcn_is_configured(this.dcn_context))
  }

  isContactInChat (chatId:number, contactId:number) {
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

  joinSecurejoin (qrCode:string, callback: (result: number) => void) {
    debug(`joinSecurejoin ${qrCode}`)
    if (!callback || typeof callback !== 'function') {
      throw new Error('callback required')
    }
    binding.dcn_join_securejoin(this.dcn_context, qrCode, callback)
  }

  lookupContactIdByAddr (addr:string) {
    debug(`lookupContactIdByAddr ${addr}`)
    return Boolean(
      binding.dcn_lookup_contact_id_by_addr(this.dcn_context, addr)
    )
  }

  markNoticedChat (chatId:number) {
    debug(`markNoticedChat ${chatId}`)
    binding.dcn_marknoticed_chat(this.dcn_context, Number(chatId))
  }

  markNoticedAllChats () {
    debug('markNoticedAllChats')
    binding.dcn_marknoticed_all_chats(this.dcn_context)
  }

  markNoticedContact (contactId:number) {
    debug(`markNoticedContact ${contactId}`)
    binding.dcn_marknoticed_contact(this.dcn_context, Number(contactId))
  }

  markSeenMessages (messageIds:number[]) {
    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('markSeenMessages', messageIds)
    binding.dcn_markseen_msgs(this.dcn_context, messageIds)
  }

  static maybeValidAddr (addr:string) {
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

  open (cwd:string, cb:(err:Error)=>void) {
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
        cb(null)
      })
    })
  }

  removeContactFromChat (chatId:number, contactId:number) {
    debug(`removeContactFromChat ${chatId} ${contactId}`)
    return Boolean(
      binding.dcn_remove_contact_from_chat(
        this.dcn_context,
        Number(chatId),
        Number(contactId)
      )
    )
  }

  searchMessages (chatId:number, query:string):number[] {
    debug(`searchMessages ${chatId} ${query}`)
    return binding.dcn_search_msgs(this.dcn_context, Number(chatId), query)
  }

  sendMessage (chatId:number, msg:string|Message) {
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

  setChatName (chatId:number, name:string) {
    debug(`setChatName ${chatId} ${name}`)
    return Boolean(
      binding.dcn_set_chat_name(
        this.dcn_context,
        Number(chatId),
        name
      )
    )
  }

  setChatProfileImage (chatId:number, image:string) {
    debug(`setChatProfileImage ${chatId} ${image}`)
    return Boolean(
      binding.dcn_set_chat_profile_image(
        this.dcn_context,
        Number(chatId),
        image || ''
      )
    )
  }

  setConfig (key:string, value:string) {
    debug(`setConfig ${key} ${value}`)
    return binding.dcn_set_config(this.dcn_context, key, value || '')
  }

  setStockTranslation (stockId:number, stockMsg:string) {
    debug(`setStockTranslation ${stockId} ${stockMsg}`)
    return Boolean(binding.dcn_set_stock_translation(this.dcn_context, Number(stockId), stockMsg))
  }

  setDraft (chatId:number, msg:Message) {
    debug(`setDraft ${chatId}`)
    binding.dcn_set_draft(
      this.dcn_context,
      Number(chatId),
      msg ? msg.dc_msg : null
    )
  }

  setLocation (latitude:number, longitude:number, accuracy:number) {
    debug(`setLocation ${latitude}`)
    binding.dcn_set_location(
      this.dcn_context,
      Number(latitude),
      Number(longitude),
      Number(accuracy)
    )
  }

  /*
   * @param chatId Chat-id to get location information for.
   *     0 to get locations independently of the chat.
   * @param contactId Contact id to get location information for.
   *     If also a chat-id is given, this should be a member of the given chat.
   *     0 to get locations independently of the contact.
   * @param timestampFrom Start of timespan to return.
   *     Must be given in number of seconds since 00:00 hours, Jan 1, 1970 UTC.
   *     0 for "start from the beginning".
   * @param timestampTo End of timespan to return.
   *     Must be given in number of seconds since 00:00 hours, Jan 1, 1970 UTC.
   *     0 for "all up to now".
   * @return Array of locations, NULL is never returned.
   *     The array is sorted decending;
   *     the first entry in the array is the location with the newest timestamp.
   *
   * Examples:
   * // get locations from the last hour for a global map
   * getLocations(0, 0, time(NULL)-60*60, 0);
   *
   * // get locations from a contact for a global map
   * getLocations(0, contact_id, 0, 0);
   *
   * // get all locations known for a given chat
   * getLocations(chat_id, 0, 0, 0);
   *
   * // get locations from a single contact for a given chat
   * getLocations(chat_id, contact_id, 0, 0);
   */

  getLocations (chatId:number, contactId:number, timestampFrom = 0, timestampTo = 0) {
    const locations = new Locations(binding.dcn_get_locations(
      this.dcn_context,
      Number(chatId),
      Number(contactId),
      timestampFrom,
      timestampTo
    ))
    return locations.toJson()
  }

  starMessages (messageIds:number[], star:boolean) {
    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds]
    }
    messageIds = messageIds.map(id => Number(id))
    debug('starMessages', messageIds)
    binding.dcn_star_msgs(this.dcn_context, messageIds, star ? 1 : 0)
  }
}

function handleEvent (self:DeltaChat, event:number, data1, data2) {
  debug('event', event, 'data1', data1, 'data2', data2)

  self.emit('ALL', event, data1, data2)

  const eventStr = EventId2EventName[event]

  if(typeof eventStr === "undefined") {
    debug(`Unknown event ${eventStr}`)
    return;
  }

  switch (event) {
    case C.DC_EVENT_INFO:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_SMTP_CONNECTED:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_IMAP_CONNECTED:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_SMTP_MESSAGE_SENT:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_IMAP_MESSAGE_DELETED:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_IMAP_MESSAGE_MOVED:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_NEW_BLOB_FILE:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_DELETED_BLOB_FILE:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_WARNING:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_ERROR:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_ERROR_SELF_NOT_IN_GROUP:
      self.emit(eventStr, data2)
      break
    case C.DC_EVENT_CHAT_MODIFIED:
      self.emit(eventStr, data1)
      break
    case C.DC_EVENT_CONTACTS_CHANGED:
      self.emit(eventStr, data1)
      break
    case C.DC_EVENT_LOCATION_CHANGED:
      self.emit(eventStr, data1)
      break
    case C.DC_EVENT_CONFIGURE_PROGRESS:
      if (data1 === 1000) self.emit('_configured')
      self.emit(eventStr, data1)
      break
    case C.DC_EVENT_IMEX_PROGRESS:
      self.emit(eventStr, data1)
      break
    case C.DC_EVENT_IMEX_FILE_WRITTEN:
      self.emit(eventStr, data1)
      break
    default:
      self.emit(eventStr, data1, data2)
      break
  }
}