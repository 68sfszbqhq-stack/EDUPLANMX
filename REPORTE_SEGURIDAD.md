# 🚨 REPORTE DE SEGURIDAD - API Key Expuesta

**Fecha**: 2026-02-05 19:06  
**Severidad**: 🔴 CRÍTICA  
**Estado**: ⚠️ EN RESOLUCIÓN

---

## 📋 Problema Detectado

Google Cloud detectó que la **API Key de Firebase** está expuesta públicamente en GitHub:

```
Clave Comprometida: YOUR_COMPROMISED_KEY
Proyecto: EDUPLANMX (id: eduplanmx)
Ubicación: https://github.com/68sfszbqhq-stack/EDUPLANMX/blob/.../assets/index-DbYEh172.js
```

---

## 🔍 Análisis

### Archivos Afectados:
1. ✅ `.env.local` - Contiene configuración de Firebase (NO se sube a Git)
2. 🔴 `src/config/firebase.ts` - **Clave hardcodeada** (SE SUBE A GIT)
3. 🔴 `dist/assets/*.js` - Build compilado con la clave

### Causa Raíz:
La clave de Firebase está **hardcodeada** en `src/config/firebase.ts` para que funcione en producción (GitHub Pages), pero esto expone la clave públicamente.

---

## ✅ PLAN DE ACCIÓN INMEDIATA

### **Paso 1: Regenerar API Keys** 🔑
1. Ir a: https://console.firebase.google.com/project/eduplanmx/settings/general
2. Regenerar la API Key de Firebase
3. Actualizar en `.env.local` y `src/config/firebase.ts`

### **Paso 2: Agregar Restricciones de Seguridad** 🔒
1. Ir a: https://console.cloud.google.com/apis/credentials
2. Configurar restricciones:
   - **Restricción de aplicación**: HTTP referrers
   - **Sitios web permitidos**: 
     - `https://68sfszbqhq-stack.github.io/EDUPLANMX/*`
     - `http://localhost:*` (para desarrollo)

### **Paso 3: Configurar Firestore Rules** 🛡️
Asegurar que las reglas de Firestore requieran autenticación:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Requerir autenticación para todo
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

### **Paso 4: Limpiar Historial de Git** 🧹
```bash
# Eliminar la clave del historial de Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/config/firebase.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (CUIDADO: esto reescribe el historial)
git push origin --force --all
```

### **Paso 5: Usar Variables de Entorno en Producción** 🌐

**Opción A: GitHub Secrets + GitHub Actions**
- Configurar GitHub Actions para deploy
- Usar secrets para las API keys
- Build en CI/CD con variables de entorno

**Opción B: Netlify/Vercel (Recomendado)**
- Migrar de GitHub Pages a Netlify o Vercel
- Configurar variables de entorno en el dashboard
- Deploy automático desde Git

---

## 🎯 SOLUCIÓN RECOMENDADA

### **Configuración Segura para Firebase**

\`\`\`typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
\`\`\`

### **.env.local** (NO se sube a Git)
\`\`\`
VITE_FIREBASE_API_KEY=tu_nueva_clave_aqui
VITE_FIREBASE_AUTH_DOMAIN=eduplanmx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduplanmx
VITE_FIREBASE_STORAGE_BUCKET=eduplanmx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=144677335686
VITE_FIREBASE_APP_ID=1:144677335686:web:cd82543b32b323e3ea5707
\`\`\`

### **.gitignore** (Asegurar que está)
\`\`\`
.env
.env.local
.env.production
dist/
\`\`\`

---

## ⚠️ IMPORTANTE: Firebase API Keys

**NOTA**: Las API Keys de Firebase son **semi-públicas** por diseño:
- ✅ Es normal que estén en el código del cliente
- ✅ La seguridad real viene de las **Firestore Rules**
- ✅ Las restricciones de dominio ayudan pero no son la única defensa

**La clave está en**:
1. ✅ Firestore Rules bien configuradas
2. ✅ Autenticación requerida
3. ✅ Restricciones de dominio en la API Key

---

## 📊 Estado de Seguridad

| Aspecto | Estado Actual | Estado Deseado |
|---------|---------------|----------------|
| API Key expuesta | 🔴 Sí | ✅ No |
| Firestore Rules | ⚠️ Permisivas | ✅ Restrictivas |
| Restricciones de dominio | 🔴 No | ✅ Sí |
| Variables de entorno | ⚠️ Parcial | ✅ Completo |
| Historial de Git limpio | 🔴 No | ✅ Sí |

---

## 🚀 Próximos Pasos

1. **INMEDIATO** (Ahora mismo):
   - [ ] Regenerar API Key de Firebase
   - [ ] Agregar restricciones de dominio
   - [ ] Actualizar Firestore Rules

2. **CORTO PLAZO** (Hoy):
   - [ ] Migrar a variables de entorno completas
   - [ ] Limpiar historial de Git
   - [ ] Nuevo deploy con configuración segura

3. **MEDIANO PLAZO** (Esta semana):
   - [ ] Considerar migración a Netlify/Vercel
   - [ ] Implementar CI/CD con secrets
   - [ ] Auditoría de seguridad completa

---

## 📚 Referencias

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Actualizado**: 2026-02-05 19:06  
**Responsable**: Sistema de Seguridad  
**Próxima Revisión**: Después de implementar soluciones