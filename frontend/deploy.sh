#!/bin/sh

doppler run pnpm build
aws s3 rm s3://dev.vinstraff.no/ --recursive
aws s3 cp dist s3://dev.vinstraff.no/ --recursive
aws cloudfront create-invalidation --distribution-id EJKLH539HRJU2 --paths '/*'
