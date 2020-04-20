SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: deploy_infrastructure deploy_function test

default:
	echo "No make target"

deploy_infrastructure:
	make -C infrastructure deploy

deploy_lambda:
	make -C serverless_lambda deploy

test:
	make -C functional_tests test