#!/bin/bash

# Frontend Deployment Script
# This script builds and deploys the frontend

echo "🏗️  Building frontend for production..."

# Set production environment
export NODE_ENV=production

# Build the project
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    echo "📦 Build contents:"
    ls -la build/
    
    echo "🚀 Ready to deploy!"
    echo "📝 Next steps:"
    echo "1. Upload the 'build' folder to your hosting service"
    echo "2. Configure your web server to serve index.html for all routes"
    echo "3. Test the deployed application"
    
    # If using Firebase Hosting
    echo ""
    echo "For Firebase Hosting, run:"
    echo "firebase deploy --only hosting"
    
    # If using Netlify
    echo ""
    echo "For Netlify, drag the 'build' folder to your Netlify dashboard"
    
    # If using Vercel
    echo ""
    echo "For Vercel, run:"
    echo "vercel --prod"
    
else
    echo "❌ Build failed!"
    exit 1
fi