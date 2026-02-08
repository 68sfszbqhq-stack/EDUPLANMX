
const fs = require('fs');
const path = require('path');

try {
    const jsonPath = path.join(__dirname, 'data/programas_sep.json');
    console.log(`Reading from: ${jsonPath}`);
    const data = fs.readFileSync(jsonPath, 'utf8');
    const json = JSON.parse(data);

    console.log(`✅ JSON valid. Found ${json.length} programs.`);

    if (json.length > 0) {
        const first = json[0];
        console.log('Sample program:', first.materia);

        if (!first.materia) console.error('❌ Missing "materia" field in first item');
        if (!first.semestre) console.error('❌ Missing "semestre" field in first item');
        if (!first.progresiones) console.error('❌ Missing "progresiones" field in first item');

        // Check if we have multiple subjects
        const subjects = new Set(json.map(p => p.materia));
        console.log(`Found ${subjects.size} unique subjects.`);
        console.log('Subjects:', Array.from(subjects).slice(0, 5));
    } else {
        console.error('❌ JSON array is empty');
    }
} catch (e) {
    console.error('❌ Error reading/parsing JSON:', e);
}
