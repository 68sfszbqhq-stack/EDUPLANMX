# 🎯 PLAN DE IMPLEMENTACIÓN: AISLAMIENTO MULTI-ESCUELA COMPLETO

## 📊 Estado Actual

### ✅ Ya Implementado
- [x] Sistema de onboarding multi-escuela
- [x] Colección `schools` en Firestore
- [x] Colección `users` con `schoolId`
- [x] Dashboard personalizado por usuario
- [x] Contexto escolar inteligente
- [x] API keys en `.env` (no hardcodeadas) ✅

### ❌ Pendiente de Implementar
- [ ] **Servicio de Planeaciones** con filtrado por `schoolId`
- [ ] **Actualizar componentes** para usar `schoolId`
- [ ] **Reglas de Firestore** para seguridad total
- [ ] **Migración de datos** existentes

---

## 🔧 FASE 1: Crear Servicio de Planeaciones

### Archivo Nuevo: `src/services/planeacionesService.ts`

**Funciones Necesarias:**
1. `crearPlaneacion(data, userId, schoolId)` - Crear con schoolId
2. `getMisPlaneaciones(userId, schoolId)` - Para docentes
3. `getPlaneacionesEscuela(schoolId)` - Para directores
4. `actualizarPlaneacion(planId, data, userId)` - Validar ownership
5. `eliminarPlaneacion(planId, userId)` - Validar ownership

**Características:**
- ✅ Filtrado automático por `schoolId`
- ✅ Validación de permisos por rol
- ✅ Manejo de errores robusto
- ✅ TypeScript types completos

---

## 🎨 FASE 2: Actualizar Componentes

### 1. `PersonalizedDashboard.tsx`
**Cambios:**
- Importar `planeacionesService`
- Usar `getMisPlaneaciones(user.id, user.schoolId)`
- Agregar filtro por `schoolId` en query

### 2. `PlanGenerator.tsx`
**Cambios:**
- Al guardar, incluir `user.schoolId`
- Usar `crearPlaneacion()` del servicio

### 3. `PlansLibrary.tsx`
**Cambios:**
- Cargar solo planeaciones de la escuela
- Mostrar filtros por docente (si es director)

---

## 🔐 FASE 3: Reglas de Firestore

### Archivo: `firestore.rules`

**Reglas a Implementar:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== FUNCIONES HELPER =====
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
    
    // ===== PLANEACIONES =====
    match /planeaciones/{planId} {
      // Leer: Solo de tu escuela
      allow read: if belongsToSchool(resource.data.schoolId);
      
      // Crear: Solo si eres de esa escuela y eres el autor
      allow create: if isAuthenticated() 
                    && belongsToSchool(request.resource.data.schoolId)
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.schoolId != null;
      
      // Actualizar: Solo si eres el autor
      allow update: if isOwner(resource.data.userId)
                    && belongsToSchool(resource.data.schoolId);
      
      // Eliminar: Solo si eres el autor o director de la escuela
      allow delete: if isOwner(resource.data.userId) 
                    || (isDirector() && belongsToSchool(resource.data.schoolId));
    }
    
    // ===== ESCUELAS =====
    match /schools/{schoolId} {
      // Leer: Solo tu escuela
      allow read: if belongsToSchool(schoolId);
      
      // Escribir: Solo directores o super admin
      allow write: if (belongsToSchool(schoolId) && isDirector()) 
                   || isSuperAdmin();
    }
    
    // ===== USUARIOS =====
    match /users/{userId} {
      // Leer tu propio perfil siempre
      allow read: if isOwner(userId);
      
      // Leer otros de tu escuela
      allow read: if belongsToSchool(resource.data.schoolId);
      
      // Escribir solo tu perfil
      allow write: if isOwner(userId);
      
      // Super admin puede leer/escribir todo
      allow read, write: if isSuperAdmin();
    }
    
    // ===== ALUMNOS =====
    match /alumnos/{alumnoId} {
      // Solo de tu escuela
      allow read, write: if belongsToSchool(resource.data.schoolId);
    }
    
    // ===== API USAGE (Super Admin) =====
    match /api_usage/{usageId} {
      allow read, write: if isSuperAdmin();
    }
    
    match /api_quotas/{quotaId} {
      allow read, write: if isSuperAdmin();
    }
  }
}
```

---

## 📦 FASE 4: Migración de Datos

### Script: `scripts/migrateToMultiSchool.ts`

**Tareas:**
1. Buscar planeaciones sin `schoolId`
2. Asignar `schoolId` basado en `userId`
3. Validar integridad de datos
4. Generar reporte de migración

**Comando:**
```bash
npm run migrate:multi-school
```

---

## 🧪 FASE 5: Testing

### Tests a Realizar:

1. **Test de Aislamiento**
   - Usuario A no puede ver datos de Escuela B
   - Director solo ve su escuela
   - Docente solo ve sus planeaciones

2. **Test de Permisos**
   - Crear planeación con `schoolId` correcto
   - Intentar crear con `schoolId` incorrecto (debe fallar)
   - Intentar leer planeaciones de otra escuela (debe fallar)

3. **Test de Migración**
   - Verificar que todas las planeaciones tienen `schoolId`
   - Verificar que no hay datos huérfanos

---

## 📋 Checklist de Implementación

### Servicios
- [ ] Crear `planeacionesService.ts`
- [ ] Implementar `crearPlaneacion()`
- [ ] Implementar `getMisPlaneaciones()`
- [ ] Implementar `getPlaneacionesEscuela()`
- [ ] Implementar `actualizarPlaneacion()`
- [ ] Implementar `eliminarPlaneacion()`
- [ ] Agregar tipos TypeScript

### Componentes
- [ ] Actualizar `PersonalizedDashboard.tsx`
- [ ] Actualizar `PlanGenerator.tsx`
- [ ] Actualizar `PlansLibrary.tsx`
- [ ] Actualizar `App.tsx` (si necesario)

### Firestore
- [ ] Actualizar `firestore.rules`
- [ ] Desplegar reglas en Firebase Console
- [ ] Probar reglas con Firebase Emulator

### Migración
- [ ] Crear script de migración
- [ ] Ejecutar en datos de prueba
- [ ] Ejecutar en producción
- [ ] Validar resultados

### Testing
- [ ] Test de aislamiento
- [ ] Test de permisos
- [ ] Test de migración
- [ ] Test end-to-end

---

## 🚀 Orden de Implementación Recomendado

1. **Primero**: Crear `planeacionesService.ts` (base)
2. **Segundo**: Actualizar componentes para usar el servicio
3. **Tercero**: Actualizar reglas de Firestore
4. **Cuarto**: Crear y ejecutar script de migración
5. **Quinto**: Testing completo

---

## ⚠️ Consideraciones Importantes

### Seguridad
- ✅ API keys en `.env` (no hardcodeadas)
- ✅ Reglas de Firestore restrictivas
- ✅ Validación en cliente Y servidor
- ✅ Logs de auditoría (opcional)

### Performance
- Índices compuestos en Firestore:
  - `planeaciones`: `(schoolId, userId)`
  - `planeaciones`: `(schoolId, createdAt)`
  - `users`: `(schoolId, rol)`

### Backup
- Hacer backup antes de migración
- Tener plan de rollback

---

## 🎯 ¿Procedo con la Implementación?

Puedo empezar con:
1. ✅ Crear `planeacionesService.ts` completo
2. ✅ Actualizar componentes
3. ✅ Actualizar reglas de Firestore
4. ✅ Crear script de migración

**¿Comenzamos?** 🚀
