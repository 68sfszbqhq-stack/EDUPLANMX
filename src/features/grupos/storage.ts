import { collection, doc, getDocs, query, where, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AlumnoLista, Grupo, Resultado, VistaPrevia, asignarClaves, normalizarMatricula } from './model';

// Rutas de la fuente de verdad compartida con Antología v2 (ver model.ts).
const grupos = () => collection(db, 'misGrupos');
const lista = (grupoId: string) => collection(db, 'misGrupos', grupoId, 'lista');
const indice = (matricula: string, grupoId: string) => doc(db, 'matriculas', matricula, 'grupos', grupoId);

const ahora = () => new Date().toISOString();

export async function listarGrupos(docenteUid: string): Promise<Grupo[]> {
  const snap = await getDocs(query(grupos(), where('docenteUid', '==', docenteUid)));
  return snap.docs.map(d => ({ ...(d.data() as Omit<Grupo, 'id'>), id: d.id }))
    .filter(g => !(g as any).archivado)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export async function crearGrupo(docenteUid: string, datos: Pick<Grupo, 'nombre' | 'asignaturaClave' | 'asignaturaNombre' | 'ciclo'>): Promise<Grupo> {
  const ref = doc(grupos());
  const g = { docenteUid, ...datos, creadoEn: ahora(), archivado: false };
  await setDoc(ref, g);
  return { ...g, id: ref.id };
}

export async function leerLista(grupoId: string): Promise<AlumnoLista[]> {
  const snap = await getDocs(lista(grupoId));
  return snap.docs.map(d => d.data() as AlumnoLista).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Todos los alumnos de las demás clases del docente: para reutilizar la clave de un mismo alumno. */
export async function leerListasDelDocente(docenteUid: string, salvo = ''): Promise<AlumnoLista[]> {
  const gs = await listarGrupos(docenteUid);
  const listas = await Promise.all(gs.filter(g => g.id !== salvo).map(g => leerLista(g.id)));
  return listas.flat();
}

export async function leerResultados(grupoId: string): Promise<Resultado[]> {
  const snap = await getDocs(collection(db, 'misGrupos', grupoId, 'resultados'));
  return snap.docs.map(d => d.data() as Resultado);
}

/**
 * Guarda lo que el docente confirmó en la vista previa. Los alumnos nuevos se
 * crean con su matrícula como ID (setDoc idempotente); las correcciones de
 * nombre solo se aplican si el docente las aceptó. Nada se borra: quien ya no
 * viene en el archivo se queda como estaba.
 */
export async function guardarImportacion(grupo: Grupo, vista: VistaPrevia, aplicarCambios: boolean): Promise<{ agregados: number; corregidos: number }> {
  const ops: ((b: ReturnType<typeof writeBatch>) => void)[] = [];
  const marca = ahora();
  const enIndice = new Set<string>();

  for (const f of vista.nuevos) {
    if (!f.matricula) throw new Error(`Falta asignar clave a ${f.nombre}.`);
    ops.push(b => b.set(doc(lista(grupo.id), f.matricula), {
      matricula: f.matricula, nombre: f.nombre, estado: 'activo', cuentaUid: '', cuentaCorreo: '', actualizadoEn: marca,
      ...(f.generada ? { generada: true } : {}),
    }));
    enIndice.add(f.matricula);
  }
  if (aplicarCambios) for (const c of vista.cambios) {
    ops.push(b => b.update(doc(lista(grupo.id), c.matricula), { nombre: c.despues, actualizadoEn: marca }));
    enIndice.add(c.matricula);
  }
  for (const f of vista.sinCambios) enIndice.add(f.matricula); // repara el índice si faltaba
  for (const m of enIndice) {
    ops.push(b => b.set(indice(m, grupo.id), { asignaturaClave: grupo.asignaturaClave, grupoNombre: grupo.nombre, docenteUid: grupo.docenteUid }));
  }

  // Un lote de Firestore admite 500 operaciones.
  for (let i = 0; i < ops.length; i += 450) {
    const b = writeBatch(db);
    ops.slice(i, i + 450).forEach(op => op(b));
    await b.commit();
  }
  return { agregados: vista.nuevos.length, corregidos: aplicarCambios ? vista.cambios.length : 0 };
}

export async function cambiarEstado(grupoId: string, matricula: string, estado: AlumnoLista['estado']) {
  await updateDoc(doc(lista(grupoId), normalizarMatricula(matricula)), { estado, actualizadoEn: ahora() });
}

/** Suelta la cuenta de Antología ligada a una matrícula (p. ej. si la reclamó quien no era). */
export async function desvincular(grupoId: string, matricula: string) {
  await updateDoc(doc(lista(grupoId), matricula), { cuentaUid: '', cuentaCorreo: '', actualizadoEn: ahora() });
}


/** Importar de punta a punta: da clave a quien no trae matrícula y guarda. */
export async function importarAlumnos(grupo: Grupo, vista: VistaPrevia, aplicarCambios: boolean) {
  const necesitaClave = vista.nuevos.some(f => !f.matricula);
  const otras = necesitaClave ? await leerListasDelDocente(grupo.docenteUid, grupo.id) : [];
  const existentes = necesitaClave ? await leerLista(grupo.id) : [];
  const nuevos = asignarClaves(vista.nuevos, otras, existentes.map(a => a.matricula));
  return guardarImportacion(grupo, { ...vista, nuevos }, aplicarCambios);
}
