@echo off
cd /d "%~dp0"

rem ---- Check Node.js ----
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

rem ---- Check .env ----
if not exist "server\.env" (
    echo [WARN] server\.env not found, copying from .env.example ...
    copy "server\.env.example" "server\.env" >nul
    echo Please edit server\.env with Feishu credentials then re-run.
    pause
    exit /b 1
)

rem ---- Check dependencies ----
if not exist "server\node_modules" (
    echo [INFO] First run, installing dependencies (needs internet) ...
    cd server
    call npm install --no-audit --no-fund
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    cd ..
)

rem ---- Start ----
echo ============================================
echo   Logistics Workbench starting ...
echo   URL : http://localhost:3000
echo   Stop: Ctrl+C
echo ============================================
cd server
node server.js