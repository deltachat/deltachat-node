/* eslint-disable camelcase */

const binding = require('../binding')
const debug = require('debug')('deltachat:node:chat')

/**
 * Wrapper around dc_chat_t*
 */
export default class Chat {
  constructor (public dc_chat) {
    debug('Chat constructor')
  }

  getArchived ():boolean {
    return binding.dcn_chat_get_archived(this.dc_chat)
  }

  getColor ():number {
    return binding.dcn_chat_get_color(this.dc_chat)
  }

  getId ():number {
    return binding.dcn_chat_get_id(this.dc_chat)
  }

  getName ():string {
    return binding.dcn_chat_get_name(this.dc_chat)
  }

  getProfileImage ():string {
    return binding.dcn_chat_get_profile_image(this.dc_chat)
  }

  getSubtitle ():string {
    return binding.dcn_chat_get_subtitle(this.dc_chat)
  }

  getType ():number {
    return binding.dcn_chat_get_type(this.dc_chat)
  }

  isSelfTalk ():boolean {
    return Boolean(binding.dcn_chat_is_self_talk(this.dc_chat))
  }

  isUnpromoted ():boolean {
    return Boolean(binding.dcn_chat_is_unpromoted(this.dc_chat))
  }

  isVerified ():boolean {
    return Boolean(binding.dcn_chat_is_verified(this.dc_chat))
  }

  isDeviceTalk ():boolean {
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
