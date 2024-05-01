#!/bin/sh

if [ -z "$1" ]; then
  echo "No environment specified, defaulting to staging"
  ENVIRONMENT="stg"
else
  ENVIRONMENT=$1
fi

# Default profile
AWS_PROFILE="default"

# Parse arguments:  ---- Example, now its possible to run: npm run deploy -- --profile=dotkom
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --profile=*) AWS_PROFILE="${1#*=}" ;;
        *) ENV="$1" ;; # Assuming the first non-option argument is the environment
    esac
    shift
done


doppler setup -c $ENVIRONMENT -p vengeful-vineyard
if [ $? -ne 0 ]; then
  echo "Failed to setup Doppler"
  exit 1
fi

FRONTEND_S3_BUCKET=$(doppler run --command 'echo $FRONTEND_S3_BUCKET')
CLOUDFRONT_DISTRIBUTION_ID=$(doppler run --command 'echo $CLOUDFRONT_DISTRIBUTION_ID')

doppler run pnpm build &&
aws s3 rm $FRONTEND_S3_BUCKET --recursive --profile $AWS_PROFILE &&
aws s3 cp dist $FRONTEND_S3_BUCKET --recursive --profile $AWS_PROFILE &&
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --profile $AWS_PROFILE --paths  '/*'
