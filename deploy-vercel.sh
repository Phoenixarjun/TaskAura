#!/bin/bash

echo "🚀 Deploying TaskAura to Vercel (Option B - Express Server)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
    print_error "Please run this script from the TaskAura project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    print_warning "Please login to Vercel..."
    vercel login
    if [ $? -ne 0 ]; then
        print_error "Failed to login to Vercel"
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the frontend
print_status "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_success "Frontend built successfully"

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod --yes
if [ $? -ne 0 ]; then
    print_error "Failed to deploy to Vercel"
    exit 1
fi

print_success "Deployment complete!"
echo ""
print_status "Next steps:"
echo "   1. Set VITE_API_URL environment variable in Vercel dashboard"
echo "   2. Test your API endpoints"
echo "   3. Verify frontend-backend connection"
echo ""
print_status "To set environment variables:"
echo "   1. Go to Vercel Dashboard"
echo "   2. Select your project"
echo "   3. Go to Settings > Environment Variables"
echo "   4. Add: VITE_API_URL = https://your-app-name.vercel.app"
echo ""
print_status "To test your deployment:"
echo "   - Health check: https://your-app-name.vercel.app/api/health"
echo "   - Weekly tasks: https://your-app-name.vercel.app/api/weekly-tasks"
echo "   - Learn history: https://your-app-name.vercel.app/api/learn-history"
echo "   - Daily tasks: https://your-app-name.vercel.app/api/daily-tasks" 