# TaskAura Vercel Deployment Guide

This guide will help you deploy TaskAura to Vercel with both frontend and backend running on the same platform.

## 🚀 Quick Start

### 1. Prepare Your Repository

Your repository now has two deployment options:

**Option A: Serverless Functions (Recommended)**
- Uses individual API files in `/api` folder
- Better performance and scalability
- Automatic routing

**Option B: Express Server**
- Uses `backend/vercel-serverless.js`
- More familiar Express setup
- Requires `vercel.json` configuration

### 2. Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project root:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

## 🔧 Configuration Options

### Option A: Individual API Routes (Recommended)

This approach uses the `/api` folder with individual route files:

```
/api/
├── weekly-tasks.js
├── learn-history.js
├── daily-tasks.js
└── health.js
```

**Advantages:**
- ✅ Better performance (cold start optimization)
- ✅ Automatic routing
- ✅ Easier debugging
- ✅ Better error isolation

### Option B: Express Server

This approach uses the Express server converted for Vercel:

**Files needed:**
- `vercel.json` - Configuration
- `backend/vercel-serverless.js` - Serverless Express app

**Steps:**
1. Use the `vercel.json` configuration provided
2. Vercel will automatically route `/api/*` to your Express server
3. The server runs as a serverless function

## 🌐 Environment Variables

### For Vercel Deployment:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings > Environment Variables**
4. **Add:**
   ```
   VITE_API_URL=https://your-app-name.vercel.app
   ```

### For Local Development:

Create `.env.local`:
```
VITE_API_URL=http://localhost:4000
```

## 📁 File Storage

**Important:** Vercel serverless functions use `/tmp` directory for file storage, which is:
- ✅ Temporary (resets between function calls)
- ✅ Fast access
- ❌ Not persistent across deployments

**For production data persistence, consider:**
- MongoDB Atlas (free tier available)
- Supabase (free tier available)
- PlanetScale (free tier available)

## 🚀 Deployment Steps

### Step 1: Choose Your Approach

**For Individual API Routes (Recommended):**
```bash
# Your /api folder is ready to deploy
vercel
```

**For Express Server:**
```bash
# Make sure vercel.json is in your root
vercel
```

### Step 2: Set Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Settings > Environment Variables
3. Add: `VITE_API_URL` = `https://your-app-name.vercel.app`

### Step 3: Update CORS (if needed)

If you're still using Netlify for frontend, update the CORS origins in your API files:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://your-netlify-app.netlify.app');
```

### Step 4: Test Your Deployment

1. **Test Health Check:**
   ```
   https://your-app-name.vercel.app/api/health
   ```

2. **Test API Endpoints:**
   ```
   https://your-app-name.vercel.app/api/weekly-tasks
   https://your-app-name.vercel.app/api/learn-history
   https://your-app-name.vercel.app/api/daily-tasks
   ```

## 🔍 Troubleshooting

### Common Issues:

**1. API Routes Not Found:**
- Check that your `/api` folder is in the root directory
- Verify file names match the expected routes
- Check Vercel function logs

**2. CORS Errors:**
- Update CORS headers in your API files
- Make sure your frontend URL is allowed

**3. Data Not Persisting:**
- `/tmp` directory is temporary
- Consider using a database for production
- Data will reset between deployments

**4. Environment Variables Not Working:**
- Make sure to redeploy after adding variables
- Check that variable names start with `VITE_`
- Verify in Vercel dashboard

### Debugging:

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Functions tab
4. Click on function to see logs

**Test Locally:**
```bash
vercel dev
```

## 📊 Performance Considerations

### Serverless Functions:
- **Cold Start:** ~100-500ms first request
- **Warm Start:** ~10-50ms subsequent requests
- **Timeout:** 10 seconds (free tier), 60 seconds (pro)

### File Storage:
- **Read/Write:** Fast for small files
- **Persistence:** Temporary (resets between calls)
- **Size Limit:** 512MB per function

## 🔒 Security

### CORS Configuration:
```javascript
// For production, be specific about allowed origins
res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.com');
```

### Environment Variables:
- Never commit sensitive data
- Use Vercel's environment variable system
- Consider using Vercel's secrets for sensitive data

## 📈 Scaling

### Free Tier Limits:
- **Function Execution:** 100GB-hours/month
- **Bandwidth:** 100GB/month
- **Function Duration:** 10 seconds max

### Pro Tier Benefits:
- **Function Duration:** 60 seconds max
- **More bandwidth and execution time**
- **Team collaboration features**

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality**
2. **Monitor function logs**
3. **Consider database integration for data persistence**
4. **Set up custom domain (optional)**
5. **Configure analytics and monitoring**

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Review this deployment guide
3. Check Vercel documentation
4. Consider upgrading to Pro for better support 