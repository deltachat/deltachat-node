# Changelog

## [Unreleased]

## [0.35.0] - 2019-01-05

### Changed
* Uncomment `mvbox` and `sentbox` code (@jikstra)
* Upgrade `deltachat-core` dependency to `v0.35.0` (changes to `dc_get_chat_media()` and `dc_get_next_media()`) (@ralphtheninja)

**Historical Note** We started following the core version from this point to make it easier to identify what we're using in e.g. the desktop application.

## [0.30.1] - 2018-12-28

### Changed
* Upgrade `deltachat-core` dependency to `v0.34.0` (@ralphtheninja)

## [0.30.0] - 2018-12-24

### Changed
* Upgrade `deltachat-core` dependency to `v0.32.0` (@ralphtheninja)

**Historical Note** This release temporarily disables `mvbox` and `sentbox` threads, i.e. only one thread for IMAP and SMTP will be running.

## [0.29.0] - 2018-12-20

### Changed
* Upgrade `deltachat-core` dependency to `v0.31.1` (core sends simultaneously to the INBOX) (@karissa, @ralphtheninja)

## [0.28.2] - 2018-12-18

### Fixed
* Pass in empty string instead of `null` as `param2` in `dc.importExport()` (@jikstra)

### Changed
* Change minimum node version to `v8.6.0` (@ralphtheninja)

## [0.28.1] - 2018-12-10

### Fixed
* Pass in empty string instead of `null` in `dc.setChatProfileImage()` (@ralphtheninja)

## [0.28.0] - 2018-12-10

### Changed
* Upgrade `deltachat-core` dependency to `v0.29.0` (colors for chat and contact) (@ralphtheninja)

### Added
* Add `chat.getColor()` (@ralphtheninja)
* Add `contact.getColor()` (@ralphtheninja)

## [0.27.0] - 2018-12-05

### Changed
* Rewrite tests to be pure unit tests (@ralphtheninja)
* Enable chaining in `Message` class for all .set methods (@ralphtheninja)
* Document workflow for prebuilt binaries (@ralphtheninja)

### Added
* Add `contact.getProfileImage()` (@ralphtheninja)
* Add `docker.bash` script (@ralphtheninja)
* Add `dc.getDraft()` (@ralphtheninja)
* Add `dc.setDraft()` (@ralphtheninja)

### Removed
* Remove `dc.setTextDraft()` (@ralphtheninja)
* Remove `chat.getDraftTimestamp()` (@ralphtheninja)
* Remove `chat.getTextDraft()` (@ralphtheninja)

## [0.26.1] - 2018-11-28

### Changed
* Upgrade `deltachat-core` dependency to `v0.27.0` (chat profile image bug fix) (@ralphtheninja)

## [0.26.0] - 2018-11-27

### Changed
* Rewrite tests to be completely based on environment variables (@ralphtheninja)

### Added
* Add `isInfo` and `isForwarded` to `message.toJson()` (@karissa)
* Add `prebuildify` for making prebuilt binaries (@ralphtheninja)
* Add Jenkins (@ralphtheninja)

**Historical Note** From this version and onward we deliver prebuilt binaries, starting with linux x64.

## [0.25.0] - 2018-11-23

### Changed
* Upgrade `deltachat-core` dependency to `v0.26.1` (@ralphtheninja)
* README: `libetpan-dev` _can_ be installed on the system without breaking compile (@ralphtheninja)
* `events.js` is now automatically generated based on `deltachat-core/src/deltachat.h` (@ralphtheninja)

### Added
* Add `DC_EVENT_ERROR_NETWORK` and `DC_EVENT_ERROR_SELF_NOT_IN_GROUP` events (@ralphtheninja)

### Removed
* Remove `DC_ERROR_NO_NETWORK` and `DC_STR_NONETWORK` constants (@ralphtheninja)

### Fixed
* `dc.setChatProfileImage()` accepts `null` image (@ralphtheninja)

## [0.24.0] - 2018-11-16

### Changed
* Make `dc.configure()` take camel case options (@ralphtheninja)
* Update troubleshooting section in README (@ralphtheninja)
* Upgrade `deltachat-core` dependency to `v0.25.1` (@ralphtheninja)
* Upgrade `opn-cli` devDependency to `^4.0.0` (@ralphtheninja)

### Added
* Add `.imapFolder` option (@ralphtheninja)
* Add `dc.maybeNetwork()` (@ralphtheninja)

### Removed
* Remove `DC_EVENT_IS_OFFLINE` (@ralphtheninja)

### Fixed
* Make compile work even if `libetpan-dev` is installed on the system (@ralphtheninja)

**Historical Note** From this version and onwards `deltachat-core` is now in single folder mode.

## [0.23.1] - 2018-11-02

### Changed
* Allow passing `NULL` to `dc_set_chat_profile_image()` (@ralphtheninja)

## [0.23.0] - 2018-10-30

### Changed
* Allow users to remove config options with `dc.configure()` (@karissa)
* Upgrade `deltachat-core` to `v0.24.0` (@ralphtheninja)

### Added
* Add `DeltaChat#setStringTable()` and `DeltaChat#clearStringTable()` (@r10s, @ralphtheninja)

### Removed
* Remove `Message#getMediainfo()` and `Message#setMediainfo()` (@ralphtheninja)

## [0.22.1] - 2018-10-25

### Added
* Add `.showPadlock` to `Message#toJson()` (@ralphtheninja)

## [0.22.0] - 2018-10-23

### Added
* Add static method `DeltaChat#getSystemInfo()` (@ralphtheninja)

### Changed
* README: Update docs on `dc.getInfo()` (@ralphtheninja)

## [0.21.0] - 2018-10-17

### Changed
* Upgrade `deltachat-core` to `v0.23.0` (@ralphtheninja)

### Added
* Add static method `DeltaChat#maybeValidAddr()` (@ralphtheninja)
* Add `dc.lookupContactIdByAddr()` (@ralphtheninja)
* Add `dc.getMimeHeaders()` (@ralphtheninja)
* Add `message.getReceivedTimestamp()` (@ralphtheninja)
* Add `selfavatar` option (@ralphtheninja)
* Add `mdns_enabled` option (@ralphtheninja)

### Removed
* Remove `DC_EVENT_FILE_COPIED` event (@ralphtheninja)

## [0.20.0] - 2018-10-11

### Changed
* Upgrade `deltachat-core` for improved speed when sending messages (@ralphtheninja)

### Removed
* Remove default value parameter from `DeltaChat#getConfig()` (@ralphtheninja)
* Remove `DeltaChat#sendAudioMessage()` (@ralphtheninja)
* Remove `DeltaChat#sendFileMessage()` (@ralphtheninja)
* Remove `DeltaChat#sendImageMessage()` (@ralphtheninja)
* Remove `DeltaChat#sendTextMessage()` (@ralphtheninja)
* Remove `DeltaChat#sendVcardMessage()` (@ralphtheninja)
* Remove `DeltaChat#sendVideoMessage()` (@ralphtheninja)
* Remove `DeltaChat#sendVoiceMessage()` (@ralphtheninja)

## [0.19.2] - 2018-10-08

### Fixed
* Use path to db file in `DeltaChat#getConfig(path, cb)` (@ralphtheninja)

## [0.19.1] - 2018-10-08

### Fixed
* Remove all listeners in `DeltaChat#close()` (@ralphtheninja)

## [0.19.0] - 2018-10-08

### Changed
* `DeltaChat#getInfo()` returns an object based on parsed data from `dc_get_info()` (@ralphtheninja)
* Rename `Message#getType()` to `Message#getViewType()` (@ralphtheninja)
* Rename `MessageType` to `MessageViewType` (@ralphtheninja)
* `DeltaChat#messageNew()` accepts an optional `viewType` parameter (defaults to `DC_MSG_TEXT`) (@ralphtheninja)

### Added
* Add static method `DeltaChat#getConfig(path, cb)` for retrieving configuration given a folder (@ralphtheninja)
* Add `UPGRADING.md` (@ralphtheninja)

### Removed
* Remove `DeltaChat#setConfigInt()` and `DeltaChat#getConfigInt()` (@ralphtheninja)
* Remove `Message#setType()` (@ralphtheninja)
* Remove `DC_MSG_UNDEFINED` view type (@ralphtheninja)

## [0.18.2] - 2018-10-06

### Removed
* Remove redundant `DC_EVENT_GET_STRING` and `DC_EVENT_GET_QUANTITY_STRING` events (@ralphtheninja)

## [0.18.1] - 2018-10-05

### Changed
* Fix broken link to core build instructions (@ralphtheninja)
* Print ut error message in test autoconfig test (@ralphtheninja)

### Fixed
* Link against global `-lsasl2` instead and fallback to bundled version (@ralphtheninja)

## [0.18.0] - 2018-09-27

### Changed
* Build against system version of openssl (@ralphtheninja)
* Update links to c documentation (@r10s)
* Upgrade `deltachat-core` for hex-literals fix (@ralphtheninja)
* Print out env and openssl version on Travis (@ralphtheninja)

### Added
* Test `DC_EVENT_CONFIGURE_PROGRESS` (@ralphtheninja)

## [0.17.1] - 2018-09-25

### Changed
* Close context database in `dc.close()` (@ralphtheninja)

## [0.17.0] - 2018-09-25

### Changed
* Tweak `binding.gyp` to prepare for windows (@ralphtheninja)

### Added
* Implement `dc.isOpen()` to check for open context database (@ralphtheninja)

### Removed
* Remove redundant include path for `libetpan` (@ralphtheninja)

## [0.16.0] - 2018-09-24

### Changed
* Make `dc.initiateKeyTransfer()` and `dc.continueKeyTransfer()` async (@jikstra)
* Rewrite rebuild script in JavaScript (@ralphtheninja)
* Make JavaScript event handler private (@ralphtheninja)
* Document `toJson()` methods (@ralphtheninja)
* Use `NULL` instead of `0` (@ralphtheninja)
* `npm install` is silent and builds in `Release` mode by default (@ralphtheninja)
* Upgrade `deltachat-core` for message changed event fixes (@ralphtheninja)
* Callback is not optional in `dc.open()` (@ralphtheninja)

## [0.15.0] - 2018-09-20

### Changed
* Upgrade `deltachat-core` for `DC_EVENT_HTTP_GET` empty string fix (@ralphtheninja)
* Change official support to node 8 (and electron 2) (@ralphtheninja)
* Refactor tests (@ralphtheninja)

### Added
* Test autoconfig on merlinux server (@ralphtheninja)

### Fixed
* Reset `dc_event_http_done` to 0 after lock is released (@ralphtheninja)

## [0.14.0] - 2018-09-19

### Changed
* Upgrade `deltachat-core` to latest master (@ralphtheninja)

### Added
* Add support for `DC_EVENT_HTTP_GET` (@ralphtheninja, @r10s)

### Fixed
* Fix incorrect link order causing missing `RSA_check_key` symbol (@ralphtheninja)

## [0.13.1] - 2018-09-18

### Fixed
* Fix symlink problems in `deltachat-core` (@ralphtheninja)

## [0.13.0] - 2018-09-17

### Changed
* Use `deltachat-core#flub-openssl` so we can build on mac (@ralphtheninja)

## [0.12.0] - 2018-09-17

### Changed
* Upgrade `debug` devDependency from `^3.1.0` to `^4.0.0` (@greenkeeper)
* Upgrade `deltachat-core` for `dc_marknoticed_all_chats()`, new constants and new events (@ralphtheninja)

### Added
* Add `dc.markNoticedAllChats()` (@ralphtheninja)
* Add events `DC_EVENT_SMTP_CONNECTED`, `DC_EVENT_IMAP_CONNECTED` and `DC_EVENT_SMTP_MESSAGE_SENT` (@ralphtheninja)
* Add constants `DC_CHAT_ID_ALLDONE_HINT`, `DC_EVENT_IMAP_CONNECTED`, `DC_EVENT_SMTP_CONNECTED`, `DC_EVENT_SMTP_MESSAGE_SENT` and `DC_GCL_ADD_ALLDONE_HINT` (@ralphtheninja)

## [0.11.0] - 2018-09-10

### Changed
* Upgrade `deltachat-core` (@ralphtheninja)
* Rewrite open and configure workflow (@ralphtheninja)
* Document tests, coverage and npm scripts (@ralphtheninja)

## [0.10.0] - 2018-09-03

### Changed
* Sort keys in `constants.js` alphabetically (@ralphtheninja)
* Upgrade `deltachat-core` for new `DC_EVENT_FILE_COPIED` (@ralphtheninja)

### Added
* Test `DC_EVENT_FILE_COPIED` (@ralphtheninja)

### Fixed
* Fix profile image tests (image moved to blob dir) (@ralphtheninja)

## [0.9.4] - 2018-08-30

### Added
* Add `.id` and `.isSetupmessage` to `Message#toJson()` (@karissa)

### Removed
* Remove `.id` from `Lot#toJson()` (@karissa)

## [0.9.3] - 2018-08-29

### Fixed
* Fix typo (@karissa)

## [0.9.2] - 2018-08-29

### Added
* Add `.state` and `.mediaInfo` to `Message#toJson()` (@karissa)

## [0.9.1] - 2018-08-29

### Changed
* Upgrade `deltachat-core` (@ralphtheninja)
* Forward strings from `data1` in the same way as for `data2` (@r10s)
* Upgrade `standard` devDependency to `^12.0.0` (@greenkeeper)
* Full coverage of `message.js` (@ralphtheninja)

### Added
* Test `dc.getBlobdir()` (@ralphtheninja)
* Test `displayname`, `selfstatus` and `e2ee_enabled` config (@ralphtheninja)
* Add `.file` to `Message#toJson()` (@karissa)

## [0.9.0] - 2018-08-28

### Changed
* Upgrade `split2` from `^2.2.0` to `^3.0.0` (@ralphtheninja)
* Run tests using `greenmail` server (@ralphtheninja)
* Test `dc.getInfo()`, `dc.getConfig()` and `dc.getConfigInt()` (@ralphtheninja)

### Added
* Add dependency badge (@ralphtheninja)
* Add `toJson()` methods (@karissa)

## [0.8.0] - 2018-08-26

### Changed
* Refactor classes into separate files (@ralphtheninja)
* Rename `dev` script to `rebuild` (@ralphtheninja)

### Added
* Add support for all configuration parameters (@ralphtheninja)
* Add `coverage-html-report` script (@ralphtheninja)

### Removed
* Remove `start` script (@ralphtheninja)

### Fixed
* Don't check for bits in the message type (@r10s)

## [0.7.0] - 2018-08-26

### Changed
* Upgrade `deltachat-core` for `secure_delete` and fixes to `libetpan` (@ralphtheninja)
* Test events (@ralphtheninja)

### Added
* Add `MessageType` class (@ralphtheninja)
* Add `dependency-check` module (@ralphtheninja)

### Fixed
* Fix `message.getFilebytes()` (@ralphtheninja)

## [0.6.2] - 2018-08-24

### Changed
* Prefer async `mkdirp` (@karissa)

## [0.6.1] - 2018-08-24

### Fixed
* Add `mkdirp.sync()` in `dc.open()` (@ralphtheninja)

## [0.6.0] - 2018-08-22

### Changed
* Implement a temporary polling mechanism for events to relax the requirements for `node` and `electron` (@ralphtheninja)

## [0.5.1] - 2018-08-20

### Changed
* Put back `'ready'` event (@ralphtheninja)

### Fixed
* Fix broken tests (@ralphtheninja)

## [0.5.0] - 2018-08-20

### Changed
* Bump `deltachat-core` for updated constants and fallbacks to `cyrussasl`, `iconv` and `openssl` (@ralphtheninja)
* Refactor event handler code (constructor doing too much) (@ralphtheninja)
* Use `.addr` instead of `.email` for consistency with `deltachat-core` (@ralphtheninja)
* Rename `.root` to `.cwd` (@ralphtheninja)

### Added
* Add `DeltaChat#open(cb)` (constructor doing too much) (@ralphtheninja)

### Removed
* Remove `'ready'` event because `.open()` calls back when done (@ralphtheninja)
* Remove `DEBUG` output from tests (@ralphtheninja)

## [0.4.1] - 2018-08-14

### Changed
* Bump `deltachat-core` to version without symlinks, which removes the need of having `libetpan-dev` installed system wide (@ralphtheninja)

## [0.4.0] - 2018-08-12

### Changed
* Change `MessageState#_state` to a public property (@ralphtheninja)
* Allow passing in non array to `DeltaChat#starMessages` (@ralphtheninja)
* Link to classes in README (@ralphtheninja)
* Make all methods taking some form of id to accept strings as well as numbers (@ralphtheninja)

### Added
* Add `DeltaChat#getStarredMessages()` (@ralphtheninja)
* Add `DeltaChat#getChats()` (@ralphtheninja)
* Add `Message#isDeadDrop()` (@ralphtheninja)
* Add npm package version badge (@ralphtheninja)

## [0.3.0] - 2018-08-09

### Changed
* Upgrade `napi-macros` to `^1.7.0` (@ralphtheninja)
* Rename `NAPI_UTF8()` to `NAPI_UTF8_MALLOC()` (@ralphtheninja)
* Pass 1 or 0 to `dcn_set_offline()` (@ralphtheninja)
* Use `NAPI_ARGV_*` macros (@ralphtheninja)
* Wait with configure until db is open and emit `'ready'` when done configuring (@ralphtheninja)
* Start threads after `open()` is finished (@ralphtheninja)

### Added
* Emit `ALL` and individual events (@ralphtheninja)
* Add reverse lookup of events from `int` to `string` in `events.js` (@ralphtheninja)
* Add `MessageState` class (@ralphtheninja)

### Fixed
* Fix :bug: with wrong index for query in `dcn_search_msg()` (@ralphtheninja)

## [0.2.0] - 2018-08-03

### Changed
* Tweak license description (@ralphtheninja)
* Handle `NULL` strings in `NAPI_RETURN_AND_FREE_STRING()` (@ralphtheninja)
* Refactor array code in `src/module.c` (@ralphtheninja)
* Split `dc.createGroupChat()` into `dc.createUnverifiedGroupChat()` and `dc.createVerifiedGroupChat()` (@ralphtheninja)
* Update minimal node version in README (@ralphtheninja)

### Added
* Add `nyc` and `coveralls` for code coverage (@ralphtheninja)
* Add `constants.js` by parsing `deltachat-core/src/deltachat.h` (@ralphtheninja)

### Removed
* Remove magic numbers from tests (@ralphtheninja)
* Remove `console.log()` from `binding.js` (@ralphtheninja)

### Fixed
* Throw helpful error if tests are missing credentials (@ralphtheninja)

## [0.1.1] - 2018-08-02

### Fixed

* Fix issues when installing from npm (@ralphtheninja)

## 0.1.0 - 2018-08-01

:seedling: Initial release.

[Unreleased]: https://github.com/deltachat/deltachat-node/compare/v0.35.0...HEAD
[0.35.0]: https://github.com/deltachat/deltachat-node/compare/v0.30.1...v0.35.0
[0.30.1]: https://github.com/deltachat/deltachat-node/compare/v0.30.0...v0.30.1
[0.30.0]: https://github.com/deltachat/deltachat-node/compare/v0.29.0...v0.30.0
[0.29.0]: https://github.com/deltachat/deltachat-node/compare/v0.28.2...v0.29.0
[0.28.2]: https://github.com/deltachat/deltachat-node/compare/v0.28.1...v0.28.2
[0.28.1]: https://github.com/deltachat/deltachat-node/compare/v0.28.0...v0.28.1
[0.28.0]: https://github.com/deltachat/deltachat-node/compare/v0.27.0...v0.28.0
[0.27.0]: https://github.com/deltachat/deltachat-node/compare/v0.26.1...v0.27.0
[0.26.1]: https://github.com/deltachat/deltachat-node/compare/v0.26.0...v0.26.1
[0.26.0]: https://github.com/deltachat/deltachat-node/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/deltachat/deltachat-node/compare/v0.24.0...v0.25.0
[0.24.0]: https://github.com/deltachat/deltachat-node/compare/v0.23.1...v0.24.0
[0.23.1]: https://github.com/deltachat/deltachat-node/compare/v0.23.0...v0.23.1
[0.23.0]: https://github.com/deltachat/deltachat-node/compare/v0.22.1...v0.23.0
[0.22.1]: https://github.com/deltachat/deltachat-node/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/deltachat/deltachat-node/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/deltachat/deltachat-node/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/deltachat/deltachat-node/compare/v0.19.2...v0.20.0
[0.19.2]: https://github.com/deltachat/deltachat-node/compare/v0.19.1...v0.19.2
[0.19.1]: https://github.com/deltachat/deltachat-node/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/deltachat/deltachat-node/compare/v0.18.2...v0.19.0
[0.18.2]: https://github.com/deltachat/deltachat-node/compare/v0.18.1...v0.18.2
[0.18.1]: https://github.com/deltachat/deltachat-node/compare/v0.18.0...v0.18.1
[0.17.1]: https://github.com/deltachat/deltachat-node/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/deltachat/deltachat-node/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/deltachat/deltachat-node/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/deltachat/deltachat-node/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/deltachat/deltachat-node/compare/v0.13.1...v0.14.0
[0.13.1]: https://github.com/deltachat/deltachat-node/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/deltachat/deltachat-node/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/deltachat/deltachat-node/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/deltachat/deltachat-node/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/deltachat/deltachat-node/compare/v0.9.4...v0.10.0
[0.9.4]: https://github.com/deltachat/deltachat-node/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/deltachat/deltachat-node/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/deltachat/deltachat-node/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/deltachat/deltachat-node/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/deltachat/deltachat-node/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/deltachat/deltachat-node/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/deltachat/deltachat-node/compare/v0.6.2...v0.7.0
[0.6.2]: https://github.com/deltachat/deltachat-node/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/deltachat/deltachat-node/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/deltachat/deltachat-node/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/deltachat/deltachat-node/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/deltachat/deltachat-node/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/deltachat/deltachat-node/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/deltachat/deltachat-node/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/deltachat/deltachat-node/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/deltachat/deltachat-node/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/deltachat/deltachat-node/compare/v0.1.0...v0.1.1
