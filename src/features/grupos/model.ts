/**
 * Mis grupos — lógica pura (sin Firebase), para poder probarla sin red.
 *
 * Fuente de verdad compartida con Antología v2 (misma base de datos):
 *   misGrupos/{grupoId}                    el grupo del docente (dueño: docenteUid)
 *   misGrupos/{grupoId}/lista/{matricula}  un alumno; el ID ES la matrícula normalizada,
 *                                          así que importar dos veces no puede duplicar
 *   misGrupos/{grupoId}/resultados/{id}    lo que el alumno contestó en Antología
 *   matriculas/{matricula}/grupos/{id}     índice para que el alumno encuentre su grupo
 *
 * Nunca se relaciona a un alumno por su nombre: solo por matrícula (o la clave
 * que la plataforma le da cuando la lista no la trae).
 */
import type { Ponderacion } from '../evaluacion/modelo';

/** Misma regla que Antología (src/lib/matricula.mjs): "2024-001", " 2024001 " → "2024001". */
export function normalizarMatricula(m: unknown): string {
  return String(m ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function limpiarNombre(n: unknown): string {
  return String(n ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

/** Asignaturas que Antología v2 sabe reportar. La clave es lo que conecta ambas apps. */
export const ASIGNATURAS_CONECTADAS = [
  { clave: 'cultura-digital-1', nombre: 'Cultura Digital I' },
  { clave: 'lengua-y-comunicacion-1', nombre: 'Lengua y Comunicación I' },
] as const;

export interface Grupo {
  id: string;
  docenteUid: string;
  nombre: string;          // "1º A Vesp"
  asignaturaClave: string; // "cultura-digital-1" u otra libre
  asignaturaNombre: string;
  ciclo: string;           // "2026-2027"
  creadoEn: string;
  /** Cuaderno de notas: al cerrar el periodo, lo que no tiene nota cuenta como 0. */
  vaciasCuentanCero?: boolean;
  /** Cuánto pesa cada tipo de actividad en el promedio (como iDoceo). Vacío = todo vale igual. */
  ponderacion?: Ponderacion;
  /** Fechas de cada parcial; todo lo que tiene fecha cae solo en el suyo. */
  parciales?: { nombre: string; inicio: string; fin: string }[];
}

export interface AlumnoLista {
  matricula: string;
  nombre: string;
  estado: 'activo' | 'baja';
  /** Cuenta de Antología que reclamó esta matrícula. Vacío = aún no entra. */
  cuentaUid: string;
  cuentaCorreo: string;
  /** La lista no traía matrícula: la clave la generó la plataforma y se le entrega al alumno. */
  generada?: boolean;
}

export interface Resultado {
  matricula: string;
  instrumento: string;      // "cultura-digital-1/modulo-3"
  titulo: string;
  aciertos: number;
  total: number;
  porcentaje: number;
  porEje: Record<string, { ok: number; total: number }>;
}

// ─── Leer una lista pegada desde Excel, o un CSV ────────────────────────────

export interface FilaLeida {
  fila: number;
  /** La clave la generó la plataforma (no venía matrícula). */
  generada?: boolean;
  /** '' si la lista no trae matrícula: al guardar se le asigna una clave. */
  matricula: string;
  nombre: string;
  /** Parece título o encabezado ("Lista de asistencia 1º A"): se propone no importarla. */
  dudosa?: boolean;
}
export interface FilaInvalida { fila: number; texto: string; motivo: string; }

const ENCABEZADO_MATRICULA = /matr[ií]cula|^id$|n[uú]mero de control|no\.? ?control|^clave$/i;
const ENCABEZADO_PATERNO = /paterno|primer apellido/i;
const ENCABEZADO_MATERNO = /materno|segundo apellido/i;
const ENCABEZADO_APELLIDOS = /^apellidos?$/i;
const ENCABEZADO_NOMBRE = /nombre|alumno|estudiante/i;
const PALABRAS_DE_TITULO = /\b(lista|grupo|asignatura|materia|profesora?|docente|ciclo|semestre|turno|escuela|plantel|bachillerato|total|fecha)\b/i;

const tieneLetras = (c: string) => /[a-záéíóúüñ]{2,}/i.test(c);
const esCorreo = (c: string) => /@/.test(c);
/** Una matrícula: tiene dígitos y al menos 4 caracteres (así "1", "2"… de la numeración no lo son). */
const pareceMatricula = (c: string) => /\d/.test(c) && normalizarMatricula(c).length >= 4 && !/^\d{1,3}$/.test(c.trim());

/**
 * Acepta lo que un docente tiene a la mano: una sola columna de nombres pegada
 * desde Excel, o columnas de apellido paterno, materno y nombre(s), con o sin
 * matrícula, separadas por tabuladores (Excel/Sheets), comas o punto y coma.
 * Si hay encabezados los usa; si no, adivina: lo que parece matrícula es la
 * matrícula y las celdas con letras forman el nombre.
 */
export function leerLista(texto: string): { filas: FilaLeida[]; invalidas: FilaInvalida[] } {
  const lineas = texto.replace(/\r/g, '').split('\n');
  const sep = (l: string) => (l.includes('\t') ? '\t' : l.includes(';') ? ';' : ',');
  const partir = (l: string) => l.split(sep(l)).map(c => c.trim().replace(/^"(.*)"$/, '$1').trim());

  // Encabezados: se buscan en las primeras 5 filas (a veces arriba hay un título).
  let cols: { m: number; pat: number; mat: number; ape: number; nom: number } | null = null;
  let inicio = 0;
  for (let i = 0, vistas = 0; i < lineas.length && vistas < 5; i++) {
    if (!lineas[i].trim()) continue;
    vistas++;
    const celdas = partir(lineas[i]);
    const busca = (re: RegExp) => celdas.findIndex(c => re.test(c) && c.length <= 40);
    const c = { m: busca(ENCABEZADO_MATRICULA), pat: busca(ENCABEZADO_PATERNO), mat: busca(ENCABEZADO_MATERNO), ape: busca(ENCABEZADO_APELLIDOS), nom: -1 };
    c.nom = celdas.findIndex((x, k) => ENCABEZADO_NOMBRE.test(x) && x.length <= 40 && k !== c.m && k !== c.pat && k !== c.mat);
    const reconocidas = [c.m, c.pat, c.mat, c.ape, c.nom].filter(k => k >= 0).length;
    // Un encabezado no trae datos: si la fila tiene algo con pinta de matrícula, no lo es.
    if (reconocidas >= 1 && (c.pat >= 0 || c.m >= 0 || c.ape >= 0 || celdas.length > 1 || /^nombres?( completo)?$/i.test(celdas[0])) && !celdas.some(pareceMatricula)) {
      cols = c; inicio = i + 1; break;
    }
  }

  const filas: FilaLeida[] = [];
  const invalidas: FilaInvalida[] = [];
  for (let i = inicio; i < lineas.length; i++) {
    const l = lineas[i];
    if (!l.replace(/[\t,;"]/g, '').trim()) continue;
    const celdas = partir(l);
    let matriculaCruda = '';
    let partes: string[];
    if (cols) {
      matriculaCruda = cols.m >= 0 ? celdas[cols.m] ?? '' : '';
      partes = [cols.pat, cols.mat, cols.ape, cols.nom].filter(k => k >= 0).map(k => celdas[k] ?? '');
      if (!partes.some(tieneLetras)) partes = celdas.filter((c, k) => k !== cols!.m && tieneLetras(c) && !esCorreo(c));
    } else {
      const mi = celdas.findIndex(pareceMatricula);
      matriculaCruda = mi >= 0 ? celdas[mi] : '';
      partes = celdas.filter((c, k) => k !== mi && tieneLetras(c) && !esCorreo(c) && !/\d/.test(c));
    }
    const matricula = normalizarMatricula(matriculaCruda);
    const nombre = limpiarNombre(partes.filter(Boolean).join(' '));
    if (!nombre) {
      if (celdas.some(tieneLetras) || matricula) invalidas.push({ fila: i + 1, texto: l.trim(), motivo: 'Sin nombre' });
      continue;
    }
    if (matricula.length > 20) { invalidas.push({ fila: i + 1, texto: l.trim(), motivo: 'Matrícula demasiado larga' }); continue; }
    const fila: FilaLeida = { fila: i + 1, matricula, nombre };
    if (!matricula && (PALABRAS_DE_TITULO.test(nombre) || nombre.split(' ').length > 7 || /[:]/.test(nombre))) fila.dudosa = true;
    filas.push(fila);
  }
  return { filas, invalidas };
}

/** "Pérez López, Ana" y "ana perez lopez" son la misma persona: sin acentos, sin orden. */
export function claveDeNombre(n: string): string {
  return String(n ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
}

// ─── Comparar con la lista que ya existe, antes de guardar ──────────────────

export interface VistaPrevia {
  nuevos: FilaLeida[];
  sinCambios: FilaLeida[];
  cambios: { matricula: string; antes: string; despues: string }[];
  repetidosEnArchivo: { matricula: string; filas: number[] }[];
  /** Mismo nombre dos veces en una lista sin matrículas: se agregan ambos, pero se avisa. */
  nombresRepetidos: { nombre: string; filas: number[] }[];
  invalidas: FilaInvalida[];
  /** Están en la lista pero no vienen en el archivo. No se borran solos. */
  noVienen: AlumnoLista[];
}

export function compararLista(texto: string, existentes: AlumnoLista[]): VistaPrevia {
  const { filas, invalidas } = leerLista(texto);
  const porMatricula = new Map(existentes.map(a => [a.matricula, a]));
  const porNombre = new Map(existentes.map(a => [claveDeNombre(a.nombre), a]));

  const vistas = new Map<string, FilaLeida>();
  const repetidas = new Map<string, number[]>();
  const nombres = new Map<string, number[]>();
  const nuevos: FilaLeida[] = [], sinCambios: FilaLeida[] = [];
  const cambios: VistaPrevia['cambios'] = [];
  const tocados = new Set<string>();

  for (const f of filas) {
    if (!f.matricula) {
      const k = claveDeNombre(f.nombre);
      nombres.set(k, [...(nombres.get(k) ?? []), f.fila]);
      const previo = porNombre.get(k);
      if (previo && !tocados.has(previo.matricula)) { tocados.add(previo.matricula); sinCambios.push({ ...f, matricula: previo.matricula }); }
      else nuevos.push(f);
      continue;
    }
    if (vistas.has(f.matricula)) {
      const filasRep = repetidas.get(f.matricula) ?? [vistas.get(f.matricula)!.fila];
      repetidas.set(f.matricula, [...filasRep, f.fila]);
    } else vistas.set(f.matricula, f);
  }
  for (const f of vistas.values()) {
    if (repetidas.has(f.matricula)) continue; // conflicto: el docente decide
    tocados.add(f.matricula);
    const previo = porMatricula.get(f.matricula);
    if (!previo) nuevos.push(f);
    else if (previo.nombre === f.nombre) sinCambios.push(f);
    else cambios.push({ matricula: f.matricula, antes: previo.nombre, despues: f.nombre });
  }

  return {
    nuevos, sinCambios, cambios, invalidas,
    repetidosEnArchivo: [...repetidas].map(([matricula, fs]) => ({ matricula, filas: fs })),
    nombresRepetidos: [...nombres].filter(([, fs]) => fs.length > 1).map(([, fs]) => ({ nombre: filas.find(f => f.fila === fs[0])!.nombre, filas: fs })),
    noVienen: existentes.filter(a => a.estado === 'activo' && !tocados.has(a.matricula)),
  };
}

// ─── Claves para quien no tiene matrícula ───────────────────────────────────

/** Sin 0/o ni 1/i/l: se dictan y se copian de un papel sin confusiones (igual que Antología). */
export const ALFABETO_CLAVE = '23456789abcdefghjkmnpqrstuvwxyz';

/** Clave de 6 caracteres con al menos una letra y un número, para que nunca parezca una matrícula. */
export function generarClave(azar: () => number = Math.random): string {
  for (;;) {
    let c = '';
    for (let i = 0; i < 6; i++) c += ALFABETO_CLAVE[Math.floor(azar() * ALFABETO_CLAVE.length)];
    if (/[a-z]/.test(c) && /\d/.test(c)) return c;
  }
}

/**
 * Le da clave a los alumnos nuevos que no traen matrícula. Si el mismo nombre
 * ya tiene clave en otra clase del docente, la reutiliza: así el alumno usa una
 * sola clave en Antología aunque lo tengas en dos materias.
 */
export function asignarClaves(nuevos: FilaLeida[], otrasClases: AlumnoLista[], enEstaClase: string[] = [], azar: () => number = Math.random): FilaLeida[] {
  const usadas = new Set([...otrasClases.map(a => a.matricula), ...enEstaClase]);
  const porNombre = new Map(otrasClases.filter(a => a.generada).map(a => [claveDeNombre(a.nombre), a.matricula]));
  const enEsta = new Set<string>(enEstaClase);
  return nuevos.map(f => {
    if (f.matricula) { enEsta.add(f.matricula); return f; }
    const previa = porNombre.get(claveDeNombre(f.nombre));
    if (previa && !enEsta.has(previa)) { enEsta.add(previa); return { ...f, matricula: previa, generada: true }; }
    let c = generarClave(azar);
    while (usadas.has(c) || enEsta.has(c)) c = generarClave(azar);
    enEsta.add(c);
    return { ...f, matricula: c, generada: true };
  });
}

// ─── Resumen de resultados para la planeación ───────────────────────────────

export interface ResumenInstrumento {
  instrumento: string;
  titulo: string;
  enLista: number;
  contestaron: number;
  sinCuenta: number;        // nunca entraron a Antología: no hay dato
  pendientes: number;       // entraron pero no han contestado este instrumento
  promedio: number | null;  // solo de quienes contestaron
  ejes: { eje: string; dominio: number; contestaron: number }[];
}

/**
 * Resume por instrumento y por eje. Quien no contestó cuenta como DATO FALTANTE,
 * nunca como cero: un promedio sobre 5 de 30 alumnos no describe al grupo, y el
 * resumen lo dice explícitamente.
 */
export function resumirResultados(lista: AlumnoLista[], resultados: Resultado[]): ResumenInstrumento[] {
  const activos = lista.filter(a => a.estado === 'activo');
  const matriculas = new Set(activos.map(a => a.matricula));
  const porInstrumento = new Map<string, Resultado[]>();
  for (const r of resultados) {
    if (!matriculas.has(r.matricula)) continue; // bajas o ajenos no cuentan
    porInstrumento.set(r.instrumento, [...(porInstrumento.get(r.instrumento) ?? []), r]);
  }
  return [...porInstrumento].sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true })).map(([instrumento, rs]) => {
    const contestaron = new Set(rs.map(r => r.matricula));
    const faltan = activos.filter(a => !contestaron.has(a.matricula));
    const ejes = new Map<string, { ok: number; total: number; n: number }>();
    for (const r of rs) for (const [eje, v] of Object.entries(r.porEje ?? {})) {
      const e = ejes.get(eje) ?? { ok: 0, total: 0, n: 0 };
      ejes.set(eje, { ok: e.ok + v.ok, total: e.total + v.total, n: e.n + 1 });
    }
    return {
      instrumento,
      titulo: rs[0].titulo,
      enLista: activos.length,
      contestaron: contestaron.size,
      sinCuenta: faltan.filter(a => !a.cuentaUid).length,
      pendientes: faltan.filter(a => a.cuentaUid).length,
      promedio: rs.length ? Math.round(rs.reduce((s, r) => s + r.porcentaje, 0) / rs.length) : null,
      ejes: [...ejes].map(([eje, e]) => ({ eje, dominio: e.total ? Math.round((100 * e.ok) / e.total) : 0, contestaron: e.n }))
        .sort((a, b) => a.dominio - b.dominio),
    };
  });
}

/** Texto editable que entra al campo "Diagnóstico del grupo" de la planeación. */
export function textoParaPlaneacion(grupo: Pick<Grupo, 'nombre' | 'asignaturaNombre'>, resumen: ResumenInstrumento[]): string {
  if (!resumen.length) return '';
  const lineas = [`Resultados de Antología del grupo ${grupo.nombre} (${grupo.asignaturaNombre}).`];
  for (const r of resumen) {
    const cobertura = Math.round((100 * r.contestaron) / Math.max(r.enLista, 1));
    lineas.push(`- ${r.titulo}: contestaron ${r.contestaron} de ${r.enLista} (${cobertura}%), promedio ${r.promedio}%.` +
      (cobertura < 60 ? ' COBERTURA BAJA: no generalizar al grupo.' : ''));
    const debiles = r.ejes.filter(e => e.dominio < 60);
    if (debiles.length) lineas.push(`  Ejes con menor dominio: ${debiles.map(e => `${e.eje} (${e.dominio}%)`).join(', ')}.`);
  }
  lineas.push('Quien no contestó es dato faltante, no bajo desempeño.');
  return lineas.join('\n');
}
