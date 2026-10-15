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
import { doc, getDoc, getDocs, setDoc, updateDoc, addDoc, collection, query, where } from 'firebase/firestore';

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
    // Escuelas con membresía verificada: la maestra A es miembro aprobado de A; la directora de A también.
    await setDoc(doc(db, 'schools/escuelaA'), { nombre: 'Escuela A', cct: '21EBH0001A', createdBy: 'directoraA', estadisticas: { totalDocentes: 2 } });
    await setDoc(doc(db, 'schools/escuelaB'), { nombre: 'Escuela B', cct: '21EBH0002B', createdBy: 'otro', estadisticas: { totalDocentes: 1 } });
    await setDoc(doc(db, 'schools/escuelaA/privado/acceso'), { codigo: 'K7M2QP9R' });
    await setDoc(doc(db, 'schools/escuelaA/miembros/maestraA'), { uid: 'maestraA', rol: 'docente', estado: 'aprobado' });
    await setDoc(doc(db, 'schools/escuelaA/miembros/directoraA'), { uid: 'directoraA', rol: 'directivo', estado: 'aprobado' });
    await setDoc(doc(db, 'users/directoraA'), { rol: 'directivo', schoolId: 'escuelaA', activo: true });
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

// --- Membresía verificada (cierra el hueco de escoger cualquier escuela) ---------
const miembro = (uid: string, extra: Record<string, unknown>) => ({ uid, nombre: 'X', email: `${uid}@ejemplo.com`, creadoEn: 'x', ...extra });

test('ataque: poner una escuela ajena en el perfil ya no da acceso a sus alumnos', async () => {
  const db = como('intruso');
  await setDoc(doc(db, 'users/intruso'), { rol: 'maestro', activo: true, schoolId: 'escuelaA' });
  await assertFails(getDoc(doc(db, 'alumnos/alumnoA')));
  await assertFails(getDocs(query(collection(db, 'alumnos'), where('schoolId', '==', 'escuelaA'))));
});
test('ataque: unirse aprobado sin código, con código falso o con el CCT', async () => {
  const db = como('intruso');
  await assertFails(setDoc(doc(db, 'schools/escuelaA/miembros/intruso'), miembro('intruso', { rol: 'docente', estado: 'aprobado' })));
  await assertFails(setDoc(doc(db, 'schools/escuelaA/miembros/intruso'), miembro('intruso', { rol: 'docente', estado: 'aprobado', codigo: 'XXXXXXXX' })));
  await assertFails(setDoc(doc(db, 'schools/escuelaA/miembros/intruso'), miembro('intruso', { rol: 'docente', estado: 'aprobado', codigo: '21EBH000' })));
});
test('ataque: hacerse directivo de una escuela ajena, o aprobarse solo', async () => {
  const db = como('intruso');
  await assertFails(setDoc(doc(db, 'schools/escuelaA/miembros/intruso'), miembro('intruso', { rol: 'directivo', estado: 'aprobado' })));
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaA/miembros/intruso'), miembro('intruso', { rol: 'docente', estado: 'pendiente' })));
  await assertFails(updateDoc(doc(db, 'schools/escuelaA/miembros/intruso'), { estado: 'aprobado', revisadoPor: 'intruso' }));
  await assertFails(getDoc(doc(db, 'alumnos/alumnoA'))); // pendiente no ve nada
});
test('ataque: nadie fuera de la dirección lee el código secreto ni se apodera de la escuela', async () => {
  await assertFails(getDoc(doc(como('intruso'), 'schools/escuelaA/privado/acceso')));
  await assertFails(getDoc(doc(como('maestraA'), 'schools/escuelaA/privado/acceso')));
  await assertFails(setDoc(doc(como('intruso'), 'schools/escuelaA/privado/acceso'), { codigo: 'MIOMIOMIO' }));
  await assertFails(updateDoc(doc(como('intruso'), 'schools/escuelaA'), { createdBy: 'intruso' }));
  await assertFails(updateDoc(doc(como('maestraA'), 'schools/escuelaA'), { nombre: 'Otra' }));
});
test('ataque: ver la lista de miembros de otra escuela', async () => {
  await assertFails(getDoc(doc(como('maestraA'), 'schools/escuelaA/miembros/directoraA')));
  await assertFails(getDocs(collection(como('intruso'), 'schools/escuelaA/miembros')));
});

test('uso normal: con el código correcto se entra aprobado y se ven los alumnos', async () => {
  const db = como('nuevo');
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaA/miembros/nuevo'), miembro('nuevo', { rol: 'docente', estado: 'aprobado', codigo: 'K7M2QP9R' })));
  await assertSucceeds(getDocs(query(collection(db, 'alumnos'), where('schoolId', '==', 'escuelaA'))));
});
test('uso normal: la directora ve el código, aprueba solicitudes y el aprobado ve alumnos', async () => {
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'schools/escuelaA/miembros/pend'), miembro('pend', { rol: 'docente', estado: 'pendiente' })); });
  const dir = como('directoraA');
  await assertSucceeds(getDoc(doc(dir, 'schools/escuelaA/privado/acceso')));
  await assertSucceeds(getDocs(collection(dir, 'schools/escuelaA/miembros')));
  await assertSucceeds(updateDoc(doc(dir, 'schools/escuelaA/miembros/pend'), { estado: 'aprobado', revisadoPor: 'directoraA', revisadoEn: 'x' }));
  await assertSucceeds(getDoc(doc(como('pend'), 'alumnos/alumnoA')));
  await assertSucceeds(updateDoc(doc(dir, 'schools/escuelaA/privado/acceso'), { codigo: 'NUEVO2345' }));
});
test('uso normal: quien crea una escuela nueva queda como su directivo con su código', async () => {
  const db = como('fundadora');
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaC'), { nombre: 'Escuela C', cct: '21EBH0003C', createdBy: 'fundadora', estadisticas: { totalDocentes: 1 } }));
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaC/privado/acceso'), { codigo: 'ABCD2345' }));
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaC/miembros/fundadora'), miembro('fundadora', { rol: 'directivo', estado: 'aprobado' })));
  await assertFails(setDoc(doc(db, 'schools/escuelaD'), { nombre: 'D', createdBy: 'fundadora', codigoAcceso: '21EBH000' }));
});
test('uso normal: el contador de docentes lo mueve cualquier docente', async () => {
  await assertSucceeds(updateDoc(doc(como('maestraA'), 'schools/escuelaA'), { 'estadisticas.totalDocentes': 3 }));
});

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

test('uso normal: quien pidió acceso sin código entra después escribiéndolo (y no con uno falso)', async () => {
  const db = como('tarde');
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaA/miembros/tarde'), miembro('tarde', { rol: 'docente', estado: 'pendiente' })));
  await assertFails(setDoc(doc(db, 'schools/escuelaA/miembros/tarde'), miembro('tarde', { rol: 'docente', estado: 'aprobado', codigo: 'FALSO2345' })));
  await assertFails(setDoc(doc(db, 'schools/escuelaA/miembros/tarde'), miembro('tarde', { rol: 'directivo', estado: 'aprobado', codigo: 'K7M2QP9R' })));
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaA/miembros/tarde'), miembro('tarde', { rol: 'docente', estado: 'aprobado', codigo: 'K7M2QP9R' })));
});
test('ataque: un rechazado no se reaprueba solo con el código', async () => {
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'schools/escuelaA/miembros/rech'), miembro('rech', { rol: 'docente', estado: 'rechazado' })); });
  await assertFails(setDoc(doc(como('rech'), 'schools/escuelaA/miembros/rech'), miembro('rech', { rol: 'docente', estado: 'aprobado', codigo: 'K7M2QP9R' })));
});

test('uso normal: la migración del SuperAdmin registra docentes y quita el código público', async () => {
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'schools/escuelaB'), { nombre: 'Escuela B', createdBy: 'otro', codigoAcceso: '21EBH000', estadisticas: {} }); });
  const db = como('jose');
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaB/miembros/maestraB'), miembro('maestraB', { rol: 'docente', estado: 'aprobado', revisadoPor: 'jose', revisadoEn: 'x' })));
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaB/privado/acceso'), { codigo: 'NUEVOB234' }));
  await assertSucceeds(setDoc(doc(db, 'schools/escuelaB'), { nombre: 'Escuela B', createdBy: 'otro', estadisticas: {} }));
});

// --- Mi página de clases --------------------------------------------------------

const pagina = (uid: string, slug: string, extra: Record<string, unknown> = {}) => ({
  slug, docenteUid: uid, publicada: true, nombre: 'Mtra. Ana', escuela: 'Escuela A', presentacion: '',
  icono: '📚', color: 'azul', materias: [], secciones: { avisos: true }, avisos: [], materiales: [],
  asesoria: '', actualizadoEn: '2026-10-14T00:00:00Z', ...extra,
});

test('uso normal: la maestra crea su página y cualquiera (sin cuenta) la lee', async () => {
  await assertSucceeds(setDoc(doc(como('maestraA'), 'paginasClase/mtra-ana'), pagina('maestraA', 'mtra-ana')));
  await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), 'paginasClase/mtra-ana')));
});

test('uso normal: revisar si una dirección está libre', async () => {
  await assertSucceeds(getDoc(doc(como('maestraA'), 'paginasClase/libre-aun')));
});

test('ataque: quedarse con la página de otra maestra (o editarla)', async () => {
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'paginasClase/mtra-ana'), pagina('maestraA', 'mtra-ana')); });
  await assertFails(setDoc(doc(como('intruso'), 'paginasClase/mtra-ana'), pagina('intruso', 'mtra-ana')));
  await assertFails(updateDoc(doc(como('intruso'), 'paginasClase/mtra-ana'), { nombre: 'Hackeada' }));
});

test('ataque: crear una página a nombre de otra cuenta', async () => {
  await assertFails(setDoc(doc(como('intruso'), 'paginasClase/falsa'), pagina('maestraA', 'falsa')));
});

test('ataque: dirección con caracteres raros, o que no coincide con el documento', async () => {
  await assertFails(setDoc(doc(como('maestraA'), 'paginasClase/Mtra Ana'), pagina('maestraA', 'Mtra Ana')));
  await assertFails(setDoc(doc(como('maestraA'), 'paginasClase/ana-dos'), pagina('maestraA', 'otra-cosa')));
});

test('ataque: campos extra o color inventado', async () => {
  await assertFails(setDoc(doc(como('maestraA'), 'paginasClase/mtra-ana'), pagina('maestraA', 'mtra-ana', { curps: ['X'] })));
  await assertFails(setDoc(doc(como('maestraA'), 'paginasClase/mtra-ana'), pagina('maestraA', 'mtra-ana', { color: 'url(javascript:x)' })));
});

test('ataque: leer una página no publicada de otra maestra, o listar las de otras', async () => {
  await env.withSecurityRulesDisabled(async ctx => { await setDoc(doc(ctx.firestore(), 'paginasClase/oculta'), pagina('maestraA', 'oculta', { publicada: false })); });
  await assertFails(getDoc(doc(como('intruso'), 'paginasClase/oculta')));
  await assertSucceeds(getDoc(doc(como('maestraA'), 'paginasClase/oculta')));
  await assertFails(getDocs(query(collection(como('intruso'), 'paginasClase'), where('docenteUid', '==', 'maestraA'))));
  await assertSucceeds(getDocs(query(collection(como('maestraA'), 'paginasClase'), where('docenteUid', '==', 'maestraA'))));
});
