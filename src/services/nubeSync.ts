import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Respaldo en la nube de los datos personales del docente (flujo y bitácora).
 *
 * Criterio de diseño: offline-first. Muchos planteles trabajan sin internet, así
 * que localStorage es la fuente de lectura inmediata y Firestore es el respaldo
 * que permite abrir la app en otro dispositivo. Si la nube falla, la app sigue
 * funcionando con lo local; nunca se bloquea al docente por falta de conexión.
 *
 * Todo vive como campos del documento del propio usuario (`users/{uid}`), que las
 * reglas de Firestore ya permiten leer/escribir a su dueño y que cuesta una sola
 * lectura — importante en el plan gratuito de Firebase.
 */

export interface UsuarioSync {
    id?: string;
    rol?: string;
}

/** El modo demo (invitado) no toca Firestore: no tiene sesión real. */
export const puedeSincronizar = (user?: UsuarioSync | null): user is UsuarioSync & { id: string } =>
    Boolean(user?.id && user.id !== 'guest' && user.rol !== 'guest');

/** Lee un campo del documento del usuario. Devuelve undefined si no hay nada o falla. */
export async function leerCampoUsuario<T>(uid: string, campo: string): Promise<T | undefined> {
    try {
        const snap = await getDoc(doc(db, 'users', uid));
        return snap.data()?.[campo] as T | undefined;
    } catch (e) {
        console.warn(`No se pudo leer "${campo}" de la nube (se usa la copia local):`, e);
        return undefined;
    }
}

/** Escribe un campo en el documento del usuario sin pisar el resto del perfil. */
export async function escribirCampoUsuario(uid: string, campo: string, valor: unknown): Promise<boolean> {
    try {
        await setDoc(doc(db, 'users', uid), { [campo]: valor }, { merge: true });
        return true;
    } catch (e) {
        console.warn(`No se pudo respaldar "${campo}" en la nube (queda guardado localmente):`, e);
        return false;
    }
}
