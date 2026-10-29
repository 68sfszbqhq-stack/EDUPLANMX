/**
 * Pruebas de las reglas COMPARTIDAS (EduPlan v2 + Antología v2) en el emulador.
 *   npm run test:reglas-compartidas
 * Datos sintéticos. Se prueba firestore.pruebas.rules, que es lo que se publica.
 */
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, serverTimestamp } from 'firebase/firestore';

let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-eduplan-compartidas',
    firestore: { rules: readFileSync('firestore.pruebas.rules', 'utf8') },
  });
});
after(async () => { await env.cleanup(); });

const fila = (matricula: string, nombre: string, cuentaUid = '', cuentaCorreo = '') =>
  ({ matricula, nombre, estado: 'activo', cuentaUid, cuentaCorreo, actualizadoEn: '2026-10-10' });
const cuenta = (matricula: string, correo: string) =>
  ({ matricula, nombre: 'Alumno Sintético', grupo: '1º A Vesp', activo: true, correo, origen: 'google' });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const uid of ['docente1','docente2']) await setDoc(doc(db,'users',uid), {rol:'maestro',activo:true});
    await setDoc(doc(db, 'misGrupos/g1'), { docenteUid: 'docente1', nombre: '1º A Vesp', asignaturaClave: 'cultura-digital-1', asignaturaNombre: 'Cultura Digital I', ciclo: '2026-2027', creadoEn: 'x', archivado: false });
    await setDoc(doc(db, 'misGrupos/g2'), { docenteUid: 'docente2', nombre: '1º B Mat', asignaturaClave: 'cultura-digital-1', asignaturaNombre: 'Cultura Digital I', ciclo: '2026-2027', creadoEn: 'x', archivado: false });
    await setDoc(doc(db, 'misGrupos/g1/lista/2024001'), fila('2024001', 'Ana'));
    await setDoc(doc(db, 'misGrupos/g1/lista/2024002'), fila('2024002', 'Beto', 'alumnoB', 'b@ejemplo.com'));
    await setDoc(doc(db, 'misGrupos/g1/resultados/cultura-digital-1.modulo-1_2024002'), { matricula: '2024002', porcentaje: 70 });
    await setDoc(doc(db, 'matriculas/2024001/grupos/g1'), { asignaturaClave: 'cultura-digital-1', grupoNombre: '1º A Vesp', docenteUid: 'docente1' });
    await setDoc(doc(db, 'cuentasAlumno/alumnoA'), cuenta('2024001', 'a@ejemplo.com'));
    await setDoc(doc(db, 'cuentasAlumno/alumnoB'), cuenta('2024002', 'b@ejemplo.com'));
    await setDoc(doc(db, 'cuentasAlumno/impostor'), cuenta('2024002', 'i@ejemplo.com'));
  });
});

const como = (uid: string, email = `${uid}@ejemplo.com`) => env.authenticatedContext(uid, { email }).firestore();
const alumnoA = () => como('alumnoA', 'a@ejemplo.com');
const reclamo = { cuentaUid: 'alumnoA', cuentaCorreo: 'a@ejemplo.com', vinculadoEn: serverTimestamp() };
const resultado = (matricula: string, cuentaUid: string) => ({
  matricula, instrumento: 'cultura-digital-1.modulo-1', titulo: 'Módulo 1.1', aciertos: 7, total: 10, porcentaje: 70,
  porEje: { Hardware: { ok: 4, total: 5 } }, cuentaUid, enviado: serverTimestamp(),
});
const idRes = (m: string) => `misGrupos/g1/resultados/cultura-digital-1.modulo-1_${m}`;

// --- Docentes ---------------------------------------------------------------
test('un docente ve sus grupos', async () => {
  await assertSucceeds(getDocs(query(collection(como('docente1'), 'misGrupos'), where('docenteUid', '==', 'docente1'))));
});
test('ataque: un docente no ve el grupo, la lista ni los resultados de otro', async () => {
  const db = como('docente2');
  await assertFails(getDoc(doc(db, 'misGrupos/g1')));
  await assertFails(getDocs(collection(db, 'misGrupos/g1/lista')));
  await assertFails(getDocs(collection(db, 'misGrupos/g1/resultados')));
});
test('ataque: un docente no puede crear un grupo a nombre de otro', async () => {
  await assertFails(setDoc(doc(como('docente2'), 'misGrupos/g9'), { docenteUid: 'docente1', nombre: 'x', asignaturaClave: '', asignaturaNombre: '', ciclo: '', creadoEn: '', archivado: false }));
});
test('ataque: un docente no puede escribir en la lista de otro', async () => {
  await assertFails(setDoc(doc(como('docente2'), 'misGrupos/g1/lista/2024009'), fila('2024009', 'Zoe')));
});
test('el docente agrega alumnos; el ID debe ser la matrícula', async () => {
  const db = como('docente1');
  await assertSucceeds(setDoc(doc(db, 'misGrupos/g1/lista/2024003'), fila('2024003', 'Carla')));
  await assertFails(setDoc(doc(db, 'misGrupos/g1/lista/otro-id'), fila('2024004', 'Dora')));
});
test('ataque: el docente no puede asignar una cuenta de alumno a mano', async () => {
  const db = como('docente1');
  await assertFails(setDoc(doc(db, 'misGrupos/g1/lista/2024005'), fila('2024005', 'Eva', 'alumnoA', 'a@ejemplo.com')));
  await assertFails(updateDoc(doc(db, 'misGrupos/g1/lista/2024001'), { cuentaUid: 'alumnoA', cuentaCorreo: 'a@ejemplo.com' }));
});
test('el docente puede desvincular una cuenta', async () => {
  await assertSucceeds(updateDoc(doc(como('docente1'), 'misGrupos/g1/lista/2024002'), { cuentaUid: '', cuentaCorreo: '' }));
});
test('el docente lee los resultados de su grupo', async () => {
  await assertSucceeds(getDocs(collection(como('docente1'), 'misGrupos/g1/resultados')));
});

// --- Alumnos ----------------------------------------------------------------
test('el alumno encuentra su grupo por su matrícula', async () => {
  await assertSucceeds(getDocs(collection(alumnoA(), 'matriculas/2024001/grupos')));
});
test('ataque: el alumno no puede ver en qué grupos está otra matrícula', async () => {
  await assertFails(getDocs(collection(alumnoA(), 'matriculas/2024002/grupos')));
});
test('el alumno ve su propia fila, no la de otros ni la lista completa', async () => {
  const db = alumnoA();
  await assertSucceeds(getDoc(doc(db, 'misGrupos/g1/lista/2024001')));
  await assertFails(getDoc(doc(db, 'misGrupos/g1/lista/2024002')));
  await assertFails(getDocs(collection(db, 'misGrupos/g1/lista')));
});
test('el alumno reclama su matrícula una vez', async () => {
  await assertSucceeds(updateDoc(doc(alumnoA(), 'misGrupos/g1/lista/2024001'), reclamo));
});
test('ataque: el alumno no puede cambiar su nombre ni su estado al reclamar', async () => {
  await assertFails(updateDoc(doc(alumnoA(), 'misGrupos/g1/lista/2024001'), { ...reclamo, nombre: 'Otro' }));
});
test('ataque: un impostor no puede reclamar una matrícula ya reclamada', async () => {
  await assertFails(updateDoc(doc(como('impostor', 'i@ejemplo.com'), 'misGrupos/g1/lista/2024002'),
    { cuentaUid: 'impostor', cuentaCorreo: 'i@ejemplo.com', vinculadoEn: serverTimestamp() }));
});
test('ataque: el alumno no puede reclamar con un correo que no es el suyo', async () => {
  await assertFails(updateDoc(doc(alumnoA(), 'misGrupos/g1/lista/2024001'), { ...reclamo, cuentaCorreo: 'otro@ejemplo.com' }));
});
test('ataque: no se entrega resultado sin haber reclamado la matrícula', async () => {
  await assertFails(setDoc(doc(alumnoA(), idRes('2024001')), resultado('2024001', 'alumnoA')));
});
test('tras reclamar, el alumno entrega su resultado una sola vez', async () => {
  const db = alumnoA();
  await updateDoc(doc(db, 'misGrupos/g1/lista/2024001'), reclamo);
  await assertSucceeds(setDoc(doc(db, idRes('2024001')), resultado('2024001', 'alumnoA')));
  await assertFails(setDoc(doc(db, idRes('2024001')), { ...resultado('2024001', 'alumnoA'), porcentaje: 100 }));
});
test('ataque: el impostor no puede entregar a nombre de la matrícula de otro', async () => {
  await assertFails(setDoc(doc(como('impostor', 'i@ejemplo.com'), idRes('2024002')), resultado('2024002', 'impostor')));
});
test('ataque: el alumno no puede leer los resultados del grupo', async () => {
  await assertFails(getDocs(collection(alumnoA(), 'misGrupos/g1/resultados')));
  await assertFails(getDoc(doc(alumnoA(), idRes('2024002'))));
});
test('ataque: un alumno dado de baja no puede reclamar ni entregar', async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await updateDoc(doc(ctx.firestore(), 'misGrupos/g1/lista/2024001'), { estado: 'baja' });
  });
  await assertFails(updateDoc(doc(alumnoA(), 'misGrupos/g1/lista/2024001'), reclamo));
});

// --- Antología sigue protegida con el nombre nuevo de la colección ---------
test('ataque: un alumno no puede leer la cuenta de otro alumno', async () => {
  await assertFails(getDoc(doc(alumnoA(), 'cuentasAlumno/alumnoB')));
  await assertSucceeds(getDoc(doc(alumnoA(), 'cuentasAlumno/alumnoA')));
});
test('ataque: un alumno no puede guardar una matrícula con formato raro en su cuenta', async () => {
  await assertFails(setDoc(doc(alumnoA(), 'cuentasAlumno/alumnoA'), cuenta('2024-001 OR 1=1', 'a@ejemplo.com')));
});

// --- Cuaderno de notas y exámenes ------------------------------------------
import { Timestamp, deleteDoc } from 'firebase/firestore';

const sembrarExamenes = (inicioIntentoB = Timestamp.now()) => env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await updateDoc(doc(db, 'misGrupos/g1/lista/2024001'), { cuentaUid: 'alumnoA', cuentaCorreo: 'a@ejemplo.com' });
  const ex = { titulo: 'Parcial', instrucciones: '', minutos: 30, preguntas: [{ id: 'p1', tipo: 'vf', texto: 'x', puntos: 1 }], columnaId: '', descripcionClase: '', creadoEn: 'x', actualizadoEn: 'x' };
  await setDoc(doc(db, 'misGrupos/g1/examenes/ex1'), { ...ex, estado: 'abierto' });
  await setDoc(doc(db, 'misGrupos/g1/examenes/ex2'), { ...ex, estado: 'borrador' });
  await setDoc(doc(db, 'misGrupos/g1/examenes/ex3'), { ...ex, estado: 'cerrado' });
  await setDoc(doc(db, 'misGrupos/g1/examenes/ex1/privado/clave'), { p1: { verdadero: true } });
  await setDoc(doc(db, 'misGrupos/g1/examenes/ex1/intentos/2024002'), { matricula: '2024002', cuentaUid: 'alumnoB', estado: 'en curso', respuestas: {}, inicio: inicioIntentoB, guardadoEn: inicioIntentoB });
  await setDoc(doc(db, 'misGrupos/g1/columnas/c1'), { nombre: 'Tarea 1', tipo: 'tarea', max: 10, peso: 0, fecha: '2026-10-10', orden: 0, rubrica: null, examenId: '' });
  await setDoc(doc(db, 'misGrupos/g1/notas/2024001'), { matricula: '2024001', valores: { c1: 8 }, estados: {}, comentarios: {}, rubricas: {} });
});
const intentoNuevo = { matricula: '2024001', cuentaUid: 'alumnoA', estado: 'en curso', respuestas: {}, inicio: serverTimestamp(), guardadoEn: serverTimestamp() };
const alumnoB = () => como('alumnoB', 'b@ejemplo.com');

test('el docente escribe en su cuaderno; otro docente no lo ve', async () => {
  await sembrarExamenes();
  await assertSucceeds(updateDoc(doc(como('docente1'), 'misGrupos/g1/notas/2024001'), { 'valores.c1': 9 }));
  await assertFails(getDoc(doc(como('docente2'), 'misGrupos/g1/notas/2024001')));
  await assertFails(getDocs(collection(como('docente2'), 'misGrupos/g1/columnas')));
});
test('ataque: el alumno no puede ver el cuaderno de notas', async () => {
  await sembrarExamenes();
  await assertFails(getDoc(doc(alumnoA(), 'misGrupos/g1/notas/2024001')));
  await assertFails(getDocs(collection(alumnoA(), 'misGrupos/g1/columnas')));
});
test('el alumno del grupo ve los exámenes abiertos, no los borradores', async () => {
  await sembrarExamenes();
  await assertSucceeds(getDoc(doc(alumnoA(), 'misGrupos/g1/examenes/ex1')));
  await assertSucceeds(getDocs(query(collection(alumnoA(), 'misGrupos/g1/examenes'), where('estado', '==', 'abierto'))));
  await assertFails(getDoc(doc(alumnoA(), 'misGrupos/g1/examenes/ex2')));
});
test('ataque: nadie más que el docente lee la clave del examen', async () => {
  await sembrarExamenes();
  await assertFails(getDoc(doc(alumnoA(), 'misGrupos/g1/examenes/ex1/privado/clave')));
  await assertFails(getDoc(doc(como('docente2'), 'misGrupos/g1/examenes/ex1/privado/clave')));
  await assertSucceeds(getDoc(doc(como('docente1'), 'misGrupos/g1/examenes/ex1/privado/clave')));
});
test('ataque: quien no reclamó su lugar en la lista no ve el examen', async () => {
  await sembrarExamenes();
  await assertFails(getDoc(doc(como('impostor', 'i@ejemplo.com'), 'misGrupos/g1/examenes/ex1')));
});
test('el alumno inicia, guarda y entrega su intento; después queda sellado', async () => {
  await sembrarExamenes();
  const ref = doc(alumnoA(), 'misGrupos/g1/examenes/ex1/intentos/2024001');
  await assertSucceeds(setDoc(ref, intentoNuevo));
  await assertSucceeds(updateDoc(ref, { respuestas: { p1: { valor: true } }, guardadoEn: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, { estado: 'entregado', fin: serverTimestamp(), guardadoEn: serverTimestamp() }));
  await assertFails(updateDoc(ref, { respuestas: { p1: { valor: false } }, guardadoEn: serverTimestamp() }));
});
test('ataque: el alumno no puede contestar a nombre de otra matrícula', async () => {
  await sembrarExamenes();
  await assertFails(setDoc(doc(alumnoA(), 'misGrupos/g1/examenes/ex1/intentos/2024002'), { ...intentoNuevo, matricula: '2024002' }));
});
test('ataque: el alumno no puede ponerse calificación', async () => {
  await sembrarExamenes();
  const ref = doc(alumnoA(), 'misGrupos/g1/examenes/ex1/intentos/2024001');
  await setDoc(ref, intentoNuevo);
  await assertFails(updateDoc(ref, { calificacion: 10 }));
});
test('ataque: no se puede empezar un examen cerrado ni uno en borrador', async () => {
  await sembrarExamenes();
  await assertFails(setDoc(doc(alumnoA(), 'misGrupos/g1/examenes/ex3/intentos/2024001'), intentoNuevo));
  await assertFails(setDoc(doc(alumnoA(), 'misGrupos/g1/examenes/ex2/intentos/2024001'), intentoNuevo));
});
test('ataque: pasado el tiempo (30 min + 2 de gracia) ya no se aceptan respuestas', async () => {
  await sembrarExamenes(Timestamp.fromMillis(Date.now() - 40 * 60 * 1000));
  await assertFails(updateDoc(doc(alumnoB(), 'misGrupos/g1/examenes/ex1/intentos/2024002'), { respuestas: { p1: { valor: true } }, guardadoEn: serverTimestamp() }));
});
test('a tiempo, el alumno sí guarda', async () => {
  await sembrarExamenes(Timestamp.fromMillis(Date.now() - 5 * 60 * 1000));
  await assertSucceeds(updateDoc(doc(alumnoB(), 'misGrupos/g1/examenes/ex1/intentos/2024002'), { respuestas: { p1: { valor: true } }, guardadoEn: serverTimestamp() }));
});
test('el docente califica, pero no puede cambiar lo que contestó el alumno', async () => {
  await sembrarExamenes();
  const ref = doc(como('docente1'), 'misGrupos/g1/examenes/ex1/intentos/2024002');
  await assertSucceeds(updateDoc(ref, { revision: { p1: 1 }, calificacion: 10, calificadoEn: 'x' }));
  await assertFails(updateDoc(ref, { respuestas: { p1: { valor: false } } }));
  await assertSucceeds(deleteDoc(ref));
});

// --- La clase integrada: claves, ponderación, asistencia, diario, anotaciones --
test('el docente agrega un alumno con clave generada y guarda su ponderación', async () => {
  const db = como('docente1');
  await assertSucceeds(setDoc(doc(db, 'misGrupos/g1/lista/k7m2qp'), { ...fila('k7m2qp', 'Fer'), generada: true }));
  await assertSucceeds(updateDoc(doc(db, 'misGrupos/g1'), { ponderacion: { examen: 40, tarea: 60 } }));
  await assertFails(updateDoc(doc(db, 'misGrupos/g1'), { ponderacion: 'todo' }));
});
test('el docente pasa lista, escribe su diario y anota; nadie más lo ve', async () => {
  const db = como('docente1');
  await assertSucceeds(setDoc(doc(db, 'misGrupos/g1/asistencia/2026-10-10'), { fecha: '2026-10-10', marcas: { '2024001': 'P' }, actualizadoEn: 'x' }));
  await assertSucceeds(setDoc(doc(db, 'misGrupos/g1/diario/2026-10-10'), { fecha: '2026-10-10', texto: 'Vimos licencias.', actualizadoEn: 'x' }));
  await assertSucceeds(setDoc(doc(db, 'misGrupos/g1/anotaciones/a1'), { matricula: '2024001', fecha: '2026-10-10', tipo: 'positiva', texto: 'Ayudó a su equipo' }));
  for (const otro of [como('docente2'), alumnoA()]) {
    await assertFails(getDocs(collection(otro, 'misGrupos/g1/asistencia')));
    await assertFails(getDocs(collection(otro, 'misGrupos/g1/diario')));
    await assertFails(getDocs(collection(otro, 'misGrupos/g1/anotaciones')));
    await assertFails(setDoc(doc(otro, 'misGrupos/g1/asistencia/2026-10-11'), { fecha: '2026-10-11', marcas: {}, actualizadoEn: 'x' }));
  }
});
test('ataque: asistencia o diario con fecha inventada o campos de más', async () => {
  const db = como('docente1');
  await assertFails(setDoc(doc(db, 'misGrupos/g1/asistencia/hoy'), { fecha: 'hoy', marcas: {}, actualizadoEn: 'x' }));
  await assertFails(setDoc(doc(db, 'misGrupos/g1/diario/2026-10-10'), { fecha: '2026-10-09', texto: 'x', actualizadoEn: 'x' }));
  await assertFails(setDoc(doc(db, 'misGrupos/g1/anotaciones/a2'), { matricula: '2024001', fecha: 'x', tipo: 'castigo', texto: 'x' }));
});
test('el docente guarda sus parciales y anota acciones de apoyo', async () => {
  const db = como('docente1');
  await assertSucceeds(updateDoc(doc(db, 'misGrupos/g1'), { parciales: [{ nombre: 'Parcial 1', inicio: '2026-08-24', fin: '2026-09-30' }] }));
  await assertFails(updateDoc(doc(db, 'misGrupos/g1'), { parciales: 'P1' }));
  await assertSucceeds(setDoc(doc(db, 'misGrupos/g1/anotaciones/a3'), { matricula: '2024001', fecha: '2026-10-10', tipo: 'accion', texto: 'Plática con su mamá' }));
  await assertFails(updateDoc(doc(como('docente2'), 'misGrupos/g1'), { parciales: [] }));
});
