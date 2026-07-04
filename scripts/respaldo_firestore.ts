/**
 * Respaldo completo de Firestore a JSON local.
 *
 * El plan Spark NO incluye backups automáticos: si se borra una colección por
 * error, no hay vuelta atrás. Este script descarga todas las colecciones
 * conocidas a backups/AAAA-MM-DD/.
 *
 * Uso (una vez al mes, o antes de cualquier cambio grande):
 *   EDUPLAN_EMAIL=tu@correo.com EDUPLAN_PASSWORD=tupassword npm run respaldo
 *
 * Requiere una cuenta con permisos de lectura (tu cuenta de superadmin).
 * La contraseña solo vive en el comando; no se guarda en ningún archivo.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Misma configuración pública que usa la app
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummy',
    authDomain: 'eduplanmx.firebaseapp.com',
    projectId: 'eduplanmx',
};

// Todas las colecciones que usa la plataforma (actualizar si se agregan nuevas)
const COLECCIONES = [
    'users',
    'usuarios',
    'schools',
    'alumnos',
    'planeaciones',
    'cuestionariosSocioEducativos',
    'fichas12',
    'asignaciones',
    'herramientas_generadas',
    'materias',
    'diagnosticos_grupo',
    'pmc',
];

async function main() {
    const email = process.env.EDUPLAN_EMAIL;
    const password = process.env.EDUPLAN_PASSWORD;

    if (!email || !password) {
        console.error('❌ Faltan credenciales. Uso:');
        console.error('   EDUPLAN_EMAIL=tu@correo.com EDUPLAN_PASSWORD=xxxx npm run respaldo');
        process.exit(1);
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log(`🔐 Iniciando sesión como ${email}...`);
    await signInWithEmailAndPassword(auth, email, password);

    const fecha = new Date().toISOString().slice(0, 10);
    const dir = path.join(__dirname, '..', 'backups', fecha);
    fs.mkdirSync(dir, { recursive: true });

    let totalDocs = 0;
    for (const nombre of COLECCIONES) {
        try {
            const snap = await getDocs(collection(db, nombre));
            const docs = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
            fs.writeFileSync(path.join(dir, `${nombre}.json`), JSON.stringify(docs, null, 1));
            totalDocs += docs.length;
            console.log(`  ✓ ${nombre}: ${docs.length} documentos`);
        } catch (e: any) {
            console.log(`  ✗ ${nombre}: ${e.message?.substring(0, 60) || e}`);
        }
    }

    console.log(`\n💾 Respaldo completo: backups/${fecha}/ (${totalDocs} documentos)`);
    console.log('   Guarda esa carpeta en un lugar seguro (Drive, USB, etc.)');
    process.exit(0);
}

main().catch(e => {
    console.error('❌ Error en el respaldo:', e.message || e);
    process.exit(1);
});
