{
  "targets": [
    {
      "target_name": "deltachat",
      "conditions": [
        [ "OS == 'win'", {}],
        [ "OS == 'linux'", {
          "libraries": [
            "-lpthread"
          ],
          "cflags": [
            "-std=gnu99",
          ],
          "conditions": [
            [ "'<!(echo $DC_SRC)x' == 'x'", {
              "libraries": [
                "<!(pkg-config --libs deltachat)",
              ],
              "cflags": [
                "<!(pkg-config --cflags deltachat)"
              ],
            }],
            [ "'<!(echo $DC_SRC)x' != 'x'", {
              "libraries": [
                "-L../<!(echo $DC_BUILD/src)",
                "-ldeltachat",
              ],
              "cflags": [
                "-I../<!(echo $DC_SRC/src)",
              ],
            }],
          ],
        }],
        [ "OS == 'mac'", {
          "libraries": [
            "../deltachat-core/builddir/src/libdeltachat.a",
            "/usr/local/Cellar/libetpan/1.9.2_1/lib/libetpan.a",
            "/usr/local/lib/rpgp/libpgp_ffi.a",
            "-framework CoreFoundation",
            "-framework CoreServices",
            "-framework Security",
            "-lsasl2",
            "-lssl",
            "-lsqlite3",
            "-lpthread"
          ]
        }]
      ],
      "sources": [
        "./src/module.c",
        "./src/strtable.c"
      ],
      "include_dirs": [
        "deltachat-core/src",
        "<!(node -e \"require('napi-macros')\")"
      ]
    }
  ]
}
