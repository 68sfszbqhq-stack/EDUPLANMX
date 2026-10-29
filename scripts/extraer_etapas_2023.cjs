/**
 * Extrae las "Etapas de progresión" de un programa 2023-2026 de la DGB a partir del
 * texto de pdftotext (sin -layout). Se usa para los programas que el extractor
 * automático anterior no logró leer.
 * Uso: node scripts/extraer_etapas_2023.cjs <archivo.txt>
 */
const fs = require('fs');
function extraerEtapas(texto) {
  const lineas = texto.split('\n');
  const etapas = new Map();
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(/^Etapa de progresi[oó]n (\d+)\s*[:.]\s*(.*)$/i);
    if (!m || etapas.has(+m[1])) continue;
    const partes = [m[2]];
    for (let j = i + 1; j < lineas.length; j++) {
      const l = lineas[j].trim();
      if (!l || /^(Concepto central|Conceptos? transversal|Metas|Sugerencia|Categor|\d+)$/i.test(l) || /^(Concepto central|Metas de)/i.test(l)) break;
      partes.push(l);
    }
    etapas.set(+m[1], partes.join(' ').replace(/-\s+(?=[a-záéíóúñ])/g, '').replace(/\s+/g, ' ').trim());
  }
  return [...etapas].map(([id, descripcion]) => ({ id, descripcion }));
}
module.exports = { extraerEtapas };
if (require.main === module) console.log(JSON.stringify(extraerEtapas(fs.readFileSync(process.argv[2], 'utf8')), null, 1));

/** CNEYT I-VI (plan 2023): la progresión es el párrafo justo antes de "CONCEPTO CENTRAL:". Usa pdftotext -layout. */
function extraerCNEYT(texto) {
  const lineas = texto.split('\n');
  const vistas = [];
  for (let i = 0; i < lineas.length; i++) {
    if (!/^\s*CONCEPTO CENTRAL:/i.test(lineas[i])) continue;
    const partes = [];
    for (let j = i - 1; j >= 0; j--) {
      const l = lineas[j].trim();
      if (!l && !partes.length) continue;
      if (!l || /^\d{1,3}$/.test(l) || /^ETAPA DE PROGRESI[OÓ]N$/i.test(l)) break;
      partes.unshift(l);
    }
    // La letra decorativa "C" del diseño se cuela suelta entre palabras
    const d = partes.join(' ').replace(/-\s+(?=[a-záéíóúñ])/g, '').replace(/\s+/g, ' ').replace(/\s[Cc](?=\s[a-záéíóúñ])|\s[Cc]$/g, '').trim();
    if (d && vistas[vistas.length - 1] !== d) vistas.push(d);
  }
  return vistas.map((descripcion, i) => ({ id: i + 1, descripcion }));
}
module.exports.extraerCNEYT = extraerCNEYT;
