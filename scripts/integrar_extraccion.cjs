/**
 * Integra los resultados de scripts/extraer_progresiones.py al catálogo
 * data/programas_sep.json.
 *
 * Reglas:
 *  - Solo integra extracciones con calidad BUENA o MEDIA y >= 3 progresiones.
 *  - Empareja por nombre normalizado EXACTO con las materias ya existentes.
 *  - Al integrar: reemplaza progresiones/metas/propósito, marca estado "oficial",
 *    corrige modelo según la generación oficial (2023-2026 → "2024",
 *    2025-2028 → "2025") y actualiza url_fuente/fecha.
 *  - NO agrega materias nuevas (los no emparejados se listan para revisión).
 *  - Respaldo automático del catálogo antes de escribir.
 *
 * Uso: node scripts/integrar_extraccion.cjs [--dry]
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const RUTA_CATALOGO = path.join(RAIZ, 'data', 'programas_sep.json');
const DIR_EXTRACCION = path.join(RAIZ, 'data', 'extraccion', 'json');
const DRY = process.argv.includes('--dry');

const normalizar = (s) => s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Nombres oficiales largos → nombre corto usado en el catálogo
const ALIAS = {
    'reacciones quimicas conservacion de la materia en la formacion de nuevas sustancias cneyt iv': 'reacciones quimicas conservacion de la materia cneyt iv',
    'organismos estructuras y procesos herencia y evolucion biologica cneyt vi': 'organismos estructuras y procesos cneyt vi',
};

const catalogo = JSON.parse(fs.readFileSync(RUTA_CATALOGO, 'utf8'));
const indice = new Map();
catalogo.forEach((p, i) => {
    const key = normalizar(p.materia);
    if (!indice.has(key)) indice.set(key, []);
    indice.get(key).push(i);
});

const archivos = fs.readdirSync(DIR_EXTRACCION).filter(f => f.endsWith('.json'));
let integrados = 0;
const sinMatch = [];
const descartados = [];

for (const archivo of archivos) {
    const ext = JSON.parse(fs.readFileSync(path.join(DIR_EXTRACCION, archivo), 'utf8'));

    const calidadOK = ['BUENA', 'MEDIA'].includes(ext.calidad_extraccion) && (ext.progresiones || []).length >= 3;
    if (!calidadOK) {
        descartados.push(`${ext.nombre} [${ext.generacion}] → ${ext.calidad_extraccion} (${(ext.progresiones || []).length} prog)`);
        continue;
    }

    // El nombre del manifiesto puede traer sufijos aclaratorios: "(área)", "(progresiones)"
    let key = normalizar(ext.nombre.replace(/\((área|progresiones)\)/gi, ''));
    key = ALIAS[key] || key;
    const posiciones = indice.get(key);

    if (!posiciones) {
        sinMatch.push(`${ext.nombre} [${ext.generacion}/${ext.componente}] → ${ext.progresiones.length} prog listas en data/extraccion/`);
        continue;
    }

    for (const i of posiciones) {
        const prev = catalogo[i];
        catalogo[i] = {
            ...prev,
            organizador_curricular: {
                ...prev.organizador_curricular,
                metas_aprendizaje: ext.metas_aprendizaje?.length ? ext.metas_aprendizaje : prev.organizador_curricular?.metas_aprendizaje || [],
                propositos_formativos: ext.proposito ? [ext.proposito] : prev.organizador_curricular?.propositos_formativos || []
            },
            progresiones: ext.progresiones.map(p => ({
                id: p.id,
                descripcion: p.descripcion,
                metas: ext.metas_aprendizaje || [],
                tematicas: ext.contenidos?.slice(0, 6) || []
            })),
            // La generación oficial manda sobre la heurística anterior
            modelo: ext.generacion === '2025-2028' ? '2025' : '2024',
            estado: 'oficial',
            url_fuente: ext.url,
            fecha_extraccion: new Date().toISOString(),
            extraccion: `automatica-v1 calidad=${ext.calidad_extraccion} (revisar contra PDF)`
        };
        integrados++;
        console.log(`✓ ${prev.materia} (S${prev.semestre}) ← ${ext.progresiones.length} progresiones oficiales [${ext.generacion}]`);
    }
}

console.log('\n' + '='.repeat(60));
console.log(`Integrados al catálogo: ${integrados}`);
console.log(`\nExtraídos SIN materia equivalente en el catálogo (${sinMatch.length}):`);
sinMatch.forEach(s => console.log('  · ' + s));
console.log(`\nDescartados por calidad insuficiente (${descartados.length}):`);
descartados.forEach(s => console.log('  · ' + s));

if (!DRY && integrados > 0) {
    const respaldo = RUTA_CATALOGO.replace('.json', `.backup-integracion-${new Date().toISOString().slice(0, 10)}.json`);
    fs.copyFileSync(RUTA_CATALOGO, respaldo);
    fs.writeFileSync(RUTA_CATALOGO, JSON.stringify(catalogo, null, 2));
    console.log(`\n💾 Catálogo actualizado (respaldo: ${path.basename(respaldo)})`);
} else {
    console.log('\n(dry-run: no se escribió nada)');
}
