{
    # Variables can be specified when calling node-gyp as so:
    #   node-gyp configure -- -Dvarname=value
    "variables": {
        # Whether to use a system-wide installation of deltachat-core
        # using pkg-config.  Set to either "true" or "false".
        "system_dc_core%": "false"
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
                    [ "system_dc_core == 'false'", {
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
                    }, { # system_dc_core == 'true'
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
