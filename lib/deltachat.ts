/* eslint-disable camelcase */

import binding from '../binding'
import { C, EventId2EventName } from './constants'
import { EventEmitter } from 'events'
import { Chat } from './chat'
import { ChatList } from './chatlist'
import { Contact } from './contact'
import { Message } from './message'
import { Lot } from './lot'
import { existsSync, fstat, mkdtempSync } from 'fs'
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
  dcn_accounts: NativeAccount
  accountDir: string

  constructor(cwd: string, os = 'deltachat-node') {
    debug('DeltaChat constructor')
    super()

    this.accountDir = cwd
    this.dcn_accounts = binding.dcn_accounts_new(os, this.accountDir)
  }

  accounts() {
    return binding.dcn_accounts_get_all(this.dcn_accounts)
  }

  selectAccount(account_id: number) {
    return binding.dcn_accounts_select_account(this.dcn_accounts, account_id)
  }

  selectedAccount(): number {
    return binding.dcn_accounts_get_selected_account(this.dcn_accounts)
  }

  addAccount(): number {
    return binding.dcn_accounts_add_account(this.dcn_accounts)
  }

  removeAccount(account_id: number) {
    return binding.dcn_accounts_remove_account(this.dcn_accounts, account_id)
  }

  accountContext(account_id: number) {
    const native_context = binding.dcn_accounts_get_account(
      this.dcn_accounts,
      account_id
    )
    return new Context(this, native_context)
  }

  migrateAccount(dbfile: string): number {
    return binding.dcn_accounts_migrate_account(this.dcn_accounts, dbfile)
  }

  close() {
    this.stopIO()
    debug('unrefing context')
    binding.dcn_accounts_unref(this.dcn_accounts)
    debug('Unref end')
  }

  emit(
    event: string | symbol,
    account_id: number,
    data1: any,
    data2: any
  ): boolean {
    super.emit('ALL', event, account_id, data1, data2)
    return super.emit(event, account_id, data1, data2)
  }

  handleCoreEvent(
    eventId: number,
    accountId: number,
    data1: number,
    data2: number | string
  ) {
    const eventString = EventId2EventName[eventId]
    debug('event', eventString, accountId, data1, data2)
    debug(eventString, data1, data2)
    if (!this.emit) {
      console.log('Received an event but EventEmitter is already destroyed.')
      console.log(eventString, data1, data2)
      return
    }
    this.emit(eventString, accountId, data1, data2)
  }

  startEvents() {
    if (this.dcn_accounts === null) {
      throw new Error('dcn_account is null')
    }
    binding.dcn_accounts_start_event_handler(
      this.dcn_accounts,
      this.handleCoreEvent.bind(this)
    )
    debug('Started event handler')
  }

  startIO() {
    binding.dcn_accounts_start_io(this.dcn_accounts)
  }

  stopIO() {
    binding.dcn_accounts_stop_io(this.dcn_accounts)
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
    let directory = null
    while (true) {
      const randomString = Math.random().toString(36).substr(2, 5)
      directory = join(tmpdir(), 'deltachat-' + randomString)
      if (!existsSync(directory)) break
    }
    const dc = new DeltaChat(directory)
    const accountId = dc.addAccount()
    const context = dc.accountContext(accountId)
    return { dc, context, accountId, directory }
  }

  /** get information about the provider
   * 
   * This function creates a temporary context to be standalone,
   * if posible use `Context.getProviderFromEmail` instead. (otherwise potential proxy settings are not used)
   * @deprecated
   */
  static getProviderFromEmail(email: string) {
    debug('DeltaChat.getProviderFromEmail')
    const { dc, context } = DeltaChat.newTemporary()
    const provider = context.getProviderFromEmail(email)
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
