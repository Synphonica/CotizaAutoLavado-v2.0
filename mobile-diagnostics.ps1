# Script de diagnóstico para la app móvil de Alto Carwash
# Uso: .\mobile-diagnostics.ps1

Write-Host "🔍 Diagnóstico de App Móvil - Alto Carwash" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

function Check-Command {
    param($Name, $Description)
    try {
        $null = Get-Command $Name -ErrorAction Stop
        Write-Host "✓ $Description" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ $Description" -ForegroundColor Red
        return $false
    }
}

function Check-File {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "✓ $Description" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "✗ $Description" -ForegroundColor Red
        return $false
    }
}

# Verificar directorio
if (-not (Test-Path "mobile")) {
    Write-Host "Error: No estás en el directorio correcto" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raíz del proyecto"
    exit 1
}

Set-Location mobile

Write-Host "📦 Verificando Node y NPM..." -ForegroundColor Yellow
Check-Command "node" "Node.js instalado"
Check-Command "npm" "NPM instalado"

Write-Host "`n📱 Verificando Expo..." -ForegroundColor Yellow
try {
    $null = npx expo --version 2>$null
    Write-Host "✓ Expo CLI disponible" -ForegroundColor Green
}
catch {
    Write-Host "✗ Expo CLI no disponible" -ForegroundColor Red
}

Write-Host "`n📂 Verificando archivos..." -ForegroundColor Yellow
Check-File "package.json" "package.json existe"
Check-File "App.tsx" "App.tsx existe"
Check-File "index.ts" "index.ts existe"
Check-File "app.json" "app.json existe"

Write-Host "`n📁 Verificando dependencias..." -ForegroundColor Yellow
Check-File "node_modules" "node_modules instalado"

Write-Host "`n🔧 Verificando configuración de API..." -ForegroundColor Yellow
if (Test-Path "src\constants\API.ts") {
    Write-Host "✓ API.ts existe" -ForegroundColor Green
    $apiConfig = Get-Content "src\constants\API.ts" | Select-String "DEFAULT_API_BASE_URL" | Select-Object -First 1
    Write-Host "  Configuración: $apiConfig" -ForegroundColor Gray
}
else {
    Write-Host "✗ API.ts NO existe" -ForegroundColor Red
}

Write-Host "`n🌐 Verificando Backend..." -ForegroundColor Yellow
Write-Host "  Probando conexión a http://localhost:4000/api/health..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 3 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend respondiendo en localhost:4000" -ForegroundColor Green
        Write-Host "  Status: $($response.Content)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ Backend NO responde" -ForegroundColor Red
    Write-Host "  Asegúrate de iniciar el backend: cd backend && npm run start:dev" -ForegroundColor Yellow
}

Write-Host "`n📊 Información de package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $package = Get-Content "package.json" | ConvertFrom-Json
    $reactVersion = $package.dependencies.react
    $expoVersion = $package.dependencies.expo
    
    Write-Host "  React: $reactVersion" -ForegroundColor Gray
    Write-Host "  Expo: $expoVersion" -ForegroundColor Gray
    
    if ($reactVersion -like "19.*") {
        Write-Host "  ⚠ Advertencia: React 19 puede causar problemas" -ForegroundColor Yellow
        Write-Host "    Considera downgrade a React 18.2.0" -ForegroundColor Yellow
    }
}

Write-Host "`n🧹 Sugerencias de Limpieza..." -ForegroundColor Yellow
Write-Host "  Si tienes problemas, prueba:" -ForegroundColor Gray
Write-Host "  1. Limpiar cache: npx expo start -c" -ForegroundColor Gray
Write-Host "  2. Reinstalar: Remove-Item -Recurse -Force node_modules; npm install" -ForegroundColor Gray
Write-Host "  3. Verificar IP en API.ts" -ForegroundColor Gray

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Diagnóstico completado`n" -ForegroundColor Cyan

Write-Host "Para iniciar la app:" -ForegroundColor Green
Write-Host "  npx expo start -c`n" -ForegroundColor White

Set-Location ..
