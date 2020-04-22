SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: deploy

JQ = jq
JQ_COMBINE = jq -s '.[0] * .[1]'

default:
	echo "No make target"

deploy:
	npm install
	${JQ_COMBINE} ../settings/settings.json ../settings/output.json > ./config.json
	serverless deploy
