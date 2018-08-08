# Changelog

## [Unreleased]

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

[Unreleased]: https://github.com/deltachat/deltachat-node/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/deltachat/deltachat-node/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/deltachat/deltachat-node/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/deltachat/deltachat-node/compare/v0.1.0...v0.1.1
