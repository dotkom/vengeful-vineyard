#!/bin/sh

doppler run pnpm build
aws s3 rm s3://dev.redwine-static.online.ntnu.no/ --recursive
aws s3 cp dist s3://dev.redwine-static.online.ntnu.no/ --recursive
aws cloudfront create-invalidation --distribution-id EFTDBFRP1Q91I --paths '/*'