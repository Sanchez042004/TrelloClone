@echo off
echo Iniciando Trello Clone (Servidor y Cliente)...

:: Iniciar Base de Datos (Docker)
echo Iniciando base de datos PostgreSQL...
docker compose up -d
if %errorlevel% neq 0 (
    echo Error iniciando Docker. Asegurate de que Docker Desktop este corriendo.
    pause
    exit /b
)
:: Esperar un momento para que la BD este lista
timeout /t 5 /nobreak >nul

:: Inicializar Base de Datos
echo Inicializando esquema de base de datos...
cd server
call npm run init-db
if %errorlevel% neq 0 (
    echo Error inicializando base de datos.
    echo Probando 'node initDb.js' directamente...
    node initDb.js
)
cd ..

:: Iniciar Servidor
echo Iniciando Servidor...
start "Trello Server" cmd /k "cd server && npm start"

:: Iniciar Cliente
echo Iniciando Cliente...
start "Trello Client" cmd /k "cd client && npm run dev"

echo.
echo !Todo listo!
echo El Servidor deberia estar corriendo en el puerto 5000.
echo El Cliente deberia abrirse (o mostrar el link) en breve.
echo.
pause
