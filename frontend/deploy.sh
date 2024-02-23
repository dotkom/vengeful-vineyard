#!/bin/sh

if [ -z "$1" ]; then
  echo "No environment specified, defaulting to staging"
  ENVIRONMENT="staging"
else
  ENVIRONMENT=$1
fi

FRONTEND_S3_BUCKET=$(doppler run --command 'echo $FRONTEND_S3_BUCKET') &&
CLOUDFRONT_DISTRIBUTION_ID=$(doppler run --command 'echo $CLOUDFRONT_DISTRIBUTION_ID') &&

doppler setup -c $ENVIRONMENT -p vengeful-vineyard &&
doppler run pnpm build &&
aws s3 rm $FRONTEND_S3_BUCKET --recursive &&
aws s3 cp dist $FRONTEND_S3_BUCKET --recursive &&
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/*'
