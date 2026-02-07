/**
 * Script de Migración: Agregar schoolId a Planeaciones Existentes
 * Versión JavaScript (no requiere ts-node)
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Cargar variables de entorno
dotenv.config();

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

console.log('🔧 Configuración Firebase:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// FUNCIONES DE MIGRACIÓN
// ============================================

async function migrarPlaneaciones() {
    const report = {
        total: 0,
        migradas: 0,
        errores: 0,
        sinUsuario: 0,
        yaConSchoolId: 0,
        detalles: []
    };

    console.log('\n' + '='.repeat(60));
    console.log('🚀 MIGRACIÓN MULTI-ESCUELA');
    console.log('   Agregando schoolId a planeaciones existentes');
    console.log('='.repeat(60) + '\n');

    try {
        // 1. Obtener todas las planeaciones
        console.log('📊 Obteniendo planeaciones...');
        const planeacionesRef = collection(db, 'planeaciones');
        const snapshot = await getDocs(planeacionesRef);

        report.total = snapshot.size;
        console.log(`   Total encontradas: ${report.total}\n`);

        if (report.total === 0) {
            console.log('ℹ️  No hay planeaciones para migrar.');
            console.log('   Esto es normal si es una instalación nueva.\n');
            return report;
        }

        // 2. Procesar cada planeación
        let contador = 0;
        for (const planDoc of snapshot.docs) {
            contador++;
            const planId = planDoc.id;
            const planData = planDoc.data();

            console.log(`\n[${contador}/${report.total}] 🔍 ${planId}`);
            console.log(`   Título: ${planData.title || 'Sin título'}`);

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
                console.log(`   ⚠️  Sin userId - Asignando schoolId por defecto`);

                // Asignar schoolId por defecto (la primera escuela registrada)
                try {
                    const schoolsRef = collection(db, 'schools');
                    const schoolsSnapshot = await getDocs(schoolsRef);

                    if (schoolsSnapshot.empty) {
                        console.log(`   ❌ No hay escuelas registradas`);
                        report.errores++;
                        continue;
                    }

                    const defaultSchoolId = schoolsSnapshot.docs[0].id;
                    await updateDoc(doc(db, 'planeaciones', planId), {
                        schoolId: defaultSchoolId,
                        userId: 'unknown',
                        migratedAt: Timestamp.now()
                    });

                    console.log(`   ✅ Asignada a escuela por defecto: ${defaultSchoolId}`);
                    report.migradas++;
                    continue;
                } catch (error) {
                    console.log(`   ❌ Error: ${error.message}`);
                    report.errores++;
                    continue;
                }
            }

            try {
                // 3. Obtener el schoolId del usuario
                const userDoc = await getDoc(doc(db, 'users', planData.userId));

                if (!userDoc.exists()) {
                    console.log(`   ⚠️  Usuario no encontrado: ${planData.userId}`);
                    console.log(`   → Asignando schoolId por defecto`);

                    const schoolsRef = collection(db, 'schools');
                    const schoolsSnapshot = await getDocs(schoolsRef);

                    if (!schoolsSnapshot.empty) {
                        const defaultSchoolId = schoolsSnapshot.docs[0].id;
                        await updateDoc(doc(db, 'planeaciones', planId), {
                            schoolId: defaultSchoolId,
                            migratedAt: Timestamp.now()
                        });
                        console.log(`   ✅ Asignada a escuela por defecto: ${defaultSchoolId}`);
                        report.migradas++;
                    } else {
                        report.errores++;
                    }
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
                    migratedAt: Timestamp.now()
                });

                console.log(`   ✅ Migrada → schoolId: ${schoolId}`);
                report.migradas++;
                report.detalles.push({
                    planId,
                    userId: planData.userId,
                    schoolId: schoolId,
                    status: 'success',
                    mensaje: 'Migrada exitosamente'
                });

            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
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
        console.log('📊 REPORTE FINAL');
        console.log('='.repeat(60));
        console.log(`Total de planeaciones:        ${report.total}`);
        console.log(`✅ Migradas exitosamente:     ${report.migradas}`);
        console.log(`⏭️  Ya tenían schoolId:        ${report.yaConSchoolId}`);
        console.log(`⚠️  Sin userId:                ${report.sinUsuario}`);
        console.log(`❌ Errores:                    ${report.errores}`);
        console.log('='.repeat(60));

        // Guardar reporte
        const reportPath = './migration-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Reporte guardado: ${reportPath}`);

        return report;

    } catch (error) {
        console.error('\n❌ Error fatal:', error);
        throw error;
    }
}

// ============================================
// VALIDACIÓN
// ============================================

async function validarMigracion() {
    console.log('\n🔍 Validando migración...\n');

    try {
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
                console.log(`⚠️  Sin schoolId: ${doc.id}`);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDACIÓN');
        console.log('='.repeat(60));
        console.log(`Total:                        ${snapshot.size}`);
        console.log(`✅ Con schoolId:              ${conSchoolId}`);
        console.log(`❌ Sin schoolId:              ${sinSchoolId}`);
        console.log('='.repeat(60));

        if (sinSchoolId === 0) {
            console.log('\n✅ ¡Perfecto! Todas las planeaciones tienen schoolId.');
        } else {
            console.log('\n⚠️  Hay planeaciones sin schoolId. Revisa el reporte.');
        }

    } catch (error) {
        console.error('\n❌ Error en validación:', error);
    }
}

// ============================================
// EJECUCIÓN
// ============================================

async function main() {
    try {
        await migrarPlaneaciones();
        await validarMigracion();

        console.log('\n✅ Proceso completado.');
        console.log('\n📌 Próximos pasos:');
        console.log('   1. Revisar: migration-report.json');
        console.log('   2. Desplegar reglas de Firestore');
        console.log('   3. Crear índices necesarios\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

main();
