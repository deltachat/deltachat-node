#!/bin/bash

# Build deltachat-node itself.

# On linux this uses the latest created docker container, which works
# fine on the CI build but may be the wrong continer if you are doing
# things somewhere else.  Set CONTAINER_ID to the correct container to
# avoid using the latest created container.

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

if [ $TRAVIS_OS_NAME = linux ]; then
    CONTAINER_ID=${CONTAINER_ID:-$(docker ps --latest --format='{{.ID}}')}
    EXEC="docker exec $CONTAINER_ID";
    EXEC_ROOT="docker exec -u0:0 -eHOME=/ $CONTAINER_ID";
else
    EXEC=
    EXEC_ROOT=sudo
fi

. ~/.cargo/env

$EXEC npm install --dc-system-lib=$SYS_DC_CORE;

if [ $TRAVIS_OS_NAME = linux ]; then
    readelf -d build/Release/deltachat.node
    ldd build/Release/deltachat.node
fi
if [ $TRAVIS_OS_NAME = osx ]; then
    otool -L build/Release/deltachat.node
fi
