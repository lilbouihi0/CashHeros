#!/bin/bash

# Backend Deployment Script for Google Cloud Run
# This script deploys the backend with the correct environment variables

echo "🚀 Deploying backend to Google Cloud Run..."

# Set project ID (replace with your actual project ID)
PROJECT_ID="your-project-id"
SERVICE_NAME="cashheros-api"
REGION="us-central1"

# Build and deploy
gcloud run deploy $SERVICE_NAME \
  --source ./functions \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars CORS_ORIGIN=https://casheros.com,https://www.casheros.com,https://cashheros.com,https://www.cashheros.com \
  --set-env-vars FRONTEND_URL=https://casheros.com \
  --set-env-vars MONGO_URI=mongodb+srv://yb106128:IbhqYCfWLrfCHtMB@cluster0.nhyzc9w.mongodb.net/cashheros?retryWrites=true&w=majority \
  --set-env-vars JWT_SECRET=8f9e2c4a7b1d3e5f9g8h0i2j4k6l8m0n2p4q6r8s0t2u4v6w8x0y2z4 \
  --set-env-vars JWT_REFRESH_SECRET=your_refresh_secret_key \
  --set-env-vars REDIS_ENABLED=false \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10

echo "✅ Backend deployment completed!"
echo "📝 Don't forget to:"
echo "1. Update your project ID in this script"
echo "2. Test the API endpoints"
echo "3. Deploy the frontend"