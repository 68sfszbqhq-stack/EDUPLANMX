import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ClavePregunta, Columna, EstadoEntrega, NotasAlumno, Pregunta, RespuestaAlumno, Rubrica } from './modelo';

const g = (grupoId: string, ...ruta: string[]) => ['misGrupos', grupoId, ...ruta] as const;
const ahora = () => new Date().toISOString();

// ─── Cuaderno de notas ──────────────────────────────────────────────────────

/** Escucha columnas y notas en vivo: si se califica en el iPad, la Mac lo ve al instante. */
export function escucharCuaderno(grupoId: string, cb: (c: Columna[], n: Record<string, NotasAlumno>) => void, onError: (e: Error) => void) {
  let columnas: Columna[] = [], notas: Record<string, NotasAlumno> = {};
  const u1 = onSnapshot(collection(db, ...g(grupoId, 'columnas')), s => {
    columnas = s.docs.map(d => ({ ...(d.data() as Omit<Columna, 'id'>), id: d.id })).sort((a, b) => a.orden - b.orden || a.fecha.localeCompare(b.fecha));
    cb(columnas, notas);
  }, onError);
  const u2 = onSnapshot(collection(db, ...g(grupoId, 'notas')), s => {
    notas = Object.fromEntries(s.docs.map(d => {
      const x = d.data() as Partial<NotasAlumno>;
      return [d.id, { matricula: d.id, valores: x.valores ?? {}, estados: x.estados ?? {}, comentarios: x.comentarios ?? {}, rubricas: x.rubricas ?? {} }];
    }));
    cb(columnas, notas);
  }, onError);
  return () => { u1(); u2(); };
}

export async function guardarColumna(grupoId: string, c: Omit<Columna, 'id'> & { id?: string }): Promise<string> {
  const ref = c.id ? doc(db, ...g(grupoId, 'columnas', c.id)) : doc(collection(db, ...g(grupoId, 'columnas')));
  const { id: _omit, ...datos } = c;
  await setDoc(ref, datos);
  return ref.id;
}

/** Borra la columna y, con ella, sus notas en cada alumno. */
export async function borrarColumna(grupoId: string, colId: string, matriculas: string[]) {
  const b = writeBatch(db);
  for (const m of matriculas) b.set(doc(db, ...g(grupoId, 'notas', m)), {
    matricula: m, valores: { [colId]: deleteField() }, estados: { [colId]: deleteField() },
    comentarios: { [colId]: deleteField() }, rubricas: { [colId]: deleteField() },
  }, { merge: true });
  b.delete(doc(db, ...g(grupoId, 'columnas', colId)));
  await b.commit();
}

/** Una escritura por casilla (merge), nunca el documento entero. null = vaciar. */
export async function guardarCasilla(grupoId: string, matricula: string, colId: string, cambios: {
  valor?: number | null; estado?: EstadoEntrega | null; comentario?: string; rubrica?: Record<string, number> | null;
}) {
  const datos: any = { matricula };
  if ('valor' in cambios) datos.valores = { [colId]: cambios.valor ?? deleteField() };
  if ('estado' in cambios) datos.estados = { [colId]: cambios.estado ?? deleteField() };
  if ('comentario' in cambios) datos.comentarios = { [colId]: cambios.comentario || deleteField() };
  if ('rubrica' in cambios) datos.rubricas = { [colId]: cambios.rubrica ?? deleteField() };
  await setDoc(doc(db, ...g(grupoId, 'notas', matricula)), datos, { merge: true });
}

/** Una misma marca para varios alumnos de una columna ("todos entregaron"), en un solo lote. */
export async function rellenarColumna(grupoId: string, colId: string, matriculas: string[], cambios: { valor?: number; estado?: EstadoEntrega }) {
  for (let i = 0; i < matriculas.length; i += 450) {
    const b = writeBatch(db);
    for (const m of matriculas.slice(i, i + 450)) {
      const datos: any = { matricula: m };
      if (cambios.valor !== undefined) datos.valores = { [colId]: cambios.valor };
      if (cambios.estado) datos.estados = { [colId]: cambios.estado };
      b.set(doc(db, ...g(grupoId, 'notas', m)), datos, { merge: true });
    }
    await b.commit();
  }
}

export async function guardarVaciasCuentanCero(grupoId: string, valor: boolean) {
  await updateDoc(doc(db, 'misGrupos', grupoId), { vaciasCuentanCero: valor });
}

// ─── Exámenes ───────────────────────────────────────────────────────────────

export interface Examen {
  id: string;
  titulo: string;
  instrucciones: string;
  minutos: number;
  estado: 'borrador' | 'abierto' | 'cerrado';
  preguntas: Pregunta[];
  columnaId: string;
  descripcionClase: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Intento {
  matricula: string;
  estado: 'en curso' | 'entregado';
  respuestas: Record<string, RespuestaAlumno>;
  revision?: Record<string, number>;
  calificacion?: number;
}

/** Firestore no guarda `undefined`: se limpian antes de escribir. */
const limpio = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export async function listarExamenes(grupoId: string): Promise<Examen[]> {
  const s = await getDocs(collection(db, ...g(grupoId, 'examenes')));
  return s.docs.map(d => ({ ...(d.data() as Omit<Examen, 'id'>), id: d.id })).sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

export async function guardarExamen(grupoId: string, ex: Omit<Examen, 'id'> & { id?: string }, clave?: Record<string, ClavePregunta>): Promise<string> {
  const ref = ex.id ? doc(db, ...g(grupoId, 'examenes', ex.id)) : doc(collection(db, ...g(grupoId, 'examenes')));
  const { id: _omit, ...datos } = ex;
  // Doble seguro: aunque una pregunta trajera un campo de clave, no se publica.
  const preguntas = datos.preguntas.map(({ id, tipo, texto, contexto, puntos, opciones, izquierda, derecha, elementos, unidad, extension, pedirConfianza }) =>
    ({ id, tipo, texto, contexto, puntos, opciones, izquierda, derecha, elementos, unidad, extension, pedirConfianza }));
  await setDoc(ref, limpio({ ...datos, preguntas, actualizadoEn: ahora() }));
  if (clave) await setDoc(doc(db, ...g(grupoId, 'examenes', ref.id, 'privado', 'clave')), limpio(clave));
  return ref.id;
}

export async function leerClave(grupoId: string, exId: string): Promise<Record<string, ClavePregunta>> {
  const s = await getDoc(doc(db, ...g(grupoId, 'examenes', exId, 'privado', 'clave')));
  return (s.data() as Record<string, ClavePregunta>) ?? {};
}

export async function cambiarEstadoExamen(grupoId: string, exId: string, estado: Examen['estado']) {
  await updateDoc(doc(db, ...g(grupoId, 'examenes', exId)), { estado, actualizadoEn: ahora() });
}

export async function leerIntentos(grupoId: string, exId: string): Promise<Intento[]> {
  const s = await getDocs(collection(db, ...g(grupoId, 'examenes', exId, 'intentos')));
  return s.docs.map(d => d.data() as Intento);
}

export async function guardarRevision(grupoId: string, exId: string, matricula: string, revision: Record<string, number>, calificacion: number) {
  await updateDoc(doc(db, ...g(grupoId, 'examenes', exId, 'intentos', matricula)), { revision, calificacion, calificadoEn: ahora() });
}

export async function borrarIntento(grupoId: string, exId: string, matricula: string) {
  await deleteDoc(doc(db, ...g(grupoId, 'examenes', exId, 'intentos', matricula)));
}

export type { Rubrica };
