/* eslint-disable camelcase */

const binding = require('./binding')

/**
 * Wrapper around dc_contact_t*
 */
class Contact {
  constructor (dc_contact) {
    this.dc_contact = dc_contact
  }

  toJson () {
    return {
      address: this.getAddress(),
      displayName: this.getDisplayName(),
      firstName: this.getFirstName(),
      id: this.getId(),
      name: this.getName(),
      nameAndAddr: this.getNameAndAddress(),
      isBlocked: this.isBlocked(),
      isVerified: this.isVerified()
    }
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

  getProfileImage () {
    return binding.dcn_contact_get_profile_image(this.dc_contact)
  }

  isBlocked () {
    return Boolean(binding.dcn_contact_is_blocked(this.dc_contact))
  }

  isVerified () {
    return Boolean(binding.dcn_contact_is_verified(this.dc_contact))
  }
}

module.exports = Contact
