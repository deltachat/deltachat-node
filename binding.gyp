{
    # Variables can be specified when calling node-gyp as so:
    #   node-gyp configure -- -Dvarname=value
    "variables": {
        # Whether to use a system-wide installation of libdeltachat using
        # pkg-config.  Set $SYSTEM_DC_CORE to something non-empty to do so.
        "system_dc_core%": "<!(echo $SYSTEM_DC_CORE)"
    },
    "targets": [{
        "target_name": "deltachat",
        "sources": [
            "./src/module.c",
        ],
        "include_dirs": [
            "<!(node -e \"require('napi-macros')\")",
        ],
        "conditions": [
            [ "OS == 'win'", {
                "include_dirs": [
                    "deltachat-core-rust/deltachat-ffi",
                ],
                "libraries": [
                    "../deltachat-core-rust/target/release/deltachat.dll.lib"
                ],
            }],
            [ "OS == 'linux' or OS == 'mac'", {
                "libraries": [
                    "-lpthread",
                ],
                "cflags": [
                    "-std=gnu99",
                ],
                "conditions": [
                    [ "system_dc_core == ''", {
                        "include_dirs": [
                            "deltachat-core-rust/deltachat-ffi",
                        ],
                        "libraries": [
                            "../deltachat-core-rust/target/release/libdeltachat.a",
                            "-ldl",
                        ],
                        "conditions": [
                            [ "OS == 'mac'", {
                                "libraries": [
                                    "-framework CoreFoundation",
                                    "-framework CoreServices",
                                    "-framework Security",
                                    "-lresolv",
                                ],
                            }, { # OS == 'linux'
                                 "libraries": [
                                     "-lm",
                                     "-lrt",
                                 ]
                            }],
                        ],
                    }, { # "system_dc_core != ''"
                        "cflags": [
                            "<!(pkg-config --cflags deltachat)"
                        ],
                        "libraries": [
                            "<!(pkg-config --libs deltachat)",
                        ],
                    }],
                ],
            }],
        ],
    }],
}
