import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FuenteEscolar, Ambito, fuentesAplicables, recuperarContexto, validarRespuesta, validarFuente, bloqueParaPlan } from '../src/features/cuaderno/model';
const scope: Ambito = { schoolId: 'escuela-a', cycle: '2026-2027', group: '1 A · Vespertino', subject: 'Cultura Digital', date: '2026-10-06' };
const base: FuenteEscolar = { id: 'fuente', schoolId: scope.schoolId, authorId: 'docente', title: 'Resultado de lectura', text: 'El grupo requiere modelado para interpretar gráficas.', kind: 'actividad', cycle: scope.cycle, group: scope.group, subject: scope.subject, meeting: 'CAPEMS octubre', date: '2026-10-05', validUntil: '', origin: 'Bitácora de clase', status: 'revisada', createdAt: '2026-10-05T12:00:00Z', reviewedBy: 'director', reviewedAt: '2026-10-06T12:00:00Z' };
test('excluye otra escuela, ciclo, grupo, turno, asignatura, borradores, futuras y vencidas', () => {
  const rows = [base, { ...base, schoolId: 'escuela-b' }, { ...base, cycle: '2025-2026' }, { ...base, group: '1 A · Matutino' }, { ...base, subject: 'Matemáticas' }, { ...base, status: 'borrador' as const }, { ...base, status: 'archivada' as const }, { ...base, date: '2026-10-07' }, { ...base, validUntil: '2026-10-05' }];
  assert.deepEqual(fuentesAplicables(rows, scope), [base]);
});
test('fuente de plantel aplica a grupos; diagnóstico no puede guardarse sin grupo', () => {
  assert.equal(fuentesAplicables([{ ...base, group: '', subject: '', kind: 'acuerdo' }], scope).length, 1);
  assert.throws(() => validarFuente({ ...base, group: '' }), /grupo/);
});
test('recuperación respeta selección y reporta truncamiento, sin perder identidad', () => {
  const c = recuperarContexto([{ ...base, text: 'gráficas '.repeat(7000) }, { ...base, id: 'excluida' }], scope, 'gráficas', ['fuente']);
  assert.equal(c.fragments.length, 12); assert.ok(c.omitted > 0); assert.equal(c.sourceCount, 1);
  assert.ok(c.fragments.every(f => f.sourceId === 'fuente'));
  assert.equal(recuperarContexto([base], scope, 'lectura', []).fragments.length, 0);
});
test('rechaza referencias inventadas por IA y acepta referencias trazables', () => {
  const c = recuperarContexto([base], scope, 'lectura');
  const r = { answer: 'Propuesta', recommendations: [{ change: 'Modelar', evidence: 'Dificultad', check: 'Respuesta individual', sourceIds: [c.fragments[0].id] }], missing: [] };
  assert.deepEqual(validarRespuesta(r, c), r);
  assert.throws(() => validarRespuesta({ ...r, recommendations: [{ ...r.recommendations[0], sourceIds: ['inventada'] }] }, c));
  assert.throws(() => validarRespuesta({ ...r, recommendations: [{ ...r.recommendations[0], sourceIds: [] }] }, c));
});
test('archivar una fuente la retira del siguiente plan y no transmite borradores', () => {
  assert.equal(bloqueParaPlan(recuperarContexto([{ ...base, status: 'archivada' }], scope, 'lectura')), '');
  assert.match(bloqueParaPlan(recuperarContexto([base], scope, 'lectura')), /evidencia individual/);
});
test('no confunde datos ausentes con evidencia ni acepta tamaños excesivos', () => {
  assert.throws(() => validarFuente({ ...base, text: '' }));
  assert.throws(() => validarFuente({ ...base, text: 'a'.repeat(80001) }));
  assert.throws(() => validarFuente({ ...base, validUntil: '2026-01-01' }));
});
