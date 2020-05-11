.PHONY: default build test deploy

default: test build deploy

node_modules:
	npm install

test: node_modules
	npm test

build: node_modules
	npx webpack

LAMBDAS=$(patsubst dist/%/index.js,%,$(wildcard dist/*/index.js))
deploy: build
	for lambda in $(LAMBDAS); do ./deploy-lambda.sh $$lambda; done

clean:
	git clean -fdX
