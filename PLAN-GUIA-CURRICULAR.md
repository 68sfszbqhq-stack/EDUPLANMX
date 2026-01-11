# 📚 Sesión 3 ACTUALIZADA: Guía Curricular Interactiva para Maestros

## 🎯 Nueva Visión

En lugar de un simple catálogo de materias, crearemos una **Guía Curricular Interactiva** que ayude al maestro a:

1. **Seleccionar su materia** (Matemáticas, Español, etc.)
2. **Ver el programa completo del semestre**
3. **Explorar contenidos organizados por unidades**
4. **Consultar propósitos formativos**
5. **Acceder a temarios detallados**
6. **Ver competencias a desarrollar**
7. **Obtener recursos y materiales sugeridos**
8. **Consultar criterios de evaluación**

---

## 📋 Estructura de Datos Mejorada

### **Materia (Actualizada)**

```typescript
interface Materia {
    id: string;
    nombre: string;
    clave: string;
    grado: 1 | 2 | 3;
    horasSemanales: number;
    
    // Información Curricular
    proposito: string;
    competencias: string[];
    ejesFormativos: string[];
    
    // Contenido Organizado por Unidades
    unidades: Unidad[];
    
    // Recursos
    bibliografiaBasica: Recurso[];
    bibliografiaComplementaria: Recurso[];
    recursosDigitales: RecursoDigital[];
    
    // Evaluación
    criteriosEvaluacion: CriterioEvaluacion[];
    instrumentosEvaluacion: string[];
    
    // Metadata
    activa: boolean;
    fechaCreacion: string;
    creadoPor: string;
}

interface Unidad {
    numero: number;
    nombre: string;
    proposito: string;
    duracionHoras: number;
    temas: Tema[];
    actividadesSugeridas: string[];
}

interface Tema {
    numero: string; // "1.1", "1.2", etc.
    nombre: string;
    contenidos: string[];
    aprendizajesEsperados: string[];
}

interface Recurso {
    tipo: 'libro' | 'articulo' | 'manual';
    titulo: string;
    autor: string;
    editorial?: string;
    año?: number;
    disponibilidad: 'biblioteca' | 'digital' | 'compra';
}

interface RecursoDigital {
    tipo: 'video' | 'simulador' | 'plataforma' | 'app';
    nombre: string;
    url: string;
    descripcion: string;
}

interface CriterioEvaluacion {
    aspecto: string;
    descripcion: string;
    porcentaje: number;
}
```

---

## 🎨 Interfaz para Maestros

### **Vista Principal: Mis Materias**

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Guía Curricular - Mis Materias                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Selecciona una materia para ver el programa completo:     │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ 📐           │ │ 📖           │ │ 🧪           │       │
│  │ Matemáticas  │ │ Español      │ │ Química      │       │
│  │ 3° Semestre  │ │ 3° Semestre  │ │ 3° Semestre  │       │
│  │ 5 hrs/sem    │ │ 4 hrs/sem    │ │ 4 hrs/sem    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Vista Detallada: Programa de Materia**

```
┌─────────────────────────────────────────────────────────────┐
│  📐 Matemáticas III - Programa del Semestre                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Información General                                     │
│  ├─ Clave: MAT-3                                           │
│  ├─ Grado: 3° Semestre                                     │
│  ├─ Horas semanales: 5                                     │
│  └─ Total horas: 80                                        │
│                                                             │
│  🎯 Propósito Formativo                                     │
│  Desarrollar el pensamiento matemático mediante...         │
│                                                             │
│  💡 Competencias a Desarrollar                              │
│  • Razonamiento lógico-matemático                          │
│  • Resolución de problemas                                 │
│  • Pensamiento crítico                                     │
│                                                             │
│  📚 Unidades del Programa                                   │
│  ┌─────────────────────────────────────────────┐          │
│  │ Unidad 1: Álgebra (20 hrs)                 │          │
│  │ ├─ 1.1 Ecuaciones lineales                 │          │
│  │ ├─ 1.2 Sistemas de ecuaciones              │          │
│  │ └─ 1.3 Funciones                           │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │ Unidad 2: Geometría (20 hrs)               │          │
│  │ ├─ 2.1 Figuras planas                      │          │
│  │ ├─ 2.2 Teorema de Pitágoras                │          │
│  │ └─ 2.3 Áreas y perímetros                  │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  📖 Recursos Recomendados                                   │
│  📚 Bibliografía Básica (3)                                │
│  🌐 Recursos Digitales (5)                                 │
│  📝 Material Complementario (8)                            │
│                                                             │
│  ✅ Evaluación                                              │
│  • Exámenes parciales: 40%                                 │
│  • Tareas y ejercicios: 30%                                │
│  • Proyecto final: 20%                                     │
│  • Participación: 10%                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Vista de Unidad Expandida**

```
┌─────────────────────────────────────────────────────────────┐
│  📐 Unidad 1: Álgebra                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⏱️  Duración: 20 horas                                     │
│                                                             │
│  🎯 Propósito de la Unidad                                  │
│  Que el estudiante desarrolle habilidades para resolver    │
│  problemas algebraicos mediante ecuaciones...              │
│                                                             │
│  📝 Temas                                                   │
│                                                             │
│  ┌─────────────────────────────────────────────┐          │
│  │ 1.1 Ecuaciones Lineales (6 hrs)            │          │
│  │                                             │          │
│  │ Contenidos:                                 │          │
│  │ • Concepto de ecuación                      │          │
│  │ • Métodos de solución                       │          │
│  │ • Aplicaciones prácticas                    │          │
│  │                                             │          │
│  │ Aprendizajes Esperados:                     │          │
│  │ ✓ Identifica ecuaciones lineales            │          │
│  │ ✓ Resuelve ecuaciones por diferentes métodos│          │
│  │ ✓ Aplica ecuaciones a problemas reales      │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  🎨 Actividades Sugeridas                                   │
│  • Resolución de problemas en equipo                       │
│  • Ejercicios prácticos con calculadora                    │
│  • Proyecto: Modelado de situaciones reales                │
│                                                             │
│  📚 Recursos para esta Unidad                               │
│  • Video: "Introducción al Álgebra" (Khan Academy)         │
│  • Simulador: Graphing Calculator                          │
│  • Ejercicios interactivos: Math.com                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades para Maestros

### **1. Exploración de Contenidos**
- Ver programa completo de la materia
- Expandir/colapsar unidades
- Ver detalles de cada tema
- Descargar programa en PDF

### **2. Planificación**
- Ver distribución de horas
- Calendario sugerido
- Secuencia didáctica
- Puntos de evaluación

### **3. Recursos**
- Bibliografía completa
- Enlaces a recursos digitales
- Videos educativos
- Simuladores y apps
- Material descargable

### **4. Evaluación**
- Criterios claros
- Instrumentos sugeridos
- Rúbricas
- Ejemplos de exámenes

### **5. Seguimiento**
- Marcar temas vistos
- Progreso del semestre
- Notas personales
- Recordatorios

---

## 📦 Componentes a Crear

### **Páginas:**
1. `pages/maestro/GuiaCurricular.tsx` - Vista principal
2. `pages/maestro/ProgramaMateria.tsx` - Programa completo
3. `pages/maestro/DetalleUnidad.tsx` - Detalle de unidad

### **Componentes:**
1. `components/maestro/TarjetaMateria.tsx` - Card de materia
2. `components/maestro/UnidadExpandible.tsx` - Unidad colapsable
3. `components/maestro/TemaDetalle.tsx` - Detalle de tema
4. `components/maestro/RecursosPanel.tsx` - Panel de recursos
5. `components/maestro/EvaluacionPanel.tsx` - Panel de evaluación
6. `components/maestro/ProgresoSemestre.tsx` - Barra de progreso

---

## 🗄️ Datos de Ejemplo

Voy a crear materias completas con:
- **Matemáticas III** (completa)
- **Español III** (completa)
- **Química III** (completa)
- **Historia de México** (completa)
- **Inglés III** (completa)

Cada una con:
- 4-5 unidades
- 3-4 temas por unidad
- Contenidos detallados
- Aprendizajes esperados
- Actividades sugeridas
- Recursos completos
- Criterios de evaluación

---

## 🎨 Beneficios para el Maestro

✅ **Claridad**: Todo el programa en un solo lugar  
✅ **Organización**: Contenidos estructurados por unidades  
✅ **Recursos**: Materiales listos para usar  
✅ **Planificación**: Distribución clara de tiempos  
✅ **Evaluación**: Criterios y herramientas definidos  
✅ **Flexibilidad**: Adaptar a su ritmo  
✅ **Seguimiento**: Ver su progreso  

---

## 🚀 Implementación

### **Fase 1: Estructura de Datos**
- Actualizar tipos de Materia
- Crear tipos de Unidad, Tema, Recurso
- Actualizar servicio de materias

### **Fase 2: Datos de Ejemplo**
- Crear 5 materias completas
- Con todo su contenido curricular
- Recursos reales y útiles

### **Fase 3: Interfaz**
- Vista de selección de materias
- Vista de programa completo
- Vista de unidad detallada
- Panel de recursos

### **Fase 4: Funcionalidades Extra**
- Descarga de PDF
- Marcado de progreso
- Notas personales
- Calendario

---

## ⏱️ Tiempo Estimado

- **Fase 1**: 1 hora
- **Fase 2**: 2 horas (crear contenido de calidad)
- **Fase 3**: 3 horas
- **Fase 4**: 2 horas (opcional)

**Total**: 6-8 horas

---

**¿Te gusta esta nueva visión?** 

**¿Comenzamos con la Fase 1 (Estructura de Datos)?** 🚀

Esto será mucho más útil para los maestros que un simple catálogo de materias.
