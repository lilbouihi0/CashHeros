@echo off
echo Deploying Firebase Functions...
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo You are not logged in to Firebase. Please login first:
    echo firebase login
    echo.
    pause
    exit /b 1
)

REM Navigate to functions directory and install dependencies
echo Installing function dependencies...
cd functions
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

REM Go back to root directory
cd ..

REM Deploy functions
echo.
echo Deploying functions to Firebase...
firebase deploy --only functions
if %errorlevel% neq 0 (
    echo Deployment failed
    pause
    exit /b 1
)

echo.
echo Functions deployed successfully!
echo.
pause