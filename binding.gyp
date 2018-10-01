{
  "targets": [
    {
      "target_name": "deltachat",
      "conditions": [
        [ "OS == 'win'", {}],
        [ "OS != 'win'", {
          "libraries": [
            "../deltachat-core/builddir/src/libdeltachat.a",
            "../deltachat-core/builddir/libs/libetpan/libetpan.a",
            "../deltachat-core/builddir/libs/cyrussasl/libsals2.a",
            "../deltachat-core/builddir/libs/netpgp/libnetpgp.a",
            "../deltachat-core/builddir/libs/sqlite/libsqlite.a",
            "-lpthread"
          ]
        }]
      ],
      "sources": [
        "./src/module.c",
        "./src/eventqueue.c"
      ],
      "include_dirs": [
        "deltachat-core/src",
        "<!(node -e \"require('napi-macros')\")"
      ]
    }
  ]
}
