import { collection, doc, getDocFromServer, getDocsFromServer, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FuenteEscolar, validarFuente } from './model';
export interface AccesoCuaderno { schoolId: string; userId: string; mode: 'local' | 'escuela' }
const key = (a: AccesoCuaderno) => `eduplan:cuaderno:v1:${encodeURIComponent(a.schoolId)}:${encodeURIComponent(a.userId)}`;
export async function listarFuentes(a: AccesoCuaderno): Promise<FuenteEscolar[]> {
  if (!a.schoolId || !a.userId) throw new Error('Selecciona una escuela e inicia sesión.');
  if (a.mode === 'escuela') {
    const snap = await getDocsFromServer(collection(db, 'schoolNotebooks', a.schoolId, 'sources'));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as FuenteEscolar));
  }
  const raw = JSON.parse(localStorage.getItem(key(a)) || '[]');
  if (!Array.isArray(raw)) throw new Error('El cuaderno local no tiene un formato válido.');
  return raw.filter(f => f.schoolId === a.schoolId && f.authorId === a.userId);
}
export async function guardarFuente(a: AccesoCuaderno, f: FuenteEscolar): Promise<void> {
  validarFuente(f);
  if (f.schoolId !== a.schoolId || f.authorId !== a.userId || f.status !== 'borrador') throw new Error('No se puede guardar esa fuente en este cuaderno.');
  if (a.mode === 'escuela') await setDoc(doc(db, 'schoolNotebooks', a.schoolId, 'sources', f.id), f);
  else {
    const all = await listarFuentes(a);
    if (all.some(x => x.id === f.id)) throw new Error('Esta fuente ya existe; crea una nueva versión.');
    localStorage.setItem(key(a), JSON.stringify([f, ...all]));
  }
}
export async function revisarFuente(a: AccesoCuaderno, id: string, status: 'revisada' | 'archivada'): Promise<void> {
  const changes = { status, reviewedBy: a.userId, reviewedAt: new Date().toISOString() };
  if (a.mode === 'escuela') await updateDoc(doc(db, 'schoolNotebooks', a.schoolId, 'sources', id), changes);
  else {
    const all = await listarFuentes(a);
    localStorage.setItem(key(a), JSON.stringify(all.map(f => f.id === id ? { ...f, ...changes } : f)));
  }
}
export async function esRevisor(a: AccesoCuaderno): Promise<boolean> {
  if (a.mode === 'local') return true;
  const m = await getDocFromServer(doc(db, 'schoolNotebooks', a.schoolId, 'members', a.userId));
  return m.data()?.role === 'reviewer';
}
