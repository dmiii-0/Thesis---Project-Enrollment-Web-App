@echo off
:: Start both backend and frontend in development mode
echo Starting UB Project Management System...
echo.

:: Start backend in a new window
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Wait a bit for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit (servers will keep running)
pause >nul
