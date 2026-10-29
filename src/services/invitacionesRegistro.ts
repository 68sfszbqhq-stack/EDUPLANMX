import { doc, getDoc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Alumno } from '../../types/diagnostico';

export async function crearInvitacionRegistro(schoolId: string): Promise<string> {
  if (!auth.currentUser || !schoolId) throw new Error('Inicia sesión en tu plantel.');
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
  await setDoc(doc(db, 'invitacionesRegistro', token), {
    schoolId, createdBy: auth.currentUser.uid, creadaEn: serverTimestamp(),
    venceEn: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), revocada: false,
  });
  // El fragmento no viaja en solicitudes HTTP ni en el encabezado Referer.
  const url = new URL(`${import.meta.env.BASE_URL}registro`, location.origin);
  url.hash = `invitacion=${token}`;
  return url.toString();
}
export async function consultarInvitacion(token: string): Promise<string> {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Solicita a tu docente un enlace individual de registro.');
  const snap = await getDoc(doc(db, 'invitacionesRegistro', token));
  if (!snap.exists() || snap.data().revocada || snap.data().venceEn.toMillis() <= Date.now()) throw new Error('El enlace venció o fue cancelado. Solicita uno nuevo a tu docente.');
  return snap.data().schoolId;
}
export async function registrarConInvitacion(token: string, alumno: Omit<Alumno, 'id'>): Promise<void> {
  // El ID coincide con la invitación: solo se admite create, jamás sobrescribir o reutilizar.
  await setDoc(doc(db, 'alumnos', token), { ...alumno, invitacion: token });
}
