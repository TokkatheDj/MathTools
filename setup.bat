@echo off
echo ================================================
echo  Math Tools - Dependency Setup
echo ================================================
echo.
echo npm install does not work reliably on Google Drive.
echo This script copies the project to a local drive first.
echo.

set LOCAL_DIR=C:\Users\%USERNAME%\projects\MathTools

echo Step 1: Copying project to local drive...
if not exist "C:\Users\%USERNAME%\projects" mkdir "C:\Users\%USERNAME%\projects"
robocopy "%~dp0" "%LOCAL_DIR%" /E /XD node_modules dist .vite /XF "*.log" >nul

echo.
echo Step 2: Installing packages...
cd /d "%LOCAL_DIR%"
call npm install

echo.
echo ================================================
echo  Setup complete!
echo  Project is at: %LOCAL_DIR%
echo  To start dev server: npm run dev
echo  To build:            npm run build
echo ================================================
pause
