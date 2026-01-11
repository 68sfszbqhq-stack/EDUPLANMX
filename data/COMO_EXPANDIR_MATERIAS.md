# 📖 Guía para Expandir Materias del Catálogo MCCEMS

## Estado Actual

✅ **Cultura Digital II** - COMPLETAMENTE DETALLADA (modelo de referencia)
- 5 progresiones con metas y temáticas completas
- Recursos didácticos
- Criterios de evaluación

📝 **Demás materias** - Estructura básica funcional (29 materias)
- Progresiones con descripción
- Metas básicas
- Listo para expandir

---

## Cómo Agregar Detalle a una Materia

### Paso 1: Abre el archivo JSON
```bash
code data/programas_sep.json
```

### Paso 2: Busca la materia que quieres expandir
Por ejemplo, "Pensamiento Matemático II"

### Paso 3: Agrega las temáticas
Dentro de cada progresión, agrega el campo `tematicas`:

```json
{
  "id": 1,
  "descripcion": "Aplica razonamiento algebraico...",
  "metas": ["Meta 1", "Meta 2"],
  "tematicas": [                    // ← AGREGAR ESTO
    "Ecuaciones lineales",
    "Sistemas de ecuaciones",
    "Aplicaciones prácticas"
  ]
}
```

### Paso 4: Guarda y recarga
El sistema detectará automáticamente los cambios.

---

## Materias Prioritarias Sugeridas para Expandir

### SEMESTRE 1
1. **Pensamiento Matemático I** - Alta demanda
2. **Lengua y Comunicación I** - Alta demanda
3. **La Materia y sus Interacciones** - Ciencias

### SEMESTRE 2  
1. ✅ **Cultura Digital II** - YA COMPLETO
2. **Pensamiento Matemático II** - Alta demanda
3. **Lengua y Comunicación II** - Alta demanda

### SEMESTRE 3
1. **Pensamiento Matemático III** - Alta demanda
2. **Ecosistemas** - Ciencias
3. **Humanidades III** - Filosofía

---

## Plantilla para Expandir

Copia esta plantilla para agregar temáticas:

```json
"tematicas": [
  "Tema 1: Introducción al concepto X",
  "Tema 2: Desarrollo de habilidad Y",
  "Tema 3: Aplicación práctica Z",
  "Tema 4: Evaluación y retroalimentación",
  "Proyecto integrador: [descripción]"
]
```

---

## Recursos para Obtener Contenido

1. **PDFs oficiales DGB/SEP**: https://dgb.sep.gob.mx/marco-curricular
2. **Programas de estudio por semestre**: Disponibles en el sitio oficial
3. **Progresiones de aprendizaje**: Documentos PDF en el sitio SEP

---

## ¿Necesitas Ayuda?

Si quieres que expanda una materia específica, solo indícame cuál y la preparo completa.

