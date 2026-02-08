
const { programasSEPService } = require('./src/services/programasSEPService.ts');
// Note: We can't easily run TS directly without compilation.
// Instead, I'll inspect the service file again to ensure it exports correctly for the app.
// It seems fine.

// Let's just create a small node script that reads the JSON directly to verify its structure is what the service expects.
const fs = require('fs');
const path = require('path');

try {
    const data = fs.readFileSync(path.join(__dirname, 'data/programas_sep.json'), 'utf8');
    const json = JSON.parse(data);
    console.log(`✅ JSON valid. Found ${json.length} programs.`);
    if (json.length > 0) {
        console.log('Sample program:', json[0].materia);
        if (!json[0].materia) console.error('❌ Missing "materia" field in first item');
        if (!json[0].semestre) console.error('❌ Missing "semestre" field in first item');
    } else {
        console.error('❌ JSON array is empty');
    }
} catch (e) {
    console.error('❌ Error reading/parsing JSON:', e);
}
