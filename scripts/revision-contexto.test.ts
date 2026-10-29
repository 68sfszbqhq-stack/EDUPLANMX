import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRevisionContexto, contextoAutorizado, separarDiagnosticoDiario } from '../src/features/planeacion/revisionContexto';
import { bloqueParaPlan } from '../src/features/cuaderno/model';

const diario = 'Lo que pasó en las últimas clases (diario del docente):\n- 2026-10-20: NOMBRE_FICTICIO requiere apoyo.';
const antologia = 'Resultados de Antología del grupo 1A.\nContestaron 12 de 20.';
test('separa diario sin perder diagnóstico ni cobertura de Antología', () => {
  assert.deepEqual(separarDiagnosticoDiario(`Sin internet.\n${diario}\n${antologia}`), { diagnostico: `Sin internet.\n${antologia}`, diario });
  assert.deepEqual(separarDiagnosticoDiario('Texto manual'), { diagnostico: 'Texto manual', diario: '' });
});
test('excluir diario impide enviarlo y conserva el diagnóstico', () => {
  const r = crearRevisionContexto('Planeación', `Sin internet.\n${diario}`, '', '');
  r.bloques.find(b => b.id === 'diario')!.incluir = false;
  const a = contextoAutorizado(r);
  assert.ok(a.prompt.includes('Sin internet.'));
  assert.ok(!a.prompt.includes('NOMBRE_FICTICIO'));
});
test('ediciones y exclusiones no recuperan originales ni perfil de respaldo', () => {
  const r = crearRevisionContexto('Planeación', 'ORIGINAL_DIAGNOSTICO', 'ORIGINAL_FLUJO', 'ORIGINAL_PERFIL');
  r.bloques.find(b => b.id === 'diagnostico')!.texto = 'Resumen corregido';
  r.bloques.find(b => b.id === 'flujo')!.incluir = false;
  r.bloques.find(b => b.id === 'perfil')!.incluir = false;
  const a = contextoAutorizado(r);
  assert.ok(a.prompt.includes('Resumen corregido'));
  assert.ok(!JSON.stringify(a).includes('ORIGINAL_'));
  assert.equal(a.perfil, '');
});
test('borrar todo el diagnóstico no introduce un resumen automático', () => {
  const r = crearRevisionContexto('Planeación', 'ORIGINAL', '', '');
  r.bloques.find(b => b.id === 'diagnostico')!.texto = '  ';
  assert.ok(contextoAutorizado(r).prompt.endsWith('Planeación'));
  assert.ok(!contextoAutorizado(r).prompt.includes('ORIGINAL'));
  assert.ok(!contextoAutorizado(r).prompt.includes('DIAGNÓSTICO Y DIARIO REVISADOS'));
});
test('cuaderno es una copia editable y solo serializa fragmentos conservados', () => {
  const c = { fragments: [{ id: 'f:1', sourceId: 'f', title: 'Título original', origin: 'Origen original', date: '2026-10-20', text: 'NOMBRE_FICTICIO' }], sourceCount: 1, omitted: 0 };
  const r = crearRevisionContexto('Planeación', '', '', '', c);
  r.cuaderno!.fragments[0].text = 'Resumen agregado';
  const a = contextoAutorizado(r);
  assert.ok(!bloqueParaPlan(a.cuaderno!).includes('NOMBRE_FICTICIO'));
  assert.equal(c.fragments[0].text, 'NOMBRE_FICTICIO');
  r.cuaderno!.fragments = [];
  assert.equal(contextoAutorizado(r).cuaderno, undefined);
});
