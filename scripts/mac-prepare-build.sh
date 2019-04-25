#!/usr/bin/env bash

cd build/Release
# otool -L deltachat.node

cp /usr/lib/libsasl2.2.dylib .
install_name_tool -change /usr/lib/libsasl2.2.dylib "@loader_path/libsasl2.2.dylib" deltachat.node

cp /usr/lib/libssl.0.9.8.dylib .
cp /usr/lib/libcrypto.0.9.8.dylib .
cp /usr/lib/libz.1.dylib .
install_name_tool -change /usr/lib/libssl.0.9.8.dylib "@loader_path/libssl.0.9.8.dylib" deltachat.node
install_name_tool -change /usr/lib/libcrypto.0.9.8.dylib "@loader_path/libcrypto.0.9.8.dylib" libssl.0.9.8.dylib
install_name_tool -change /usr/lib/libz.1.dylib "@loader_path/libz.1.dylib" libcrypto.0.9.8.dylib

cp /usr/lib/libsqlite3.dylib .
install_name_tool -change /usr/lib/libsqlite3.dylib "@loader_path/libsqlite3.dylib" deltachat.node
