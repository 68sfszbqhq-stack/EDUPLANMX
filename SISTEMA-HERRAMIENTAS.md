# 🛠️ Sistema de Herramientas Educativas - EDUPLANMX

## 📋 Descripción

Sistema modular y escalable de herramientas educativas inspirado en Comenio, diseñado para potenciar la enseñanza sin comprometer la sostenibilidad del proyecto.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/tools/
├── _shared/                    # Componentes y utilidades compartidas
│   ├── types.ts               # Definiciones TypeScript
│   ├── ToolRegistry.ts        # Registro central de herramientas
│   ├── ToolCard.tsx           # Tarjeta de herramienta
│   ├── ToolLayout.tsx         # Layout estándar
│   └── index.ts               # Exportaciones
│
├── planeacion/                # Categoría: Planeación
│   ├── PlanClaseNEM/
│   ├── PlanInvertido/
│   └── index.ts
│
├── actividades/               # Categoría: Actividades
│   ├── EstacionesAprendizaje/
│   ├── ThinkPairShare/
│   └── index.ts
│
├── evaluacion/                # Categoría: Evaluación
│   ├── CreadorRubrica/
│   ├── PreguntasDOK/
│   └── index.ts
│
├── materiales/                # Categoría: Materiales
│   ├── NiveladorTexto/
│   └── index.ts
│
└── comunicacion/              # Categoría: Comunicación
    ├── CorreoFamilias/
    └── index.ts
```

## 🔧 Componentes Principales

### 1. ToolRegistry (Registro Central)

Sistema de registro que mantiene todas las herramientas disponibles.

```typescript
import { registerTool } from '@/tools/_shared/ToolRegistry';

registerTool({
  id: 'mi-herramienta',
  name: 'Mi Herramienta',
  description: 'Descripción breve',
  category: 'planeacion',
  icon: BookOpen,
  tags: ['NEM', 'oficial'],
  component: MiHerramienta,
  promptBuilder: (inputs) => `Genera...`
});
```

### 2. ToolLayout (Layout Estándar)

Proporciona estructura consistente para todas las herramientas.

```tsx
<ToolLayout
  tool={tool}
  onGenerate={handleGenerate}
  isLoading={isLoading}
  result={result}
>
  {/* Tu formulario aquí */}
</ToolLayout>
```

### 3. ToolService (Servicio Central)

Gestiona la ejecución, historial y estadísticas.

```typescript
import { toolService } from '@/services/toolService';

const result = await toolService.executeTool(
  'mi-herramienta',
  inputs,
  userId
);
```

## 📝 Cómo Crear una Nueva Herramienta

### Paso 1: Crear la carpeta

```bash
mkdir -p src/tools/[categoria]/[NombreHerramienta]
```

### Paso 2: Crear el componente

```tsx
// src/tools/actividades/MiHerramienta/index.tsx
import React, { useState } from 'react';
import { ToolLayout } from '../../_shared';
import { toolService } from '../../../services/toolService';
import { useAuth } from '../../../contexts/AuthContext';

export const MiHerramienta: React.FC = () => {
  const { user } = useAuth();
  const [inputs, setInputs] = useState({
    tema: '',
    nivel: 'bachillerato'
  });
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const output = await toolService.executeTool(
        'mi-herramienta',
        inputs,
        user!.uid
      );
      setResult(output);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolLayout
      tool={toolRegistry.find(t => t.id === 'mi-herramienta')!}
      onGenerate={handleGenerate}
      isLoading={isLoading}
      result={result}
    >
      <div className="space-y-4">
        <div>
          <label className="block font-bold mb-2">Tema</label>
          <input
            value={inputs.tema}
            onChange={e => setInputs({...inputs, tema: e.target.value})}
            className="w-full p-3 border rounded-xl"
          />
        </div>
      </div>
    </ToolLayout>
  );
};
```

### Paso 3: Definir el prompt builder

```tsx
// src/tools/actividades/MiHerramienta/prompt.ts
export const miHerramientaPrompt = (inputs: any) => `
Genera una actividad educativa con las siguientes características:

TEMA: ${inputs.tema}
NIVEL: ${inputs.nivel}

INSTRUCCIONES:
1. Diseña una actividad innovadora
2. Incluye objetivos claros
3. Detalla materiales necesarios
4. Proporciona pasos específicos

FORMATO DE SALIDA:
- Título
- Objetivos
- Materiales
- Procedimiento
- Evaluación
`;
```

### Paso 4: Registrar la herramienta

```tsx
// src/tools/actividades/MiHerramienta/register.ts
import { registerTool } from '../../_shared/ToolRegistry';
import { Lightbulb } from 'lucide-react';
import { MiHerramienta } from './index';
import { miHerramientaPrompt } from './prompt';

registerTool({
  id: 'mi-herramienta',
  name: 'Mi Herramienta',
  description: 'Genera actividades innovadoras',
  category: 'actividades',
  icon: Lightbulb,
  tags: ['innovación', 'creatividad'],
  component: MiHerramienta,
  promptBuilder: miHerramientaPrompt
});
```

### Paso 5: Exportar desde la categoría

```tsx
// src/tools/actividades/index.ts
import './MiHerramienta/register';

export { MiHerramienta } from './MiHerramienta';
```

### Paso 6: Importar en el registro principal

```tsx
// src/tools/index.ts
import './actividades';
import './planeacion';
import './evaluacion';
// ... otras categorías
```

## 🎯 Herramientas Prioritarias (Fase 1)

### Planeación (5)
- [ ] Plan de Clase NEM
- [ ] Plan de Clase por Metodología NEM
- [ ] Planeación Invertida (UBD)
- [ ] Desglosador de Progresiones
- [ ] Conexiones con Mundo Real

### Actividades (4)
- [ ] Estaciones de Aprendizaje
- [ ] Think-Pair-Share
- [ ] Escape Room Educativo
- [ ] Andamiaje de Tareas

### Evaluación (3)
- [ ] Creador de Rúbricas
- [ ] Preguntas DOK
- [ ] Retroalimentación Estudiantil

### Materiales (2)
- [ ] Nivelador de Texto
- [ ] Generador de Vocabulario

### Comunicación (1)
- [ ] Correo para Familias

## 🔥 Firestore Collections

### `herramientas_generadas`

```typescript
{
  id: string;
  toolId: string;
  userId: string;
  schoolId?: string;
  subjectId?: string;
  inputs: Record<string, any>;
  output: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: string[];
  isFavorite: boolean;
}
```

## 🚀 Próximos Pasos

1. ✅ Estructura base creada
2. ✅ Componentes compartidos
3. ✅ Servicio central
4. ✅ Página de catálogo
5. ⏳ Crear primera herramienta (Estaciones de Aprendizaje)
6. ⏳ Sistema de favoritos
7. ⏳ Historial de uso
8. ⏳ Exportación mejorada

## 📚 Recursos

- [Comenio](https://comenio.com) - Inspiración
- [Nueva Escuela Mexicana](https://www.gob.mx/sep)
- [Taxonomía de Bloom](https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/)
- [DOK Levels](https://www.aps.edu/sapr/documents/resources/Webbs_DOK_Guide.pdf)

## 🤝 Contribuir

Para agregar una nueva herramienta, sigue los pasos en "Cómo Crear una Nueva Herramienta" y asegúrate de:

1. Usar el `ToolLayout` estándar
2. Registrar en `ToolRegistry`
3. Proporcionar un `promptBuilder` claro
4. Agregar tags descriptivos
5. Documentar inputs esperados

---

**Fecha de creación**: 2026-02-05  
**Versión**: 1.0.0  
**Estado**: ✅ Estructura base completada
