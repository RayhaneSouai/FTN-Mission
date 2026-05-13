@echo off
REM Script de démarrage de FTN Mission - Backend et Frontend

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       FTN MISSION - SCRIPT DE DEMARRAGE RAPIDE             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📋 Identifiants ADMIN:
echo    Email: admin@ftn.tn
echo    Mot de passe: admin123
echo.

REM Vérifier si les deux répertoires existent
if not exist "ftn-backend" (
    echo ❌ Erreur: Le répertoire 'ftn-backend' n'existe pas!
    exit /b 1
)

if not exist "ftn-frontend" (
    echo ❌ Erreur: Le répertoire 'ftn-frontend' n'existe pas!
    exit /b 1
)

echo ⚙️  Ouverture des terminaux...
echo.

REM Ouvrir terminal 1 pour le backend
echo [Terminal 1/2] Démarrage du BACKEND...
start cmd /k "cd ftn-backend && echo. && echo 🚀 Démarrage du backend sur http://localhost:8083... && echo. && mvn spring-boot:run"

REM Attendre un peu avant de lancer le frontend
timeout /t 5 /nobreak

REM Ouvrir terminal 2 pour le frontend
echo [Terminal 2/2] Démarrage du FRONTEND...
start cmd /k "cd ftn-frontend && echo. && echo 🚀 Démarrage du frontend sur http://localhost:4200... && echo. && npm start"

echo.
echo ✅ Les deux terminaux se sont ouverts!
echo.
echo 📍 Accédez à l'application:
echo    Frontend:  http://localhost:4200
echo    Backend:   http://localhost:8083
echo    Swagger:   http://localhost:8083/swagger-ui.html
echo.
echo 🔐 Page de connexion: http://localhost:4200/auth/login
echo.
echo ℹ️  Fermez cette fenêtre après avoir lancé les terminaux.
echo.
pause
