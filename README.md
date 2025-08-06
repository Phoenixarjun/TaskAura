# TaskAura - Task Management Application

A modern task management application built with React, TypeScript, Node.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd taskaura
   npm run install-all
   ```

2. **Configure environment variables:**
   - Copy `backend/env.example` to `backend/.env`
   - Update the MongoDB URI in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/taskaura
   ```

3. **Start the application:**

   **Option A: Using batch files (Windows)**
   ```bash
   # Start backend
   start-backend.bat
   
   # Start frontend (in new terminal)
   start-frontend.bat
   ```

   **Option B: Using npm scripts**
   ```bash
   # Start backend
   npm run backend
   
   # Start frontend (in new terminal)
   npm run dev
   ```

   **Option C: Manual start**
   ```bash
   # Terminal 1 - Backend
   cd backend
   node server.js
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## 📱 Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/health
- **API Documentation:** http://localhost:4000/

## 🔧 Features

### ✅ Fixed Issues
- **Authentication Flow:** Proper JWT-based authentication with fallback to demo endpoints
- **API Integration:** All components now use authenticated API services
- **Error Handling:** Graceful fallback to localStorage when backend is unavailable
- **MongoDB Connection:** Strict requirement for MongoDB connection
- **TypeScript Errors:** Fixed all TypeScript compilation errors
- **CORS Configuration:** Proper CORS setup for both local and production
- **Health Endpoint:** Fixed health check endpoint URL

### 🎯 Core Features
- **Daily Tasks:** Create, manage, and track daily tasks
- **Weekly Planning:** Plan and organize weekly goals
- **Learning Tracker:** Track learning progress and resources
- **Dashboard:** Comprehensive overview with charts and statistics
- **Authentication:** Secure user registration and login
- **Theme Support:** Dark/light mode toggle
- **Responsive Design:** Works on desktop and mobile

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/daily-tasks` - Get daily tasks
- `POST /api/daily-tasks` - Create daily task
- `GET /api/weekly-tasks` - Get weekly tasks
- `POST /api/weekly-tasks` - Create weekly task
- `GET /api/learn-tasks` - Get learning tasks
- `POST /api/learn-tasks` - Create learning task

### Demo Endpoints (No Auth Required)
- `GET /api/demo/daily-tasks` - Demo daily tasks
- `GET /api/demo/weekly-tasks` - Demo weekly tasks
- `GET /api/demo/learn-tasks` - Demo learning tasks

### System
- `GET /health` - Health check
- `GET /test` - Test endpoint
- `GET /` - API information

## 🛠️ Development

### Project Structure
```
taskaura/
├── backend/           # Node.js/Express API
│   ├── routes/       # API routes
│   ├── models/       # MongoDB models
│   ├── middleware/   # Auth middleware
│   └── server.js     # Main server file
├── src/              # React frontend
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   └── utils/        # Utility functions
└── package.json      # Frontend dependencies
```

### Key Technologies
- **Frontend:** React 18, TypeScript, Vite, Framer Motion
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Styling:** Tailwind CSS, CSS Modules
- **Charts:** Chart.js, react-chartjs-2
- **Deployment:** Vercel-ready configuration

## 🚀 Deployment

### Vercel Deployment
The project is configured for Vercel deployment:

1. **Backend:** Deployed as serverless functions
2. **Frontend:** Static build deployment
3. **Environment Variables:** Configure in Vercel dashboard

### Environment Variables
```env
# Backend (.env)
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=4000
NODE_ENV=production

# Frontend (Vercel)
VITE_API_URL=https://your-backend-url.vercel.app
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check MongoDB connection string
   - Ensure port 4000 is available
   - Run `taskkill /F /IM node.exe` to kill existing processes

2. **401 Unauthorized errors:**
   - Register/login first at `/auth`
   - Check JWT token in localStorage
   - Demo endpoints work without authentication

3. **Frontend build errors:**
   - Run `npm install --legacy-peer-deps`
   - Clear node_modules and reinstall

4. **MongoDB connection issues:**
   - Verify connection string format
   - Check network connectivity
   - Ensure MongoDB Atlas IP whitelist

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in backend `.env`.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**TaskAura** - Organize your life, one task at a time! 🎯
