#!/usr/bin/env pwsh

# TaskAura Git Push Script
Write-Host "Committing and pushing TaskAura changes..." -ForegroundColor Green

# Check git status
Write-Host "Checking git status..." -ForegroundColor Blue
git status

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Blue
git add .

# Commit changes
$commitMessage = "Fix Vercel backend deployment and user-specific data filtering

- Created proper Vercel serverless API structure
- Fixed API configuration for production deployment
- Added user authentication and data filtering
- Updated environment variables for production
- Fixed CORS and security headers
- Added proper error handling for serverless functions
- Updated deployment scripts"

Write-Host "Committing changes..." -ForegroundColor Blue
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Git commit failed. Check the error messages above." -ForegroundColor Red
    exit 1
}

# Push to main branch
Write-Host "Pushing to main branch..." -ForegroundColor Blue
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to Git!" -ForegroundColor Green
    Write-Host "Your changes are now in the repository" -ForegroundColor Cyan
} else {
    Write-Host "Git push failed. Check the error messages above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you are authenticated with Git" -ForegroundColor Cyan
    Write-Host "   2. Check if the remote repository exists" -ForegroundColor Cyan
    Write-Host "   3. Verify you have push permissions" -ForegroundColor Cyan
    exit 1
}