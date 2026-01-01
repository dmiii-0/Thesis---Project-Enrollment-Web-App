@echo off
:: UB Project Management System - Windows Setup Script
echo ============================================================
echo     UB Project Management System - Setup
echo ============================================================
echo.

:: Check Node.js installation
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

:: Check MongoDB installation
echo [2/6] Checking MongoDB...
echo Make sure MongoDB is running on localhost:27017
echo You can start it with: net start MongoDB
echo.

:: Setup Backend
echo [3/6] Setting up backend...
cd backend
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
)
echo Installing backend dependencies...
call npm install
cd ..
echo ✓ Backend setup complete
echo.

:: Setup Frontend
echo [4/6] Setting up frontend...
if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env
)
echo Installing frontend dependencies...
call npm install
echo ✓ Frontend setup complete
echo.

:: Setup complete
echo ============================================================
echo     Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo.
echo 1. Start MongoDB:
echo    net start MongoDB
echo.
echo 2. Start Backend (in a new terminal):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start Frontend (in another terminal):
echo    npm run dev
echo.
echo 4. Open browser:
echo    http://localhost:5173
echo.
echo ============================================================
pause
