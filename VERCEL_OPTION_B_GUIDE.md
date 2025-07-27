# Vercel Option B Deployment Guide (Express Server)

This guide will help you deploy TaskAura to Vercel using the Express server approach.

## 📁 Files Created for Option B

- `vercel.json` - Main Vercel configuration
- `backend/vercel-serverless.js` - Express server adapted for Vercel
- `vercel-simple.json` - Simplified configuration (alternative)
- `deploy-vercel.sh` - Deployment script
- `package.json` - Updated with Vercel build script

## 🚀 Quick Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Your App
```bash
# Option A: Use the deployment script
chmod +x deploy-vercel.sh
./deploy-vercel.sh

# Option B: Deploy manually
npm run build
vercel --prod
```

### Step 4: Follow the Prompts
- Link to existing project or create new
- Set project name (e.g., `taskaura`)
- Confirm deployment settings

## ⚙️ Configuration Details

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/vercel-serverless.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/vercel-serverless.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**What this does:**
- Builds your Express server as a serverless function
- Builds your React frontend as static files
- Routes `/api/*` requests to your Express server
- Routes all other requests to your frontend

### Express Server (`backend/vercel-serverless.js`)
- Uses `/tmp` directory for file storage (temporary)
- Includes CORS configuration for your domains
- Exports the Express app for Vercel

## 🌐 Environment Variables

### Set in Vercel Dashboard:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   ```
   VITE_API_URL=https://your-app-name.vercel.app
   ```

### For Local Development:
Create `.env.local`:
```
VITE_API_URL=http://localhost:4000
```

## 🔧 CORS Configuration

The server is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)
- `https://task-aura-980f34.netlify.app` (Your Netlify URL)
- All `.netlify.app` and `.netlify.com` domains
- All `.vercel.app` domains

**To update for your specific domain:**
Edit `backend/vercel-serverless.js` and update the CORS origins.

## 📊 API Endpoints

After deployment, your APIs will be available at:
- `https://your-app-name.vercel.app/api/health`
- `https://your-app-name.vercel.app/api/weekly-tasks`
- `https://your-app-name.vercel.app/api/learn-history`
- `https://your-app-name.vercel.app/api/daily-tasks`

## 🧪 Testing Your Deployment

### 1. Test Health Check
```bash
curl https://your-app-name.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "vercel-serverless"
}
```

### 2. Test API Endpoints
```bash
# Test weekly tasks
curl https://your-app-name.vercel.app/api/weekly-tasks

# Test learn history
curl https://your-app-name.vercel.app/api/learn-history

# Test daily tasks
curl https://your-app-name.vercel.app/api/daily-tasks
```

### 3. Test Frontend
Visit your Vercel URL and check if:
- ✅ Dashboard loads correctly
- ✅ Backend status shows "connected"
- ✅ Data persists between page refreshes
- ✅ All features work as expected

## 🔍 Troubleshooting

### Common Issues:

**1. API Routes Not Working**
- Check Vercel function logs in dashboard
- Verify `vercel.json` configuration
- Ensure `backend/vercel-serverless.js` exists

**2. CORS Errors**
- Update CORS origins in `backend/vercel-serverless.js`
- Check browser console for specific errors

**3. Environment Variables Not Working**
- Redeploy after adding environment variables
- Check variable names start with `VITE_`
- Verify in Vercel dashboard

**4. Build Errors**
- Check if all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check Vercel build logs

### Debugging Steps:

**1. Check Vercel Function Logs:**
- Go to Vercel Dashboard
- Select your project
- Go to Functions tab
- Click on function to see logs

**2. Test Locally:**
```bash
vercel dev
```

**3. Check Build Output:**
```bash
npm run build
ls -la dist/
```

## 📁 File Structure After Deployment

```
your-vercel-app/
├── api/                    # Vercel serverless functions
│   └── [api].js           # Auto-generated from your Express server
├── _next/                  # Vercel build files
├── static/                 # Your built frontend
└── index.html             # Main HTML file
```

## 🔄 Updating Your Deployment

### For Code Changes:
```bash
# Make your changes
git add .
git commit -m "Update code"

# Deploy to Vercel
vercel --prod
```

### For Environment Variables:
1. Update in Vercel Dashboard
2. Redeploy: `vercel --prod`

## 📈 Performance Considerations

### Serverless Function Limits:
- **Free Tier:** 10 seconds max execution
- **Pro Tier:** 60 seconds max execution
- **Cold Start:** ~100-500ms first request
- **Warm Start:** ~10-50ms subsequent requests

### File Storage:
- **Location:** `/tmp` directory
- **Persistence:** Temporary (resets between calls)
- **Size Limit:** 512MB per function

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality thoroughly**
2. **Monitor function logs for errors**
3. **Consider adding a database for persistent data**
4. **Set up custom domain (optional)**
5. **Configure analytics and monitoring**

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Review this deployment guide
3. Check Vercel documentation
4. Consider upgrading to Pro for better support

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables) 