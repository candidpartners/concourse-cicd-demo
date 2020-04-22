SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: deploy

ENV_NAME := $(shell jq -r .environment ../settings.json)
STATE_BUCKET := $(shell jq -r .stateBucket ../settings.json)
TF_STATE_KEY := $(shell jq -r .tfStateKey ../settings.json)
REGION := $(shell jq -r .region ../settings.json)

default:
	echo "No make target"

vars:
	@echo ENV_NAME $(ENV_NAME)
	@echo STATE BUCKET $(STATE_BUCKET)
	@echo TF_STATE_KEY $(TF_STATE_KEY)
	@echo REGION $(REGION)

init:
	terraform init \
	  -backend-config "bucket=$(STATE_BUCKET)" \
	  -backend-config "key=$(TF_STATE_KEY)/$(ENV_NAME).tfstate" \
	  -backend-config "region=$(REGION)"

plan: init
	terraform plan -var-file="../settings.json"

deploy: init
	terraform apply -auto-approve -var-file="../settings.json"
	terraform output -json > output.json

destroy: init
	terraform destroy -var-file="../settings.json"
