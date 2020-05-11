.PHONY: init plan deploy destroy

ifeq ($(PIPELINE),1)
  # Running in pipeline; settings dir is at the same level as project root
  SETTINGS=../../../settings
else
  # Running locally; settings dir is inside the project root
  SETTINGS=../settings
endif

SETTINGS_FILE=$(SETTINGS)/settings.json
TFOUTPUT_FILE=$(SETTINGS)/infrastructure.json

SERVICE_NAME=`jq -r .serviceName $(SETTINGS_FILE)`
ENV_NAME=`jq -r .environment $(SETTINGS_FILE)`
STATE_BUCKET=`jq -r .stateBucket $(SETTINGS_FILE)`
TF_STATE_KEY=`jq -r .tfStateKey $(SETTINGS_FILE)`
REGION=`jq -r .region $(SETTINGS_FILE)`

default: init plan deploy

init:
	terraform init \
		-backend-config "bucket=${STATE_BUCKET}" \
		-backend-config "key=${TF_STATE_KEY}/${SERVICE_NAME}/${ENV_NAME}.tfstate" \
		-backend-config "region=${REGION}"

plan: init
	terraform plan -var-file="$(SETTINGS_FILE)"

deploy: plan
	terraform apply -auto-approve -var-file="$(SETTINGS_FILE)"
	terraform output -json > $(TFOUTPUT_FILE)

destroy: init
	terraform destroy -var-file="$(SETTINGS_FILE)"
