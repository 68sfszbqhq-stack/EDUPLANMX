/**
 * Documentos administrativos que salen de lo que el docente ya registró en su
 * clase: nada se vuelve a capturar. Salen en Word (editable) para que cada
 * docente los ajuste al formato de su plantel si se lo piden distinto.
 *
 * Regla de oro: el documento solo dice lo que está registrado. Lo que no hay se
 * deja en blanco o se dice "sin registro"; nunca se inventa una evidencia.
 *
 * Sin navegador ni Firebase: recibe datos y devuelve un Document de `docx`, así
 * se prueba en la terminal.
 */
import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle,
  ShadingType, PageOrientation, TableLayoutType, VerticalAlign,
} from 'docx';

export interface DatosEncabezado {
  escuela: string;
  cct: string;
  docente: string;
  asignatura: string;
  grupo: string;
  ciclo: string;
  /** "Parcial 1 (24/08 – 02/10)" o "Semestre completo" */
  periodo: string;
  /** AAAA-MM-DD */
  fecha: string;
}

const GUINDA = '6D0000';
const GRIS = 'EDE3E3';
const LETRA = 'Arial';
const T = 18; // 9 pt
const ANCHO = 13680; // carta horizontal con márgenes de 1.27 cm
const linea = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const bordes = { top: linea, bottom: linea, left: linea, right: linea };
const nada = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

const texto = (t: string, o: { bold?: boolean; size?: number; color?: string; italics?: boolean } = {}) =>
  new TextRun({ text: t, font: LETRA, size: o.size ?? T, bold: o.bold, color: o.color, italics: o.italics });

function p(t: string | TextRun[], o: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; bold?: boolean; size?: number; despues?: number } = {}) {
  return new Paragraph({ alignment: o.align, spacing: { after: o.despues ?? 60 }, children: typeof t === 'string' ? [texto(t, o)] : t });
}

function celda(contenido: string | string[], ancho: number, o: { fondo?: string; bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; color?: string } = {}) {
  const lineas = Array.isArray(contenido) ? contenido : [contenido];
  return new TableCell({
    borders: bordes, width: { size: ancho, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: o.fondo ? { fill: o.fondo, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 40, bottom: 40, left: 70, right: 70 },
    children: (lineas.length ? lineas : ['']).map(l => new Paragraph({ alignment: o.align, children: [texto(l, { bold: o.bold, color: o.color })] })),
  });
}

function tabla(anchos: number[], filas: (string | string[])[][], o: { encabezado?: boolean; centrar?: number[] } = {}) {
  return new Table({
    width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: anchos, layout: TableLayoutType.FIXED,
    rows: filas.map((f, i) => new TableRow({
      tableHeader: o.encabezado && i === 0,
      children: f.map((c, k) => celda(c, anchos[k], {
        fondo: o.encabezado && i === 0 ? GRIS : undefined, bold: o.encabezado && i === 0,
        align: (o.encabezado && i === 0) || o.centrar?.includes(k) ? AlignmentType.CENTER : undefined,
      })),
    })),
  });
}

/** Reparte un ancho total en proporciones. */
const reparte = (props: number[], total = ANCHO) => { const s = props.reduce((a, b) => a + b, 0); const xs = props.map(x => Math.floor((x / s) * total)); xs[0] += total - xs.reduce((a, b) => a + b, 0); return xs; };

function encabezado(titulo: string, d: DatosEncabezado): (Paragraph | Table)[] {
  const barra = new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: [ANCHO], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [new TableCell({
      borders: bordes, width: { size: ANCHO, type: WidthType.DXA }, shading: { fill: GUINDA, type: ShadingType.CLEAR, color: 'auto' },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [texto(titulo.toUpperCase(), { bold: true, color: 'FFFFFF', size: 24 })] })],
    })] })],
  });
  const w = reparte([3, 1.3, 2.2, 1.6]);
  return [
    p(d.escuela || 'Escuela: ____________________', { align: AlignmentType.CENTER, bold: true, size: 22, despues: 20 }),
    p(d.cct ? `CCT ${d.cct}` : '', { align: AlignmentType.CENTER, despues: 120 }),
    barra,
    tabla(w, [
      [`Docente: ${d.docente}`, `Grupo: ${d.grupo}`, `Asignatura: ${d.asignatura}`, `Ciclo: ${d.ciclo}`],
      [`Periodo: ${d.periodo}`, '', '', `Fecha: ${fechaLarga(d.fecha)}`],
    ]),
    p('', { despues: 80 }),
  ];
}

function firmas(d: DatosEncabezado): Table {
  const w = reparte([1, 0.3, 1]);
  const sinBordes = { top: nada, bottom: nada, left: nada, right: nada };
  const firma = (nombre: string, cargo: string, ancho: number) => new TableCell({
    borders: { ...sinBordes, top: linea }, width: { size: ancho, type: WidthType.DXA },
    children: [p(nombre, { align: AlignmentType.CENTER, despues: 0 }), p(cargo, { align: AlignmentType.CENTER })],
  });
  return new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [
      firma(d.docente, 'Docente', w[0]),
      new TableCell({ borders: sinBordes, width: { size: w[1], type: WidthType.DXA }, children: [p('')] }),
      firma('', 'Vo. Bo. Dirección / Coordinación académica', w[2]),
    ] })],
  });
}

function documento(hijos: (Paragraph | Table)[], d: DatosEncabezado): Document {
  return new Document({
    creator: d.docente, title: hijos.length ? 'EduPlan' : '',
    styles: { default: { document: { run: { font: LETRA, size: T } } } },
    sections: [{
      properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 12240, height: 15840 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children: [...hijos, p('', { despues: 600 }), firmas(d)],
    }],
  });
}

export function fechaLarga(f: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return f;
  return new Date(`${f}T12:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}
const num = (x: number | null | undefined, sufijo = '') => (x === null || x === undefined ? '—' : `${x}${sufijo}`);

// ─── 1. Reporte de evaluación ────────────────────────────────────────────────

export interface FilaReporte {
  nombre: string;
  matricula: string;
  /** una por parcial; si no hay parciales, una sola */
  calificaciones: (number | null)[];
  final: number | null;
  asistencia: number | null;
  faltas: number;
  observaciones: string;
}

export function reporteEvaluacion(d: DatosEncabezado, columnas: string[], filas: FilaReporte[], resumen: { promedio: number | null; aprobados: number; reprobados: number; sinCalificar: number; asistencia: number | null }): Document {
  const cab = ['No.', 'Alumno', 'Matrícula o clave', ...columnas, 'Final', 'Asist.', 'Faltas', 'Observaciones'];
  const w = reparte([0.4, 3, 1.2, ...columnas.map(() => 0.8), 0.8, 0.7, 0.6, 3.2]);
  const centrar = [0, 2, ...columnas.map((_, i) => 3 + i), 3 + columnas.length, 4 + columnas.length, 5 + columnas.length];
  return documento([
    ...encabezado('Reporte de evaluación', d),
    tabla(w, [cab, ...filas.map((f, i) => [String(i + 1), f.nombre, f.matricula, ...f.calificaciones.map(c => num(c)), num(f.final), num(f.asistencia, '%'), String(f.faltas), f.observaciones])], { encabezado: true, centrar }),
    p('', { despues: 120 }),
    p([texto('Resumen del grupo: ', { bold: true }), texto(
      `promedio ${num(resumen.promedio)} · aprobados ${resumen.aprobados} · reprobados ${resumen.reprobados}` +
      `${resumen.sinCalificar ? ` · sin calificación aún ${resumen.sinCalificar}` : ''} · asistencia promedio ${num(resumen.asistencia, '%')}.`)]),
    p('Calificación en escala de 0 a 10; aprobatoria 6. "—" indica que no hay registro: no equivale a cero.', { size: 16 }),
  ], d);
}

// ─── 2. Seguimiento de alumnos en riesgo ────────────────────────────────────

export interface FilaRiesgo {
  nombre: string;
  matricula: string;
  motivos: string[];
  /** anotaciones "a atender" */
  observaciones: { fecha: string; texto: string }[];
  /** anotaciones "acción de apoyo": lo que hizo el docente */
  acciones: { fecha: string; texto: string }[];
}

export function seguimientoRiesgo(d: DatosEncabezado, filas: FilaRiesgo[]): Document {
  const w = reparte([0.4, 2.4, 2.4, 3.2, 3.6]);
  const lista = (xs: { fecha: string; texto: string }[], vacio: string) => xs.length ? xs.map(x => `${x.fecha.slice(8, 10)}/${x.fecha.slice(5, 7)}: ${x.texto}`) : [vacio];
  return documento([
    ...encabezado('Seguimiento de alumnos en riesgo académico', d),
    filas.length
      ? tabla(w, [['No.', 'Alumno', 'Señales (de los registros del docente)', 'Observaciones', 'Acciones de apoyo realizadas'],
          ...filas.map((f, i) => [String(i + 1), [f.nombre, f.matricula], f.motivos, lista(f.observaciones, 'Sin registro'), lista(f.acciones, 'Sin acciones registradas')])], { encabezado: true, centrar: [0] })
      : p('Con los registros actuales, ningún alumno presenta señales de riesgo (promedio menor a 6, asistencia menor a 80 % o dos o más actividades sin entregar).'),
    p('', { despues: 120 }),
    p('Criterios: promedio menor a 6, asistencia menor a 80 % (con al menos 3 sesiones registradas) o dos o más actividades sin entregar. Las acciones son las que el docente registró en la ficha de cada alumno.', { size: 16 }),
  ], d);
}

// ─── 3. Registro de clases impartidas ───────────────────────────────────────

export interface FilaClase { fecha: string; descripcion: string; asistencia: string; actividades: string[] }

export function registroClases(d: DatosEncabezado, filas: FilaClase[]): Document {
  const w = reparte([1.2, 6.5, 1.4, 2.6]);
  return documento([
    ...encabezado('Registro de clases impartidas', d),
    filas.length
      ? tabla(w, [['Fecha', 'Lo que se trabajó en clase (diario del docente)', 'Asistencia', 'Actividades evaluadas'],
          ...filas.map(f => [fechaLarga(f.fecha), f.descripcion.split('\n').filter(Boolean), f.asistencia || 'Sin registro', f.actividades.length ? f.actividades : ['—']])], { encabezado: true, centrar: [2] })
      : p('No hay clases registradas en este periodo.'),
    p('', { despues: 120 }),
    p(`Total: ${filas.length} ${filas.length === 1 ? 'sesión registrada' : 'sesiones registradas'}.`, { bold: true }),
  ], d);
}

// ─── 4. Diagnóstico del grupo ───────────────────────────────────────────────

export function diagnosticoGrupo(d: DatosEncabezado, secciones: { titulo: string; lineas: string[] }[]): Document {
  const hijos: (Paragraph | Table)[] = [...encabezado('Diagnóstico del grupo', d)];
  for (const s of secciones) {
    hijos.push(p(s.titulo, { bold: true, size: 20, despues: 60 }));
    for (const l of (s.lineas.length ? s.lineas : ['Sin registro.'])) hijos.push(p(l.replace(/^- /, '• ')));
    hijos.push(p('', { despues: 60 }));
  }
  hijos.push(p('Elaborado con los registros del docente (cuaderno, asistencia, diario de clase) y los diagnósticos que los alumnos contestaron en Antología. Quien no contestó es dato faltante, no bajo desempeño.', { size: 16 }));
  return documento(hijos, d);
}
