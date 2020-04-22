#!/bin/sh

# Directories created for passing input/output between tasks
SETTINGS=../../../settings
TFOUTPUT=../../../tfoutput

ENV_NAME=`jq -r .environment $SETTINGS/settings.json`
STATE_BUCKET=`jq -r .stateBucket $SETTINGS/settings.json`
TF_STATE_KEY=`jq -r .tfStateKey $SETTINGS/settings.json`
REGION=`jq -r .region $SETTINGS/settings.json`

terraform init \
          -backend-config "bucket=${STATE_BUCKET}" \
          -backend-config "key=${TF_STATE_KEY}/serviceTwo/${ENV_NAME}.tfstate" \
          -backend-config "region=${REGION}"

terraform apply -auto-approve -var-file="$SETTINGS/settings.json"
terraform output -json > $TFOUTPUT/output.json
