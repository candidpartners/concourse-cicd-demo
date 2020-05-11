.PHONY: default settings infrastructure lambda functional_tests destroy

default: settings infrastructure lambda functional_tests

# Validate that $ENV environment variable is set and that a
# corresponding file exists in the config directory
check_env:
ifndef ENV
	$(error environment variable ENV is not set)
endif
ifeq (,$(wildcard ./config/${ENV}.json))
	$(error environment file ./config/${ENV}.json not found)
endif


ifeq ($(PIPELINE),1)
  # Running in pipeline; settings dir is at the same level as project root
  SETTINGS=../../settings
else
  # Running locally; settings dir is inside the project root
  SETTINGS=./settings
endif


# Combine top-level project settings with service-level settings and
# personal environment settings
settings:
	mkdir -p settings
	jq -s '.[0] * .[1] * .[2]' \
		../project-settings.json \
		./service-settings.json \
		../config/${ENV}.json > $(SETTINGS)/settings.json

infrastructure: settings
	make -C infrastructure

lambda: infrastructure
	make -C lambda

functional_tests: lambda
	make -C functional_tests

destroy:
	make -C infrastructure destroy
