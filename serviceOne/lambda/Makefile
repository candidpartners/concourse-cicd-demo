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

default: build test deploy

build:
	# Install dependencies
	npm install

	# Bundle source and dependencies
	npx webpack

	# Build config file for lambda
	jq -s '.[0] * .[1]' $(SETTINGS)/settings.json $(SETTINGS)/infrastructure.json > ./dist/config.json

	# hash the code to use as zip bundle filename
	hash=($(md5sum dist/index.js))

	# Build zip bundle for uploading to lambda
	zip -jr $BUILD/${hash}.zip dist
