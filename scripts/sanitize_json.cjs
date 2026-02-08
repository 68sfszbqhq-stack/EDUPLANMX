
const fs = require('fs');

const path = '/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json';
const rawData = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Eliminar duplicados exactos (materia + semestre)
const uniqueMap = new Map();
rawData.forEach(item => {
    const key = `${item.materia.toLowerCase().trim()}-${item.semestre}`;
    if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
    } else {
        // Si ya existe, fusionar si el nuevo tiene más datos
        const existing = uniqueMap.get(key);
        if (item.progresiones?.length > (existing.progresiones?.length || 0)) {
            uniqueMap.set(key, item);
        }
    }
});

let data = Array.from(uniqueMap.values());

// 2. Datos específicos del PDF 2025 para Formación Socioemocional
const orientacionesSocioemocionales = [
    "Aprendizaje Basado en Proyectos (ABP)",
    "Círculos deliberativos y diálogos socráticos",
    "Juegos de roles y sociodramas",
    "Cartografías sociales y mapeos comunitarios",
    "Asambleas escolares y deportivas",
    "Cine-debates y análisis de medios",
    "Campañas de sensibilización pública",
    "Teatro y expresiones artísticas colaborativas"
];

const criteriosEvaluacionSocioemocional = [
    { aspecto: "Autoconocimiento", descripcion: "Capacidad de reconocer emociones y necesidades personales.", porcentaje: 20 },
    { aspecto: "Participación Colaborativa", descripcion: "Integración y respeto en actividades de grupo.", porcentaje: 30 },
    { aspecto: "Reflexión Crítica", descripcion: "Análisis sobre el impacto de hábitos y conductas en el bienestar.", porcentaje: 25 },
    { aspecto: "Acción Transformadora", descripcion: "Propuesta y ejecución de acciones para la mejora del entorno.", porcentaje: 25 }
];

const bibliografiaSocioemocional = [
    { tipo: "libro", titulo: "Y el cerebro creó al hombre", autor: "Damasio, A.", año: 2010, disponibilidad: "digital" },
    { tipo: "libro", titulo: "Crear capacidades: Propuesta para el desarrollo humano", autor: "Nussbaum, M.", año: 2012, disponibilidad: "biblioteca" },
    { tipo: "libro", titulo: "Homo Ludens", autor: "Huizinga, J.", año: 2012, disponibilidad: "biblioteca" },
    { tipo: "manual", titulo: "Programas de Estudio MCCEMS 2025", autor: "DGB-SEP", año: 2025, disponibilidad: "digital" }
];

// Mapas de propósitos ya definidos (mejorados)
const fundamentalConfigs = {
    "lengua": {
        categorias: ["Comunicación", "Pensamiento Crítico"],
        metas: ["Hablar", "Escuchar", "Leer", "Escribir"]
    },
    "matemático": {
        categorias: ["Pensamiento Lógico", "Modelación"],
        metas: ["Resolución de problemas", "Pensamiento algorítmico"]
    },
    "digital": {
        categorias: ["Ciudadanía Digital", "Pensamiento Computacional"],
        metas: ["Uso ético de TIC", "Programación básica"]
    },
    "sociales": {
        categorias: ["Conciencia Social", "Historia"],
        metas: ["Interpretación histórica", "Participación ciudadana"]
    },
    "naturales": {
        categorias: ["Pensamiento Científico", "Ambiente"],
        metas: ["Experimentación", "Desarrollo sostenible"]
    },
    "filosófico": {
        categorias: ["Humanidades", "Ética"],
        metas: ["Reflexión existencial", "Argumentación ética"]
    },
    "inglés": {
        categorias: ["Comunicación Extranjera", "Interculturalidad"],
        metas: ["Listening", "Reading", "Speaking", "Writing"]
    }
};

data.forEach(item => {
    const materiaLower = item.materia.toLowerCase();

    // Estructura Base
    if (!item.organizador_curricular) item.organizador_curricular = {};
    if (!item.organizador_curricular.categorias) item.organizador_curricular.categorias = [];
    if (!item.organizador_curricular.metas_aprendizaje) item.organizador_curricular.metas_aprendizaje = [];
    if (!item.organizador_curricular.propositos_formativos) item.organizador_curricular.propositos_formativos = [];

    if (!item.orientaciones_didacticas) item.orientaciones_didacticas = [];
    if (!item.criterios_evaluacion) item.criterios_evaluacion = [];
    if (!item.bibliografia) item.bibliografia = [];

    // Llenado específico para SOCIOEMOCIONAL
    if (materiaLower.includes("formación socioemocional")) {
        if (item.organizador_curricular.categorias.length === 0) {
            item.organizador_curricular.categorias = ["Práctica y Colaboración Ciudadana", "Educación para la Salud", "Actividades Físicas", "Sexualidad y Género", "Artes"];
        }
        item.orientaciones_didacticas = orientacionesSocioemocionales;
        item.criterios_evaluacion = criteriosEvaluacionSocioemocional;
        item.bibliografia = bibliografiaSocioemocional;
    }
    // Llenado para FUNDAMENTALES
    else {
        let found = false;
        for (const [key, config] of Object.entries(fundamentalConfigs)) {
            if (materiaLower.includes(key)) {
                if (item.organizador_curricular.categorias.length === 0) item.organizador_curricular.categorias = config.categorias;
                if (item.organizador_curricular.metas_aprendizaje.length === 0) item.organizador_curricular.metas_aprendizaje = config.metas;
                found = true;
                break;
            }
        }
        if (!found && item.organizador_curricular.categorias.length === 0) {
            item.organizador_curricular.categorias = ["Formación Fundamental"];
            item.organizador_curricular.metas_aprendizaje = ["Logro de aprendizajes clave"];
        }
    }

    // Asegurar que siempre haya una fecha de extracción si falta
    if (!item.fecha_extraccion) item.fecha_extraccion = new Date().toISOString();
    if (!item.url_fuente) item.url_fuente = "https://dgb.sep.gob.mx/marco-curricular";
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`✅ Base de datos saneada: ${data.length} materias únicas.`);
console.log(`🚀 Campos de categorías, orientaciones y evaluación actualizados.`);
