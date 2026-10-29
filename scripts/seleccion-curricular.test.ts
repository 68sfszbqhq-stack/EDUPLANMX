import test from 'node:test';
import assert from 'node:assert/strict';
import type { ProgramaSEP } from '../src/services/programasSEPService';
import { idPrograma, resolverSeleccion, contextoPrograma } from '../src/features/planeacion/seleccionCurricular';
const programa = (modelo: '2024' | '2025', estado: 'oficial' | 'borrador' = 'oficial'): ProgramaSEP => ({
  materia: 'Asignatura de prueba', semestre: 1, modelo, estado, metadata: {},
  organizador_curricular: { categorias: ['Categoría'], metas_aprendizaje: ['Meta'] },
  progresiones: [{ id: 9, descripcion: `Texto completo ${modelo} ` + 'contenido '.repeat(120), metas: ['Meta asociada'] }],
  url_fuente: `https://ejemplo.edu/${modelo}.pdf`, fecha_extraccion: '2026-10-25',
});
test('mismo nombre y semestre no confunden modelos', () => {
  const viejo = programa('2024'), nuevo = programa('2025');
  assert.notEqual(idPrograma(viejo), idPrograma(nuevo));
  assert.equal(resolverSeleccion([viejo, nuevo], { modelo: '2025', programaId: idPrograma(nuevo), progresionId: 9 }), nuevo);
});
test('programa inexistente o de otro modelo falla sin sustituirlo', () => {
  const p = programa('2024');
  assert.throws(() => resolverSeleccion([p], { modelo: '2025', programaId: idPrograma(p) }));
  assert.throws(() => resolverSeleccion([p], { modelo: '2024', programaId: 'inexistente' }));
});
test('no permite progresión ajena o de borrador', () => {
  for (const p of [programa('2024'), programa('2025', 'borrador')]) {
    assert.throws(() => resolverSeleccion([p], { modelo: p.modelo!, programaId: idPrograma(p), progresionId: p.estado === 'borrador' ? 9 : 999 }));
  }
});
test('modelo sin programa no hereda el currículo anterior', () => {
  const s = { modelo: '2025' as const, programaId: null };
  assert.equal(resolverSeleccion([programa('2024')], s), null);
  const texto = contextoPrograma(null, s);
  assert.ok(texto.includes('PROPUESTA GENERAL'));
  assert.ok(texto.includes('2025'));
  assert.ok(!texto.includes('Texto completo 2024'));
});
test('el contexto incluye la progresión completa y la fuente exacta', () => {
  const p = programa('2025');
  const texto = contextoPrograma(p, { modelo: '2025', programaId: idPrograma(p), progresionId: 9 });
  assert.ok(texto.includes(p.progresiones[0].descripcion));
  assert.ok(texto.includes(p.url_fuente));
  assert.ok(texto.includes('Meta asociada'));
});
test('borrador no alimenta la IA como fuente oficial', () => {
  const p = programa('2025', 'borrador');
  const texto = contextoPrograma(p, { modelo: '2025', programaId: idPrograma(p) });
  assert.ok(texto.includes('PROPUESTA GENERAL'));
  assert.ok(!texto.includes(p.progresiones[0].descripcion));
});
test('progresión oficial sin metas no rompe la generación', () => {
  const p = programa('2024');
  delete (p.progresiones[0] as { metas?: string[] }).metas;
  const texto = contextoPrograma(p, { modelo: '2024', programaId: idPrograma(p), progresionId: 9 });
  assert.ok(texto.includes('Metas asociadas: Cotejo pendiente'));
});
test('materia y progresión llevan el plan entre paréntesis', async () => {
  const { conPlan, etiquetaElemento } = await import('../data/vocabularioCurricular');
  assert.equal(conPlan('Pensamiento Matemático I', '2024'), 'Pensamiento Matemático I (Plan 2023)');
  assert.equal(conPlan('Pensamiento Matemático I', '2025'), 'Pensamiento Matemático I (Plan 2025)');
  assert.equal(etiquetaElemento('2024'), '(Progresión · Plan 2023)');
  assert.equal(etiquetaElemento('2025'), '(Propósito formativo · Plan 2025)');
});
test('en el Modelo 2025 la IA recibe el propósito formativo y sus contenidos formativos', () => {
  const p = programa('2025');
  p.progresiones[0].tematicas = ['Tiempo histórico', 'Espacio histórico'];
  const texto = contextoPrograma(p, { modelo: '2025', programaId: idPrograma(p), progresionId: 9 });
  assert.ok(texto.includes('PROPÓSITO FORMATIVO SELECCIONADO (9) · Plan 2025'));
  assert.ok(texto.includes('Contenidos formativos de este propósito: Tiempo histórico; Espacio histórico'));
});
test('catálogo: programas oficiales vigentes sin números ni textos repetidos', async () => {
  const { default: catalogo } = await import('../data/programas_sep.json', { with: { type: 'json' } });
  const vigentes = (catalogo as ProgramaSEP[]).filter(p => p.estado === 'oficial' && (p.modelo === '2025' || p.semestre >= 5));
  assert.ok(vigentes.filter(p => p.modelo === '2025').length >= 37);
  for (const p of vigentes) {
    const ids = p.progresiones.map(g => g.id);
    assert.equal(new Set(ids).size, ids.length, `${p.materia}: número repetido`);
    assert.equal(new Set(p.progresiones.map(g => g.descripcion)).size, ids.length, `${p.materia}: texto repetido`);
    for (let i = 1; i <= Math.max(...ids); i++) assert.ok(ids.includes(i), `${p.materia}: falta la ${i}`);
    for (const g of p.progresiones) assert.ok(g.descripcion.length >= 40 && !/\.{6}|^Momento \d|enganch/i.test(g.descripcion), `${p.materia} #${g.id}: no parece progresión`);
    if (p.modelo === '2025') assert.ok(p.progresiones.every(g => g.tematicas?.length), `${p.materia}: propósito sin contenidos formativos`);
  }
});
