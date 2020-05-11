#!/bin/bash
set -ve

lambda=$1
dist=$2

if [ "$PIPELINE" = "1" ]; then
    # Running in pipeline; settings/build dir is at the same level as project root
    SETTINGS=../../../settings
    BUILD=../../../build
else
    # Running locally; settings dir is inside the service root and build dir is
    # a subdir of this directory
    SETTINGS=../settings
    BUILD=./build
fi

region=$(jq -r ".region" ${SETTINGS}/settings.json)
functionName=$(jq -r ".[ \"${lambda}_lambda_function\" ].value" ${SETTINGS}/infrastructure.json)

if [ $functionName == null ]; then
  echo "Output ${lambda}_lambda_function not found in terraform output"
  exit 1
fi

mkdir -p ${BUILD}
zipPath=${BUILD}/$lambda.zip

jq -s '.[0] * .[1]' ${SETTINGS}/settings.json ${SETTINGS}/infrastructure.json > ./dist/${lambda}/config.json
7za a -tzip ${zipPath} ./dist/${lambda}/*

AWS_PAGER="" aws lambda update-function-code --region $region --function-name $functionName --zip-file fileb://$zipPath
