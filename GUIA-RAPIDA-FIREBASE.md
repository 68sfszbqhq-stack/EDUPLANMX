# 🚀 GUÍA RÁPIDA: Conectar Firebase a EDUPLANMX

## ⚡ Resumen del Problema

**Situación actual**: 
- ✅ Firebase está instalado (`npm`)
- ✅ El código para guardar datos existe
- ❌ **NO hay credenciales configuradas**
- ❌ Los datos NO se guardan en Firebase (solo en localStorage)

**Causa raíz**: Falta crear un proyecto en Firebase y configurar las credenciales.

---

## 📋 Solución en 5 Pasos

### Paso 1: Crear Proyecto en Firebase (5 minutos)

1. **Ir a**: https://console.firebase.google.com/
2. **Click en**: "Agregar proyecto"
3. **Nombre**: `EDUPLANMX`
4. **Google Analytics**: Desactivar (opcional)
5. **Click en**: "Crear proyecto"

---

### Paso 2: Habilitar Firestore (2 minutos)

1. **En el menú lateral**: Click en "Firestore Database"
2. **Click en**: "Crear base de datos"
3. **Modo**: Seleccionar **"Modo de prueba"**
4. **Ubicación**: `us-central1` (o la más cercana)
5. **Click en**: "Habilitar"

---

### Paso 3: Configurar Reglas de Seguridad (1 minuto)

1. **En Firestore**: Click en pestaña "Reglas"
2. **Reemplazar todo** con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alumnos/{alumnoId} {
      allow read, write: if true;
    }
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if true;
    }
    match /planeaciones/{planeacionId} {
      allow read, write: if true;
    }
  }
}
```

3. **Click en**: "Publicar"

---

### Paso 4: Obtener Credenciales (2 minutos)

1. **Click en**: Ícono de engranaje ⚙️ > "Configuración del proyecto"
2. **Scroll down** hasta "Tus apps"
3. **Si no hay apps**: Click en `</>` (Web)
4. **Nombre de la app**: `EDUPLANMX Web`
5. **Click en**: "Registrar app"
6. **COPIAR** el objeto `firebaseConfig` que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "eduplanmx.firebaseapp.com",
  projectId: "eduplanmx",
  storageBucket: "eduplanmx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### Paso 5: Configurar en tu Proyecto (3 minutos)

#### Opción A: Usar el Script Automático (Recomendado)

```bash
# En la terminal, desde la raíz del proyecto:
./setup-firebase.sh
```

El script te pedirá las credenciales y configurará todo automáticamente.

---

#### Opción B: Manual

**1. Editar `.env.local`**:

```env
# Gemini API
VITE_GEMINI_API_KEY=tu-api-key-gemini

# Firebase (pegar tus valores)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=eduplanmx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduplanmx
VITE_FIREBASE_STORAGE_BUCKET=eduplanmx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**2. Para producción (GitHub Pages)**, editar `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
    apiKey: "AIza...",  // ← Pegar valores reales
    authDomain: "eduplanmx.firebaseapp.com",
    projectId: "eduplanmx",
    storageBucket: "eduplanmx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

---

## ✅ Verificar que Funciona

### Prueba 1: En Desarrollo Local

```bash
# 1. Ejecutar servidor
npm run dev

# 2. Abrir navegador
# http://localhost:5173

# 3. Abrir consola del navegador (F12)
# No debe haber errores de Firebase

# 4. Ir a: Diagnóstico > Registrar Alumno
# 5. Llenar formulario y guardar
# 6. Verificar en Firebase Console > Firestore Database
```

---

### Prueba 2: En Producción (GitHub Pages)

```bash
# 1. Build
npm run build

# 2. Deploy
npm run deploy

# 3. Abrir
# https://68sfszbqhq-stack.github.io/EDUPLANMX/

# 4. Repetir pasos 3-6 de arriba
```

---

## 🗄️ Estructura de Base de Datos

Firebase creará automáticamente estas colecciones cuando guardes datos:

### 1. `alumnos` 
- **Qué guarda**: Todos los registros de alumnos
- **Cuándo se crea**: Al registrar el primer alumno
- **Campos principales**: 
  - `datosAdministrativos` (CURP, nombre, género, promedio)
  - `datosNEM` (familia, economía, salud, comunidad, intereses)
  - `fechaRegistro`

### 2. `diagnosticos` (Futuro)
- **Qué guarda**: Diagnósticos grupales generados
- **Cuándo se crea**: Al generar el primer diagnóstico

### 3. `planeaciones` (Futuro)
- **Qué guarda**: Planeaciones didácticas adaptadas
- **Cuándo se crea**: Al generar la primera planeación

**Ver detalles completos en**: `ESTRUCTURA-TABLAS-FIREBASE.md`

---

## 🔍 Troubleshooting

### ❌ Error: "Firebase: No Firebase App '[DEFAULT]' has been created"
**Solución**: Verifica que las credenciales en `.env.local` estén correctas y completas.

### ❌ Error: "Missing or insufficient permissions"
**Solución**: Verifica las reglas de Firestore (Paso 3).

### ❌ Error: "Failed to get document because the client is offline"
**Solución**: Verifica tu conexión a internet.

### ❌ Los datos NO aparecen en Firebase Console
**Solución**: 
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que `firebaseConfig` tenga todos los campos

---

## 📊 Datos de Ejemplo

Cuando registres un alumno, se guardará así en Firebase:

```json
{
  "datosAdministrativos": {
    "curp": "ABCD123456HDFRRL01",
    "nombre": "Juan",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "García",
    "genero": "Masculino",
    "promedioSecundaria": 8.5,
    "tipoSecundaria": "General",
    "sostenimiento": "Público"
  },
  "datosNEM": {
    "tipoFamilia": "Nuclear",
    "gradoEstudioPadre": "Preparatoria",
    "gradoEstudioMadre": "Licenciatura",
    "ingresosMensuales": "10001-20000",
    "problemasComunitarios": ["Violencia", "Contaminación"],
    "materiasPreferidas": ["Matemáticas", "Ciencias"],
    "actividadesInteres": ["Deportes", "Lectura"]
    // ... más campos
  },
  "fechaRegistro": "2026-01-10T17:45:00.000Z"
}
```

---

## 📚 Documentación Adicional

- **Análisis completo**: `ANALISIS-FIREBASE-ESTRUCTURA.md`
- **Estructura de tablas**: `ESTRUCTURA-TABLAS-FIREBASE.md`
- **Configuración producción**: `CONFIGURAR-FIREBASE-PRODUCCION.md`
- **Registro de alumnos**: `REGISTRO-ALUMNOS.md`

---

## ✅ Checklist Final

- [ ] Proyecto creado en Firebase Console
- [ ] Firestore habilitado
- [ ] Reglas de seguridad configuradas
- [ ] Credenciales obtenidas
- [ ] `.env.local` actualizado
- [ ] `src/config/firebase.ts` actualizado (para producción)
- [ ] Probado en desarrollo local
- [ ] Build y deploy a producción
- [ ] Verificado en Firebase Console

---

## 🎯 Resultado Esperado

Después de completar todos los pasos:

✅ Los alumnos se guardan en Firebase (no solo en localStorage)  
✅ Puedes verlos en Firebase Console en tiempo real  
✅ Los datos persisten entre sesiones y dispositivos  
✅ El diagnóstico grupal funciona con datos reales  
✅ La aplicación funciona en local y en producción  

---

**Tiempo total estimado**: 15-20 minutos

**¿Necesitas ayuda?** Revisa los documentos mencionados o comparte capturas de pantalla de los errores.
