/* eslint-disable camelcase */

const binding = require('./binding')

/**
 * Wrapper around dc_lot_t*
 */
class Lot {
  constructor (dc_lot) {
    this.dc_lot = dc_lot
  }

  getId () {
    return binding.dcn_lot_get_id(this.dc_lot)
  }

  getState () {
    return binding.dcn_lot_get_state(this.dc_lot)
  }

  getText1 () {
    return binding.dcn_lot_get_text1(this.dc_lot)
  }

  getText1Meaning () {
    return binding.dcn_lot_get_text1_meaning(this.dc_lot)
  }

  getText2 () {
    return binding.dcn_lot_get_text2(this.dc_lot)
  }

  getTimestamp () {
    return binding.dcn_lot_get_timestamp(this.dc_lot)
  }
}

module.exports = Lot
