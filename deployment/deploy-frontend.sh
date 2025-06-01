#!/bin/bash
# Frontend Deployment Script

set -e

# Configuration
APP_NAME="cashheros-frontend"
DEPLOY_ENV=$1
S3_BUCKET=$2
CLOUDFRONT_DISTRIBUTION_ID=$3

if [ -z "$DEPLOY_ENV" ] || [ -z "$S3_BUCKET" ]; then
  echo "Usage: ./deploy-frontend.sh [environment] [s3-bucket] [cloudfront-distribution-id]"
  echo "Example: ./deploy-frontend.sh production cashheros-website-prod cf12345678"
  exit 1
fi

echo "Deploying $APP_NAME to $DEPLOY_ENV environment..."

# Load environment variables
if [ "$DEPLOY_ENV" = "production" ]; then
  ENV_FILE=".env.production"
elif [ "$DEPLOY_ENV" = "staging" ]; then
  ENV_FILE=".env.staging"
else
  echo "Invalid environment: $DEPLOY_ENV. Use 'production' or 'staging'."
  exit 1
fi

# Copy environment file
cp $ENV_FILE .env

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Upload to S3
echo "Uploading to S3 bucket: $S3_BUCKET..."
aws s3 sync build/ s3://$S3_BUCKET/ --delete

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
fi

echo "Deployment of $APP_NAME to $DEPLOY_ENV completed successfully!"