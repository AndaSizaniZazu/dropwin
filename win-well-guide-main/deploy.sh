#!/bin/bash
# Vercel Deployment Script

echo "🚀 Starting Vercel Deployment..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install project dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building frontend..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel

echo ""
echo "✅ Deployment complete!"
echo "Your app is now live on Vercel!"
