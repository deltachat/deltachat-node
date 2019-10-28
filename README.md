# deltachat-node

> node.js bindings for [`deltachat-core-rust`][deltachat-core-rust]

[![Appveyor build status][appveyor-shield]][appveyor]
[![Build Status](https://travis-ci.org/deltachat/deltachat-node.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-node)
[![npm](https://img.shields.io/npm/v/deltachat-node.svg)](https://www.npmjs.com/package/deltachat-node)
![Node version](https://img.shields.io/node/v/deltachat-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/deltachat/deltachat-node/badge.svg)](https://coveralls.io/github/deltachat/deltachat-node)
[![dependencies](https://david-dm.org/deltachat/deltachat-node.svg)](https://david-dm.org/deltachat/deltachat-node)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**WORK IN PROGRESS** The API can change at any time and will not follow semver versioning until `v1.0.0` has been released.

**If you are upgrading:** please see [`UPGRADING.md`](UPGRADING.md).

`deltachat-node` primarily aims to offer two things:

- A high level JavaScript api with syntactic sugar
- A low level c binding api around  [`deltachat-core-rust`][deltachat-core-rust]

## Table of Contents

<details><summary>Click to expand</summary>

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Developing](#developing)
- [License](#license)

</details>

## Install

By default the installation will build `deltachat-core-rust` from the submodule using `scripts/rebuild-core.js`. Simply invoke npm:

```
npm install deltchat-node
```

### Using system libdeltachat

It is possible to use the system-wide installed `libdeltachat.so` library which will be located using `pkg-config`. You need to have installed `deltachat-core-rust` before installing this way.  Using this approach allows you to build `libdeltachat.so` with your own specific options.

Invoke npm with the extra arguments:

```
npm install deltachat-node --dc-system-lib=true
```

When invoking `node-gyp` directly this can be achieved in a slightly different way:

```
node-gyp rebuild -- -Dsystem_dc_core=true
```

## Usage

```js
const DeltaChat = require('deltachat-node')
const dc = new DeltaChat()

const opts = {
  addr: '[email]',
  mail_pw: '[password]'
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
    dc.close(() => {
      console.log('Bye.')
    })
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

The high level JavaScript API is a collection of classes wrapping most context types provided by `deltachat-core-rust`. Please see the [class list](https://c.delta.chat/annotated.html) for an overview of this.

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

Add a number of contacts. Corresponds to `dc_add_address_book()`.

#### `dc.addContactToChat(chatId, contactId)`

Add a member to a group. Corresponds to `dc_add_contact_to_chat()`.

#### `dc.archiveChat(chatId, archive)`

Archive or unarchive a chat. Corresponds to `dc_archive_chat()`.

#### `dc.blockContact(contactId, block)`

Block or unblock a contact. Corresponds to `dc_block_contact()`.

#### `dc.checkQrCode(qrCode)`

Check a scanned QR code. Corresponds to `dc_check_qr()`.

#### `dc.close([cb])`

Stops the threads and closes down the `DeltaChat` instance. Calls back when underlying context has been fully closed.

#### `dc.configure(options[, cb])`

Configure and connect a context. Corresponds to `dc_configure()`.

The `options` object takes the following properties:

- `options.addr` _(string, required)_: Email address of the chat user.
- `options.mail_server` _(string, optional)_: IMAP-server, guessed if left out.
- `options.mail_user` _(string, optional)_: IMAP-username, guessed if left out.
- `options.mail_pw` _(string, required)_: IMAP-password of the chat user.
- `options.mail_port` _(string | integer, optional)_: IMAP-port, guessed if left out.
- `options.send_server` _(string, optional)_: SMTP-server, guessed if left out.
- `options.send_user` _(string, optional)_: SMTP-user, guessed if left out.
- `options.send_pw` _(string, optional)_: SMTP-password, guessed if left out.
- `options.send_port` _(string | integer, optional)_: SMTP-port, guessed if left out.
- `options.server_flags` _(integer, optional)_: IMAP-/SMTP-flags as a combination of DC_LP flags, guessed if left out.
- `options.displayname` _(string, optional)_: Own name to use when sending messages. MUAs are allowed to spread this way e.g. using CC, defaults to empty.
- `options.selfstatus` _(string, optional)_: Own status to display e.g. in email footers, defaults to a standard text.
- `options.selfavatar` _(string, optional)_: File containing avatar.
- `options.e2ee_enabled` _(boolean, optional)_: Enable E2EE. Defaults to `true`.
- `options.mdns_enabled` _(boolean, optional)_: Send and request read receipts. Defaults to `true`.
- `options.inbox_watch` _(boolean, optional)_: Watch `INBOX`-folder for changes. Defaults to `true`.
- `options.sentbox_watch` _(boolean, optional)_: Watch `Sent`-folder for changes. Defaults to `true`.
- `options.mvbox_watch` _(boolean, optional)_: Watch `DeltaChat`-folder for changes. Defaults to `true`.
- `options.mvbox_move` _(boolean, optional)_: Heuristically detect chat-messages and move them to the `DeltaChat`-folder. Defaults to `true`.
- `options.show_emails` _(integer, optional)_: `DC_SHOW_EMAILS_OFF` (0) show direct replies to chats only (default), `DC_SHOW_EMAILS_ACCEPTED_CONTACTS` (1) also show all mails of confirmed contacts, `DC_SHOW_EMAILS_ALL` (2) also show mails of unconfirmed contacts in the deaddrop.
- `options.save_mime_headers` _(boolean, optional)_: Set to `true` if you want to use <a href="#getmimeheaders">`dc.getMimeHeaders()`</a> later.

#### `dc.continueKeyTransfer(messageId, setupCode, callback)`

Continue the AutoCrypt key transfer on another device. Corresponds to `dc_continue_key_transfer()`.

- `messageId` _(string|integer, required)_ See deltachat api documentation
- `setupCode` _(string, required)_ See deltachat api documentation
- `callback` _(function, required)_ Called with an error if setup code is bad

#### `dc.createChatByContactId(contactId)`

Create a normal chat with a single user. Corresponds to `dc_create_chat_by_contact_id()`.

#### `dc.createChatByMessageId(messageId)`

Create a normal chat or group chat by a message id. Corresponds to `dc_create_chat_by_msg_id()`.

#### `dc.createContact(name, addr)`

Add a single contact as a result of an _explicit_ user action. Corresponds to `dc_create_contact()`.

#### `dc.createUnverifiedGroupChat(chatName)`

Create a new _unverified_ group chat. Corresponds to `dc_create_group_chat()`.

#### `dc.createVerifiedGroupChat(chatName)`

Create a new _verified_ group chat. Corresponds to `dc_create_group_chat()`.

#### `dc.deleteChat(chatId)`

Delete a chat. Corresponds to `dc_delete_chat()`.

#### `dc.deleteContact(contactId)`

Delete a contact. Corresponds to `dc_delete_contact()`.

#### `dc.deleteMessages(messageIds)`

Delete messages. Corresponds to `dc_delete_msgs()`.

#### `dc.forwardMessages(messageIds, chatId)`

Forward messages to another chat. Corresponds to `dc_forward_msgs()`.

#### `dc.getBlobdir()`

Get the blob directory. Corresponds to `dc_get_blobdir()`.

#### `dc.getBlockedCount()`

Get the number of blocked contacts. Corresponds to `dc_get_blocked_cnt()`.

#### `dc.getBlockedContacts()`

Get blocked contacts. Corresponds to `dc_get_blocked_contacts()`.

#### `dc.getChat(chatId)`

Get <a href="#class_chat">`Chat`</a> object by a chat id. Corresponds to \`dc_get_chat().

#### `dc.getChatContacts(chatId)`

Get contact ids belonging to a chat. Corresponds to `dc_get_chat_contacts()`.

#### `dc.getChatIdByContactId(contactId)`

Check, if there is a normal chat with a given contact. Corresponds to \`dc_get_chat_id_by_contact_id().

#### `dc.getChatMedia(chatId, msgType1, msgType2, msgType3)`

Returns all message ids of the given type in a chat. Corresponds to `dc_get_chat_media()`.

#### `dc.getLocations(chatId, contactId, timestampFrom, timestampTo)`

Returns an array of locations for a given chat, contact and timestamp range. Each item in the array is an object with the following properties:

- `accuracy`
- `latitude`
- `longitude`
- `timestamp`
- `contactId`
- `msgId`
- `chatId`

<a name="getmimeheaders"></a>

#### `dc.getMimeHeaders(messageId)`

Get the raw mime-headers of the given message. Corresponds to `dc_get_mime_headers()`.

#### `dc.getChatMessages(chatId, flags, marker1before)`

Get all message ids belonging to a chat. Corresponds to `dc_get_chat_msgs()`.

#### `dc.getChats(listFlags, queryStr, queryContactId)`

Like `dc.getChatList()` but returns a JavaScript array of ids.

#### `dc.getChatList(listFlags, queryStr, queryContactId)`

Get a list of chats. Returns a <a href="#class_chatlist">`ChatList`</a> object. Corresponds to `dc_get_chatlist()`.

#### `DeltaChat.getConfig(path, callback)`

Get configuration from a path. Calls back with `(err, config)`. A static method which does a minimal open and if the path has a configured state the `config` parameter contains the following properties:

- `addr` _(string)_: Email address used to configure the account.

#### `dc.getConfig(key)`

Get a configuration option. Corresponds to `dc_get_config()`.

#### `dc.getContact(contactId)`

Get a single <a href="#class_contact">`Contact`</a> object. Corresponds to `dc_get_contact()`.

#### `dc.getContactEncryptionInfo(contactId)`

Get encryption info for a contact. Corresponds to `dc_get_contact_encrinfo()`.

#### `dc.getContacts(listFlags, query)`

Return known and unblocked contacts. Corresponds to `dc_get_contacts()`.

#### `dc.getDraft(chatId)`

Get draft for a chat, if any. Corresponds to `dc_get_draft()`.

#### `dc.getFreshMessageCount(chatId)`

Get the number of _fresh_ messages in a chat. Corresponds to `dc_get_fresh_msg_cnt()`.

#### `dc.getFreshMessages()`

Returns the message ids of all _fresh_ messages of any chat. Corresponds to `dc_get_fresh_msgs()`.

#### `dc.getInfo()`

Get info about the context. Corresponds to `dc_get_info()`.

Returns an object with the following properties:

- `arch`
- `blobdir`
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
- `mdns_enabled`
- `messages_in_contact_requests`
- `mvbox_move`
- `mvbox_watch`
- `number_of_chat_messages`
- `number_of_chats`
- `number_of_contacts`
- `private_key_count`
- `public_key_count`
- `sentbox_watch`
- `sqlite_thread_safe`
- `sqlite_version`
- `used_account_settings`

#### `dc.getMessage(messageId)`

Get a single <a href="#class_message">`Message`</a> object. Corresponds to `dc_get_msg()`.

#### `dc.getMessageCount(chatId)`

Get the total number of messages in a chat. Corresponds to `dc_get_msg_cnt()`.

#### `dc.getMessageInfo(messageId)`

Get an informational text for a single message. Corresponds to `dc_get_msg_info()`.

#### `dc.getNextMediaMessage(messageId, msgType1, msgType2, msgType3)`

Get next message of the same type. Corresponds to `dc_get_next_media()`.

#### `dc.getPreviousMediaMessage(messageId, msgType1, msgType2, msgType3)`

Get previous message of the same type. Corresponds to `dc_get_next_media()`.

#### `dc.getSecurejoinQrCode(groupChatId)`

Get QR code text that will offer a secure-join verification. Corresponds to `dc_get_securejoin_qr()`.

#### `dc.getStarredMessages()`

Returns an array of starred messages.

#### `DeltaChat.getSystemInfo()`

Static method. Returns a stripped version of `dc.getInfo()` which only contains stats of the software and the system and no user related data. Useful when you want to grab version numbers. It should be fast, since no opening of database or configuring is required.

#### `dc.importExport(what, param1, param2)`

Import/export things. Corresponds to `dc_imex()`.

#### `dc.importExportHasBackup(dirName)`

Check if there is a backup file. Corresponds to `dc_imex_has_backup()`.

#### `dc.initiateKeyTransfer(callback)`

Initiate Autocrypt setup transfer. Corresponds to `dc_initiate_key_transfer()`.

- `callback` _(function, required)_ Called with an error as first argument (or null) and the setup code as second argument if no error occured.

#### `dc.isConfigured()`

Check if the context is already configured. Corresponds to `dc_is_configured()`.

#### `dc.isContactInChat(chatId, contactId)`

Check if a given contact id is a member of a group chat. Corresponds to `dc_is_contact_in_chat()`.

#### `dc.isOpen()`

Check if the context database is open. Corresponds to `dc_is_open()`.

#### `dc.joinSecurejoin(qrCode)`

Join an out-of-band-verification initiated on another device with `dc.getSecurejoinQrCode()`. Corresponds to `dc_join_securejoin()`.

#### `dc.markNoticedChat(chatId)`

Mark all messages in a chat as _noticed_. Corresponds to `dc_marknoticed_chat()`.

#### `dc.markNoticedAllChats()`

Same as `dc.markNoticedChat()` but for _all_ chats. Corresponds to `dc_marknoticed_all_chats()`.

#### `dc.lookupContactIdByAddr(addr)`

Returns `true` if an e-mail address belongs to a known and unblocked contact, otherwise `false`. Corresponds to `dc_lookup_contact_id_by_addr()`.

#### `dc.markNoticedContact(contactId)`

Mark all messages sent by the given contact as _noticed_. Corresponds to `dc_marknoticed_contact()`.

#### `dc.markSeenMessages(messageIds)`

Mark a message as _seen_, updates the IMAP state and sends MDNs. Corresponds to `dc_markseen_msgs()`.

#### `DeltaChat.maybeValidAddr(addr)`

Static method. Returns `true` if `addr` maybe is a valid e-mail address, otherwise `false`. Corresponds to `dc_may_be_valid_addr()`.

#### `dc.maybeNetwork()`

Called as a hint to `deltachat-core-rust` that the network is available again, to trigger pending messages to be sent. Corresponds to `dc_maybe_network()`.

#### `dc.messageNew([viewType])`

Create a new <a href="#class_message">`Message`</a> object. Corresponds to `dc_msg_new()`. The `viewType` parameter is optional and defaults to `DC_MSG_TEXT`. Pick from one of the following values:

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

Remove a member from a group. Corresponds to `dc_remove_contact_from_chat()`.

#### `dc.searchMessages(chatId, query)`

Search messages containing the given query string. Corresponds to `dc_search_msgs()`.

#### `dc.sendMessage(chatId, msg)`

Send a message of any type to a chat. Corresponds to `dc_send_msg()`. The `msg` parameter can either be a `string` or a `Message` object.

#### `dc.setChatName(chatId, name)`

Set group name. Corresponds to `dc_set_chat_name()`.

#### `dc.setChatProfileImage(chatId, image)`

Set group profile image. Corresponds to `dc_set_chat_profile_image()`.

#### `dc.setConfig(key, value)`

Configure the context. Corresponds to `dc_set_config()`.

#### `dc.setStockTranslation(index, text)`

Set stock string.  Corresponds to `dc_set_stock_translation()`.

#### `dc.setDraft(chatId, message)`

Save a draft for a chat in the database. Corresponds to `dc_set_draft()`.

#### `dc.starMessages(messageIds, star)`

Star/unstar messages. Corresponds to `dc_star_msgs()`.

* * *

<a name="class_chat"></a>

### `class Chat`

An object representing a single chat in memory.

#### `chat.getArchived()`

Get archived state. Corresponds to `dc_chat_get_archived()`.

#### `chat.getColor()`

Get a color for the chat. Corresponds to `dc_chat_get_color()`.

### `chat.getId()`

Get chat id. Corresponds to `dc_chat_get_id()`.

#### `chat.getName()`

Get name of a chat. Corresponds to `dc_chat_get_name()`.

#### `chat.getProfileImage()`

Get the chat's profile image. Corresponds to `dc_chat_get_profile_image()`.

#### `chat.getSubtitle()`

Get a subtitle for a chat. Corresponds to `dc_chat_get_subtitle()`.

#### `chat.getType()`

Get chat type. Corresponds to `dc_chat_get_type()`.

#### `chat.isSelfTalk()`

Check if a chat is a self talk. Corresponds to `dc_chat_is_self_talk()`.

#### `chat.isUnpromoted()`

Check if a chat is still unpromoted. Corresponds to `dc_chat_is_unpromoted()`.

#### `chat.isVerified()`

Check if a chat is verified. Corresponds to `dc_chat_is_verified()`.

#### `chat.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_chatlist"></a>

### `class ChatList`

An object representing a single chatlist in memory.

#### `list.getChatId(index)`

Get a single chat id of a chatlist. Corresponds to `dc_chatlist_get_chat_id()`.

#### `list.getCount()`

Get the number of chats in a chatlist. Corresponds to `dc_chatlist_get_cnt()`.

#### `list.getMessageId(index)`

Get a single message id of a chatlist. Corresponds to `dc_chatlist_get_msg_id()`.

#### `list.getSummary(index, chat)`

Get a summary for a chatlist index. Returns a <a href="#class_lot">`Lot`</a> object. Corresponds to `dc_chatlist_get_summary()`.

* * *

<a name="class_contact"></a>

### `class Contact`

An object representing a single contact in memory.

#### `contact.getAddress()`

Get email address. Corresponds to `dc_contact_()`.

### `contact.getId()`

Get a color for the contact. Corresponds to `dc_chat_get_color()`.

#### `contact.getDisplayName()`

Get display name. Corresponds to `dc_contact_get_display_name()`.

#### `contact.getFirstName()`

Get the part of the name before the first space. Corresponds to `dc_contact_get_first_name()`.

#### `contact.getId()`

Get the id of the contact. Corresponds to `dc_contact_get_id()`.

#### `contact.getName()`

Get the name of the contact. Corresponds to `dc_contact_get_name()`.

#### `contact.getNameAndAddress()`

Get a summary of name and address. Corresponds to `dc_contact_get_name_n_addr()`.

#### `contact.getProfileImage()`

Get the profile image of a contact. Corresponds to `dc_contact_get_profile_image()`.

#### `contact.isBlocked()`

Check if a contact is blocked. Corresponds to `dc_contact_is_blocked()`.

#### `contact.isVerified()`

Check if a contact is verified. Corresponds to `dc_contact_is_verified()`.

#### `contact.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_lot"></a>

### `class Lot`

An object containing a set of values in memory.

#### `lot.getId()`

Get the associated id. Corresponds to `dc_lot_get_id()`.

#### `lot.getState()`

Get the associated state. Corresponds to `dc_lot_get_state()`.

#### `lot.getText1()`

Get first string. Corresponds to `dc_lot_get_text1()`.

#### `lot.getText1Meaning()`

Get the meaning of the first string. Corresponds to `dc_lot_get_text1_meaning()`.

#### `lot.getText2()`

Get the second string. Corresponds to `dc_lot_get_text2()`.

#### `lot.getTimestamp()`

Get the associated timestamp. Corresponds to `dc_lot_get_timestamp()`.

#### `lot.toJson()`

Returns the object state as a JavaScript serializable object.

* * *

<a name="class_message"></a>

### `class Message`

An object representing a single message in memory.

#### `msg.getChatId()`

Get the id of the chat the message belongs to. Corresponds to `dc_msg_get_chat_id()`.

#### `msg.getDuration()`

Get duration of audio of video. Corresponds to `dc_msg_get_duration()`.

#### `msg.getFile()`

Find out full path, file name and extension of the file associated with a message. Corresponds to `dc_msg_get_file()`.

#### `msg.getFilebytes()`

Get the size of the file. Corresponds to `dc_msg_get_filebytes()`.

#### `msg.getFilemime()`

Get mime type of the file. Corresponds to `dc_msg_get_filemime()`.

#### `msg.getFilename()`

Get base file name without path. Corresponds to `dc_msg_get_filename()`.

#### `msg.getFromId()`

Get the id of the contact that wrote the message. Corresponds to `dc_msg_get_from_id()`.

#### `msg.getHeight()`

Get height of image or video. Corresponds to `dc_msg_get_height()`.

#### `msg.getId()`

Get the id of the message. Corresponds to `dc_msg_get_id()`.

#### `msg.getReceivedTimestamp()`

Get message receive time. Corresponds to `dc_msg_get_received_timestamp()`.

#### `msg.getSetupcodebegin()`

Get first characters of the setup code. Corresponds to `dc_msg_get_setupcodebegin()`.

#### `msg.getShowpadlock()`

Check if a padlock should be shown beside the message. Corresponds to `dc_msg_get_showpadlock()`.

#### `msg.getSortTimestamp()`

Get message time used for sorting. Corresponds to `dc_msg_get_sort_timestamp()`.

#### `msg.getState()`

Get the state of the message. Returns a <a href="#class_message_state">`MessageState`</a> object. Corresponds to `dc_msg_get_state()`.

#### `msg.getSummary(chat)`

Get a summary of a message. Returns a <a href="#class_lot">`Lot`</a> object. Corresponds to `dc_msg_get_summary()`.

#### `msg.getSummarytext(approxCharacters)`

Get a message summary as a single line of text. Corresponds to \`dc_msg_get_summarytext().

#### `msg.getText()`

Get the text of the message. Corresponds to `dc_msg_get_text()`.

#### `msg.getTimestamp()`

Get message sending time. Corresponds to `dc_msg_get_timestamp()`.

#### `msg.getViewType()`

Get the view type of the message. Returns a <a href="#class_message_view_type">`MessageViewType`</a> object. Corresponds to `dc_msg_get_viewtype()`.

#### `msg.getWidth()`

Get the width of image or video. Corresponds to `dc_msg_get_width()`.

#### `msg.hasDeviatingTimestamp()`

Check if a message has a deviating timestamp. Corresponds to `dc_msg_has_deviating_timestamp()`.

#### `msg.hasLocation()`

Check if a message has a location. Corresponds to `dc_msg_has_location()`.

#### `msg.isDeadDrop()`

Check if the message belongs to the virtual dead drop chat.

#### `msg.isForwarded()`

Check if the message is a forwarded message. Corresponds to `dc_msg_is_forwarded()`.

#### `msg.isIncreation()`

Check if a message is still in creation. Corresponds to `dc_msg_is_increation()`.

#### `msg.isInfo()`

Check if the message is an informational message, created by the device or by another user. Corresponds to `dc_msg_is_info()`.

#### `msg.isSent()`

Check if a message was sent successfully. Corresponds to `dc_msg_is_sent()`.

#### `msg.isSetupmessage()`

Check if the message is an Autocrypt setup message. Corresponds to `dc_msg_is_setupmessage()`.

#### `msg.isStarred()`

Check if a message is starred. Corresponds to `dc_msg_is_starred()`.

#### `msg.latefilingMediasize(width, height, duration)`

Late filing information to a message. Corresponds to `dc_msg_latefiling_mediasize()`.

#### `msg.setDimension(width, height)`

Set the dimensions associated with a message. Corresponds to `dc_msg_set_dimension()`. Returns `this` so you can do chained commands.

#### `msg.setDuration(duration)`

Set the duration assocated with the message object. Corresponds to `dc_msg_set_duration()`. Returns `this` so you can do chained commands.

#### `msg.setLocation(latitude, longitude)`

Set the location of a message. Corresponds to `dc_msg_set_location()`. Returns `this` so you can do chained commands.

#### `msg.setFile(file, mime)`

Set the file assocated with the message object. Corresponds to `dc_msg_set_file()`. Returns `this` so you can do chained commands.

#### `msg.setText(text)`

Set the test of a message object. Corresponds to `dc_msg_set_text()`. Returns `this` so you can do chained commands.

#### `msg.toJson()`

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
| [`DC_EVENT_LOCATION_CHANGED`](https://c.delta.chat/group__DC__EVENT.html#ga1eded0156765a6c55f31e39ca6cf6adf)            | Location changed for a contact                                                 | `(contactId)`           |
| [`DC_EVENT_CONFIGURE_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#gae047f9361d57c42d82a794324f5b9fd6)          | Configuration progress                                                         | `(progress)`            |
| [`DC_EVENT_IMEX_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#ga006ea41d9c1a76ffc672752484c61e6c)               | Import/export progress                                                         | `(progress)`            |
| [`DC_EVENT_IMEX_FILE_WRITTEN`](https://c.delta.chat/group__DC__EVENT.html#ga7ffbea55be6a5e6da7ac7e35ba6bf985)           | A file has been exported                                                       | `(fileName)`            |
| [`DC_EVENT_SECUREJOIN_INVITER_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#gae1b19779138b8ea63d1b6a5b450c181a) | Progress of a secure-join handshake                                            | `(contactId, progress)` |
| [`DC_EVENT_SECUREJOIN_JOINER_PROGRESS`](https://c.delta.chat/group__DC__EVENT.html#gae9113049bec969095e2cda81ebc1773a)  | Progress of a secure-join handshake                                            | `(contactId, progress)` |
| `ALL`                                                                                                                   | All events from [`deltachat-core`](https://c.delta.chat/group__DC__EVENT.html) | `(event, data1, data2)` |

## Developing

### Tests and Coverage

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

### Scripts

We have the following scripts for building, testing and coverage:

- `npm run coverage` Creates a coverage report and passes it to `coveralls`. Only done by `Travis`.
- `npm run coverage-html-report` Generates a html report from the coverage data and opens it in a browser on the local machine.
- `npm run generate-constants` Generates `constants.js` and `events.js` based on the `deltachat-core-rust/deltachat-ffi/deltachat.h` header file.
- `npm install` After dependencies are installed, runs `node-gyp-build` to see if the native code needs to be rebuilt.
- `npm run rebuild-all` Rebuilds all code.
- `npm run rebuild-core` Rebuilds code in `deltachat-core-rust`.
- `npm run rebuild-bindings` Rebuilds the bindings and links with `deltachat-core-rust`.
- `npm run node-gyp-build` Tries to load prebuilts and falls back to rebuilding the code.
- `npm run prebuild` Builds prebuilt binary to `prebuilds/$PLATFORM-$ARCH`. Copies `deltachat.dll` from `deltachat-core-rust` for windows.
- `npm run download-prebuilds` Downloads all prebuilt binaries from github before `npm publish`.
- `npm run submodule` Updates the `deltachat-core-rust` submodule.
- `npm test` Runs `standard` and then the tests in `test/index.js`.
- `npm run test-integration` Runs the integration tests.
- `npm run hallmark` Runs `hallmark` on all markdown files.

### Releases

The following steps are needed to make a release:

1. Update `CHANGELOG.md` (and run `npm run hallmark` to adjust markdown)
2. Bump version number, e.g. `npm version minor`, which will update version number in `package.json`, commit the changes and tag the commit
3. Push to github, e.g. `git push origin master && git push origin --tags`
4. Wait until Travis and AppVeyor have finished and uploaded prebuilt binaries to GitHub
5. `npm run download-prebuilds` to download prebuilt binaries from GitHub.
6. `npm publish`

## License

Licensed under `GPL-3.0-or-later`, see [LICENSE](./LICENSE) file for details.

>    Copyright © 2018 `DeltaChat` contributors.
>
>    This program is free software: you can redistribute it and/or modify
>    it under the terms of the GNU General Public License as published by
>    the Free Software Foundation, either version 3 of the License, or
>    (at your option) any later version.
>
>    This program is distributed in the hope that it will be useful,
>    but WITHOUT ANY WARRANTY; without even the implied warranty of
>    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
>    GNU General Public License for more details.
>
>    You should have received a copy of the GNU General Public License
>    along with this program.  If not, see <http://www.gnu.org/licenses/>.

[deltachat-core-rust]: https://github.com/deltachat/deltachat-core-rust

[appveyor-shield]: https://ci.appveyor.com/api/projects/status/t0narp672wpbl6pd?svg=true

[appveyor]: https://ci.appveyor.com/project/ralphtheninja/deltachat-node-d4bf8
