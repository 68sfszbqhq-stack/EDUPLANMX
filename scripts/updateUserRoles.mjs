import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC-Ry46hCfXxez-lfA5ZX792AOIbmOc6Vw",
    authDomain: "eduplanmx.firebaseapp.com",
    projectId: "eduplanmx",
    storageBucket: "eduplanmx.firebasestorage.app",
    messagingSenderId: "144677335686",
    appId: "1:144677335686:web:cd82543b32b323e3ea5707"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usuarios a actualizar
const userUpdates = [
    {
        email: 'jose.mendoza.buap@gmail.com',
        rol: 'superadmin',
        descripcion: 'Super Admin - Acceso total'
    },
    {
        email: 'jose.mendoza.bgo@gmail.com',
        rol: 'maestro',
        descripcion: 'Docente - Acceso a planeaciones'
    },
    {
        email: 'jozezito2004@gmail.com',
        rol: 'directivo',
        descripcion: 'Director - Acceso a toda la escuela'
    }
];

async function updateUserRoles() {
    console.log('🔧 Iniciando actualización de roles...\n');

    for (const userUpdate of userUpdates) {
        try {
            console.log(`📧 Buscando usuario: ${userUpdate.email}`);

            // Buscar usuario por email
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', userUpdate.email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log(`   ⚠️  Usuario no encontrado en Firestore`);
                console.log(`   💡 El usuario debe iniciar sesión primero para crear su perfil\n`);
                continue;
            }

            // Actualizar rol
            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;
            const currentData = userDoc.data();

            await updateDoc(doc(db, 'users', userId), {
                rol: userUpdate.rol,
                updatedAt: new Date().toISOString()
            });

            console.log(`   ✅ Rol actualizado exitosamente`);
            console.log(`   📊 Cambios:`);
            console.log(`      Rol anterior: ${currentData.rol || 'ninguno'}`);
            console.log(`      Rol nuevo: ${userUpdate.rol}`);
            console.log(`      Descripción: ${userUpdate.descripcion}`);
            console.log(`      ID: ${userId}\n`);

        } catch (error) {
            console.error(`   ❌ Error al actualizar ${userUpdate.email}:`, error.message);
            console.log('');
        }
    }

    console.log('✅ Proceso completado\n');
    console.log('📋 Resumen de roles:');
    console.log('   • jose.mendoza.buap@gmail.com → superadmin');
    console.log('   • jose.mendoza.bgo@gmail.com → maestro');
    console.log('   • jozezito2004@gmail.com → directivo\n');

    process.exit(0);
}

// Ejecutar
updateUserRoles().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
