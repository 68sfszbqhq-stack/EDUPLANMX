
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './src/config/firebase'; // Adjust path if necessary
import { MATERIAS_MCCEMS } from './data/mccemsCatalogo';

async function seedMaterias() {
    console.log('🌱 Iniciando sembrado de materias MCCEMS...');
    const materiasRef = collection(db, 'materias');

    for (const materia of MATERIAS_MCCEMS) {
        // Verificar duplicados por clave
        const q = query(materiasRef, where('clave', '==', materia.clave));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`➕ Agregando materia: [${materia.clave}] ${materia.nombre}`);
            try {
                // Remove id if it exists (it shouldn't based on type, but for safety)
                const { ...materiaData } = materia;
                await addDoc(materiasRef, {
                    ...materiaData,
                    fechaCreacion: new Date().toISOString()
                });
            } catch (error) {
                console.error(`❌ Error al agregar ${materia.clave}:`, error);
            }
        } else {
            console.log(`⚠️  La materia [${materia.clave}] ya existe. Saltando.`);
        }
    }

    console.log('✅ Sembrado finalizado.');
}

seedMaterias()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
