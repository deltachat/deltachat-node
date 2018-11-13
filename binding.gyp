{
  "targets": [
    {
      "target_name": "deltachat",
      "conditions": [
        [ "OS == 'win'", {}],
        [ "OS != 'win'", {
          "libraries": [
            "../deltachat-core/builddir/src/libdeltachat.a",
            "../deltachat-core/builddir/libs/netpgp/libnetpgp.a",
            "-letpan",
            "-lsasl2",
            "-lssl",
            "-lsqlite3",
            "-lpthread"
          ]
        }]
      ],
      "sources": [
        "./src/module.c",
        "./src/eventqueue.c",
        "./src/strtable.c"
      ],
      "include_dirs": [
        "deltachat-core/src",
        "<!(node -e \"require('napi-macros')\")"
      ]
    }
  ]
}
