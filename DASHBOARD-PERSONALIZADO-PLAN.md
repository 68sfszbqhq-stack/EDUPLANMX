# 🎨 DASHBOARD PERSONALIZADO CON CONTEXTO ESCOLAR

## 🎯 Objetivo

Crear un dashboard que:
1. Muestre información personalizada del profesor
2. Use los datos del perfil para pre-llenar el contexto escolar
3. Facilite la creación de planeaciones con datos ya conocidos

---

## 📊 Datos Disponibles del Profesor

Del perfil de usuario tenemos:

```typescript
{
  nombre: "José",
  apellidoPaterno: "Mendoza",
  schoolName: "CBT No. 1 Dr. Gustavo Baz",
  schoolId: "school123",
  puesto: "Docente",
  rol: "maestro",
  materias: ["Matemáticas", "Física"],
  grados: [1, 3, 5],
  telefono: "5512345678"
}
```

---

## 🎨 Diseño del Dashboard Personalizado

### **1. Header Personalizado**
```
┌─────────────────────────────────────────────┐
│ 🏫 CBT No. 1 Dr. Gustavo Baz                │
│ 👤 José Mendoza - Docente                   │
│ 📚 Materias: Matemáticas, Física            │
│ 📊 Semestres: 1°, 3°, 5°                    │
└─────────────────────────────────────────────┘
```

### **2. Cards de Resumen**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Planeaciones │  │   Materias   │  │  Semestres   │
│      12      │  │      2       │  │      3       │
└──────────────┘  └──────────────┘  └──────────────┘
```

### **3. Acciones Rápidas**
```
┌─────────────────────────────────────────────┐
│ 🚀 Acciones Rápidas                         │
│                                             │
│ [Nueva Planeación]  [Ver Planeaciones]     │
│ [Herramientas]      [Contexto Escolar]     │
└─────────────────────────────────────────────┘
```

### **4. Planeaciones Recientes**
```
┌─────────────────────────────────────────────┐
│ 📋 Planeaciones Recientes                   │
│                                             │
│ • Matemáticas - 1° Semestre - 05/02/2026   │
│ • Física - 3° Semestre - 04/02/2026        │
│ • Matemáticas - 5° Semestre - 03/02/2026   │
└─────────────────────────────────────────────┘
```

---

## 🔧 Contexto Escolar Personalizado

### **Datos que se Pre-llenan Automáticamente**

```typescript
// En el contexto escolar
{
  // Datos de la escuela
  nombreEscuela: user.schoolName,  // "CBT No. 1 Dr. Gustavo Baz"
  
  // Datos del docente
  nombreDocente: `${user.nombre} ${user.apellidoPaterno}`,  // "José Mendoza"
  puesto: user.puesto,  // "Docente"
  
  // Materias que imparte
  materiasImpartidas: user.materias,  // ["Matemáticas", "Física"]
  
  // Semestres que atiende
  semestresAtendidos: user.grados,  // [1, 3, 5]
  
  // Contacto
  telefono: user.telefono  // "5512345678"
}
```

---

## 📝 Formularios Pre-llenados

### **Al Crear Nueva Planeación**

```typescript
// Formulario pre-llenado
{
  // Escuela (bloqueado, no editable)
  escuela: user.schoolName,
  
  // Docente (bloqueado, no editable)
  docente: `${user.nombre} ${user.apellidoPaterno}`,
  
  // Materias (dropdown con solo las del profesor)
  materia: user.materias[0],  // Primera materia por defecto
  materiasDisponibles: user.materias,  // Solo sus materias
  
  // Semestres (dropdown con solo los del profesor)
  semestre: user.grados[0],  // Primer semestre por defecto
  semestresDisponibles: user.grados,  // Solo sus semestres
  
  // Otros campos (editables)
  grupo: "",
  fecha: new Date(),
  // ...
}
```

---

## 🎯 Implementación

### **Archivos a Modificar**

1. **App.tsx** (Dashboard Principal)
   - Mostrar datos personalizados
   - Cards de resumen
   - Acciones rápidas

2. **components/ContextoEscolar.tsx**
   - Pre-llenar con datos del usuario
   - Bloquear campos que no deben cambiar

3. **components/PlanGenerator.tsx**
   - Pre-llenar materia y semestre
   - Filtrar opciones según perfil

4. **pages/maestro/Dashboard.tsx**
   - Crear dashboard personalizado
   - Mostrar estadísticas del profesor

---

## 📊 Estadísticas Personalizadas

```typescript
// Calcular estadísticas del profesor
{
  totalPlaneaciones: 12,
  planeacionesPorMateria: {
    "Matemáticas": 7,
    "Física": 5
  },
  planeacionesPorSemestre: {
    "1": 4,
    "3": 5,
    "5": 3
  },
  ultimaPlaneacion: "2026-02-05",
  promedioSemanal: 2.5
}
```

---

## 🎨 Componentes a Crear

### **1. DashboardHeader**
```tsx
<DashboardHeader 
  schoolName={user.schoolName}
  userName={`${user.nombre} ${user.apellidoPaterno}`}
  puesto={user.puesto}
  materias={user.materias}
  semestres={user.grados}
/>
```

### **2. StatsCards**
```tsx
<StatsCards 
  totalPlaneaciones={stats.total}
  totalMaterias={user.materias.length}
  totalSemestres={user.grados.length}
/>
```

### **3. QuickActions**
```tsx
<QuickActions 
  onNewPlaneacion={() => navigate('/nueva-planeacion')}
  onViewPlaneaciones={() => navigate('/planeaciones')}
  onHerramientas={() => navigate('/herramientas')}
  onContexto={() => navigate('/contexto')}
/>
```

### **4. RecentPlaneaciones**
```tsx
<RecentPlaneaciones 
  planeaciones={recentPlans}
  onView={(id) => navigate(`/planeacion/${id}`)}
/>
```

---

## 🔄 Flujo de Datos

```
1. Usuario hace login
   ↓
2. AuthContext carga perfil completo
   ↓
3. Dashboard recibe datos del usuario
   ↓
4. Dashboard muestra:
   - Nombre y escuela
   - Materias y semestres
   - Estadísticas personalizadas
   ↓
5. Al crear planeación:
   - Pre-llena escuela y docente
   - Filtra materias y semestres
   - Solo muestra opciones relevantes
   ↓
6. Al editar contexto:
   - Pre-llena datos conocidos
   - Permite editar solo lo necesario
```

---

## 🎯 Beneficios

✅ **Menos trabajo** - No repetir datos en cada planeación  
✅ **Más rápido** - Formularios pre-llenados  
✅ **Menos errores** - Datos consistentes  
✅ **Mejor UX** - Experiencia personalizada  
✅ **Profesional** - Se ve más pulido  

---

## 📋 Checklist de Implementación

- [ ] Crear DashboardHeader component
- [ ] Crear StatsCards component
- [ ] Crear QuickActions component
- [ ] Crear RecentPlaneaciones component
- [ ] Modificar App.tsx para usar datos del usuario
- [ ] Modificar PlanGenerator para pre-llenar
- [ ] Modificar ContextoEscolar para pre-llenar
- [ ] Agregar estadísticas personalizadas
- [ ] Filtrar materias y semestres en dropdowns
- [ ] Probar flujo completo

---

## 🚀 ¿Quieres que Implemente Esto?

Puedo:
1. Crear todos los componentes nuevos
2. Modificar los existentes
3. Integrar con el perfil del usuario
4. Hacer que todo funcione automáticamente

**¿Procedo con la implementación?** 🎨
