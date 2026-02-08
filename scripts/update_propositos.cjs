
const fs = require('fs');

const path = '/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Mapa de propósitos oficiales para Formación Socioemocional (según PDF)
const socioemotionalPurposes = {
    "Práctica y Colaboración Ciudadana": [
        "Reconoce los principales instrumentos que tutelan los derechos humanos en general, y específicamente de las infancias, adolescencias y juventudes.",
        "Analiza las causas de las situaciones de inseguridad y violencia existentes en su entorno familiar, escolar o comunitario y que afectan su bienestar físico, mental, emocional o social, para promover acciones colectivas de autocuidado y una cultura de paz.",
        "Reflexiona desde la perspectiva de género sobre las dimensiones de la violencia de género contra las mujeres y contra las diversidades sexogenéricas, para promover relaciones de respeto a partir del reconocimiento de los derechos humanos.",
        "Investiga la forma en que los hábitos de consumo, formas de producción en la comunidad, y prácticas y comportamientos en la vida cotidiana influyen en el medio ambiente, el cambio climático y el bienestar personal y colectivo a nivel local, nacional e internacional.",
        "Desarrollar las habilidades de diálogo y escucha activa para la construcción de grupos de trabajo colaborativo durante la identificación y solución de problemas de su entorno."
    ],
    "Educación para la Salud": [
        "Desarrolla, junto con la comunidad estudiantil a la que pertenece, una conciencia crítica y reflexiva sobre los hábitos que configuran su existencia, y promueve el cuidado de sí como una práctica ética que articula el bienestar físico, emocional, mental y social.",
        "Desarrolla la capacidad de discernir y elegir prácticas alimenticias que expresen un cuidado consciente de sí, del cuerpo y del entorno, para fomentar una relación ética con la alimentación que reconozca su dimensión cultural, ecológica y política, y que contribuya a una vida más justa y sostenible.",
        "Identifica, analiza y transforma los factores que afectan el bienestar, a partir del ejercicio del cuidado de sí —con autoconocimiento, autodominio y libertad ética—, para convertirse en agente activo de la salud que reconoce su poder de decisión ante prácticas riesgosas.",
        "Impulsa la construcción de las relaciones interpersonales, basadas en el respeto, el diálogo y el reconocimiento de las diferencias entre personas, entediendo que el cuidado de sí, incluye la manera de vincularse con las demás personas, para promover una ética de la convivencia que contribuya al bienestar común y a la transformación de dinámicas violentas."
    ],
    "Actividades Físicas y Deportivas": [
        "Participa en situaciones de juego y actividad física lúdica como una manifestación cultural y expresión de libertad, valorando también el juego como una experiencia formativa y una fuente de disfrute personal que promueve el bienestar y la creatividad.",
        "Participa en actividades deportivas como un derecho humano fundamental que favorece su desarrollo físico y emocional, y promueve la convivencia respetuosa en la diversidad y otras formas de vinculación y disfrute de su propio cuerpo.",
        "Explora las emociones y las posibilidades motrices que experimenta en la práctica deportiva, y la identifica como oportunidad para la toma de decisiones saludables, la capacidad de sentir y reconocer emociones y razonar sobre ellas, al tiempo que desarrolla sus potencialidades psicomotrices.",
        "Identifica y cuestiona las prácticas discriminatorias y de violencia en el deporte por razones de género o corporalidad, para establecer relaciones empáticas, justas y libres de violencia, y desarrolla la capacidad de afiliación y respeto por la dignidad de cada persona.",
        "Promueve la igualdad de oportunidades y la inclusión de todas las personas en el ámbito deportivo, especialmente de mujeres, diversidades sexogenéricas y personas en situación de discapacidad, cultivando una conciencia crítica que impulse el bienestar colectivo y el ejercicio pleno de sus capacidades humanas."
    ],
    "Educación Integral en Sexualidad y Género": [
        "Comprende la identidad y orientación sexual, así como la construcción de vínculos afectivos saludables, mediante habilidades de comunicación, diálogo y responsabilidad afectiva en relaciones sociales.",
        "Reconoce las dimensiones de la sexualidad desde un enfoque de derechos humanos y sexuales, desmitificando creencias, hábitos y estereotipos, y valorando la diversidad sexual como parte de la identidad y expresión colectiva.",
        "Analiza la influencia de los roles de género en la toma de decisiones sobre la vida sexual y reproductiva, y promueve tanto la prevención de embarazos no planificados como el ejercicio informado y corresponsable de la sexualidad.",
        "Desarrolla una conciencia crítica sobre le cuerpo, la autonomía y el placer, al cuestionar las normas sociales, culturales y de género que propician la discriminación y la violencia.",
        "Ejerce una ciudadanía sexual crítica e informada, que integra el cuidado de sí, el acceso a la salud sexual y reproductiva, y la construcción de un proyecto de vida con perspectiva de género, libre de estereotipos, violencias y jerarquías."
    ],
    "Actividades Artísticas y Culturales": [
        "Participa de diversas expresiones artísticas para comunicar emociones, ideas y experiencias personales y del colectivo al que pertenece.",
        "Genera manifestaciones artísticas variadas como formas de expresión política frente a los problemas que afectan a su comunidad y entorno.",
        "Recrea la obra de artistas cuyas creaciones buscaron problematizar la realidad y dar cuenta de un posicionamiento político, y formaron parte de procesos colectivos de transformación social.",
        "Experimenta el arte como un espacio para el autodescubrimiento y el autoconocimiento en el marco de la complejidad de su contexto y momento histórico."
    ]
};

// Mapa general para materias fundamentales
const fundamentalPurposes = {
    "Lengua y Comunicación": [
        "El estudiante sea capaz de utilizar la lengua como herramienta de pensamiento para ampliar sus conocimientos y habilidades de expresión.",
        "Desarrollar habilidades comunicativas (hablar, escuchar, leer y escribir) en contextos diversos para una participación ciudadana activa."
    ],
    "Pensamiento Matemático": [
        "Desarrollar la capacidad de modelar situaciones, resolver problemas y justificar resultados mediante lenguajes y métodos matemáticos.",
        "Fomentar el pensamiento crítico y la toma de decisiones informadas a través del análisis de datos y patrones."
    ],
    "Cultura Digital": [
        "Utilizar herramientas digitales de manera innovadora y eficiente para acceder al conocimiento y experiencias de aprendizaje.",
        "Construir una ciudadanía digital responsable, ética y crítica en el uso de las tecnologías de la información."
    ],
    "Humanidades": [
        "Reflexionar sobre la condición humana, la cultura y la sociedad para construir una visión crítica y ética del entorno.",
        "Desarrollar el pensamiento filosófico para el análisis de problemas existenciales y sociales contemporáneos."
    ],
    "Ciencias Sociales": [
        "Comprender la dinámica de la sociedad y sus instituciones para participar de manera responsable en la vida pública.",
        "Analizar procesos históricos y sociales para entender el presente y proponer alternativas de futuro."
    ],
    "Ciencias Naturales": [
        "Comprender los fenómenos naturales mediante el pensamiento científico y la experimentación.",
        "Analizar la relación entre ciencia, tecnología, sociedad y ambiente para un desarrollo sostenible."
    ]
};

data.forEach(item => {
    // 1. Asegurar que exista organizador_curricular
    if (!item.organizador_curricular) {
        item.organizador_curricular = {};
    }

    // 2. Poblar propósitos formativos
    const materiaLower = item.materia.toLowerCase();
    let propósitos = [];

    if (materiaLower.includes("formación socioemocional")) {
        // Combinar todos los propósitos de los 5 ámbitos
        Object.values(socioemotionalPurposes).forEach(pList => {
            propósitos.push(...pList);
        });
    } else {
        // Buscar en fundamentales
        for (const [key, value] of Object.entries(fundamentalPurposes)) {
            if (materiaLower.includes(key.toLowerCase())) {
                propósitos = value;
                break;
            }
        }
    }

    // Si no encontramos específicos, poner uno genérico
    if (propósitos.length === 0) {
        propósitos = [`Contribuir a la formación integral del estudiante en el área de ${item.materia} bajo el marco del MCCEMS 2025.`];
    }

    item.organizador_curricular.propositos_formativos = propósitos;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Actualizados ${data.length} programas con propósitos formativos 2025.`);
