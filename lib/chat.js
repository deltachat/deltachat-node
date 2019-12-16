/* eslint-disable camelcase */

const binding = require('../binding')
const debug = require('debug')('deltachat:node:chat')

const { integerToHexColor } = require('./util')

/**
 * Wrapper around dc_chat_t*
 */
class Chat {
  constructor (dc_chat) {
    debug('Chat constructor')
    this.dc_chat = dc_chat
  }

  getArchived () {
    return Boolean(binding.dcn_chat_get_archived(this.dc_chat))
  }

  /**
   * @returns {number}
   */
  getColor () {
    return binding.dcn_chat_get_color(this.dc_chat)
  }

  getHexColor () {
    const color_int = binding.dcn_chat_get_color(this.dc_chat)
    return integerToHexColor(color_int)
  }

  /**
   * @returns {number}
   */
  getId () {
    return binding.dcn_chat_get_id(this.dc_chat)
  }

  /**
   * @returns {string}
   */
  getName () {
    return binding.dcn_chat_get_name(this.dc_chat)
  }

  /**
   * @returns {string}
   */
  getProfileImage () {
    return binding.dcn_chat_get_profile_image(this.dc_chat)
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

  isDeviceTalk () {
    return Boolean(binding.dcn_chat_is_device_talk(this.dc_chat))
  }

  toJson () {
    debug('toJson')
    return {
      archived: this.getArchived(),
      color: this.getColor(),
      id: this.getId(),
      name: this.getName(),
      profileImage: this.getProfileImage(),
      subtitle: this.getSubtitle(),
      type: this.getType(),
      isSelfTalk: this.isSelfTalk(),
      isUnpromoted: this.isUnpromoted(),
      isVerified: this.isVerified(),
      isDeviceTalk: this.isDeviceTalk()
    }
  }
}

module.exports = Chat
