/**
 * Pruebas de firestore.rules contra el emulador (nunca contra una base real).
 *
 *   npm run test:reglas
 *
 * Cada "ataque" es algo que cualquiera con una cuenta de Google podría intentar
 * desde la consola del navegador; cada "uso normal" es un flujo real de la app
 * que las reglas no deben romper.
 */
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';

let env: RulesTestEnvironment;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-eduplan-reglas',
    firestore: { rules: readFileSync(process.env.REGLAS || 'firestore.rules', 'utf8') },
  });
});
after(async () => { await env.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/maestraA'), { rol: 'maestro', schoolId: 'escuelaA', activo: true, nombre: 'Ana' });
    await setDoc(doc(db, 'users/inactivo'), { rol: 'maestro', schoolId: 'escuelaA', activo: false });
    await setDoc(doc(db, 'users/jose'), { rol: 'superadmin', schoolId: 'system', activo: true });
    await setDoc(doc(db, 'alumnos/alumnoA'), { schoolId: 'escuelaA', curp: 'CURP-SINTETICA-A' });
    await setDoc(doc(db, 'alumnos/alumnoB'), { schoolId: 'escuelaB', curp: 'CURP-SINTETICA-B' });
    await setDoc(doc(db, 'cuestionariosSocioEducativos/c1'), { curp: 'CURP-SINTETICA-A', saludEmocional: 'x' });
  });
});

const como = (uid: string) => env.authenticatedContext(uid).firestore();

// --- Ataques que deben fallar --------------------------------------------------

test('ataque: un maestro no puede hacerse superadmin', async () => {
  await assertFails(updateDoc(doc(como('maestraA'), 'users/maestraA'), { rol: 'superadmin' }));
});

test('ataque: una cuenta nueva no puede nacer como superadmin', async () => {
  await assertFails(setDoc(doc(como('intruso'), 'users/intruso'), { rol: 'superadmin', activo: true }));
});

test('ataque: una cuenta desactivada no puede reactivarse sola', async () => {
  await assertFails(updateDoc(doc(como('inactivo'), 'users/inactivo'), { activo: true }));
});

test('ataque: una cuenta nueva no puede leer cuestionarios socioeducativos', async () => {
  await assertFails(getDoc(doc(como('intruso'), 'cuestionariosSocioEducativos/c1')));
});

test('ataque: un maestro no puede leer cuestionarios socioeducativos', async () => {
  await assertFails(getDoc(doc(como('maestraA'), 'cuestionariosSocioEducativos/c1')));
});

test('ataque: un maestro no puede leer alumnos de otra escuela', async () => {
  await assertFails(getDoc(doc(como('maestraA'), 'alumnos/alumnoB')));
});

// Hueco conocido, se cierra con la membresía verificada (punto 3): hoy un usuario
// puede escoger cualquier escuela en el onboarding y leer sus alumnos.
test.todo('ataque: unirse a una escuela ajena y leer sus alumnos');

// --- Usos normales que deben seguir funcionando --------------------------------

test('uso normal: primer login con Google crea el perfil de maestro', async () => {
  await assertSucceeds(setDoc(doc(como('nueva'), 'users/nueva'), {
    rol: 'maestro', activo: true, email: 'nueva@ejemplo.com', creadoPor: 'google-auth',
  }));
});

test('uso normal: el onboarding guarda escuela y puesto de directivo', async () => {
  await assertSucceeds(setDoc(doc(como('maestraA'), 'users/maestraA'), {
    schoolId: 'escuelaA', rol: 'directivo', puesto: 'Director', onboardingCompleto: true,
  }, { merge: true }));
});

test('uso normal: el docente edita su nombre en el perfil', async () => {
  await assertSucceeds(updateDoc(doc(como('maestraA'), 'users/maestraA'), { nombre: 'Ana María' }));
});

test('uso normal: el docente lee alumnos de su escuela', async () => {
  await assertSucceeds(getDoc(doc(como('maestraA'), 'alumnos/alumnoA')));
});

test('uso normal: el superadmin cambia el rol de otro usuario', async () => {
  await assertSucceeds(updateDoc(doc(como('jose'), 'users/maestraA'), { rol: 'directivo' }));
});

test('uso normal: el superadmin lee cuestionarios', async () => {
  await assertSucceeds(getDoc(doc(como('jose'), 'cuestionariosSocioEducativos/c1')));
});

test('uso normal: un alumno sin cuenta envía su cuestionario', async () => {
  await assertSucceeds(addDoc(collection(env.unauthenticatedContext().firestore(), 'cuestionariosSocioEducativos'), { curp: 'X' }));
});
