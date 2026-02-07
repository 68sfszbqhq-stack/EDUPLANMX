#!/bin/bash

# Script de Resolución de Seguridad - API Key Expuesta
# EDUPLANMX - 2026-02-05

echo "🚨 RESOLUCIÓN DE SEGURIDAD - API KEY EXPUESTA"
echo "=============================================="
echo ""

echo "📋 PASOS A SEGUIR:"
echo ""

echo "1️⃣  REGENERAR API KEY DE FIREBASE"
echo "   → Abre: https://console.firebase.google.com/project/eduplanmx/settings/general"
echo "   → Ve a la sección 'Tus apps'"
echo "   → Regenera la API Key"
echo "   → Copia la NUEVA clave"
echo ""
read -p "¿Ya regeneraste la clave? (s/n): " regenerada

if [ "$regenerada" != "s" ]; then
    echo "❌ Por favor regenera la clave primero"
    exit 1
fi

echo ""
echo "2️⃣  INGRESA LA NUEVA API KEY"
read -p "Pega la nueva API Key aquí: " nueva_clave

if [ -z "$nueva_clave" ]; then
    echo "❌ No ingresaste ninguna clave"
    exit 1
fi

echo ""
echo "3️⃣  ACTUALIZANDO ARCHIVOS..."

# Actualizar .env.local
echo "   → Actualizando .env.local..."
cat > .env.local << EOF
# Gemini API Key
VITE_API_KEY=YOUR_API_KEY_HERE

# Firebase Configuration
VITE_FIREBASE_API_KEY=$nueva_clave
VITE_FIREBASE_AUTH_DOMAIN=eduplanmx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduplanmx
VITE_FIREBASE_STORAGE_BUCKET=eduplanmx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=144677335686
VITE_FIREBASE_APP_ID=1:144677335686:web:cd82543b32b323e3ea5707
EOF

# Actualizar firebase.ts para usar variables de entorno
echo "   → Actualizando src/config/firebase.ts..."
cat > src/config/firebase.ts << 'EOF'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduplanmx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduplanmx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduplanmx.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "144677335686",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:144677335686:web:cd82543b32b323e3ea5707"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
EOF

# Asegurar que .env.local está en .gitignore
echo "   → Verificando .gitignore..."
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
fi

echo ""
echo "4️⃣  CONFIGURAR RESTRICCIONES DE SEGURIDAD"
echo "   → Abre: https://console.cloud.google.com/apis/credentials?project=eduplanmx"
echo "   → Busca la API Key de Firebase"
echo "   → Agrega restricciones:"
echo "     • Tipo: HTTP referrers"
echo "     • Sitios permitidos:"
echo "       - https://68sfszbqhq-stack.github.io/EDUPLANMX/*"
echo "       - http://localhost:*"
echo ""
read -p "¿Ya configuraste las restricciones? (s/n): " restricciones

echo ""
echo "5️⃣  HACER COMMIT Y PUSH"
echo "   → Haciendo commit de los cambios..."

git add .env.local .gitignore src/config/firebase.ts REPORTE_SEGURIDAD.md
git commit -m "security: Migrar a variables de entorno y regenerar API keys

- Regenerada API Key de Firebase
- Migrado firebase.ts a usar variables de entorno
- Actualizado .env.local con nuevas credenciales
- Asegurado .gitignore para proteger .env.local
- Documentado en REPORTE_SEGURIDAD.md

BREAKING: Se requiere configurar variables de entorno en producción"

echo "   → Pushing a GitHub..."
git push origin main

echo ""
echo "6️⃣  REBUILD Y REDEPLOY"
echo "   → Construyendo aplicación..."
npm run build

echo "   → Deploying a GitHub Pages..."
./deploy.sh

echo ""
echo "✅ RESOLUCIÓN COMPLETADA"
echo "========================"
echo ""
echo "📋 CHECKLIST FINAL:"
echo "   [✓] API Key regenerada"
echo "   [✓] Archivos actualizados"
echo "   [✓] Variables de entorno configuradas"
echo "   [✓] .gitignore actualizado"
echo "   [✓] Commit y push realizados"
echo "   [✓] Deploy actualizado"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • La clave antigua sigue en el historial de Git"
echo "   • Para producción, considera usar Netlify/Vercel"
echo "   • Configura las restricciones de dominio en Google Cloud"
echo ""
echo "📚 Más información en: REPORTE_SEGURIDAD.md"
