# 📚 Sistema de Extracción y Consulta de Programas MCCEMS

**Ingeniería de Datos - EDUPLANMX**

Sistema completo para extraer, almacenar y consultar programas oficiales del Marco Curricular Común de la Educación Media Superior (MCCEMS) de la DGB/SEP.

---

## 🎯 Objetivos del Proyecto

1. **Automatizar la extracción** de programas de estudio desde el sitio oficial de la DGB/SEP
2. **Estructurar la información** en formato JSON para consulta programática
3. **Integrar con el backend** de EDUPLANMX para validación de planeaciones
4. **Proporcionar contexto** a la IA para generación de contenido educativo alineado con estándares oficiales

---

## 📁 Estructura del Proyecto

```
EDUPLANMX/
├── scripts/
│   ├── extractor_mccems.py          # Script de extracción
│   └── requirements.txt             # Dependencias Python
├── src/services/
│   ├── programasSEPService.ts       # Servicio de consulta Node.js
│   └── programasSEPService.examples.ts  # Ejemplos de uso
├── data/
│   ├── programas_sep.json           # Base de datos extraída
│   └── sep_downloads/               # PDFs descargados
└── MCCEMS_DATA_ENGINEERING.md       # Este documento
```

---

## 🚀 Fase 1: Extracción de Datos

### 1.1 Instalación de Dependencias

```bash
cd scripts
pip install -r requirements.txt
```

### 1.2 Ejecución del Extractor

```bash
python3 extractor_mccems.py
```

### 1.3 ¿Qué hace el extractor?

- **Descarga PDFs** de los 7 documentos de Progresiones fundamentales
- **Procesa programas** de los 6 semestres
- **Extrae información** usando pdfplumber:
  - Metadata (nombre, semestre, créditos, horas)
  - Organizador curricular (categorías, subcategorías, metas)
  - Progresiones de aprendizaje (descripción, metas asociadas)
- **Genera JSON** estructurado en `data/programas_sep.json`

### 1.4 Estructura del JSON generado

```json
[
  {
    "materia": "Pensamiento Matemático II",
    "semestre": 2,
    "metadata": {
      "nombre_uac": "PENSAMIENTO MATEMÁTICO II",
      "semestre": 2,
      "creditos": 8,
      "horas_semanales": 5
    },
    "organizador_curricular": {
      "categorias": ["Algebra", "Geometría", "Cálculo"],
      "subcategorias": ["Ecuaciones lineales", "Rectas y planos"],
      "metas_aprendizaje": [
        "Resolver problemas mediante ecuaciones...",
        "Aplicar conceptos de álgebra en contextos reales..."
      ]
    },
    "progresiones": [
      {
        "id": 1,
        "descripcion": "Aplica el razonamiento algebraico para resolver problemas de la vida cotidiana...",
        "metas": ["Meta 1: Resolver ecuaciones de primer grado"]
      },
      {
        "id": 2,
        "descripcion": "Desarrolla el pensamiento lógico mediante...",
        "metas": []
      }
    ],
    "url_fuente": "https://dgb.sep.gob.mx/storage/recursos/2023/08/...",
    "fecha_extraccion": "2026-01-11T14:45:00.000Z"
  }
]
```

---

## 🔧 Fase 2: Integración con Backend

### 2.1 Servicio de Consulta

El servicio `programasSEPService.ts` proporciona:

#### **Métodos de Búsqueda**

```typescript
// Buscar por materia
const programas = programasSEPService.buscarPorMateria('Pensamiento Matemático');

// Buscar por semestre
const programasSem1 = programasSEPService.buscarPorSemestre(1);

// Búsqueda combinada
const programa = programasSEPService.buscarPorMateriaYSemestre('Lengua y Comunicación', 2);
```

#### **Métodos de Validación**

```typescript
// Validar que una planeación Use progresiones oficiales
const validacion = programasSEPService.validarPlaneacion(
    'Pensamiento Matemático',
    2,
    ['Aplicar razonamiento algebraico', 'Resolver ecuaciones']
);

console.log(validacion);
// {
//   esValida: true,
//   progresionesOficiales: [...],
//   coincidencias: 2,
//   sugerencias: []
// }
```

#### **Generación de Contexto para IA**

```typescript
// Obtener contexto oficial para prompt de IA
const contexto = programasSEPService.generarContextoIA('Matemáticas', 3);

// Usar en prompt de IA
const prompt = `
${contexto}

Con base en el programa oficial anterior, genera una planeación para el tema: "Funciones lineales"
Incluye: objetivos, actividades, evaluación.
`;
```

### 2.2 Integración con Generador de Planeaciones

```typescript
import { programasSEPService } from './services/programasSEPService';
import { generarConIA } from './services/aiService';

async function generarPlaneacionOficial(materia: string, semestre: number, tema: string) {
    // 1. Obtener contexto oficial
    const contextoOficial = programasSEPService.generarContextoIA(materia, semestre);
    
    // 2. Generar planeación con IA
    const planeacion = await generarConIA({
        prompt: `
            ${contextoOficial}
            
            Genera una planeación didáctica para:
            Tema: ${tema}
            
            IMPORTANTE: Incluye SOLO progresiones de aprendizaje del programa oficial.
        `
    });
    
    // 3. Validar resultado
    const validacion = programasSEPService.validarPlaneacion(
        materia,
        semestre,
        extraerProgresiones(planeacion)
    );
    
    // 4. Retornar con validación
    return {
        planeacion,
        validacion,
        estaloficial: validacion.esValida,
        sugerencias: validacion.sugerencias
    };
}
```

---

## 📊 Fase 3: Verificación y Filtrado

### 3.1 Filtrado por Materia

```typescript
// Caso de uso: Mostrar solo progresiones de Lengua y Comunicación
const progresiones = programasSEPService.obtenerProgresiones('Lengua y Comunicación');

progresiones.forEach(p => {
    console.log(`${p.id}. ${p.descripcion}`);
});
```

### 3.2 Filtrado por Semestre

```typescript
// Caso de uso: Listar materias del 1er semestre
const materiasDisponibles = programasSEPService.buscarPorSemestre(1);

materiasDisponibles.forEach(materia => {
    console.log(`- ${materia.materia} (${materia.metadata.horas_semanales} hrs/semana)`);
});
```

### 3.3 Filtrado Combinado

```typescript
// Caso de uso: Generar selector dinámico de progresiones
function obtenerProgresionesParaFormulario(materia: string, semestre: number) {
    const programa = programasSEPService.buscarPorMateriaYSemestre(materia, semestre);
    
    if (!programa) {
        return [];
    }
    
    return programa.progresiones.map(p => ({
        value: p.id,
        label: `${p.id}. ${p.descripcion.substring(0, 100)}...`,
        descripcionCompleta: p.descripcion,
        metas: p.metas
    }));
}
```

---

## ✅ Fase 4: Testing y Validación

### 4.1 Ejecutar Ejemplos

```bash
# Compilar TypeScript
npx tsc src/services/programasSEPService.examples.ts

# Ejecutar ejemplos
node src/services/programasSEPService.examples.js
```

### 4.2 Casos de Prueba

El archivo `programasSEPService.examples.ts` incluye:

- ✅ Búsqueda básica por materia
- ✅ Búsqueda por semestre
- ✅ Búsqueda combinada
- ✅ Generación de contexto para IA
- ✅ Validación de planeaciones
- ✅ Estadísticas del catálogo
- ✅ Flujo completo de generación

### 4.3 Validación de Datos

```typescript
const stats = programasSEPService.obtenerEstadisticas();

console.log(`
✅ VALIDACIÓN DEL CATÁLOGO:
- Total de programas: ${stats.totalProgramas}
- Última actualización: ${stats.ultimaActualizacion}
- Programas por semestre:
${stats.programasPorSemestre.map(s => `  Sem ${s.semestre}: ${s.cantidad}`).join('\n')}
`);
```

---

## 🎓 Casos de Uso Empresariales

### Caso 1: Validación Automática

```typescript
// Al generar planeación, validar automáticamente
const resultado = await generarPlaneacionOficial('Matemáticas', 3, 'Trigonometría');

if (!resultado.estaloficial) {
    mostrarAlerta('Advertencia: La planeación no cumple 100% con el programa SEP');
    mostrarSugerencias(resultado.sugerencias);
}
```

### Caso 2: Autocompletado Inteligente

```typescript
// En formulario de planeación, sugerir progresiones oficiales
const sugerencias = programasSEPService.obtenerProgresiones('Cultura Digital', 1);

// Mostrar en dropdown
<select>
    {sugerencias.map(p => 
        <option value={p.id}>{p.descripcion}</option>
    )}
</select>
```

### Caso 3: Generación Asistida

```typescript
// Botón "Generar desde programa oficial"
function generarDesdeOficial(materia, semestre) {
    const contexto = programasSEPService.generarContextoIA(materia, semestre);
    const metas = programasSEPService.obtenerMetasAprendizaje(materia, semestre);
    
    // Pre-llenar formulario
    formData.metas = metas;
    formData.contextoSEP = contexto;
}
```

---

## 📈 Roadmap Futuro

- [ ] **Actualización automática**: Script para detectar cambios en el sitio de la DGB
- [ ] **NLP avanzado**: Usar embeddings para similitud semántica de progresiones
- [ ] **API REST**: Endpoint `/api/programas-sep` para consulta desde frontend
- [ ] **Cache inteligente**: Redis para optimizar consultas frecuentes
- [ ] **Versioning**: Mantener historial de cambios en programas oficiales

---

## 👨‍💻 Autor

**Antigravity Agent - Ingeniero de Datos Senior**  
Proyecto: EDUPLANMX  
Fecha: 11 de enero de 2026

---

## 📞 Soporte

Para dudas o mejoras, consultar con el equipo de desarrollo de EDUPLANMX.

**Fuente oficial**: [DGB - Marco Curricular](https://dgb.sep.gob.mx/marco-curricular)
