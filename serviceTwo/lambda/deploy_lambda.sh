#!/bin/sh

SETTINGS=../../../settings
TFOUTPUT=../../../tfoutput

npm install
jq -s '.[0] * .[1]' $SETTINGS/settings.json $TFOUTPUT/output.json > ./config.json
serverless deploy
