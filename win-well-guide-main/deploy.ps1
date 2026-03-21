# Vercel Deployment Script for Windows

Write-Host "🚀 Starting Vercel Deployment..." -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
$vercelExists = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelExists) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Install project dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the project
Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
npm run build

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Your app is now live on Vercel!" -ForegroundColor Cyan
