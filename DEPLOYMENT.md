# TaskAura Deployment Guide

This guide will help you deploy both the frontend and backend of TaskAura to work together in production.

## 🚀 Quick Deployment Options

### Option 1: Render (Recommended - Free)
1. **Deploy Backend to Render:**
   - Go to [render.com](https://render.com)
   - Create account and connect your GitHub
   - Create a new "Web Service"
   - Connect your repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Set environment variable: `NODE_ENV=production`

2. **Update Frontend Environment:**
   - In your Netlify dashboard, go to Site Settings > Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-app.onrender.com`
   - Redeploy your Netlify site

### Option 2: Railway (Alternative - Free tier available)
1. **Deploy Backend to Railway:**
   - Go to [railway.app](https://railway.app)
   - Create account and connect your GitHub
   - Create new project from GitHub repo
   - Set root directory to `backend`
   - Railway will auto-detect and deploy

2. **Update Frontend Environment:**
   - Same as Render option above

### Option 3: Heroku (Paid)
1. **Deploy Backend to Heroku:**
   - Install Heroku CLI
   - Run: `heroku create your-app-name`
   - Run: `git subtree push --prefix backend heroku main`

2. **Update Frontend Environment:**
   - Same as above

## 🔧 Manual Steps

### 1. Deploy Backend

Choose one of the platforms above and deploy your backend. The backend folder contains:
- `server.js` - Main server file
- `package.json` - Dependencies
- `Procfile` - For Heroku deployment

### 2. Update CORS Configuration

In `backend/server.js`, update the CORS origins to include your Netlify domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://your-app-name.netlify.app', // Replace with your actual Netlify URL
    /\.netlify\.app$/,
    /\.netlify\.com$/
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. Set Environment Variables

In your Netlify dashboard:
1. Go to Site Settings > Environment Variables
2. Add: `VITE_API_URL` = `https://your-backend-url.com`
3. Redeploy your site

### 4. Test the Connection

Your app should now work with:
- ✅ Frontend on Netlify
- ✅ Backend on your chosen platform
- ✅ Data persistence across sessions
- ✅ Real-time updates

## 🐛 Troubleshooting

### Backend Connection Issues
1. Check if your backend URL is correct in Netlify environment variables
2. Verify CORS is configured properly
3. Test the health endpoint: `https://your-backend-url.com/api/health`

### Data Not Persisting
1. Ensure your backend is running and accessible
2. Check browser console for API errors
3. Verify the backend data directory has write permissions

### Environment Variables Not Working
1. Make sure to redeploy after adding environment variables
2. Check that variable names start with `VITE_`
3. Verify the variable is set in the correct environment (production)

## 📝 Notes

- The app will fallback to localStorage if the backend is unavailable
- All data is stored in JSON files on the backend
- The backend automatically creates data files if they don't exist
- Health check endpoint: `/api/health`

## 🔒 Security Considerations

For production use, consider:
- Adding authentication
- Using a proper database instead of JSON files
- Implementing rate limiting
- Adding HTTPS enforcement
- Setting up proper logging and monitoring 