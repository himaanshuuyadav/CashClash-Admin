@echo off
echo ========================================
echo Starting CashClash Server
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

REM Check if serviceAccountKey.json exists
if not exist "serviceAccountKey.json" (
    echo WARNING: serviceAccountKey.json not found!
    echo Please download it from Firebase Console.
    echo.
)

REM Activate virtual environment if exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

echo Starting server...
echo.
echo Admin Panel: http://localhost:5000/
echo API Base URL: http://localhost:5000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

python server.py
