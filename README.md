# deltachat-node

> node.js bindings for [`deltachat-core`][deltachat-core]

[![npm](https://img.shields.io/npm/v/deltachat-node.svg)](https://www.npmjs.com/package/deltachat-node)
[![Build Status](https://travis-ci.org/deltachat/deltachat-node.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-node)
![Node version](https://img.shields.io/node/v/deltachat-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/deltachat/deltachat-node/badge.svg)](https://coveralls.io/github/deltachat/deltachat-node)
[![dependencies](https://david-dm.org/deltachat/deltachat-node.svg)](https://david-dm.org/deltachat/deltachat-node)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**WORK IN PROGRESS** The API can change at any time and will not follow semver versioning until `v1.0.0` has been released.

**If you are upgrading:** please see [`UPGRADING.md`](UPGRADING.md).

`deltachat-node` primarily aims to offer two things:

- A high level JavaScript api with syntactic sugar
- A low level c binding api around  [`deltachat-core`][deltachat-core]

## Table of Contents

<details><summary>Click to expand</summary>

- [Install](#install)
- [Troubleshooting](#troubleshooting)
- [Usage](#usage)
- [API](#api)
- [Developing](#developing)
- [Prebuilt Binaries](#prebuilt-binaries)
- [Tests and Coverage](#tests-and-coverage)
- [Scripts](#scripts)
- [License](#license)

</details>

## Install

```
npm install deltachat-node
```

## Troubleshooting

This module builds on top of `deltachat-core`, which in turn has external dependencies. Instructions below assumes a Linux system (e.g. Ubuntu 18.10).

If you get errors when running `npm install`, they might be related to the _build_ dependencies `meson` and `ninja`.

If `meson` is missing:

```
sudo apt-get install python3-pip
sudo pip3 install meson
```

If `ninja` is missing:

```
sudo apt-get install ninja-build
```

You might also need the following system dependencies:

- `libssl-dev`
- `libsasl2-dev`
- `libsqlite3-dev`
- `zlib1g-dev`

To fix these issues do:

```
sudo apt-get install libssl-dev libsasl2-dev libsqlite3-dev zlib1g-dev
```

Then try running `npm install` again.

Please see [build instructions](https://github.com/deltachat/deltachat-core#building-your-own-libdeltachatso) for additional information.

## Usage

```js
const DeltaChat = require('deltachat-node')
const dc = new DeltaChat()

const opts = {
  addr: '[email]',
  mailPw: '[password]'
}

const contact = '[email]'

dc.on('ALL', console.log.bind(null, 'core |'))

dc.on('DC_EVENT_INCOMING_MSG', (chatId, msgId) => {
  const msg = dc.getMessage(msgId)
  console.log(chatId, msg)
  dc.sendMessage(chatId, `Bot agrees to ${Math.random() * 100}%`)
})

dc.open(() => {
  const onReady = () => {
    const contactId = dc.createContact('Test', contact)
    const chatId = dc.createChatByContactId(contactId)
    dc.sendMessage(chatId, 'Hi!')
  }
  if (!dc.isConfigured()) {
    dc.once('ready', onReady)
    dc.configure(opts)
  } else {
    onReady()
  }
})
```

## API

The high level JavaScript API is a collection of classes wrapping most context types provided by `deltachat-core`. Please see the [class list](https://c.delta.chat/annotated.html) for an overview of this.

- <a href="#deltachat_ctor"><code><b>DeltaChat()</b></code></a>
- <a href="#class_deltachat"><code><b>class DeltaChat</b></code></a>
- <a href="#class_chat"><code><b>class Chat</b></code></a>
- <a href="#class_chatlist"><code><b>class ChatList</b></code></a>
- <a href="#class_contact"><code><b>class Contact</b></code></a>
- <a href="#class_lot"><code><b>class Lot</b></code></a>
- <a href="#class_message"><code><b>class Message</b></code></a>
- <a href="#class_message_state"><code><b>class MessageState</b></code></a>
- <a href="#class_message_view_type"><code><b>class MessageViewType</b></code></a>
- <a href="#events"><code><b>Events</b></code></a>

<a name="deltachat_ctor"></a>

### `dc = DeltaChat()`

Creates a new `DeltaChat` instance.

Initializes the main context and sets up event handling. Call `dc.open(cwd, cb)` to start and `dc.configure(opts, cb)` if needed.

* * *

<a name="class_deltachat"></a>

### `class DeltaChat`

The `DeltaChat` class wraps a `dc_context_t*` and handles most operations, such as connecting to an `IMAP` server, sending messages with `SMTP` etc. It is through this instance you get references to the other class types following below.

#### `dc.addAddressBook(addressBook)`

Add a number of contacts. Corresponds to [`dc_add_address_book()`](https://c.delta.chat/classdc__context__t.html#a4b5e52c5d45ee04923d61c37b9cb6498).

#### `dc.addContactToChat(chatId, contactId)`

Add a member to a group. Corresponds to [`dc_add_contact_to_chat()`](https://c.delta.chat/classdc__context__t.html#a9360baf78e9b45e45af1de5856b63282).

#### `dc.archiveChat(chatId, archive)`

Archive or unarchive a chat. Corresponds to [`dc_archive_chat()`](https://c.delta.chat/classdc__context__t.html#a27915f31f37aa5887e77dcc134334431).

#### `dc.blockContact(contactId, block)`

Block or unblock a contact. Corresponds to [`dc_block_contact()`](https://c.delta.chat/classdc__context__t.html#a4d4ffdc880e149c0c717c5b13a00c2e1).

#### `dc.checkPassword(password)`

Check if the user is authorized by the given password in some way. Corresponds to [`dc_check_password()`](https://c.delta.chat/classdc__context__t.html#a9934f68e0233f4c2ba5d9b26d2a0db05).

#### `dc.checkQrCode(qrCode)`

Check a scanned QR code. Corresponds to [`dc_check_qr()`](https://c.delta.chat/classdc__context__t.html#a34a865a52127ed2cc8c2f016f085086c).

#### `dc.clearStringTable()`

Clears the string table for handling `DC_EVENT_GET_STR` events from core.

#### `dc.close()`

Stops the threads and closes down the `DeltaChat` instance.

#### `dc.configure(options[, cb])`

Configure and connect a context. Corresponds to [`dc_configure()`](https://c.delta.chat/classdc__context__t.html#adfe52669a5bed893df78a620566dd698).

The `options` object takes the following properties:

- `options.addr` _(string, required)_: Email address of the chat user.
- `options.mailServer` _(string, optional)_: IMAP-server, guessed if left out.
- `options.mailUser` _(string, optional)_: IMAP-username, guessed if left out.
- `options.mailPw` _(string, required)_: IMAP-password of the chat user.
- `options.mailPort` _(string | integer, optional)_: IMAP-port, guessed if left out.
- `options.sendServer` _(string, optional)_: SMTP-server, guessed if left out.
- `options.sendUser` _(string, optional)_: SMTP-user, guessed if left out.
- `options.sendPw` _(string, optional)_: SMTP-password, guessed if left out.
- `options.sendPort` _(string | integer, optional)_: SMTP-port, guessed if left out.
- `options.serverFlags` _(integer, optional)_: IMAP-/SMTP-flags as a combination of DC_LP flags, guessed if left out.
- `options.imapFolder` _(string, optional)_: IMAP folder to use, defaults to `'INBOX'`.
- `options.displayName` _(string, optional)_: Own name to use when sending messages. MUAs are allowed to spread this way e.g. using CC, defaults to empty.
- `options.selfStatus` _(string, optional)_: Own status to display e.g. in email footers, defaults to a standard text.
- `options.selfAvatar` _(string, optional)_: File containing avatar.
- `options.e2eeEnabled` _(boolean, optional)_: Enable E2EE. Defaults to `true`.
- `options.mdnsEnabled` _(boolean, optional)_: Send and request read receipts. Defaults to `true`.
- `options.saveMimeHeaders` _(boolean, optional)_: Set to `true` if you want to use <a href="#getmimeheaders">`dc.getMimeHeaders()`</a> later.

#### `dc.continueKeyTransfer(messageId, setupCode, callback)`

Continue the AutoCrypt key transfer on another device. Corresponds to [`dc_continue_key_transfer()`](https://c.delta.chat/classdc__context__t.html#a5af2cdd80c7286b2a495d56fa6c0832f).

- `messageId` _(string|integer, required)_ See deltachat api documentation
- `setupCode` _(string, required)_ See deltachat api documentation
- `callback` _(function, required)_ Called with an error if setup code is bad

#### `dc.createChatByContactId(contactId)`

Create a normal chat with a single user. Corresponds to [`dc_create_chat_by_contact_id()`](https://c.delta.chat/classdc__context__t.html#ac0fad42e07b1973162d27e0fdf4478d1).

#### `dc.createChatByMessageId(messageId)`

Create a normal chat or group chat by a message id. Corresponds to [`dc_create_chat_by_msg_id()`](https://c.delta.chat/classdc__context__t.html#aa150be55af0f0a7b7f9ed9bb530f78c5).

#### `dc.createContact(name, addr)`

Add a single contact as a result of an _explicit_ user action. Corresponds to [`dc_create_contact()`](https://c.delta.chat/classdc__context__t.html#aaa30fc04300944691d6d7073ce16d053).

#### `dc.createUnverifiedGroupChat(chatName)`

Create a new _unverified_ group chat. Corresponds to [`dc_create_group_chat()`](https://c.delta.chat/classdc__context__t.html#a639ab7677583444896e2461710437a2e).

#### `dc.createVerifiedGroupChat(chatName)`

Create a new _verified_ group chat. Corresponds to [`dc_create_group_chat()`](https://c.delta.chat/classdc__context__t.html#a639ab7677583444896e2461710437a2e).

#### `dc.deleteChat(chatId)`

Delete a chat. Corresponds to [`dc_delete_chat()`](https://c.delta.chat/classdc__context__t.html#ad50eed96a11b113c4080886b2b748ff3).

#### `dc.deleteContact(contactId)`

Delete a contact. Corresponds to [`dc_delete_contact()`](https://c.delta.chat/classdc__context__t.html#acea00dc340861113c18983eb5206b7f9).

#### `dc.deleteMessages(messageIds)`

Delete messages. Corresponds to [`dc_delete_msgs()`](https://c.delta.chat/classdc__context__t.html#ad6bdf2f72adcd382d849f2c3e25c5908).

#### `dc.forwardMessages(messageIds, chatId)`

Forward messages to another chat. Corresponds to [`dc_forward_msgs()`](https://c.delta.chat/classdc__context__t.html#ac303193c06b1302948fd110c03f399e1).

#### `dc.getBlobdir()`

Get the blob directory. Corresponds to [`dc_get_blobdir()`](https://c.delta.chat/classdc__context__t.html#a479a14f05a63c62d18e44957dedff120).

#### `dc.getBlockedCount()`

Get the number of blocked contacts. Corresponds to [`dc_get_blocked_cnt()`](https://c.delta.chat/classdc__context__t.html#af99d5708a1d38c7ef2be8f4ce4d8f311).

#### `dc.getBlockedContacts()`

Get blocked contacts. Corresponds to [`dc_get_blocked_contacts()`](https://c.delta.chat/classdc__context__t.html#a4a82db96366b91b1e009f3c1fa9410c7).

#### `dc.getChat(chatId)`

Get <a href="#class_chat">`Chat`</a> object by a chat id. Corresponds to [`dc_get_chat()`](https://c.delta.chat/classdc__context__t.html#a9cec1e2e3dba9d83035cf363cfc3530f).

#### `dc.getChatContacts(chatId)`

Get contact ids belonging to a chat. Corresponds to [`dc_get_chat_contacts()`](https://c.delta.chat/classdc__context__t.html#a9939ef09de5a5026dbac6fe209186969).

#### `dc.getChatIdByContactId(contactId)`

Check, if there is a normal chat with a given contact. Corresponds to [`dc_get_chat_id_by_contact_id()`](https://c.delta.chat/classdc__context__t.html#a8736b580af3d4e33e5bd205159af2e29).

#### `dc.getChatMedia(chatId, msgType1, msgType2, msgType3)`

Returns all message ids of the given type in a chat. Corresponds to [`dc_get_chat_media()`](https://c.delta.chat/classdc__context__t.html#a344a82b9f288b5eb5d39c7cf475cddb7).

<a name="getmimeheaders"></a>

#### `dc.getMimeHeaders(messageId)`

Get the raw mime-headers of the given message. Corresponds to [`dc_get_mime_headers()`](https://c.delta.chat/classdc__context__t.html#ad0f0df9128a6881af5114561c54ef53e).

#### `dc.getChatMessages(chatId, flags, marker1before)`

Get all message ids belonging to a chat. Corresponds to [`dc_get_chat_msgs()`](https://c.delta.chat/classdc__context__t.html#a51353ff6b85fa9278d2ec476c3c95eda).

#### `dc.getChats(listFlags, queryStr, queryContactId)`

Like `dc.getChatList()` but returns a JavaScript array of ids.

#### `dc.getChatList(listFlags, queryStr, queryContactId)`

Get a list of chats. Returns a <a href="#class_chatlist">`ChatList`</a> object. Corresponds to [`dc_get_chatlist()`](https://c.delta.chat/classdc__context__t.html#a709a7b5b9b606d85f21e988e89d99fef).

#### `DeltaChat.getConfig(path, callback)`

Get configuration from a path. Calls back with `(err, config)`. A static method which does a minimal open and if the path has a configured state the `config` parameter contains the following properties:

- `addr` _(string)_: Email address used to configure the account.

#### `dc.getConfig(key)`

Get a configuration option. Corresponds to [`dc_get_config()`](https://c.delta.chat/classdc__context__t.html#ada7a19d3c814ed5f776a24006259395d).

#### `dc.getContact(contactId)`

Get a single <a href="#class_contact">`Contact`</a> object. Corresponds to [`dc_get_contact()`](https://c.delta.chat/classdc__context__t.html#a36b0e1a01730411b15294da5024ad311).

#### `dc.getContactEncryptionInfo(contactId)`

Get encryption info for a contact. Corresponds to [`dc_get_contact_encrinfo()`](https://c.delta.chat/classdc__context__t.html#a2a14d2a3389b16ba5ffff02a7ed232b1).

#### `dc.getContacts(listFlags, query)`

Return known and unblocked contacts. Corresponds to [`dc_get_contacts()`](https://c.delta.chat/classdc__context__t.html#a32f1458afcacf034148952305bf60abe).

#### `dc.getDraft(chatId)`

Get draft for a chat, if any. Corresponds to [`dc_get_draft()`](https://c.delta.chat/classdc__context__t.html#a3c76757cbdaab9f1ce27f0fd1d86ea27).

#### `dc.getFreshMessageCount(chatId)`

Get the number of _fresh_ messages in a chat. Corresponds to [`dc_get_fresh_msg_cnt()`](https://c.delta.chat/classdc__context__t.html#a6d47f15d87049f2afa60e059f705c1c5).

#### `dc.getFreshMessages()`

Returns the message ids of all _fresh_ messages of any chat. Corresponds to [`dc_get_fresh_msgs()`](https://c.delta.chat/classdc__context__t.html#a5dc16d0ebe4f837efb42b957948b54b0).

#### `dc.getInfo()`

Get info about the context. Corresponds to [`dc_get_info()`](https://c.delta.chat/classdc__context__t.html#a2cb5251125fa02a0f997753f2fe905b1).

Returns an object with the following properties:

- `arch`
- `blobdir`
- `compile_date`
- `configured_mvbox_folder`
- `configured_sentbox_folder`
- `database_dir`
- `database_version`
- `deltachat_core_version`
- `display_name`
- `e2ee_enabled`
- `entered_account_settings`
- `fingerprint`
- `folders_configured`
- `inbox_watch`
- `is_configured`
- `libetpan_version`
- `mdns_enabled`
- `messages_in_contact_requests`
- `mvbox_move`
- `mvbox_watch`
- `number_of_chat_messages`
- `number_of_chats`
- `number_of_contacts`
- `openssl_version`
- `private_key_count`
- `public_key_count`
- `sentbox_watch`
- `sqlite_thread_safe`
- `sqlite_version`
- `used_account_settings`

#### `dc.getMessage(messageId)`

Get a single <a href="#class_message">`Message`</a> object. Corresponds to [`dc_get_msg()`](https://c.delta.chat/classdc__context__t.html#a4fd6b4565081c558fcd6ff827f22cb01).

#### `dc.getMessageCount(chatId)`

Get the total number of messages in a chat. Corresponds to [`dc_get_msg_cnt()`](https://c.delta.chat/classdc__context__t.html#a02a76fdb6a574f914ef6fc16a4d18cfc).

#### `dc.getMessageInfo(messageId)`

Get an informational text for a single message. Corresponds to [`dc_get_msg_info()`](https://c.delta.chat/classdc__context__t.html#a9752923b64ca8288045e999a11ccf7f4).

#### `dc.getNextMediaMessage(messageId, msgType1, msgType2, msgType3)`

Get next message of the same type. Corresponds to [`dc_get_next_media()`](https://c.delta.chat/classdc__context__t.html#accc839bc6995dc6007d3ebb947d38989).

#### `dc.getPreviousMediaMessage(messageId, msgType1, msgType2, msgType3)`

Get previous message of the same type. Corresponds to [`dc_get_next_media()`](https://c.delta.chat/classdc__context__t.html#accc839bc6995dc6007d3ebb947d38989).

#### `dc.getSecurejoinQrCode(groupChatId)`

Get QR code text that will offer a secure-join verification. Corresponds to [`dc_get_securejoin_qr()`](https://c.delta.chat/classdc__context__t.html#aeec58fc8a478229925ec8b7d48cf18bf).

#### `dc.getStarredMessages()`

Returns an array of starred messages.

#### `DeltaChat.getSystemInfo()`

Static method. Returns a stripped version of `dc.getInfo()` which only contains stats of the software and the system and no user related data. Useful when you want to grab version numbers. It should be fast, since no opening of database or configuring is required.

#### `dc.importExport(what, param1, param2)`

Import/export things. Corresponds to [`dc_imex()`](https://c.delta.chat/classdc__context__t.html#ab04a07bb49363824f6fe3b03e6aaaca7).

#### `dc.importExportHasBackup(dirName)`

Check if there is a backup file. Corresponds to [`dc_imex_has_backup()`](https://c.delta.chat/classdc__context__t.html#a052b3b20666162d35b57b34cecf74888).

#### `dc.initiateKeyTransfer(callback)`

Initiate Autocrypt setup transfer. Corresponds to [`dc_initiate_key_transfer()`](https://c.delta.chat/classdc__context__t.html#af327aa51e2e18ce3f5948545a637eac9).

- `callback` _(function, required)_ Called with an error as first argument (or null) and the setup code as second argument if no error occured.

#### `dc.isConfigured()`

Check if the context is already configured. Corresponds to [`dc_is_configured()`](https://c.delta.chat/classdc__context__t.html#a7b2e6b5e8b970209596d8218eea9e62c).

#### `dc.isContactInChat(chatId, contactId)`

Check if a given contact id is a member of a group chat. Corresponds to [`dc_is_contact_in_chat()`](https://c.delta.chat/classdc__context__t.html#aec6e3c1cecd0e4e4ea99c4fdfbd177cd).

#### `dc.isOpen()`

Check if the context database is open. Corresponds to [`dc_is_open()`](https://c.delta.chat/classdc__context__t.html#ab413e1de38b45d8f0653bf851857b737). Returns `true` if open, otherwise `false`.

#### `dc.joinSecurejoin(qrCode)`

Join an out-of-band-verification initiated on another device with `dc.getSecurejoinQrCode()`. Corresponds to [`dc_join_securejoin()`](https://c.delta.chat/classdc__context__t.html#ae49176cbc26d4d40d52de4f5301d1fa7).

#### `dc.markNoticedChat(chatId)`

Mark all messages in a chat as _noticed_. Corresponds to [`dc_marknoticed_chat()`](https://c.delta.chat/classdc__context__t.html#a7286128d6c3ae3f274f72241fbc4353c).

#### `dc.markNoticedAllChats()`

Same as `dc.markNoticedChat()` but for _all_ chats. Corresponds to [`dc_marknoticed_all_chats()`](https://c.delta.chat/classdc__context__t.html#a61a0fe8ab386687fcf5061debfe710ab).

#### `dc.lookupContactIdByAddr(addr)`

Returns `true` if an e-mail address belongs to a known and unblocked contact, otherwise `false`. Corresponds to [`dc_lookup_contact_id_by_addr()`](https://c.delta.chat/classdc__context__t.html#a2b5248d480d763bdee55f15e64d02109).

#### `dc.markNoticedContact(contactId)`

Mark all messages sent by the given contact as _noticed_. Corresponds to [`dc_marknoticed_contact()`](https://c.delta.chat/classdc__context__t.html#a7cc233792a13ec0f893f6299c12ca061).

#### `dc.markSeenMessages(messageIds)`

Mark a message as _seen_, updates the IMAP state and sends MDNs. Corresponds to [`dc_markseen_msgs()`](https://c.delta.chat/classdc__context__t.html#ae5305a90c09380dffe54e68c2a709128).

#### `DeltaChat.maybeValidAddr(addr)`

Static method. Returns `true` if `addr` maybe is a valid e-mail address, otherwise `false`. Corresponds to [`dc_may_be_valid_addr()`](https://c.delta.chat/classdc__context__t.html#a78f5a96398b3763bde51b1a057c84903).

#### `dc.maybeNetwork()`

Called as a hint to `deltachat-core` that the network is available again, to trigger pending messages to be sent. Corresponds to [`dc_maybe_network()`](https://c.delta.chat/classdc__context__t.html#a2f61e875270dbb7e7a2533461baa659b).

#### `dc.messageNew([viewType])`

Create a new <a href="#class_message">`Message`</a> object. Corresponds to [`dc_msg_new()`](https://c.delta.chat/classdc__msg__t.html#aa694c4f707ad51918703218cc8887143). The `viewType` parameter is optional and defaults to `DC_MSG_TEXT`. Pick from one of the following values:

- `DC_MSG_TEXT`
- `DC_MSG_AUDIO`
- `DC_MSG_FILE`
- `DC_MSG_GIF`
- `DC_MSG_IMAGE`
- `DC_MSG_VIDEO`
- `DC_MSG_VOICE`

#### `dc.open([cwd], callback)`

Opens the underlying database.

- `cwd` _(string, optional)_ Path to working directory, defaults to current working directory.
- `callback` _(function, required)_ Called with an error if the database could not be opened.

#### `dc.removeContactFromChat(chatId, contactId)`

Remove a member from a group. Corresponds to [`dc_remove_contact_from_chat()`](https://c.delta.chat/classdc__context__t.html#a72d4db8f0fcb595f11045882284f408f).

#### `dc.searchMessages(chatId, query)`

Search messages containing the given query string. Corresponds to [`dc_search_msgs()`](https://c.delta.chat/classdc__context__t.html#a777bb1e11d7ea0288984ad23c2d8663b).

#### `dc.sendMessage(chatId, msg)`

Send a message of any type to a chat. Corresponds to [`dc_send_msg()`](https://c.delta.chat/classdc__context__t.html#aaba70910f9c3b3819bba1d04e4d54e02). The `msg` parameter can either be a `string` or a `Message` object.

#### `dc.setChatName(chatId, name)`

Set group name. Corresponds to [`dc_set_chat_name()`](https://c.delta.chat/classdc__context__t.html#a9b55b79050c263a7b13a42b35eb6f41c).

#### `dc.setChatProfileImage(chatId, image)`

Set group profile image. Corresponds to [`dc_set_chat_profile_image()`](https://c.delta.chat/classdc__context__t.html#a9173428fc8f5727a04db2172a9aaa044).

#### `dc.setConfig(key, value)`

Configure the context. Corresponds to [`dc_set_config()`](https://c.delta.chat/classdc__context__t.html#aff3b894f6cfca46cab5248fdffdf083d).

#### `dc.setDraft(chatId, message)`

Save a draft for a chat in the database. Corresponds to [`dc_set_draft()`](https://c.delta.chat/classdc__context__t.html#a131ee8d251dc1ab2d115822f6a2f7a66).

#### `dc.setStringTable(index, str)`

Allows the caller to define custom strings for `DC_EVENT_GET_STR` events, e.g. when letting core know about a different language. The first parameter `index` is an integer corresponding to a `DC_STR_*` in `constants.js` and `str` is the new value.

#### `dc.starMessages(messageIds, star)`

Star/unstar messages. Corresponds to [`dc_star_msgs()`](https://c.delta.chat/classdc__context__t.html#a211ab66e424092c2b617af637d1e1d35).

* * *

<a name="class_chat"></a>

### `class Chat`

An object representing a single chat in memory.

#### `chat.getArchived()`

Get archived state. Corresponds to [`dc_chat_get_archived()`](https://c.delta.chat/classdc__chat__t.html#af8b59ed08edfa2a5c4b7a3787613230d).

#### `chat.getColor()`

Get a color for the chat. Corresponds to [`dc_chat_get_color()`](https://c.delta.chat/classdc__chat__t.html#ac575ba5901ca24187f0f31492beefe3a).

### `chat.getId()`

Get chat id. Corresponds to [`dc_chat_get_id()`](https://c.delta.chat/classdc__chat__t.html#a4e647c69a9f61fc4497f6293371e0017).

#### `chat.getName()`

Get name of a chat. Corresponds to [`dc_chat_get_name()`](https://c.delta.chat/classdc__chat__t.html#a0fb1b4850bcd899eaa06d23648a1efaf).

#### `chat.getProfileImage()`

Get the chat's profile image. Corresponds to [`dc_chat_get_profile_image()`](https://c.delta.chat/classdc__chat__t.html#ad96106c6b88f7705d8ac263133a61c43).

#### `chat.getSubtitle()`

Get a subtitle for a chat. Corresponds to [`dc_chat_get_subtitle()`](https://c.delta.chat/classdc__chat__t.html#a1508279f522decd5e404e4c4fa42adf4).

#### `chat.getType()`

Get chat type. Corresponds to [`dc_chat_get_type()`](https://c.delta.chat/classdc__chat__t.html#a2841f242370f06639a33940e7da17e8d).

#### `chat.isSelfTalk()`

Check if a chat is a self talk. Corresponds to [`dc_chat_is_self_talk()`](https://c.delta.chat/classdc__chat__t.html#ad1a5909513e8990b261cd2c66d1ceb30).

#### `chat.isUnpromoted()`

Check if a chat is still unpromoted. Corresponds to [`dc_chat_is_unpromoted()`](https://c.delta.chat/classdc__chat__t.html#aba1e99ebd5546283bf5f748d86c64a54).

#### `chat.isVerified()`

Check if a chat is verified. Corresponds to [`dc_chat_is_verified()`](https://c.delta.chat/classdc__chat__t.html#a8149813f4e6aea8f30592bea1be9f3c4).

#### `chat.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_chatlist"></a>

### `class ChatList`

An object representing a single chatlist in memory.

#### `list.getChatId(index)`

Get a single chat id of a chatlist. Corresponds to [`dc_chatlist_get_chat_id()`](https://c.delta.chat/classdc__chatlist__t.html#ac0fcc0aaa05adc66a7813d86f168320c).

#### `list.getCount()`

Get the number of chats in a chatlist. Corresponds to [`dc_chatlist_get_cnt()`](https://c.delta.chat/classdc__chatlist__t.html#af3ee352c8891416c1be865ed11de1878).

#### `list.getMessageId(index)`

Get a single message id of a chatlist. Corresponds to [`dc_chatlist_get_msg_id()`](https://c.delta.chat/classdc__chatlist__t.html#a0d089b4a45faa0e29d4350ef29049fd3).

#### `list.getSummary(index, chat)`

Get a summary for a chatlist index. Returns a <a href="#class_lot">`Lot`</a> object. Corresponds to [`dc_chatlist_get_summary()`](https://c.delta.chat/classdc__chatlist__t.html#a7e155ba468613547743bf383600914d1).

* * *

<a name="class_contact"></a>

### `class Contact`

An object representing a single contact in memory.

#### `contact.getAddress()`

Get email address. Corresponds to [`dc_contact_()`](https://c.delta.chat/classdc__contact__t.html#a017fc5f3c27f52547c515fadc5658e01).

### `contact.getId()`

Get a color for the contact. Corresponds to [`dc_chat_get_color()`](https://c.delta.chat/classdc__contact__t.html#ad6b75bcf0a7011aacbcc1a963b3f2d32).

#### `contact.getDisplayName()`

Get display name. Corresponds to [`dc_contact_get_display_name()`](https://c.delta.chat/classdc__contact__t.html#accb0ce055f5bcc23dee932a1898a718b).

#### `contact.getFirstName()`

Get the part of the name before the first space. Corresponds to [`dc_contact_get_first_name()`](https://c.delta.chat/classdc__contact__t.html#aae2dae4bd8b0deb6f2fbca9e0d819a8c).

#### `contact.getId()`

Get the id of the contact. Corresponds to [`dc_contact_get_id()`](https://c.delta.chat/classdc__contact__t.html#ae445bdaeca959849a6780fe72869c432).

#### `contact.getName()`

Get the name of the contact. Corresponds to [`dc_contact_get_name()`](https://c.delta.chat/classdc__contact__t.html#acc088a0f8599c35fa9adde8feed358b7).

#### `contact.getNameAndAddress()`

Get a summary of name and address. Corresponds to [`dc_contact_get_name_n_addr()`](https://c.delta.chat/classdc__contact__t.html#a16056431c6926d327f5728ad3ddd4fdf).

#### `contact.getProfileImage()`

Get the profile image of a contact. Corresponds to [`dc_contact_get_profile_image()`](https://c.delta.chat/classdc__contact__t.html#a2ebee8ac3729e4db85041eaf35bfce73).

#### `contact.isBlocked()`

Check if a contact is blocked. Corresponds to [`dc_contact_is_blocked()`](https://c.delta.chat/classdc__contact__t.html#ac1cce8a12bb9f1c64c644682fdc8d9cc).

#### `contact.isVerified()`

Check if a contact is verified. Corresponds to [`dc_contact_is_verified()`](https://c.delta.chat/classdc__contact__t.html#a287ad50725bd26f8a8a7df36ce56b91f).

#### `contact.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_lot"></a>

### `class Lot`

An object containing a set of values in memory.

#### `lot.getId()`

Get the associated id. Corresponds to [`dc_lot_get_id()`](https://c.delta.chat/classdc__lot__t.html#aaa5641298d6eda304d139e2c43e8e137).

#### `lot.getState()`

Get the associated state. Corresponds to [`dc_lot_get_state()`](https://c.delta.chat/classdc__lot__t.html#a0f5a4ad12b017a21ebeb3c1e971a7bc1).

#### `lot.getText1()`

Get first string. Corresponds to [`dc_lot_get_text1()`](https://c.delta.chat/classdc__lot__t.html#aec2595b576242390fb759039c3e6c854).

#### `lot.getText1Meaning()`

Get the meaning of the first string. Corresponds to [`dc_lot_get_text1_meaning()`](https://c.delta.chat/classdc__lot__t.html#aba1dec0fb2d145ada23d655f1d198e83).

#### `lot.getText2()`

Get the second string. Corresponds to [`dc_lot_get_text2()`](https://c.delta.chat/classdc__lot__t.html#af729cffd86d8eb01f85884a6628683e7).

#### `lot.getTimestamp()`

Get the associated timestamp. Corresponds to [`dc_lot_get_timestamp()`](https://c.delta.chat/classdc__lot__t.html#af4c1b738ae5340c3ea3e7cb0cc5d0c73).

#### `lot.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_message"></a>

### `class Message`

An object representing a single message in memory.

#### `message.getChatId()`

Get the id of the chat the message belongs to. Corresponds to [`dc_msg_get_chat_id()`](https://c.delta.chat/classdc__msg__t.html#a21aa5dbd0c7391b707f77b97ac137cbf).

#### `message.getDuration()`

Get duration of audio of video. Corresponds to [`dc_msg_get_duration()`](https://c.delta.chat/classdc__msg__t.html#aaedb426314f3d701d606ba3daa24fc1a).

#### `message.getFile()`

Find out full path, file name and extension of the file associated with a message. Corresponds to [`dc_msg_get_file()`](https://c.delta.chat/classdc__msg__t.html#ae8b750f6aa5e388a36c8be4c57b16271).

#### `message.getFilebytes()`

Get the size of the file. Corresponds to [`dc_msg_get_filebytes()`](https://c.delta.chat/classdc__msg__t.html#a918893073cf6bb0ac324a66a47062db3).

#### `message.getFilemime()`

Get mime type of the file. Corresponds to [`dc_msg_get_filemime()`](https://c.delta.chat/classdc__msg__t.html#a56b59cbaae2f570723600ba130ea12a4).

#### `message.getFilename()`

Get base file name without path. Corresponds to [`dc_msg_get_filename()`](https://c.delta.chat/classdc__msg__t.html#a0ee3fda6369513391f64b996c8cbeb34).

#### `message.getFromId()`

Get the id of the contact that wrote the message. Corresponds to [`dc_msg_get_from_id()`](https://c.delta.chat/classdc__msg__t.html#a2b031e216af41a41f6c12f4142d2e447).

#### `message.getHeight()`

Get height of image or video. Corresponds to [`dc_msg_get_height()`](https://c.delta.chat/classdc__msg__t.html#ae4b99aa662455a4c37430e678894bfdb).

#### `message.getId()`

Get the id of the message. Corresponds to [`dc_msg_get_id()`](https://c.delta.chat/classdc__msg__t.html#ab007f6ccf670907af9ac6788c74a0641).

#### `message.getReceivedTimestamp()`

Get message receive time. Corresponds to [`dc_msg_get_received_timestamp()`](https://c.delta.chat/classdc__msg__t.html#abc26107674c04684492e7d96fdf6a69a).

#### `message.getSetupcodebegin()`

Get first characters of the setup code. Corresponds to [`dc_msg_get_setupcodebegin()`](https://c.delta.chat/classdc__msg__t.html#a677bca5655a8cc9f7a838fa588562d12).

#### `message.getShowpadlock()`

Check if a padlock should be shown beside the message. Corresponds to [`dc_msg_get_showpadlock()`](https://c.delta.chat/classdc__msg__t.html#a1beb22d18c9c045f7982718879a78440).

#### `message.getSortTimestamp()`

Get message time used for sorting. Corresponds to [`dc_msg_get_sort_timestamp()`](https://c.delta.chat/classdc__msg__t.html#a755c0ad1fe20b0e31405fc62a699fad0).

#### `message.getState()`

Get the state of the message. Returns a <a href="#class_message_state">`MessageState`</a> object. Corresponds to [`dc_msg_get_state()`](https://c.delta.chat/classdc__msg__t.html#a83fbf6e74d09a0b598ccefe9b48bd68c).

#### `message.getSummary(chat)`

Get a summary of a message. Returns a <a href="#class_lot">`Lot`</a> object. Corresponds to [`dc_msg_get_summary()`](https://c.delta.chat/classdc__msg__t.html#a2107a9532d0d157766329c53fa1617d8).

#### `message.getSummarytext(approxCharacters)`

Get a message summary as a single line of text. Corresponds to [`dc_msg_get_summarytext()`](https://c.delta.chat/classdc__msg__t.html#a14af0d3ec8277eaad7f66464a0cd8fb3).

#### `message.getText()`

Get the text of the message. Corresponds to [`dc_msg_get_text()`](https://c.delta.chat/classdc__msg__t.html#a2577851182c3665a8b8a2de759fd09f1).

#### `message.getTimestamp()`

Get message sending time. Corresponds to [`dc_msg_get_timestamp()`](https://c.delta.chat/classdc__msg__t.html#af667c538fd07771eb94d6c5d1879b906).

#### `message.getViewType()`

Get the view type of the message. Returns a <a href="#class_message_view_type">`MessageViewType`</a> object. Corresponds to [`dc_msg_get_viewtype()`](https://c.delta.chat/classdc__msg__t.html#abbe7ce82d642e217363aa27bcc6274b3).

#### `message.getWidth()`

Get the width of image or video. Corresponds to [`dc_msg_get_width()`](https://c.delta.chat/classdc__msg__t.html#a5249ddd8d5eea3155a3c0bc121722a1d).

#### `message.hasDeviatingTimestamp()`

Check if a message has a deviating timestamp. Corresponds to [`dc_msg_has_deviating_timestamp()`](https://c.delta.chat/classdc__msg__t.html#a6dc38654dbb222305ee086af338113b2).

#### `message.isDeadDrop()`

Check if the message belongs to the virtual dead drop chat.

#### `message.isForwarded()`

Check if the message is a forwarded message. Corresponds to [`dc_msg_is_forwarded()`](https://c.delta.chat/classdc__msg__t.html#a6d5b3b500fc36d7e1fc53bc2622c7dad).

#### `message.isIncreation()`

Check if a message is still in creation. Corresponds to [`dc_msg_is_increation()`](https://c.delta.chat/classdc__msg__t.html#abd187cb4f114fd77c83b6d914d3977db).

#### `message.isInfo()`

Check if the message is an informational message, created by the device or by another user. Corresponds to [`dc_msg_is_info()`](https://c.delta.chat/classdc__msg__t.html#a7272ddc7b2da2605463fa3ce0a00edc7).

#### `message.isSent()`

Check if a message was sent successfully. Corresponds to [`dc_msg_is_sent()`](https://c.delta.chat/classdc__msg__t.html#ae75e92a28d0c3dc3e7239f0f132d8788).

#### `message.isSetupmessage()`

Check if the message is an Autocrypt setup message. Corresponds to [`dc_msg_is_setupmessage()`](https://c.delta.chat/classdc__msg__t.html#a8a1c2f34e4b56161bd0057983ac2d104).

#### `message.isStarred()`

Check if a message is starred. Corresponds to [`dc_msg_is_starred()`](https://c.delta.chat/classdc__msg__t.html#aa1fa85cab4cdcf7a1cb5565939367ea0).

#### `message.latefilingMediasize(width, height, duration)`

Late filing information to a message. Corresponds to [`dc_msg_latefiling_mediasize()`](https://c.delta.chat/classdc__msg__t.html#a7687ff969841f3d00c3a212f9ad27861).

#### `message.setDimension(width, height)`

Set the dimensions associated with a message. Corresponds to [`dc_msg_set_dimension()`](https://c.delta.chat/classdc__msg__t.html#a6bc82bec36d7bc4218f9a26ebc3c24ae). Returns `this` so you can do chained commands.

#### `message.setDuration(duration)`

Set the duration assocated with the message object. Corresponds to [`dc_msg_set_duration()`](https://c.delta.chat/classdc__msg__t.html#a32bd05a4c5113b098004c16c2b4a14ec). Returns `this` so you can do chained commands.

#### `message.setFile(file, mime)`

Set the file assocated with the message object. Corresponds to [`dc_msg_set_file()`](https://c.delta.chat/classdc__msg__t.html#ae3d4b2a4ed4b10dbe13396ff7739160e). Returns `this` so you can do chained commands.

#### `message.setText(text)`

Set the test of a message object. Corresponds to [`dc_msg_set_text()`](https://c.delta.chat/classdc__msg__t.html#a352d9e2cc2fcacac43bb540550a578a1). Returns `this` so you can do chained commands.

#### `message.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_message_state"></a>

### `class MessageState`

An object representing a <a href="#class_message">`Message`</a> state.

#### `state.isUndefined()`

Message state is `DC_STATE_UNDEFINED`.

#### `state.isFresh()`

Message state is `DC_STATE_IN_FRESH`.

#### `state.isNoticed()`

Message state is `DC_STATE_IN_NOTICED`.

#### `state.isSeen()`

Message state is `DC_STATE_IN_SEEN`.

#### `state.isPending()`

Message state is `DC_STATE_OUT_PENDING`.

#### `state.isFailed()`

Message state is `DC_STATE_OUT_FAILED`.

#### `state.isDelivered()`

Message state is `DC_STATE_OUT_DELIVERED`.

#### `state.isReceived()`

Message state is `DC_STATE_OUT_MDN_RCVD`.

#### `state.state`

Internal `state` property.

* * *

<a name="class_message_view_type"></a>

### `class MessageViewType`

An object representing a <a href="#class_message">`Message`</a> view type.

#### `viewType.isText()`

Message type is `DC_MSG_TEXT`.

#### `viewType.isImage()`

Message type has `DC_MSG_IMAGE` bits set.

#### `viewType.isGif()`

Message type is `DC_MSG_GIF`.

#### `viewType.isAudio()`

Message type has `DC_MSG_AUDIO` bits set.

#### `viewType.isVoice()`

Message type is `DC_MSG_VOICE`.

#### `viewType.isVideo()`

Message type has `DC_MSG_VIDEO` bits set.

#### `viewType.isFile()`

Message type is `DC_MSG_FILE`.

#### `viewType.viewType`

Internal `viewType` property.

### Events

`DeltaChat` is an [`EventEmitter`](https://nodejs.org/api/events.html) and emits the following events.

| Event                                                                                                                   | Description                                                                    | Arguments               |
| :---------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :---------------------- |
| `ready`                                                                                                                 | `DeltaChat` is ready                                                           | -                       |
| [`DC_EVENT_INFO`](https://c.delta.chat/group__DC__EVENT.html#ga0f492424e22941431e2562731a5f21ba)                        | Info string                                                                    | `(info)`                |
| [`DC_EVENT_SMTP_CONNECTED`](https://c.delta.chat/group__DC__EVENT.html#ga68af4630b2e79d8a387c8a9b83c9a088)              | Info string                                                                    | `(info)`                |
| [`DC_EVENT_IMAP_CONNECTED`](https://c.delta.chat/group__DC__EVENT.html#ga867b454250458393e4f405a064c02928)              | Info string                                                                    | `(info)`                |
| [`DC_EVENT_SMTP_MESSAGE_SENT`](https://c.delta.chat/group__DC__EVENT.html#gace252b291eaa12fd593ea8384b2205e4)           | Info string                                                                    | `(info)`                |
| [`DC_EVENT_WARNING`](https://c.delta.chat/group__DC__EVENT.html#ga2e4cc3e6e1c3ba8f152b2cf94632a967)                     | Warning string                                                                 | `(warning)`             |
| [`DC_EVENT_ERROR`](https://c.delta.chat/group__DC__EVENT.html#gaf7b3f4a361fc9515a79758bd49a376d0)                       | Error string                                                                   | `(error)`               |
| [`DC_EVENT_ERROR_NETWORK`](https://c.delta.chat/group__DC__EVENT.html#ga055e6bfcba292678fc5f0d687f6230a1)               | Network error                                                                  | `(first, error)`        |
| [`DC_EVENT_ERROR_SELF_NOT_IN_GROUP`](https://c.delta.chat/group__DC__EVENT.html#gab55bc1fec869d92d722618c05bd74604)     | Info string                                                                    | `(info)`                |
| [`DC_EVENT_MSGS_CHANGED`](https://c.delta.chat/group__DC__EVENT.html#ga0f52cdaad70dd24f7540abda6193cc2d)                | Messages or chats changed                                                      | `(chatId, msgId)`       |
| [`DC_EVENT_INCOMING_MSG`](https://c.delta.chat/group__DC__EVENT.html#ga3f0831ca83189879a2f224b424d8b58f)                | There is a fresh message                                                       | `(chatId, msgId)`       |
| [`DC_EVENT_MSG_DELIVERED`](https://c.delta.chat/group__DC__EVENT.html#ga4438030310448a61af0a4bc72c6765dc)               | Message was sent successfully                                                  | `(chatId, msgId)`       |
| [`DC_EVENT_MSG_FAILED`](https://c.delta.chat/group__DC__EVENT.html#ga1690a84950e2bc948c674d0271262d2a)                  | Message could not be sent                                                      | `(chatId, msgId)`       |
| [`DC_EVENT_MSG_READ`](https://c.delta.chat/group__DC__EVENT.html#ga750f252b4bc82d91dfdd788860f36989)                    | Message read by the receiver                                                   | `(chatId, msgId)`       |
| [`DC_EVENT_CHAT_MODIFIED`](https://c.delta.chat/group__DC__EVENT.html#ga27512e465c573fcf295014f8e0075adf)               | Chat modified                                                                  | `(chatId)`              |
| [`DC_EVENT_CONTACTS_CHANGED`](https://c.delta.chat/group__DC__EVENT.html#ga658b9fc4315badab7afe265b7fa8c2af)            | Contact changed                                                                | `(contactId)`           |
| [`DC_EVENT_CONFIGURE_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#gae047f9361d57c42d82a794324f5b9fd6)          | Configuration progress                                                         | `(progress)`            |
| [`DC_EVENT_IMEX_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#ga006ea41d9c1a76ffc672752484c61e6c)               | Import/export progress                                                         | `(progress)`            |
| [`DC_EVENT_IMEX_FILE_WRITTEN`](https://c.delta.chat/group__DC__EVENT.html#ga7ffbea55be6a5e6da7ac7e35ba6bf985)           | A file has been exported                                                       | `(fileName)`            |
| [`DC_EVENT_SECUREJOIN_INVITER_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#gae1b19779138b8ea63d1b6a5b450c181a) | Progress of a secure-join handshake                                            | `(contactId, progress)` |
| [`DC_EVENT_SECUREJOIN_JOINER_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#gae9113049bec969095e2cda81ebc1773a)  | Progress of a secure-join handshake                                            | `(contactId, progress)` |
| `ALL`                                                                                                                   | All events from [`deltachat-core`](https://c.delta.chat/group__DC__EVENT.html) | `(event, data1, data2)` |

## Developing

If you're cloning this repository in order to hack on it, you need to setup the `deltachat-core` submodule, before doing `npm install`.

The following commands should be enough to get started.

```
git clone https://github.com/deltachat/deltachat-node.git
cd deltachat-node
npm run submodule
npm install
```

## Prebuilt Binaries

At time of writing we use `Jenkins` to generate prebuilt binaries, which currently only covers the Linux platform. The workflow for building and releasing them is as follows:

- Version `vX.Y.Z` is created (via `npm version`)
- Code is pushed to Github (`git push && git push --tags`)
- The new version will cause `Jenkins` to run `npm run prebuild` (see `Scripts` section below), which
  - Builds the binaries using [`prebuildify`](https://github.com/mafintosh/prebuildify)
  - Creates a release on GitHub
  - Uploads the binaries to the GitHub release
- When `Jenkins` has finished `prebuildify-ci download` is run, which downloads the binaries from GitHub to a local `./prebuilds` folder
- `npm publish` finishes off by publishing to `npm` with the bundled binaries

## Tests and Coverage

Running `npm test` ends with showing a code coverage report, which is produced by [`nyc`](https://github.com/istanbuljs/nyc#readme).

![test output](images/tests.png)

The coverage report from `nyc` in the console is rather limited. To get a more detailed coverage report you can run `npm run coverage-html-report`. This will produce a html report from the `nyc` data and display it in a browser on your local machine.

On `Travis` the coverage report is also passed to [`coveralls`](https://coveralls.io/github/deltachat/deltachat-node).

To run the integration tests you need to set the `DC_ADDR` and `DC_MAIL_PW` environment variables. E.g.:

```
$ export DC_ADDR=user@site.org
$ export DC_MAIL_PW=myp4ssw0rD
$ npm run test-integration
```

## Scripts

We have the following scripts for building, testing and coverage:

- `npm run coverage` Creates a coverage report and passes it to `coveralls`. Only done by `Travis`.
- `npm run coverage-html-report` Generates a html report from the coverage data and opens it in a browser on the local machine.
- `npm run generate-constants` Generates `constants.js` and `events.js` based on the `deltachat-core/deltachat.h` header file.
- `npm install` After dependencies are installed, runs `node-gyp-build` to see if the native code needs to be rebuilt.
- `npm run prebuild` Builds `node-napi.node` and `electron-napi.node` for the current platform. Used in ci step for prebuilt binaries.
- `npm run submodule` Updates the git submodule in `deltachat-core/`.
- `npm test` Runs `standard` and then the tests in `test/index.js`.

By default `npm install` will build in `Release` mode and will be as silent as possible. Use `--debug` flag to build in `Debug` mode and `--verbose` for more verbose output, e.g. to build in `Debug` mode with full verbosity, do:

```
npm install --debug --verbose
```

## License

Licensed under the GPLv3, see [LICENSE](./LICENSE) file for details.

Copyright © 2018 Delta Chat contributors.

[deltachat-core]: https://github.com/deltachat/deltachat-core
