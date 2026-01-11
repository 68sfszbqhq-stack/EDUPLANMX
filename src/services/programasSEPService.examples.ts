/**
 * Ejemplos de uso del servicio de Programas SEP
 * Para integración con la generación de planeaciones
 */

import { programasSEPService } from './programasSEPService';

// ============================================
// EJEMPLO 1: Búsqueda básica por materia
// ============================================
console.log('\n📚 EJEMPLO 1: Búsqueda por materia');
console.log('='

    .repeat(60));

const programasPM = programasSEPService.buscarPorMateria('Pensamiento Matemático');
console.log(`Encontrados ${programasPM.length} programas de Pensamiento Matemático`);
programasPM.forEach(p => {
    console.log(`  - Semestre ${p.semestre}: ${p.progresiones.length} progresiones`);
});

// ============================================
// EJEMPLO 2: Búsqueda por semestre
// ============================================
console.log('\n📅 EJEMPLO 2: Programas del 1er semestre');
console.log('='.repeat(60));

const programasSem1 = programasSEPService.buscarPorSemestre(1);
console.log(`Total de programas en 1er semestre: ${programasSem1.length}`);
programasSem1.forEach(p => {
    console.log(`  - ${p.materia}`);
});

// ============================================
// EJEMPLO 3: Búsqueda combinada
// ============================================
console.log('\n🎯 EJEMPLO 3: Búsqueda específica');
console.log('='.repeat(60));

const programaEspecifico = programasSEPService.buscarPorMateriaYSemestre(
    'Pensamiento Matemático',
    2
);

if (programaEspecifico) {
    console.log(`✅ Programa encontrado: ${programaEspecifico.materia}`);
    console.log(`   Créditos: ${programaEspecifico.metadata.creditos}`);
    console.log(`   Horas semanales: ${programaEspecifico.metadata.horas_semanales}`);
    console.log(`   Progresiones: ${programaEspecifico.progresiones.length}`);
    console.log(`   Categorías: ${programaEspecifico.organizador_curricular.categorias.join(', ')}`);
}

// ============================================
// EJEMPLO 4: Obtener progresiones para IA
// ============================================
console.log('\n🤖 EJEMPLO 4: Contexto para generación de IA');
console.log('='.repeat(60));

const contextoIA = programasSEPService.generarContextoIA('Lengua y Comunicación', 1);
console.log(contextoIA);

// ============================================
// EJEMPLO 5: Validación de planeación
// ============================================
console.log('\n✅ EJEMPLO 5: Validación de planeación');
console.log('='.repeat(60));

const planeacionSimulada = [
    'Aplicar el razonamiento algebraico para resolver problemas',
    'Desarrollar el pensamiento lógico matemático',
    'Esta progresión no existe en el programa oficial' // Esto NO debe coincidir
];

const validacion = programasSEPService.validarPlaneacion(
    'Pensamiento Matemático',
    2,
    planeacionSimulada
);

console.log(`Planeación válida: ${validacion.esValida ? '✅ SÍ' : '❌ NO'}`);
console.log(`Coincidencias encontradas: ${validacion.coincidencias}/${planeacionSimulada.length}`);
console.log(`Progresiones oficiales disponibles: ${validacion.progresionesOficiales.length}`);

if (validacion.sugerencias.length > 0) {
    console.log('\n💡 Sugerencias de mejora:');
    validacion.sugerencias.forEach((sug, i) => {
        console.log(`  ${i + 1}. ${sug}`);
    });
}

// ============================================
// EJEMPLO 6: Estadísticas del catálogo
// ============================================
console.log('\n📊 EJEMPLO 6: Estadísticas del catálogo');
console.log('='.repeat(60));

const stats = programasSEPService.obtenerEstadisticas();
console.log(`Total de programas: ${stats.totalProgramas}`);
console.log(`Última actualización: ${stats.ultimaActualizacion.toLocaleDateString('es-MX')}`);
console.log('\nDistribución por semestre:');
stats.programasPorSemestre.forEach(({ semestre, cantidad }) => {
    console.log(`  Semestre ${semestre}: ${cantidad} programas`);
});

console.log('\nMaterias disponibles:');
stats.materiasDisponibles.slice(0, 10).forEach(materia => {
    console.log(`  - ${materia}`);
});
if (stats.materiasDisponibles.length > 10) {
    console.log(`  ... y ${stats.materiasDisponibles.length - 10} más`);
}

// ============================================
// EJEMPLO 7: Integración con generador de IA
// ============================================
console.log('\n🎓 EJEMPLO 7: Flujo completo de generación');
console.log('='.repeat(60));

async function generarPlaneacionConValidacion(materia: string, semestre: number, tema: string) {
    console.log(`\n1️⃣ Consultando programa oficial...`);
    const contexto = programasSEPService.generarContextoIA(materia, semestre);

    console.log(`2️⃣ Generando planeación con IA (simulado)...`);
    // Aquí iría la llamada a tu API de IA (Google AI, OpenAI, etc.)
    const planeacionGenerada = {
        tema,
        progresiones: [
            'Aplicar conceptos matemáticos en problemas reales',
            'Desarrollar habilidades de razonamiento lógico'
        ]
    };

    console.log(`3️⃣ Validando contra programa oficial...`);
    const validacion = programasSEPService.validarPlaneacion(
        materia,
        semestre,
        planeacionGenerada.progresiones
    );

    console.log(`\n✅ Resultado:`);
    console.log(`   Tema: ${planeacionGenerada.tema}`);
    console.log(`   Progresiones incluidas: ${planeacionGenerada.progresiones.length}`);
    console.log(`   Validez: ${validacion.esValida ? '✅ VÁLIDA' : '⚠️ REVISAR'}`);
    console.log(`   Coincidencias: ${validacion.coincidencias}/${planeacionGenerada.progresiones.length}`);

    return {
        planeacion: planeacionGenerada,
        validacion,
        contextoOficial: contexto
    };
}

// Ejecutar ejemplo
generarPlaneacionConValidacion('Pensamiento Matemático', 2, 'Álgebra Lineal')
    .then(resultado => {
        console.log('\n🎉 Proceso completado exitosamente');
    });
