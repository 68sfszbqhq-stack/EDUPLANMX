/**
 * Mi página de clases — lectura y escritura en Firestore.
 *   paginasClase/{slug}   pública si publicada == true; solo el dueño la edita.
 */
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PaginaClase, problemas } from './modelo';

const paginas = () => collection(db, 'paginasClase');

/** La página del docente (una por docente), o null si aún no la crea. */
export async function miPagina(docenteUid: string): Promise<PaginaClase | null> {
  const s = await getDocs(query(paginas(), where('docenteUid', '==', docenteUid)));
  return s.empty ? null : (s.docs[0].data() as PaginaClase);
}

/** La página pública. Si no existe o no está publicada, null (las reglas no dejan leerla). */
export async function leerPagina(slug: string): Promise<PaginaClase | null> {
  try {
    const s = await getDoc(doc(paginas(), slug));
    return s.exists() ? (s.data() as PaginaClase) : null;
  } catch {
    return null;
  }
}

/** ¿La dirección está libre? (o ya es mía) */
export async function direccionLibre(slug: string, docenteUid: string): Promise<boolean> {
  try {
    const s = await getDoc(doc(paginas(), slug));
    return !s.exists() || (s.data() as PaginaClase).docenteUid === docenteUid;
  } catch {
    // Existe pero no está publicada y es de otro docente: las reglas no dejan leerla.
    return false;
  }
}

/**
 * Guarda la página. Si el docente cambió la dirección, se crea la nueva y se
 * borra la anterior (el enlace viejo deja de funcionar: se le avisa en pantalla).
 */
export async function guardarPagina(p: PaginaClase, slugAnterior?: string): Promise<void> {
  const mal = problemas(p);
  if (mal.length) throw new Error(mal[0]);
  const datos: PaginaClase = { ...p, actualizadoEn: new Date().toISOString() };
  try {
    await setDoc(doc(paginas(), p.slug), datos);
  } catch (e: any) {
    if (e?.code === 'permission-denied') throw new Error('Esa dirección ya la usa otro docente. Prueba con otra.');
    throw e;
  }
  if (slugAnterior && slugAnterior !== p.slug) await deleteDoc(doc(paginas(), slugAnterior));
}

/** Dirección completa de la página, para copiar y compartir con los alumnos. */
export function urlPagina(slug: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}clase/${slug}`;
}
