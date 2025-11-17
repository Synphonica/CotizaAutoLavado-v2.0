/**
 * Script para verificar configuración de Clerk
 * Ejecutar con: node verify-clerk.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Clerk...\n');

// Leer .env del frontend
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

let frontendKeys = { publishable: null, secret: null };
let backendKeys = { publishable: null, secret: null };

// Leer frontend .env.local
if (fs.existsSync(frontendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf-8');
    const publishableMatch = frontendEnv.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=["']?([^"'\n]+)["']?/);
    const secretMatch = frontendEnv.match(/CLERK_SECRET_KEY=["']?([^"'\n]+)["']?/);

    frontendKeys.publishable = publishableMatch ? publishableMatch[1] : null;
    frontendKeys.secret = secretMatch ? secretMatch[1] : null;

    console.log('✅ Frontend .env.local encontrado');
} else {
    console.log('❌ Frontend .env.local NO encontrado');
    console.log(`   Crea el archivo en: ${frontendEnvPath}\n`);
}

// Leer backend .env
if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf-8');
    const publishableMatch = backendEnv.match(/CLERK_PUBLISHABLE_KEY=["']?([^"'\n]+)["']?/);
    const secretMatch = backendEnv.match(/CLERK_SECRET_KEY=["']?([^"'\n]+)["']?/);

    backendKeys.publishable = publishableMatch ? publishableMatch[1] : null;
    backendKeys.secret = secretMatch ? secretMatch[1] : null;

    console.log('✅ Backend .env encontrado');
} else {
    console.log('❌ Backend .env NO encontrado');
    console.log(`   Crea el archivo en: ${backendEnvPath}\n`);
}

console.log('\n📋 Resumen:\n');

// Verificar Publishable Key
console.log('📌 PUBLISHABLE KEY:');
console.log(`   Frontend: ${frontendKeys.publishable ? frontendKeys.publishable.substring(0, 20) + '...' : '❌ NO CONFIGURADA'}`);
console.log(`   Backend:  ${backendKeys.publishable ? backendKeys.publishable.substring(0, 20) + '...' : '❌ NO CONFIGURADA'}`);

if (frontendKeys.publishable && backendKeys.publishable) {
    if (frontendKeys.publishable === backendKeys.publishable) {
        console.log('   ✅ Las claves coinciden\n');
    } else {
        console.log('   ❌ ⚠️  LAS CLAVES NO COINCIDEN - Este es probablemente tu problema!\n');
    }
} else {
    console.log('   ⚠️  Falta configurar en uno o ambos lados\n');
}

// Verificar Secret Key
console.log('🔐 SECRET KEY:');
console.log(`   Frontend: ${frontendKeys.secret ? frontendKeys.secret.substring(0, 20) + '...' : '❌ NO CONFIGURADA'}`);
console.log(`   Backend:  ${backendKeys.secret ? backendKeys.secret.substring(0, 20) + '...' : '❌ NO CONFIGURADA'}`);

if (frontendKeys.secret && backendKeys.secret) {
    if (frontendKeys.secret === backendKeys.secret) {
        console.log('   ✅ Las claves coinciden\n');
    } else {
        console.log('   ❌ ⚠️  LAS CLAVES NO COINCIDEN - Este es probablemente tu problema!\n');
    }
} else {
    console.log('   ⚠️  Falta configurar en uno o ambos lados\n');
}

// Verificar formato
console.log('🔍 Verificación de formato:\n');

if (frontendKeys.publishable) {
    if (frontendKeys.publishable.startsWith('pk_test_')) {
        console.log('   ✅ Publishable key es de DEVELOPMENT (pk_test_)');
    } else if (frontendKeys.publishable.startsWith('pk_live_')) {
        console.log('   ⚠️  Publishable key es de PRODUCTION (pk_live_)');
    } else {
        console.log('   ❌ Publishable key tiene formato inválido');
    }
}

if (frontendKeys.secret) {
    if (frontendKeys.secret.startsWith('sk_test_')) {
        console.log('   ✅ Secret key es de DEVELOPMENT (sk_test_)');
    } else if (frontendKeys.secret.startsWith('sk_live_')) {
        console.log('   ⚠️  Secret key es de PRODUCTION (sk_live_)');
    } else {
        console.log('   ❌ Secret key tiene formato inválido');
    }
}

console.log('\n📝 Recomendaciones:\n');
console.log('1. Ve a: https://dashboard.clerk.com');
console.log('2. Selecciona tu proyecto/aplicación');
console.log('3. Ve a "API Keys"');
console.log('4. Copia EXACTAMENTE las claves del environment correcto');
console.log('5. Pégalas en ambos archivos .env');
console.log('6. Reinicia frontend y backend');
console.log('7. Limpia cookies del navegador\n');
