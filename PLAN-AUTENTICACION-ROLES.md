# 🔐 Plan de Implementación: Sistema de Autenticación y Roles

## 📋 Objetivo

Implementar un sistema completo de autenticación con **4 roles de usuario**:
1. **Super Administrador** - Control total del sistema
2. **Directivo** - Gestión de la institución
3. **Maestro** - Gestión de grupos y alumnos
4. **Alumno** - Acceso a su información (futuro)

---

## 🎯 Arquitectura del Sistema

### Roles y Permisos

| Rol | Permisos | Acceso |
|-----|----------|--------|
| **Super Admin** | • Crear/editar/eliminar usuarios<br>• Asignar roles<br>• Ver todas las instituciones<br>• Configuración global | Todo el sistema |
| **Directivo** | • Ver su institución<br>• Gestionar maestros<br>• Ver reportes generales<br>• Aprobar planeaciones | Su institución |
| **Maestro** | • Gestionar sus grupos<br>• Registrar alumnos<br>• Generar diagnósticos<br>• Crear planeaciones | Sus grupos |
| **Alumno** | • Ver su información<br>• Actualizar datos<br>• Ver retroalimentación | Su perfil |

---

## 🗄️ Estructura de Base de Datos

### 1. Colección: `usuarios`

```javascript
{
  id: "user123",
  email: "maestro@escuela.edu.mx",
  nombre: "Juan Pérez",
  apellidoPaterno: "Pérez",
  apellidoMaterno: "García",
  rol: "maestro", // "superadmin" | "directivo" | "maestro" | "alumno"
  
  // Datos específicos por rol
  institucionId: "inst001", // Para directivos y maestros
  gruposAsignados: ["3A", "3B"], // Solo maestros
  
  // Metadata
  activo: true,
  fechaCreacion: "2026-01-10T...",
  ultimoAcceso: "2026-01-10T...",
  creadoPor: "superadmin123"
}
```

### 2. Colección: `instituciones`

```javascript
{
  id: "inst001",
  nombre: "Bachillerato General Oficial No. 1",
  clave: "BGO001",
  direccion: {
    calle: "...",
    ciudad: "...",
    estado: "...",
    codigoPostal: "..."
  },
  directivoId: "user456",
  maestros: ["user123", "user789"],
  activa: true,
  fechaCreacion: "2026-01-10T..."
}
```

### 3. Colección: `grupos`

```javascript
{
  id: "grupo001",
  nombre: "3A",
  grado: 3,
  grupo: "A",
  institucionId: "inst001",
  maestroId: "user123",
  alumnos: ["alumno1", "alumno2", "alumno3"],
  cicloEscolar: "2025-2026",
  activo: true
}
```

### 4. Actualizar Colección: `alumnos`

```javascript
{
  id: "alumno123",
  // ... datos existentes ...
  
  // NUEVOS CAMPOS:
  grupoId: "grupo001",
  institucionId: "inst001",
  usuarioId: "user999", // Si el alumno tiene cuenta
  activo: true
}
```

---

## 🔧 Implementación Técnica

### Fase 1: Firebase Authentication (Semana 1)

#### 1.1 Configurar Firebase Auth
```typescript
// src/config/firebase.ts
import { getAuth } from 'firebase/auth';

export const auth = getAuth(app);
```

#### 1.2 Crear Servicio de Autenticación
```typescript
// src/services/authService.ts
class AuthService {
  // Login con email/password
  async login(email: string, password: string)
  
  // Logout
  async logout()
  
  // Obtener usuario actual
  getCurrentUser()
  
  // Verificar rol
  async getUserRole(uid: string)
  
  // Crear usuario (solo admin)
  async createUser(userData)
}
```

#### 1.3 Context de Autenticación
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
}
```

---

### Fase 2: Sistema de Roles (Semana 2)

#### 2.1 Tipos de Roles
```typescript
// types/auth.ts
export type UserRole = 'superadmin' | 'directivo' | 'maestro' | 'alumno';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: UserRole;
  institucionId?: string;
  gruposAsignados?: string[];
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso: string;
}
```

#### 2.2 Guards de Ruta
```typescript
// components/ProtectedRoute.tsx
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => {
  const { user, userRole } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(userRole)) return <Unauthorized />;
  
  return children;
};
```

---

### Fase 3: Interfaces por Rol (Semana 3)

#### 3.1 Dashboard Super Admin
- Gestión de instituciones
- Gestión de usuarios
- Estadísticas globales
- Configuración del sistema

#### 3.2 Dashboard Directivo
- Vista de su institución
- Gestión de maestros
- Reportes institucionales
- Aprobación de planeaciones

#### 3.3 Dashboard Maestro (Actual)
- Gestión de grupos
- Registro de alumnos
- Diagnósticos
- Planeaciones

#### 3.4 Dashboard Alumno (Futuro)
- Ver su información
- Actualizar datos
- Ver retroalimentación

---

### Fase 4: Reglas de Seguridad Firestore (Semana 4)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && getUserData().rol == 'superadmin';
    }
    
    function isDirectivo() {
      return isAuthenticated() && getUserData().rol == 'directivo';
    }
    
    function isMaestro() {
      return isAuthenticated() && getUserData().rol == 'maestro';
    }
    
    // Usuarios - Solo superadmin puede crear/editar
    match /usuarios/{userId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isSuperAdmin();
    }
    
    // Instituciones
    match /instituciones/{institucionId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isSuperAdmin();
    }
    
    // Grupos - Maestros pueden ver sus grupos
    match /grupos/{grupoId} {
      allow read: if isAuthenticated();
      allow create, update: if isMaestro() || isDirectivo();
      allow delete: if isSuperAdmin() || isDirectivo();
    }
    
    // Alumnos - Maestros pueden gestionar alumnos de sus grupos
    match /alumnos/{alumnoId} {
      allow read: if isAuthenticated();
      allow create, update: if isMaestro() || isDirectivo();
      allow delete: if isSuperAdmin() || isDirectivo();
    }
    
    // Diagnósticos
    match /diagnosticos/{diagnosticoId} {
      allow read: if isAuthenticated();
      allow create, update: if isMaestro();
      allow delete: if isSuperAdmin() || isDirectivo();
    }
    
    // Planeaciones
    match /planeaciones/{planeacionId} {
      allow read: if isAuthenticated();
      allow create, update: if isMaestro();
      allow delete: if isSuperAdmin() || isDirectivo();
    }
  }
}
```

---

## 🎨 Componentes a Crear

### 1. Autenticación
- [ ] `pages/Login.tsx` - Página de inicio de sesión
- [ ] `pages/Register.tsx` - Registro (solo para super admin)
- [ ] `components/AuthGuard.tsx` - Protección de rutas
- [ ] `contexts/AuthContext.tsx` - Context de autenticación

### 2. Gestión de Usuarios (Super Admin)
- [ ] `pages/admin/Usuarios.tsx` - Lista de usuarios
- [ ] `components/admin/FormularioUsuario.tsx` - Crear/editar usuario
- [ ] `components/admin/AsignarRol.tsx` - Asignar rol

### 3. Gestión de Instituciones (Super Admin)
- [ ] `pages/admin/Instituciones.tsx` - Lista de instituciones
- [ ] `components/admin/FormularioInstitucion.tsx` - Crear/editar institución

### 4. Dashboard Directivo
- [ ] `pages/directivo/Dashboard.tsx` - Vista principal
- [ ] `components/directivo/GestionMaestros.tsx` - Gestionar maestros
- [ ] `components/directivo/ReportesInstitucionales.tsx` - Reportes

### 5. Actualizar Dashboard Maestro
- [ ] Agregar selector de grupo
- [ ] Filtrar alumnos por grupo
- [ ] Mostrar solo sus grupos asignados

---

## 📊 Flujo de Usuario

### Primer Uso (Setup Inicial)

```
1. Super Admin se registra (único usuario inicial)
   ↓
2. Super Admin crea institución
   ↓
3. Super Admin crea usuario Directivo
   ↓
4. Directivo crea usuarios Maestros
   ↓
5. Maestros crean grupos
   ↓
6. Maestros registran alumnos
```

### Flujo Normal

```
Usuario abre app
   ↓
¿Está autenticado?
   ├─ No → Redirigir a /login
   └─ Sí → Verificar rol
           ├─ Super Admin → /admin/dashboard
           ├─ Directivo → /directivo/dashboard
           ├─ Maestro → /maestro/dashboard
           └─ Alumno → /alumno/dashboard
```

---

## 🚀 Plan de Implementación (4 Semanas)

### Semana 1: Autenticación Base
- [x] Configurar Firebase Authentication
- [ ] Crear servicio de autenticación
- [ ] Crear página de login
- [ ] Crear AuthContext
- [ ] Implementar logout

### Semana 2: Sistema de Roles
- [ ] Crear colección `usuarios` en Firestore
- [ ] Implementar guards de ruta
- [ ] Crear tipos de roles
- [ ] Implementar verificación de permisos

### Semana 3: Interfaces por Rol
- [ ] Dashboard Super Admin
- [ ] Dashboard Directivo
- [ ] Actualizar Dashboard Maestro
- [ ] Gestión de usuarios

### Semana 4: Seguridad y Refinamiento
- [ ] Implementar reglas de Firestore
- [ ] Pruebas de seguridad
- [ ] Documentación
- [ ] Deploy

---

## 🔐 Consideraciones de Seguridad

### 1. Passwords
- Usar Firebase Authentication (maneja hashing automáticamente)
- Requerir contraseñas fuertes (mínimo 8 caracteres)
- Implementar recuperación de contraseña

### 2. Tokens
- Firebase maneja tokens JWT automáticamente
- Tokens expiran después de 1 hora
- Refresh automático en background

### 3. Reglas de Firestore
- Validar en servidor (reglas de Firestore)
- No confiar solo en validación del cliente
- Implementar rate limiting

### 4. Datos Sensibles
- No exponer información de otros usuarios
- Encriptar datos sensibles
- Logs de auditoría para cambios críticos

---

## 📝 Datos Iniciales (Seed Data)

### Super Admin Inicial
```javascript
{
  email: "admin@eduplanmx.com",
  password: "Admin123!",
  nombre: "Super",
  apellidoPaterno: "Administrador",
  apellidoMaterno: "Sistema",
  rol: "superadmin",
  activo: true
}
```

### Institución de Prueba
```javascript
{
  nombre: "Bachillerato General Oficial No. 1",
  clave: "BGO001",
  direccion: {
    calle: "Av. Principal 123",
    ciudad: "Ciudad de México",
    estado: "CDMX",
    codigoPostal: "01000"
  }
}
```

---

## 🎯 Resultado Final

Al completar este plan, tendrás:

✅ Sistema de autenticación completo  
✅ 4 roles de usuario con permisos específicos  
✅ Dashboards personalizados por rol  
✅ Gestión de instituciones y usuarios  
✅ Seguridad robusta con reglas de Firestore  
✅ Flujo completo de registro y login  
✅ Protección de rutas y datos  

---

## 📚 Tecnologías a Usar

- **Firebase Authentication** - Autenticación de usuarios
- **Firestore** - Base de datos con reglas de seguridad
- **React Context** - Manejo de estado de autenticación
- **React Router** - Protección de rutas
- **TypeScript** - Tipado fuerte para roles y permisos

---

## ⏱️ Tiempo Estimado

- **Implementación completa**: 4 semanas
- **MVP (login + roles básicos)**: 1 semana
- **Testing y refinamiento**: 1 semana adicional

---

**¿Quieres que comience con la Semana 1 (Autenticación Base)?** 🚀
