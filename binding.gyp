{
    # Variables can be specified when calling node-gyp as so:
    #   node-gyp configure -- -Dvarname=value
    "variables": {
        # Whether to use a system-wide installation of deltachat-core
        # using pkg-config.  Set to either "true" or "false".
        "system_dc_core%": "false",
        # The location, relative to the project's directory, where the
        # submodule is built by ci_scripts/rebuild-core.js.
        "submod_builddir%": "deltachat-core/builddir",
    },
    "targets": [{
        "target_name": "deltachat",
        "sources": [
            "./src/module.c",
            "./src/strtable.c",
        ],
        "include_dirs": [
            "<!(node -e \"require('napi-macros')\")",
        ],
        "conditions": [
            [ "OS == 'win'", {}],
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
                            "<(submod_builddir)",
                        ],
                        "libraries": [
                            "-L../<(submod_builddir)/src",
                            "-ldeltachat",
                        ],
                        "conditions": [
                            [ "OS == 'linux'", {
                                "ldflags": [
                                    "-Wl,-rpath='$$ORIGIN/../../<(submod_builddir)/src'",
                                ],
                            }, { # OS == 'mac'
                                "libraries": [
                                    "-rpath '@loader_path/../../<(submod_builddir)/src'",
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
