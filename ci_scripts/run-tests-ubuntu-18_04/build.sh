#!/bin/bash

if [ -z ${BUILDER_NAME+x} ]; then
  echo "Error: Environment variable BUILDER_NAME is unset. It should be set to
  the first child folder name in \`/builder\` and is normally set in the Dockerfile
  for this builder. Examples for values are \`ubuntu-16_04\` or \`ubunut-18_10-rpgp\`.";
  exit 0
fi

cd /build

rm -rf node_modules
rm -rf build

npm install

npm run rebuild-all

npm run test
