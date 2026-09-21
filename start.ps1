# One-click start for Logistics Workbench
# Usage: right-click -> "Run with PowerShell" (or just double-click after bypassing execution policy)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

# ---- Check Node.js ----
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- Check .env ----
if (-not (Test-Path "server\.env")) {
    Write-Host "[WARN] server\.env not found, copying from .env.example ..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "Please edit server\.env with Feishu credentials then re-run." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- Check dependencies ----
if (-not (Test-Path "server\node_modules")) {
    Write-Host "[INFO] First run, installing dependencies (needs internet) ..." -ForegroundColor Cyan
    Set-Location "server"
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location $PSScriptRoot
}

# ---- Start ----
Write-Host ""
Write-Host "============================================"
Write-Host "  Logistics Workbench starting ..."
Write-Host "  URL : http://localhost:3000"
Write-Host "  Stop: Ctrl+C"
Write-Host "============================================"
Write-Host ""

Set-Location "server"
& node server.js
