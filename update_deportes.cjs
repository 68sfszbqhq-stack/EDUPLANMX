
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data/programas_sep.json');
const data = fs.readFileSync(jsonPath, 'utf8');
let programas = JSON.parse(data);

const nuevasProgresionesI = [
    {
        id: 1,
        descripcion: "Evalúa su condición física actual mediante pruebas diagnósticas para identificar áreas de oportunidad en su salud y capacidades físicas.",
        tematicas: ["Diagnóstico físico", "Índice de Masa Corporal", "Capacidades físicas condicionales"]
    },
    {
        id: 2,
        descripcion: "Comprende los beneficios fisiológicos y psicológicos de la actividad física regular y los riesgos del sedentarismo.",
        tematicas: ["Salud y deporte", "Sedentarismo", "Beneficios de la actividad física"]
    },
    {
        id: 3,
        descripcion: "Desarrolla sus capacidades físicas condicionales (fuerza, velocidad, resistencia y flexibilidad) a través de rutinas específicas.",
        tematicas: ["Acondicionamiento físico", "Rutinas de ejercicio", "Fuerza y resistencia"]
    },
    {
        id: 4,
        descripcion: "Aplica los fundamentos técnicos básicos de un deporte de conjunto o individual, respetando sus reglas.",
        tematicas: ["Fundamentos deportivos", "Reglamento deportivo", "Técnica individual"]
    },
    {
        id: 5,
        descripcion: "Practica el juego limpio (Fair Play) y el trabajo colaborativo en actividades lúdicas y deportivas.",
        tematicas: ["Valores en el deporte", "Trabajo en equipo", "Juego limpio"]
    }
];

const nuevasProgresionesII = [
    {
        id: 1,
        descripcion: "Perfecciona las técnicas y tácticas de un deporte específico, integrando estrategias de juego colectivo.",
        tematicas: ["Estrategia deportiva", "Táctica", "Técnica avanzada"]
    },
    {
        id: 2,
        descripcion: "Organiza y participa en torneos deportivos intramuros, asumiendo diferentes roles (jugador, árbitro, organizador).",
        tematicas: ["Organización de eventos", "Arbitraje", "Gestión deportiva"]
    },
    {
        id: 3,
        descripcion: "Diseña un plan personal de actividad física para mantener un estilo de vida saludable a largo plazo.",
        tematicas: ["Plan de vida saludable", "Hábitos saludables", "Autocuidado"]
    },
    {
        id: 4,
        descripcion: "Analiza el impacto del deporte en la integración social y la prevención de conductas de riesgo.",
        tematicas: ["Deporte y sociedad", "Prevención de adicciones", "Convivencia sana"]
    },
    {
        id: 5,
        descripcion: "Demuestra liderazgo y actitudes positivas al resolver conflictos durante la práctica deportiva.",
        tematicas: ["Liderazgo", "Resolución de conflictos", "Inteligencia emocional en el deporte"]
    }
];

let modificados = 0;

programas = programas.map(p => {
    if (p.materia === "Actividades Físicas y Deportivas I 2025") {
        p.progresiones = nuevasProgresionesI;
        p.organizador_curricular = {
            categorias: ["Vida Saludable", "Cultura Física"],
            metas_aprendizaje: ["Desarrollo físico", "Cuidado de la salud"],
            propositos_formativos: ["Fomentar hábitos de vida saludable y la práctica regular de actividad física."]
        };
        modificados++;
    } else if (p.materia === "Actividades Físicas y Deportivas II 2025") {
        p.progresiones = nuevasProgresionesII;
        p.organizador_curricular = {
            categorias: ["Vida Saludable", "Integración Social"],
            metas_aprendizaje: ["Convivencia deportiva", "Gestión de torneos"],
            propositos_formativos: ["Integrar el deporte como medio para la convivencia social y el desarrollo personal."]
        };
        modificados++;
    }
    return p;
});

if (modificados > 0) {
    fs.writeFileSync(jsonPath, JSON.stringify(programas, null, 2), 'utf8');
    console.log(`✅ Actualizados ${modificados} programas de Actividades Físicas.`);
} else {
    console.log("⚠️ No se encontraron los programas de Actividades Físicas para actualizar.");
}
