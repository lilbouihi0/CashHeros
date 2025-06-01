#!/bin/bash
# Backend Deployment Script

set -e

# Configuration
APP_NAME="cashheros-backend"
DEPLOY_ENV=$1
SSH_USER=$2
SERVER_IP=$3

if [ -z "$DEPLOY_ENV" ] || [ -z "$SSH_USER" ] || [ -z "$SERVER_IP" ]; then
  echo "Usage: ./deploy.sh [environment] [ssh-user] [server-ip]"
  echo "Example: ./deploy.sh production deploy-user 123.456.789.10"
  exit 1
fi

echo "Deploying $APP_NAME to $DEPLOY_ENV environment..."

# Load environment variables
if [ "$DEPLOY_ENV" = "production" ]; then
  ENV_FILE="../.env.production"
elif [ "$DEPLOY_ENV" = "staging" ]; then
  ENV_FILE="../.env.staging"
else
  echo "Invalid environment: $DEPLOY_ENV. Use 'production' or 'staging'."
  exit 1
fi

# Build the application
echo "Building application..."
npm ci
npm run build

# Create deployment package
TIMESTAMP=$(date +%Y%m%d%H%M%S)
DEPLOY_PACKAGE="deploy-$APP_NAME-$DEPLOY_ENV-$TIMESTAMP.tar.gz"

echo "Creating deployment package: $DEPLOY_PACKAGE"
tar --exclude="node_modules" --exclude=".git" --exclude="logs" -czf $DEPLOY_PACKAGE .

# Upload to server
echo "Uploading to server..."
scp $DEPLOY_PACKAGE $SSH_USER@$SERVER_IP:/tmp/

# Deploy on server
echo "Deploying on server..."
ssh $SSH_USER@$SERVER_IP << EOF
  set -e
  
  # Navigate to app directory
  cd /var/www/$APP_NAME-$DEPLOY_ENV
  
  # Backup current deployment
  if [ -d "current" ]; then
    mv current previous_\$(date +%Y%m%d%H%M%S)
  fi
  
  # Create new deployment directory
  mkdir -p current
  
  # Extract deployment package
  tar -xzf /tmp/$DEPLOY_PACKAGE -C current
  
  # Install dependencies
  cd current
  npm ci --production
  
  # Copy environment file
  cp /var/www/$APP_NAME-$DEPLOY_ENV/config/.env.$DEPLOY_ENV .env
  
  # Run database migrations
  npm run db:migrate
  
  # Restart application
  pm2 reload ecosystem.config.js --env $DEPLOY_ENV || pm2 start ecosystem.config.js --env $DEPLOY_ENV
  
  # Clean up
  rm /tmp/$DEPLOY_PACKAGE
EOF

# Clean up local deployment package
rm $DEPLOY_PACKAGE

echo "Deployment of $APP_NAME to $DEPLOY_ENV completed successfully!"