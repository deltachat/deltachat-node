# deltachat-node

> node.js bindings for [`deltachat-core-rust`][deltachat-core-rust]

[![Appveyor build status][appveyor-shield]][appveyor]
[![Build Status](https://travis-ci.org/deltachat/deltachat-node.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-node)
[![npm](https://img.shields.io/npm/v/deltachat-node.svg)](https://www.npmjs.com/package/deltachat-node)
![Node version](https://img.shields.io/node/v/deltachat-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/deltachat/deltachat-node/badge.svg)](https://coveralls.io/github/deltachat/deltachat-node)
[![dependencies](https://david-dm.org/deltachat/deltachat-node.svg)](https://david-dm.org/deltachat/deltachat-node)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**If you are upgrading:** please see [`UPGRADING.md`](UPGRADING.md).

`deltachat-node` primarily aims to offer two things:

- A high level JavaScript api with syntactic sugar
- A low level c binding api around  [`deltachat-core-rust`][deltachat-core-rust]

## Table of Contents

<details><summary>Click to expand</summary>

- [Install](#install)
- [Dependencies](#dependencies)
- [Build from source](#build-from-source)
- [Usage](#usage)
- [Developing](#developing)
- [License](#license)

</details>

## Install

By default the installation will build try to use the bundled prebuilds in the
npm package. If this fails it falls back to compile the bundled 
`deltachat-core-rust` from the submodule using `scripts/rebuild-core.js`. 
To install from npm use:

```
npm install deltchat-node
```

## Dependencies

Node > v10.0.0
rustup (optional if you can't use the prebuilds)

## Build from source

If you want to build from source, make sure that you have `rustup` installed.
You can either use `npm install deltachat-node --build-from-source` to force
building from source or clone this repository and follow this steps:

1. `git clone https://github.com/deltachat/deltachat-node.git`
2. `cd deltachat-node`
3. `npm run submodule`
4. `npm run build`

## Usage

```js
const DeltaChat = require('deltachat-node').default
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

dc.open('./account-folder')
dc.startIO()

const contactId = dc.createContact('Test', contact)
const chatId = dc.createChatByContactId(contactId)
dc.sendMessage(chatId, 'Hi!')

dc.stopIO()
dc.close(() => {
  console.log('Bye.')
})
```

### Generating Docs

We are curently migrating to automaticaly generated documentation.
You can find the old documentation at [old_docs](./old_docs).

to generate the documentation, run:

```
npx typedoc
```

The resulting documentation can be found in the `docs/` folder.
An online version can be found under [js.delta.chat](https://js.delta.chat).

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
- `npm run build` Rebuilds all code.
- `npm run build:core` Rebuilds code in `deltachat-core-rust`.
- `npm run build:bindings` Rebuilds the bindings and links with `deltachat-core-rust`.
- `ǹpm run clean` Removes all built code
- `npm run prebuildify` Builds prebuilt binary to `prebuilds/$PLATFORM-$ARCH`. Copies `deltachat.dll` from `deltachat-core-rust` for windows.
- `npm run download-prebuilds` Downloads all prebuilt binaries from github before `npm publish`.
- `npm run submodule` Updates the `deltachat-core-rust` submodule.
- `npm test` Runs `standard` and then the tests in `test/index.js`.
- `npm run test-integration` Runs the integration tests.
- `npm run hallmark` Runs `hallmark` on all markdown files.

### Releases

The following steps are needed to make a release:

1. Update `CHANGELOG.md` (and run `npm run hallmark` to adjust markdown)

- Add release changelog in top section
- Also adjust links to github prepare links at the end of the file

2. Bump version number in package.json
3. Commit the changed files, commit message should be similiar to `Prepare for v1.0.0-foo.number`
4. Tag the release with `git tag -a v1.0.0-foo.number`
5. Push to github with `git push origin master --tags`
6. Wait until Travis and AppVeyor have finished and uploaded prebuilt binaries to GitHub
7. `npm run download-prebuilds` to download prebuilt binaries from GitHub.

- In case this fails, you can also manually download the prebuilts from github and extract them. It's only important that it extracts to the target folder.

8. `npm run build:bindings:ts` to build the typescript.
9. `npm publish` publishes it to npm. You probably need write rights to npm.

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
