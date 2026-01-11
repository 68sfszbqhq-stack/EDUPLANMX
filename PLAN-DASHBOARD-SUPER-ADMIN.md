# 🚀 Implementación: Dashboard Super Admin - Plan de Trabajo

## 📋 Resumen

Implementaremos las funcionalidades completas del Super Administrador en 4 módulos principales.

---

## 🎯 Módulo 1: Dashboard de Super Admin

### Componentes a Crear:
- [ ] `pages/admin/Dashboard.tsx` - Dashboard principal
- [ ] `components/admin/StatsCard.tsx` - Tarjetas de estadísticas
- [ ] `components/admin/ActivityFeed.tsx` - Feed de actividad reciente
- [ ] `components/admin/AlertsPanel.tsx` - Panel de alertas

### Funcionalidades:
- Estadísticas globales (instituciones, maestros, alumnos, grupos)
- Actividad reciente del sistema
- Alertas importantes (alumnos en riesgo, maestros inactivos)
- Gráficas de uso

---

## 🎯 Módulo 2: Gestión de Usuarios

### Componentes a Crear:
- [ ] `pages/admin/Usuarios.tsx` - Lista de usuarios
- [ ] `components/admin/TablaUsuarios.tsx` - Tabla con usuarios
- [ ] `components/admin/FormularioUsuario.tsx` - Crear/editar usuario
- [ ] `components/admin/ModalCambiarRol.tsx` - Cambiar rol de usuario
- [ ] `components/admin/FiltrosUsuarios.tsx` - Filtros (por rol, institución, etc.)

### Funcionalidades:
- Ver lista de todos los usuarios
- Filtrar por rol, institución, estado
- Buscar por nombre o email
- Crear nuevo usuario (con email/password)
- Editar usuario existente
- Cambiar rol de usuario
- Activar/desactivar usuario
- Eliminar usuario (con confirmación)
- Ver último acceso

---

## 🎯 Módulo 3: Catálogo de Materias

### Tipos a Crear:
```typescript
interface Materia {
  id: string;
  nombre: string;
  clave: string;
  grado: 1 | 2 | 3;
  horasSemanales: number;
  proposito: string;
  contenido: string;
  activa: boolean;
  fechaCreacion: string;
}
```

### Componentes a Crear:
- [ ] `pages/admin/Materias.tsx` - Lista de materias
- [ ] `components/admin/TablaMaterias.tsx` - Tabla con materias
- [ ] `components/admin/FormularioMateria.tsx` - Crear/editar materia
- [ ] `components/admin/FiltrosMaterias.tsx` - Filtros por grado

### Funcionalidades:
- Ver catálogo de materias
- Filtrar por grado
- Crear nueva materia
- Editar materia existente
- Activar/desactivar materia
- Eliminar materia

---

## 🎯 Módulo 4: Asignación de Materias a Maestros

### Tipos a Crear:
```typescript
interface AsignacionMateria {
  id: string;
  maestroId: string;
  materiaId: string;
  gruposIds: string[];
  cicloEscolar: string;
  activa: boolean;
  fechaCreacion: string;
}
```

### Componentes a Crear:
- [ ] `pages/admin/AsignacionMaterias.tsx` - Página principal
- [ ] `components/admin/SelectorMaestro.tsx` - Seleccionar maestro
- [ ] `components/admin/SelectorMateria.tsx` - Seleccionar materia
- [ ] `components/admin/SelectorGrupos.tsx` - Seleccionar grupos
- [ ] `components/admin/TablaAsignaciones.tsx` - Ver asignaciones existentes
- [ ] `components/admin/VistaHorario.tsx` - Ver horario del maestro

### Funcionalidades:
- Asignar materia a maestro
- Seleccionar grupos para la asignación
- Ver asignaciones por maestro
- Ver asignaciones por materia
- Ver asignaciones por grupo
- Detectar conflictos de horario
- Eliminar asignación
- Ver carga horaria del maestro

---

## 📁 Estructura de Archivos

```
pages/
  └── admin/
      ├── Dashboard.tsx          ← Módulo 1
      ├── Usuarios.tsx           ← Módulo 2
      ├── Materias.tsx           ← Módulo 3
      └── AsignacionMaterias.tsx ← Módulo 4

components/
  └── admin/
      ├── StatsCard.tsx
      ├── ActivityFeed.tsx
      ├── AlertsPanel.tsx
      ├── TablaUsuarios.tsx
      ├── FormularioUsuario.tsx
      ├── ModalCambiarRol.tsx
      ├── FiltrosUsuarios.tsx
      ├── TablaMaterias.tsx
      ├── FormularioMateria.tsx
      ├── FiltrosMaterias.tsx
      ├── SelectorMaestro.tsx
      ├── SelectorMateria.tsx
      ├── SelectorGrupos.tsx
      ├── TablaAsignaciones.tsx
      └── VistaHorario.tsx

types/
  ├── auth.ts (ya existe)
  ├── materia.ts (nuevo)
  └── asignacion.ts (nuevo)

src/
  └── services/
      ├── authService.ts (ya existe)
      ├── usuariosService.ts (nuevo)
      ├── materiasService.ts (nuevo)
      └── asignacionesService.ts (nuevo)
```

---

## 🗄️ Colecciones de Firestore

### Nueva: `materias`
```javascript
{
  id: "mat001",
  nombre: "Matemáticas",
  clave: "MAT-3",
  grado: 3,
  horasSemanales: 5,
  proposito: "Desarrollar pensamiento matemático...",
  contenido: "Álgebra, geometría, trigonometría...",
  activa: true,
  fechaCreacion: "2026-01-10T..."
}
```

### Nueva: `asignaciones`
```javascript
{
  id: "asig001",
  maestroId: "user123",
  materiaId: "mat001",
  gruposIds: ["grupo001", "grupo002", "grupo003"],
  cicloEscolar: "2025-2026",
  activa: true,
  fechaCreacion: "2026-01-10T..."
}
```

---

## ⏱️ Tiempo Estimado

- **Módulo 1 (Dashboard)**: 2-3 horas
- **Módulo 2 (Usuarios)**: 3-4 horas
- **Módulo 3 (Materias)**: 2-3 horas
- **Módulo 4 (Asignaciones)**: 3-4 horas

**Total**: 10-14 horas de desarrollo

---

## 🚀 Orden de Implementación

### **Sesión 1: Fundamentos** (Ahora)
1. Tipos de datos (materia.ts, asignacion.ts)
2. Servicios (usuariosService, materiasService, asignacionesService)
3. Dashboard básico

### **Sesión 2: Gestión de Usuarios**
1. Página de usuarios
2. Tabla de usuarios
3. Formulario de usuario
4. Cambiar rol

### **Sesión 3: Materias**
1. Página de materias
2. Tabla de materias
3. Formulario de materia

### **Sesión 4: Asignaciones**
1. Página de asignaciones
2. Selectores (maestro, materia, grupos)
3. Tabla de asignaciones
4. Vista de horario

---

## ✅ Checklist de Inicio

Antes de comenzar, necesitamos:
- [x] Firebase configurado
- [x] Autenticación funcionando
- [x] Usuario con rol superadmin
- [ ] Actualizar Router con rutas de admin
- [ ] Crear tipos de datos
- [ ] Crear servicios

---

**¿Comenzamos con la Sesión 1 (Fundamentos)?**

Esto incluye:
1. Crear tipos de datos
2. Crear servicios
3. Dashboard básico con estadísticas

**Tiempo estimado**: 2-3 horas

**¿Listo para empezar?** 🚀
