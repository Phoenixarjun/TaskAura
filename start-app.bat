@echo off
echo Starting TaskAura Application...
echo.

echo Starting Backend Server...
start "TaskAura Backend" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Development Server...
start "TaskAura Frontend" cmd /k "npm run dev"

echo.
echo TaskAura is starting up!
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul 