#!/bin/bash

# This script prepares the CI host by installing external dependencies
# for the deltachat-node bindings.

set -ex


# Some default variables, these are normally provided by the CI
# runtime.
DOCKER_IMAGE=${DOCKER_IMAGE:-deltachat/travis-dc-node-base:latest}
DC_CORE_VERSION=${DC_CORE_VERSION:-master}


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
SYS_DC_CORE=${SYS_DC_CORE:-true}


case $TRAVIS_OS_NAME in
    linux)
        docker pull $DOCKER_IMAGE
        CONTAINER_ID=$(docker run -d -v/etc/passwd:/etc/passwd:ro -u$(id -u):$(id -g) -v$(pwd):/work -w/work -eHOME=/work $DOCKER_IMAGE)
        EXEC="docker exec $CONTAINER_ID";
        EXEC_ROOT="docker exec -u0:0 -eHOME=/ $CONTAINER_ID";
        if [ "$SYS_DC_CORE" = "true" ]; then
            $EXEC git clone --branch=$DC_CORE_VERSION https://github.com/deltachat/deltachat-core deltachat-core-src
            $EXEC meson deltachat-core-build deltachat-core-src
            $EXEC ninja -v -C deltachat-core-build
            $EXEC_ROOT ninja -v -C deltachat-core-build install
            $EXEC_ROOT ldconfig -v
            $EXEC rm -rf deltachat-core-build deltachat-core-src
        fi
        ;;
    osx)
        sudo pip3 install meson
        ./scripts/build_sasl.sh --with-openssl=/usr/local/opt/openssl
        export PKG_CONFIG_PATH=/usr/local/opt/openssl/lib/pkgconfig
        if [ "$SYS_DC_CORE" = "true" ]; then
            git clone --branch=$DC_CORE_VERSION https://github.com/deltachat/deltachat-core deltachat-core-src
            meson deltachat-core-build deltachat-core-src
            ninja -v -C deltachat-core-build
            sudo ninja -v -C deltachat-core-build install
        fi
        rm -rf deltachat-core-build deltachat-core-src cyrus-sasl-*
        ;;
    *)
        echo "Unknown OS: $TRAVIS_OS_NAME" >&2
        exit 1
esac
