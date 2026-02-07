
const fs = require('fs');
const currentData = JSON.parse(fs.readFileSync('/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json', 'utf8'));

const mandatoryExtended = [
    { name: "Pensamiento Literario", sem: 5 },
    { name: "Taller de Cultura Digital", sem: 5 },
    { name: "Temas Selectos de Matemáticas I", sem: 5 },
    { name: "Temas Selectos de Matemáticas II", sem: 6 },
    { name: "Espacio y Sociedad", sem: 5 },
    { name: "Taller de Ciencias I", sem: 5 },
    { name: "Laboratorio de Investigación", sem: 5 },
    { name: "Taller de Ciencias II", sem: 6 }
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
        categorias: ["Investigación", "Aplicación"],
        metas_aprendizaje: [`Profundizar en ${materia}.`]
    },
    progresiones: [
        {
            id: 1,
            descripcion: `Fundamentos avanzados de ${materia}.`,
            tematicas: ["Teoría avanzada"]
        }
    ]
});

mandatoryExtended.forEach(s => {
    const exists = currentData.find(p => p.materia === s.name && p.semestre === s.sem);
    if (!exists) {
        currentData.push(template(s.name, s.sem));
    }
});

fs.writeFileSync('/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json', JSON.stringify(currentData, null, 2));
console.log("Materias obligatorias extendidas actualizadas");
