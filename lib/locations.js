/* eslint-disable camelcase */

const binding = require('../binding')
const debug = require('debug')('deltachat:locations')

/**
 * Wrapper around dc_location_t*
 */
class Locations {
  constructor (dc_locations) {
    this.dcn_context = binding.dcn_context_new()
    this.dc_locations = dc_locations
  }

  locationToJson (index) {
    return {
      acc: this.getAccuracy(index),
      lat: this.getLatitude(index),
      lon: this.getLongitude(index),
      tstamp: this.getTimestamp(index),
      contactId: this.getContactId(index),
      msgid: this.getMsgId(index),
      chatId: this.getChatId(index)
    }
  }

  toJson () {
    let locations = []
    const count = this.getCount()
    for (let index = 0; index < count; index++) {
      locations.push(this.locationToJson(index))
    }
    return locations
  }

  getCount () {
    return binding.dcn_array_get_cnt(this.dc_locations)
  }

  getAccuracy (index) {
    return binding.dcn_array_get_accuracy(this.dc_locations, index)
  }

  getLatitude (index) {
    return binding.dcn_array_get_latitude(this.dc_locations, index)
  }

  getLongitude (index) {
    return binding.dcn_array_get_longitude(this.dc_locations, index)
  }

  getTimestamp (index) {
    return binding.dcn_array_get_timestamp(this.dc_locations, index)
  }

  getMsgId (index) {
    return binding.dcn_array_get_msg_id(this.dc_locations, index)
  }

  getContactId (index) {
    return binding.dcn_array_get_contact_id(this.dc_locations, index)
  }
  
  getChatId (index) {
    return binding.dcn_array_get_chat_id(this.dc_locations, index)
  }

}

module.exports = Locations
