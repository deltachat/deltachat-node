{
  "targets": [
    {
      "target_name": "deltachat",
      "sources": [
        "./src/module.c",
        "./src/eventqueue.c"
      ],
      "libraries": [
        "../deltachat-core/builddir/src/libdeltachat.a",
        "../deltachat-core/builddir/libs/libetpan/libetpan.a",
        "../deltachat-core/builddir/libs/cyrussasl/libsals2.a",
        "../deltachat-core/builddir/libs/zlib-1.2.11/libz.a",
        "../deltachat-core/builddir/libs/netpgp/libnetpgp.a",
        "../deltachat-core/builddir/libs/openssl/libcrypto.a",
        "../deltachat-core/builddir/libs/sqlite/libsqlite.a",
        "-lpthread"
      ],
      "include_dirs": [
        "deltachat-core/src",
        "<!(node -e \"require('napi-macros')\")"
      ]
    }
  ]
}
