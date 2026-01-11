
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/config/firebase';

async function listarAlumnos() {
    console.log('🔍 Buscando en colección "alumnos"...\n');

    try {
        const alumnosRef = collection(db, 'alumnos');
        const snapshot = await getDocs(alumnosRef);

        if (snapshot.empty) {
            console.log('❌ La colección "alumnos" está vacía.');
        } else {
            console.log(`✅ Se encontraron ${snapshot.size} documentos en "alumnos":\n`);
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`- ID: ${doc.id}, Datos:`, JSON.stringify(data));
            });
        }

    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

listarAlumnos()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
