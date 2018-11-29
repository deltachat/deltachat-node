/* eslint-disable camelcase */

const binding = require('./binding')

/**
 * Wrapper around dc_chat_t*
 */
class Chat {
  constructor (dc_chat) {
    this.dc_chat = dc_chat
  }

  toJson () {
    return {
      archived: this.getArchived(),
      id: this.getId(),
      name: this.getName(),
      profileImage: this.getProfileImage(),
      subtitle: this.getSubtitle(),
      isVerified: this.isVerified(),
      type: this.getType(),
      isUnpromoted: this.isUnpromoted(),
      isSelfTalk: this.isSelfTalk()
    }
  }

  getArchived () {
    return binding.dcn_chat_get_archived(this.dc_chat)
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

module.exports = Chat
