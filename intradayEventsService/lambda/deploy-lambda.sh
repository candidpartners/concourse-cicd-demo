#!/bin/bash
set -ve

lambda=$1
primaryOrSecondary=$2

# move to the scripts directory
pushd $(dirname $0)

region=$(jq -r ".${primaryOrSecondary}Region" ../../settings/settings.json)

functionName=$(jq -r ".[ \"${lambda}_lambda_function\" ].value" ../infrastructure/regional/${primaryOrSecondary}_output.json)

if [ $functionName == null ]; then
  echo "Output ${lambda}_lambda_function not found in terraform output"
  exit 1
fi

# TODO: use code bucket
# get the bucket name and region from the infrastructure output
# bucket=$(jq -r .code_bucket.value ../infrastructure/output.json)

# TODO: assume deploy role and export AWS_* temporary credentials
# export AWS_DEFAULT_REGION=$region

# hash and zip the lambda code
pushd ../lambda/dist/$lambda
zipPath=$(pwd)/../$lambda.zip

# jsonnet ../../$config > config.json
jq -s '.[0] * { global: .[1] } * { primary: .[2] } * { secondary: .[3] }' \
  ../../../../settings/settings.json \
  ../../../infrastructure/global/output.json \
  ../../../infrastructure/regional/primary_output.json \
  ../../../infrastructure/regional/secondary_output.json > config.json
hash=$(md5 -q index.js)
zip -qr $zipPath .
popd

# upload the zip to a path based on the hash
# key=$lambda/$hash.zip
# aws s3 cp $zipPath s3://$bucket/$key

echo "functionName=[${functionName}]"
echo "zipPath=[${zipPath}]"
# echo "bucket=[${bucket}]"
# echo "key=[${key}]"

# change the lambda function to point to the new code file
# aws lambda update-function-code --region $region --function-name $functionName --s3-bucket $bucket --s3-key $key
aws lambda update-function-code --region $region --function-name $functionName --zip-file fileb://$zipPath

popd
