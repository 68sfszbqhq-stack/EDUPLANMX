/**
 * La clase como un todo: lo que se suma al cuaderno de notas para que todo
 * quede en un solo lugar.
 *   misGrupos/{g}/asistencia/{fecha}    marcas de una sesión { matricula: P|R|F|J }
 *   misGrupos/{g}/diario/{fecha}        lo que pasó realmente en esa clase
 *   misGrupos/{g}/anotaciones/{id}      notas del docente sobre un alumno
 * Todo lo lee y escribe solo el docente dueño del grupo (firestore.rules).
 */
import { collection, deleteDoc, deleteField, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MarcaAsistencia, Ponderacion, Sesion, calificarIntento, notaSobre } from '../evaluacion/modelo';
import { Examen, guardarCasilla, guardarRevision, leerClave, leerIntentos, listarExamenes } from '../evaluacion/storage';

const ahora = () => new Date().toISOString();
export const hoy = () => new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD en hora local

// ─── Asistencia ─────────────────────────────────────────────────────────────

export function escucharAsistencia(grupoId: string, cb: (s: Sesion[]) => void, onError: (e: Error) => void) {
  return onSnapshot(collection(db, 'misGrupos', grupoId, 'asistencia'),
    s => cb(s.docs.map(d => ({ fecha: d.id, marcas: (d.data().marcas ?? {}) as Sesion['marcas'] })).sort((a, b) => a.fecha.localeCompare(b.fecha))),
    onError);
}

export async function marcarAsistencia(grupoId: string, fecha: string, marcas: Record<string, MarcaAsistencia | null>) {
  const m = Object.fromEntries(Object.entries(marcas).map(([k, v]) => [k, v ?? deleteField()]));
  await setDoc(doc(db, 'misGrupos', grupoId, 'asistencia', fecha), { fecha, marcas: m, actualizadoEn: ahora() }, { merge: true });
}

export async function borrarSesion(grupoId: string, fecha: string) {
  await deleteDoc(doc(db, 'misGrupos', grupoId, 'asistencia', fecha));
}

// ─── Diario de clase ────────────────────────────────────────────────────────

export interface EntradaDiario { fecha: string; texto: string; actualizadoEn: string }

export function escucharDiario(grupoId: string, cb: (e: EntradaDiario[]) => void, onError: (e: Error) => void) {
  return onSnapshot(collection(db, 'misGrupos', grupoId, 'diario'),
    s => cb(s.docs.map(d => ({ ...(d.data() as EntradaDiario), fecha: d.id })).sort((a, b) => b.fecha.localeCompare(a.fecha))),
    onError);
}

export async function guardarDiario(grupoId: string, fecha: string, texto: string) {
  const ref = doc(db, 'misGrupos', grupoId, 'diario', fecha);
  if (!texto.trim()) return deleteDoc(ref);
  await setDoc(ref, { fecha, texto: texto.slice(0, 8000), actualizadoEn: ahora() });
}

// ─── Anotaciones sobre un alumno ────────────────────────────────────────────

/** 'accion' = lo que hizo el docente para apoyar (plática, aviso a la familia, canalización): es la evidencia del seguimiento. */
export type TipoAnotacion = 'positiva' | 'atencion' | 'accion' | 'nota';
export interface Anotacion { id: string; matricula: string; fecha: string; tipo: TipoAnotacion; texto: string }

export function escucharAnotaciones(grupoId: string, cb: (a: Anotacion[]) => void, onError: (e: Error) => void) {
  return onSnapshot(collection(db, 'misGrupos', grupoId, 'anotaciones'),
    s => cb(s.docs.map(d => ({ ...(d.data() as Omit<Anotacion, 'id'>), id: d.id })).sort((a, b) => b.fecha.localeCompare(a.fecha))),
    onError);
}

export async function agregarAnotacion(grupoId: string, a: Omit<Anotacion, 'id'>) {
  await setDoc(doc(collection(db, 'misGrupos', grupoId, 'anotaciones')), { ...a, texto: a.texto.slice(0, 1000) });
}

export async function borrarAnotacion(grupoId: string, id: string) {
  await deleteDoc(doc(db, 'misGrupos', grupoId, 'anotaciones', id));
}

// ─── Ponderación ────────────────────────────────────────────────────────────

export async function guardarPonderacion(grupoId: string, p: Ponderacion) {
  const limpia = Object.fromEntries(Object.entries(p).filter(([, v]) => (v ?? 0) > 0));
  await updateDoc(doc(db, 'misGrupos', grupoId), { ponderacion: limpia });
}

export async function guardarParciales(grupoId: string, parciales: { nombre: string; inicio: string; fin: string }[]) {
  await updateDoc(doc(db, 'misGrupos', grupoId), { parciales });
}

// ─── Exámenes → cuaderno, sin pasos de más ──────────────────────────────────

export interface EstadoExamenes {
  /** columnaId → examen, para saber qué columnas son de un examen */
  porColumna: Record<string, Examen>;
  /** columnaId → matrículas que entregaron con respuestas escritas sin revisar */
  porRevisar: Record<string, string[]>;
  /** columnaId → matrículas contestando ahora mismo */
  enCurso: Record<string, string[]>;
  /** calificaciones que se acaban de pasar solas al cuaderno */
  calificados: number;
}

/**
 * Cada vez que el docente abre la clase: los exámenes entregados que solo
 * tienen preguntas cerradas se califican y su nota cae sola en el cuaderno. Los
 * que tienen respuestas escritas quedan marcados "por revisar" en su casilla.
 * Se califica aquí, en la pantalla del docente, porque la clave solo él la lee.
 * Una nota ya guardada nunca se sobrescribe.
 */
export async function sincronizarExamenes(grupoId: string): Promise<EstadoExamenes> {
  const r: EstadoExamenes = { porColumna: {}, porRevisar: {}, enCurso: {}, calificados: 0 };
  const examenes = (await listarExamenes(grupoId)).filter(e => e.estado !== 'borrador' && e.columnaId);
  await Promise.all(examenes.map(async ex => {
    r.porColumna[ex.columnaId] = ex;
    const [clave, intentos] = await Promise.all([leerClave(grupoId, ex.id), leerIntentos(grupoId, ex.id)]);
    for (const it of intentos) {
      if (it.estado === 'en curso') { (r.enCurso[ex.columnaId] ??= []).push(it.matricula); continue; }
      if (it.calificacion !== undefined) continue;
      const res = calificarIntento(ex.preguntas, clave, it.respuestas ?? {}, it.revision ?? {});
      if (res.pendientes.length) { (r.porRevisar[ex.columnaId] ??= []).push(it.matricula); continue; }
      const nota = notaSobre(res.automaticos, res.maximo, 10);
      await guardarRevision(grupoId, ex.id, it.matricula, it.revision ?? {}, nota);
      await guardarCasilla(grupoId, it.matricula, ex.columnaId, { valor: nota, estado: 'entregado' });
      r.calificados++;
    }
  }));
  return r;
}
