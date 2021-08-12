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
  dcn_account: NativeAccount
  constructor(cwd: string, os = 'deltachat-node') {
    debug('DeltaChat constructor')
    super()
    this.dcn_account = binding.dcn_accounts_new(os, cwd)
  }

  accounts() {
    return binding.dcn_accounts_get_all(this.dcn_account)
  }

  selectAccount(account_id: number) {
    return binding.dcn_accounts_select_account(this.dcn_account, account_id)
  }

  selectedAccount(): number {
    return binding.dcn_accounts_get_selected_account(this.dcn_account)
  }

  addAccount(): number {
    return binding.dcn_accounts_add_account(this.dcn_account)
  }

  removeAccount(account_id: number) {
    return binding.dcn_accounts_remove_account(this.dcn_account, account_id)
  }

  accountContext(account_id: number) {
    const native_context = binding.dcn_accounts_get_account(
      this.dcn_account,
      account_id
    )
    return new Context(this, native_context)
  }

  close() {
    debug('unrefing context')
    binding.dcn_accounts_unref(this.dcn_account)
    debug('Unref end')
  }

  emit(event: string | symbol, account_id: number, ...args: any[]): boolean {
    super.emit('ALL', event, account_id, ...args)
    return super.emit(event, account_id, ...args)
  }

  handleCoreEvent(
    eventId: number,
    accountId: number,
    data1: number,
    data2: number | string
  ) {
    const eventString = EventId2EventName[eventId]
    console.log('event', eventString, accountId, data1, data2)
    debug(eventString, data1, data2)
    if (!this.emit) {
      console.log('Received an event but EventEmitter is already destroyed.')
      console.log(eventString, data1, data2)
      return
    }
    this.emit(eventString, accountId, data1, data2)
  }

  startEvents() {
    binding.dcn_accounts_start_event_handler(
      this.dcn_account,
      this.handleCoreEvent.bind(this)
    )
    debug('Started event handler')
  }

  startIO() {
    binding.dcn_accounts_start_io(this.dcn_account)
  }

  stopIO() {
    binding.dcn_accounts_stop_io(this.dcn_account)
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

  static maybeValidAddr(addr: string) {
    debug('DeltaChat.maybeValidAddr')
    if (addr === null) return false
    return Boolean(binding.dcn_maybe_valid_addr(addr))
  }

  static parseGetInfo(info: string) {
    debug('static _getInfo')
    const result = {}

    const regex = /^(\w+)=(.*)$/i
    info
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        const match = regex.exec(line)
        if (match) {
          result[match[1]] = match[2]
        }
      })

    return result
  }

  static newTemporary() {
    const tmp_path = join(tmpdir(), 'deltachat-')
    const dc = new DeltaChat(tmp_path)
    const accountId = dc.addAccount()
    const context = dc.accountContext(accountId)
    return { dc, context, accountId }
  }

  static getProviderFromEmail(email: string) {
    debug('DeltaChat.getProviderFromEmail')
    const { dc, context } = DeltaChat.newTemporary()
    const provider = binding.dcn_provider_new_from_email(
      context.dcn_context,
      email
    )
    context.unref()
    dc.close()
    if (!provider) {
      return undefined
    }
    return {
      before_login_hint: binding.dcn_provider_get_before_login_hint(provider),
      overview_page: binding.dcn_provider_get_overview_page(provider),
      status: binding.dcn_provider_get_status(provider),
    }
  }
}
