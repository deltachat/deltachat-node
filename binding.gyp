{
    # Variables can be specified when calling node-gyp as so:
    #   node-gyp configure -- -Dvarname=value
    "variables": {
        # Whether to use a system-wide installation of deltachat-core
        # using pkg-config.  Set to either "true" or "false".
        "LIBDELTACHAT_DIR%": "<!(echo $LIBDELTACHAT_DIR)"
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
		"conditions": [
			["LIBDELTACHAT_DIR != ''", {
				"libraries": [
				    "<!(echo $LIBDELTACHAT_DIR/lib/deltachat.dll.lib)",
				],
				"include_dirs": [
				    "<!(echo $LIBDELTACHAT_DIR/include)",
				],
			}]
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
                    [ "LIBDELTACHAT_DIR == ''", {
                        "include_dirs": [
                            "deltachat-core-rust/deltachat-ffi",
                        ],
                        "libraries": [
                            "../deltachat-core-rust/target/release/libdeltachat.a",
                            "-ldl",
                        ],
                        "conditions": [
                        ],
                    }, { # LIBDELTACHAT_DIR != ''
			"libraries": [
			    "<!(echo $LIBDELTACHAT_DIR/lib/libdeltachat.so)",
			],
			"include_dirs": [
			    "<!(echo $LIBDELTACHAT_DIR/include)",
			],
                    }],
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
            }],
        ],
    }],
}
