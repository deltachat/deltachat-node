/* eslint-disable camelcase */

const binding = require('../binding')
const debug = require('debug')('deltachat:locations')

/**
 * Wrapper around dc_location_t*
 */
class Locations {
  constructor (dc_locations) {
    debug('ChatList constructor')
    this.dcn_context = binding.dcn_context_new()
    this.dc_locations = dc_locations
  }

  locationToJson (index) {
    return {
      accuracy: this.getAccuracy(index),
      latitude: this.getLatitude(index),
      longitude: this.getLongitude(index),
    }
  }

  toJson () {
    let locations = []
    const items = binding.dcn_array_get_cnt(this.dc_locations)
    console.log('toJson items:' + items)
    for (let index = 0; index < items; index++) {
      locations.push(this.locationToJson(index))
    }
    return locations
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

}

module.exports = Locations
