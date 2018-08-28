/* eslint-disable camelcase */

const binding = require('./binding')
const C = require('./constants')
const Lot = require('./lot')

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

  toJson () {
    return {
      chatId: this.getChatId(),
      duration: this.getDuration(),
      fromId: this.getFromId(),
      text: this.getText(),
      timestamp: this.getTimestamp(),
      type: binding.dcn_msg_get_type(this.dc_msg),
      summary: this.getSummary().toJson()
    }
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

module.exports = Message
