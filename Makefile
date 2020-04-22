SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: check_env plan_infrastructure deploy_infrastructure destroy_infrastructure deploy_lambda test

JQ = jq
JQ_COMBINE = jq -s '.[0] * .[1]'

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
	${JQ_COMBINE} project-settings.json config/$$ENV.json > settings/settings.json

default:
	echo "No make target"

plan_infrastructure: settings
	make -C infrastructure plan

deploy_infrastructure: settings
	make -C infrastructure deploy

destroy_infrastructure: settings
	make -C infrastructure destroy

deploy_lambda: settings
	make -C serverless_lambda deploy

test: settings
	make -C functional_tests test
