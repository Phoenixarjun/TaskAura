#!/usr/bin/env pwsh

# TaskAura Development Startup Script
Write-Host "🚀 Starting TaskAura Development Environment..." -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check if backend port is available
if (Test-Port -Port 4000) {
    Write-Host "⚠️  Port 4000 is already in use. Backend might already be running." -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 4000 is available" -ForegroundColor Green
}

# Start backend in background
Write-Host "🔧 Starting backend server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'c:\Arjun_Works\TaskAura\taskaura\backend'; npm start" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🎨 Starting frontend development server..." -ForegroundColor Blue
Set-Location "c:\Arjun_Works\TaskAura\taskaura"
npm run dev

Write-Host "🎉 TaskAura is now running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "API Health: http://localhost:4000/health" -ForegroundColor Cyan