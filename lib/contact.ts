import { integerToHexColor } from './util'

/* eslint-disable camelcase */

const binding = require('../binding')
const debug = require('debug')('deltachat:node:contact')

interface NativeContact {}
/**
 * Wrapper around dc_contact_t*
 */
export class Contact {
  constructor(public dc_contact: NativeContact) {
    debug('Contact constructor')
  }

  toJson() {
    debug('toJson')
    return {
      address: this.getAddress(),
      color: this.color,
      displayName: this.getDisplayName(),
      firstName: this.getFirstName(),
      id: this.getId(),
      name: this.getName(),
      profileImage: this.getProfileImage(),
      nameAndAddr: this.getNameAndAddress(),
      isBlocked: this.isBlocked(),
      isVerified: this.isVerified(),
    }
  }

  getAddress(): string {
    return binding.dcn_contact_get_addr(this.dc_contact)
  }

  get color(): string {
    return integerToHexColor(binding.dcn_contact_get_color(this.dc_contact))
  }

  getDisplayName(): string {
    return binding.dcn_contact_get_display_name(this.dc_contact)
  }

  getFirstName(): string {
    return binding.dcn_contact_get_first_name(this.dc_contact)
  }

  getId(): number {
    return binding.dcn_contact_get_id(this.dc_contact)
  }

  getName(): string {
    return binding.dcn_contact_get_name(this.dc_contact)
  }

  getNameAndAddress(): string {
    return binding.dcn_contact_get_name_n_addr(this.dc_contact)
  }

  getProfileImage(): string {
    return binding.dcn_contact_get_profile_image(this.dc_contact)
  }

  isBlocked() {
    return Boolean(binding.dcn_contact_is_blocked(this.dc_contact))
  }

  isVerified() {
    return Boolean(binding.dcn_contact_is_verified(this.dc_contact))
  }
}
