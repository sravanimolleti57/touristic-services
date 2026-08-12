@echo off
title Touristic Services Automated Launcher
echo ==========================================================
echo   Launching Touristic Services Full-Stack Application
echo ==========================================================
echo.
echo [1/2] Launching Backend Server (Python Flask on port 5000)...
start "Touristic Services Backend (Flask)" cmd /k "cd backend && python app.py"

echo [2/2] Launching Frontend Application (React/Vite on port 3000)...
start "Touristic Services Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo SUCCESS! Full-stack application is launching automatically.
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:5000
echo.
