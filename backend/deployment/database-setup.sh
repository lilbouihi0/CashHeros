#!/bin/bash
# Database Deployment and Migration Script

set -e

# Configuration
DEPLOY_ENV=$1
MONGO_URI=$2
BACKUP_PATH=$3

if [ -z "$DEPLOY_ENV" ] || [ -z "$MONGO_URI" ]; then
  echo "Usage: ./database-setup.sh [environment] [mongo-uri] [backup-path]"
  echo "Example: ./database-setup.sh production 'mongodb://user:pass@host:port/db' /path/to/backup"
  exit 1
fi

echo "Setting up database for $DEPLOY_ENV environment..."

# Create database backup if in production and backup path is provided
if [ "$DEPLOY_ENV" = "production" ] && [ ! -z "$BACKUP_PATH" ]; then
  echo "Creating database backup before migration..."
  BACKUP_FILE="$BACKUP_PATH/mongodb_backup_$(date +%Y%m%d%H%M%S).gz"
  
  # Extract database name from URI
  DB_NAME=$(echo $MONGO_URI | sed -n 's/.*\/\([^?]*\).*/\1/p')
  
  # Create backup
  mongodump --uri="$MONGO_URI" --gzip --archive="$BACKUP_FILE"
  
  echo "Backup created at $BACKUP_FILE"
fi

# Run database migrations
echo "Running database migrations..."
cd ..
NODE_ENV=$DEPLOY_ENV MONGO_URI=$MONGO_URI npm run db:migrate

# Seed initial data if needed
if [ "$DEPLOY_ENV" = "staging" ]; then
  echo "Seeding initial data for staging environment..."
  NODE_ENV=$DEPLOY_ENV MONGO_URI=$MONGO_URI npm run db:seed
fi

echo "Database setup for $DEPLOY_ENV completed successfully!"