EUID := $(shell id -u)


build:
	docker build -t deltachat/deltachat-node-builder .

push:
	docker push deltachat/deltachat-node-builder:latest

build-module:
	docker run --rm -it -u $(EUID):$(EUID) -v $(CURDIR)/..:/bindings -w /bindings deltachat/deltachat-node-builder /bindings/builder/build-module.sh


.PHONY: build push build-module
