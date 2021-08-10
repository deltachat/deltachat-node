/* eslint-disable camelcase */

import binding from '../binding'
import { C, EventId2EventName } from './constants'
import { EventEmitter } from 'events'
import { Chat } from './chat'
import { ChatList } from './chatlist'
import { Contact } from './contact'
import { Message } from './message'
import { Lot } from './lot'
import { mkdtempSync } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { Locations } from './locations'
import pick from 'lodash.pick'
import rawDebug from 'debug'
import { tmpdir } from 'os'
import { join } from 'path'
import { Context } from './context'
const debug = rawDebug('deltachat:node:index')

const noop = function () {}
const DC_SHOW_EMAILS = [
  C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS,
  C.DC_SHOW_EMAILS_ALL,
  C.DC_SHOW_EMAILS_OFF,
]
interface NativeContext {}
interface NativeAccount {}

/**
 * Wrapper around dcn_context_t*
 */
export class DeltaChat extends EventEmitter {
  dcn_context: NativeContext
  dcn_account: NativeAccount
  _isOpen: boolean
  constructor() {
    debug('DeltaChat constructor')
    super()
    this._isOpen = false
    this.dcn_account = null
    this.dcn_context = null
  }

  isOpen() {
    return this._isOpen
  }

  async open(cwd: string, start_event_handler = true, os = 'deltachat-node') {
    if (this._isOpen === true) {
      throw new Error("We're already open!")
    }

    await mkdir(cwd, { recursive: true })

    const dbFile = path.join(cwd, 'db.sqlite')

    this.dcn_account = binding.dcn_account_new(os, cwd)
    debug('Opened account')
    if (start_event_handler) {
      binding.dcn_account_start_event_handler(
        this.dcn_account,
        this.handleCoreEvent.bind(this)
      )
      debug('Started event handler')
    }
    this._isOpen = true
  }

  accounts() {
    return binding.dcn_accounts_get_all(this.dcn_account)
  }

  select_account(account_id: number) {
    return binding.dcn_accounts_select_account(this.dcn_account, account_id)
  }

  selected_account(): number {
    return binding.dcn_accounts_get_selected_account(this.dcn_account)
  }

  add_account(): number {
    return binding.dc_accounts_add_account(this.dcn_account)
  }

  remove_account(account_id: number) {
    return binding.dcn_accounts_remove_account(this.dcn_account, account_id)
  }

  account_context(account_id: number) {
    const native_context = binding.dcn_accounts_get_account(
      this.dcn_account,
      account_id
    )
    return new Context(native_context)
  }

  close() {
    if (this._isOpen === false) {
      throw new Error("We're already closed!")
    }

    debug('unrefing context')
    binding.dcn_account_unref(this.dcn_account)
    debug('Unref end')

    this._isOpen = false
  }

  emit(event: string | symbol, account_id: number, ...args: any[]): boolean {
    super.emit('ALL', event, ...args)
    return super.emit(event, ...args)
  }

  handleCoreEvent(
    eventId: number,
    accountId: number,
    data1: number,
    data2: number | string
  ) {
    const eventString = EventId2EventName[eventId]
    debug(eventString, data1, data2)
    if (!this.emit) {
      console.log('Received an event but EventEmitter is already destroyed.')
      console.log(eventString, data1, data2)
      return
    }
    this.emit(eventString, accountId, data1, data2)
  }

  startIO() {
    binding.dcn_account_start_io(this.dcn_account)
  }

  stopIO() {
    binding.dcn_account_stop_io(this.dcn_account)
  }

  static async createTempUser(url: string) {
    const fetch = require('node-fetch')

    async function postData(url = '') {
      // Default options are marked with *
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'cache-control': 'no-cache',
        },
        referrerPolicy: 'no-referrer', // no-referrer, *client
      })
      return response.json() // parses JSON response into native JavaScript objects
    }

    return await postData(url)
  }
}
