#!/bin/sh

if [ -z "$1" ]; then
  echo "No environment specified, defaulting to staging"
  ENVIRONMENT="staging"
else
  ENVIRONMENT=$1
fi

doppler setup -c $ENVIRONMENT -p vengeful-vineyard

doppler run pnpm build

FRONTEND_S3_BUCKET=$(doppler run --command 'echo $FRONTEND_S3_BUCKET')
aws s3 rm $FRONTEND_S3_BUCKET --recursive
aws s3 cp dist $FRONTEND_S3_BUCKET --recursive
# aws cloudfront create-invalidation --distribution-id EJKLH539HRJU2 --paths '/*'
