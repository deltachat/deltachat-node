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

  Object.keys(binding)
    .sort()
    .filter(name => name !== 'dcn_context_new')
    .forEach(name => {
      const method = name.replace('dcn_', '')
      debug('binding', name, 'to', method)
      this[method] = (...args) => {
        args = [ dcn_context ].concat(args)
        binding[name].apply(null, args)
      }
    })

  this.set_event_handler((event, data1, data2) => {
    debug('event', event, 'data1', data1, 'data2', data2)
  })

  this.open(path.join(opts.root, 'db.sqlite'), '')

  if (!this.is_configured()) {
    this.set_config('addr', opts.email)
    this.set_config('mail_pw', opts.password)
    this.configure()
  }

  this.start_threads()
}

inherits(DeltaChat, EventEmitter)

module.exports = DeltaChat
