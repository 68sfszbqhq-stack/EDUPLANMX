/**
 * Pruebas del cuaderno de notas y de la calificación de exámenes (sin red).
 *   npm run test:evaluacion
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularTotal, puntosDeRubrica, csvIdoceo, calificarCerrada, calificarIntento, validarExamenGenerado, notaSobre,
  type Columna, type NotasAlumno, type Pregunta, type Rubrica,
} from '../src/features/evaluacion/modelo';

const col = (id: string, max: number, peso = 0): Columna =>
  ({ id, nombre: id, tipo: 'tarea', max, peso, fecha: '2026-10-10', orden: 0, rubrica: null, examenId: '' });
const notas = (valores: Record<string, number>, estados: NotasAlumno['estados'] = {}): NotasAlumno =>
  ({ matricula: '1', valores, estados, comentarios: {}, rubricas: {} });

// ─── Cuaderno ────────────────────────────────────────────────────────────────
test('sin pesos: suma de puntos sobre suma de máximos', () => {
  assert.equal(calcularTotal([col('a', 10), col('b', 20)], notas({ a: 8, b: 10 }), false).calificacion, 6); // 18/30
});

test('vacío no es cero: una tarea sin calificar no baja el promedio', () => {
  const t = calcularTotal([col('a', 10), col('b', 10)], notas({ a: 9 }), false);
  assert.equal(t.calificacion, 9);
  assert.equal(t.sinNota, 1);
});

test('al cerrar el periodo, las vacías pueden contar como cero', () => {
  assert.equal(calcularTotal([col('a', 10), col('b', 10)], notas({ a: 9 }), true).calificacion, 4.5);
});

test('"no entregó" cuenta como cero aunque las vacías no cuenten', () => {
  assert.equal(calcularTotal([col('a', 10), col('b', 10)], notas({ a: 9 }, { b: 'no-entregado' }), false).calificacion, 4.5);
});

test('"exento" nunca cuenta', () => {
  assert.equal(calcularTotal([col('a', 10), col('b', 10)], notas({ a: 9, b: 0 }, { b: 'exento' }), true).calificacion, 9);
});

test('con pesos manda el peso, no los puntos (como iDoceo)', () => {
  // examen /16 con 40 % y tarea /10 con 60 %: 8/16=50 % y 10/10=100 % → 0.4*5 + 0.6*10 = 8
  assert.equal(calcularTotal([col('ex', 16, 40), col('t', 10, 60)], notas({ ex: 8, t: 10 }), false).calificacion, 8);
});

test('rúbrica: sin todos los criterios valorados no hay nota todavía', () => {
  const r: Rubrica = { criterios: [
    { id: 'c1', nombre: 'Contenido', peso: 60, niveles: [{ nombre: 'Inicial', puntos: 1, descriptor: '' }, { nombre: 'Logrado', puntos: 4, descriptor: '' }] },
    { id: 'c2', nombre: 'Presentación', peso: 40, niveles: [{ nombre: 'Inicial', puntos: 1, descriptor: '' }, { nombre: 'Logrado', puntos: 4, descriptor: '' }] },
  ] };
  assert.equal(puntosDeRubrica(r, { c1: 1 }, 10), null);
  assert.equal(puntosDeRubrica(r, { c1: 1, c2: 0 }, 10), 7); // 0.6*1 + 0.4*0.25 = 0.7
});

test('CSV para iDoceo: vacío queda vacío, no cero', () => {
  const csv = csvIdoceo([col('a', 10)], [{ matricula: '1', nombre: 'Pérez Ana' }, { matricula: '2', nombre: 'Ruiz Beto' }], { '1': notas({ a: 8 }) }, false);
  assert.equal(csv, '!Alumno,!Matrícula,a (/10),Calificación\r\nPérez Ana,1,8,8\r\nRuiz Beto,2,,\r\n');
});

// ─── Exámenes ────────────────────────────────────────────────────────────────
const p = (tipo: Pregunta['tipo'], extra: Partial<Pregunta> = {}): Pregunta => ({ id: 'q', tipo, texto: 'x', puntos: 2, ...extra });

test('opción múltiple, verdadero/falso y numérica con tolerancia', () => {
  assert.equal(calificarCerrada(p('opcion'), { correcta: 1 }, { valor: 1 }), 2);
  assert.equal(calificarCerrada(p('opcion'), { correcta: 1 }, { valor: 0 }), 0);
  assert.equal(calificarCerrada(p('vf'), { verdadero: false }, { valor: false }), 2);
  assert.equal(calificarCerrada(p('numerica'), { valor: 3.14, tolerancia: 0.01 }, { valor: '3,145' }), 2);
});

test('sin respuesta no se califica solo: queda para el docente', () => {
  assert.equal(calificarCerrada(p('opcion'), { correcta: 1 }, undefined), null);
  assert.equal(calificarCerrada(p('completar'), { aceptadas: ['RAM'] }, { valor: '' }), null);
});

test('completar ignora acentos y mayúsculas', () => {
  assert.equal(calificarCerrada(p('completar'), { aceptadas: ['memoria RAM'] }, { valor: '  Memoría   ram ' }), 2);
});

test('varias correctas da crédito parcial y nunca negativo', () => {
  assert.equal(calificarCerrada(p('multiple'), { correctas: [0, 2] }, { valor: [0] }), 1);
  assert.equal(calificarCerrada(p('multiple'), { correctas: [0, 2] }, { valor: [0, 1] }), 0);
  assert.equal(calificarCerrada(p('multiple'), { correctas: [0, 2] }, { valor: [1, 3] }), 0);
});

test('relacionar y ordenar dan crédito parcial', () => {
  assert.equal(calificarCerrada(p('relacionar'), { pares: [1, 0] }, { valor: { '0': 1, '1': 1 } }), 1);
  assert.equal(calificarCerrada(p('ordenar'), { orden: [2, 0, 1, 3] }, { valor: [2, 0, 3, 1] }), 1);
});

test('elige y justifica: la elección vale la mitad y la explicación se revisa', () => {
  const pr = p('justifica', { opciones: ['a', 'b'] });
  assert.equal(calificarCerrada(pr, { correcta: 0, criterio: 'x' }, { valor: { opcion: 0, texto: 'porque…' } }), 1);
  const r = calificarIntento([pr], { q: { correcta: 0, criterio: 'x' } }, { q: { valor: { opcion: 0, texto: 'porque…' } } });
  assert.deepEqual(r.pendientes, ['q']);
  assert.equal(calificarIntento([pr], { q: { correcta: 0, criterio: 'x' } }, { q: { valor: { opcion: 0, texto: '…' } } }, { q: 2 }).automaticos, 2);
});

test('detecta a quien está muy seguro y se equivoca (idea errónea)', () => {
  const r = calificarIntento([p('opcion')], { q: { correcta: 1 } }, { q: { valor: 0, confianza: 3 } });
  assert.deepEqual(r.segurosEquivocados, ['q']);
});

test('nota sobre el máximo de la columna', () => {
  assert.equal(notaSobre(7, 14, 10), 5);
});

test('lo que devuelve la IA se valida: claves fuera de rango se descartan', () => {
  const v = validarExamenGenerado({ preguntas: [
    { tipo: 'opcion', texto: '¿?', opciones: ['a', 'b'], clave: { correcta: 5 } },
    { tipo: 'vf', texto: 'El SSD es más rápido que el HDD', clave: { verdadero: true } },
    { tipo: 'abierta', texto: 'Explica', clave: {} },
    { tipo: 'inventado', texto: 'x' },
  ] });
  assert.equal(v.preguntas.length, 1);
  assert.equal(v.preguntas[0].id, 'p1');
  assert.equal(v.problemas.length, 3);
  assert.equal('verdadero' in v.preguntas[0], false); // la respuesta nunca va en la pregunta
});
