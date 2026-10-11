/**
 * Pruebas de la clase integrada: ponderación por categorías, asistencia,
 * lectura de Excel y resumen para la planeación (sin red). Datos sintéticos.
 *   npm run test:clase
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { calcularPromedio, csvCuaderno, resumirAsistencia, type Columna, type NotasAlumno, type Sesion } from '../src/features/evaluacion/modelo';
import { leerExcel } from '../src/features/clase/excel';
import { estadisticaClase, textoClaseParaPlaneacion } from '../src/features/clase/modelo';
import { leerLista, type AlumnoLista } from '../src/features/grupos/model';

const col = (id: string, tipo: Columna['tipo'], max = 10, peso = 0): Columna =>
  ({ id, nombre: id, tipo, max, peso, fecha: '2026-10-10', orden: 0, rubrica: null, examenId: '' });
const notas = (valores: Record<string, number>, estados: NotasAlumno['estados'] = {}): NotasAlumno =>
  ({ matricula: '1', valores, estados, comentarios: {}, rubricas: {} });

// ─── Ponderación ─────────────────────────────────────────────────────────────
test('sin ponderación el promedio es el de siempre', () => {
  const p = calcularPromedio([col('a', 'tarea'), col('b', 'examen', 20)], notas({ a: 8, b: 10 }), false);
  assert.equal(p.calificacion, 6); // 18/30
});

test('con ponderación: cada categoría promedia y luego pesa', () => {
  const cols = [col('t1', 'tarea'), col('t2', 'tarea'), col('e1', 'examen')];
  // tareas: (10 + 6)/2 = 80 % · examen: 50 % → 0.6·80 + 0.4·50 = 68 → 6.8
  const p = calcularPromedio(cols, notas({ t1: 10, t2: 6, e1: 5 }), false, { tarea: 60, examen: 40 });
  assert.equal(p.calificacion, 6.8);
  assert.deepEqual(p.porCategoria, { tarea: 80, examen: 50 });
});

test('una categoría sin notas todavía no cuenta: su peso se reparte', () => {
  const p = calcularPromedio([col('t1', 'tarea'), col('e1', 'examen')], notas({ t1: 9 }), false, { tarea: 60, examen: 40 });
  assert.equal(p.calificacion, 9);
  assert.equal(p.porCategoria.examen, null);
});

test('dentro de una categoría, "vale doble" pesa el doble', () => {
  const p = calcularPromedio([col('a', 'proyecto', 10), col('b', 'proyecto', 10, 2)], notas({ a: 10, b: 4 }), false, { proyecto: 100 });
  assert.equal(p.calificacion, 6); // (100·1 + 40·2)/3 = 60
});

test('la asistencia puede pesar en el promedio', () => {
  const p = calcularPromedio([col('e', 'examen')], notas({ e: 10 }), false, { examen: 90, asistencia: 10 }, 50);
  assert.equal(p.calificacion, 9.5);
});

test('"no entregó" es cero y "exento" no cuenta, también con ponderación', () => {
  const cols = [col('t1', 'tarea'), col('t2', 'tarea'), col('t3', 'tarea')];
  const p = calcularPromedio(cols, notas({ t1: 10 }, { t2: 'no-entregado', t3: 'exento' }), false, { tarea: 100 });
  assert.equal(p.calificacion, 5);
});

// ─── Asistencia ──────────────────────────────────────────────────────────────
test('asistencia: retardo cuenta, justificada no, sin marcar no es falta', () => {
  const s: Sesion[] = [
    { fecha: '2026-10-01', marcas: { a: 'P' } }, { fecha: '2026-10-02', marcas: { a: 'R' } },
    { fecha: '2026-10-03', marcas: { a: 'F' } }, { fecha: '2026-10-04', marcas: { a: 'J' } },
    { fecha: '2026-10-05', marcas: { b: 'P' } },
  ];
  const r = resumirAsistencia(s, 'a');
  assert.equal(r.sesiones, 4);
  assert.equal(r.porcentaje, 67); // 2 de 3
  assert.equal(resumirAsistencia(s, 'z').porcentaje, null);
});

// ─── Excel ───────────────────────────────────────────────────────────────────
async function xlsxDePrueba(filas: string[][]): Promise<Uint8Array> {
  const z = new JSZip();
  const cadenas: string[] = [];
  const idx = (t: string) => { let i = cadenas.indexOf(t); if (i < 0) { cadenas.push(t); i = cadenas.length - 1; } return i; };
  const col = (k: number) => String.fromCharCode(65 + k);
  const sheet = filas.map((f, r) => `<row r="${r + 1}">${f.map((v, k) => v === '' ? '' : /^\d+$/.test(v)
    ? `<c r="${col(k)}${r + 1}"><v>${v}</v></c>` : `<c r="${col(k)}${r + 1}" t="s"><v>${idx(v)}</v></c>`).join('')}</row>`).join('');
  z.file('xl/workbook.xml', '<workbook xmlns:r="x"><sheets><sheet name="Lista" sheetId="1" r:id="rId1"/></sheets></workbook>');
  z.file('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="rId1" Target="worksheets/hoja.xml"/></Relationships>');
  z.file('xl/worksheets/hoja.xml', `<worksheet><sheetData>${sheet}</sheetData></worksheet>`);
  z.file('xl/sharedStrings.xml', `<sst>${cadenas.map(c => `<si><t>${c.replace(/&/g, '&amp;')}</t></si>`).join('')}</sst>`);
  return z.generateAsync({ type: 'uint8array' });
}

test('lee un .xlsx (con celdas vacías y hoja con otro nombre) como si se hubiera pegado', async () => {
  const datos = await xlsxDePrueba([['Lista 1º A', ''], ['No.', 'Nombre'], ['1', 'Pérez López Ana'], ['2', ''], ['3', 'Ruiz & Gómez Beto']]);
  const texto = await leerExcel(datos);
  const { filas } = leerLista(texto);
  assert.deepEqual(filas.map(f => f.nombre), ['Pérez López Ana', 'Ruiz & Gómez Beto']);
});

// ─── Exportar y llevar a la planeación ───────────────────────────────────────
const al = (matricula: string, nombre: string): AlumnoLista => ({ matricula, nombre, estado: 'activo', cuentaUid: '', cuentaCorreo: '' });

test('el Excel exportado trae asistencia, EX y vacío donde no hay nota', () => {
  const csv = csvCuaderno([col('t1', 'tarea'), col('t2', 'tarea')], [al('a', 'Ana')], { a: { ...notas({ t1: 9 }, { t2: 'exento' }), matricula: 'a' } }, false, undefined,
    [{ fecha: '2026-10-01', marcas: { a: 'P' } }]);
  assert.equal(csv.split('\r\n')[1], 'Ana,a,9,EX,100,9');
});

test('el resumen para la planeación no lleva nombres y sí lo que pasó en clase', () => {
  const alumnos = [al('a', 'Ana Pérez'), al('b', 'Beto Ruiz'), al('c', 'Carla Díaz')];
  const cols = [col('t1', 'tarea'), col('e1', 'examen')];
  const ns: Record<string, NotasAlumno> = {
    a: { ...notas({ t1: 10, e1: 9 }), matricula: 'a' },
    b: { ...notas({ e1: 4 }, { t1: 'no-entregado' }), matricula: 'b' },
    c: { ...notas({ e1: 5 }, { t1: 'no-entregado' }), matricula: 'c' },
  };
  const e = estadisticaClase(alumnos, cols, ns, [{ fecha: '2026-10-01', marcas: { a: 'P', b: 'F', c: 'P' } }], false);
  assert.equal(e.enRiesgo.length, 2);
  assert.deepEqual(e.sinEntregar, [{ columna: 't1', faltan: 2 }]);
  const t = textoClaseParaPlaneacion({ nombre: '1º A', asignaturaNombre: 'Cultura Digital I' }, e,
    [{ fecha: '2026-10-09', texto: 'Vimos licencias; confunden gratis con libre.' }], []);
  assert.match(t, /2 alumno\(s\) por debajo de 6/);
  assert.match(t, /confunden gratis con libre/);
  assert.match(t, /Asistencia promedio: 67%/);
  assert.match(t, /tareas 33%, exámenes 60%/);
  assert.doesNotMatch(t, /Ana|Beto|Carla/);
});

// ─── Parciales, riesgo y documentos ──────────────────────────────────────────
import { calificarParciales, detectarRiesgo, parcialDe, type Parcial } from '../src/features/clase/modelo';
import { reporteEvaluacion, seguimientoRiesgo, registroClases, type DatosEncabezado } from '../src/features/clase/documentos';
import { Packer } from 'docx';

const P: Parcial[] = [{ nombre: 'Parcial 1', inicio: '2026-08-24', fin: '2026-09-30' }, { nombre: 'Parcial 2', inicio: '2026-10-01', fin: '2026-11-15' }];
const colF = (id: string, fecha: string): Columna => ({ ...col(id, 'tarea'), fecha });

test('cada fecha cae en su parcial', () => {
  assert.equal(parcialDe('2026-09-30', P), 0);
  assert.equal(parcialDe('2026-10-01', P), 1);
  assert.equal(parcialDe('2026-12-01', P), -1);
});

test('calificación por parcial y final = promedio de los parciales calificados', () => {
  const cols = [colF('a', '2026-09-01'), colF('b', '2026-10-05'), colF('c', '2026-10-20')];
  const r = calificarParciales(cols, notas({ a: 8, b: 10, c: 6 }), [], 'x', false, undefined, P);
  assert.deepEqual(r.porParcial, [8, 8]);
  assert.equal(r.final, 8);
  const soloUno = calificarParciales(cols, notas({ a: 7 }), [], 'x', false, undefined, P);
  assert.deepEqual(soloUno.porParcial, [7, null]);
  assert.equal(soloUno.final, 7); // el parcial sin notas no baja la final
});

test('alerta de riesgo: promedio, faltas y entregas; sin datos no hay alerta', () => {
  const ses: Sesion[] = ['01', '02', '03', '04', '05'].map(d => ({ fecha: `2026-10-${d}`, marcas: { x: d < '03' ? 'F' : 'P' } }));
  const r = detectarRiesgo({ matricula: 'x', nombre: 'X' }, [col('a', 'tarea'), col('b', 'tarea')], notas({}, { a: 'no-entregado', b: 'no-entregado' }), ses, false);
  assert.deepEqual(r?.motivos, ['promedio 0', 'asistencia 60% (2 faltas)', '2 actividades sin entregar']);
  assert.equal(detectarRiesgo({ matricula: 'y', nombre: 'Y' }, [col('a', 'tarea')], undefined, [], false), null);
});

const enc: DatosEncabezado = { escuela: 'Bachillerato de Prueba', cct: '21XXX0000X', docente: 'Docente Sintético', asignatura: 'Cultura Digital I', grupo: '1º C', ciclo: '2026-2027', periodo: 'Parcial 1', fecha: '2026-10-10' };
async function textoDe(doc: Parameters<typeof Packer.toBuffer>[0]): Promise<string> {
  const z = await JSZip.loadAsync(await Packer.toBuffer(doc));
  return (await z.file('word/document.xml')!.async('string')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

test('el reporte de evaluación trae encabezado, alumnos, "—" donde no hay nota y espacio de firmas', async () => {
  const t = await textoDe(reporteEvaluacion(enc, ['Parcial 1', 'Parcial 2'], [
    { nombre: 'Ana Pérez', matricula: 'k7m2qp', calificaciones: [8, null], final: 8, asistencia: 95, faltas: 1, observaciones: '' },
  ], { promedio: 8, aprobados: 1, reprobados: 0, sinCalificar: 0, asistencia: 95 }));
  for (const x of ['Bachillerato de Prueba', 'CCT 21XXX0000X', 'REPORTE DE EVALUACIÓN', 'Ana Pérez', 'k7m2qp', '—', 'Vo. Bo.', 'Docente Sintético', '10 de octubre de 2026']) assert.ok(t.includes(x), x);
});

test('el seguimiento no inventa acciones: dice "Sin acciones registradas"', async () => {
  const t = await textoDe(seguimientoRiesgo(enc, [{ nombre: 'Beto', matricula: '1', motivos: ['promedio 4'], observaciones: [], acciones: [] }]));
  assert.ok(t.includes('Sin acciones registradas'));
  const vacio = await textoDe(seguimientoRiesgo(enc, []));
  assert.ok(vacio.includes('ningún alumno presenta señales de riesgo'));
});

test('el registro de clases usa el diario y cuenta las sesiones', async () => {
  const t = await textoDe(registroClases(enc, [{ fecha: '2026-10-09', descripcion: 'Vimos licencias.', asistencia: '28 de 30', actividades: ['Infografía'] }]));
  for (const x of ['Vimos licencias.', '28 de 30', 'Infografía', '1 sesión registrada']) assert.ok(t.includes(x), x);
});
