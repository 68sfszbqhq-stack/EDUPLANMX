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
