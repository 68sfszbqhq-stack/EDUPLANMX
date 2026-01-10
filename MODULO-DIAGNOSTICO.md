# Módulo "Raíz" - Diagnóstico Socioeducativo y PAEC

## ✅ Archivos Creados

### 1. Tipos de Datos (`types/diagnostico.ts`)
Define todas las interfaces TypeScript para:
- **Datos Administrativos**: CURP, nombre, género, promedio, tipo de secundaria
- **Batería NEM**: Contexto familiar, socioeconómico, salud, comunidad, intereses
- **Outputs de IA**: Perfil de aprendizaje, alertas de abandono, problema PAEC, metas PMC
- **Adaptaciones**: Sugerencias didácticas basadas en el diagnóstico

### 2. Formulario de Captura (`components/FormularioAlumno.tsx`)
Formulario multi-paso (4 pasos) para registrar alumnos:
- **Paso 1**: Datos administrativos
- **Paso 2**: Contexto familiar y socioeconómico
- **Paso 3**: Problemas comunitarios (PAEC)
- **Paso 4**: Intereses y preferencias

### 3. Dashboard de Diagnóstico (`components/DiagnosticoDashboard.tsx`)
Interfaz completa que muestra:
- Estadísticas del grupo (total alumnos, promedio, alertas, conectividad)
- Perfil de aprendizaje grupal
- Semáforo de abandono escolar con niveles de riesgo
- Problema PAEC prioritario
- Metas PMC sugeridas
- Análisis de contexto digital

### 4. Servicio de IA (`services/diagnosticoService.ts`)
**NOTA: Este archivo necesita ser recreado manualmente**

El servicio debe:
1. Procesar grupos de alumnos usando Gemini AI
2. Generar diagnósticos grupales automáticos
3. Detectar alertas de abandono
4. Identificar el problema PAEC más frecuente
5. Sugerir metas PMC basadas en datos
6. Crear adaptaciones didácticas

## 🔧 Integración Realizada

- ✅ Agregada nueva vista 'diagnostico' al tipo `AppView`
- ✅ Importado `DiagnosticoDashboard` en `App.tsx`
- ✅ Agregado botón de navegación "Diagnóstico" en el sidebar
- ✅ Configurado renderizado de la vista de diagnóstico

## ⚠️ Pendiente

### Recrear `services/diagnosticoService.ts`

El archivo debe importar:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
```

Y usar la API key:
```typescript
const API_KEY = import.meta.env.VITE_API_KEY || '';
```

El servicio debe tener dos métodos principales:
1. `procesarDiagnosticoGrupal(alumnos: Alumno[]): Promise<DiagnosticoGrupal>`
2. `generarAdaptacionDidactica(diagnostico: DiagnosticoGrupal, materia: string): Promise<PlaneacionAdaptada>`

## 🎯 Funcionalidades Implementadas

### Captura de Datos
- Formulario intuitivo de 4 pasos
- Validación de campos
- Almacenamiento en localStorage
- Interfaz responsive

### Procesamiento Inteligente
- Análisis de perfil de aprendizaje grupal
- Detección automática de riesgos de abandono
- Identificación de problema PAEC prioritario
- Generación de metas PMC SMART

### Visualización
- Dashboard con métricas clave
- Tarjetas de estadísticas
- Alertas codificadas por color (semáforo)
- Gráficos de contexto digital

## 📊 Próximos Pasos

1. **Recrear el servicio de IA** correctamente
2. **Probar el flujo completo**:
   - Registrar alumnos
   - Generar diagnóstico
   - Ver resultados
3. **Integrar con el generador de planeaciones** existente
4. **Agregar exportación de reportes** (PDF)

## 🔗 Integración con Planeaciones

El diagnóstico se puede usar para:
- Adaptar actividades según conectividad
- Enfocar planeaciones en el problema PAEC
- Personalizar estrategias didácticas
- Alinear con metas PMC

## 💡 Notas Técnicas

- Los datos se almacenan en `localStorage` con la clave `'alumnos'`
- El diagnóstico se genera bajo demanda (no se guarda automáticamente)
- Se requiere API Key de Gemini configurada en `.env`
- El modelo recomendado es `gemini-2.0-flash-exp`
