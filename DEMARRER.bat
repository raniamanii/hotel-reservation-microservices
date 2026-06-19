@echo off
echo ========================================
echo   Hotel Reservation Platform
echo   Demarrage automatique
echo ========================================
echo.

echo [1/4] Demarrage de MS-Hotels...
start "MS-Hotels" cmd /k "cd /d %~dp0ms-hotels && node src/index.js"
timeout /t 5 /nobreak > nul

echo [2/4] Demarrage de MS-Reservations...
start "MS-Reservations" cmd /k "cd /d %~dp0ms-reservations && node src/index.js"
timeout /t 3 /nobreak > nul

echo [3/4] Demarrage de MS-Notifications...
start "MS-Notifications" cmd /k "cd /d %~dp0ms-notifications && node src/index.js"
timeout /t 3 /nobreak > nul

echo [4/4] Demarrage de API Gateway...
start "API Gateway" cmd /k "cd /d %~dp0api-gateway && node src/index.js"
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo  Tous les services sont demarres !
echo  Ouvre ton navigateur sur :
echo  http://localhost:3000/api/hotels
echo ========================================
echo.
start "" "http://localhost:3000/api/hotels"
