#!/usr/bin/env bash
aws lightsail create-container-service-deployment\
	--service-name vengeful-server-dev\
	--containers "$(aws lightsail get-container-service-deployments --service-name vengeful-server-dev | jq --compact-output --raw-output '[.deployments[] | select(.state == "ACTIVE")] | max_by(.version) | .containers')"\
	--public-endpoint "$(aws lightsail get-container-service-deployments --service-name vengeful-server-dev | jq --compact-output --raw-output '[.deployments[] | select(.state == "ACTIVE")] | max_by(.version) | .publicEndpoint')"
