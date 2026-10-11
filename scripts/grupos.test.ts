/**
 * Pruebas de la lógica de Mis grupos (sin red). Datos sintéticos.
 *   npm run test:grupos
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leerLista, compararLista, resumirResultados, textoParaPlaneacion, normalizarMatricula, asignarClaves,
  type AlumnoLista, type Resultado,
} from '../src/features/grupos/model';

const alumno = (matricula: string, nombre: string, cuentaUid = ''): AlumnoLista =>
  ({ matricula, nombre, estado: 'activo', cuentaUid, cuentaCorreo: '' });

test('la matrícula se normaliza igual que en Antología', () => {
  assert.equal(normalizarMatricula(' 2024-001 '), '2024001');
  assert.equal(normalizarMatricula('A-12'), 'a12');
});

test('lee columnas pegadas desde Excel con encabezados', () => {
  const { filas, invalidas } = leerLista('Matrícula\tNombre\n2024001\tPérez López Ana\n2024002\tRuiz  Gómez   Beto\n');
  assert.deepEqual(filas.map(f => [f.matricula, f.nombre]), [['2024001', 'Pérez López Ana'], ['2024002', 'Ruiz Gómez Beto']]);
  assert.equal(invalidas.length, 0);
});

test('lee CSV sin encabezados, con nombre primero', () => {
  const { filas } = leerLista('"Pérez Ana",2024001\nRuiz Beto;2024002');
  assert.deepEqual(filas.map(f => f.matricula), ['2024001', '2024002']);
});

test('una fila sin matrícula entra con matrícula vacía (luego recibe clave)', () => {
  const { filas, invalidas } = leerLista('matricula,nombre\n,Sin Matrícula Carla\n2024003,Díaz Dora');
  assert.deepEqual(filas.map(f => [f.matricula, f.nombre]), [['', 'Sin Matrícula Carla'], ['2024003', 'Díaz Dora']]);
  assert.equal(invalidas.length, 0);
});

test('una sola columna de nombres pegada desde Excel', () => {
  const { filas } = leerLista('Pérez López Ana\nRuiz Gómez Beto\n\nSánchez Díaz Carla\n');
  assert.deepEqual(filas.map(f => [f.matricula, f.nombre]), [['', 'Pérez López Ana'], ['', 'Ruiz Gómez Beto'], ['', 'Sánchez Díaz Carla']]);
});

test('una columna con encabezado "Nombre" no importa el encabezado', () => {
  const { filas } = leerLista('Nombre\nPérez López Ana\nRuiz Gómez Beto');
  assert.deepEqual(filas.map(f => f.nombre), ['Pérez López Ana', 'Ruiz Gómez Beto']);
});

test('apellidos y nombre en columnas separadas se juntan', () => {
  const { filas } = leerLista('No.\tApellido paterno\tApellido materno\tNombre(s)\n1\tPérez\tLópez\tAna María\n2\tRuiz\tGómez\tBeto');
  assert.deepEqual(filas.map(f => [f.matricula, f.nombre]), [['', 'Pérez López Ana María'], ['', 'Ruiz Gómez Beto']]);
});

test('numeración sin encabezados no se confunde con matrícula', () => {
  const { filas } = leerLista('1\tPérez López Ana\n2\tRuiz Gómez Beto');
  assert.deepEqual(filas.map(f => [f.matricula, f.nombre]), [['', 'Pérez López Ana'], ['', 'Ruiz Gómez Beto']]);
});

test('el título de la hoja se marca como dudoso', () => {
  const { filas } = leerLista('Lista de asistencia grupo A\nPérez López Ana');
  assert.equal(filas[0].dudosa, true);
  assert.equal(filas[1].dudosa, undefined);
});

test('reimportar solo nombres no duplica, aunque cambien acentos u orden', () => {
  const existentes = [{ ...alumno('k7m2qp', 'Pérez López Ana'), generada: true }];
  const v = compararLista('Perez Lopez Ana\nLópez Pérez, Ana\nRuiz Beto', existentes);
  assert.equal(v.sinCambios.length, 1);
  assert.equal(v.sinCambios[0].matricula, 'k7m2qp');
  assert.deepEqual(v.nuevos.map(f => f.nombre), ['López Pérez Ana', 'Ruiz Beto']); // el 2º "Ana" ya no empata: puede ser otra persona
});

test('las claves no se repiten y se reutilizan entre clases del mismo docente', () => {
  let i = 0;
  const azar = () => [0.1, 0.5, 0.9, 0.3, 0.7, 0.2][i++ % 6];
  const otras = [{ ...alumno('abc234', 'Ruiz Beto'), generada: true }];
  const r = asignarClaves([{ fila: 1, matricula: '', nombre: 'Beto Ruiz' }, { fila: 2, matricula: '', nombre: 'Pérez Ana' }, { fila: 3, matricula: '2024001', nombre: 'Díaz Dora' }], otras, [], azar);
  assert.equal(r[0].matricula, 'abc234');
  assert.match(r[1].matricula, /^[a-z2-9]{6}$/);
  assert.ok(/[a-z]/.test(r[1].matricula) && /\d/.test(r[1].matricula));
  assert.equal(r[2].matricula, '2024001');
  assert.equal(r[2].generada, undefined);
  assert.equal(new Set(r.map(x => x.matricula)).size, 3);
});

test('una clave reutilizada no pisa a otro alumno que ya está en esta clase', () => {
  const otras = [{ ...alumno('abc234', 'Ruiz Beto'), generada: true }];
  const [r] = asignarClaves([{ fila: 1, matricula: '', nombre: 'Ruiz Beto' }], otras, ['abc234']);
  assert.notEqual(r.matricula, 'abc234');
});

test('importar la misma lista dos veces no agrega a nadie', () => {
  const texto = 'matricula,nombre\n2024001,Pérez Ana\n2024002,Ruiz Beto';
  const primera = compararLista(texto, []);
  assert.equal(primera.nuevos.length, 2);
  const yaGuardados = primera.nuevos.map(f => alumno(f.matricula, f.nombre));
  const segunda = compararLista(texto, yaGuardados);
  assert.equal(segunda.nuevos.length, 0);
  assert.equal(segunda.sinCambios.length, 2);
});

test('la misma matrícula escrita distinto es el mismo alumno', () => {
  const v = compararLista('matricula,nombre\n2024-001,Pérez Ana', [alumno('2024001', 'Pérez Ana')]);
  assert.equal(v.nuevos.length, 0);
  assert.equal(v.sinCambios.length, 1);
});

test('un nombre corregido se muestra como cambio, no como alumno nuevo', () => {
  const v = compararLista('matricula,nombre\n2024001,Pérez López Ana', [alumno('2024001', 'Perez Ana')]);
  assert.deepEqual(v.cambios, [{ matricula: '2024001', antes: 'Perez Ana', despues: 'Pérez López Ana' }]);
  assert.equal(v.nuevos.length, 0);
});

test('una matrícula repetida en el archivo es conflicto y no se importa sola', () => {
  const v = compararLista('matricula,nombre\n2024001,Pérez Ana\n2024001,Otra Persona', []);
  assert.equal(v.nuevos.length, 0);
  assert.deepEqual(v.repetidosEnArchivo, [{ matricula: '2024001', filas: [2, 3] }]);
});

test('quien ya no viene en el archivo se avisa pero no se borra', () => {
  const v = compararLista('matricula,nombre\n2024001,Pérez Ana', [alumno('2024001', 'Pérez Ana'), alumno('2024009', 'Zeta Zoe')]);
  assert.deepEqual(v.noVienen.map(a => a.matricula), ['2024009']);
});

const res = (matricula: string, porcentaje: number, porEje: Resultado['porEje']): Resultado =>
  ({ matricula, instrumento: 'cultura-digital-1/modulo-1', titulo: 'Módulo 1.1', aciertos: 0, total: 10, porcentaje, porEje });

test('quien no contestó es dato faltante, no un cero', () => {
  const lista = [alumno('1', 'A', 'u1'), alumno('2', 'B', 'u2'), alumno('3', 'C'), alumno('4', 'D')];
  const [r] = resumirResultados(lista, [res('1', 80, { Hardware: { ok: 4, total: 5 } })]);
  assert.equal(r.contestaron, 1);
  assert.equal(r.promedio, 80);           // no 20 (80/4)
  assert.equal(r.pendientes, 1);          // B entró y no contestó
  assert.equal(r.sinCuenta, 2);           // C y D nunca entraron
});

test('resultados de alumnos que no están en la lista se ignoran', () => {
  const [r] = resumirResultados([alumno('1', 'A', 'u1')], [res('1', 50, {}), res('999', 100, {})]);
  assert.equal(r.contestaron, 1);
  assert.equal(r.promedio, 50);
});

test('el texto para la planeación avisa cuando la cobertura es baja', () => {
  const lista = [alumno('1', 'A', 'u1'), alumno('2', 'B'), alumno('3', 'C')];
  const resumen = resumirResultados(lista, [res('1', 40, { Software: { ok: 1, total: 5 } })]);
  const t = textoParaPlaneacion({ nombre: '1º A Vesp', asignaturaNombre: 'Cultura Digital I' }, resumen);
  assert.match(t, /contestaron 1 de 3/);
  assert.match(t, /COBERTURA BAJA/);
  assert.match(t, /Software \(20%\)/);
  assert.match(t, /dato faltante, no bajo desempeño/);
});
