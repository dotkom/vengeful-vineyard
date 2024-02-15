#!/usr/bin/env bash


echo "Waiting for deployment to complete..."
while [ 1 ] ; do
  state=$(aws lightsail get-container-service-deployments --service-name vengeful-server-dev | jq '.deployments | max_by(.version) | .state')
  echo "Deployment state: $state"
  if [ $state = '"ACTIVE"' ]; then
    break
  fi
  sleep 1
done
