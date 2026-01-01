@echo off
REM UB Project Management Backend Setup Script
REM For Windows

echo ============================================================
echo 🚀 UB Project Management Backend Setup
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo 📥 Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version
echo ✅ npm detected
npm --version
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from the backend directory:
    echo   cd backend
    echo   setup.bat
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Create uploads directory
if not exist "uploads" (
    echo 📁 Creating uploads directory...
    mkdir uploads
    echo ✅ Uploads directory created!
) else (
    echo ✅ Uploads directory already exists!
)

echo.
echo ============================================================
echo ✅ Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo.
echo 1. Make sure MongoDB is running:
echo    - Open MongoDB Compass
echo    - Connect to mongodb://localhost:27017
echo.
echo 2. Start the backend server:
echo    npm run dev    (development with auto-reload)
echo    npm start      (production)
echo.
echo 3. Test the API:
echo    curl http://localhost:3001/api/health
echo.
echo 4. View documentation:
echo    http://localhost:3001/
echo.
echo For detailed setup instructions, see:
echo   /BACKEND_MONGODB_SETUP.md
echo.
pause
