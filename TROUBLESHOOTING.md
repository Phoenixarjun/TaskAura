# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Server Issues

#### Error: "Cannot find module 'server.js'"
**Solution**: The `server.js` file has been created. Make sure you're in the backend directory:
```bash
cd backend
node server.js
```

#### Error: "MongoDB connection failed"
**Solution**: 
1. Check your `.env` file in the backend directory
2. Verify your MongoDB connection string
3. Make sure your MongoDB Atlas cluster is accessible

#### Error: "JWT_SECRET is not defined"
**Solution**: Add the JWT_SECRET to your `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Frontend Issues

#### Error: "Cannot find module './contexts/AuthContext'"
**Solution**: The AuthContext has been created. Try:
1. Restart the development server: `npm run dev`
2. Clear the cache: `npm run dev -- --force`

#### Error: "Module not found" for other imports
**Solution**: 
1. Make sure all dependencies are installed: `npm install`
2. Check if the file paths are correct
3. Restart the development server

### 3. Authentication Issues

#### Login/Register not working
**Solution**:
1. Make sure the backend server is running on port 4000
2. Check the browser console for CORS errors
3. Verify the API endpoints are accessible

#### Token issues
**Solution**:
1. Clear browser localStorage
2. Check if the JWT_SECRET is properly set
3. Verify the token format in the Authorization header

### 4. Database Issues

#### Tasks not saving
**Solution**:
1. Check MongoDB connection
2. Verify the user is authenticated
3. Check the API responses in browser dev tools

#### User registration fails
**Solution**:
1. Check if the email is unique
2. Verify password requirements (uppercase, lowercase, number)
3. Check server logs for validation errors

### 5. Development Server Issues

#### Port already in use
**Solution**:
1. Kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Or change the port in vite.config.ts
   ```

#### Hot reload not working
**Solution**:
1. Restart the development server
2. Clear the browser cache
3. Check for file watching issues

### 6. Build Issues

#### TypeScript errors
**Solution**:
1. Check for missing type definitions
2. Verify import statements
3. Run `npm run lint` to see specific errors

#### Build fails
**Solution**:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check for dependency conflicts
3. Verify all required environment variables

## Quick Fixes

### Reset Everything
```bash
# Stop all servers
# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Start fresh
cd ..
npm run dev
```

### Check Server Status
```bash
# Backend health check
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000
```

### Environment Setup
1. Copy `.env.example` to `.env` in backend directory
2. Update MongoDB connection string
3. Set a strong JWT_SECRET
4. Restart servers

## Getting Help

If you're still experiencing issues:

1. Check the browser console for errors
2. Check the terminal for server logs
3. Verify all environment variables are set
4. Make sure MongoDB is accessible
5. Try the reset procedure above

## Common Commands

```bash
# Start backend only
cd backend && npm start

# Start frontend only
npm run dev

# Start both (Windows)
start-app.bat

# Start both (PowerShell)
.\start-app.ps1

# Install dependencies
npm install
cd backend && npm install

# Check for issues
npm run lint
``` 