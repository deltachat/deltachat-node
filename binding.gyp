{
  "targets": [
    {
      "target_name": "deltachat",
      "conditions": [
        [ "OS == 'win'", {}],
        [ "OS == 'linux' or OS == 'mac'", {
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
      ],
      "sources": [
        "./src/module.c",
        "./src/strtable.c"
      ],
      "include_dirs": [
        "<!(node -e \"require('napi-macros')\")"
      ]
    }
  ]
}
