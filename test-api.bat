@echo off
REM Test script to verify mock API is working on Windows

echo.
echo 🚗 Car Comparison Mock API - Test Script
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Set API URL (default to localhost:3000)
set "API_URL=http://localhost:3000"

echo Checking if backend is running...
timeout /t 1 /nobreak > nul
curl -s "%API_URL%/api/cars?make=Toyota" > nul 2>&1

if errorlevel 1 (
    echo ✗ Backend not running at %API_URL%
    echo Please start the backend server:
    echo   cd server\backend ^&^& npm start
    pause
    exit /b 1
)

echo ✓ Backend is running
echo.

echo Running API Tests...
echo.

REM Test 1: Toyota
echo Testing: Get all Toyota cars
echo URL: %API_URL%/api/cars?make=Toyota
curl -s "%API_URL%/api/cars?make=Toyota" > json_response.tmp
findstr /c:"Toyota" json_response.tmp > nul
if errorlevel 0 (
    echo ✓ Success - Toyota cars found
) else (
    echo ✗ Failed - No Toyota cars found
)
echo.

REM Test 2: Honda Civic
echo Testing: Get Honda Civic
echo URL: %API_URL%/api/cars?make=Honda^&model=Civic
curl -s "%API_URL%/api/cars?make=Honda&model=Civic" > json_response.tmp
findstr /c:"Civic" json_response.tmp > nul
if errorlevel 0 (
    echo ✓ Success - Honda Civic found
) else (
    echo ✗ Failed - No Honda Civic found
)
echo.

REM Test 3: Ford Mustang 2023
echo Testing: Get Ford Mustang 2023
echo URL: %API_URL%/api/cars?make=Ford^&model=Mustang^&year=2023
curl -s "%API_URL%/api/cars?make=Ford&model=Mustang&year=2023" > json_response.tmp
findstr /c:"Mustang" json_response.tmp > nul
if errorlevel 0 (
    echo ✓ Success - Ford Mustang found
) else (
    echo ✗ Failed - No Ford Mustang found
)
echo.

REM Test 4: Tesla
echo Testing: Get Tesla vehicles
echo URL: %API_URL%/api/cars?make=Tesla
curl -s "%API_URL%/api/cars?make=Tesla" > json_response.tmp
findstr /c:"Tesla" json_response.tmp > nul
if errorlevel 0 (
    echo ✓ Success - Tesla vehicles found
) else (
    echo ✗ Failed - No Tesla vehicles found
)
echo.

REM Test 5: All cars
echo Testing: Get all cars (no filter)
echo URL: %API_URL%/api/cars
curl -s "%API_URL%/api/cars" > json_response.tmp
del json_response.tmp
echo ✓ Success - All cars endpoint working
echo.

echo ========================================
echo Test Summary
echo ========================================
echo If all tests passed, your mock API is working!
echo.
echo Sample cars available:
echo   - Toyota Camry (2021-2023)
echo   - Honda Civic (2021-2023)
echo   - Ford Mustang (2022-2023)
echo   - BMW 3 Series (2022-2023)
echo   - Chevrolet Silverado (2022-2023)
echo   - Tesla Model 3 (2022-2023)
echo.
echo Try comparing cars in the frontend!
echo.
pause
