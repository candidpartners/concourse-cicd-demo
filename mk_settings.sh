#!/bin/sh
mkdir -p settings
jq -s '.[0] * .[1]' project-settings.json config/$ENV.json > settings/settings.json
