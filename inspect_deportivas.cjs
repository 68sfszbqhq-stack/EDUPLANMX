
const fs = require('fs');
const path = require('path');

try {
    const jsonPath = path.join(__dirname, 'data/programas_sep.json');
    const data = fs.readFileSync(jsonPath, 'utf8');
    const json = JSON.parse(data);

    const targetSubjects = json.filter(p => p.materia.includes('Actividades Físicas y Deportivas'));

    console.log(`Found ${targetSubjects.length} subjects matching 'Actividades Físicas y Deportivas'`);

    targetSubjects.forEach(p => {
        console.log(`Subject: ${p.materia} (Semestre ${p.semestre})`);
        console.log(`Progresiones count: ${p.progresiones ? p.progresiones.length : 'MISSING'}`);
        if (p.progresiones && p.progresiones.length > 0) {
            console.log('Sample progression:', p.progresiones[0]);
        } else {
            console.log('Progresiones array is empty or undefined.');
        }
    });

} catch (e) {
    console.error('Error:', e);
}
