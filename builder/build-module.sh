#!/bin/bash

set +ex

cd /bindings

# Prepare
npm run reset
npm run submodule

# Compile
npm install --verbose

# Make prebuilt binaries
npm run prebuild

# Test
# npm run test
