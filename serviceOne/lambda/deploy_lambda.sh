#!/bin/bash

# Directories created by concourse for passing input/output between tasks
WORKSPACE=.                    # Top level where source, input and output are mounted
SETTINGS=$WORKSPACE/settings   # input
BUILD=$WORKSPACE/build         # input

TFOUTPUT=$SETTINGS/output.json
FUNCTION_NAME=`jq -r .lambda_function.value $TFOUTPUT`

aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file $BUILD/*.zip
