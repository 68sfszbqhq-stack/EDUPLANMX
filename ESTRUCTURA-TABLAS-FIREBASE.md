# 🗄️ Estructura de Base de Datos Firebase - EDUPLANMX

## 📊 Diagrama de Colecciones

```
FIRESTORE DATABASE (eduplanmx)
│
├── 📁 alumnos/
│   ├── {alumnoId1}
│   ├── {alumnoId2}
│   └── {alumnoId3}
│
├── 📁 diagnosticos/
│   ├── {diagnosticoId1}
│   └── {diagnosticoId2}
│
└── 📁 planeaciones/
    ├── {planeacionId1}
    └── {planeacionId2}
```

---

## 1️⃣ Colección: `alumnos`

### 🎯 Propósito
Almacenar todos los registros de alumnos con su información completa (administrativa, familiar, socioeconómica, y contexto comunitario).

### 📋 Campos del Documento

#### Nivel Raíz
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | string | ID auto-generado por Firestore | `"abc123xyz"` |
| `datosAdministrativos` | object | Datos personales y académicos | Ver tabla abajo |
| `datosNEM` | object | Contexto familiar y socioeconómico | Ver tabla abajo |
| `fechaRegistro` | string (ISO) | Fecha de registro | `"2026-01-10T17:45:00.000Z"` |

---

#### Objeto: `datosAdministrativos`
| Campo | Tipo | Valores Posibles | Obligatorio |
|-------|------|------------------|-------------|
| `curp` | string | CURP válido (18 caracteres) | ✅ Sí |
| `nombre` | string | Nombre(s) del alumno | ✅ Sí |
| `apellidoPaterno` | string | Apellido paterno | ✅ Sí |
| `apellidoMaterno` | string | Apellido materno | ✅ Sí |
| `genero` | string | `"Masculino"`, `"Femenino"`, `"Otro"`, `"Prefiero no decir"` | ✅ Sí |
| `promedioSecundaria` | number | 6.0 - 10.0 | ✅ Sí |
| `tipoSecundaria` | string | `"General"`, `"Técnica"`, `"Telesecundaria"`, `"Particular"` | ✅ Sí |
| `sostenimiento` | string | `"Público"`, `"Privado"` | ✅ Sí |

**Ejemplo**:
```json
{
  "curp": "ABCD123456HDFRRL01",
  "nombre": "Juan",
  "apellidoPaterno": "Pérez",
  "apellidoMaterno": "García",
  "genero": "Masculino",
  "promedioSecundaria": 8.5,
  "tipoSecundaria": "General",
  "sostenimiento": "Público"
}
```

---

#### Objeto: `datosNEM`
Este objeto contiene TODA la información del contexto del alumno.

##### Sección: Familia
| Campo | Tipo | Valores Posibles | Obligatorio |
|-------|------|------------------|-------------|
| `tipoFamilia` | string | `"Nuclear"`, `"Extensa"`, `"Monoparental"`, `"Compuesta"`, `"Homoparental"` | ✅ Sí |
| `redApoyo` | object | Datos de contacto (ver tabla abajo) | ✅ Sí |

**Objeto `redApoyo`**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombreTutor` | string | Nombre completo del tutor |
| `parentesco` | string | `"Padre"`, `"Madre"`, `"Hermano"`, `"Tío"`, `"Abuelo"`, `"Otro"` |
| `telefonoPadre` | string | 10 dígitos |
| `telefonoMadre` | string | 10 dígitos |
| `telefonoTutor` | string | 10 dígitos |
| `telefonoEmergencia` | string | 10 dígitos |

---

##### Sección: Nivel Socioeconómico
| Campo | Tipo | Valores Posibles |
|-------|------|------------------|
| `gradoEstudioPadre` | string | `"Primaria"`, `"Secundaria"`, `"Preparatoria"`, `"Licenciatura"`, `"Posgrado"`, `"Sin estudios"` |
| `gradoEstudioMadre` | string | `"Primaria"`, `"Secundaria"`, `"Preparatoria"`, `"Licenciatura"`, `"Posgrado"`, `"Sin estudios"` |
| `ocupacionPadre` | string | `"Hogar"`, `"Profesionista"`, `"Técnico"`, `"Obrero"`, `"Negocio propio"`, `"Comercio"`, `"Desempleado"` |
| `ocupacionMadre` | string | `"Hogar"`, `"Profesionista"`, `"Técnico"`, `"Obrero"`, `"Negocio propio"`, `"Comercio"`, `"Desempleado"` |

---

##### Sección: Situación Laboral del Alumno
| Campo | Tipo | Valores Posibles |
|-------|------|------------------|
| `situacionLaboral` | string | `"Solo estudia"`, `"Estudia y trabaja"`, `"Trabaja y estudia"` |
| `horasTrabajoSemanal` | number | 0 - 60 (opcional si no trabaja) |

---

##### Sección: Vivienda y Servicios
| Campo | Tipo | Valores Posibles |
|-------|------|------------------|
| `tipoVivienda` | string | `"Propia"`, `"Rentada"`, `"Prestada"` |
| `serviciosVivienda` | object | Ver tabla abajo |

**Objeto `serviciosVivienda`**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `agua` | boolean | ¿Tiene agua potable? |
| `luz` | boolean | ¿Tiene electricidad? |
| `drenaje` | boolean | ¿Tiene drenaje? |
| `internet` | boolean | ¿Tiene internet? |
| `tvCable` | boolean | ¿Tiene TV por cable? |
| `aireAcondicionado` | boolean | ¿Tiene aire acondicionado? |

---

##### Sección: Economía
| Campo | Tipo | Valores Posibles |
|-------|------|------------------|
| `ingresosMensuales` | string | `"0-5000"`, `"5001-10000"`, `"10001-20000"`, `"20001-40000"`, `"40001+"` |
| `personasAportanIngreso` | number | 1 - 10 |
| `cuentaConBeca` | boolean | `true` / `false` |
| `tipoBeca` | string | Texto libre (opcional) |

---

##### Sección: Salud
| Campo | Tipo | Valores Posibles |
|-------|------|------------------|
| `institucionSalud` | string | `"IMSS"`, `"ISSSTE"`, `"Bienestar"`, `"Seguro privado"`, `"Ninguna"` |
| `enfermedadesCronicas` | array[string] | Lista de enfermedades |
| `tratamientoEnfermedades` | string | Texto libre (opcional) |

---

##### Sección: Contexto Comunitario (PAEC)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `problemasComunitarios` | array[string] | Problemas detectados en la comunidad |
| `deficienciasServicios` | array[string] | Servicios públicos deficientes |

**Valores posibles para `problemasComunitarios`**:
- `"Violencia"`
- `"Contaminación"`
- `"Adicciones"`
- `"Mala alimentación"`
- `"Pandillerismo"`
- `"Robos"`
- `"Desempleo"`
- `"Falta de educación"`

**Valores posibles para `deficienciasServicios`**:
- `"Alumbrado público"`
- `"Transporte público"`
- `"Áreas verdes"`
- `"Centros de salud"`
- `"Rampas para discapacidad"`
- `"Recolección de basura"`

---

##### Sección: Factores de Riesgo
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `consumoSustanciasCuadra` | array[string] | Sustancias consumidas en la cuadra |
| `consumoSustanciasCasa` | array[string] | Sustancias consumidas dentro de casa |

**Valores posibles**:
- `"Alcohol"`
- `"Tabaco"`
- `"Drogas"`
- `"Ninguna"`

---

##### Sección: Convivencia Social
| Campo | Tipo | Valores Posibles |
|-------|------|------------------|
| `frecuenciaDiscusionesComunidad` | string | `"Nunca"`, `"Rara vez"`, `"A veces"`, `"Frecuente"`, `"Muy frecuente"` |
| `intensidadPeleasComunidad` | string | `"Ninguna"`, `"Leve"`, `"Moderada"`, `"Grave"` |
| `frecuenciaDiscusionesFamilia` | string | `"Nunca"`, `"Rara vez"`, `"A veces"`, `"Frecuente"`, `"Muy frecuente"` |
| `intensidadPeleasFamilia` | string | `"Ninguna"`, `"Leve"`, `"Moderada"`, `"Grave"` |

---

##### Sección: Cultura y Valores
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tradicionesLocales` | array[string] | Tradiciones identificadas |
| `practicasDiscriminatorias` | array[string] | Prácticas discriminatorias detectadas |

**Valores posibles para `practicasDiscriminatorias`**:
- `"Machismo"`
- `"Homofobia"`
- `"Racismo"`
- `"Clasismo"`
- `"Ninguna"`

---

##### Sección: Intereses y Preferencias
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `materiasPreferidas` | array[string] | Materias que le gustan |
| `actividadesInteres` | array[string] | Actividades de interés |

**Valores posibles para `materiasPreferidas`**:
- `"Matemáticas"`
- `"Ciencias"`
- `"Español"`
- `"Historia"`
- `"Geografía"`
- `"Inglés"`
- `"Educación Física"`
- `"Artes"`

**Valores posibles para `actividadesInteres`**:
- `"Deportes"`
- `"Lectura"`
- `"Música"`
- `"Arte"`
- `"Tecnología"`
- `"Ciencia"`
- `"Cocina"`
- `"Manualidades"`

---

### 📄 Ejemplo Completo de Documento en `alumnos`

```json
{
  "id": "abc123xyz",
  "datosAdministrativos": {
    "curp": "ABCD123456HDFRRL01",
    "nombre": "Juan",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "García",
    "genero": "Masculino",
    "promedioSecundaria": 8.5,
    "tipoSecundaria": "General",
    "sostenimiento": "Público"
  },
  "datosNEM": {
    "tipoFamilia": "Nuclear",
    "redApoyo": {
      "nombreTutor": "María García",
      "parentesco": "Madre",
      "telefonoPadre": "5551234567",
      "telefonoMadre": "5557654321",
      "telefonoTutor": "5557654321",
      "telefonoEmergencia": "5559876543"
    },
    "gradoEstudioPadre": "Preparatoria",
    "gradoEstudioMadre": "Licenciatura",
    "ocupacionPadre": "Obrero",
    "ocupacionMadre": "Profesionista",
    "situacionLaboral": "Solo estudia",
    "horasTrabajoSemanal": 0,
    "tipoVivienda": "Propia",
    "serviciosVivienda": {
      "agua": true,
      "luz": true,
      "drenaje": true,
      "internet": true,
      "tvCable": false,
      "aireAcondicionado": false
    },
    "ingresosMensuales": "10001-20000",
    "personasAportanIngreso": 2,
    "cuentaConBeca": false,
    "tipoBeca": "",
    "institucionSalud": "IMSS",
    "enfermedadesCronicas": [],
    "tratamientoEnfermedades": "",
    "problemasComunitarios": ["Violencia", "Contaminación"],
    "deficienciasServicios": ["Alumbrado público", "Áreas verdes"],
    "consumoSustanciasCuadra": ["Alcohol"],
    "consumoSustanciasCasa": [],
    "frecuenciaDiscusionesComunidad": "Rara vez",
    "intensidadPeleasComunidad": "Leve",
    "frecuenciaDiscusionesFamilia": "Nunca",
    "intensidadPeleasFamilia": "Ninguna",
    "tradicionesLocales": ["Día de Muertos", "Fiestas patronales"],
    "practicasDiscriminatorias": [],
    "materiasPreferidas": ["Matemáticas", "Ciencias"],
    "actividadesInteres": ["Deportes", "Lectura"]
  },
  "fechaRegistro": "2026-01-10T17:45:00.000Z"
}
```

---

## 2️⃣ Colección: `diagnosticos`

### 🎯 Propósito
Almacenar diagnósticos grupales generados por el docente.

### 📋 Campos del Documento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID auto-generado |
| `grupoId` | string | Identificador del grupo (ej: "3A-2026") |
| `totalAlumnos` | number | Cantidad de alumnos en el grupo |
| `fechaGeneracion` | string (ISO) | Fecha de generación |
| `perfilAprendizaje` | object | Perfil de aprendizaje grupal |
| `alertasAbandono` | array[object] | Alumnos en riesgo |
| `problemaPAEC` | object | Problema principal detectado |
| `problemasSecundarios` | array[object] | Otros problemas |
| `metasPMC` | array[string] | Metas del Programa de Mejora Continua |
| `promedioGrupal` | number | Promedio del grupo |
| `contextoDigital` | object | Estadísticas de conectividad |

### 📄 Ejemplo de Documento

```json
{
  "id": "diag123",
  "grupoId": "3A-2026",
  "totalAlumnos": 25,
  "fechaGeneracion": "2026-01-10T18:00:00.000Z",
  "perfilAprendizaje": {
    "estilosDominantes": ["Visual", "Kinestésico"],
    "ganchosInteres": ["Tecnología", "Deportes"],
    "materiasPopulares": ["Matemáticas", "Ciencias"],
    "actividadesPreferidas": ["Proyectos", "Experimentos"]
  },
  "alertasAbandono": [
    {
      "alumnoId": "abc123",
      "nombreAlumno": "Juan Pérez",
      "nivelRiesgo": "Alto",
      "factoresRiesgo": ["Trabaja más de 20 horas", "Problemas familiares"],
      "recomendaciones": ["Tutoría personalizada", "Apoyo psicológico"]
    }
  ],
  "problemaPAEC": {
    "problema": "Violencia",
    "frecuencia": 15,
    "porcentaje": 60
  },
  "problemasSecundarios": [
    {
      "problema": "Contaminación",
      "frecuencia": 10,
      "porcentaje": 40
    }
  ],
  "metasPMC": [
    "Fomentar cultura de paz",
    "Desarrollar pensamiento crítico"
  ],
  "promedioGrupal": 8.2,
  "contextoDigital": {
    "conInternet": 15,
    "sinInternet": 10,
    "porcentajeConectividad": 60
  }
}
```

---

## 3️⃣ Colección: `planeaciones`

### 🎯 Propósito
Almacenar planeaciones didácticas generadas y adaptadas al contexto del grupo.

### 📋 Campos del Documento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID auto-generado |
| `docenteId` | string | ID del docente |
| `grupoId` | string | ID del grupo |
| `materia` | string | Materia de la planeación |
| `fechaCreacion` | string (ISO) | Fecha de creación |
| `adaptacionTecnologica` | object | Adaptaciones tecnológicas |
| `enfoquePAEC` | object | Enfoque PAEC aplicado |
| `consideracionesGrupales` | array[string] | Consideraciones del grupo |
| `metasPMCRelacionadas` | array[string] | Metas PMC relacionadas |

### 📄 Ejemplo de Documento

```json
{
  "id": "plan123",
  "docenteId": "profesor123",
  "grupoId": "3A-2026",
  "materia": "Matemáticas",
  "fechaCreacion": "2026-01-10T19:00:00.000Z",
  "adaptacionTecnologica": {
    "tipo": "Híbrida",
    "justificacion": "60% tiene internet, 40% no",
    "sugerencias": [
      "Materiales descargables en PDF",
      "Actividades offline con material impreso"
    ]
  },
  "enfoquePAEC": {
    "problemaSeleccionado": "Violencia",
    "conexionConMateria": "Resolución de problemas matemáticos aplicados a conflictos",
    "actividadesSugeridas": [
      "Análisis estadístico de violencia local",
      "Propuestas de solución basadas en datos"
    ]
  },
  "consideracionesGrupales": [
    "Grupo con promedio alto (8.2)",
    "Interés en tecnología y deportes",
    "15 alumnos en riesgo de abandono"
  ],
  "metasPMCRelacionadas": [
    "Fomentar cultura de paz",
    "Desarrollar pensamiento crítico"
  ]
}
```

---

## 🔍 Índices Recomendados

Para optimizar las consultas en Firestore:

### Índice 1: Alumnos por fecha
```
Colección: alumnos
Campo: fechaRegistro (Descending)
```

### Índice 2: Diagnósticos por grupo
```
Colección: diagnosticos
Campo: grupoId (Ascending)
Campo: fechaGeneracion (Descending)
```

### Índice 3: Planeaciones por docente
```
Colección: planeaciones
Campo: docenteId (Ascending)
Campo: fechaCreacion (Descending)
```

---

## 📊 Resumen de Colecciones

| Colección | Documentos Esperados | Tamaño Aprox. por Doc | Uso Principal |
|-----------|---------------------|----------------------|---------------|
| `alumnos` | ~30 por grupo | 2-3 KB | Registro de alumnos |
| `diagnosticos` | ~1 por grupo/semestre | 5-10 KB | Análisis grupal |
| `planeaciones` | ~10 por docente/mes | 3-5 KB | Planeaciones didácticas |

**Total estimado para 1 grupo de 30 alumnos**: ~100 KB

---

## ✅ Checklist de Creación

- [ ] Crear proyecto en Firebase Console
- [ ] Habilitar Firestore Database
- [ ] Configurar reglas de seguridad
- [ ] Las colecciones se crean automáticamente al guardar el primer documento
- [ ] Verificar que los datos se guarden correctamente
- [ ] Crear índices compuestos si es necesario

---

**Nota**: Las colecciones en Firestore se crean automáticamente cuando guardas el primer documento. No necesitas crearlas manualmente.
