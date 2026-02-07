/**
 * Script de Migración: Agregar schoolId a Planeaciones Existentes
 * 
 * Este script:
 * 1. Busca todas las planeaciones sin schoolId
 * 2. Obtiene el schoolId del usuario que la creó
 * 3. Actualiza la planeación con el schoolId correcto
 * 4. Genera un reporte de migración
 * 
 * IMPORTANTE: Ejecutar ANTES de desplegar las nuevas reglas de Firestore
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    query,
    where
} from 'firebase/firestore';

// ============================================
// CONFIGURACIÓN
// ============================================

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// FUNCIONES DE MIGRACIÓN
// ============================================

interface MigrationReport {
    total: number;
    migradas: number;
    errores: number;
    sinUsuario: number;
    yaConSchoolId: number;
    detalles: Array<{
        planId: string;
        userId: string;
        schoolId?: string;
        status: 'success' | 'error' | 'skipped';
        mensaje: string;
    }>;
}

async function migrarPlaneaciones(): Promise<MigrationReport> {
    const report: MigrationReport = {
        total: 0,
        migradas: 0,
        errores: 0,
        sinUsuario: 0,
        yaConSchoolId: 0,
        detalles: []
    };

    console.log('🚀 Iniciando migración de planeaciones...\n');

    try {
        // 1. Obtener todas las planeaciones
        const planeacionesRef = collection(db, 'planeaciones');
        const snapshot = await getDocs(planeacionesRef);

        report.total = snapshot.size;
        console.log(`📊 Total de planeaciones encontradas: ${report.total}\n`);

        // 2. Procesar cada planeación
        for (const planDoc of snapshot.docs) {
            const planId = planDoc.id;
            const planData = planDoc.data();

            console.log(`\n🔍 Procesando planeación: ${planId}`);
            console.log(`   Título: ${planData.title || 'Sin título'}`);
            console.log(`   Usuario: ${planData.userId || 'No especificado'}`);

            // Verificar si ya tiene schoolId
            if (planData.schoolId) {
                console.log(`   ✅ Ya tiene schoolId: ${planData.schoolId}`);
                report.yaConSchoolId++;
                report.detalles.push({
                    planId,
                    userId: planData.userId,
                    schoolId: planData.schoolId,
                    status: 'skipped',
                    mensaje: 'Ya tiene schoolId'
                });
                continue;
            }

            // Verificar si tiene userId
            if (!planData.userId) {
                console.log(`   ⚠️  Sin userId - No se puede migrar`);
                report.sinUsuario++;
                report.detalles.push({
                    planId,
                    userId: 'N/A',
                    status: 'error',
                    mensaje: 'Sin userId'
                });
                continue;
            }

            try {
                // 3. Obtener el schoolId del usuario
                const userDoc = await getDoc(doc(db, 'users', planData.userId));

                if (!userDoc.exists()) {
                    console.log(`   ❌ Usuario no encontrado: ${planData.userId}`);
                    report.errores++;
                    report.detalles.push({
                        planId,
                        userId: planData.userId,
                        status: 'error',
                        mensaje: 'Usuario no encontrado'
                    });
                    continue;
                }

                const userData = userDoc.data();
                const schoolId = userData.schoolId;

                if (!schoolId) {
                    console.log(`   ⚠️  Usuario sin schoolId: ${planData.userId}`);
                    report.errores++;
                    report.detalles.push({
                        planId,
                        userId: planData.userId,
                        status: 'error',
                        mensaje: 'Usuario sin schoolId'
                    });
                    continue;
                }

                // 4. Actualizar la planeación con el schoolId
                await updateDoc(doc(db, 'planeaciones', planId), {
                    schoolId: schoolId,
                    migratedAt: new Date().toISOString()
                });

                console.log(`   ✅ Migrada exitosamente - schoolId: ${schoolId}`);
                report.migradas++;
                report.detalles.push({
                    planId,
                    userId: planData.userId,
                    schoolId: schoolId,
                    status: 'success',
                    mensaje: 'Migrada exitosamente'
                });

            } catch (error: any) {
                console.log(`   ❌ Error al migrar: ${error.message}`);
                report.errores++;
                report.detalles.push({
                    planId,
                    userId: planData.userId,
                    status: 'error',
                    mensaje: error.message
                });
            }
        }

        // 5. Generar reporte final
        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE FINAL DE MIGRACIÓN');
        console.log('='.repeat(60));
        console.log(`Total de planeaciones:        ${report.total}`);
        console.log(`✅ Migradas exitosamente:     ${report.migradas}`);
        console.log(`⏭️  Ya tenían schoolId:        ${report.yaConSchoolId}`);
        console.log(`⚠️  Sin userId:                ${report.sinUsuario}`);
        console.log(`❌ Errores:                    ${report.errores}`);
        console.log('='.repeat(60));

        // Guardar reporte en archivo
        const reportPath = './migration-report.json';
        const fs = require('fs');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Reporte guardado en: ${reportPath}`);

        return report;

    } catch (error: any) {
        console.error('\n❌ Error fatal en la migración:', error);
        throw error;
    }
}

// ============================================
// VALIDACIÓN POST-MIGRACIÓN
// ============================================

async function validarMigracion(): Promise<void> {
    console.log('\n🔍 Validando migración...\n');

    try {
        // Buscar planeaciones sin schoolId
        const planeacionesRef = collection(db, 'planeaciones');
        const snapshot = await getDocs(planeacionesRef);

        let sinSchoolId = 0;
        let conSchoolId = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.schoolId) {
                conSchoolId++;
            } else {
                sinSchoolId++;
                console.log(`⚠️  Planeación sin schoolId: ${doc.id}`);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDACIÓN');
        console.log('='.repeat(60));
        console.log(`Total de planeaciones:        ${snapshot.size}`);
        console.log(`✅ Con schoolId:              ${conSchoolId}`);
        console.log(`❌ Sin schoolId:              ${sinSchoolId}`);
        console.log('='.repeat(60));

        if (sinSchoolId === 0) {
            console.log('\n✅ ¡Migración completada exitosamente!');
            console.log('   Todas las planeaciones tienen schoolId.');
        } else {
            console.log('\n⚠️  Atención: Hay planeaciones sin schoolId.');
            console.log('   Revisa el reporte para más detalles.');
        }

    } catch (error: any) {
        console.error('\n❌ Error en la validación:', error);
        throw error;
    }
}

// ============================================
// EJECUCIÓN
// ============================================

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 MIGRACIÓN MULTI-ESCUELA');
    console.log('   Agregando schoolId a planeaciones existentes');
    console.log('='.repeat(60) + '\n');

    try {
        // Ejecutar migración
        const report = await migrarPlaneaciones();

        // Validar resultados
        await validarMigracion();

        console.log('\n✅ Proceso completado.');
        console.log('\n📌 Próximos pasos:');
        console.log('   1. Revisar el reporte: migration-report.json');
        console.log('   2. Desplegar las nuevas reglas de Firestore');
        console.log('   3. Probar el aislamiento multi-escuela\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

export { migrarPlaneaciones, validarMigracion };
