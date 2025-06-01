@echo off
echo ===================================
echo Starting CashHeros Project
echo ===================================

echo.
echo [1/5] Checking if Node.js is installed...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed.

echo.
echo [2/5] Checking for dependencies...
echo Installing frontend dependencies if needed...
call npm install

echo Installing backend dependencies if needed...
cd backend
call npm install
cd ..

echo.
echo [3/5] Starting MongoDB (if not already running)...
echo Note: If MongoDB is not installed as a service, you may need to start it manually.
echo.

echo [4/5] Starting Backend Server...
start cmd /k "cd backend && echo Starting CashHeros Backend... && npm run dev"

echo.
echo [5/5] Starting Frontend Development Server...
start cmd /k "echo Starting CashHeros Frontend... && npm run start"

echo.
echo ===================================
echo CashHeros Project Started!
echo ===================================
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Press any key to close this window (servers will continue running)...
pause > nul