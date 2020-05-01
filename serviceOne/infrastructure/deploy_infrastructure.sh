#!/bin/sh

# Directories created by concourse for passing input/output between
# tasks
WORKSPACE=../../..            # Top level where source and input/output are mounted
SETTINGS=$WORKSPACE/settings  # input and output

SETTINGS_FILE=$SETTINGS/settings.json
TFOUTPUT_FILE=$SETTINGS/output.json

ENV_NAME=`jq -r .environment $SETTINGS_FILE`
STATE_BUCKET=`jq -r .stateBucket $SETTINGS_FILE`
TF_STATE_KEY=`jq -r .tfStateKey $SETTINGS_FILE`
REGION=`jq -r .region $SETTINGS_FILE`

terraform init \
          -backend-config "bucket=${STATE_BUCKET}" \
          -backend-config "key=${TF_STATE_KEY}/serviceOne/${ENV_NAME}.tfstate" \
          -backend-config "region=${REGION}"

terraform apply -auto-approve -var-file="$SETTINGS/settings.json"
terraform output -json > $SETTINGS/output.json
