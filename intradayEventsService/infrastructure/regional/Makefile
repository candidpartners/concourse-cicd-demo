
ifeq ($(PIPELINE),1)
  # Running in pipeline; settings dir is at the same level as project root
  SETTINGS=../../../../settings
else
  # Running locally; settings dir is inside the project root
  SETTINGS=../../../settings
endif

SETTINGS_FILE=$(SETTINGS)/settings.json

ENV_NAME=`jq -r .environment $(SETTINGS_FILE)`
STATE_BUCKET=`jq -r .stateBucket $(SETTINGS_FILE)`
TF_STATE_KEY=`jq -r .tfStateKey $(SETTINGS_FILE)`
PRIMARY_REGION=`jq -r .primaryRegion $(SETTINGS_FILE)`
SECONDARY_REGION=`jq -r .secondaryRegion $(SETTINGS_FILE)`

# TODO: better way of handling state switch between primary/secondary, rather than removing state?

plan-primary:
	rm -rf .terraform/*.tfstate
	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/intradayEventsService/primary/${ENV_NAME}.tfstate" -backend-config "region=${PRIMARY_REGION}"
	terraform plan -var-file="$(SETTINGS_FILE)" \
		-var "region=${PRIMARY_REGION}" \
		-var "otherRegion=${SECONDARY_REGION}" \
		-var "primaryRegion=${PRIMARY_REGION}"

deploy-primary: plan-primary
	terraform apply -auto-approve -var-file="$(SETTINGS_FILE)" -var "region=${PRIMARY_REGION}" -var "otherRegion=${SECONDARY_REGION}"
	terraform output -json > primary_output.json

plan-secondary:
	rm -rf .terraform/*.tfstate
	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/intradayEventsService/secondary/${ENV_NAME}.tfstate" -backend-config "region=${PRIMARY_REGION}"
	terraform plan -var-file="$(SETTINGS_FILE)" \
		-var "region=${SECONDARY_REGION}" \
		-var "otherRegion=${PRIMARY_REGION}" \
		-var "primaryRegion=${PRIMARY_REGION}"

deploy-secondary: plan-secondary
	terraform apply -auto-approve -var-file="$(SETTINGS_FILE)" -var "region=${SECONDARY_REGION}" -var "otherRegion=${PRIMARY_REGION}"
	terraform output -json > secondary_output.json