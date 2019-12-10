#!/bin/bash

# Test deltachat-node.

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

npm test;

#if [ $TRAVIS_PULL_REQUEST = false ]; then
#    npm run test-integration;
#fi
