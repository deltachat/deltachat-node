/* eslint-disable camelcase */
const binding = require('./binding')
const EventEmitter = require('events').EventEmitter
const inherits = require('util').inherits
const xtend = require('xtend')
const path = require('path')
const debug = require('debug')('deltachat')

const DEFAULTS = { root: process.cwd() }

function DeltaChat (opts) {
  if (!(this instanceof DeltaChat)) {
    return new DeltaChat(opts)
  }

  EventEmitter.call(this)

  opts = xtend(DEFAULTS, opts || {})

  if (typeof opts.email !== 'string') throw new Error('Missing .email')
  if (typeof opts.password !== 'string') throw new Error('Missing .password')

  const dcn_context = binding.dcn_context_new()
  const dcn_context_t = binding.dcn_context_t

  Object.keys(dcn_context_t).forEach(key => {
    this[key] = (...args) => {
      args = [ dcn_context ].concat(args)
      return dcn_context_t[key].apply(null, args)
    }
  })

  this.dc_set_event_handler((event, data1, data2) => {
    debug('event', event, 'data1', data1, 'data2', data2)
  })

  this.dc_open(path.join(opts.root, 'db.sqlite'), '')

  if (!this.dc_is_configured()) {
    this.dc_set_config('addr', opts.email)
    this.dc_set_config('mail_pw', opts.password)
    this.dc_configure()
  }

  this.dc_start_threads()
}

inherits(DeltaChat, EventEmitter)

module.exports = DeltaChat
