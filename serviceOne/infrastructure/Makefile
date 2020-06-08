.PHONY: deploy

ifeq ($(PIPELINE),1)
  # Running in pipeline; settings dir is at the same level as project root
  SETTINGS=../../../settings
else
  # Running locally; settings dir is inside the project root
  SETTINGS=../../settings
endif

SETTINGS_FILE=$(SETTINGS)/settings.json
TF_DIR=./.terraform

ENV_NAME=`jq -r .environment $(SETTINGS_FILE)`
STATE_BUCKET=`jq -r .stateBucket $(SETTINGS_FILE)`
TF_STATE_KEY=`jq -r .tfStateKey $(SETTINGS_FILE)`
REGION=`jq -r .region $(SETTINGS_FILE)`

deploy:
	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/serviceOne/${ENV_NAME}.tfstate" -backend-config "region=${REGION}"
	terraform plan -var-file="$(SETTINGS_FILE)" -out=$(TF_DIR)/plan.out
	terraform show -json $(TF_DIR)/plan.out > $(TF_DIR)/plan.json
	terraform graph > $(TF_DIR)/graph.dot
	snitch2 static -c ../../snitch.yml -p $(TF_DIR)/plan.json -g $(TF_DIR)/graph.dot
	terraform apply -auto-approve -var-file="$(SETTINGS_FILE)"
	terraform output -json > ./output.json

# deploy:
# 	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/serviceOne/${ENV_NAME}.tfstate" -backend-config "region=${REGION}"
# 	terraform plan -var-file="$(SETTINGS_FILE)"
# 	terraform apply -auto-approve -var-file="$(SETTINGS_FILE)"
# 	terraform output -json > $(TFOUTPUT_FILE)
# 	cat $(TFOUTPUT_FILE)

destroy:
	terraform init -backend-config "bucket=${STATE_BUCKET}" -backend-config "key=${TF_STATE_KEY}/serviceOne/${ENV_NAME}.tfstate" -backend-config "region=${REGION}"
	terraform destroy -var-file="$(SETTINGS_FILE)"
