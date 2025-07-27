# 🚀 TaskAura Vercel Deployment - Complete Guide

This guide will help you deploy TaskAura to Vercel with both frontend and backend connected and working together.

## ✅ What's Already Configured

Your TaskAura project is now fully configured for Vercel deployment:

- ✅ **Frontend**: React app with Vite build system
- ✅ **Backend**: Express server adapted for Vercel serverless functions
- ✅ **Configuration**: `vercel.json` with proper routing
- ✅ **Environment Variables**: Ready for Vercel dashboard
- ✅ **CORS**: Configured for your domains
- ✅ **Deployment Scripts**: Automated deployment for Windows and Unix

## 🚀 Quick Deployment (Choose Your Platform)

### For Windows Users:
```bash
# Double-click the file or run in Command Prompt
deploy-vercel.bat
```

### For Mac/Linux Users:
```bash
# Make executable and run
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### Manual Deployment:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Install dependencies
npm install

# 4. Build frontend
npm run build

# 5. Deploy
vercel --prod
```

## 📋 Step-by-Step Process

### Step 1: Prepare Your Environment
1. **Make sure you're in the TaskAura project root directory**
2. **Ensure you have Node.js installed** (version 16 or higher)
3. **Have a Vercel account** (free at [vercel.com](https://vercel.com))

### Step 2: Run the Deployment Script
- **Windows**: Double-click `deploy-vercel.bat`
- **Mac/Linux**: Run `./deploy-vercel.sh`

The script will:
- ✅ Install Vercel CLI if needed
- ✅ Log you into Vercel
- ✅ Install project dependencies
- ✅ Build your frontend
- ✅ Deploy to Vercel
- ✅ Provide next steps

### Step 3: Set Environment Variables
After deployment, you'll get a URL like `https://your-app-name.vercel.app`

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add this variable:**
   ```
   Key: VITE_API_URL
   Value: https://your-app-name.vercel.app
   Environment: Production
   ```
5. **Click "Save"**
6. **Redeploy** (Vercel will do this automatically)

### Step 4: Test Your Deployment

#### Test API Endpoints:
```bash
# Health check
curl https://your-app-name.vercel.app/api/health

# Weekly tasks
curl https://your-app-name.vercel.app/api/weekly-tasks

# Learn history
curl https://your-app-name.vercel.app/api/learn-history

# Daily tasks
curl https://your-app-name.vercel.app/api/daily-tasks
```

#### Test Frontend:
1. **Visit your Vercel URL**
2. **Check if the dashboard loads**
3. **Look for "Backend Status: Connected"**
4. **Try adding tasks and see if they persist**

## 🔧 Configuration Details

### What Each File Does:

**`vercel.json`** - Main configuration
- Routes `/api/*` to your Express server
- Routes everything else to your frontend
- Sets up build process for both frontend and backend

**`backend/vercel-serverless.js`** - Your Express server
- Handles all API requests
- Uses `/tmp` directory for temporary file storage
- Includes CORS configuration for your domains

**`src/utils/config.ts`** - API configuration
- Uses environment variables for API URLs
- Falls back to localhost for development

### File Storage:
- **Location**: `/tmp` directory (temporary)
- **Persistence**: Resets between function calls
- **For Production**: Consider adding a database

## 🧪 Testing Checklist

After deployment, verify:

### ✅ API Endpoints Work:
- [ ] Health check returns `{"status": "ok"}`
- [ ] Weekly tasks endpoint responds
- [ ] Learn history endpoint responds
- [ ] Daily tasks endpoint responds

### ✅ Frontend Works:
- [ ] Dashboard loads without errors
- [ ] Backend status shows "Connected"
- [ ] Can add/edit tasks
- [ ] Data persists between page refreshes
- [ ] All features work as expected

### ✅ Integration Works:
- [ ] Frontend can communicate with backend
- [ ] Data syncs between frontend and backend
- [ ] No CORS errors in browser console

## 🔍 Troubleshooting

### Common Issues:

**1. "Backend Status: Disconnected"**
- Check if environment variable `VITE_API_URL` is set correctly
- Verify the API endpoints are working
- Check Vercel function logs

**2. CORS Errors**
- The server is configured for your domains
- If using a custom domain, update CORS in `backend/vercel-serverless.js`

**3. Data Not Persisting**
- `/tmp` directory is temporary
- Data resets between function calls
- Consider adding a database for production

**4. Build Errors**
- Check if all dependencies are installed
- Verify Node.js version (16+)
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

**3. Check Environment Variables:**
- Verify in Vercel Dashboard
- Make sure variable name starts with `VITE_`
- Redeploy after adding variables

## 📈 Performance & Limits

### Vercel Free Tier Limits:
- **Function Execution**: 100GB-hours/month
- **Bandwidth**: 100GB/month
- **Function Duration**: 10 seconds max
- **Cold Start**: ~100-500ms first request

### File Storage:
- **Location**: `/tmp` directory
- **Persistence**: Temporary (resets between calls)
- **Size Limit**: 512MB per function

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality thoroughly**
2. **Monitor function logs for errors**
3. **Consider adding a database for persistent data**
4. **Set up custom domain (optional)**
5. **Configure analytics and monitoring**

## 📞 Support

If you encounter issues:

1. **Check Vercel function logs**
2. **Review this deployment guide**
3. **Check Vercel documentation**
4. **Consider upgrading to Pro for better support**

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)

---

**🎉 Congratulations!** Your TaskAura app is now deployed on Vercel with both frontend and backend working together! 