#/bin/bash

DIR=${1:?specify directory of ubuntu docker dir}
export BUILDER_NAME=$(basename $DIR)
export DOCKERTAG=deltachat/desktop-$BUILDER_NAME

CMD_APPEND=""

if [[ $2 == '--debug' ]]; then
  CMD_APPEND=";tail -f /dev/null"
fi;


docker run -e BUILDER_NAME --rm -it -v "${PWD}:/build"  -w /build-context $DOCKERTAG bash -i -c "./build.sh${CMD_APPEND}"
