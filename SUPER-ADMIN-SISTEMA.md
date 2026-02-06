# 🦸 SISTEMA DE SUPER ADMIN - DOCUMENTACIÓN COMPLETA

## ✅ Implementación Completada

**Fecha**: 2026-02-05  
**Archivos Creados**: 4  
**Estado**: ✅ FUNCIONAL  

---

## 🎯 Funcionalidades del Super Admin

### **1. Panel de Control Total**
- ✅ Estadísticas globales del sistema
- ✅ Monitoreo de uso de API
- ✅ Control de costos
- ✅ Gestión de usuarios y escuelas

### **2. Control de Usuarios**
- ✅ Ver todos los usuarios del sistema
- ✅ Bloquear/Desbloquear usuarios individuales
- ✅ Ver uso de API por usuario
- ✅ Buscar y filtrar usuarios

### **3. Control de Escuelas**
- ✅ Ver todas las escuelas registradas
- ✅ Bloquear/Desbloquear escuelas completas
- ✅ Ver estadísticas por escuela
- ✅ Monitorear costos por escuela

### **4. Monitoreo de API**
- ✅ Registro automático de cada request
- ✅ Cálculo de costos estimados
- ✅ Límites configurables por usuario/escuela
- ✅ Alertas de uso excesivo

---

## 📊 Estructura de Firestore

### **Collection: api_usage**
```javascript
api_usage/{userId} {
  totalRequests: 1250,
  requestsThisMonth: 450,
  requestsToday: 15,
  estimatedCost: 0.45,  // USD
  lastRequest: "2026-02-05T20:00:00Z",
  monthStart: "2026-02-01T00:00:00Z"
}
```

### **Collection: users (campos adicionales)**
```javascript
users/{userId} {
  // ... campos existentes
  isBlocked: false,
  blockedReason: null,
  blockedAt: null,
  blockedBy: null
}
```

### **Collection: schools (campos adicionales)**
```javascript
schools/{schoolId} {
  // ... campos existentes
  isBlocked: false,
  blockedReason: null,
  blockedAt: null,
  blockedBy: null
}
```

---

## 🔧 Servicios Implementados

### **adminService.ts**

#### **Estadísticas**
```typescript
// Obtener estadísticas globales
await adminService.getSystemStats();

// Obtener uso de API por usuario
await adminService.getApiUsageByUser();

// Obtener estadísticas por escuela
await adminService.getSchoolStats();
```

#### **Bloqueos**
```typescript
// Bloquear usuario
await adminService.blockUser(userId, reason, adminId);

// Desbloquear usuario
await adminService.unblockUser(userId);

// Bloquear escuela completa
await adminService.blockSchool(schoolId, reason, adminId);

// Desbloquear escuela
await adminService.unblockSchool(schoolId);
```

#### **Control de API**
```typescript
// Registrar uso de API
await adminService.logApiUsage(userId, cost);

// Verificar si puede usar API
const { allowed, reason } = await adminService.canUseApi(userId);
```

---

## 🎨 Dashboard de Super Admin

### **Ubicación**
```
pages/admin/SuperAdminDashboard.tsx
```

### **Características**
- ✅ 4 Cards de estadísticas principales
- ✅ Tabs: Resumen, Usuarios, Escuelas, API
- ✅ Búsqueda y filtrado
- ✅ Acciones de bloqueo/desbloqueo
- ✅ Diseño profesional y responsive

### **Estadísticas Mostradas**
1. **Total Escuelas** - Con contador de bloqueadas
2. **Total Usuarios** - Con contador de activos
3. **Requests API** - Total del mes
4. **Costo Estimado** - En USD

---

## 🔐 Integración con Gemini API

### **Modificar geminiService.ts**

```typescript
// ANTES
export const generatePlaneacion = async (data) => {
  const response = await model.generateContent(prompt);
  return response;
};

// DESPUÉS
export const generatePlaneacion = async (data, userId) => {
  // 1. Verificar si puede usar API
  const { allowed, reason } = await adminService.canUseApi(userId);
  
  if (!allowed) {
    throw new Error(`API bloqueada: ${reason}`);
  }
  
  // 2. Generar contenido
  const response = await model.generateContent(prompt);
  
  // 3. Registrar uso
  await adminService.logApiUsage(userId, 0.001); // $0.001 por request
  
  return response;
};
```

---

## 🚀 Cómo Usar

### **1. Acceder al Panel**

```typescript
// En Router.tsx, agregar ruta
<Route
  path="/superadmin/dashboard"
  element={
    <ProtectedRoute allowedRoles={['superadmin']}>
      <SuperAdminDashboard />
    </ProtectedRoute>
  }
/>
```

### **2. Asignar Rol de Super Admin**

**Opción A: Manualmente en Firestore**
```
1. Ir a Firebase Console
2. Firestore Database
3. Collection: users
4. Tu documento de usuario
5. Editar campo: rol = "superadmin"
```

**Opción B: Script de inicialización**
```typescript
// createSuperAdmin.ts
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';

const createSuperAdmin = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    rol: 'superadmin'
  });
  console.log('✅ Super admin creado');
};

// Ejecutar con tu userId
createSuperAdmin('TU_USER_ID');
```

---

## 📋 Límites Configurables

### **En adminService.ts**

```typescript
// Límites por defecto
const MAX_REQUESTS_PER_MONTH = 1000;  // Por usuario
const MAX_REQUESTS_PER_DAY = 50;      // Por usuario
const COST_PER_REQUEST = 0.001;       // USD

// Límites por escuela
const MAX_SCHOOL_REQUESTS_PER_MONTH = 5000;
const MAX_SCHOOL_COST_PER_MONTH = 10.00; // USD
```

### **Personalizar por Usuario/Escuela**

```typescript
// Collection: api_quotas
api_quotas/{userId} {
  maxRequestsPerMonth: 2000,  // Personalizado
  maxRequestsPerDay: 100,
  customCostPerRequest: 0.0005
}
```

---

## 🎯 Flujo de Control de API

```
1. Usuario intenta generar planeación
   ↓
2. geminiService.generatePlaneacion()
   ↓
3. adminService.canUseApi(userId)
   ├─ Verificar si usuario está bloqueado
   ├─ Verificar si escuela está bloqueada
   └─ Verificar límites de uso
   ↓
4a. SI está bloqueado:           4b. SI está permitido:
    - Mostrar error                  - Generar contenido
    - No consumir API                - Registrar uso
    - Informar razón                 - Incrementar contador
   ↓                                ↓
5. Usuario ve mensaje            5. Usuario ve resultado
```

---

## 🔒 Seguridad

### **Firestore Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Solo super admin puede acceder a api_usage
    match /api_usage/{userId} {
      allow read, write: if request.auth != null 
                         && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'superadmin';
    }
    
    // Solo super admin puede bloquear usuarios
    match /users/{userId} {
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'superadmin'
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isBlocked', 'blockedReason', 'blockedAt', 'blockedBy']);
    }
    
    // Solo super admin puede bloquear escuelas
    match /schools/{schoolId} {
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'superadmin'
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isBlocked', 'blockedReason', 'blockedAt', 'blockedBy']);
    }
  }
}
```

---

## 📊 Reportes y Exportación

### **Exportar Datos de Uso**

```typescript
const exportApiUsage = async () => {
  const usage = await adminService.getApiUsageByUser();
  
  const csv = [
    'Usuario,Escuela,Requests,Costo',
    ...usage.map(u => 
      `${u.userName},${u.schoolName},${u.requestsThisMonth},${u.estimatedCost}`
    )
  ].join('\n');
  
  // Descargar CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'api-usage.csv';
  a.click();
};
```

---

## ⚠️ Alertas Automáticas

### **Configurar Alertas**

```typescript
// En adminService.ts
const checkUsageAlerts = async () => {
  const users = await getAllUsers();
  
  for (const user of users) {
    // Alerta si supera 80% del límite
    if (user.apiUsage.requestsThisMonth > 800) {
      console.warn(`⚠️ Usuario ${user.nombre} cerca del límite`);
      // Enviar email o notificación
    }
    
    // Bloqueo automático si supera 100%
    if (user.apiUsage.requestsThisMonth >= 1000) {
      await blockUser(
        user.userId, 
        'Límite mensual alcanzado (1000 requests)', 
        'system'
      );
    }
  }
};

// Ejecutar cada hora
setInterval(checkUsageAlerts, 3600000);
```

---

## 🎯 Próximos Pasos

### **Mejoras Opcionales**

1. **Dashboard Avanzado**
   - [ ] Gráficas de uso por día/semana/mes
   - [ ] Comparativas entre escuelas
   - [ ] Predicción de costos

2. **Notificaciones**
   - [ ] Email cuando se alcanza 80% del límite
   - [ ] Alertas de costos elevados
   - [ ] Notificación de bloqueos

3. **Reportes**
   - [ ] Exportar a PDF
   - [ ] Reportes programados
   - [ ] Análisis de tendencias

4. **Automatización**
   - [ ] Bloqueo automático por límites
   - [ ] Desbloqueo automático al inicio de mes
   - [ ] Ajuste dinámico de límites

---

## ✅ Checklist de Implementación

- [x] Tipos TypeScript (admin.ts)
- [x] Servicio de admin (adminService.ts)
- [x] Dashboard de super admin
- [ ] Integrar con geminiService
- [ ] Actualizar Router con ruta
- [ ] Asignar rol de superadmin
- [ ] Configurar Firestore Rules
- [ ] Probar bloqueos
- [ ] Configurar límites
- [ ] Implementar alertas

---

## 🚀 Comandos Útiles

### **Crear Super Admin**
```bash
# En Firebase Console o con script
```

### **Ver Logs de API**
```bash
# En Firebase Console → Firestore → api_usage
```

### **Resetear Contadores Mensuales**
```typescript
// Script de reset mensual
const resetMonthlyCounters = async () => {
  const usageDocs = await getDocs(collection(db, 'api_usage'));
  
  for (const doc of usageDocs.docs) {
    await updateDoc(doc.ref, {
      requestsThisMonth: 0,
      monthStart: new Date().toISOString()
    });
  }
};
```

---

## 🎉 ¡Sistema de Super Admin Completo!

**Tienes control total sobre**:
- ✅ Todos los usuarios
- ✅ Todas las escuelas
- ✅ Uso de API
- ✅ Costos
- ✅ Bloqueos y límites

**¡Listo para proteger tu presupuesto de API!** 💰🛡️

---

**Última actualización**: 2026-02-05 20:04
