# Changelog

## [Unreleased]

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

[Unreleased]: https://github.com/deltachat/deltachat-node/compare/v0.11.0...HEAD
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
