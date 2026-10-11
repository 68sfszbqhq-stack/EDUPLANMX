// Carga datos SINTÉTICOS en el simulador local de Firebase (npm run emulador).
// Solo habla con 127.0.0.1: no puede tocar ninguna base en la nube.
//
//   node scripts/sembrar-emulador.mjs
//
// Deja listo:
//   docente@prueba.mx / prueba123      → EduPlan v2 (docente con escuela)
//   matrícula 2024001 / código ABC234  → Antología v2 (alumno, entra sin Google)
//   módulos 1 a 8 de Antología abiertos
const PROYECTO = 'eduplanmx-pruebas';
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
const FS = `http://127.0.0.1:8080/v1/projects/${PROYECTO}/databases/(default)/documents`;

function valor(v) {
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Number.isInteger(v)) return { integerValue: String(v) };
  if (typeof v === 'number') return { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(valor) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, valor(x)])) } };
}

async function cuenta(email, password) {
  const r = await fetch(`${AUTH}/accounts:signUp?key=simulador`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const d = await r.json();
  if (d.localId) return d.localId;
  if (d.error?.message === 'EMAIL_EXISTS') {
    const s = await fetch(`${AUTH}/accounts:signInWithPassword?key=simulador`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    return (await s.json()).localId;
  }
  throw new Error(`No pude crear ${email}: ${JSON.stringify(d)}`);
}

async function documento(ruta, datos) {
  const r = await fetch(`${FS}/${ruta}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, valor(v)])) }),
  });
  if (!r.ok) throw new Error(`No pude escribir ${ruta}: ${await r.text()}`);
}

try {
  await fetch('http://127.0.0.1:8080/');
} catch {
  console.error('✗ El simulador no está corriendo. Arráncalo con: npm run emulador');
  process.exit(1);
}

const docente = await cuenta('docente@prueba.mx', 'prueba123');
await documento('schools/escuela-prueba', { nombre: 'BGO Plantel de Prueba', cct: '21EBH0000X', municipio: 'Puebla' });
await documento(`users/${docente}`, {
  email: 'docente@prueba.mx', nombre: 'Docente', apellidoPaterno: 'De Prueba', rol: 'maestro', activo: true,
  schoolId: 'escuela-prueba', schoolName: 'BGO Plantel de Prueba', puesto: 'Docente',
  materias: ['Cultura Digital I'], grados: ['1'], onboardingCompleto: true,
});

// Alumno con matrícula y código, como los da de alta scripts/alta-alumnos.mjs en Antología.
const alumno = await cuenta('2024001@antologia.local', 'ABC234');
await documento(`cuentasAlumno/${alumno}`, { matricula: '2024001', nombre: 'Pérez López Ana', grupo: '1º A Vesp', activo: true });
await documento('config/modulos', { abiertos: [1, 2, 3, 4, 5, 6, 7, 8] });

console.log(`✓ Simulador listo
  EduPlan v2   → docente@prueba.mx / prueba123
  Antología v2 → matrícula 2024001 / código ABC234`);
