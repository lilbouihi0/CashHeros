# CashHeros Deployment Guide

This guide provides comprehensive instructions for deploying the CashHeros application across different environments.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Frontend Hosting](#frontend-hosting)
3. [Database Deployment and Migration](#database-deployment-and-migration)
4. [Domain and SSL Configuration](#domain-and-ssl-configuration)
5. [CDN for Static Assets](#cdn-for-static-assets)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Backup and Recovery Procedures](#backup-and-recovery-procedures)

## Backend Deployment

### Deployment Options

The CashHeros backend can be deployed using several methods:

1. **PM2 Deployment (Recommended for small to medium scale)**
   - Uses the `ecosystem.config.js` file for configuration
   - Supports clustering for better performance
   - Includes zero-downtime deployments

2. **Docker Deployment**
   - Uses the `Dockerfile` in the backend directory
   - Can be deployed with docker-compose or to container orchestration platforms

3. **AWS ECS Deployment**
   - Containerized deployment on AWS Elastic Container Service
   - Managed by the CI/CD pipeline

### Deployment Steps

#### PM2 Deployment

1. Set up the server environment:

```bash
# Install Node.js and PM2
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/cashheros-backend-production
sudo chown -R $USER:$USER /var/www/cashheros-backend-production
```

2. Deploy the application:

```bash
# Navigate to the backend directory
cd CashHeros/backend

# Deploy using the deployment script
./deployment/deploy.sh production deploy-user your-server-ip
```

3. Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.cashheros.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Docker Deployment

1. Build and run the Docker container:

```bash
# Build the Docker image
docker build -t cashheros-backend:latest .

# Run the container
docker run -d --name cashheros-backend \
  -p 5000:5000 \
  -v $(pwd)/logs:/app/logs \
  --env-file .env.production \
  cashheros-backend:latest
```

2. Or use docker-compose:

```bash
# Start the services
docker-compose -f docker-compose.production.yml up -d
```

## Frontend Hosting

### Hosting Options

The CashHeros frontend can be hosted using several methods:

1. **AWS S3 + CloudFront (Recommended)**
   - Static hosting on S3
   - CloudFront for CDN and SSL
   - Supports custom domains

2. **Nginx Static Hosting**
   - Traditional web server hosting
   - Good for self-hosted environments

3. **Docker Deployment**
   - Uses the `Dockerfile` in the root directory
   - Nginx serves the static files inside the container

### Deployment Steps

#### AWS S3 + CloudFront Deployment

1. Create an S3 bucket for hosting:

```bash
aws s3 mb s3://cashheros-website-prod
```

2. Build and deploy the frontend:

```bash
# Navigate to the frontend directory
cd CashHeros

# Deploy using the deployment script
./deployment/deploy-frontend.sh production cashheros-website-prod your-cloudfront-id
```

3. Configure CloudFront:

```bash
# Create CloudFront distribution using the template
aws cloudfront create-distribution --distribution-config file://deployment/cloudfront-distribution.json
```

#### Nginx Static Hosting

1. Build the frontend:

```bash
# Navigate to the frontend directory
cd CashHeros

# Install dependencies
npm ci

# Build for production
npm run build
```

2. Configure Nginx:

```nginx
server {
    listen 80;
    server_name cashheros.com www.cashheros.com;
    
    root /var/www/cashheros/html;
    index index.html;
    
    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

3. Deploy the build files:

```bash
# Copy build files to server
scp -r build/* user@your-server:/var/www/cashheros/html/
```

## Database Deployment and Migration

### Database Options

CashHeros uses MongoDB as its primary database:

1. **MongoDB Atlas (Recommended)**
   - Fully managed MongoDB service
   - Automatic backups and scaling
   - Multi-region deployment options

2. **Self-hosted MongoDB**
   - More control over the database
   - Requires more maintenance

### Deployment Steps

#### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster:

```bash
# Navigate to the backend directory
cd CashHeros/backend

# Run the MongoDB Atlas setup script
node deployment/mongodb-atlas-setup.js production db-user your-secure-password
```

2. Configure the application to use the Atlas cluster:

```bash
# Update the .env file with the MongoDB URI
MONGO_URI=mongodb+srv://db-user:your-secure-password@cashheros-prod.mongodb.net/cashheros?retryWrites=true&w=majority
```

#### Database Migration

1. Run database migrations:

```bash
# Navigate to the backend directory
cd CashHeros/backend

# Run migrations
NODE_ENV=production npm run db:migrate
```

2. Seed initial data (if needed):

```bash
# Seed production data
NODE_ENV=production npm run db:seed
```

## Domain and SSL Configuration

### Domain Setup

1. Register your domain (if not already registered)

2. Configure DNS records:

```bash
# Navigate to the deployment directory
cd CashHeros/deployment

# Run the Route53 setup script (if using AWS)
node route53-setup.js production your-hosted-zone-id your-cloudfront-domain your-cloudfront-hosted-zone-id your-load-balancer-domain your-load-balancer-hosted-zone-id
```

### SSL Configuration

1. Set up SSL certificates:

```bash
# Navigate to the deployment directory
cd CashHeros/deployment

# Run the SSL setup script
./ssl-setup.sh cashheros.com admin@cashheros.com your-server-ip deploy-user
```

2. Configure Nginx to use SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name cashheros.com www.cashheros.com;
    
    ssl_certificate /etc/letsencrypt/live/cashheros.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cashheros.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    
    # Root directory
    root /var/www/cashheros/html;
    index index.html;
    
    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name cashheros.com www.cashheros.com;
    return 301 https://$host$request_uri;
}
```

## CDN for Static Assets

### CDN Setup

1. Create a CDN for static assets:

```bash
# Navigate to the deployment directory
cd CashHeros/deployment

# Run the CDN setup script
node cdn-setup.js production
```

2. Configure the frontend to use the CDN:

```javascript
// In your React components, use the CDN utilities
import { getAssetUrl } from '../utils/cdnUtils';

// Example usage
<img src={getAssetUrl('/images/logo.png')} alt="Logo" />
```

3. Upload assets to the CDN:

```bash
# Upload assets to S3
aws s3 sync assets/ s3://cashheros-static-production/ --cache-control "max-age=31536000"
```

## Monitoring and Alerting

### Monitoring Setup

1. Set up CloudWatch monitoring:

```bash
# Navigate to the deployment directory
cd CashHeros/deployment

# Run the monitoring setup script
./monitoring-setup.sh production us-east-1
```

2. Configure the application for monitoring:

```javascript
// In your Express app (server.js)
const { setupMonitoring } = require('./config/monitoring');

// Set up monitoring middleware
setupMonitoring(app);
```

3. Set up Sentry for error tracking:

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/tracing

# Configure Sentry in your .env file
SENTRY_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/1234567
```

### Health Checks

1. Access the health check endpoint:

```
https://api.cashheros.com/health
```

2. Set up CloudWatch alarms for the health check:

```bash
# Create a CloudWatch alarm for the health check
aws cloudwatch put-metric-alarm \
  --alarm-name "CashHeros-API-Health" \
  --alarm-description "Alarm when API health check fails" \
  --metric-name "HealthCheckStatus" \
  --namespace "AWS/Route53" \
  --statistic "Minimum" \
  --period 60 \
  --threshold 1 \
  --comparison-operator "LessThanThreshold" \
  --dimensions Name=HealthCheckId,Value=your-health-check-id \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:CashHeros-Alerts
```

## Backup and Recovery Procedures

### Automated Backups

1. Set up automated database backups:

```bash
# Configure backup settings in .env file
DB_BACKUP_ENABLED=true
DB_BACKUP_CRON="0 0 * * *"
AWS_BACKUP_ENABLED=true
AWS_BACKUP_BUCKET=cashheros-backups
```

2. Schedule the backup script:

```bash
# Add to crontab
0 0 * * * cd /var/www/cashheros-backend-production/current && node scripts/backup.js >> /var/log/cashheros-backup.log 2>&1
```

### Manual Backups

1. Create a manual backup:

```bash
# Navigate to the backend directory
cd CashHeros/backend

# Run the backup script
node scripts/backup.js
```

### Recovery Procedures

1. Restore from a backup:

```bash
# Navigate to the backend directory
cd CashHeros/backend

# List available backups
node scripts/restore.js

# Restore from a specific backup
node scripts/restore.js --file=backup-2023-01-01_00-00-00.gz

# Restore from S3
node scripts/restore.js --s3 --file=backup-2023-01-01_00-00-00.gz
```

2. Disaster recovery:

```bash
# 1. Restore the database from the latest backup
node scripts/restore.js --latest

# 2. Deploy the latest stable version of the application
./deployment/deploy.sh production deploy-user your-server-ip

# 3. Verify the application is working correctly
curl -I https://api.cashheros.com/health
```

## Conclusion

This deployment guide covers the essential aspects of deploying the CashHeros application. For more detailed information about specific components, refer to the documentation in the respective directories.

For any questions or issues, please contact the development team.