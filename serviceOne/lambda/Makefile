.PHONY: default build test deploy

ifeq ($(PIPELINE),1)
# Running in pipeline; settings/build dir is at the same level as project root
SETTINGS=../../../settings
BUILD=../../../build
else
# Running locally; settings dir is inside the project root and build dir is
# a subdir of this directory
SETTINGS=../../settings
BUILD=./build
endif

FUNCTION_NAME:=$(shell jq -r .lambda_function.value $(SETTINGS)/infrastructure.json)
REGION:=$(shell jq -r .region $(SETTINGS)/settings.json)

default: build test deploy

build: $(BUILD)/serviceOneLambda.zip


node_modules: package.json
	npm install


$(BUILD)/serviceOneLambda.zip: node_modules $(wildcard src/*)
ifneq ($(PIPELINE),1)
	rm -rf $(BUILD)
	mkdir -p $(BUILD)
endif

	npx webpack
	jq -s '.[0] * .[1]' $(SETTINGS)/settings.json $(SETTINGS)/infrastructure.json > ./dist/config.json
	7za a -tzip $(BUILD)/serviceOneLambda.zip ./dist/*


test:
	npm test


deploy: $(BUILD)/serviceOneLambda.zip
	AWS_PAGER="" aws lambda update-function-code --region $(REGION) --function-name $(FUNCTION_NAME) --zip-file fileb://$<

clean:
	rm -rf build node_modules
