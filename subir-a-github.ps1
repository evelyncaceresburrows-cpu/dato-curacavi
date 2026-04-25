# subir-a-github.ps1
# Inicializa git, hace el primer commit y sube todo a GitHub.
# Doble-click sobre este archivo, o click derecho > Ejecutar con PowerShell.

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

Write-Host ""
Write-Host "=== Dato 68 -> GitHub ===" -ForegroundColor Cyan
Write-Host "Carpeta: $PSScriptRoot"
Write-Host ""

# Verifica git instalado
try {
    $gitVersion = git --version
    Write-Host "OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git no esta instalado." -ForegroundColor Red
    Write-Host "Descargalo desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Presiona Enter para cerrar"
    exit 1
}

# Inicializa repo si no existe
if (-not (Test-Path '.git')) {
    git init
    Write-Host "OK: repo inicializado" -ForegroundColor Green
} else {
    Write-Host "OK: repo ya existia" -ForegroundColor Green
}

# Configura usuario local (solo para este repo)
git config user.email "evelyncaceresburrows@gmail.com"
git config user.name  "Evelyn Caceres"

# Stage + commit
git add .
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "OK: no hay cambios nuevos para commitear" -ForegroundColor Green
} else {
    git commit -m "Inicial: Dato 68 (corredor Ruta 68 con Supabase)"
    Write-Host "OK: commit creado" -ForegroundColor Green
}

# Branch main
git branch -M main

# Remote (idempotente)
$remoteUrl = "https://github.com/evelyncaceresburrows-cpu/dato-curacavi.git"
$existing = git remote 2>$null
if ($existing -contains 'origin') {
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}
Write-Host "OK: remote origin -> $remoteUrl" -ForegroundColor Green

# Push
Write-Host ""
Write-Host "Subiendo a GitHub. Si te pide login, autoriza con tu cuenta de GitHub..." -ForegroundColor Yellow
Write-Host ""
git push -u origin main

Write-Host ""
Write-Host "=== LISTO ===" -ForegroundColor Cyan
Write-Host "Repo en: https://github.com/evelyncaceresburrows-cpu/dato-curacavi" -ForegroundColor Green
Write-Host ""
Read-Host "Presiona Enter para cerrar"
