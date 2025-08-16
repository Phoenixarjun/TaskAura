# Vercel Environment Variables Setup

## 🚨 IMPORTANT: You need to set these environment variables in your Vercel dashboard

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click on your `taskaura` project
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add these environment variables

#### Required Environment Variables:

1. **MONGODB_URI**

   - Value: `mongodb+srv://Naresh:d0Zch35lT9YCIPiF@cluster0.wkpgkoa.mongodb.net/taskaura?retryWrites=true&w=majority`
   - Environment: Production, Preview, Development

2. **JWT_SECRET**

   - Value: `taskaura-super-secret-jwt-key-2024-production-ready`
   - Environment: Production, Preview, Development

3. **NODE_ENV**

   - Value: `production`
   - Environment: Production

4. **JWT_EXPIRES_IN**
   - Value: `7d`
   - Environment: Production, Preview, Development

### Step 3: Redeploy

After adding the environment variables, you need to redeploy:

```bash
vercel --prod
```

### Step 4: Test the API

Once deployed with environment variables, test:

1. **Health Check**: https://taskaura.vercel.app/health
2. **API Root**: https://taskaura.vercel.app/api
3. **Login Test**: https://taskaura.vercel.app/api/auth/login

### Current Status

✅ Frontend is deployed and working
✅ API structure is configured
✅ CORS is properly set up
❌ Environment variables need to be set in Vercel dashboard

### Next Steps

1. Set environment variables in Vercel dashboard (see above)
2. Redeploy the application
3. Test the login functionality
4. Verify user-specific data filtering is working

### Troubleshooting

If you still get CORS errors after setting environment variables:

1. Check that the MongoDB URI is correct
2. Verify JWT_SECRET is set
3. Make sure all environment variables are applied to Production environment
4. Try a fresh deployment: `vercel --prod --force`
