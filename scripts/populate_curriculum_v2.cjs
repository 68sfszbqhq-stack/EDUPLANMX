
const fs = require('fs');
const currentData = JSON.parse(fs.readFileSync('/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json', 'utf8'));

const moreSubjects = [
    // Quinto Semestre Extendido
    { name: "Raíces etimológicas del español I", sem: 5 },
    { name: "Taller de Probabilidad y Estadística I", sem: 5 },
    { name: "Comunicación y Sociedad I", sem: 5 },
    { name: "Taller de Pensamiento Variacional I", sem: 5 },
    { name: "Psicología I", sem: 5 },
    { name: "Pensamiento Filosófico I", sem: 5 },
    { name: "Análisis de Fenómenos y Procesos Biológicos", sem: 5 },
    { name: "Pensamiento Matemático Aplicado a las Finanzas I", sem: 5 },
    { name: "Ingles V", sem: 5 },
    { name: "Dibujo Técnico I", sem: 5 },
    { name: "Salud Integral I", sem: 5 },
    { name: "Economía I. La función de los agentes económicos en la sociedad", sem: 5 },
    { name: "Procesos ContabIes I", sem: 5 },
    { name: "Temas Selectos de Ciencias Sociales I", sem: 5 },
    { name: "Arte y Cultura I", sem: 5 },
    { name: "Lógica y Pensamiento Crítico", sem: 5 },

    // Sexto Semestre Extendido
    { name: "Fundamentos de Administración II", sem: 6 },
    { name: "Organización del flujo de materia y energía en los organismos II", sem: 6 },
    { name: "Raíces etimológicas del español II", sem: 6 },
    { name: "Taller de Probabilidad y Estadística II", sem: 6 },
    { name: "Taller de Pensamiento Variacional II", sem: 6 },
    { name: "Comunicación y Sociedad II", sem: 6 },
    { name: "Psicología II", sem: 6 },
    { name: "Pensamiento Filosófico II", sem: 6 },
    { name: "Temas Selectos de Biología", sem: 6 },
    { name: "Ingles VI", sem: 6 },
    { name: "Dibujo TécnicoII", sem: 6 },
    { name: "Pensamiento Matemático Aplicado a las Finanzas-II", sem: 6 },
    { name: "Salud Integral II", sem: 6 },
    { name: "Economía II. Política económica y política pública mexicana", sem: 6 },
    { name: "Procesos ContabIes II", sem: 6 },
    { name: "Temas Selectos de Ciencias Sociales II", sem: 6 },
    { name: "Arte y Cultura II", sem: 6 },
    { name: "Experiencia Estética", sem: 6 },

    // Laboral
    { name: "Tecnologías de la Comunicación y la Información", sem: 3 },
    { name: "Higiene y Salud Comunitaria", sem: 3 },
    { name: "Diseño gráfico", sem: 3 }
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
        categorias: ["Contenido Central", "Transversalidad"],
        metas_aprendizaje: [`Dominar los aprendizajes fundamentales de ${materia}.`]
    },
    progresiones: [
        {
            id: 1,
            descripcion: `Bases y fundamentos de ${materia}.`,
            tematicas: ["Fundamentos"]
        },
        {
            id: 2,
            descripcion: `Profundización en los temas clave de ${materia}.`,
            tematicas: ["Desarrollo"]
        }
    ]
});

moreSubjects.forEach(s => {
    const exists = currentData.find(p => p.materia === s.name && p.semestre === s.sem);
    if (!exists) {
        currentData.push(template(s.name, s.sem));
    }
});

fs.writeFileSync('/Users/josemendoza/.gemini/antigravity/scratch/EDUPLANMX/data/programas_sep.json', JSON.stringify(currentData, null, 2));
console.log("Inventario extendido actualizado");
