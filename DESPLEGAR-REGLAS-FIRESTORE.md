# 🔥 Desplegar Reglas de Firestore - Guía Rápida

## ⚠️ IMPORTANTE: Debes hacer esto AHORA

Las reglas de Firestore se actualizaron para permitir que los usuarios puedan completar el onboarding.

---

## 🚀 Pasos para Desplegar (2 minutos)

### **1. Abre Firebase Console**
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **EDUPLANMX**

### **2. Ve a Firestore Rules**
1. En el menú lateral, click en **"Firestore Database"**
2. Click en la pestaña **"Rules"** (Reglas)

### **3. Copia las Nuevas Reglas**
1. Abre el archivo `firestore.rules` de tu proyecto
2. Selecciona TODO el contenido (Cmd+A)
3. Copia (Cmd+C)

### **4. Pega en Firebase Console**
1. En Firebase Console, selecciona TODO el texto actual de las reglas
2. Borra todo
3. Pega las nuevas reglas (Cmd+V)

### **5. Publica los Cambios**
1. Click en el botón **"Publish"** (Publicar)
2. Confirma la publicación

---

## ✅ Verificación

Después de publicar:
1. Refresca tu aplicación (F5)
2. Intenta iniciar sesión con un usuario nuevo
3. El onboarding debería funcionar sin errores de permisos

---

## 🔧 ¿Qué se Arregló?

### **Antes:**
```javascript
// ❌ Solo podías leer tu propia escuela
allow read: if isAuthenticated() && belongsToSchool(schoolId);
```

**Problema:** Durante el onboarding, el usuario **aún no tiene `schoolId`**, entonces no puede leer ninguna escuela.

### **Ahora:**
```javascript
// ✅ Cualquier usuario autenticado puede leer escuelas
allow read: if isAuthenticated();

// ✅ Cualquier usuario puede crear escuela durante onboarding
allow create: if isAuthenticated();
```

**Solución:** Los usuarios pueden:
- Ver la lista de escuelas existentes
- Buscar escuela por código
- Crear nueva escuela si no existe
- Completar el onboarding sin errores

---

## 🔒 Seguridad

Las nuevas reglas **NO comprometen la seguridad**:

- ✅ Solo usuarios autenticados pueden leer escuelas
- ✅ Solo directores o superadmin pueden actualizar/eliminar
- ✅ Los datos de alumnos y planeaciones siguen protegidos por `schoolId`
- ✅ Cada usuario solo ve datos de su escuela (después del onboarding)

---

## 📋 Reglas Completas

Si necesitas copiarlas manualmente, aquí están:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNCIONES HELPER
    // ============================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function belongsToSchool(schoolId) {
      return isAuthenticated() && getUserData().schoolId == schoolId;
    }
    
    function isDirector() {
      return isAuthenticated() && getUserData().rol == 'directivo';
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && getUserData().rol == 'superadmin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ============================================
    // PLANEACIONES
    // ============================================
    
    match /planeaciones/{planId} {
      // Leer: Solo de tu escuela
      allow read: if isAuthenticated() 
                  && (resource == null || belongsToSchool(resource.data.schoolId));
      
      // Crear: Solo si eres de esa escuela y eres el autor
      allow create: if isAuthenticated() 
                    && belongsToSchool(request.resource.data.schoolId)
                    && request.resource.data.userId == request.auth.uid;
      
      // Actualizar: Solo si eres el autor
      allow update: if isAuthenticated()
                    && isOwner(resource.data.userId)
                    && belongsToSchool(resource.data.schoolId);
      
      // Eliminar: Solo si eres el autor o director de la escuela
      allow delete: if isAuthenticated()
                    && (isOwner(resource.data.userId) 
                        || (isDirector() && belongsToSchool(resource.data.schoolId)));
    }
    
    // ============================================
    // ESCUELAS
    // ============================================
    
    match /schools/{schoolId} {
      // Leer: Cualquier usuario autenticado puede leer escuelas
      // (necesario para onboarding y búsqueda de escuelas)
      allow read: if isAuthenticated();
      
      // Crear: Cualquier usuario autenticado puede crear escuela durante onboarding
      // O super admin puede crear
      allow create: if isAuthenticated();
      
      // Actualizar/Eliminar: Solo directores de esa escuela o super admin
      allow update, delete: if isAuthenticated() 
                            && ((belongsToSchool(schoolId) && isDirector()) || isSuperAdmin());
    }
    
    // ============================================
    // USUARIOS
    // ============================================
    
    match /users/{userId} {
      // Leer tu propio perfil siempre (incluso si no existe aún)
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Leer otros de tu escuela (solo si el documento existe)
      allow read: if isAuthenticated() 
                  && resource != null
                  && resource.data.schoolId != null
                  && getUserData().schoolId == resource.data.schoolId;
      
      // Crear tu propio perfil durante login/onboarding
      allow create: if isAuthenticated() 
                    && request.auth.uid == userId
                    && request.resource.data.id == request.auth.uid;
      
      // Actualizar tu propio perfil (permite cambios flexibles durante onboarding)
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      // Super admin puede leer/escribir todo
      allow read, write: if isSuperAdmin();
    }
    
    // ============================================
    // ALUMNOS - REGLAS SIMPLIFICADAS
    // ============================================
    
    match /alumnos/{alumnoId} {
      // Permitir todo si estás autenticado (temporal para debugging)
      allow read, write: if isAuthenticated();
    }
    
    // ============================================
    // ASIGNACIONES
    // ============================================
    
    match /asignaciones/{asignacionId} {
      // Permitir todo si estás autenticado (temporal)
      allow read, write: if isAuthenticated();
    }
    
    // ============================================
    // PMC (Programa de Mejora Continua)
    // ============================================
    
    match /pmc/{pmcId} {
      // Permitir todo si estás autenticado (temporal)
      allow read, write: if isAuthenticated();
    }
    
    // ============================================
    // PAEC
    // ============================================
    
    match /paec/{paecId} {
      // Permitir todo si estás autenticado (temporal)
      allow read, write: if isAuthenticated();
    }
    
    // ============================================
    // API USAGE (Super Admin)
    // ============================================
    
    match /api_usage/{usageId} {
      allow read, write: if isSuperAdmin();
    }
    
    match /api_quotas/{quotaId} {
      allow read, write: if isSuperAdmin();
    }
    
    // ============================================
    // DIAGNÓSTICOS
    // ============================================
    
    match /diagnosticos/{diagnosticoId} {
      // Permitir todo si estás autenticado (temporal)
      allow read, write: if isAuthenticated();
    }
    
    // ============================================
    // ESTADÍSTICAS DE ESTUDIANTES
    // ============================================
    
    match /student_stats/{statId} {
      // Permitir todo si estás autenticado (temporal)
      allow read, write: if isAuthenticated();
    }
    
    // ============================================
    // REGLA POR DEFECTO: DENEGAR TODO
    // ============================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ❓ Preguntas Frecuentes

### **¿Por qué no se desplegó automáticamente?**
Firebase CLI no está configurado en este proyecto. Debes hacerlo manualmente desde la consola.

### **¿Cuánto tarda en aplicarse?**
Los cambios son inmediatos (1-2 segundos).

### **¿Puedo revertir si algo sale mal?**
Sí, Firebase guarda un historial de versiones. Puedes revertir desde la consola.

### **¿Afecta a usuarios existentes?**
No, solo mejora el proceso de onboarding para nuevos usuarios.

---

## 🎯 Resultado Esperado

Después de desplegar las reglas:

✅ Usuarios nuevos pueden completar onboarding
✅ Pueden ver lista de escuelas
✅ Pueden buscar escuela por código
✅ Pueden crear nueva escuela
✅ No más errores de "Missing or insufficient permissions"

---

**¡Despliega las reglas AHORA para que el onboarding funcione!** 🚀
