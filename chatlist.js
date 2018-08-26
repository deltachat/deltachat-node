/* eslint-disable camelcase */

const binding = require('./binding')
const Lot = require('./lot')

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

module.exports = ChatList
