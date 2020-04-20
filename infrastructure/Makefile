SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: deploy

ENV_NAME := $(shell jq -r .env ../settings.json)

default:
	echo "No make target"

init:
	terraform init

plan: init
	terraform plan -var-file="../settings.json"

deploy: init
	terraform apply -auto-approve -var-file="../settings.json"
	terraform output -json > output.json

destroy: init
	terraform destroy -var-file="../settings.json"
