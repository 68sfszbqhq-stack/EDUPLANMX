# 🔧 Integración de Onboarding con AuthContext

## 📍 Archivo a Modificar

```
src/contexts/AuthContext.tsx
```

---

## 🎯 Cambios Necesarios

### **1. Importar Dependencias**

```typescript
// Agregar estas importaciones al inicio del archivo
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../services/schoolService';
```

### **2. Modificar el useEffect**

**ANTES** (líneas 12-31):
```typescript
useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const userData = await authService.getUserData(firebaseUser.uid);
                setUser(userData);
            } catch (error) {
                console.error('Error al cargar datos del usuario:', error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
}, []);
```

**DESPUÉS** (con verificación de onboarding):
```typescript
useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            try {
                // 1. Obtener datos básicos del usuario
                const userData = await authService.getUserData(firebaseUser.uid);
                
                // 2. Verificar si completó el onboarding
                const needsOnboarding = await schoolService.needsOnboarding(firebaseUser.uid);
                
                if (needsOnboarding) {
                    // Usuario nuevo o sin onboarding completo
                    console.log('Usuario necesita completar onboarding');
                    setUser({
                        ...userData,
                        onboardingCompleto: false
                    });
                } else {
                    // Usuario con onboarding completo - cargar perfil completo
                    const profile = await schoolService.getUserProfile(firebaseUser.uid);
                    setUser({
                        ...userData,
                        schoolId: profile?.schoolId,
                        schoolName: profile?.schoolName,
                        puesto: profile?.puesto,
                        onboardingCompleto: true
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos del usuario:', error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => unsubscribe();
}, []);
```

---

## 🔄 Flujo Completo

```
1. Usuario hace login con Google
   ↓
2. AuthContext detecta el login
   ↓
3. Verifica si needsOnboarding()
   ↓
4a. SI necesita onboarding:          4b. NO necesita onboarding:
    - setUser({ onboardingCompleto: false })    - Cargar perfil completo
    - RoleBasedRedirect detecta esto            - setUser({ ...profile })
    - Redirige a /onboarding                    - Redirige a dashboard
   ↓
5. Usuario completa onboarding
   ↓
6. OnboardingContainer guarda perfil
   ↓
7. Redirige a dashboard
   ↓
8. AuthContext recarga con perfil completo
```

---

## 📊 Actualizar Tipos

También necesitamos actualizar el tipo `Usuario` para incluir los nuevos campos:

**Archivo**: `types/auth.ts`

```typescript
export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    rol: 'superadmin' | 'directivo' | 'maestro' | 'alumno';
    
    // NUEVOS CAMPOS
    schoolId?: string;
    schoolName?: string;
    puesto?: string;
    onboardingCompleto?: boolean;
    
    // Campos existentes
    activo: boolean;
    fechaCreacion: string;
    ultimoAcceso: string;
}
```

---

## 🎯 Modificar RoleBasedRedirect

**Archivo**: `Router.tsx`

**ANTES**:
```typescript
const RoleBasedRedirect: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirigir según el rol
    switch (user.rol) {
        case 'superadmin':
            return <Navigate to="/admin/dashboard" replace />;
        // ... otros casos
    }
};
```

**DESPUÉS** (con verificación de onboarding):
```typescript
const RoleBasedRedirect: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // NUEVO: Verificar onboarding
    if (!user.onboardingCompleto) {
        return <Navigate to="/onboarding" replace />;
    }

    // Redirigir según el rol
    switch (user.rol) {
        case 'superadmin':
            return <Navigate to="/admin/dashboard" replace />;
        // ... otros casos
    }
};
```

---

## ✅ Checklist de Integración

- [ ] Actualizar `src/contexts/AuthContext.tsx`
  - [ ] Importar `schoolService`
  - [ ] Modificar `useEffect` para verificar onboarding
  - [ ] Cargar perfil completo si onboarding está completo

- [ ] Actualizar `types/auth.ts`
  - [ ] Agregar campos: `schoolId`, `schoolName`, `puesto`, `onboardingCompleto`

- [ ] Actualizar `Router.tsx`
  - [ ] Modificar `RoleBasedRedirect` para verificar onboarding
  - [ ] Redirigir a `/onboarding` si no está completo

- [ ] Probar flujo completo
  - [ ] Login con usuario nuevo → debe ir a onboarding
  - [ ] Completar onboarding → debe ir a dashboard
  - [ ] Login con usuario existente → debe ir directo a dashboard

---

## 🚀 ¿Quieres que Haga Estos Cambios?

Puedo:
1. **Modificar AuthContext** para verificar onboarding
2. **Actualizar tipos** en `auth.ts`
3. **Modificar RoleBasedRedirect** para redirigir correctamente
4. **Probar** el flujo completo

**¿Procedo con las modificaciones?** 🤔
