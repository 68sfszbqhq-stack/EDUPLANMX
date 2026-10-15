// Grupo de DEMOSTRACIÓN para el simulador local (ponencia EIIE, 25-oct-2026).
// Todo es inventado: nombres, matrículas, notas. Solo habla con 127.0.0.1.
//
//   npm run emulador                      (terminal 1)
//   node scripts/sembrar-emulador.mjs     (crea la cuenta docente@prueba.mx)
//   node scripts/sembrar-demo.mjs         (agrega el grupo «1º A Vespertino»)
//
// Deja a la vista lo que se quiere mostrar: cuaderno con notas y ponderación,
// asistencia, diario de clase, resultados de Antología y alumnos en riesgo.
const PROYECTO = 'eduplanmx-pruebas';
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
const FS = `http://127.0.0.1:8080/v1/projects/${PROYECTO}/databases/(default)/documents`;
const GRUPO = 'demo-1a-vesp';

function valor(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Number.isInteger(v)) return { integerValue: String(v) };
  if (typeof v === 'number') return { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(valor) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, valor(x)])) } };
}

async function documento(ruta, datos) {
  const r = await fetch(`${FS}/${ruta}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, valor(v)])) }),
  });
  if (!r.ok) throw new Error(`No pude escribir ${ruta}: ${await r.text()}`);
}

// Cambia solo los campos indicados, sin borrar el resto del documento.
async function actualizar(ruta, datos) {
  const mascara = Object.keys(datos).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const r = await fetch(`${FS}/${ruta}?${mascara}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, valor(v)])) }),
  });
  if (!r.ok) throw new Error(`No pude actualizar ${ruta}: ${await r.text()}`);
}

try {
  await fetch('http://127.0.0.1:8080/');
} catch {
  console.error('✗ El simulador no está corriendo. Arráncalo con: npm run emulador');
  process.exit(1);
}

const s = await fetch(`${AUTH}/accounts:signInWithPassword?key=simulador`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'docente@prueba.mx', password: 'prueba123', returnSecureToken: true }),
});
const docente = (await s.json()).localId;
if (!docente) {
  console.error('✗ Falta la cuenta docente. Corre primero: node scripts/sembrar-emulador.mjs');
  process.exit(1);
}

// En la demo el docente ya es miembro aprobado de su escuela: sin la franja de
// «verifica tu acceso». (Para ensayar la migración de membresías, no corras este script.)
await documento(`schools/escuela-prueba/miembros/${docente}`, {
  uid: docente, nombre: 'José Roberto Mendoza', email: 'docente@prueba.mx', rol: 'docente',
  estado: 'aprobado', creadoEn: '2026-08-25T16:00:00.000Z',
});
await actualizar(`users/${docente}`, { nombre: 'José Roberto', apellidoPaterno: 'Mendoza' });

// Aleatorio con semilla: cada vez sale el mismo grupo.
let semilla = 20261025;
const azar = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;
const entre = (a, b) => Math.round((a + azar() * (b - a)) * 10) / 10;

const NOMBRES = [
  'Aguilar Romero Valeria', 'Bautista Cruz Diego', 'Campos Juárez Ximena', 'Castillo Flores Emiliano',
  'Domínguez Peña Renata', 'Espinoza Vargas Santiago', 'Flores Morales Camila', 'García Hernández Mateo',
  'Gómez Ortiz Regina', 'Hernández Luna Leonardo', 'Jiménez Ríos Sofía', 'López Mendoza Sebastián',
  'Martínez Salas Fernanda', 'Méndez Torres Iker', 'Morales Cortés Daniela', 'Navarro Ruiz Ángel',
  'Ortega Silva Mariana', 'Pérez Aguilar Gael', 'Ramírez Castro Natalia', 'Reyes Medina Joshua',
  'Rodríguez Vega Andrea', 'Sánchez León Isaac', 'Torres Guzmán Paola', 'Vázquez Soto Ian',
];
// Perfil de cada alumno: la mayoría va bien; tres encienden la alerta de riesgo.
const RIESGO = { 'Hernández Luna Leonardo': 'notas', 'Reyes Medina Joshua': 'faltas', 'Vázquez Soto Ian': 'entregas' };
const alumnos = NOMBRES.map((nombre, i) => ({
  matricula: `2026${String(i + 101).padStart(3, '0')}`, nombre, riesgo: RIESGO[nombre] ?? '',
  nivel: RIESGO[nombre] === 'notas' ? 5 : 6.8 + azar() * 3,
}));

await documento(`misGrupos/${GRUPO}`, {
  docenteUid: docente, nombre: '1º A Vespertino', asignaturaClave: 'cultura-digital-1',
  asignaturaNombre: 'Cultura Digital I', ciclo: '2026-2027', creadoEn: '2026-08-25T16:00:00.000Z', archivado: false,
  ponderacion: { examen: 30, tarea: 25, proyecto: 25, participacion: 10, asistencia: 10 },
  parciales: [
    { nombre: 'Parcial 1', inicio: '2026-08-24', fin: '2026-09-25' },
    { nombre: 'Parcial 2', inicio: '2026-09-28', fin: '2026-11-06' },
    { nombre: 'Parcial 3', inicio: '2026-11-09', fin: '2026-12-18' },
  ],
});

for (const a of alumnos) {
  await documento(`misGrupos/${GRUPO}/lista/${a.matricula}`, {
    matricula: a.matricula, nombre: a.nombre, estado: 'activo',
    cuentaUid: '', cuentaCorreo: '', actualizadoEn: '2026-08-25T16:00:00.000Z',
  });
}

// Cuaderno: columnas del parcial 1 (cerrado) y del parcial 2 (en curso).
const COLUMNAS = [
  { id: 'p1-tarea-1', nombre: 'Huella digital', tipo: 'tarea', fecha: '2026-09-02' },
  { id: 'p1-tarea-2', nombre: 'Línea del tiempo de la web', tipo: 'tarea', fecha: '2026-09-09' },
  { id: 'p1-proyecto', nombre: 'Infografía: uso seguro de redes', tipo: 'proyecto', fecha: '2026-09-18' },
  { id: 'p1-examen', nombre: 'Examen parcial 1', tipo: 'examen', fecha: '2026-09-23' },
  { id: 'p1-particip', nombre: 'Participación P1', tipo: 'participacion', fecha: '2026-09-25' },
  { id: 'p2-tarea-1', nombre: 'Las 4 libertades del software', tipo: 'tarea', fecha: '2026-09-30' },
  { id: 'p2-tarea-2', nombre: 'Comparativa GNU/Linux vs. Windows', tipo: 'tarea', fecha: '2026-10-07' },
  { id: 'p2-proyecto', nombre: 'Avance proyecto: blog del grupo', tipo: 'proyecto', fecha: '2026-10-12' },
  { id: 'p2-particip', nombre: 'Participación P2', tipo: 'participacion', fecha: '2026-10-13' },
];
for (const [orden, c] of COLUMNAS.entries()) {
  await documento(`misGrupos/${GRUPO}/columnas/${c.id}`, {
    nombre: c.nombre, tipo: c.tipo, max: 10, peso: 0, fecha: c.fecha, orden, rubrica: null, examenId: '',
  });
}
for (const a of alumnos) {
  const valores = {}, estados = {};
  for (const c of COLUMNAS) {
    const sinEntregar = a.riesgo === 'entregas' && c.id.startsWith('p2-tarea') || (azar() < 0.04 && c.tipo === 'tarea');
    if (sinEntregar) { estados[c.id] = 'no-entregado'; continue; }
    valores[c.id] = Math.min(10, Math.max(3, entre(a.nivel - 1.2, a.nivel + 1)));
    if (azar() < 0.06 && c.tipo !== 'participacion') estados[c.id] = 'tarde';
  }
  await documento(`misGrupos/${GRUPO}/notas/${a.matricula}`, { matricula: a.matricula, valores, estados, comentarios: {}, rubricas: {} });
}

// Asistencia: martes y jueves desde el inicio de semestre hasta hoy.
const sesiones = [];
for (let d = new Date('2026-08-25T12:00:00'); d <= new Date('2026-10-13T12:00:00'); d.setDate(d.getDate() + 1)) {
  if (d.getDay() === 2 || d.getDay() === 4) sesiones.push(d.toISOString().slice(0, 10));
}
for (const fecha of sesiones) {
  const marcas = {};
  for (const a of alumnos) {
    const r = azar();
    const falta = a.riesgo === 'faltas' ? r < 0.35 : r < 0.05;
    marcas[a.matricula] = falta ? (azar() < 0.2 ? 'J' : 'F') : r > 0.93 ? 'R' : 'P';
  }
  await documento(`misGrupos/${GRUPO}/asistencia/${fecha}`, { fecha, marcas, actualizadoEn: `${fecha}T20:00:00.000Z` });
}

// Diario de clase: lo que pasó realmente.
const DIARIO = {
  '2026-09-29': 'Arrancamos software libre. Les costó distinguir «gratis» de «libre»; funcionó el ejemplo de la receta de cocina que se puede copiar y modificar.',
  '2026-10-01': 'Revisamos las 4 libertades con casos (VLC, Photoshop, LibreOffice). Medio grupo no tiene computadora en casa: la tarea se hizo en papel.',
  '2026-10-06': 'Instalamos Linux Mint en una máquina virtual del laboratorio. Solo funcionaron 9 de 15 equipos; trabajamos en tercias.',
  '2026-10-08': 'Comparativa GNU/Linux vs. Windows en equipos. Buena participación; Leonardo y Joshua otra vez sin entregar.',
  '2026-10-13': 'Primer avance del blog del grupo. Varios equipos sin datos móviles para subir fotos; se acordó llevar USB.',
};
for (const [fecha, texto] of Object.entries(DIARIO)) {
  await documento(`misGrupos/${GRUPO}/diario/${fecha}`, { fecha, texto, actualizadoEn: `${fecha}T21:00:00.000Z` });
}

// Anotaciones: evidencia del seguimiento a los alumnos en riesgo.
const ANOTACIONES = [
  ['an-1', 'Hernández Luna Leonardo', '2026-10-02', 'atencion', 'Se distrae mucho con el celular; promedio bajando.'],
  ['an-2', 'Hernández Luna Leonardo', '2026-10-09', 'accion', 'Plática al final de la clase; se comprometió a entregar la comparativa.'],
  ['an-3', 'Reyes Medina Joshua', '2026-10-06', 'accion', 'Aviso a orientación por faltas; trabaja por las tardes.'],
  ['an-4', 'Campos Juárez Ximena', '2026-10-08', 'positiva', 'Ayudó a su equipo a configurar la máquina virtual.'],
];
for (const [id, nombre, fecha, tipo, texto] of ANOTACIONES) {
  const m = alumnos.find(a => a.nombre === nombre).matricula;
  await documento(`misGrupos/${GRUPO}/anotaciones/${id}`, { matricula: m, fecha, tipo, texto });
}

// Resultados de Antología (diagnóstico del módulo 1), 20 de 24 alumnos contestaron.
const EJES = ['Pensamiento computacional', 'Ciudadanía digital', 'Comunicación y colaboración'];
for (const a of alumnos.slice(0, 20)) {
  const porEje = {};
  let ok = 0;
  for (const eje of EJES) {
    const base = eje === 'Pensamiento computacional' ? 0.45 : 0.7;
    const bien = Math.max(0, Math.min(5, Math.round(5 * (base + (azar() - 0.5) * 0.5))));
    porEje[eje] = { ok: bien, total: 5 };
    ok += bien;
  }
  await documento(`misGrupos/${GRUPO}/resultados/${a.matricula}_modulo-1`, {
    matricula: a.matricula, instrumento: 'cultura-digital-1/modulo-1', titulo: 'Módulo 1 · Diagnóstico',
    aciertos: ok, total: 15, porcentaje: Math.round((ok / 15) * 100), porEje,
  });
}

// Página de clases del docente (Mi página de clases), ya con avisos y materiales.
await documento('paginasClase/jose-roberto-mendoza', {
  slug: 'jose-roberto-mendoza', docenteUid: docente, publicada: true, nombre: 'Mtro. José Roberto Mendoza',
  escuela: 'BGO Plantel de Prueba', icono: '💻', color: 'azul',
  presentacion: 'Bienvenidos a Cultura Digital. Aquí encontrarán los avisos, los materiales de cada tema y el acceso a sus exámenes.',
  materias: [{ nombre: 'Cultura Digital I', grupo: '1º A Vespertino', asignaturaClave: 'cultura-digital-1' }],
  secciones: { avisos: true, materiales: true, examenes: true, diagnostico: true, asesoria: true },
  avisos: [
    { fecha: '2026-10-14', texto: 'El jueves 16 se entrega la comparativa GNU/Linux vs. Windows. Puede ser a mano.' },
    { fecha: '2026-10-08', texto: 'Traigan una USB para guardar las fotos del blog del grupo.' },
  ],
  materiales: [
    { titulo: 'Las cuatro libertades del software libre (GNU)', url: 'https://www.gnu.org/philosophy/free-sw.es.html', tema: 'Software libre' },
    { titulo: 'Descargar LibreOffice', url: 'https://es.libreoffice.org/descarga/', tema: 'Software libre' },
    { titulo: 'Guía de privacidad en redes sociales (INAI)', url: 'https://home.inai.org.mx/', tema: 'Ciudadanía digital' },
  ],
  asesoria: 'Martes de 13:00 a 14:00 en el laboratorio de cómputo.',
  actualizadoEn: '2026-10-14T18:00:00.000Z',
});

// Perfil «Cómo doy clase» del docente demo: solo lo que se sabe de José; lo demás
// (estilo, años, internet del aula) lo contesta él en el cuestionario.
await documento(`perfiles_docentes/${docente}`, {
  userId: docente,
  nombre: 'José Roberto Mendoza',
  formacion: 'Licenciado en Cultura Física',
  materias: 'Cultura Digital I (1er semestre, Modelo Educativo 2025, 3 sesiones de 50 min por semana). Comunicación y Sociedad I (5º semestre, MCCEMS, 3 sesiones de 50 min por semana).',
  fueraPerfil: 'Las dos quedan fuera de mi formación en Cultura Física.',
  proyector: 'No es fijo: hay que apartarlo para las sesiones que lo necesitan.',
  salaComputo: 'No. El plantel no tiene aula de cómputo.',
  nuncaFalta: 'Datos duros con su fuente y una entrega concreta con rúbrica. Mis alumnos trabajan con la Antología Digital que hice para la materia.',
  evidencia: 'Productos con rúbrica: línea del tiempo, auditoría de licencias, auditoría de atención, plan de migración a software libre. Al cierre del bimestre, el portafolio con las evidencias y su autoevaluación.',
  formatoEntrega: 'Formato de planeación del BGO "Carlos Camacho Espíritu", turno vespertino: hoja oficio horizontal, sesiones de 50 min (actividades, técnica, evidencia, materiales), evaluación y referencias.',
  queRevisan: 'Autoriza la directora, Beatriz Sánchez Torres, y da el Vo.Bo. Adalberto Alejandro Molina Báez.',
  cuandoEntrega: 'Planeaciones semanales, entregadas juntas por bimestre.',
  actualizadoEn: '2026-10-14T19:00:00.000Z',
});

console.log(`✓ Grupo de demostración listo: «1º A Vespertino» · Cultura Digital I
  ${alumnos.length} alumnos · ${COLUMNAS.length} actividades · ${sesiones.length} sesiones de asistencia
  Página pública: http://localhost:3002/clase/jose-roberto-mendoza
  Entra con docente@prueba.mx / prueba123 → Mis clases`);
