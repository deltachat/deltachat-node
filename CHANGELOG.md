# Changelog

## [Unreleased]

## [0.2.0] - 2018-08-03

## Changed
* Tweak license description (@ralphtheninja)
* Handle `NULL` strings in `NAPI_RETURN_AND_FREE_STRING()` (@ralphtheninja)
* Refactor array code in `src/module.c` (@ralphtheninja)
* Split `dc.createGroupChat()` into `dc.createUnverifiedGroupChat()` and `dc.createVerifiedGroupChat()` (@ralphtheninja)
* Update minimal node version in README (@ralphtheninja)

## Added
* Add `nyc` and `coveralls` for code coverage (@ralphtheninja)
* Add `constants.js` by parsing `deltachat-core/src/deltachat.h` (@ralphtheninja)

## Removed
* Remove magic numbers from tests (@ralphtheninja)
* Remove `console.log()` from `binding.js` (@ralphtheninja)

## Fixed
* Throw helpful error if tests are missing credentials (@ralphtheninja)

## [0.1.1] - 2018-08-02

### Fixed

* Fix issues when installing from npm (@ralphtheninja)

## 0.1.0 - 2018-08-01

:seedling: Initial release.

[Unreleased]: https://github.com/deltachat/deltachat-node/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/deltachat/deltachat-node/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/deltachat/deltachat-node/compare/v0.1.0...v0.1.1
