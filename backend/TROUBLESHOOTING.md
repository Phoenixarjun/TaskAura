# TaskAura Backend Troubleshooting Guide

## Database Connection Issues

### Problem: "MONGODB_URI is required" or "Database not connected"

### Solution 1: Create .env file (Recommended)

1. **Run the setup script:**
   ```bash
   cd backend
   node setup-env.js
   ```

2. **Or manually create .env file:**
   Create a file named `.env` in the `backend` directory with this content:
   ```
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://NARESH:Jokerarjun@2374@cluster0.wkpgkoa.mongodb.net/taskaura

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Solution 2: Use Demo Mode (No Database)

If you can't set up the database, the server will run in demo mode:

1. **Start the server without .env file:**
   ```bash
   cd backend
   npm start
   ```

2. **The server will show:**
   ```
   ⚠️  Running in demo mode (no database)
   ✅ Demo endpoints are available
   ```

3. **Use demo endpoints:**
   - `/api/demo/daily-tasks`
   - `/api/demo/weekly-tasks`
   - `/api/demo/learn-tasks`

### Solution 3: Use Working Server (Simple Version)

If you want a simple server without database:

1. **Use the working server:**
   ```bash
   cd backend
   node working-server.js
   ```

2. **This server has demo endpoints only and no database dependency.**

## Common Issues

### Issue: "Cannot find module 'dotenv'"
**Solution:** Install dependencies
```bash
cd backend
npm install
```

### Issue: "Port 4000 is already in use"
**Solution:** Change port in .env file
```
PORT=4001
```

### Issue: "MongoDB connection timeout"
**Solution:** Check your internet connection and MongoDB Atlas settings

## Testing the Server

1. **Health check:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Test endpoint:**
   ```bash
   curl http://localhost:4000/test
   ```

3. **Demo endpoints:**
   ```bash
   curl http://localhost:4000/api/demo/daily-tasks
   ```

## Frontend Configuration

The frontend is configured to work with both:
- Full API (with database): `http://localhost:4000/api/`
- Demo API (no database): `http://localhost:4000/api/demo/`

The frontend will automatically fall back to demo endpoints if authentication fails. 