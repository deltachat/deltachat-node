# deltachat-node

> node.js bindings for [`deltachat-core`][deltachat-core]

[![Build Status](https://travis-ci.org/deltachat/deltachat-node.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-node)
![Node version](https://img.shields.io/node/v/deltachat-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/deltachat/deltachat-node/badge.svg)](https://coveralls.io/github/deltachat/deltachat-node)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**WORK IN PROGRESS** The API can change at any time and will not follow semver versioning until `v1.0.0` has been released.

`deltachat-node` primarily aims to offer two things:

* A high level JavaScript api with syntactic sugar
* A low level c binding api around  [`deltachat-core`][deltachat-core]

**Note** Because `deltachat-core` uses a particular threading model, the c bindings are based on [`N-API`](https://nodejs.org/dist/latest-v10.x/docs/api/n-api.html) with experimental features enabled. Currently, this means you must use node.js with a minimal version of `v10.7.0`.

* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Events](#events)
* [Developing](#developing)
* [License](#license)

## Install

```
npm install deltachat-node
```

## Usage

```js
const DeltaChat = require('deltachat-node')

const dc = new DeltaChat({
  email: 'user@site.org',
  mail_pw: 'password'
})

dc.on('ready', () => {
  const contactId = dc.createContact('homie', 'friend@site.org')
  const chatId = dc.createChatByContactId(contactId)
  dc.sendTextMessage(chatId, 'Hi!')
})
```

## API

The high level JavaScript API is a collection of classes wrapping most context types provided by `deltachat-core`. Please see the [class list](https://deltachat.github.io/api/annotated.html) for an overview of this.

* [<code><b>DeltaChat()</b></code>](#deltachat_ctor)
* [<code><b>class DeltaChat</b></code>](#class_deltachat)
* [<code><b>class Chat</b></code>](#class_chat)
* [<code><b>class ChatList</b></code>](#class_chatlist)
* [<code><b>class Contact</b></code>](#class_contact)
* [<code><b>class Lot</b></code>](#class_lot)
* [<code><b>class Message</b></code>](#class_message)

<a name="deltachat_ctor"></a>
### `dc = DeltaChat(options[, callback])`

The main entry point for creating a new `DeltaChat` instance.

The `options` object takes the following properties:

* `options.email` *(string, required)*: Email address of the chat user
* `options.mail_pw` *(string, required)*: Email password of the chat user

The optional `callback` is called with an error if the internal `._open()` operation failed, otherwise `null`. You can omit this callback and instead listen for the `'ready'` event.

------------------------------------

<a name="class_deltachat"></a>
### `class DeltaChat`

The `DeltaChat` class wraps a `dc_context_t*` and handles most operations, such as connecting to an `IMAP` server, sending messages with `SMTP` etc. It is through this instance you get references to the other class types following below.

#### `dc.addAddressBook(addressBook)`

Add a number of contacts. Corresponds to [`dc_add_address_book()`](https://deltachat.github.io/api/classdc__context__t.html#a4b5e52c5d45ee04923d61c37b9cb6498).

#### `dc.addContactToChat(chatId, contactId)`

Add a member to a group. Corresponds to [`dc_add_contact_to_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a9360baf78e9b45e45af1de5856b63282).

#### `dc.archiveChat(chatId, archive)`

Archive or unarchive a chat. Corresponds to [`dc_archive_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a27915f31f37aa5887e77dcc134334431).

#### `dc.blockContact(contactId, block)`

Block or unblock a contact. Corresponds to [`dc_block_contact()`](https://deltachat.github.io/api/classdc__context__t.html#a4d4ffdc880e149c0c717c5b13a00c2e1).

#### `dc.checkPassword(password)`

Check if the user is authorized by the given password in some way. Corresponds to [`dc_check_password()`](https://deltachat.github.io/api/classdc__context__t.html#a9934f68e0233f4c2ba5d9b26d2a0db05).

#### `dc.checkQrCode(qrCode)`

Check a scanned QR code. Corresponds to [`dc_check_qr()`](https://deltachat.github.io/api/classdc__context__t.html#a34a865a52127ed2cc8c2f016f085086c).

#### `dc.close()`

Stops the threads and closes down the `DeltaChat` instance.

#### `dc.continueKeyTransfer(messageId, setupCode)`

Continue the AutoCrypt key transfer on another device. Corresponds to [`dc_continue_key_transfer()`](https://deltachat.github.io/api/classdc__context__t.html#a5af2cdd80c7286b2a495d56fa6c0832f).

#### `dc.createChatByContactId(contactId)`

Create a normal chat with a single user. Corresponds to [`dc_create_chat_by_contact_id()`](https://deltachat.github.io/api/classdc__context__t.html#ac0fad42e07b1973162d27e0fdf4478d1).

#### `dc.createChatByMessageId(messageId)`

Create a normal chat or group chat by a message id. Corresponds to [`dc_create_chat_by_msg_id()`](https://deltachat.github.io/api/classdc__context__t.html#aa150be55af0f0a7b7f9ed9bb530f78c5).

#### `dc.createContact(name, addr)`

Add a single contact as a result of an _explicit_ user action. Corresponds to [`dc_create_contact()`](https://deltachat.github.io/api/classdc__context__t.html#aaa30fc04300944691d6d7073ce16d053).

#### `dc.createUnverifiedGroupChat(chatName)`

Create a new _unverified_ group chat. Corresponds to [`dc_create_group_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a639ab7677583444896e2461710437a2e).

#### `dc.createVerifiedGroupChat(chatName)`

Create a new _verified_ group chat. Corresponds to [`dc_create_group_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a639ab7677583444896e2461710437a2e).

#### `dc.deleteChat(chatId)`

Delete a chat. Corresponds to [`dc_delete_chat()`](https://deltachat.github.io/api/classdc__context__t.html#ad50eed96a11b113c4080886b2b748ff3).

#### `dc.deleteContact(contactId)`

Delete a contact. Corresponds to [`dc_delete_contact()`](https://deltachat.github.io/api/classdc__context__t.html#acea00dc340861113c18983eb5206b7f9).

#### `dc.deleteMessages(messageIds)`

Delete messages. Corresponds to [`dc_delete_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#ad6bdf2f72adcd382d849f2c3e25c5908).

#### `dc.forwardMessages(messageIds, chatId)`

Forward messages to another chat. Corresponds to [`dc_forward_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#ac303193c06b1302948fd110c03f399e1).

#### `dc.getBlobdir()`

Get the blob directory. Corresponds to [`dc_get_blobdir()`](https://deltachat.github.io/api/classdc__context__t.html#a479a14f05a63c62d18e44957dedff120).

#### `dc.getBlockedCount()`

Get the number of blocked contacts. Corresponds to [`dc_get_blocked_cnt()`](https://deltachat.github.io/api/classdc__context__t.html#af99d5708a1d38c7ef2be8f4ce4d8f311).

#### `dc.getBlockedContacts()`

Get blocked contacts. Corresponds to [`dc_get_blocked_contacts()`](https://deltachat.github.io/api/classdc__context__t.html#a4a82db96366b91b1e009f3c1fa9410c7).

#### `dc.getChat(chatId)`

Get `Chat` object by a chat id. Corresponds to [`dc_get_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a9cec1e2e3dba9d83035cf363cfc3530f).

#### `dc.getChatContacts(chatId)`

Get contact ids belonging to a chat. Corresponds to [`dc_get_chat_contacts()`](https://deltachat.github.io/api/classdc__context__t.html#a9939ef09de5a5026dbac6fe209186969).

#### `dc.getChatIdByContactId(contactId)`

Check, if there is a normal chat with a given contact. Corresponds to [`dc_get_chat_id_by_contact_id()`](https://deltachat.github.io/api/classdc__context__t.html#a8736b580af3d4e33e5bd205159af2e29).

#### `dc.getChatMedia(chatId, msgType, orMsgType)`

Returns all message ids of the given type in a chat. Corresponds to [`dc_get_chat_media()`](https://deltachat.github.io/api/classdc__context__t.html#a8ca56905333780d5989e11692118f7a9).

#### `dc.getChatMessages(chatId, flags, marker1before)`

Get all message ids belonging to a chat. Corresponds to [`dc_get_chat_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#a51353ff6b85fa9278d2ec476c3c95eda).

#### `dc.getChatList(listFlags, queryStr, queryContactId)`

Get a list of chats. Corresponds to [`dc_get_chatlist()`](https://deltachat.github.io/api/classdc__context__t.html#a709a7b5b9b606d85f21e988e89d99fef).

#### `dc.getConfig(key, def)`

Get a configuration option. Corresponds to [`dc_get_config()`](https://deltachat.github.io/api/classdc__context__t.html#ada7a19d3c814ed5f776a24006259395d).

#### `dc.getConfigInt(key, def)`

Get a configuration option. Corresponds to [`dc_get_config_int()`](https://deltachat.github.io/api/classdc__context__t.html#aeac1bda75c3d1c0845bc81d986607567).

#### `dc.getContact(contactId)`

Get a single `Contact` object. Corresponds to [`dc_get_contact()`](https://deltachat.github.io/api/classdc__context__t.html#a36b0e1a01730411b15294da5024ad311).

#### `dc.getContactEncryptionInfo(contactId)`

Get encryption info for a contact. Corresponds to [`dc_get_contact_encrinfo()`](https://deltachat.github.io/api/classdc__context__t.html#a2a14d2a3389b16ba5ffff02a7ed232b1).

#### `dc.getContacts(listFlags, query)`

Return known and unblocked contacts. Corresponds to [`dc_get_contacts()`](https://deltachat.github.io/api/classdc__context__t.html#a32f1458afcacf034148952305bf60abe).

#### `dc.getFreshMessageCount(chatId)`

Get the number of _fresh_ messages in a chat. Corresponds to [`dc_get_fresh_msg_cnt()`](https://deltachat.github.io/api/classdc__context__t.html#a6d47f15d87049f2afa60e059f705c1c5).

#### `dc.getFreshMessages()`

Returns the message ids of all _fresh_ messages of any chat. Corresponds to [`dc_get_fresh_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#a5dc16d0ebe4f837efb42b957948b54b0).

#### `dc.getInfo()`

Get info about the context. Corresponds to [`dc_get_info()`](https://deltachat.github.io/api/classdc__context__t.html#a2cb5251125fa02a0f997753f2fe905b1).

#### `dc.getMessage(messageId)`

Get a single `Message` object. Corresponds to [`dc_get_msg()`](https://deltachat.github.io/api/classdc__context__t.html#a4fd6b4565081c558fcd6ff827f22cb01).

#### `dc.getMessageCount(chatId)`

Get the total number of messages in a chat. Corresponds to [`dc_get_msg_cnt()`](https://deltachat.github.io/api/classdc__context__t.html#a02a76fdb6a574f914ef6fc16a4d18cfc).

#### `dc.getMessageInfo(messageId)`

Get an informational text for a single message. Corresponds to [`dc_get_msg_info()`](https://deltachat.github.io/api/classdc__context__t.html#a9752923b64ca8288045e999a11ccf7f4).

#### `dc.getNextMediaMessage(messageId)`

Get next message of the same type. Corresponds to [`dc_get_next_media()`](https://deltachat.github.io/api/classdc__context__t.html#a399e23e5b39b72c1c911055b03d5c0b2).

#### `dc.getPreviousMediaMessage(messageId)`

Get previous message of the same type. Corresponds to [`dc_get_next_media()`](https://deltachat.github.io/api/classdc__context__t.html#a399e23e5b39b72c1c911055b03d5c0b2).

#### `dc.getSecurejoinQrCode(groupChatId)`

Get QR code text that will offer a secure-join verification. Corresponds to [`dc_get_securejoin_qr()`](https://deltachat.github.io/api/classdc__context__t.html#aeec58fc8a478229925ec8b7d48cf18bf).

#### `dc.importExport(what, param1, param2)`

Import/export things. Corresponds to [`dc_imex()`](https://deltachat.github.io/api/classdc__context__t.html#ab04a07bb49363824f6fe3b03e6aaaca7).

#### `dc.importExportHasBackup(dirName)`

Check if there is a backup file. Corresponds to [`dc_imex_has_backup()`](https://deltachat.github.io/api/classdc__context__t.html#a052b3b20666162d35b57b34cecf74888).

#### `dc.initiateKeyTransfer()`

Initiate Autocrypt setup transfer. Corresponds to [`dc_initiate_key_transfer()`](https://deltachat.github.io/api/classdc__context__t.html#af327aa51e2e18ce3f5948545a637eac9).

#### `dc.isContactInChat(chatId, contactId)`

Check if a given contact id is a member of a group chat. Corresponds to [`dc_is_contact_in_chat()`](https://deltachat.github.io/api/classdc__context__t.html#aec6e3c1cecd0e4e4ea99c4fdfbd177cd).

#### `dc.joinSecurejoin(qrCode)`

Join an out-of-band-verification initiated on another device with `dc.getSecurejoinQrCode()`. Corresponds to [`dc_join_securejoin()`](https://deltachat.github.io/api/classdc__context__t.html#ae49176cbc26d4d40d52de4f5301d1fa7).

#### `dc.markNoticedChat(chatId)`

Mark all messages in a chat as _noticed_. Corresponds to [`dc_marknoticed_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a7286128d6c3ae3f274f72241fbc4353c).

#### `dc.markNoticedContact(contactId)`

Mark all messages sent by the given contact as _noticed_. Corresponds to [`dc_marknoticed_contact()`](https://deltachat.github.io/api/classdc__context__t.html#a7cc233792a13ec0f893f6299c12ca061).

#### `dc.markSeenMessages(messageIds)`

Mark a message as _seen_, updates the IMAP state and sends MDNs. Corresponds to [`dc_markseen_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#ae5305a90c09380dffe54e68c2a709128).

#### `dc.messageNew()`

Create a new `Message` object. Corresponds to [`dc_msg_new()`](https://deltachat.github.io/api/classdc__msg__t.html#a3d5e65374c014990c35a0cee9b0ddf87).

#### `dc.removeContactFromChat(chatId, contactId)`

Remove a member from a group. Corresponds to [`dc_remove_contact_from_chat()`](https://deltachat.github.io/api/classdc__context__t.html#a72d4db8f0fcb595f11045882284f408f).

#### `dc.searchMessages(chatId, query)`

Search messages containing the given query string. Corresponds to [`dc_search_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#a777bb1e11d7ea0288984ad23c2d8663b).

#### `dc.sendAudioMessage(chatId, file, fileMime, duration, author, trackName)`

Send an audio file to a chat. Corresponds to [`dc_send_audio_msg()`](https://deltachat.github.io/api/classdc__context__t.html#a2a4feaab2957937232765de9f8c6e28e).

#### `dc.sendFileMessage(chatId, file, fileMime)`

Send a document to a chat. Corresponds to [`dc_send_file_msg()`](https://deltachat.github.io/api/classdc__context__t.html#a72a1daeec8c19ed39ed8789495432fda).

#### `dc.sendImageMessage(chatId, file, fileMime, width, height)`

Send an image to a chat. Corresponds to [`dc_send_image_msg()`](https://deltachat.github.io/api/classdc__context__t.html#acd4f00685674326ab34aeecb71e0a1f1).

#### `dc.sendMessage(chatId, msg)`

Send a message of any type to a chat. Corresponds to [`dc_send_msg()`](https://deltachat.github.io/api/classdc__context__t.html#aaba70910f9c3b3819bba1d04e4d54e02).

#### `dc.sendTextMessage(chatId, text)`

Send a text message to a chat. Corresponds to [`dc_send_text_msg()`](https://deltachat.github.io/api/classdc__context__t.html#a2e30845e0c4676e1b0f7c5b4a15fb2b6).

#### `dc.sendVcardMessage(chatId, contactId)`

Send foreign contact data to a chat. Corresponds to [`dc_send_vcard_msg()`](https://deltachat.github.io/api/classdc__context__t.html#af97841e2540de020847da4cd1c4ccc71).

#### `dc.sendVideoMessage(chatId, file, fileMime, width, height, duration)`

Send a video to a chat. Corresponds to [`dc_send_video_msg()`](https://deltachat.github.io/api/classdc__context__t.html#acc880b4691a35791ce832dced698a4a4).

#### `dc.sendVoiceMessage(chatId, file, fileMime, duration)`

Send a voice message to a chat. Corresponds to [`dc_send_voice_msg()`](https://deltachat.github.io/api/classdc__context__t.html#a3ddd69eb4955a5f7ec10f40fb00a4384).

#### `dc.setChatName(chatId, name)`

Set group name. Corresponds to [`dc_set_chat_name()`](https://deltachat.github.io/api/classdc__context__t.html#a9b55b79050c263a7b13a42b35eb6f41c).

#### `dc.setChatProfileImage(chatId, image)`

Set group profile image. Corresponds to [`dc_set_chat_profile_image()`](https://deltachat.github.io/api/classdc__context__t.html#a9173428fc8f5727a04db2172a9aaa044).

#### `dc.setConfig(key, value)`

Configure the context. Corresponds to [`dc_set_config()`](https://deltachat.github.io/api/classdc__context__t.html#aff3b894f6cfca46cab5248fdffdf083d).

#### `dc.setConfigInt(key, value)`

Configure the context. Corresponds to [`dc_set_config_int()`](https://deltachat.github.io/api/classdc__context__t.html#af7259da69bebbff86c7ee776559263cd).

#### `dc.setOffline(offline)`

Let the `DeltaChat` instance know that the application is offline/online.

#### `dc.setTextDraft(chatId, text)`

Save a draft for a chat in the database. Corresponds to [`dc_set_text_draft()`](https://deltachat.github.io/api/classdc__context__t.html#a2dcb54d63d73b547077ad4f980509ac0).

#### `dc.starMessages(messageIds, star)`

Star/unstar messages. Corresponds to [`dc_star_msgs()`](https://deltachat.github.io/api/classdc__context__t.html#a211ab66e424092c2b617af637d1e1d35).

------------------------------------

<a name="class_chat"></a>
### `class Chat`

An object representing a single chat in memory.

#### `chat.getArchived()`

Get archived state. Corresponds to [`dc_chat_get_archived()`](https://deltachat.github.io/api/classdc__chat__t.html#af8b59ed08edfa2a5c4b7a3787613230d).

#### `chat.getDraftTimestamp()`

Get timestamp of the draft. Corresponds to [`dc_chat_get_draft_timestamp()`](https://deltachat.github.io/api/classdc__chat__t.html#a15e1c501919bd73e6ee6a52a36c9fc0e).

#### `chat.getId()`

Get chat id. Corresponds to [`dc_chat_get_id()`](https://deltachat.github.io/api/classdc__chat__t.html#a4e647c69a9f61fc4497f6293371e0017).

#### `chat.getName()`

Get name of a chat. Corresponds to [`dc_chat_get_name()`](https://deltachat.github.io/api/classdc__chat__t.html#a0fb1b4850bcd899eaa06d23648a1efaf).

#### `chat.getProfileImage()`

Get the chat's profile image. Corresponds to [`dc_chat_get_profile_image()`](https://deltachat.github.io/api/classdc__chat__t.html#ad96106c6b88f7705d8ac263133a61c43).

#### `chat.getSubtitle()`

Get a subtitle for a chat. Corresponds to [`dc_chat_get_subtitle()`](https://deltachat.github.io/api/classdc__chat__t.html#a1508279f522decd5e404e4c4fa42adf4).

#### `chat.getTextDraft()`

Get draft for a chat, if any. Corresponds to [`dc_chat_get_text_draft()`](https://deltachat.github.io/api/classdc__chat__t.html#a08e4bc816bdf6f7ce9aa61dd0a5bc924).

#### `chat.getType()`

Get chat type. Corresponds to [`dc_chat_get_type()`](https://deltachat.github.io/api/classdc__chat__t.html#a2841f242370f06639a33940e7da17e8d).

#### `chat.isSelfTalk()`

Check if a chat is a self talk. Corresponds to [`dc_chat_is_self_talk()`](https://deltachat.github.io/api/classdc__chat__t.html#ad1a5909513e8990b261cd2c66d1ceb30).

#### `chat.isUnpromoted()`

Check if a chat is still unpromoted. Corresponds to [`dc_chat_is_unpromoted()`](https://deltachat.github.io/api/classdc__chat__t.html#aba1e99ebd5546283bf5f748d86c64a54).

#### `chat.isVerified()`

Check if a chat is verified. Corresponds to [`dc_chat_is_verified()`](https://deltachat.github.io/api/classdc__chat__t.html#a8149813f4e6aea8f30592bea1be9f3c4).

------------------------------------

<a name="class_chatlist"></a>
### `class ChatList`

An object representing a single chatlist in memory.

#### `list.getChatId(index)`

Get a single chat id of a chatlist. Corresponds to [`dc_chatlist_get_chat_id()`](https://deltachat.github.io/api/classdc__chatlist__t.html#ac0fcc0aaa05adc66a7813d86f168320c).

#### `list.getCount()`

Get the number of chats in a chatlist. Corresponds to [`dc_chatlist_get_cnt()`](https://deltachat.github.io/api/classdc__chatlist__t.html#af3ee352c8891416c1be865ed11de1878).

#### `list.getMessageId(index)`

Get a single message id of a chatlist. Corresponds to [`dc_chatlist_get_msg_id()`](https://deltachat.github.io/api/classdc__chatlist__t.html#a0d089b4a45faa0e29d4350ef29049fd3).

#### `list.getSummary(index, chat)`

Get a summary for a chatlist index. Returns a `Lot` object. Corresponds to [`dc_chatlist_get_summary()`](https://deltachat.github.io/api/classdc__chatlist__t.html#a7e155ba468613547743bf383600914d1).

------------------------------------

<a name="class_contact"></a>
### `class Contact`

An object representing a single contact in memory.

#### `contact.getAddress()`

Get email address. Corresponds to [`dc_contact_()`](https://deltachat.github.io/api/classdc__contact__t.html#a017fc5f3c27f52547c515fadc5658e01).

#### `contact.getDisplayName()`

Get display name. Corresponds to [`dc_contact_get_display_name()`](https://deltachat.github.io/api/classdc__contact__t.html#accb0ce055f5bcc23dee932a1898a718b).

#### `contact.getFirstName()`

Get the part of the name before the first space. Corresponds to [`dc_contact_get_first_name()`](https://deltachat.github.io/api/classdc__contact__t.html#aae2dae4bd8b0deb6f2fbca9e0d819a8c).

#### `contact.getId()`

Get the id of the contact. Corresponds to [`dc_contact_get_id()`](https://deltachat.github.io/api/classdc__contact__t.html#ae445bdaeca959849a6780fe72869c432).

#### `contact.getName()`

Get the name of the contact. Corresponds to [`dc_contact_get_name()`](https://deltachat.github.io/api/classdc__contact__t.html#acc088a0f8599c35fa9adde8feed358b7).

#### `contact.getNameAndAddress()`

Get a summary of name and address. Corresponds to [`dc_contact_get_name_n_addr()`](https://deltachat.github.io/api/classdc__contact__t.html#a16056431c6926d327f5728ad3ddd4fdf).

#### `contact.isBlocked()`

Check if a contact is blocked. Corresponds to [`dc_contact_is_blocked()`](https://deltachat.github.io/api/classdc__contact__t.html#ac1cce8a12bb9f1c64c644682fdc8d9cc).

#### `contact.isVerified()`

Check if a contact is verified. Corresponds to [`dc_contact_is_verified()`](https://deltachat.github.io/api/classdc__contact__t.html#a287ad50725bd26f8a8a7df36ce56b91f).

------------------------------------

<a name="class_lot"></a>
### `class Lot`

An object containing a set of values in memory.

#### `lot.getId()`

Get the associated id. Corresponds to [`dc_lot_get_id()`](https://deltachat.github.io/api/classdc__lot__t.html#aaa5641298d6eda304d139e2c43e8e137).

#### `lot.getState()`

Get the associated state. Corresponds to [`dc_lot_get_state()`](https://deltachat.github.io/api/classdc__lot__t.html#a0f5a4ad12b017a21ebeb3c1e971a7bc1).

#### `lot.getText1()`

Get first string. Corresponds to [`dc_lot_get_text1()`](https://deltachat.github.io/api/classdc__lot__t.html#aec2595b576242390fb759039c3e6c854).

#### `lot.getText1Meaning()`

Get the meaning of the first string. Corresponds to [`dc_lot_get_text1_meaning()`](https://deltachat.github.io/api/classdc__lot__t.html#aba1dec0fb2d145ada23d655f1d198e83).

#### `lot.getText2()`

Get the second string. Corresponds to [`dc_lot_get_text2()`](https://deltachat.github.io/api/classdc__lot__t.html#af729cffd86d8eb01f85884a6628683e7).

#### `lot.getTimestamp()`

Get the associated timestamp. Corresponds to [`dc_lot_get_timestamp()`](https://deltachat.github.io/api/classdc__lot__t.html#af4c1b738ae5340c3ea3e7cb0cc5d0c73).

------------------------------------

<a name="class_message"></a>
### `class Message`

An object representing a single message in memory.

#### `message.getChatId()`

Get the id of the chat the message belongs to. Corresponds to [`dc_msg_get_chat_id()`](https://deltachat.github.io/api/classdc__msg__t.html#a21aa5dbd0c7391b707f77b97ac137cbf).

#### `message.getDuration()`

Get duration of audio of video. Corresponds to [`dc_msg_get_duration()`](https://deltachat.github.io/api/classdc__msg__t.html#aaedb426314f3d701d606ba3daa24fc1a).

#### `message.getFile()`

Find out full path, file name and extension of the file associated with a message. Corresponds to [`dc_msg_get_file()`](https://deltachat.github.io/api/classdc__msg__t.html#ae8b750f6aa5e388a36c8be4c57b16271).

#### `message.getFilebytes()`

Get the size of the file. Corresponds to [`dc_msg_get_filebytes()`](https://deltachat.github.io/api/classdc__msg__t.html#a918893073cf6bb0ac324a66a47062db3).

#### `message.getFilemime()`

Get mime type of the file. Corresponds to [`dc_msg_get_filemime()`](https://deltachat.github.io/api/classdc__msg__t.html#a56b59cbaae2f570723600ba130ea12a4).

#### `message.getFilename()`

Get base file name without path. Corresponds to [`dc_msg_get_filename()`](https://deltachat.github.io/api/classdc__msg__t.html#a0ee3fda6369513391f64b996c8cbeb34).

#### `message.getFromId()`

Get the id of the contact that wrote the message. Corresponds to [`dc_msg_get_from_id()`](https://deltachat.github.io/api/classdc__msg__t.html#a2b031e216af41a41f6c12f4142d2e447).

#### `message.getHeight()`

Get height of image or video. Corresponds to [`dc_msg_get_height()`](https://deltachat.github.io/api/classdc__msg__t.html#ae4b99aa662455a4c37430e678894bfdb).

#### `message.getId()`

Get the id of the message. Corresponds to [`dc_msg_get_id()`](https://deltachat.github.io/api/classdc__msg__t.html#ab007f6ccf670907af9ac6788c74a0641).

#### `message.getMediainfo()`

Get real author and title. Returns a `Lot` object. Corresponds to [`dc_msg_get_mediainfo()`](https://deltachat.github.io/api/classdc__msg__t.html#a4e963387430c148a588cb268c18827d3).

#### `message.getSetupcodebegin()`

Get first characters of the setup code. Corresponds to [`dc_msg_get_setupcodebegin()`](https://deltachat.github.io/api/classdc__msg__t.html#a677bca5655a8cc9f7a838fa588562d12).

#### `message.getShowpadlock()`

Check if a padlock should be shown beside the message. Corresponds to [`dc_msg_get_showpadlock()`](https://deltachat.github.io/api/classdc__msg__t.html#a1beb22d18c9c045f7982718879a78440).

#### `message.getState()`

Get the state of the message. Corresponds to [`dc_msg_get_state()`](https://deltachat.github.io/api/classdc__msg__t.html#a83fbf6e74d09a0b598ccefe9b48bd68c).

#### `message.getSummary(chat)`

Get a summary of a message. Returns a `Lot` object. Corresponds to [`dc_msg_get_summary()`](https://deltachat.github.io/api/classdc__msg__t.html#a2107a9532d0d157766329c53fa1617d8).

#### `message.getSummarytext(approxCharacters)`

Get a message summary as a single line of text. Corresponds to [`dc_msg_get_summarytext()`](https://deltachat.github.io/api/classdc__msg__t.html#a14af0d3ec8277eaad7f66464a0cd8fb3).

#### `message.getText()`

Get the text of the message. Corresponds to [`dc_msg_get_text()`](https://deltachat.github.io/api/classdc__msg__t.html#a2577851182c3665a8b8a2de759fd09f1).

#### `message.getTimestamp()`

Get message sending time. Corresponds to [`dc_msg_get_timestamp()`](https://deltachat.github.io/api/classdc__msg__t.html#af667c538fd07771eb94d6c5d1879b906).

#### `message.getType()`

Get the type of the message. Corresponds to [`dc_msg_get_type()`](https://deltachat.github.io/api/classdc__msg__t.html#aa1b0e553c44a8df5e9f725087a5186f2).

#### `message.getWidth()`

Get the width of image or video. Corresponds to [`dc_msg_get_width()`](https://deltachat.github.io/api/classdc__msg__t.html#a5249ddd8d5eea3155a3c0bc121722a1d).

#### `message.isForwarded()`

Check if the message is a forwarded message. Corresponds to [`dc_msg_is_forwarded()`](https://deltachat.github.io/api/classdc__msg__t.html#a6d5b3b500fc36d7e1fc53bc2622c7dad).

#### `message.isIncreation()`

Check if a message is still in creation. Corresponds to [`dc_msg_is_increation()`](https://deltachat.github.io/api/classdc__msg__t.html#abd187cb4f114fd77c83b6d914d3977db).

#### `message.isInfo()`

Check if the message is an informational message, created by the device or by another user. Corresponds to [`dc_msg_is_info()`](https://deltachat.github.io/api/classdc__msg__t.html#a7272ddc7b2da2605463fa3ce0a00edc7).

#### `message.isSent()`

Check if a message was sent successfully. Corresponds to [`dc_msg_is_sent()`](https://deltachat.github.io/api/classdc__msg__t.html#ae75e92a28d0c3dc3e7239f0f132d8788).

#### `message.isSetupmessage()`

Check if the message is an Autocrypt setup message. Corresponds to [`dc_msg_is_setupmessage()`](https://deltachat.github.io/api/classdc__msg__t.html#a8a1c2f34e4b56161bd0057983ac2d104).

#### `message.isStarred()`

Check if a message is starred. Corresponds to [`dc_msg_is_starred()`](https://deltachat.github.io/api/classdc__msg__t.html#aa1fa85cab4cdcf7a1cb5565939367ea0).

#### `message.latefilingMediasize(width, height, duration)`

Late filing information to a message. Corresponds to [`dc_msg_latefiling_mediasize()`](https://deltachat.github.io/api/classdc__msg__t.html#a7687ff969841f3d00c3a212f9ad27861).

#### `message.setDimension(width, height)`

Set the dimensions associated with a message. Corresponds to [`dc_msg_set_dimension()`](https://deltachat.github.io/api/classdc__msg__t.html#a6bc82bec36d7bc4218f9a26ebc3c24ae).

#### `message.setDuration(duration)`

Set the duration assocated with the message object. Corresponds to [`dc_msg_set_duration()`](https://deltachat.github.io/api/classdc__msg__t.html#a32bd05a4c5113b098004c16c2b4a14ec).

#### `message.setFile(file, mime)`

Set the file assocated with the message object. Corresponds to [`dc_msg_set_file()`](https://deltachat.github.io/api/classdc__msg__t.html#ae3d4b2a4ed4b10dbe13396ff7739160e).

#### `message.setMediainfo(author, trackName)`

Set the media information assocated with the message object. Corresponds to [`dc_msg_set_mediainfo()`](https://deltachat.github.io/api/classdc__msg__t.html#af55fa139fe745ed0388ab3cea7403a31).

#### `message.setText(text)`

Set the test of a message object. Corresponds to [`dc_msg_set_text()`](https://deltachat.github.io/api/classdc__msg__t.html#a352d9e2cc2fcacac43bb540550a578a1).

#### `message.setType(type)`

Set the type of a message object. Corresponds to [`dc_msg_set_type()`](https://deltachat.github.io/api/classdc__msg__t.html#a5d5568d88453a31a1379299d9c155c4f).

## Events

`DeltaChat` is an [`EventEmitter`](https://nodejs.org/api/events.html) and emits the following events.

| Event     | Description                 | Arguments            |
|:----------|:----------------------------|:---------------------|
| `ready`     | `DeltaChat` is ready to receive commands        | -   |

## Developing

If you're cloning this repository in order to hack on it, you need to setup `deltachat-core` dependencies correctly, before doing `npm install`.

The following commands should be enough to get started.

```
git clone https://github.com/deltachat/deltachat-node.git
cd deltachat-node
npm run submodule
npm install
```

**Note** that `deltachat-core` in turn has external dependencies. Please see [build instructions](https://github.com/deltachat/deltachat-core#build) for more information.

## License

Licensed under the GPLv3, see [LICENSE](./LICENSE) file for details.

Copyright © 2018-present Delta Chat contributors.

[deltachat-core]: https://github.com/deltachat/deltachat-core
