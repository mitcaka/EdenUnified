@echo off
cd /d "%~dp0"
set PORT=3005
echo ========================================
echo   Eden Unified - Starting on port %PORT%
echo ========================================
call npm run build
call npm run start
pause
