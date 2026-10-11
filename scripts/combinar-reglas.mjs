// Une las reglas de EduPlan v2 y Antología v2 en un solo archivo.
//
// Las dos versiones 2 comparten la base "eduplanmx-pruebas", y un proyecto de
// Firebase solo tiene UN archivo de reglas: si cada app publicara el suyo, el
// último borraría al otro. Cada app conserva su firestore.rules (y sus pruebas);
// lo que se publica en pruebas es firestore.pruebas.rules, generado aquí.
//
//   node scripts/combinar-reglas.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const APERTURA = 'match /databases/{database}/documents {';
const CIERRE = /\n\s*match \/\{document=\*\*\} \{[\s\S]*$/;

function cuerpo(ruta) {
  const t = readFileSync(ruta, 'utf8');
  const i = t.indexOf(APERTURA);
  if (i < 0) throw new Error(`No encontré "${APERTURA}" en ${ruta}`);
  const resto = t.slice(i + APERTURA.length);
  if (!CIERRE.test(resto)) throw new Error(`No encontré el bloque final de denegar en ${ruta}`);
  return resto.replace(CIERRE, '\n');
}

const eduplan = cuerpo('firestore.rules');
const antologia = cuerpo('../antologia-v2/firestore.rules');

writeFileSync('firestore.pruebas.rules', `// GENERADO por scripts/combinar-reglas.mjs — no editar a mano.
// Reglas del proyecto compartido "eduplanmx-pruebas": EduPlan v2 + Antología v2.
rules_version = '2';
service cloud.firestore {
  ${APERTURA}
    // ===================== EduPlan v2 =====================
${eduplan}
    // ===================== Antología v2 =====================
${antologia}
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`);
console.log('✓ firestore.pruebas.rules generado');
