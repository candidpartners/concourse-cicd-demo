#!/bin/bash

# Directories created by concourse for passing input/output between tasks
WORKSPACE=../../..  # Top level where source, input and output are mounted
SETTINGS=$WORKSPACE/settings   # input
TFOUTPUT=$WORKSPACE/tfoutput   # input
BUILD=$WORKSPACE/build         # output

# Install dependencies
npm install

# Run unit tests
# TBD

# Bundle source and dependencies
npx webpack

# Build config file for lambda
jq -s '.[0] * .[1]' $SETTINGS/settings.json $TFOUTPUT/output.json > ./dist/config.json

# hash the code to use as zip bundle filename
hash=($(md5sum dist/index.js))

# Build zip bundle for uploading to lambda
zip -jr $BUILD/${hash}.zip dist
