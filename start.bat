@echo off
echo Starting PushLIMITfit Platform...
echo.
echo Starting backend server on http://localhost:5000
start "PushLIMITfit Server" cmd /k "cd /d C:\fitness-platform\server && node index.js"
timeout /t 2 /nobreak > nul
echo Starting frontend on http://localhost:3000
start "PushLIMITfit Client" cmd /k "cd /d C:\fitness-platform\client && npm run dev"
echo.
echo PushLIMITfit is starting up!
echo   Frontend: http://localhost:3000
echo   API:      http://localhost:5000
