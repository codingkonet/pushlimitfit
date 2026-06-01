@echo off
echo Starting PushLIMITfit...
echo.
echo This app runs entirely in your browser — no backend needed.
echo Opening on http://localhost:3000
start "PushLIMITfit" cmd /k "cd /d C:\fitness-platform\client && npm run dev"
