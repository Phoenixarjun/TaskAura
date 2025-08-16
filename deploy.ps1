#!/usr/bin/env pwsh

# TaskAura Deployment Script for Vercel
Write-Host "🚀 Deploying TaskAura to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed. Please fix errors and try again." -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "🔧 Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Set environment variables for Vercel (you need to set these in Vercel dashboard)
Write-Host "📝 IMPORTANT: Set these environment variables in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "   MONGODB_URI: mongodb+srv://Naresh:d0Zch35lT9YCIPiF@cluster0.wkpgkoa.mongodb.net/taskaura?retryWrites=true&w=majority" -ForegroundColor Cyan
Write-Host "   JWT_SECRET: taskaura-super-secret-jwt-key-2024-production-ready" -ForegroundColor Cyan
Write-Host "   NODE_ENV: production" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Go to: https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables" -ForegroundColor Yellow
Write-Host ""

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "Your app is now live on Vercel!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔍 Test your deployment:" -ForegroundColor Yellow
    Write-Host "   Frontend: https://taskaura.vercel.app" -ForegroundColor Cyan
    Write-Host "   API Health: https://taskaura.vercel.app/health" -ForegroundColor Cyan
    Write-Host "   API Root: https://taskaura.vercel.app/api" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    Write-Host "💡 Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Make sure environment variables are set in Vercel dashboard" -ForegroundColor Cyan
    Write-Host "   2. Check if your MongoDB URI is correct" -ForegroundColor Cyan
    Write-Host "   3. Verify all dependencies are installed" -ForegroundColor Cyan
    exit 1
}