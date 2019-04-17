{
    "variables": {
        "dc_core_builddir%": "notset",
    },
    "targets": [{
        "target_name": "deltachat",
        "sources": [
            "./src/module.c",
            "./src/eventqueue.c",
            "./src/strtable.c"
        ],
        "include_dirs": [
            "<!(node -e \"require('napi-macros')\")"
        ],
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
                    [ "dc_core_builddir == 'notset'", {
                        "cflags": [
                            "<!(pkg-config --cflags deltachat)"
                        ],
                        "libraries": [
                            "<!(pkg-config --libs deltachat)",
                        ],
                    }, {
                        "cflags": [
                            "-I../<(dc_core_builddir)",
                        ],
                        "libraries": [
                            "-L../<(dc_core_builddir)/src",
                            "-ldeltachat",
                        ],
                        "ldflags": [
                            "-Wl,-rpath=<(dc_core_builddir)/src",
                        ],
                    }],
                ],
            }],
        ],
    }],
}
