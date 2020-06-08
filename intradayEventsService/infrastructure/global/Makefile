
ifeq ($(PIPELINE),1)
  # Running in pipeline; settings dir is at the same level as project root
  SETTINGS=../../../../settings
else
  # Running locally; settings dir is inside the project root
  SETTINGS=../../../settings
endif

SETTINGS_FILE=$(SETTINGS)/settings.json
TF_DIR=./.terraform

ENV_NAME=`jq -r .environment $(SETTINGS_FILE)`
STATE_BUCKET=`jq -r .stateBucket $(SETTINGS_FILE)`
TF_STATE_KEY=`jq -r .tfStateKey $(SETTINGS_FILE)`
PRIMARY_REGION=`jq -r .primaryRegion $(SETTINGS_FILE)`
SECONDARY_REGION=`jq -r .secondaryRegion $(SETTINGS_FILE)`

deploy:
	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/intradayEventsService/global/${ENV_NAME}.tfstate" -backend-config "region=${PRIMARY_REGION}"
	terraform plan -var-file="$(SETTINGS_FILE)"
	terraform apply -no-color -auto-approve -var-file="$(SETTINGS_FILE)"
	terraform output -json > ./output.json

destroy:
	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/intradayEventsService/global/${ENV_NAME}.tfstate" -backend-config "region=${PRIMARY_REGION}"
	terraform destroy -auto-approve -var-file="$(SETTINGS_FILE)"
