@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo === Dato 68 ^-^> GitHub ===
echo Carpeta: %CD%
echo.

git --version
if errorlevel 1 (
    echo.
    echo ERROR: Git no esta instalado en este equipo.
    echo Descargalo desde: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

if not exist ".git" (
    git init
    echo OK: repo inicializado
) else (
    echo OK: repo ya existia
)

git config user.email "evelyncaceresburrows@gmail.com"
git config user.name "Evelyn Caceres"

git add .
git commit -m "Inicial: Dato 68 (corredor Ruta 68 con Supabase)"

git branch -M main

git remote remove origin 2>nul
git remote add origin https://github.com/evelyncaceresburrows-cpu/dato-curacavi.git
echo OK: remote origin configurado

echo.
echo Subiendo a GitHub. Si pide login, autoriza con tu cuenta...
echo.
git push -u origin main

echo.
echo === LISTO ===
echo Repo en: https://github.com/evelyncaceresburrows-cpu/dato-curacavi
echo.
pause
