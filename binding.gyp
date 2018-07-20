{
  "targets": [
    {
      "target_name": "module",
      "sources": [
        "./src/module.c"
      ],
      "libraries": [
        "../deltachat-core/builddir/src/libdeltachat.a",
        "../deltachat-core/builddir/libs/libetpan/libetpan.a",
        "../deltachat-core/builddir/libs/netpgp/libnetpgp.a",
        "-lsqlite3",
        "-lsasl2",
        "-lpthread"
      ],
      "include_dirs": [
        "deltachat-core/src",
        "deltachat-core/libs/libetpan/include/"
      ]
    }
  ]
}
