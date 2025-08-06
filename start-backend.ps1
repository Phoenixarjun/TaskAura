# TaskAura Backend Server Startup Script
Write-Host "🚀 Starting TaskAura Backend Server..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists in backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Warning: backend\.env file not found!" -ForegroundColor Yellow
    Write-Host "Make sure you have configured your MongoDB connection string." -ForegroundColor Yellow
}

# Check if node_modules exists
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
    Set-Location backend
    npm install
    Set-Location ..
}

# Check if port 4000 is already in use
$portCheck = netstat -ano | findstr :4000
if ($portCheck) {
    Write-Host "⚠️  Port 4000 is already in use. Stopping existing process..." -ForegroundColor Yellow
    $processId = ($portCheck -split '\s+')[-1]
    taskkill /PID $processId /F
    Start-Sleep -Seconds 2
}

# Start the backend server
Write-Host "🔧 Starting server on http://localhost:4000..." -ForegroundColor Green
Set-Location backend
node server-collections.js 