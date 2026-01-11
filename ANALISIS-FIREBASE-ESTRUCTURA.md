# 🔍 Análisis de Firebase y Estructura de Base de Datos - EDUPLANMX

## 📊 Estado Actual del Proyecto

### ✅ Lo que ESTÁ Configurado:

1. **Dependencias de Firebase Instaladas**
   - ✅ `firebase@12.7.0` instalado en `package.json`
   - ✅ Módulos disponibles: `@firebase/firestore`, `@firebase/auth`, `@firebase/app`

2. **Configuración de Firebase**
   - ✅ Archivo `src/config/firebase.ts` creado
   - ✅ Inicialización de Firestore y Auth
   - ⚠️ **PROBLEMA**: Variables de entorno vacías o no configuradas

3. **Servicio de Alumnos**
   - ✅ `src/services/alumnosFirebase.ts` implementado
   - ✅ Métodos CRUD completos:
     - `guardarAlumno()` - Crear
     - `obtenerAlumnos()` - Leer
     - `actualizarAlumno()` - Actualizar
     - `eliminarAlumno()` - Eliminar
     - `sincronizarDesdeLocalStorage()` - Migración

4. **Tipos de Datos Definidos**
   - ✅ `types/diagnostico.ts` con estructura completa
   - ✅ Interfaz `Alumno` con todos los campos necesarios

---

## ❌ Lo que FALTA (Por qué no se guardan los datos)

### 1. **Credenciales de Firebase NO Configuradas**

**Problema**: El archivo `.env.local` solo tiene la API de Gemini:
```env
VITE_GEMINI_API_KEY=your-api-key-here
```

**Faltan**:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**Resultado**: Firebase no puede conectarse porque todas las credenciales están vacías (`''`).

---

### 2. **No Existe un Proyecto de Firebase**

Para que funcione, necesitas:
1. ✅ Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. ✅ Habilitar Firestore Database
3. ✅ Configurar reglas de seguridad
4. ✅ Obtener las credenciales del proyecto
5. ✅ Agregar las credenciales al código

---

## 🗄️ Estructura de Base de Datos Necesaria

### Colecciones de Firestore Requeridas:

#### 1. **Colección: `alumnos`**

**Propósito**: Almacenar todos los registros de alumnos

**Estructura de Documento**:
```javascript
{
  // ID auto-generado por Firestore
  
  // Datos Administrativos
  datosAdministrativos: {
    curp: "ABCD123456HDFRRL01",
    nombre: "Juan",
    apellidoPaterno: "Pérez",
    apellidoMaterno: "García",
    genero: "Masculino",
    promedioSecundaria: 8.5,
    tipoSecundaria: "General",
    sostenimiento: "Público"
  },
  
  // Datos NEM (Contexto Familiar y Socioeconómico)
  datosNEM: {
    // Familia
    tipoFamilia: "Nuclear",
    redApoyo: {
      nombreTutor: "María García",
      parentesco: "Madre",
      telefonoPadre: "5551234567",
      telefonoMadre: "5557654321",
      telefonoTutor: "5557654321",
      telefonoEmergencia: "5559876543"
    },
    
    // Nivel Socioeconómico
    gradoEstudioPadre: "Preparatoria",
    gradoEstudioMadre: "Licenciatura",
    ocupacionPadre: "Obrero",
    ocupacionMadre: "Profesionista",
    
    // Situación Laboral del Alumno
    situacionLaboral: "Solo estudia",
    horasTrabajoSemanal: 0,
    
    // Vivienda
    tipoVivienda: "Propia",
    serviciosVivienda: {
      agua: true,
      luz: true,
      drenaje: true,
      internet: true,
      tvCable: false,
      aireAcondicionado: false
    },
    
    // Economía
    ingresosMensuales: "10001-20000",
    personasAportanIngreso: 2,
    cuentaConBeca: false,
    tipoBeca: "",
    
    // Salud
    institucionSalud: "IMSS",
    enfermedadesCronicas: [],
    tratamientoEnfermedades: "",
    
    // Contexto Comunitario (PAEC)
    problemasComunitarios: ["Violencia", "Contaminación"],
    deficienciasServicios: ["Alumbrado público", "Áreas verdes"],
    
    // Factores de Riesgo
    consumoSustanciasCuadra: ["Alcohol"],
    consumoSustanciasCasa: [],
    
    // Convivencia
    frecuenciaDiscusionesComunidad: "Rara vez",
    intensidadPeleasComunidad: "Leve",
    frecuenciaDiscusionesFamilia: "Nunca",
    intensidadPeleasFamilia: "Ninguna",
    
    // Cultura
    tradicionesLocales: ["Día de Muertos", "Fiestas patronales"],
    practicasDiscriminatorias: [],
    
    // Intereses
    materiasPreferidas: ["Matemáticas", "Ciencias"],
    actividadesInteres: ["Deportes", "Lectura"]
  },
  
  // Metadata
  fechaRegistro: "2026-01-10T17:45:00.000Z"
}
```

---

#### 2. **Colección: `diagnosticos`** (Futura)

**Propósito**: Almacenar diagnósticos grupales generados

**Estructura**:
```javascript
{
  grupoId: "3A-2026",
  totalAlumnos: 25,
  fechaGeneracion: "2026-01-10T18:00:00.000Z",
  perfilAprendizaje: {
    estilosDominantes: ["Visual", "Kinestésico"],
    ganchosInteres: ["Tecnología", "Deportes"],
    materiasPopulares: ["Matemáticas", "Ciencias"],
    actividadesPreferidas: ["Proyectos", "Experimentos"]
  },
  alertasAbandono: [
    {
      alumnoId: "abc123",
      nombreAlumno: "Juan Pérez",
      nivelRiesgo: "Alto",
      factoresRiesgo: ["Trabaja más de 20 horas", "Problemas familiares"],
      recomendaciones: ["Tutoría personalizada", "Apoyo psicológico"]
    }
  ],
  problemaPAEC: {
    problema: "Violencia",
    frecuencia: 15,
    porcentaje: 60
  },
  metasPMC: [
    "Fomentar cultura de paz",
    "Desarrollar pensamiento crítico"
  ]
}
```

---

#### 3. **Colección: `planeaciones`** (Futura)

**Propósito**: Almacenar planeaciones didácticas generadas

**Estructura**:
```javascript
{
  docenteId: "profesor123",
  grupoId: "3A-2026",
  materia: "Matemáticas",
  fechaCreacion: "2026-01-10T19:00:00.000Z",
  adaptacionTecnologica: {
    tipo: "Híbrida",
    justificacion: "60% tiene internet, 40% no",
    sugerencias: [
      "Materiales descargables",
      "Actividades offline"
    ]
  },
  enfoquePAEC: {
    problemaSeleccionado: "Violencia",
    conexionConMateria: "Resolución de problemas matemáticos aplicados a conflictos",
    actividadesSugeridas: [
      "Análisis estadístico de violencia local",
      "Propuestas de solución basadas en datos"
    ]
  }
}
```

---

## 🔧 Plan de Acción para Solucionar el Problema

### Paso 1: Crear Proyecto de Firebase

1. **Ir a Firebase Console**
   - URL: https://console.firebase.google.com/
   - Iniciar sesión con tu cuenta de Google

2. **Crear Nuevo Proyecto**
   - Click en "Agregar proyecto"
   - Nombre: `EDUPLANMX` (o el que prefieras)
   - Desactivar Google Analytics (opcional para este proyecto)
   - Click en "Crear proyecto"

3. **Registrar App Web**
   - En la página del proyecto, click en el ícono `</>`
   - Nombre de la app: `EDUPLANMX Web`
   - NO marcar "Firebase Hosting" (ya usas GitHub Pages)
   - Click en "Registrar app"
   - **COPIAR** el objeto `firebaseConfig` que aparece

---

### Paso 2: Habilitar Firestore

1. **En el menú lateral**: Click en "Firestore Database"
2. **Click en**: "Crear base de datos"
3. **Modo**: Seleccionar "Modo de prueba" (para desarrollo)
4. **Ubicación**: `us-central1` (o la más cercana a México)
5. **Click en**: "Habilitar"

---

### Paso 3: Configurar Reglas de Seguridad

En Firestore > Reglas, pegar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Colección de alumnos
    match /alumnos/{alumnoId} {
      allow read, write: if true;  // ⚠️ Solo para desarrollo
    }
    
    // Colección de diagnósticos
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if true;
    }
    
    // Colección de planeaciones
    match /planeaciones/{planeacionId} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Estas reglas permiten acceso total. Para producción, implementar autenticación.

---

### Paso 4: Actualizar Configuración Local

**Opción A: Usar variables de entorno (Desarrollo local)**

Editar `.env.local`:
```env
# Gemini API
VITE_GEMINI_API_KEY=tu-api-key-gemini

# Firebase Config (copiar de Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=eduplanmx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eduplanmx
VITE_FIREBASE_STORAGE_BUCKET=eduplanmx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Opción B: Hardcodear en el código (Producción - GitHub Pages)**

Editar `src/config/firebase.ts`:
```typescript
const firebaseConfig = {
    apiKey: "AIzaSy...",  // ← Pegar valores reales
    authDomain: "eduplanmx.firebaseapp.com",
    projectId: "eduplanmx",
    storageBucket: "eduplanmx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

**Nota**: Es SEGURO exponer estas credenciales en el código porque Firebase usa reglas de seguridad del lado del servidor.

---

### Paso 5: Probar Conexión

```bash
# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Ejecutar en desarrollo
npm run dev

# 3. Abrir en navegador
# http://localhost:5173
```

**En la consola del navegador (F12)**, deberías ver:
- ✅ Sin errores de Firebase
- ✅ Conexión exitosa a Firestore

---

### Paso 6: Probar Guardado de Datos

1. **Ir a**: Diagnóstico > Registrar Alumno
2. **Llenar** el formulario completo
3. **Click en**: "Guardar Alumno"
4. **Verificar en Firebase Console**:
   - Firestore Database > Data
   - Colección: `alumnos`
   - Deberías ver el documento creado

---

## 📋 Checklist de Implementación

- [ ] **Crear proyecto en Firebase Console**
- [ ] **Habilitar Firestore Database**
- [ ] **Configurar reglas de seguridad**
- [ ] **Obtener credenciales (firebaseConfig)**
- [ ] **Actualizar `.env.local` con credenciales**
- [ ] **Probar en desarrollo local**
- [ ] **Actualizar `src/config/firebase.ts` con credenciales hardcodeadas**
- [ ] **Build del proyecto**: `npm run build`
- [ ] **Deploy a GitHub Pages**: `npm run deploy`
- [ ] **Probar en producción**
- [ ] **Verificar datos en Firebase Console**

---

## 🎯 Índices Recomendados para Firestore

Para mejorar el rendimiento de las consultas:

### Índice 1: Alumnos por fecha
```
Colección: alumnos
Campos: fechaRegistro (Descending)
```

### Índice 2: Alumnos por riesgo de abandono
```
Colección: alumnos
Campos: 
  - datosNEM.situacionLaboral (Ascending)
  - datosNEM.horasTrabajoSemanal (Descending)
```

**Nota**: Firestore creará automáticamente índices simples. Los índices compuestos se crean cuando los necesites.

---

## 🔒 Seguridad para Producción (Futuro)

### Reglas Mejoradas con Autenticación:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /alumnos/{alumnoId} {
      allow read, write: if request.auth != null;
    }
    
    // Solo el docente puede ver diagnósticos
    match /diagnosticos/{diagnosticoId} {
      allow read, write: if request.auth != null 
        && request.auth.token.role == 'docente';
    }
  }
}
```

---

## 📊 Monitoreo y Límites

### Cuotas Gratuitas de Firebase:
- ✅ **Lecturas**: 50,000 por día
- ✅ **Escrituras**: 20,000 por día
- ✅ **Eliminaciones**: 20,000 por día
- ✅ **Almacenamiento**: 1 GB

**Para un grupo de 30 alumnos**: Más que suficiente.

---

## 🚨 Troubleshooting

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"
**Causa**: Credenciales vacías o incorrectas
**Solución**: Verificar que `firebaseConfig` tenga todos los valores

### Error: "Missing or insufficient permissions"
**Causa**: Reglas de Firestore muy restrictivas
**Solución**: Usar las reglas de desarrollo mostradas arriba

### Error: "Failed to get document because the client is offline"
**Causa**: Sin conexión a internet
**Solución**: Verificar conexión

### Los datos NO aparecen en Firebase Console
**Causa**: Error al guardar o credenciales incorrectas
**Solución**: 
1. Abrir consola del navegador (F12)
2. Buscar errores en rojo
3. Verificar que `alumnosService.guardarAlumno()` se esté llamando

---

## ✅ Resultado Esperado

Después de completar todos los pasos:

1. ✅ **Los alumnos se guardan en Firestore** (no solo en localStorage)
2. ✅ **Puedes verlos en Firebase Console** en tiempo real
3. ✅ **Los datos persisten** entre sesiones y dispositivos
4. ✅ **El diagnóstico grupal funciona** con datos reales
5. ✅ **La aplicación funciona** tanto en local como en producción

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos sigues teniendo problemas, comparte:
1. **Captura de pantalla** de la consola del navegador (F12)
2. **Captura de pantalla** de Firebase Console (Firestore Data)
3. **El error específico** que aparece

---

**Fecha de análisis**: 2026-01-10
**Versión de Firebase**: 12.7.0
**Estado**: ⚠️ Requiere configuración de credenciales
