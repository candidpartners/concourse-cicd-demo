
# ifeq ($(PIPELINE),1)
#   # Running in pipeline; settings dir is at the same level as project root
#   SETTINGS=../../../settings
# else
#   # Running locally; settings dir is inside the project root
#   SETTINGS=../../settings
# endif

# SETTINGS_FILE=$(SETTINGS)/settings.json
# TFOUTPUT_FILE=$(SETTINGS)/infrastructure.json

# ENV_NAME=`jq -r .environment $(SETTINGS_FILE)`
# STATE_BUCKET=`jq -r .stateBucket $(SETTINGS_FILE)`
# TF_STATE_KEY=`jq -r .tfStateKey $(SETTINGS_FILE)`
# PRIMARY_REGION=`jq -r .region $(SETTINGS_FILE)`
# SECONDARY_REGION=`jq -r .drRegion $(SETTINGS_FILE)`

deploy: deploy-global deploy-primary deploy-secondary

deploy-global:
	make -C global deploy

deploy-primary:
	make -C regional deploy-primary

deploy-secondary:
	make -C regional deploy-secondary
