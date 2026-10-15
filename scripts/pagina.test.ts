import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aSlug, slugValido, urlSegura, paginaVacia, problemas, materialesPorTema, ordenarAvisos, promptSitioPropio, moduloAntologia } from '../src/features/pagina/modelo';

test('la dirección se arma sin acentos, títulos ni espacios', () => {
  assert.equal(aSlug('Mtro. José Roberto Méndez'), 'jose-roberto-mendez');
  assert.equal(aSlug('  Profa.   Ñandú   Peña!! '), 'nandu-pena');
  assert.equal(aSlug('Mtro(a). José Roberto Mendoza'), 'jose-roberto-mendoza');
  assert.ok(aSlug('a'.repeat(80)).length <= 40);
  assert.ok(slugValido('jose-roberto'));
  for (const malo of ['ab', 'Jose', 'jose roberto', '-jose', 'jose-', 'jose--r', 'josé']) assert.equal(slugValido(malo), false, malo);
});

test('solo se aceptan enlaces https', () => {
  assert.ok(urlSegura('https://youtu.be/abc'));
  for (const malo of ['javascript:alert(1)', 'http://sitio.mx', 'JAVASCRIPT:x', 'https://', 'data:text/html,hola', ' https://x.mx'])
    assert.equal(urlSegura(malo), false, malo);
});

test('una página recién creada se puede guardar; una mal llena explica qué falta', () => {
  const p = paginaVacia('uid', 'Mtro. José Roberto Mendoza', 'BGO');
  assert.equal(p.slug, 'jose-roberto-mendoza');
  assert.deepEqual(problemas(p), []);
  const mal = { ...p, slug: 'x', nombre: '', materiales: [{ titulo: 'Video', url: 'javascript:alert(1)', tema: '' }] };
  const r = problemas(mal);
  assert.ok(r.some(t => /dirección/.test(t)));
  assert.ok(r.some(t => /nombre/.test(t)));
  assert.ok(r.some(t => /https/.test(t)));
});

test('materiales por tema en el orden del docente; avisos recientes primero', () => {
  const m = [{ titulo: 'A', url: 'https://a.mx', tema: 'Software libre' }, { titulo: 'B', url: 'https://b.mx', tema: '' }, { titulo: 'C', url: 'https://c.mx', tema: 'Software libre' }];
  assert.deepEqual(materialesPorTema(m).map(([t, xs]) => [t, xs.map(x => x.titulo)]), [['Software libre', ['A', 'C']], ['General', ['B']]]);
  assert.deepEqual(ordenarAvisos([{ fecha: '2026-10-01', texto: 'a' }, { fecha: '2026-10-14', texto: 'b' }]).map(a => a.texto), ['b', 'a']);
});

test('el prompt avanzado lleva los datos y prohíbe guardar datos de alumnos', () => {
  const p = { ...paginaVacia('uid', 'Mtro. José', 'BGO'), materias: [{ nombre: 'Cultura Digital I', grupo: '1º A', asignaturaClave: 'cultura-digital-1' }] };
  const t = promptSitioPropio(p, 'https://x/clase/jose', 'https://antologia');
  assert.match(t, /Cultura Digital I · 1º A/);
  assert.match(t, /https:\/\/antologia\/mis-examenes/);
  assert.match(t, /NO debe pedir ni guardar datos de alumnos/);
  assert.doesNotMatch(t, /undefined|false/);
});

test('módulos de Antología por asignatura', () => {
  assert.equal(moduloAntologia('cultura-digital-1'), '/cultura-digital');
  assert.equal(moduloAntologia('matematicas-1'), '');
});
