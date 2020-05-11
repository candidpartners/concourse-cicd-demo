.PHONY: default build test deploy

default: build test deploy

node_modules: package.json
	npm install
	touch $@

build: node_modules
	npx webpack

deploy: build deploy-primary deploy-secondary

LAMBDAS = $(patsubst dist/%/index.js,%,$(wildcard dist/*/index.js))
deploy-primary:
	for lambda in ${LAMBDAS}; do ./deploy-lambda.sh $$lambda primary; done

deploy-secondary:
	for lambda in ${LAMBDAS}; do ./deploy-lambda.sh $$lambda secondary; done

test:
	# TODO npm test

clean:
	git clean -fdX
