/**
 * La clase completa en un vistazo — lógica pura, sin Firebase.
 * Junta lo que el docente fue registrando (cuaderno, asistencia, diario) con lo
 * que llegó solo (exámenes, Antología) para llevarlo a la próxima planeación.
 */
import type { AlumnoLista, Grupo, ResumenInstrumento } from '../grupos/model';
import { textoParaPlaneacion } from '../grupos/model';
import { CATEGORIAS, Categoria, Columna, NotasAlumno, Ponderacion, Sesion, calcularPromedio, redondea, resumirAsistencia } from '../evaluacion/modelo';
export type { Sesion };

export interface EstadisticaClase {
  alumnos: number;
  conPromedio: number;
  promedioGrupo: number | null;
  /** alumnos con promedio menor a 6 */
  enRiesgo: { matricula: string; nombre: string; promedio: number }[];
  asistenciaGrupo: number | null;
  /** categorías del grupo de la más baja a la más alta (porcentaje medio) */
  categorias: { categoria: Categoria; promedio: number }[];
  /** actividades donde más de un tercio no entregó */
  sinEntregar: { columna: string; faltan: number }[];
}

export function estadisticaClase(alumnos: AlumnoLista[], columnas: Columna[], notas: Record<string, NotasAlumno>, sesiones: Sesion[], vaciasCero: boolean, ponderacion?: Ponderacion): EstadisticaClase {
  const activos = alumnos.filter(a => a.estado === 'activo');
  const proms: number[] = [], asis: number[] = [];
  const enRiesgo: EstadisticaClase['enRiesgo'] = [];
  const porCat = new Map<Categoria, number[]>();
  for (const a of activos) {
    const pa = resumirAsistencia(sesiones, a.matricula).porcentaje;
    if (pa !== null) asis.push(pa);
    const p = calcularPromedio(columnas, notas[a.matricula], vaciasCero, ponderacion, pa);
    if (p.calificacion !== null) { proms.push(p.calificacion); if (p.calificacion < 6) enRiesgo.push({ matricula: a.matricula, nombre: a.nombre, promedio: p.calificacion }); }
    // Porcentaje por categoría aunque el grupo no use ponderación: sirve para el diagnóstico.
    const todas = Object.fromEntries((Object.keys(CATEGORIAS) as Categoria[]).filter(c => c !== 'asistencia').map(c => [c, 1])) as Ponderacion;
    for (const [c, v] of Object.entries(calcularPromedio(columnas, notas[a.matricula], false, todas).porCategoria)) {
      if (typeof v === 'number') porCat.set(c as Categoria, [...(porCat.get(c as Categoria) ?? []), v]);
    }
  }
  const media = (xs: number[]) => xs.length ? redondea(xs.reduce((s, x) => s + x, 0) / xs.length) : null;
  const sinEntregar = columnas.map(c => ({ columna: c.nombre, faltan: activos.filter(a => notas[a.matricula]?.estados[c.id] === 'no-entregado').length }))
    .filter(x => activos.length && x.faltan / activos.length > 1 / 3);
  return {
    alumnos: activos.length,
    conPromedio: proms.length,
    promedioGrupo: media(proms),
    enRiesgo: enRiesgo.sort((a, b) => a.promedio - b.promedio),
    asistenciaGrupo: asis.length ? Math.round(media(asis)!) : null,
    categorias: [...porCat].map(([categoria, xs]) => ({ categoria, promedio: Math.round(media(xs)!) })).sort((a, b) => a.promedio - b.promedio),
    sinEntregar,
  };
}

/**
 * Texto editable para el diagnóstico de la próxima planeación. Nunca lleva
 * nombres de alumnos: la planeación es un documento que se entrega.
 */
export function textoClaseParaPlaneacion(grupo: Pick<Grupo, 'nombre' | 'asignaturaNombre'>, e: EstadisticaClase, diario: { fecha: string; texto: string }[], antologia: ResumenInstrumento[]): string {
  const l: string[] = [`Situación actual del grupo ${grupo.nombre} (${grupo.asignaturaNombre}), según el cuaderno del docente.`];
  if (e.promedioGrupo !== null) {
    l.push(`- Promedio del grupo: ${e.promedioGrupo} (${e.conPromedio} de ${e.alumnos} alumnos ya tienen calificación).` +
      (e.enRiesgo.length ? ` ${e.enRiesgo.length} alumno(s) por debajo de 6.` : ''));
  }
  if (e.categorias.length) l.push(`- Desempeño por tipo de actividad: ${e.categorias.map(c => `${CATEGORIAS[c.categoria].nombre.toLowerCase()} ${c.promedio}%`).join(', ')}.`);
  if (e.sinEntregar.length) l.push(`- Actividades que más de un tercio no entregó: ${e.sinEntregar.map(s => `${s.columna} (${s.faltan})`).join(', ')}.`);
  if (e.asistenciaGrupo !== null) l.push(`- Asistencia promedio: ${e.asistenciaGrupo}%.`);
  const recientes = diario.slice(0, 3);
  if (recientes.length) {
    l.push('Lo que pasó en las últimas clases (diario del docente):');
    for (const d of recientes) l.push(`- ${d.fecha}: ${d.texto.replace(/\s+/g, ' ').trim().slice(0, 500)}`);
  }
  const ant = textoParaPlaneacion(grupo, antologia);
  if (ant) l.push(ant);
  return l.length > 1 ? l.join('\n') : '';
}

// ─── Parciales ───────────────────────────────────────────────────────────────

/** Un periodo de evaluación. Todo lo que tiene fecha (actividades, lista, diario) cae solo en el suyo. */
export interface Parcial { nombre: string; inicio: string; fin: string }

/** Índice del parcial al que pertenece una fecha AAAA-MM-DD, o -1 si no cae en ninguno. */
export function parcialDe(fecha: string, parciales: Parcial[] = []): number {
  return parciales.findIndex(p => p.inicio && p.fin && fecha >= p.inicio && fecha <= p.fin);
}

export function enParcial<T extends { fecha: string }>(xs: T[], parciales: Parcial[] | undefined, i: number | null): T[] {
  if (i === null || !parciales?.length) return xs;
  return xs.filter(x => parcialDe(x.fecha, parciales) === i);
}

export interface CalificacionParciales {
  /** calificación de cada parcial, null si aún no tiene notas */
  porParcial: (number | null)[];
  /** asistencia % de cada parcial */
  asistencia: (number | null)[];
  /** promedio de los parciales que ya tienen calificación (o del semestre completo si no hay parciales) */
  final: number | null;
}

/**
 * Calificación por parcial y final. La final es el promedio de los parciales
 * calificados, como se reporta en bachillerato. Sin parciales configurados, es
 * el promedio de todo lo registrado.
 */
export function calificarParciales(columnas: Columna[], n: NotasAlumno | undefined, sesiones: Sesion[], matricula: string,
  vaciasCero: boolean, ponderacion: Ponderacion | undefined, parciales: Parcial[] = []): CalificacionParciales {
  if (!parciales.length) {
    const asis = resumirAsistencia(sesiones, matricula).porcentaje;
    return { porParcial: [], asistencia: [], final: calcularPromedio(columnas, n, vaciasCero, ponderacion, asis).calificacion };
  }
  const porParcial: (number | null)[] = [], asistencia: (number | null)[] = [];
  parciales.forEach((_, i) => {
    const asis = resumirAsistencia(enParcial(sesiones, parciales, i), matricula).porcentaje;
    asistencia.push(asis);
    porParcial.push(calcularPromedio(enParcial(columnas, parciales, i), n, vaciasCero, ponderacion, asis).calificacion);
  });
  const ya = porParcial.filter((x): x is number => x !== null);
  return { porParcial, asistencia, final: ya.length ? redondea(ya.reduce((s, x) => s + x, 0) / ya.length) : null };
}

// ─── Alerta temprana ─────────────────────────────────────────────────────────

export interface Riesgo { matricula: string; nombre: string; motivos: string[] }

/**
 * Señales de que un alumno necesita atención, con los mismos datos que el
 * docente ya registró. No es un diagnóstico: es para no tener que buscarlo a mano.
 */
export function detectarRiesgo(a: Pick<AlumnoLista, 'matricula' | 'nombre'>, columnas: Columna[], n: NotasAlumno | undefined, sesiones: Sesion[],
  vaciasCero: boolean, ponderacion?: Ponderacion): Riesgo | null {
  const motivos: string[] = [];
  const asis = resumirAsistencia(sesiones, a.matricula);
  const p = calcularPromedio(columnas, n, vaciasCero, ponderacion, asis.porcentaje);
  if (p.calificacion !== null && p.calificacion < 6) motivos.push(`promedio ${p.calificacion}`);
  if (asis.porcentaje !== null && asis.sesiones >= 3 && asis.porcentaje < 80) motivos.push(`asistencia ${asis.porcentaje}% (${asis.faltas} faltas)`);
  const sinEntregar = columnas.filter(c => n?.estados[c.id] === 'no-entregado').length;
  if (sinEntregar >= 2) motivos.push(`${sinEntregar} actividades sin entregar`);
  return motivos.length ? { matricula: a.matricula, nombre: a.nombre, motivos } : null;
}
