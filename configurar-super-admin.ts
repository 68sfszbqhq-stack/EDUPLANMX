
import { authService } from './src/services/authService';
import { db } from './src/config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import type { RegisterData } from './types/auth';

const TARGET_EMAIL = 'jose.mendoza.buap@gmail.com'; // Corrected from gmil.com
const DEFAULT_PASSWORD = 'Admin123!';

async function configurarSuperAdmin() {
    console.log(`🔐 Configurando Super Admin para: ${TARGET_EMAIL}...\n`);

    try {
        // 1. Buscar si el usuario ya existe en Firestore
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', TARGET_EMAIL));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Usuario existe, actualizar rol
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            console.log(`✅ Usuario encontrado en Firestore (ID: ${userDoc.id})`);
            console.log(`   Rol actual: ${userData.rol}`);

            if (userData.rol === 'superadmin') {
                console.log('✨ El usuario ya es Super Admin. No se requieren cambios.');
                return;
            }

            console.log('🔄 Actualizando rol a superadmin...');
            await updateDoc(doc(db, 'usuarios', userDoc.id), {
                rol: 'superadmin'
            });
            console.log('✅ Rol actualizado exitosamente!');

        } else {
            // Usuario no existe en Firestore, intentar registrarlo
            console.log('⚠️ Usuario no encontrado en Firestore.');
            console.log('🆕 Intentando crear nueva cuenta...');

            const newAdminData: RegisterData = {
                email: TARGET_EMAIL,
                password: DEFAULT_PASSWORD,
                nombre: 'Jose H.',
                apellidoPaterno: 'Mendoza',
                apellidoMaterno: '',
                rol: 'superadmin'
            };

            try {
                const usuario = await authService.register(newAdminData, 'script-config');
                console.log('✅ Usuario creado exitosamente como Super Admin!');
                console.log(`🔑 Contraseña temporal: ${DEFAULT_PASSWORD}`);
            } catch (error: any) {
                if (error.message.includes('email-already-in-use')) {
                    console.log('❌ El email ya está en uso en Auth pero no en Firestore.');
                    console.log('   Esto suele pasar si se inició sesión con Google pero no se guardó en Firestore.');
                    console.log('   Por favor, inicia sesión con Google primero para crear el registro en Firestore, y luego ejecuta este script nuevamente.');
                } else {
                    throw error;
                }
            }
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
    }
}

configurarSuperAdmin()
    .then(() => {
        console.log('\n✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
