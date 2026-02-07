
const fs = require('fs');

const currentData = JSON.parse(fs.readFileSync('/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json', 'utf8'));

const newSubjects = [
    // SEMESTRE 1 (Ya están pero por si acaso)
    { name: "Ciencias Sociales I", sem: 1 },
    { name: "La materia y sus interacciones CNEYT I", sem: 1 },

    // SEMESTRE 2
    { name: "Ciencias Sociales II", sem: 2 },
    { name: "Conservación de la energía y su interacción con la materia CNEYT II", sem: 2 },
    { name: "Cultura Digital II", sem: 2 },
    { name: "Humanidades II", sem: 2 },
    { name: "Inglés II", sem: 2 },
    { name: "Lengua y Comunicación II", sem: 2 },
    { name: "Pensamiento Matemático II", sem: 2 },

    // SEMESTRE 3
    { name: "Ecosistemas, interacciones, energia y dinamica CNEYT III", sem: 3 },
    { name: "Humanidades III", sem: 3 },
    { name: "Inglés III", sem: 3 },
    { name: "Lengua y Comunicación III", sem: 3 },
    { name: "Pensamiento Matemático III", sem: 3 },

    // SEMESTRE 4
    { name: "Ciencias Sociales III", sem: 4 },
    { name: "Conciencia Histórica I", sem: 4 },
    { name: "Inglés IV", sem: 4 },
    { name: "Reacciones químicas conservación de la materia CNEYT IV", sem: 4 },

    // SEMESTRE 5
    { name: "Conciencia Histórica II", sem: 5 },
    { name: "La energía en los procesos de la vida diaria CNEYT V", sem: 5 },
    { name: "Análisis de Fenómenos Físicos I", sem: 5, type: "Extendido" },
    { name: "Derecho y Sociedad I", sem: 5, type: "Extendido" },
    { name: "Fundamentos de Administración I", sem: 5, type: "Extendido" },

    // SEMESTRE 6
    { name: "Conciencia Histórica III", sem: 6 },
    { name: "Cultura Digital III", sem: 6 },
    { name: "Organismos, estructuras y procesos CNEYT VI", sem: 6 },
    { name: "Análisis de Fenómenos Físicos II", sem: 6, type: "Extendido" },
    { name: "Derecho y Sociedad II", sem: 6, type: "Extendido" }
];

const template = (materia, semestre) => ({
    materia: materia,
    semestre: semestre,
    metadata: {
        nombre_uac: materia.toUpperCase(),
        semestre: semestre,
        creditos: 4,
        horas_semanales: 3
    },
    organizador_curricular: {
        categorias: ["Contenido Central", "Prácticas sugeridas"],
        metas_aprendizaje: ["Desarrollar comprensión profunda de los temas curriculares."]
    },
    progresiones: [
        {
            id: 1,
            descripcion: `Inicio de la exploración de los conceptos base de ${materia}.`,
            tematicas: ["Introducción", "Conceptos básicos"]
        },
        {
            id: 2,
            descripcion: `Análisis y aplicación de los principios fundamentales de ${materia} en contextos reales.`,
            tematicas: ["Aplicaciones", "Análisis"]
        }
    ]
});

newSubjects.forEach(s => {
    const exists = currentData.find(p => p.materia === s.name && p.semestre === s.sem);
    if (!exists) {
        currentData.push(template(s.name, s.sem));
    }
});

fs.writeFileSync('/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json', JSON.stringify(currentData, null, 2));
console.log("Inventario de materias actualizado");
