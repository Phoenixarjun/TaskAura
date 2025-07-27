@echo off
echo 🚀 Deploying TaskAura to Vercel (Option B - Express Server)

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the TaskAura project root directory
    pause
    exit /b 1
)

if not exist "vercel.json" (
    echo [ERROR] vercel.json not found. Please run this script from the TaskAura project root directory
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Please login to Vercel...
    vercel login
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to login to Vercel
        pause
        exit /b 1
    )
)

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Build the frontend
echo [INFO] Building frontend...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)

REM Check if build was successful
if not exist "dist" (
    echo [ERROR] Build failed - dist directory not found
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built successfully

REM Deploy to Vercel
echo [INFO] Deploying to Vercel...
vercel --prod --yes
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Vercel
    pause
    exit /b 1
)

echo [SUCCESS] Deployment complete!
echo.
echo [INFO] Next steps:
echo    1. Set VITE_API_URL environment variable in Vercel dashboard
echo    2. Test your API endpoints
echo    3. Verify frontend-backend connection
echo.
echo [INFO] To set environment variables:
echo    1. Go to Vercel Dashboard
echo    2. Select your project
echo    3. Go to Settings ^> Environment Variables
echo    4. Add: VITE_API_URL = https://your-app-name.vercel.app
echo.
echo [INFO] To test your deployment:
echo    - Health check: https://your-app-name.vercel.app/api/health
echo    - Weekly tasks: https://your-app-name.vercel.app/api/weekly-tasks
echo    - Learn history: https://your-app-name.vercel.app/api/learn-history
echo    - Daily tasks: https://your-app-name.vercel.app/api/daily-tasks
echo.
pause 