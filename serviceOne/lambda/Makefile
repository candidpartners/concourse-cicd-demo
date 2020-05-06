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

$(BUILD)/serviceOneLambda.zip:
# Install dependencies and package lambda code
	npm install
	npx webpack

# Add settings and infrastructure to config
	jq -s '.[0] * .[1]' $(SETTINGS)/settings.json $(SETTINGS)/infrastructure.json > ./dist/config.json

# Reset build dir if not running in pipeline
ifneq ($(PIPELINE),1)
	rm -rf $(BUILD)
	mkdir -p $(BUILD)
endif

# Zip up code
	zip -jr $(BUILD)/serviceOneLambda.zip dist

test:
	npm test

deploy: $(BUILD)/serviceOneLambda.zip
	AWS_PAGER="" aws lambda update-function-code --region $(REGION) --function-name $(FUNCTION_NAME) --zip-file fileb://$<
