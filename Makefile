.PHONY: check_env settings serviceOne serviceTwo

JQ = jq
JQ_COMBINE = jq -s '.[0] * .[1]'

ifeq ($(PIPELINE),1)
  # Running in pipeline; settings dir is at the same level as project root
  SETTINGS=../settings
else
  # Running locally; settings dir is inside the project root
  SETTINGS=./settings
endif


# Validate that $ENV environment variable is set and that a
# corresponding file exists in the config directory
check_env:
ifndef ENV
	$(error environment variable ENV is not set)
endif
ifeq (,$(wildcard ./config/${ENV}.json))
	$(error environment file ./config/${ENV}.json not found)
endif



settings: check_env
	mkdir -p settings
	${JQ_COMBINE} project-settings.json config/$$ENV.json > $(SETTINGS)/settings.json
	cat $(SETTINGS)/settings.json

serviceOne: settings
	make -C serviceOne

serviceTwo: settings
	make -C serviceTwo
