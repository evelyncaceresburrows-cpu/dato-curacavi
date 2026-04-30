@echo off
REM deploy-ahora.bat — empuja los cambios locales a GitHub.
REM Vercel detecta el push en main y redeploya solo (~2 min).
REM
REM Causa raiz del bug "no arma la ruta": el bundle vivo en Vercel es del
REM commit d715313 (24 abr) sin la vista v_comercios_busqueda, sin tags,
REM sin eje_ruta_km. Todo el trabajo posterior estaba sin commitear.

setlocal
cd /d "%~dp0"

echo.
echo === 1. Limpiando lock de git si quedo trabado ===
if exist ".git\index.lock" del /f /q ".git\index.lock"

echo.
echo === 2. Stageando cambios ===
git add -A
if errorlevel 1 goto :error

echo.
echo === 3. Commit ===
git commit -m "fix(ruta): deployar planner Ruta 68 + admin + concierge + tags reales"
if errorlevel 1 echo (sin cambios para commitear, sigo)

echo.
echo === 4. Push a GitHub (Vercel auto-deployara) ===
git push origin main
if errorlevel 1 goto :error

echo.
echo OK. Vercel va a deployar en 1-2 min. Revisa:
echo https://vercel.com/dato-curacavi/dato-curacavi/deployments
echo.
echo Cuando termine, prueba en https://dato-curacavi.vercel.app/ruta
echo con tags Romantico + Vino → ya deberia armar la ruta.
echo.
pause
exit /b 0

:error
echo.
echo ERROR. Revisa el mensaje arriba. Si dice "Permission denied",
echo corre primero: git config credential.helper manager
echo.
pause
exit /b 1
