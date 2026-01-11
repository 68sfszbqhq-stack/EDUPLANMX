#!/bin/bash

# 🔥 Script de Configuración de Firebase para EDUPLANMX
# Este script te guía paso a paso para configurar Firebase

echo "🔥 ============================================"
echo "   CONFIGURACIÓN DE FIREBASE - EDUPLANMX"
echo "============================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encuentra package.json${NC}"
    echo "Por favor ejecuta este script desde la raíz del proyecto EDUPLANMX"
    exit 1
fi

echo -e "${YELLOW}📋 Este script te ayudará a configurar Firebase paso a paso${NC}"
echo ""
echo "Antes de continuar, asegúrate de:"
echo "  1. Tener una cuenta de Google"
echo "  2. Haber creado un proyecto en Firebase Console"
echo "  3. Haber habilitado Firestore Database"
echo ""
read -p "¿Ya completaste estos pasos? (s/n): " ready

if [ "$ready" != "s" ] && [ "$ready" != "S" ]; then
    echo ""
    echo -e "${YELLOW}📖 Sigue estos pasos primero:${NC}"
    echo ""
    echo "1. Ve a: https://console.firebase.google.com/"
    echo "2. Click en 'Agregar proyecto'"
    echo "3. Nombre: EDUPLANMX"
    echo "4. Desactiva Google Analytics (opcional)"
    echo "5. Click en 'Crear proyecto'"
    echo ""
    echo "6. En el proyecto, click en el ícono </> (Web)"
    echo "7. Nombre de la app: EDUPLANMX Web"
    echo "8. Click en 'Registrar app'"
    echo ""
    echo "9. En el menú lateral, click en 'Firestore Database'"
    echo "10. Click en 'Crear base de datos'"
    echo "11. Selecciona 'Modo de prueba'"
    echo "12. Ubicación: us-central1"
    echo "13. Click en 'Habilitar'"
    echo ""
    echo "Cuando termines, vuelve a ejecutar este script."
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Perfecto! Ahora vamos a configurar las credenciales${NC}"
echo ""

# Solicitar credenciales
echo "📝 Ingresa las credenciales de Firebase Console:"
echo "   (Las encontrarás en: Configuración del proyecto > Tus apps > SDK setup and configuration)"
echo ""

read -p "API Key: " api_key
read -p "Auth Domain (ejemplo: eduplanmx.firebaseapp.com): " auth_domain
read -p "Project ID: " project_id
read -p "Storage Bucket (ejemplo: eduplanmx.appspot.com): " storage_bucket
read -p "Messaging Sender ID: " messaging_sender_id
read -p "App ID: " app_id

# Validar que no estén vacíos
if [ -z "$api_key" ] || [ -z "$auth_domain" ] || [ -z "$project_id" ] || [ -z "$storage_bucket" ] || [ -z "$messaging_sender_id" ] || [ -z "$app_id" ]; then
    echo -e "${RED}❌ Error: Todos los campos son obligatorios${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Configurando archivos...${NC}"

# 1. Actualizar .env.local
echo ""
echo "1️⃣ Actualizando .env.local..."

cat > .env.local << EOF
# Gemini API Key
# Obtén tu API key en: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your-api-key-here

# Firebase Configuration
VITE_FIREBASE_API_KEY=$api_key
VITE_FIREBASE_AUTH_DOMAIN=$auth_domain
VITE_FIREBASE_PROJECT_ID=$project_id
VITE_FIREBASE_STORAGE_BUCKET=$storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=$messaging_sender_id
VITE_FIREBASE_APP_ID=$app_id
EOF

echo -e "${GREEN}   ✅ .env.local actualizado${NC}"

# 2. Crear archivo de configuración para producción
echo ""
echo "2️⃣ Creando configuración para producción..."

cat > src/config/firebase.prod.ts << EOF
// 🔥 Configuración de Firebase para Producción
// Este archivo contiene las credenciales hardcodeadas para GitHub Pages

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "$api_key",
    authDomain: "$auth_domain",
    projectId: "$project_id",
    storageBucket: "$storage_bucket",
    messagingSenderId: "$messaging_sender_id",
    appId: "$app_id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
EOF

echo -e "${GREEN}   ✅ firebase.prod.ts creado${NC}"

# 3. Mostrar instrucciones para reglas de seguridad
echo ""
echo "3️⃣ Configurar reglas de seguridad en Firebase Console:"
echo ""
echo -e "${YELLOW}Copia y pega estas reglas en Firestore > Reglas:${NC}"
echo ""
echo "rules_version = '2';"
echo "service cloud.firestore {"
echo "  match /databases/{database}/documents {"
echo "    match /alumnos/{alumnoId} {"
echo "      allow read, write: if true;"
echo "    }"
echo "    match /diagnosticos/{diagnosticoId} {"
echo "      allow read, write: if true;"
echo "    }"
echo "    match /planeaciones/{planeacionId} {"
echo "      allow read, write: if true;"
echo "    }"
echo "  }"
echo "}"
echo ""

read -p "¿Ya configuraste las reglas en Firebase Console? (s/n): " rules_done

if [ "$rules_done" != "s" ] && [ "$rules_done" != "S" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  No olvides configurar las reglas antes de probar la aplicación${NC}"
    echo "   Ve a: https://console.firebase.google.com/project/$project_id/firestore/rules"
fi

# 4. Probar conexión
echo ""
echo "4️⃣ ¿Quieres probar la conexión ahora? (s/n): "
read -p "> " test_now

if [ "$test_now" = "s" ] || [ "$test_now" = "S" ]; then
    echo ""
    echo -e "${YELLOW}🚀 Iniciando servidor de desarrollo...${NC}"
    echo ""
    npm run dev
else
    echo ""
    echo -e "${GREEN}✅ Configuración completada!${NC}"
    echo ""
    echo "Para probar la aplicación:"
    echo "  1. Ejecuta: npm run dev"
    echo "  2. Abre: http://localhost:5173"
    echo "  3. Ve a Diagnóstico > Registrar Alumno"
    echo "  4. Llena el formulario y guarda"
    echo "  5. Verifica en Firebase Console que se guardó"
    echo ""
    echo "Para deploy a producción:"
    echo "  1. Ejecuta: npm run build"
    echo "  2. Ejecuta: npm run deploy"
    echo "  3. Abre: https://68sfszbqhq-stack.github.io/EDUPLANMX/"
    echo ""
fi

echo ""
echo -e "${GREEN}🎉 ¡Listo! Firebase está configurado${NC}"
echo ""
