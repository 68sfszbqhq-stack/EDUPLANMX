/**
 * Fase A del saneamiento del catálogo MCCEMS (julio 2026)
 *
 * 1. Etiqueta cada programa con:
 *    - modelo: "2024" (plan original MCCEMS) | "2025" (generación 2025-2028)
 *    - estado: "oficial" (progresiones reales extraídas de la DGB)
 *              | "borrador" (esqueletos generados por scripts o vacíos)
 * 2. Corrige typos en nombres de materias.
 * 3. Elimina duplicados dejando cada UAC en su semestre correcto.
 * 4. Guarda respaldo del original antes de escribir.
 *
 * Uso: node scripts/etiquetar_modelos.cjs
 */

const fs = require('fs');
const path = require('path');

const RUTA = path.join(__dirname, '..', 'data', 'programas_sep.json');
const RESPALDO = path.join(__dirname, '..', 'data', `programas_sep.backup-${new Date().toISOString().slice(0, 10)}.json`);

const programas = JSON.parse(fs.readFileSync(RUTA, 'utf8'));
fs.writeFileSync(RESPALDO, JSON.stringify(programas, null, 2));
console.log(`📦 Respaldo guardado: ${path.basename(RESPALDO)} (${programas.length} programas)`);

// ---------------------------------------------------------------
// 1. TYPOS: nombre incorrecto → nombre correcto
// ---------------------------------------------------------------
const TYPOS = {
    'Ingles V': 'Inglés V',
    'Ingles VI': 'Inglés VI',
    'Dibujo TécnicoII': 'Dibujo Técnico II',
    'Procesos ContabIes I': 'Procesos Contables I',
    'Procesos ContabIes II': 'Procesos Contables II',
    'Pensamiento Matemático Aplicado a las Finanzas-II': 'Pensamiento Matemático Aplicado a las Finanzas II',
};

// ---------------------------------------------------------------
// 2. DUPLICADOS a eliminar: [materia (ya corregida), semestre equivocado]
//    Se conserva la copia del semestre correcto / con mejor contenido.
// ---------------------------------------------------------------
const ELIMINAR = [
    ['Ciencias Sociales III', 4],        // pertenece al semestre 3
    ['Conciencia Histórica I', 3],       // pertenece al semestre 4
    ['Cultura Digital III', 6],          // la versión completa (8 prog) vive en semestre 3
    ['Taller de Ciencias I', 5],         // la versión completa (6 prog) vive en semestre 2
    ['Laboratorio de Investigación', 5], // la versión completa (7 prog) vive en semestre 1
];

// ---------------------------------------------------------------
// 3. Clasificadores
// ---------------------------------------------------------------
function clasificarEstado(p) {
    const progs = p.progresiones || [];
    if (progs.length === 0) return 'borrador';
    const totalTexto = progs.reduce((a, pr) => a + (pr.descripcion || '').length, 0);
    const promedio = totalTexto / progs.length;
    // Texto de relleno generado: menciona la propia materia o frases plantilla
    const generico = progs.some(pr =>
        (pr.descripcion || '').includes('conceptos base de') ||
        (pr.descripcion || '').includes(p.materia)
    );
    if (generico || (progs.length <= 3 && promedio < 150)) return 'borrador';
    return 'oficial';
}

function clasificarModelo(p) {
    // Marcadores del plan nuevo (generación 2025-2028): CNEyT y sufijo "2025"
    if (/CNEYT/i.test(p.materia) || / 2025$/.test(p.materia)) return '2025';
    return '2024';
}

// ---------------------------------------------------------------
// 4. Transformación
// ---------------------------------------------------------------
let corregidos = 0;
const transformados = programas.map(p => {
    // Modelo se decide ANTES de limpiar el sufijo " 2025"
    const modelo = clasificarModelo(p);

    let materia = TYPOS[p.materia] || p.materia;
    if (materia !== p.materia) corregidos++;

    // El sufijo " 2025" era un hack para marcar versión; ahora hay campo modelo
    if (/ 2025$/.test(materia)) {
        materia = materia.replace(/ 2025$/, '');
        corregidos++;
    }

    return {
        ...p,
        materia,
        metadata: { ...p.metadata, nombre_uac: materia.toUpperCase() },
        modelo,
        estado: clasificarEstado(p),
    };
});

// Eliminar duplicados
const finales = transformados.filter(p =>
    !ELIMINAR.some(([mat, sem]) => p.materia === mat && p.semestre === sem)
);

fs.writeFileSync(RUTA, JSON.stringify(finales, null, 2));

// ---------------------------------------------------------------
// 5. Reporte
// ---------------------------------------------------------------
const resumen = {};
finales.forEach(p => {
    const k = `modelo ${p.modelo} / ${p.estado}`;
    resumen[k] = (resumen[k] || 0) + 1;
});
console.log(`\n✅ Escrito ${path.basename(RUTA)}: ${finales.length} programas (${programas.length - finales.length} duplicados eliminados, ${corregidos} nombres corregidos)`);
Object.entries(resumen).sort().forEach(([k, v]) => console.log(`   ${k}: ${v} UAC`));
