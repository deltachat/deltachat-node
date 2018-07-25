# deltachat-node

> node.js bindings for [`deltachat-core`][deltachat-core]

[![Build Status](https://travis-ci.org/deltachat/deltachat-node.svg?branch=master)](https://travis-ci.org/deltachat/deltachat-node)
![Node version](https://img.shields.io/node/v/deltachat-node.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**This is a work in progress**

`deltachat-node` primarily aims to offer two things:

* A low level c binding api around  [`deltachat-core`][deltachat-core]
* A higher level JavaScript api with syntactic sugar

**Note** Because `deltachat-core` uses a particular threading model, the c bindings are based on [`N-API`](https://nodejs.org/dist/latest-v10.x/docs/api/n-api.html) with experimental features enabled. Currently, this means you must use node.js with a minimal version of `v10.6.0`.

## License

GPLv3

[deltachat-core]: https://github.com/deltachat/deltachat-core
