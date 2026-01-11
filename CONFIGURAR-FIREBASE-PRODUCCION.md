# 🔥 Configuración de Firebase para Producción

## ⚠️ Problema Actual

Las variables de entorno de Firebase **NO están disponibles** en producción (GitHub Pages) porque:
1. El archivo `.env` no se sube a GitHub (está en `.gitignore`)
2. GitHub Pages no tiene acceso a variables de entorno
3. Los datos se guardan solo en `localStorage` del navegador

---

## ✅ Solución: Configurar Firebase Directamente

### Opción 1: Hardcodear Configuración (Recomendado para este caso)

Edita el archivo `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase (PÚBLICA - es seguro exponerla)
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
```

**Nota**: Es SEGURO exponer estas credenciales porque Firebase usa reglas de seguridad en el servidor.

---

## 📝 Cómo Obtener tus Credenciales de Firebase

### Paso 1: Ir a Firebase Console
1. Abre: https://console.firebase.google.com/
2. Selecciona tu proyecto (o crea uno nuevo)

### Paso 2: Obtener Configuración
1. Click en el ícono de **engranaje** ⚙️ > **Configuración del proyecto**
2. Scroll down hasta **"Tus apps"**
3. Si no tienes una app web, click en **"</>"** (Web)
4. Registra tu app con el nombre "EDUPLANMX"
5. Copia la configuración que aparece

### Paso 3: Habilitar Firestore
1. En el menú lateral, click en **"Firestore Database"**
2. Click en **"Crear base de datos"**
3. Selecciona **"Modo de prueba"** (para desarrollo)
4. Elige la ubicación más cercana (ej: `us-central1`)
5. Click en **"Habilitar"**

### Paso 4: Configurar Reglas de Seguridad

En Firestore > Reglas, pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura en alumnos (temporal para pruebas)
    match /alumnos/{alumnoId} {
      allow read, write: if true;
    }
    
    // Permitir lectura/escritura en diagnósticos
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if true;
    }
    
    // Permitir lectura/escritura en planeaciones
    match /planeaciones/{planeacionId} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas son para desarrollo. En producción deberías usar autenticación.

---

## 🔧 Actualizar tu Aplicación

### 1. Editar `src/config/firebase.ts`

Reemplaza TODO el contenido con:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase
// Reemplaza con tus credenciales de Firebase Console
const firebaseConfig = {
    apiKey: "AIza...",  // ← Pega tu API Key aquí
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
```

### 2. Rebuild y Deploy

```bash
npm run build
npm run deploy
```

---

## 🧪 Probar que Funciona

### 1. Abrir Consola del Navegador
1. Ve a: https://68sfszbqhq-stack.github.io/EDUPLANMX/
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

### 2. Registrar un Alumno de Prueba
1. Click en **Diagnóstico**
2. Click en **Registrar Alumno**
3. Llena el formulario
4. Click en **Guardar Alumno**

### 3. Verificar en Firebase
1. Ve a Firebase Console > Firestore Database
2. Deberías ver una colección `alumnos`
3. Dentro, verás el documento del alumno que registraste

### 4. Verificar en la Consola
Si hay errores, verás mensajes como:
- ❌ `Firebase: Error (auth/invalid-api-key)` → API Key incorrecta
- ❌ `Missing or insufficient permissions` → Reglas de seguridad mal configuradas
- ✅ Sin errores → ¡Todo funciona!

---

## 📊 Verificar Datos Guardados

### En Firebase Console:
1. Firestore Database > Data
2. Colección: `alumnos`
3. Verás documentos con estructura:
   ```
   {
     datosAdministrativos: {
       curp: "...",
       nombre: "...",
       ...
     },
     datosNEM: {
       tipoFamilia: "...",
       ...
     },
     fechaRegistro: "2026-01-10T..."
   }
   ```

### En la Aplicación:
1. Dashboard > Diagnóstico
2. Deberías ver la lista de alumnos registrados
3. Click en **Generar Diagnóstico** para ver el análisis

---

## 🚨 Troubleshooting

### Problema: "Firebase: No Firebase App '[DEFAULT]' has been created"
**Solución**: Verifica que `firebaseConfig` tenga todos los campos correctos.

### Problema: "Missing or insufficient permissions"
**Solución**: Revisa las reglas de Firestore (paso 4 arriba).

### Problema: "Failed to get document because the client is offline"
**Solución**: Verifica tu conexión a internet.

### Problema: Los datos NO aparecen en Firebase
**Solución**: 
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que `firebaseConfig` esté correcta

---

## ✅ Checklist de Configuración

- [ ] Crear proyecto en Firebase Console
- [ ] Habilitar Firestore Database
- [ ] Configurar reglas de seguridad
- [ ] Obtener credenciales de Firebase
- [ ] Actualizar `src/config/firebase.ts`
- [ ] Hacer build (`npm run build`)
- [ ] Hacer deploy (`npm run deploy`)
- [ ] Probar registro de alumno
- [ ] Verificar datos en Firebase Console

---

## 🎯 Resultado Esperado

Después de configurar correctamente:

1. ✅ Los alumnos se guardan en Firestore
2. ✅ Puedes verlos en Firebase Console
3. ✅ Puedes verlos en el Dashboard
4. ✅ El diagnóstico grupal funciona
5. ✅ Los datos persisten entre sesiones

---

## 💡 Próximos Pasos

Una vez que Firebase funcione:

1. **Agregar autenticación** (opcional)
2. **Mejorar reglas de seguridad**
3. **Exportar datos a Excel**
4. **Crear backups automáticos**

---

**¿Necesitas ayuda?** Comparte:
1. Captura de pantalla de la consola del navegador (F12)
2. Captura de pantalla de Firebase Console
3. El error específico que ves
