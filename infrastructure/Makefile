SHELL=/bin/bash
.EXPORT_ALL_VARIABLES:
.ONESHELL:
.SHELLFLAGS = -uec
.PHONY: deploy

default:
	echo "No make target"

deploy:
	terraform apply -auto-approve
	terraform output -json > output.json