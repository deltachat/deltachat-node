#!/bin/bash

# Build deltachat-node itself.

set -ex

# To facilitate running locally, derive some Travis environment
# variables.
if [ -z "$TRAVIS_OS_NAME" ]; then
    case $(uname) in
        Darwin)
            TRAVIS_OS_NAME=osx
            ;;
        Linux)
            TRAVIS_OS_NAME=linux
            ;;
        *)
            echo "TRAVIS_OS_NAME unset and uname=$(uname) is unknown" >&2
            exit 1
    esac
fi

SYS_DC_CORE=${SYS_DC_CORE:-false}

# Load cargo
. ~/.cargo/env

npm install --dc-system-lib=$SYS_DC_CORE;

if [ $TRAVIS_OS_NAME = linux ]; then
    readelf -d build/Release/deltachat.node
    ldd build/Release/deltachat.node
fi
if [ $TRAVIS_OS_NAME = osx ]; then
    otool -L build/Release/deltachat.node
fi
