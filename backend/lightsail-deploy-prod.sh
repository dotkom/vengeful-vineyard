#!/usr/bin/env bash
aws lightsail create-container-service-deployment \
    --service-name vengeful-server-prod \
    --containers "$(aws lightsail get-container-service-deployments --service-name vengeful-server-prod --profile $1 --region eu-north-1 | jq --compact-output --raw-output '[.deployments[] | select(.state == "ACTIVE")] | max_by(.version) | .containers')" \
    --public-endpoint "$(aws lightsail get-container-service-deployments --service-name vengeful-server-prod --profile $1 --region eu-north-1 | jq --compact-output --raw-output '[.deployments[] | select(.state == "ACTIVE")] | max_by(.version) | .publicEndpoint')" \
    --profile $1 --region eu-north-1