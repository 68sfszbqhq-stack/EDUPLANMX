import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { auditarPlaneacion, resolverFuenteAuditoria } from '../src/features/planeacion/auditoriaPedagogica';
import { PedagogicalAuditor } from '../components/PedagogicalAuditor';
import type { ProgramaSEP } from '../src/services/programasSEPService';
import type { LessonPlan } from '../types';
import muestra from '../src/demo/planMuestra.json';
const programa = (modelo: '2024' | '2025'): ProgramaSEP => ({
    materia: 'Cultura Digital I', semestre: 1, modelo, estado: 'oficial', metadata: {},
    organizador_curricular: { categorias: [], metas_aprendizaje: [] },
    progresiones: [{ id: 1, descripcion: 'Una progresión completa que no puede reconocerse solamente por compartir sus primeras palabras con otra progresión.', metas: [] }],
    url_fuente: `https://ejemplo.edu/${modelo}.pdf`, fecha_extraccion: '2026-10-25'
});
const p24 = programa('2024'), p25 = programa('2025');
const plan = (p = p24): LessonPlan => ({ ...structuredClone(muestra) as unknown as LessonPlan,
    progression: p.progresiones[0].descripcion,
    curricularSource: { status: 'oficial', catalogState: 'oficial', model: p.modelo!, subject: p.materia, semester: p.semestre, generation: 'Referencia', url: p.url_fuente }
});
const curricular = (p: LessonPlan, programas = [p24, p25]) => auditarPlaneacion(p, programas).results.find(x => x.label === 'Texto de progresión')!;
test('elige la fuente exacta del resultado aunque otro modelo aparezca primero', () => {
    assert.equal(resolverFuenteAuditoria(plan(p25), [p24, p25]).programa, p25);
    assert.equal(resolverFuenteAuditoria(plan(p24), [p25, p24]).programa, p24);
});
test('propuesta general no hereda un programa oficial de otro modelo', () => {
    const p = plan(p25); p.curricularSource!.status = 'general'; p.curricularSource!.catalogState = 'sin_programa';
    const r = auditarPlaneacion(p, [p24]);
    assert.equal(r.referencia.programa, null);
    assert.equal(curricular(p).status, 'unavailable');
    assert.equal(r.results.find(x => x.label === 'Aprendizajes de trayectoria')?.status, 'unavailable');
});
test('planes antiguos sin procedencia son no evaluables sin inferencia por nombre', () => {
    const p = plan(); delete p.curricularSource;
    assert.equal(curricular(p).status, 'unavailable');
});
test('no sustituye fuente borrador, incompleta, modificada o ambigua', () => {
    for (const cambio of [{url: ''}, {url: 'https://otra.edu/programa.pdf'}, {semester: undefined}, {catalogState: 'borrador' as const}]) {
        const p = plan(); Object.assign(p.curricularSource!, cambio);
        assert.equal(curricular(p).status, 'unavailable');
    }
    assert.equal(curricular(plan(), [{...p24, estado:'borrador'}]).status, 'unavailable');
    assert.equal(curricular(plan(), [p24, {...p24}]).status, 'unavailable');
});
test('compara texto completo; un prefijo compartido no acredita coincidencia', () => {
    assert.equal(curricular(plan()).status, 'pass');
    const p = plan(); p.progression = p.progression.slice(0, 55) + ' otro sentido';
    assert.equal(curricular(p).status, 'warning');
    p.progression = ''; p.curricularElements = undefined;
    assert.equal(curricular(p).status, 'unavailable');
});
test('laboral no se coteja contra progresiones del componente fundamental', () => {
    const p = plan(); p.meta = {...p.meta!, componente:'laboral'};
    assert.equal(curricular(p).status, 'unavailable');
});
test('no produce puntuación ni aprobación, incluso con elementos detectados', () => {
    const r = auditarPlaneacion(plan(), [p24]);
    assert.ok(r.detectados > 0);
    assert.ok(!('finalScore' in r));
    assert.equal(r.detectados + r.pendientes + r.noEvaluables, r.results.length);
});
test('vista general muestra modelo propio y no ofrece seleccionar un catálogo inexistente', () => {
    const p = plan(p25); p.curricularSource!.status = 'general'; p.curricularSource!.catalogState = 'sin_programa';
    const html = renderToStaticMarkup(<PedagogicalAuditor plan={p} />);
    assert.match(html, /Modelo 2025/);
    assert.match(html, /Cotejo curricular no evaluable/);
    assert.doesNotMatch(html, /Lista para entregar|Cumplimiento|Referencia oficial utilizada|Selecciona la progresión desde el catálogo|Mismo criterio/);
});
test('vista de modelo 2024 no aplica encabezados 2025 ni conclusión de lenguaje excluyente', () => {
    const html = renderToStaticMarkup(<PedagogicalAuditor plan={plan()} />);
    assert.match(html, /Modelo 2024/);
    assert.doesNotMatch(html, /Modelo 2025|Predomina el masculino genérico|Lista para entregar/);
});

test('una actividad de aula sin PAEC no se considera una carencia', () => {
    const p = plan(); p.paec = { isLinked: false, estado: 'sin_vinculo', communityProblem: '', projectTrigger: '' };
    const r = auditarPlaneacion(p, [p24]);
    assert.equal(r.results.find(x=>x.label === 'Sentido social y vínculo comunitario')?.status, 'notapplicable');
    assert.equal(r.noAplican, 1);
    assert.match(renderToStaticMarkup(<PedagogicalAuditor plan={p} />), /No aplica/);
});
