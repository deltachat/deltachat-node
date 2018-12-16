#!/bin/bash

set +ex

cd /bindings

# Prepare
npm run reset
npm run submodule

# Compile
npm install --verbose

# Test
# npm run test
