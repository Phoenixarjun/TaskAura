@echo off
echo Starting TaskAura Backend Server...
echo.
cd backend
echo Current directory: %CD%
echo.
echo Starting server on port 4000...
echo Press Ctrl+C to stop the server
echo.
node server.js
pause 