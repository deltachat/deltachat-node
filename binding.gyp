{
    # Variables can be specified when calling node-gyp as so:
    #   node-gyp configure -- -Dvarname=value
    "variables": {
        # Whether to use a system-wide installation of deltachat-core
        # using pkg-config.  Set to either "true" or "false".
        "system_dc_core%": "false",
        # The location, relative to the project's directory, where the
        # submodule is built by ci_scripts/rebuild-core.js.
        "deltachat_core%": "deltachat-core",
    },
    "targets": [{
        "target_name": "deltachat",
        "sources": [
            "./src/module.c",
            "./src/strtable.c"
        ],
        "include_dirs": [
            "<!(node -e \"require('napi-macros')\")",
            "<(deltachat_core)/src",
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
                    [ "system_dc_core == 'false'", {
                        "libraries": [
                            "-L../<(deltachat_core)/builddir/src",
                            "-ldeltachat",
                        ],
                        "conditions": [
                            [ "OS == 'linux'", {
                                "ldflags": [
                                    "-Wl,-rpath='$$ORIGIN/../../<(deltachat_core)/builddir/src'",
                                ],
                            }, { # OS == 'mac'
                                "ldfalgs": [
                                    "-Wl,-rpath='@loader_path/../../<(deltachat_core)/builddir/src'",
                                ],
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
