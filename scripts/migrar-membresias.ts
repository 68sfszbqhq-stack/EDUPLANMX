/**
 * Migración a membresía verificada: registra como miembros aprobados a los
 * docentes que ya usan la plataforma, crea el código secreto de cada escuela y
 * borra el código público viejo (era el inicio del CCT: cualquiera lo adivinaba).
 *
 * Se corre UNA vez, ANTES de publicar las reglas nuevas, para que nadie pierda
 * acceso. Se conecta igual que el respaldo: con la cuenta de superadmin, cuya
 * contraseña solo vive en el comando.
 *
 *   1) Respaldo:   EDUPLAN_EMAIL=... EDUPLAN_PASSWORD=... npm run respaldo
 *   2) Ensayo:     EDUPLAN_EMAIL=... EDUPLAN_PASSWORD=... npx tsx scripts/migrar-membresias.ts
 *   3) De verdad:  ... npx tsx scripts/migrar-membresias.ts --aplicar
 *
 * El ensayo no escribe nada: muestra qué haría, escuela por escuela, para que
 * se revise quién queda con acceso (un perfil pudo haber escogido una escuela
 * ajena con el hueco anterior: revisar la lista antes de aplicar).
 */
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, connectFirestoreEmulator, deleteField, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

const PROYECTO = process.env.EDUPLAN_PROYECTO || 'eduplanmx';
const APLICAR = process.argv.includes('--aplicar');
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const codigoNuevo = () => Array.from(crypto.getRandomValues(new Uint32Array(8)), n => ALFABETO[n % ALFABETO.length]).join('');

async function main() {
  const email = process.env.EDUPLAN_EMAIL, password = process.env.EDUPLAN_PASSWORD;
  if (!email || !password) throw new Error('Falta EDUPLAN_EMAIL / EDUPLAN_PASSWORD (cuenta superadmin).');

  if (APLICAR && !process.env.EMULADOR) {
    const hoy = new Date().toISOString().slice(0, 10);
    const respaldo = path.join('backups', hoy);
    if (!fs.existsSync(respaldo)) throw new Error(`No hay respaldo de hoy en ${respaldo}. Corre primero: npm run respaldo`);
  }

  const app = initializeApp({ apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummy', authDomain: `${PROYECTO}.firebaseapp.com`, projectId: PROYECTO });
  const auth = getAuth(app);
  const db = getFirestore(app);
  // Para ensayarla sin tocar nada real: EMULADOR=1 (simulador local).
  if (process.env.EMULADOR) { connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true }); connectFirestoreEmulator(db, '127.0.0.1', 8080); }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const yo = cred.user.uid;

  const [usuarios, escuelas] = await Promise.all([getDocs(collection(db, 'users')), getDocs(collection(db, 'schools'))]);
  const porEscuela = new Map(escuelas.docs.map(e => [e.id, { nombre: String(e.data().nombre ?? ''), cct: String(e.data().cct ?? ''), codigoPublico: e.data().codigoAcceso, miembros: [] as any[] }]));
  const huerfanos: string[] = [];

  for (const u of usuarios.docs) {
    const d = u.data();
    const sid = d.schoolId;
    if (!sid || sid === 'system' || d.rol === 'superadmin' || d.activo === false) continue;
    const e = porEscuela.get(sid);
    if (!e) { huerfanos.push(`${d.email ?? u.id} → escuela inexistente ${sid}`); continue; }
    e.miembros.push({
      uid: u.id, nombre: [d.nombre, d.apellidoPaterno].filter(Boolean).join(' ').slice(0, 120), email: String(d.email ?? '').slice(0, 200),
      rol: d.rol === 'directivo' ? 'directivo' : 'docente', estado: 'aprobado',
      creadoEn: String(d.createdAt ?? new Date().toISOString()), revisadoPor: yo, revisadoEn: new Date().toISOString(),
    });
  }

  const reporte: any[] = [];
  for (const [sid, e] of porEscuela) {
    const ya = await getDoc(doc(db, 'schools', sid, 'privado', 'acceso'));
    const codigo = ya.exists() ? ya.data().codigo : codigoNuevo();
    console.log(`\n${e.nombre} (${e.cct}) — ${e.miembros.length} con acceso${e.codigoPublico ? ' · se borra el código público' : ''}${ya.exists() ? '' : ` · código nuevo: ${codigo}`}`);
    for (const m of e.miembros) console.log(`   ${m.rol === 'directivo' ? '★ directivo' : '  docente  '}  ${m.nombre || '(sin nombre)'}  <${m.email}>`);
    reporte.push({ sid, nombre: e.nombre, cct: e.cct, codigo, miembros: e.miembros.map(m => ({ nombre: m.nombre, email: m.email, rol: m.rol })) });

    if (!APLICAR) continue;
    for (const m of e.miembros) {
      const previo = await getDoc(doc(db, 'schools', sid, 'miembros', m.uid));
      if (!previo.exists()) await setDoc(doc(db, 'schools', sid, 'miembros', m.uid), m);
    }
    if (!ya.exists()) await setDoc(doc(db, 'schools', sid, 'privado', 'acceso'), { codigo });
    if (e.codigoPublico !== undefined) await updateDoc(doc(db, 'schools', sid), { codigoAcceso: deleteField() });
  }
  if (huerfanos.length) console.log(`\nPerfiles con una escuela que no existe (no se migran):\n  ${huerfanos.join('\n  ')}`);

  // Los códigos son secretos: el reporte queda en backups/ (fuera de git), no en pantalla compartida.
  fs.mkdirSync('backups', { recursive: true });
  const archivo = path.join('backups', `membresias-${APLICAR ? 'aplicado' : 'ensayo'}-${new Date().toISOString().slice(0, 19).replace(/:/g, '')}.json`);
  fs.writeFileSync(archivo, JSON.stringify({ proyecto: PROYECTO, aplicado: APLICAR, reporte, huerfanos }, null, 2));
  console.log(`\n${APLICAR ? '✅ Migración aplicada.' : 'Ensayo: no se escribió nada. Revisa la lista y corre con --aplicar.'} Reporte: ${archivo}`);
  process.exit(0);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
