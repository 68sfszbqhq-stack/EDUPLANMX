
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/programas_sep.json');
const data = fs.readFileSync(jsonPath, 'utf8');
let programas = JSON.parse(data);

const propositosYContenidos = [
    {
        id: 1,
        descripcion: "Participa en situaciones de juego y actividad física lúdica como una manifestación cultural y expresión de libertad, valorando también el juego como una experiencia formativa y una fuente de disfrute personal que promueve el bienestar y la creatividad.",
        tematicas: [
            "El juego como derecho humano",
            "El deporte y el juego",
            "Juegos tradicionales"
        ]
    },
    {
        id: 2,
        descripcion: "Participa en actividades deportivas como un derecho humano fundamental que favorece su desarrollo físico y emocional, y promueve la convivencia respetuosa en la diversidad y otras formas de vinculación y disfrute de su propio cuerpo.",
        tematicas: [
            "Derecho a participar en actividades físicas y deportivas",
            "Beneficios del deporte para la salud y la convivencia",
            "Diversidad corporal, étnica, cultural y sexogenérica como elementos enriquecedores en el deporte"
        ]
    },
    {
        id: 3,
        descripcion: "Explora las emociones y las posibilidades motrices que experimenta en la práctica deportiva, y la identifica como oportunidad para la toma de decisiones saludables, la capacidad de sentir y reconocer emociones y razonar sobre ellas, al tiempo que desarrolla sus potencialidades psicomotrices.",
        tematicas: [
            "Emociones que se identifican durante la práctica deportiva",
            "Importancia de las reglas y el respeto para canalizar emociones",
            "Uso del deporte para prevenir riesgos y tomar decisiones saludables",
            "Potencialidades psicomotrices de la corporalidad"
        ]
    },
    {
        id: 4,
        descripcion: "Identifica y cuestiona las prácticas discriminatorias y de violencia en el deporte por razones de género o corporalidad, para establecer relaciones empáticas, justas y libres de violencia, y desarrolla la capacidad de afiliación y respeto por la dignidad de cada persona.",
        tematicas: [
            "Discriminación en el deporte",
            "Respeto a las diversidades corporales e identidades sexogenéricas",
            "Comunicación asertiva para resolver conflictos y crear ambientes inclusivos"
        ]
    },
    {
        id: 5,
        descripcion: "Promueve la igualdad de oportunidades y la inclusión de todas las personas en el ámbito deportivo, especialmente de mujeres, diversidades sexogenéricas y personas en situación de discapacidad, cultivando una conciencia crítica que impulse el bienestar colectivo y el ejercicio pleno de sus capacidades humanas.",
        tematicas: [
            "Inclusión en el deporte",
            "Personas de la diversidad sexogenérica o en situación de discapacidad",
            "Crítica a las normas y estereotipos que limitan la participación",
            "Prácticas deportivas incluyentes como herramientas de transformación social"
        ]
    }
];

let modificados = 0;

programas = programas.map(p => {
    // Apply to both I and II as the PDF seems to cover the "Ámbito" in general, 
    // or implies these are the purposes for the subject. 
    // The previous file had generic purposes for both.
    if (p.materia === "Actividades Físicas y Deportivas I 2025" || p.materia === "Actividades Físicas y Deportivas II 2025") {

        // 1. Replace progresiones with Purposes + Contents
        p.progresiones = propositosYContenidos;

        // 2. Set official purposes list in organizador_curricular
        if (!p.organizador_curricular) p.organizador_curricular = {};

        p.organizador_curricular.propositos_formativos = propositosYContenidos.map(item => item.descripcion);

        // 3. Add generic categories if missing
        if (!p.organizador_curricular.categorias) {
            p.organizador_curricular.categorias = ["Formación Socioemocional", "Vida Saludable"];
        }

        modificados++;
        console.log(`Updated ${p.materia}`);
    }
    return p;
});

if (modificados > 0) {
    fs.writeFileSync(jsonPath, JSON.stringify(programas, null, 2), 'utf8');
    console.log(`✅ Success: Updated ${modificados} subjects with Propósitos and Contenidos extracted from PDF.`);
} else {
    console.log("⚠️ No matching subjects found.");
}
