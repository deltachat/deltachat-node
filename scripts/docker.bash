#!/bin/bash

# Run `./scripts/docker.bash` when standing at the project root.

exec docker run -u 1000:1000 -it --rm -v $(pwd):/deltachat-node -w /deltachat-node deltachat/debian-stretch-node-11:latest bash
