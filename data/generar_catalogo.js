// Script para generar el catálogo completo MCCEMS
// Este archivo se puede ejecutar para regenerar el catálogo si es necesario

const fs = require('fs');

const catalogoCompleto = [
    // CULTURA DIGITAL II ya existe, se mantiene
    require('./programas_sep_completo.json')[0],

    // Agregar las demás materias con detalle progresivo
];

fs.writeFileSync(
    './programas_sep_final.json',
    JSON.stringify(catalogoCompleto, null, 2),
    'utf-8'
);

console.log('✅ Catálogo generado');
