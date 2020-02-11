/* eslint-disable camelcase */

import binding from '../binding'
import {C} from './constants'
import Lot from './lot'
import Chat from './chat'
const debug = require('debug')('deltachat:node:message')

/**
 * Helper class for message states so you can do e.g.
 *
 * if (msg.getState().isPending()) { .. }
 *
 */
export class MessageState {
  constructor (public state:number) {
    debug(`MessageState constructor ${state}`)
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
 * if (msg.getViewType().isVideo()) { .. }
 *
 */
export class MessageViewType {
  constructor (public viewType:number) {
    debug(`MessageViewType constructor ${viewType}`)
  }

  isText () {
    return this.viewType === C.DC_MSG_TEXT
  }

  isImage () {
    return this.viewType === C.DC_MSG_IMAGE || this.viewType === C.DC_MSG_GIF
  }

  isGif () {
    return this.viewType === C.DC_MSG_GIF
  }

  isAudio () {
    return this.viewType === C.DC_MSG_AUDIO || this.viewType === C.DC_MSG_VOICE
  }

  isVoice () {
    return this.viewType === C.DC_MSG_VOICE
  }

  isVideo () {
    return this.viewType === C.DC_MSG_VIDEO
  }

  isFile () {
    return this.viewType === C.DC_MSG_FILE
  }
}

/**
 * Wrapper around dc_msg_t*
 */
export default class Message {
  constructor (public dc_msg) {
    debug('Message constructor')
  }

  toJson () {
    debug('toJson')
    return {
      chatId: this.getChatId(),
      duration: this.getDuration(),
      file: this.getFile(),
      fromId: this.getFromId(),
      id: this.getId(),
      receivedTimestamp: this.getReceivedTimestamp(),
      sortTimestamp: this.getSortTimestamp(),
      text: this.getText(),
      timestamp: this.getTimestamp(),
      hasLocation: this.hasLocation(),
      viewType: binding.dcn_msg_get_viewtype(this.dc_msg),
      state: binding.dcn_msg_get_state(this.dc_msg),
      hasDeviatingTimestamp: this.hasDeviatingTimestamp(),
      showPadlock: this.getShowpadlock(),
      summary: this.getSummary().toJson(),
      isSetupmessage: this.isSetupmessage(),
      isInfo: this.isInfo(),
      isForwarded: this.isForwarded(),
      dimensions: {
        height: this.getHeight(),
        width: this.getWidth()
      }
    }
  }

  getChatId ():number {
    return binding.dcn_msg_get_chat_id(this.dc_msg)
  }

  getDuration ():number {
    return binding.dcn_msg_get_duration(this.dc_msg)
  }

  getFile ():string {
    return binding.dcn_msg_get_file(this.dc_msg)
  }

  getFilebytes ():number {
    return binding.dcn_msg_get_filebytes(this.dc_msg)
  }

  getFilemime ():string {
    return binding.dcn_msg_get_filemime(this.dc_msg)
  }

  getFilename ():string {
    return binding.dcn_msg_get_filename(this.dc_msg)
  }

  getFromId ():number {
    return binding.dcn_msg_get_from_id(this.dc_msg)
  }

  getHeight ():number {
    return binding.dcn_msg_get_height(this.dc_msg)
  }

  getId ():number {
    return binding.dcn_msg_get_id(this.dc_msg)
  }

  getReceivedTimestamp ():number {
    return binding.dcn_msg_get_received_timestamp(this.dc_msg)
  }

  getSetupcodebegin () {
    return binding.dcn_msg_get_setupcodebegin(this.dc_msg)
  }

  getShowpadlock () {
    return Boolean(binding.dcn_msg_get_showpadlock(this.dc_msg))
  }

  getSortTimestamp ():number {
    return binding.dcn_msg_get_sort_timestamp(this.dc_msg)
  }

  getState () {
    return new MessageState(binding.dcn_msg_get_state(this.dc_msg))
  }

  getSummary (chat?:Chat) {
    const dc_chat = (chat && chat.dc_chat) || null
    return new Lot(binding.dcn_msg_get_summary(this.dc_msg, dc_chat))
  }

  getSummarytext (approxCharacters):string {
    approxCharacters = approxCharacters || 0
    return binding.dcn_msg_get_summarytext(this.dc_msg, approxCharacters)
  }

  getText ():string {
    return binding.dcn_msg_get_text(this.dc_msg)
  }

  getTimestamp ():number {
    return binding.dcn_msg_get_timestamp(this.dc_msg)
  }

  getViewType () {
    return new MessageViewType(binding.dcn_msg_get_viewtype(this.dc_msg))
  }

  getWidth ():number {
    return binding.dcn_msg_get_width(this.dc_msg)
  }

  hasDeviatingTimestamp () {
    return binding.dcn_msg_has_deviating_timestamp(this.dc_msg)
  }

  hasLocation () {
    return Boolean(binding.dcn_msg_has_location(this.dc_msg))
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

  latefilingMediasize (width:number, height:number, duration:number) {
    binding.dcn_msg_latefiling_mediasize(this.dc_msg, width, height, duration)
  }

  setDimension (width:number, height:number) {
    binding.dcn_msg_set_dimension(this.dc_msg, width, height)
    return this
  }

  setDuration (duration:number) {
    binding.dcn_msg_set_duration(this.dc_msg, duration)
    return this
  }

  setFile (file:string, mime) {
    if (typeof file !== 'string') throw new Error('Missing filename')
    binding.dcn_msg_set_file(this.dc_msg, file, mime || '')
    return this
  }

  setLocation (longitude:number, latitude:number) {
    binding.dcn_msg_set_location(this.dc_msg, longitude, latitude)
    return this
  }

  setText (text:string) {
    binding.dcn_msg_set_text(this.dc_msg, text)
    return this
  }
}
