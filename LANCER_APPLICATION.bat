@echo off
chcp 65001 > nul
title FTN Mission - Lancement Application

echo ============================================
echo   FTN Mission - Demarrage de l'application
echo ============================================
echo.

:: ── Verifier Java ──────────────────────────────────
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Java n'est pas installe ou pas dans le PATH.
    echo Installez Java 17+ depuis https://adoptium.net/
    pause
    exit /b 1
)

:: ── Verifier Node.js ───────────────────────────────
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH.
    echo Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Java et Node.js detectes.
echo.

:: ── Demarrer le Backend (Spring Boot port 8083) ────
echo [1/2] Demarrage du Backend Spring Boot sur le port 8083...
start "FTN - Backend (port 8083)" cmd /k "cd /d "%~dp0ftn-backend" && echo === BACKEND SPRING BOOT === && mvnw.cmd spring-boot:run"

echo.
echo Attente 15 secondes pour que le backend se demarre...
timeout /t 15 /nobreak > nul

:: ── Demarrer le Frontend (Angular port 4200) ───────
echo [2/2] Demarrage du Frontend Angular sur le port 4200...
start "FTN - Frontend (port 4200)" cmd /k "cd /d "%~dp0ftn-frontend" && echo === FRONTEND ANGULAR === && npm start"

echo.
echo ============================================
echo   Les deux serveurs sont en cours de
echo   demarrage dans des fenetres separees.
echo.
echo   Backend  : http://localhost:8083
echo   Frontend : http://localhost:4200
echo.
echo   Attendez que les deux soient prets
echo   puis ouvrez votre navigateur sur :
echo   http://localhost:4200
echo ============================================
echo.

:: ── Ouvrir automatiquement le navigateur apres 30s ─
echo Ouverture du navigateur dans 30 secondes...
timeout /t 30 /nobreak > nul
start http://localhost:4200

pause
