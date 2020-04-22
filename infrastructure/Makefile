SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: deploy


SETTINGS_FILE := ../settings/settings.json
ENV_NAME := $(shell jq -r .environment $(SETTINGS_FILE))
STATE_BUCKET := $(shell jq -r .stateBucket $(SETTINGS_FILE))
TF_STATE_KEY := $(shell jq -r .tfStateKey $(SETTINGS_FILE))
REGION := $(shell jq -r .region $(SETTINGS_FILE))

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
	terraform plan -var-file="$(SETTINGS_FILE)"

deploy: init
	terraform apply -auto-approve -var-file="$(SETTINGS_FILE)"
	terraform output -json > ../settings/output.json

destroy: init
	terraform destroy -var-file="$(SETTINGS_FILE)"
