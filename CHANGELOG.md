# Changelog

## [Unreleased][unreleased]

### Changed

- Update deltachat-core-rust to v1.28.0

## [1.27.0] - 2019-03-14

### Changed

- Update deltachat-core-rust to v1.27.0

## [1.26.0] - 2019-03-03

### Added

- Introduce typedoc

### Changed

- Update deltachat-core-rust to v1.26.0

## [1.25.0] - 2019-02-21

### Added

- Added `chat.isSingle()` and `chat.isGroup()` methods [**@pabzm**](https://github.com/pabzm)

### Changed

- Update deltachat-core-rust to v1.25.0

## [1.0.0-beta.26] - 2019-02-07

### Changed

- Switched to Typescript

### Breaking changes:

You need to change your imports from 

```js
const DeltaChat = require('deltachat-node')
const C = require('deltachat-node/constants')
```

to

```js
const DeltaChat = require('deltachat-node').default
const { C } = require('deltachat-node')
```

## [1.0.0-beta.25] - 2019-02-07

### Added

- Add provider db

### Changed

- Update deltachat-core-rust to [`fc0292b`](https://github.com/deltachat/deltachat-node/commit/fc0292bf8ac1af59aaee97cd0c0e286db3a7e4f1)

## [1.0.0-beta.23.1] - 2019-01-29

### Changed

- Fix windows bug where invoking node-gyp-build on install step failed

## [1.0.0-beta.23] - 2019-01-24

### Added

- Add typescript support [**@nicodh**](https://github.com/nicodh) [#406](https://github.com/deltachat/deltachat-node/issues/406)

### Changed

- Update deltachat-core-rust to `1.0.0-beta.23` [**@jikstra**](https://github.com/jikstra)
- Update release instructions [**@lefherz**](https://github.com/lefherz) [**@jikstra**](https://github.com/jikstra)
- Run node-gyp and node-gyp build via npx [**@link2xt**](https://github.com/link2xt)

## [1.0.0-beta.22] - 2019-12-25

### Changed

- Update deltachat-core-rust to `1.0.0-beta.22`

## [1.0.0-beta.21] - 2019-12-20

### Changed

- Update deltachat-core-rust to `1.0.0-beta.21`

## [1.0.0-beta.18] - 2019-12-16

### Changed

- Update deltachat-core-rust to `1.0.0-beta.18`

## [1.0.0-beta.15] - 2019-12-10

### Changed

- Update deltachat-core-rust to `1.0.0-beta.15`

### Added

- Implement message dimensions [**@Simon-Laux**](https://github.com/Simon-Laux)

## [1.0.0-beta.11] - 2019-12-10

### Changed

- Update deltachat-core-rust `301852fd87140790f606f12280064ee9db80d978`

### Added

- Implement new device chat methods

## [1.0.0-beta.10] - 2019-12-05

### Changed

- Update deltachat-core-rust to `1.0.0-beta.10`

## [1.0.0-alpha.12] - 2019-11-29

### Changed

- Update deltachat-core-rust to `430d4e5f6ebddacac24f4cceebda769a8f367af7`

### Added

- Add `addDeviceMessage(label, msg)` and `chat.isDeviceTalk()` methods

## [1.0.0-alpha.11] - 2019-11-04

### Changed

- Update deltachat-core-rust to Update deltachat-core-rust to `67e2e4d415824f7698488abf609ae9f91c7c92b9` [**@jikstra**](https://github.com/jikstra) [**@simon-laux**](https://github.com/simon-laux)
- Replace setStringTable with setStockTranslation ([#389](https://github.com/deltachat/deltachat-node/issues/389)) [**@link2xt**](https://github.com/link2xt)
- Make it possible to configure {imap,smtp}\_certificate_checks ([#388](https://github.com/deltachat/deltachat-node/issues/388)) [**@link2xt**](https://github.com/link2xt)
- Enable update of DC configurations [**@nicodh**](https://github.com/nicodh)

## [1.0.0-alpha.10] - 2019-10-08

### Changed

- Updated deltachat-core-rust to `c23e98ff83e02f8d53d21ab42c5be952fcd19fbc` [**@Simon-Laux**](https://github.com/Simon-Laux) [**@Jikstra**](https://github.com/Jikstra)
- Update node-gyp [**@ralphtheninja**](https://github.com/ralphtheninja) [#383](https://github.com/deltachat/deltachat-node/issues/383)
- Implement new introduced core constants [**@hpk42**](https://github.com/hpk42) [#385](https://github.com/deltachat/deltachat-node/issues/385)

## [1.0.0-alpha.9] - 2019-10-01

### Changed

- Update deltachat-core-rust to `75f41bcb90dd0399c0110b52a7f2b53632477934`

## [1.0.0-alpha.7] - 2019-09-26

### Changed

- Update deltachat-core-rust to commit `1ed543b0e8535d5d1004b77e0d2a1475123bb18a` [**@jikstra**](https://github.com/jikstra) [#379](https://github.com/deltachat/deltachat-node/issues/379)
- Fix tests by adjusting them to minor rust core changes [**@jikstra**](https://github.com/jikstra) [#379](https://github.com/deltachat/deltachat-node/issues/379)
- Upgrade napi-macros [**@ralphtheninja**](https://github.com/ralphtheninja) [#378](https://github.com/deltachat/deltachat-node/issues/378)

## [1.0.0-alpha.6] - 2019-09-25

**Note**: Between 1.0.0-alpha.3 and this version alpha.4 and alpha.5 versions happend but were pre releases. Changelog for core-rust updates (as they mainly were) are skipped, all other changes are condensed into this release

### Changed

- Upgrade `deltachat-core-rust` submodule to `efc563f5fff808e968e8672d1654223f03613dca` [**@jikstra**](https://github.com/jikstra)
- Change License to GPL-3.0-or-later ([#375](https://github.com/deltachat/deltachat-node/issues/375)) [**@ralphtheninja**](https://github.com/ralphtheninja) 	
- Refactor test/index.js, use default tape coding style ([#368](https://github.com/deltachat/deltachat-node/issues/368)) [**@jikstra**](https://github.com/jikstra)

## [1.0.0-alpha.3] - 2019-07-22

### Changed

- Upgrade `deltachat-core-rust` submodule to `6f798008244304d1c7dc499fd8cb00b38ca2cddc` [**@jikstra**](https://github.com/jikstra)
- Upgrade hallmark dependency to version 1.0.0 [**@nicodh**](https://github.com/nicodh) [#363](https://github.com/deltachat/deltachat-node/issues/363)
- Upgrade standard to version 13.0.1 [**@ralptheninja**](https://github.com/ralptheninja) [#362](https://github.com/deltachat/deltachat-node/issues/362)

### Fixed

- Fix `call_threadsafe_function` blocking/producing deadlock [**@jikstra**](https://github.com/jikstra) [#364](https://github.com/deltachat/deltachat-node/issues/364)

### Added

- Expose `dcn_perform_imap_jobs` [**@jikstra**](https://github.com/jikstra) [#364](https://github.com/deltachat/deltachat-node/issues/364)

## [1.0.0-alpha.2] - 2019-07-09

### Changed

- Upgrade `deltachat-core-rust` submodule to `816fa1df9b23ed0b30815e80873258432618d7f0` ([**@jikstra**](https://github.com/jikstra))

## [1.0.0-alpha.1] - 2019-07-02

### Changed

- Upgrade `deltachat-core-rust` submodule to `v1.0.0-alpha.1` ([**@ralptheninja**](https://github.com/ralptheninja))

### Fixed

- Fix defaults for mailbox flags ([**@nicodh**](https://github.com/nicodh))

### Removed

- Remove `compile_date` from info ([**@ralptheninja**](https://github.com/ralptheninja))

## [1.0.0-alpha.0] - 2019-06-07

### Changed

- Make options to `dc.configure()` 1-1 with core ([**@ralptheninja**](https://github.com/ralptheninja))
- Bring back prebuilt binaries using `node-gyp-build`, `prebuildify` and `prebuildify-ci` ([**@ralptheninja**](https://github.com/ralptheninja))
- Run coverage on Travis ([**@ralptheninja**](https://github.com/ralptheninja))

### Added

- Add `deltachat-core-rust` submodule ([**@ralptheninja**](https://github.com/ralptheninja))
- Add windows to `bindings.gyp` ([**@ralptheninja**](https://github.com/ralptheninja))
- Add AppVeyor ([**@ralptheninja**](https://github.com/ralptheninja))
- Add `.inbox_watch`, `.sentbox_watch`, `.mvbox_watch`, `.mvbox_move` and `.show_emails` to options ([**@ralptheninja**](https://github.com/ralptheninja))

### Removed

- Remove `deltachat-core` submodule ([**@ralptheninja**](https://github.com/ralptheninja))
- Remove http get (handled by core) ([**@ralptheninja**](https://github.com/ralptheninja))
- Remove code related to `dc_check_password()` ([**@ralptheninja**](https://github.com/ralptheninja))
- Remove deprecated `.imap_folder` option ([**@ralptheninja**](https://github.com/ralptheninja))

### Fixed

- Make `dc.close()` async ([**@ralptheninja**](https://github.com/ralptheninja))
- Fix spawn npm on windows ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Call `dc_str_unref()` to free strings allocated in core ([**@ralptheninja**](https://github.com/ralptheninja))
- Use mutex from `libuv` for windows support ([**@ralptheninja**](https://github.com/ralptheninja))

## [0.44.0] - 2019-05-14

### Changed

- Remove --verbose from npm install [**@ralptheninja**](https://github.com/ralptheninja)
- Add section in README about making releases [**@ralphtheninja**](https://github.com/ralphtheninja)
- Update nyc [**@ralphtheninja**](https://github.com/ralphtheninja) [#305](https://github.com/deltachat/deltachat-node/issues/305)

### Added

- Allow the bindings to build against the installed version of libdeltachat.so using pkg-config. Also fixes a lot of ci related issues. [**@flub**](https://github.com/flub) [**@jikstra**](https://github.com/jikstra) [#257](https://github.com/deltachat/deltachat-node/issues/257)
- Implement bundle dependencies script for mac os x [**@nicodh**](https://github.com/nicodh) [**@jikstra**](https://github.com/jikstra) [#276](https://github.com/deltachat/deltachat-node/issues/276)
- Add marker methods for location streaming [**@ralphtheninja**](https://github.com/ralphtheninja) [#301](https://github.com/deltachat/deltachat-node/issues/301)
- Build deltachat-core with rpgp [**@flub**](https://github.com/flub) [#301](https://github.com/deltachat/deltachat-node/issues/301)

### Fixed

- Fix scripts, refactor and split out helper methods for scripts [**@jikstra**](https://github.com/jikstra) [#284](https://github.com/deltachat/deltachat-node/issues/284)
- Set variable to point to core root and fix include dirs [**@ralphtheninja**](https://github.com/ralphtheninja) [#285](https://github.com/deltachat/deltachat-node/issues/285)
- Build on node v12 and v11 [**@jikstra**](https://github.com/jikstra) [#293](https://github.com/deltachat/deltachat-node/issues/293)
- Fix docker integration tests [**@ralphtheninja**](https://github.com/ralphtheninja) [#299](https://github.com/deltachat/deltachat-node/issues/299)
- Fix broken http get for autoconfigure [**@ralphtheninja**](https://github.com/ralphtheninja) [#303](https://github.com/deltachat/deltachat-node/issues/303)
- Fix mac ci [**@jikstra**](https://github.com/jikstra) [#313](https://github.com/deltachat/deltachat-node/issues/313)
- Fix bundle dependency scripts [**@jikstra**](https://github.com/jikstra) [#314](https://github.com/deltachat/deltachat-node/issues/314)

## [0.43.0] - 2019-04-26

### Changed

- Upgrade `deltachat-core` dependency to `v0.43.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Handle `DC_EVENT_LOCATION_CHANGED` event ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `msg.setLocation()` and `msg.hasLocation()` ([**@nicodh**](https://github.com/nicodh))

## [0.42.0] - 2019-04-25

### Changed

- Upgrade `deltachat-core` dependency to `v0.42.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Adding gnu99 cstd for CentOS 7 build ([**@chrries**](https://github.com/chrries))
- Tweak preinstall script for `node-gyp-build` to work on Windows ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Switch to using `rpgp` for Mac ([**@nicodh**](https://github.com/nicodh))
- Make events push based ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update dependencies ([**@jikstra**](https://github.com/jikstra))
- Update to node 10 on Travis for Mac ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Implement location streaming ([**@nicodh**](https://github.com/nicodh))

### Removed

- Skip integration tests for PR from forked repositories ([**@nicodh**](https://github.com/nicodh))
- Remove prebuildify ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove Jenkins ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.40.2] - 2019-02-12

### Fixed

- Fix Jenkins vs Travis race ([**@ralptheninja**](https://github.com/ralphtheninja))

## [0.40.1] - 2019-02-12

### Changed

- Upgrade core to v0.40.0 ([#240](https://github.com/deltachat/deltachat-node/issues/240)) ([`29bb00c`](https://github.com/deltachat/deltachat-node/commit/29bb00c)) (jikstra)

### Uncategorized

- Update CHANGELOG ([#240](https://github.com/deltachat/deltachat-node/issues/240)) ([`ffc4ed9`](https://github.com/deltachat/deltachat-node/commit/ffc4ed9)) (jikstra)

## [0.40.0] - 2019-02-12

### Changed

- Upgrade `deltachat-core` dependency to `v0.40.0` ([**@jikstra**](https://github.com/jikstra))

## [0.39.0] - 2019-01-17

### Changed

- Upgrade `deltachat-core` dependency to `v0.39.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.38.0] - 2019-01-15

### Changed

- Upgrade `deltachat-core` dependency to `v0.38.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `Message#getSortTimestamp()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `Message#hasDeviatingTimestamp()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.36.0] - 2019-01-08

### Changed

- Allow passing in string to `dc.sendMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-core` dependency to `v0.36.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make example in README more useful ([**@Simon-Laux**](https://github.com/Simon-Laux))
- Prebuild for `node@8.6.0` and `electron@3.0.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make `deltachat-node` build on mac ([**@jikstra**](https://github.com/jikstra))
- Tweak integration tests ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `hallmark` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.35.0] - 2019-01-05

### Changed

- Uncomment `mvbox` and `sentbox` code ([**@jikstra**](https://github.com/jikstra))
- Upgrade `deltachat-core` dependency to `v0.35.0` (changes to `dc_get_chat_media()` and `dc_get_next_media()`) ([**@ralphtheninja**](https://github.com/ralphtheninja))

**Historical Note** We started following the core version from this point to make it easier to identify what we're using in e.g. the desktop application.

## [0.30.1] - 2018-12-28

### Changed

- Upgrade `deltachat-core` dependency to `v0.34.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.30.0] - 2018-12-24

### Changed

- Upgrade `deltachat-core` dependency to `v0.32.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

**Historical Note** This release temporarily disables `mvbox` and `sentbox` threads, i.e. only one thread for IMAP and SMTP will be running.

## [0.29.0] - 2018-12-20

### Changed

- Upgrade `deltachat-core` dependency to `v0.31.1` (core sends simultaneously to the INBOX) ([**@karissa**](https://github.com/karissa), [**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.28.2] - 2018-12-18

### Fixed

- Pass in empty string instead of `null` as `param2` in `dc.importExport()` ([**@jikstra**](https://github.com/jikstra))

### Changed

- Change minimum node version to `v8.6.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.28.1] - 2018-12-10

### Fixed

- Pass in empty string instead of `null` in `dc.setChatProfileImage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.28.0] - 2018-12-10

### Changed

- Upgrade `deltachat-core` dependency to `v0.29.0` (colors for chat and contact) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `chat.getColor()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `contact.getColor()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.27.0] - 2018-12-05

### Changed

- Rewrite tests to be pure unit tests ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Enable chaining in `Message` class for all .set methods ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Document workflow for prebuilt binaries ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `contact.getProfileImage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `docker.bash` script ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `dc.getDraft()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `dc.setDraft()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `dc.setTextDraft()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `chat.getDraftTimestamp()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `chat.getTextDraft()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.26.1] - 2018-11-28

### Changed

- Upgrade `deltachat-core` dependency to `v0.27.0` (chat profile image bug fix) ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.26.0] - 2018-11-27

### Changed

- Rewrite tests to be completely based on environment variables ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `isInfo` and `isForwarded` to `message.toJson()` ([**@karissa**](https://github.com/karissa))
- Add `prebuildify` for making prebuilt binaries ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add Jenkins ([**@ralphtheninja**](https://github.com/ralphtheninja))

**Historical Note** From this version and onward we deliver prebuilt binaries, starting with linux x64.

## [0.25.0] - 2018-11-23

### Changed

- Upgrade `deltachat-core` dependency to `v0.26.1` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- README: `libetpan-dev` _can_ be installed on the system without breaking compile ([**@ralphtheninja**](https://github.com/ralphtheninja))
- `events.js` is now automatically generated based on `deltachat-core/src/deltachat.h` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `DC_EVENT_ERROR_NETWORK` and `DC_EVENT_ERROR_SELF_NOT_IN_GROUP` events ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `DC_ERROR_NO_NETWORK` and `DC_STR_NONETWORK` constants ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- `dc.setChatProfileImage()` accepts `null` image ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.24.0] - 2018-11-16

### Changed

- Make `dc.configure()` take camel case options ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update troubleshooting section in README ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-core` dependency to `v0.25.1` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `opn-cli` devDependency to `^4.0.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `.imapFolder` option ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `dc.maybeNetwork()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `DC_EVENT_IS_OFFLINE` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Make compile work even if `libetpan-dev` is installed on the system ([**@ralphtheninja**](https://github.com/ralphtheninja))

**Historical Note** From this version and onwards `deltachat-core` is now in single folder mode.

## [0.23.1] - 2018-11-02

### Changed

- Allow passing `NULL` to `dc_set_chat_profile_image()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.23.0] - 2018-10-30

### Changed

- Allow users to remove config options with `dc.configure()` ([**@karissa**](https://github.com/karissa))
- Upgrade `deltachat-core` to `v0.24.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `DeltaChat#setStringTable()` and `DeltaChat#clearStringTable()` ([**@r10s**](https://github.com/r10s), [**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `Message#getMediainfo()` and `Message#setMediainfo()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.22.1] - 2018-10-25

### Added

- Add `.showPadlock` to `Message#toJson()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.22.0] - 2018-10-23

### Added

- Add static method `DeltaChat#getSystemInfo()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Changed

- README: Update docs on `dc.getInfo()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.21.0] - 2018-10-17

### Changed

- Upgrade `deltachat-core` to `v0.23.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add static method `DeltaChat#maybeValidAddr()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `dc.lookupContactIdByAddr()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `dc.getMimeHeaders()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `message.getReceivedTimestamp()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `selfavatar` option ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `mdns_enabled` option ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `DC_EVENT_FILE_COPIED` event ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.20.0] - 2018-10-11

### Changed

- Upgrade `deltachat-core` for improved speed when sending messages ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove default value parameter from `DeltaChat#getConfig()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendAudioMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendFileMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendImageMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendTextMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendVcardMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendVideoMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DeltaChat#sendVoiceMessage()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.19.2] - 2018-10-08

### Fixed

- Use path to db file in `DeltaChat#getConfig(path, cb)` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.19.1] - 2018-10-08

### Fixed

- Remove all listeners in `DeltaChat#close()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.19.0] - 2018-10-08

### Changed

- `DeltaChat#getInfo()` returns an object based on parsed data from `dc_get_info()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `Message#getType()` to `Message#getViewType()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `MessageType` to `MessageViewType` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- `DeltaChat#messageNew()` accepts an optional `viewType` parameter (defaults to `DC_MSG_TEXT`) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add static method `DeltaChat#getConfig(path, cb)` for retrieving configuration given a folder ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `UPGRADING.md` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `DeltaChat#setConfigInt()` and `DeltaChat#getConfigInt()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `Message#setType()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DC_MSG_UNDEFINED` view type ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.18.2] - 2018-10-06

### Removed

- Remove redundant `DC_EVENT_GET_STRING` and `DC_EVENT_GET_QUANTITY_STRING` events ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.18.1] - 2018-10-05

### Changed

- Fix broken link to core build instructions ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Print ut error message in test autoconfig test ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Link against global `-lsasl2` instead and fallback to bundled version ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.18.0] - 2018-09-27

### Changed

- Build against system version of openssl ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update links to c documentation ([**@r10s**](https://github.com/r10s))
- Upgrade `deltachat-core` for hex-literals fix ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Print out env and openssl version on Travis ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Test `DC_EVENT_CONFIGURE_PROGRESS` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.17.1] - 2018-09-25

### Changed

- Close context database in `dc.close()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.17.0] - 2018-09-25

### Changed

- Tweak `binding.gyp` to prepare for windows ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Implement `dc.isOpen()` to check for open context database ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove redundant include path for `libetpan` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.16.0] - 2018-09-24

### Changed

- Make `dc.initiateKeyTransfer()` and `dc.continueKeyTransfer()` async ([**@jikstra**](https://github.com/jikstra))
- Rewrite rebuild script in JavaScript ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make JavaScript event handler private ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Document `toJson()` methods ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Use `NULL` instead of `0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- `npm install` is silent and builds in `Release` mode by default ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-core` for message changed event fixes ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Callback is not optional in `dc.open()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.15.0] - 2018-09-20

### Changed

- Upgrade `deltachat-core` for `DC_EVENT_HTTP_GET` empty string fix ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Change official support to node 8 (and electron 2) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Refactor tests ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Test autoconfig on merlinux server ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Reset `dc_event_http_done` to 0 after lock is released ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.14.0] - 2018-09-19

### Changed

- Upgrade `deltachat-core` to latest master ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add support for `DC_EVENT_HTTP_GET` ([**@ralphtheninja**](https://github.com/ralphtheninja), [**@r10s**](https://github.com/r10s))

### Fixed

- Fix incorrect link order causing missing `RSA_check_key` symbol ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.13.1] - 2018-09-18

### Fixed

- Fix symlink problems in `deltachat-core` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.13.0] - 2018-09-17

### Changed

- Use `deltachat-core#flub-openssl` so we can build on mac ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.12.0] - 2018-09-17

### Changed

- Upgrade `debug` devDependency from `^3.1.0` to `^4.0.0` ([**@greenkeeper**](https://github.com/greenkeeper))
- Upgrade `deltachat-core` for `dc_marknoticed_all_chats()`, new constants and new events ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `dc.markNoticedAllChats()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add events `DC_EVENT_SMTP_CONNECTED`, `DC_EVENT_IMAP_CONNECTED` and `DC_EVENT_SMTP_MESSAGE_SENT` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add constants `DC_CHAT_ID_ALLDONE_HINT`, `DC_EVENT_IMAP_CONNECTED`, `DC_EVENT_SMTP_CONNECTED`, `DC_EVENT_SMTP_MESSAGE_SENT` and `DC_GCL_ADD_ALLDONE_HINT` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.11.0] - 2018-09-10

### Changed

- Upgrade `deltachat-core` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rewrite open and configure workflow ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Document tests, coverage and npm scripts ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.10.0] - 2018-09-03

### Changed

- Sort keys in `constants.js` alphabetically ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `deltachat-core` for new `DC_EVENT_FILE_COPIED` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Test `DC_EVENT_FILE_COPIED` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix profile image tests (image moved to blob dir) ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.9.4] - 2018-08-30

### Added

- Add `.id` and `.isSetupmessage` to `Message#toJson()` ([**@karissa**](https://github.com/karissa))

### Removed

- Remove `.id` from `Lot#toJson()` ([**@karissa**](https://github.com/karissa))

## [0.9.3] - 2018-08-29

### Fixed

- Fix typo ([**@karissa**](https://github.com/karissa))

## [0.9.2] - 2018-08-29

### Added

- Add `.state` and `.mediaInfo` to `Message#toJson()` ([**@karissa**](https://github.com/karissa))

## [0.9.1] - 2018-08-29

### Changed

- Upgrade `deltachat-core` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Forward strings from `data1` in the same way as for `data2` ([**@r10s**](https://github.com/r10s))
- Upgrade `standard` devDependency to `^12.0.0` ([**@greenkeeper**](https://github.com/greenkeeper))
- Full coverage of `message.js` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Test `dc.getBlobdir()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Test `displayname`, `selfstatus` and `e2ee_enabled` config ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `.file` to `Message#toJson()` ([**@karissa**](https://github.com/karissa))

## [0.9.0] - 2018-08-28

### Changed

- Upgrade `split2` from `^2.2.0` to `^3.0.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Run tests using `greenmail` server ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Test `dc.getInfo()`, `dc.getConfig()` and `dc.getConfigInt()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add dependency badge ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `toJson()` methods ([**@karissa**](https://github.com/karissa))

## [0.8.0] - 2018-08-26

### Changed

- Refactor classes into separate files ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `dev` script to `rebuild` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add support for all configuration parameters ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `coverage-html-report` script ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `start` script ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Don't check for bits in the message type ([**@r10s**](https://github.com/r10s))

## [0.7.0] - 2018-08-26

### Changed

- Upgrade `deltachat-core` for `secure_delete` and fixes to `libetpan` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Test events ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `MessageType` class ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `dependency-check` module ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix `message.getFilebytes()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.6.2] - 2018-08-24

### Changed

- Prefer async `mkdirp` ([**@karissa**](https://github.com/karissa))

## [0.6.1] - 2018-08-24

### Fixed

- Add `mkdirp.sync()` in `dc.open()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.6.0] - 2018-08-22

### Changed

- Implement a temporary polling mechanism for events to relax the requirements for `node` and `electron` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.5.1] - 2018-08-20

### Changed

- Put back `'ready'` event ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix broken tests ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.5.0] - 2018-08-20

### Changed

- Bump `deltachat-core` for updated constants and fallbacks to `cyrussasl`, `iconv` and `openssl` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Refactor event handler code (constructor doing too much) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Use `.addr` instead of `.email` for consistency with `deltachat-core` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `.root` to `.cwd` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `DeltaChat#open(cb)` (constructor doing too much) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `'ready'` event because `.open()` calls back when done ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `DEBUG` output from tests ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.4.1] - 2018-08-14

### Changed

- Bump `deltachat-core` to version without symlinks, which removes the need of having `libetpan-dev` installed system wide ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.4.0] - 2018-08-12

### Changed

- Change `MessageState#_state` to a public property ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Allow passing in non array to `DeltaChat#starMessages` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Link to classes in README ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Make all methods taking some form of id to accept strings as well as numbers ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `DeltaChat#getStarredMessages()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `DeltaChat#getChats()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `Message#isDeadDrop()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add npm package version badge ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.3.0] - 2018-08-09

### Changed

- Upgrade `napi-macros` to `^1.7.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `NAPI_UTF8()` to `NAPI_UTF8_MALLOC()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Pass 1 or 0 to `dcn_set_offline()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Use `NAPI_ARGV_*` macros ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Wait with configure until db is open and emit `'ready'` when done configuring ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Start threads after `open()` is finished ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Emit `ALL` and individual events ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add reverse lookup of events from `int` to `string` in `events.js` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `MessageState` class ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix :bug: with wrong index for query in `dcn_search_msg()` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.2.0] - 2018-08-03

### Changed

- Tweak license description ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Handle `NULL` strings in `NAPI_RETURN_AND_FREE_STRING()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Refactor array code in `src/module.c` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Split `dc.createGroupChat()` into `dc.createUnverifiedGroupChat()` and `dc.createVerifiedGroupChat()` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update minimal node version in README ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `nyc` and `coveralls` for code coverage ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `constants.js` by parsing `deltachat-core/src/deltachat.h` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove magic numbers from tests ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `console.log()` from `binding.js` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Throw helpful error if tests are missing credentials ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.1.1] - 2018-08-02

### Fixed

- Fix issues when installing from npm ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.1.0] - 2018-08-01

:seedling: Initial release.

## Removed

- Remove `dc_msg_has_deviating_timestamp` prototype [**@link2xt**](https://github.com/link2xt)

[unreleased]: https://github.com/deltachat/deltachat-node/compare/v1.27.0...HEAD

[1.27.0]: https://github.com/deltachat/deltachat-node/compare/v1.26.0...v1.27.0

[1.26.0]: https://github.com/deltachat/deltachat-node/compare/v1.25.0...v1.26.0

[1.25.0]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.26...v1.25.0

[1.0.0-beta.26]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.25...v1.0.0-beta.26

[1.0.0-beta.25]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.23.1...v1.0.0-beta.25

[1.0.0-beta.23.1]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.23...v1.0.0-beta.23.1

[1.0.0-beta.23]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.22...v1.0.0-beta.23

[1.0.0-beta.22]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.21...v1.0.0-beta.22

[1.0.0-beta.21]: https://github.com/deltachat/deltachat-node/compare/1.0.0-beta.18...v1.0.0-beta.21

[1.0.0-beta.20]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-beta.18...1.0.0-beta.20

[1.0.0-beta.18]: https://github.com/deltachat/deltachat-node/compare/1.0.0-beta.15...1.0.0-beta.18

[1.0.0-beta.15]: https://github.com/deltachat/deltachat-node/compare/1.0.0-beta.11...1.0.0-beta.15

[1.0.0-beta.11]: https://github.com/deltachat/deltachat-node/compare/1.0.0-beta.10...1.0.0-beta.11

[1.0.0-beta.10]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.12...1.0.0-beta.10

[1.0.0-alpha.12]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.11...v1.0.0-alpha.12

[1.0.0-alpha.11]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.10...v1.0.0-alpha.11

[1.0.0-alpha.10]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.9...v1.0.0-alpha.10

[1.0.0-alpha.9]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.7...v1.0.0-alpha.9

[1.0.0-alpha.7]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.6...v1.0.0-alpha.7

[1.0.0-alpha.6]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.3...v1.0.0-alpha.6

[1.0.0-alpha.3]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.2...v1.0.0-alpha.3

[1.0.0-alpha.2]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.1...v1.0.0-alpha.2

[1.0.0-alpha.1]: https://github.com/deltachat/deltachat-node/compare/v1.0.0-alpha.0...v1.0.0-alpha.1

[1.0.0-alpha.0]: https://github.com/deltachat/deltachat-node/compare/v0.44.0...v1.0.0-alpha.0

[0.44.0]: https://github.com/deltachat/deltachat-node/compare/v0.43.0...v0.44.0

[0.43.0]: https://github.com/deltachat/deltachat-node/compare/v0.42.0...v0.43.0

[0.42.0]: https://github.com/deltachat/deltachat-node/compare/v0.40.2...v0.42.0

[0.40.2]: https://github.com/deltachat/deltachat-node/compare/v0.40.1...v0.40.2

[0.40.1]: https://github.com/deltachat/deltachat-node/compare/v0.40.0...v0.40.1

[0.40.0]: https://github.com/deltachat/deltachat-node/compare/v0.39.0...v0.40.0

[0.39.0]: https://github.com/deltachat/deltachat-node/compare/v0.38.0...v0.39.0

[0.38.0]: https://github.com/deltachat/deltachat-node/compare/v0.36.0...v0.38.0

[0.36.0]: https://github.com/deltachat/deltachat-node/compare/v0.35.0...v0.36.0

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

[0.18.0]: https://github.com/deltachat/deltachat-node/compare/v0.17.1...v0.18.0

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

[0.1.0]: https://github.com/deltachat/deltachat-node/compare/vRemoved...v0.1.0
