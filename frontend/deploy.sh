#!/bin/sh

doppler run pnpm build
aws s3 rm s3://dev.redwine.online.ntnu.no/ --recursive
aws s3 cp dist s3://dev.redwine.online.ntnu.no/ --recursive
aws cloudfront create-invalidation --distribution-id E2K89BLF8EKZYA --paths '/*'
