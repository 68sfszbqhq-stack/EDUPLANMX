/**
 * Evaluación del grupo — lógica pura (sin Firebase), para probarla sin red.
 *
 * Vive junto a Mis grupos, en la base compartida con Antología v2:
 *   misGrupos/{g}/columnas/{colId}                 columnas del cuaderno de notas
 *   misGrupos/{g}/notas/{matricula}                calificaciones de un alumno (una por columna)
 *   misGrupos/{g}/examenes/{exId}                  examen SIN respuestas (lo lee el alumno)
 *   misGrupos/{g}/examenes/{exId}/privado/clave    respuestas y criterios (solo el docente)
 *   misGrupos/{g}/examenes/{exId}/intentos/{mat}   lo que contestó cada alumno
 *
 * Reglas que vienen del cuaderno de notas de Antología (CuadernoNotas.jsx), y del
 * criterio de iDoceo:
 *   · VACÍO NO ES CERO: una casilla sin nota no cuenta, salvo que el docente active
 *     "vacías cuentan como 0" al cerrar el periodo.
 *   · "No entregó" sí es cero, porque el docente lo marcó a conciencia.
 *   · "Exento" nunca cuenta.
 *   · Si alguna columna tiene peso, el total es la media ponderada de cada columna
 *     llevada a porcentaje de su máximo; si ninguna lo tiene, es la suma de puntos
 *     sobre la suma de máximos.
 */

// ─── Cuaderno de notas ──────────────────────────────────────────────────────

export type TipoColumna = 'tarea' | 'proyecto' | 'examen' | 'participacion' | 'otro';
export type EstadoEntrega = 'entregado' | 'tarde' | 'no-entregado' | 'exento' | 'ausente';

export interface NivelRubrica { nombre: string; puntos: number; descriptor: string }
export interface CriterioRubrica { id: string; nombre: string; peso: number; niveles: NivelRubrica[] }
export interface Rubrica { criterios: CriterioRubrica[] }

export interface Columna {
  id: string;
  nombre: string;
  tipo: TipoColumna;
  max: number;          // puntos máximos (p. ej. 10)
  peso: number;         // % en el total; 0 = sin peso
  fecha: string;        // AAAA-MM-DD
  orden: number;
  rubrica: Rubrica | null;
  examenId: string;     // '' si no viene de un examen
}

export interface NotasAlumno {
  matricula: string;
  valores: Record<string, number>;
  estados: Record<string, EstadoEntrega>;
  comentarios: Record<string, string>;
  /** Nivel elegido en cada criterio de la rúbrica de una columna: { colId: { critId: índice } } */
  rubricas: Record<string, Record<string, number>>;
}

export const redondea = (n: number, dec = 1) => Math.round(n * 10 ** dec) / 10 ** dec;

/** Puntos de una columna a partir de los niveles elegidos en su rúbrica. */
export function puntosDeRubrica(rubrica: Rubrica, elegidos: Record<string, number>, max: number): number | null {
  const conPeso = rubrica.criterios.filter(c => c.niveles.length);
  if (!conPeso.length) return null;
  // Si falta algún criterio por valorar, todavía no hay nota: vacío no es cero.
  if (conPeso.some(c => elegidos[c.id] === undefined)) return null;
  const sumaPesos = conPeso.reduce((s, c) => s + (c.peso > 0 ? c.peso : 1), 0);
  const fraccion = conPeso.reduce((s, c) => {
    const tope = Math.max(...c.niveles.map(n => n.puntos));
    const nivel = c.niveles[elegidos[c.id]];
    const parte = tope > 0 && nivel ? nivel.puntos / tope : 0;
    return s + parte * (c.peso > 0 ? c.peso : 1);
  }, 0) / sumaPesos;
  return redondea(fraccion * max, 2);
}

/** Valor que cuenta para el total, o null si esa columna no cuenta para este alumno. */
export function valorQueCuenta(col: Columna, n: NotasAlumno | undefined, vaciasCuentanCero: boolean): number | null {
  const estado = n?.estados[col.id];
  if (estado === 'exento') return null;
  if (estado === 'no-entregado') return 0;
  const v = n?.valores[col.id];
  if (typeof v === 'number' && Number.isFinite(v)) return Math.min(Math.max(v, 0), col.max);
  return vaciasCuentanCero ? 0 : null;
}

export interface Total { calificacion: number | null; contadas: number; sinNota: number }

/** Calificación final sobre 10 de un alumno. */
export function calcularTotal(columnas: Columna[], n: NotasAlumno | undefined, vaciasCuentanCero: boolean): Total {
  const ponderado = columnas.some(c => c.peso > 0);
  const usadas = ponderado ? columnas.filter(c => c.peso > 0) : columnas;
  let suma = 0, base = 0, contadas = 0, sinNota = 0;
  for (const c of usadas) {
    if (c.max <= 0) continue;
    const v = valorQueCuenta(c, n, vaciasCuentanCero);
    if (v === null) { if (n?.estados[c.id] !== 'exento') sinNota++; continue; }
    contadas++;
    if (ponderado) { suma += (v / c.max) * c.peso; base += c.peso; }
    else { suma += v; base += c.max; }
  }
  return { calificacion: base > 0 ? redondea((suma / base) * 10) : null, contadas, sinNota };
}

/** Columnas del CSV que importa iDoceo: "!" marca datos personales. Vacío queda vacío. */
export function csvIdoceo(columnas: Columna[], alumnos: { matricula: string; nombre: string }[], notas: Record<string, NotasAlumno>, vaciasCuentanCero: boolean): string {
  const campo = (v: unknown) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const filas = [['!Alumno', '!Matrícula', ...columnas.map(c => `${c.nombre} (/${c.max})`), 'Calificación']];
  for (const a of alumnos) {
    const n = notas[a.matricula];
    filas.push([a.nombre, a.matricula,
      ...columnas.map(c => { const v = valorQueCuenta(c, n, false); return v === null ? '' : String(v); }),
      String(calcularTotal(columnas, n, vaciasCuentanCero).calificacion ?? '')]);
  }
  return filas.map(f => f.map(campo).join(',')).join('\r\n') + '\r\n';
}

// ─── Asistencia ─────────────────────────────────────────────────────────────

/** P presente · R retardo · F falta · J falta justificada */
export type MarcaAsistencia = 'P' | 'R' | 'F' | 'J';
export interface Sesion { fecha: string; marcas: Record<string, MarcaAsistencia> }

export interface ResumenAsistencia { presentes: number; retardos: number; faltas: number; justificadas: number; sesiones: number; porcentaje: number | null }

/**
 * Asistencia de un alumno. El retardo cuenta como asistencia; la falta
 * justificada no cuenta ni a favor ni en contra. Una sesión donde no se le
 * marcó nada no cuenta (vacío no es falta).
 */
export function resumirAsistencia(sesiones: Sesion[], matricula: string): ResumenAsistencia {
  const r: ResumenAsistencia = { presentes: 0, retardos: 0, faltas: 0, justificadas: 0, sesiones: 0, porcentaje: null };
  for (const s of sesiones) {
    const m = s.marcas?.[matricula];
    if (!m) continue;
    r.sesiones++;
    if (m === 'P') r.presentes++; else if (m === 'R') r.retardos++; else if (m === 'F') r.faltas++; else r.justificadas++;
  }
  const base = r.presentes + r.retardos + r.faltas;
  r.porcentaje = base ? Math.round((100 * (r.presentes + r.retardos)) / base) : null;
  return r;
}

// ─── Ponderación por categorías (como iDoceo) ───────────────────────────────

export type Categoria = TipoColumna | 'asistencia';
export const CATEGORIAS: Record<Categoria, { nombre: string; color: string }> = {
  examen: { nombre: 'Exámenes', color: 'rose' },
  tarea: { nombre: 'Tareas', color: 'sky' },
  proyecto: { nombre: 'Proyectos', color: 'amber' },
  participacion: { nombre: 'Participación', color: 'emerald' },
  otro: { nombre: 'Otros', color: 'slate' },
  asistencia: { nombre: 'Asistencia', color: 'violet' },
};
export type Ponderacion = Partial<Record<Categoria, number>>;

export interface Promedio extends Total { porCategoria: Partial<Record<Categoria, number | null>> }

/**
 * Promedio final sobre 10. Sin ponderación, es el de siempre (calcularTotal).
 * Con ponderación: cada categoría saca su porcentaje (dentro de ella, cada
 * columna pesa su "peso" o 1) y el final es la media de las categorías según su
 * porcentaje. Una categoría sin ninguna nota todavía no cuenta: su peso se
 * reparte entre las demás, igual que en iDoceo.
 */
export function calcularPromedio(columnas: Columna[], n: NotasAlumno | undefined, vaciasCuentanCero: boolean, ponderacion?: Ponderacion, asistenciaPct: number | null = null): Promedio {
  const usadas = Object.entries(ponderacion ?? {}).filter(([, w]) => (w ?? 0) > 0) as [Categoria, number][];
  if (!usadas.length) return { ...calcularTotal(columnas, n, vaciasCuentanCero), porCategoria: {} };
  let suma = 0, base = 0, contadas = 0, sinNota = 0;
  const porCategoria: Promedio['porCategoria'] = {};
  for (const [cat, w] of usadas) {
    let pct: number | null = null;
    if (cat === 'asistencia') pct = asistenciaPct;
    else {
      let s = 0, b = 0;
      for (const c of columnas.filter(c => c.tipo === cat && c.max > 0)) {
        const v = valorQueCuenta(c, n, vaciasCuentanCero);
        if (v === null) { if (n?.estados[c.id] !== 'exento') sinNota++; continue; }
        const wc = c.peso > 0 ? c.peso : 1;
        s += (v / c.max) * 100 * wc; b += wc; contadas++;
      }
      pct = b ? s / b : null;
    }
    porCategoria[cat] = pct === null ? null : redondea(pct);
    if (pct !== null) { suma += pct * w; base += w; }
  }
  return { calificacion: base ? redondea(suma / base / 10) : null, contadas, sinNota, porCategoria };
}

/** Para descargar y abrir en Excel: nombre, clave, cada columna, asistencia y promedio. */
export function csvCuaderno(columnas: Columna[], alumnos: { matricula: string; nombre: string }[], notas: Record<string, NotasAlumno>,
  vaciasCuentanCero: boolean, ponderacion?: Ponderacion, sesiones: Sesion[] = []): string {
  const campo = (v: unknown) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const filas = [['Alumno', 'Matrícula o clave', ...columnas.map(c => `${c.nombre} (/${c.max})`), 'Asistencia %', 'Promedio']];
  for (const a of alumnos) {
    const n = notas[a.matricula];
    const asis = resumirAsistencia(sesiones, a.matricula).porcentaje;
    filas.push([a.nombre, a.matricula,
      ...columnas.map(c => { const e = n?.estados[c.id]; if (e === 'exento') return 'EX'; if (e === 'no-entregado') return '0'; const v = n?.valores[c.id]; return typeof v === 'number' ? String(v) : ''; }),
      asis === null ? '' : String(asis),
      String(calcularPromedio(columnas, n, vaciasCuentanCero, ponderacion, asis).calificacion ?? '')]);
  }
  return filas.map(f => f.map(campo).join(',')).join('\r\n') + '\r\n';
}

// ─── Exámenes ───────────────────────────────────────────────────────────────

export const TIPOS_PREGUNTA = {
  opcion: 'Opción múltiple (una correcta)',
  multiple: 'Varias correctas',
  vf: 'Verdadero o falso',
  completar: 'Completar el espacio',
  relacionar: 'Relacionar columnas',
  ordenar: 'Ordenar la secuencia',
  numerica: 'Respuesta numérica',
  abierta: 'Abierta (respuesta escrita)',
  justifica: 'Elige y justifica',
  error: 'Encuentra el error',
} as const;
export type TipoPregunta = keyof typeof TIPOS_PREGUNTA;

/** Lo que ve el alumno. NUNCA trae la respuesta. */
export interface Pregunta {
  id: string;
  tipo: TipoPregunta;
  texto: string;
  contexto?: string;          // caso o situación que comparten varias preguntas
  puntos: number;
  opciones?: string[];        // opcion, multiple, justifica, error (pasos)
  izquierda?: string[];       // relacionar
  derecha?: string[];         // relacionar (ya revueltas)
  elementos?: string[];       // ordenar (ya revueltos)
  unidad?: string;            // numerica
  extension?: 'corta' | 'larga'; // abierta
  pedirConfianza?: boolean;   // "¿qué tan seguro estás?" tras responder
}

/** Lo que solo ve el docente. */
export interface ClavePregunta {
  correcta?: number;          // opcion, justifica, error (índice del paso erróneo)
  correctas?: number[];       // multiple
  verdadero?: boolean;        // vf
  aceptadas?: string[];       // completar
  pares?: number[];           // relacionar: pares[i] = índice en derecha de izquierda[i]
  orden?: number[];           // ordenar: índices de elementos en el orden correcto
  valor?: number; tolerancia?: number; // numerica
  criterio?: string;          // abierta, justifica, error: qué debe contener una buena respuesta
}

export type Respuesta =
  | number | number[] | boolean | string
  | { opcion?: number; texto?: string }   // justifica / error
  | Record<string, number>;               // relacionar: { "0": 2, "1": 0 }

export interface RespuestaAlumno { valor?: Respuesta; confianza?: 1 | 2 | 3 }

const normalizar = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** ¿Esta pregunta necesita juicio humano (o propuesta de IA)? */
export const requiereRevision = (p: Pregunta) => p.tipo === 'abierta' || p.tipo === 'justifica' || p.tipo === 'error';

/**
 * Califica una pregunta cerrada. Devuelve los puntos, o null si necesita revisión
 * (abiertas) o si no se contestó (sin respuesta NO es cero automático: el docente
 * decide al cerrar). Para "justifica" y "error" la parte cerrada vale la mitad y
 * la explicación la otra mitad, que se revisa.
 */
export function calificarCerrada(p: Pregunta, c: ClavePregunta, r: RespuestaAlumno | undefined): number | null {
  const v = r?.valor;
  if (v === undefined || v === null || v === '') return null;
  switch (p.tipo) {
    case 'opcion': return v === c.correcta ? p.puntos : 0;
    case 'vf': return v === c.verdadero ? p.puntos : 0;
    case 'multiple': {
      // Crédito parcial: aciertos menos errores, nunca negativo.
      const elegidas = new Set(Array.isArray(v) ? v as number[] : []);
      const buenas = new Set(c.correctas ?? []);
      if (!buenas.size) return 0;
      let a = 0, e = 0;
      elegidas.forEach(i => (buenas.has(i) ? a++ : e++));
      return redondea(Math.max(0, (a - e) / buenas.size) * p.puntos, 2);
    }
    case 'completar': return (c.aceptadas ?? []).some(x => normalizar(x) === normalizar(v)) ? p.puntos : 0;
    case 'numerica': {
      const n = Number(String(v).replace(',', '.'));
      if (!Number.isFinite(n) || c.valor === undefined) return 0;
      return Math.abs(n - c.valor) <= (c.tolerancia ?? 0) ? p.puntos : 0;
    }
    case 'relacionar': {
      const m = (v && typeof v === 'object' && !Array.isArray(v)) ? v as Record<string, number> : {};
      const total = c.pares?.length ?? 0;
      if (!total) return 0;
      const bien = (c.pares ?? []).filter((d, i) => m[String(i)] === d).length;
      return redondea((bien / total) * p.puntos, 2);
    }
    case 'ordenar': {
      const o = Array.isArray(v) ? v as number[] : [];
      const total = c.orden?.length ?? 0;
      if (!total) return 0;
      const bien = (c.orden ?? []).filter((x, i) => o[i] === x).length;
      return redondea((bien / total) * p.puntos, 2);
    }
    case 'justifica':
    case 'error': {
      const opcion = (v && typeof v === 'object' && 'opcion' in v) ? (v as any).opcion : undefined;
      return opcion === c.correcta ? redondea(p.puntos / 2, 2) : 0;
    }
    default: return null; // abierta
  }
}

export interface ResultadoExamen {
  automaticos: number;          // puntos ya calificados solos
  maximo: number;
  pendientes: string[];         // ids que esperan revisión docente
  sinResponder: string[];
  segurosEquivocados: string[]; // marcó "muy seguro" y se equivocó: idea errónea a atender
}

/** Califica todo lo cerrado de un intento y señala lo que falta revisar. */
export function calificarIntento(preguntas: Pregunta[], clave: Record<string, ClavePregunta>, resp: Record<string, RespuestaAlumno>, revisados: Record<string, number> = {}): ResultadoExamen {
  const r: ResultadoExamen = { automaticos: 0, maximo: 0, pendientes: [], sinResponder: [], segurosEquivocados: [] };
  for (const p of preguntas) {
    r.maximo += p.puntos;
    const ra = resp[p.id];
    const cerrada = calificarCerrada(p, clave[p.id] ?? {}, ra);
    if (ra?.valor === undefined || ra.valor === '' ) { r.sinResponder.push(p.id); }
    if (requiereRevision(p)) {
      if (revisados[p.id] !== undefined) r.automaticos += revisados[p.id];
      else if (ra?.valor !== undefined) { r.pendientes.push(p.id); r.automaticos += cerrada ?? 0; }
    } else if (cerrada !== null) {
      r.automaticos += cerrada;
      if (ra?.confianza === 3 && cerrada < p.puntos) r.segurosEquivocados.push(p.id);
    }
  }
  r.automaticos = redondea(r.automaticos, 2);
  return r;
}

/** Nota sobre el máximo de la columna del cuaderno. */
export const notaSobre = (puntos: number, maximo: number, max: number) => maximo > 0 ? redondea((puntos / maximo) * max, 1) : 0;

/** Valida lo que devuelve la IA antes de guardarlo: tipos conocidos, claves coherentes. */
export function validarExamenGenerado(x: any): { preguntas: Pregunta[]; clave: Record<string, ClavePregunta>; problemas: string[] } {
  const problemas: string[] = [];
  const preguntas: Pregunta[] = [];
  const clave: Record<string, ClavePregunta> = {};
  const lista = Array.isArray(x?.preguntas) ? x.preguntas : [];
  lista.forEach((q: any, i: number) => {
    const tipo = q?.tipo as TipoPregunta;
    if (!(tipo in TIPOS_PREGUNTA) || !String(q?.texto ?? '').trim()) { problemas.push(`Pregunta ${i + 1}: tipo o texto inválido, se descartó.`); return; }
    const p: Pregunta = { id: '', tipo, texto: String(q.texto).trim(), puntos: Number(q.puntos) > 0 ? Number(q.puntos) : 1 };
    if (q.contexto) p.contexto = String(q.contexto);
    if (q.pedirConfianza) p.pedirConfianza = true;
    const c: ClavePregunta = {};
    const k = q.clave ?? {};
    const opciones = Array.isArray(q.opciones) ? q.opciones.map(String) : [];
    if (['opcion', 'multiple', 'justifica', 'error'].includes(tipo)) {
      if (opciones.length < 2) { problemas.push(`Pregunta ${i + 1}: faltan opciones, se descartó.`); return; }
      p.opciones = opciones;
    }
    if (tipo === 'opcion' || tipo === 'justifica' || tipo === 'error') {
      if (!(Number.isInteger(k.correcta) && k.correcta >= 0 && k.correcta < opciones.length)) { problemas.push(`Pregunta ${i + 1}: la respuesta correcta no corresponde a una opción, se descartó.`); return; }
      c.correcta = k.correcta;
    }
    if (tipo === 'multiple') {
      const cs = (Array.isArray(k.correctas) ? k.correctas : []).filter((n: any) => Number.isInteger(n) && n >= 0 && n < opciones.length);
      if (!cs.length) { problemas.push(`Pregunta ${i + 1}: sin respuestas correctas válidas, se descartó.`); return; }
      c.correctas = cs;
    }
    if (tipo === 'vf') { if (typeof k.verdadero !== 'boolean') { problemas.push(`Pregunta ${i + 1}: falta si es verdadero o falso, se descartó.`); return; } c.verdadero = k.verdadero; }
    if (tipo === 'completar') { const a = (Array.isArray(k.aceptadas) ? k.aceptadas : []).map(String).filter(Boolean); if (!a.length) { problemas.push(`Pregunta ${i + 1}: sin respuestas aceptadas, se descartó.`); return; } c.aceptadas = a; }
    if (tipo === 'numerica') { if (!Number.isFinite(Number(k.valor))) { problemas.push(`Pregunta ${i + 1}: sin valor numérico, se descartó.`); return; } c.valor = Number(k.valor); c.tolerancia = Math.abs(Number(k.tolerancia) || 0); if (q.unidad) p.unidad = String(q.unidad); }
    if (tipo === 'relacionar') {
      const izq = (q.izquierda ?? []).map(String), der = (q.derecha ?? []).map(String);
      const pares = Array.isArray(k.pares) ? k.pares : [];
      if (izq.length < 2 || der.length < izq.length || pares.length !== izq.length || pares.some((n: any) => !(Number.isInteger(n) && n >= 0 && n < der.length))) { problemas.push(`Pregunta ${i + 1}: columnas o pares incoherentes, se descartó.`); return; }
      p.izquierda = izq; p.derecha = der; c.pares = pares;
    }
    if (tipo === 'ordenar') {
      const el = (q.elementos ?? []).map(String);
      const orden = Array.isArray(k.orden) ? k.orden : [];
      if (el.length < 3 || orden.length !== el.length || new Set(orden).size !== el.length || orden.some((n: any) => !(Number.isInteger(n) && n >= 0 && n < el.length))) { problemas.push(`Pregunta ${i + 1}: secuencia incoherente, se descartó.`); return; }
      p.elementos = el; c.orden = orden;
    }
    if (tipo === 'abierta') p.extension = q.extension === 'larga' ? 'larga' : 'corta';
    if (requiereRevision(p)) {
      if (!String(k.criterio ?? '').trim()) { problemas.push(`Pregunta ${i + 1}: falta el criterio para revisarla, se descartó.`); return; }
      c.criterio = String(k.criterio).trim();
    }
    // Se numera al final: si la IA mandó una inválida, no quedan huecos.
    p.id = `p${preguntas.length + 1}`;
    preguntas.push(p); clave[p.id] = c;
  });
  if (!preguntas.length) problemas.push('No quedó ninguna pregunta válida.');
  return { preguntas, clave, problemas };
}
