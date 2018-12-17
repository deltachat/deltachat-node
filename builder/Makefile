EUID := $(shell id -u)


image:
	docker build -t deltachat/node-builder .

push:
	docker push deltachat/node-builder:latest

bindings:
	docker run --rm -it -u $(EUID):$(EUID) -v $(CURDIR)/..:/bindings -w /bindings deltachat/node-builder /bindings/builder/build-module.sh

run:
	docker run --rm -it -u $(EUID):$(EUID) -v $(CURDIR)/..:/bindings -w /bindings deltachat/node-builder /bin/bash


.PHONY: image push bindings run
