{
    # Variables can be specified when calling node-gyp as so:
    #   node-gyp configure -- -Dvarname=value
    "variables": {
        # Whether to use a system-wide installation of deltachat-core
        # using pkg-config.  Set to either "true" or "false".
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
                    "deltachat-core-rust",
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

		"libraries": [
		    "/opt/libdeltachat/lib/libdeltachat.so",
		    "-lm",
		    "-lrt",
		],
		"include_dirs": [
		    "/opt/libdeltachat/include",
                ],
            }],
        ],
    }],
}
