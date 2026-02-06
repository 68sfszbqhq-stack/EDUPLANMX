# 🔧 Actualización de Servicios para Multi-Escuela

## 📋 Archivos a Modificar

### **1. Servicios de Planeaciones**

Necesitamos agregar `schoolId` a todas las operaciones de planeaciones.

---

## 🎯 Cambios Necesarios

### **Archivo: `src/services/planeacionesService.ts`** (o similar)

#### **Al Crear Planeación**

**ANTES**:
```typescript
const crearPlaneacion = async (data, userId) => {
  const planeacion = {
    ...data,
    userId,
    createdAt: new Date().toISOString()
  };
  
  await firestore.collection('planeaciones').add(planeacion);
};
```

**DESPUÉS**:
```typescript
const crearPlaneacion = async (data, userId, schoolId) => {
  const planeacion = {
    ...data,
    userId,
    schoolId,  // ← NUEVO
    createdAt: new Date().toISOString()
  };
  
  await firestore.collection('planeaciones').add(planeacion);
};
```

#### **Al Listar Planeaciones**

**ANTES**:
```typescript
const getPlaneaciones = async (userId) => {
  return firestore
    .collection('planeaciones')
    .where('userId', '==', userId)
    .get();
};
```

**DESPUÉS**:
```typescript
// Para docentes: Solo sus planeaciones
const getMisPlaneaciones = async (userId, schoolId) => {
  return firestore
    .collection('planeaciones')
    .where('schoolId', '==', schoolId)  // ← NUEVO
    .where('userId', '==', userId)
    .get();
};

// Para directores: Todas las de la escuela
const getPlaneacionesEscuela = async (schoolId) => {
  return firestore
    .collection('planeaciones')
    .where('schoolId', '==', schoolId)  // ← NUEVO
    .get();
};
```

---

## 🔐 Reglas de Firestore

### **Archivo: `firestore.rules`**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Verificar si el usuario pertenece a la escuela
    function belongsToSchool(schoolId) {
      return request.auth != null 
             && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId == schoolId;
    }
    
    // Helper function: Verificar si es director
    function isDirector() {
      return request.auth != null 
             && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'directivo';
    }
    
    // Planeaciones
    match /planeaciones/{planId} {
      // Leer: Si perteneces a la misma escuela
      allow read: if belongsToSchool(resource.data.schoolId);
      
      // Crear: Solo si es tu escuela
      allow create: if request.auth != null 
                    && belongsToSchool(request.resource.data.schoolId)
                    && request.resource.data.userId == request.auth.uid;
      
      // Actualizar/Eliminar: Solo si es tuya
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid
                            && belongsToSchool(resource.data.schoolId);
    }
    
    // Escuelas
    match /schools/{schoolId} {
      // Leer: Si perteneces a esta escuela
      allow read: if belongsToSchool(schoolId);
      
      // Escribir: Solo directores de la escuela
      allow write: if belongsToSchool(schoolId) && isDirector();
    }
    
    // Usuarios
    match /users/{userId} {
      // Leer tu propio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Leer otros perfiles de tu escuela
      allow read: if request.auth != null 
                  && belongsToSchool(resource.data.schoolId);
      
      // Escribir solo tu perfil
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📊 Ejemplo de Uso

### **En el Componente de Dashboard**

```typescript
import { useAuth } from './contexts/AuthContext';
import { getPlaneacionesEscuela, getMisPlaneaciones } from './services/planeacionesService';

const Dashboard = () => {
  const { user } = useAuth();
  const [planeaciones, setPlaneaciones] = useState([]);
  
  useEffect(() => {
    const loadPlaneaciones = async () => {
      if (user.rol === 'directivo') {
        // Director: Ver todas de la escuela
        const plans = await getPlaneacionesEscuela(user.schoolId);
        setPlaneaciones(plans);
      } else {
        // Docente: Ver solo las suyas
        const plans = await getMisPlaneaciones(user.id, user.schoolId);
        setPlaneaciones(plans);
      }
    };
    
    loadPlaneaciones();
  }, [user]);
  
  return (
    <div>
      <h1>{user.schoolName}</h1>
      <p>Rol: {user.puesto}</p>
      <p>Planeaciones: {planeaciones.length}</p>
    </div>
  );
};
```

---

## ✅ Checklist de Implementación

- [ ] Actualizar servicio de planeaciones
  - [ ] Agregar `schoolId` al crear
  - [ ] Filtrar por `schoolId` al listar
  - [ ] Crear función para directores
  - [ ] Crear función para docentes

- [ ] Actualizar componentes
  - [ ] Dashboard: Usar `user.schoolId`
  - [ ] Crear Planeación: Pasar `user.schoolId`
  - [ ] Listar Planeaciones: Filtrar por escuela

- [ ] Configurar Firestore Rules
  - [ ] Copiar reglas de seguridad
  - [ ] Desplegar en Firebase Console
  - [ ] Probar permisos

- [ ] Migrar datos existentes
  - [ ] Agregar `schoolId` a planeaciones existentes
  - [ ] Script de migración

---

## 🚀 ¿Quieres que Implemente Esto?

Puedo:
1. **Actualizar servicios de planeaciones** con `schoolId`
2. **Modificar componentes** para usar el filtrado
3. **Crear reglas de Firestore** para seguridad
4. **Script de migración** para datos existentes

**¿Procedo?** 🤔
