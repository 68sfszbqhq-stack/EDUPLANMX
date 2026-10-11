/**
 * Lee la primera hoja de un archivo de Excel (.xlsx) y la devuelve como texto
 * separado por tabuladores, igual que si el docente la hubiera copiado y pegado.
 * Así hay un solo camino para leer listas (leerLista en grupos/model.ts).
 *
 * Un .xlsx es un ZIP con XML adentro; se abre con jszip, que ya usa el proyecto,
 * en vez de sumar una librería de hojas de cálculo entera. Solo se leen textos y
 * números: fórmulas, formatos y celdas combinadas no importan para una lista.
 */
import JSZip from 'jszip';

const entidades: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decodificar = (s: string) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) =>
  e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : entidades[e] ?? m);

/** Junta todos los <t> de un fragmento (texto enriquecido trae varios). */
const textos = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(m => decodificar(m[1])).join('');

/** "C12" → 2 */
function columnaDe(ref: string): number {
  const letras = ref.replace(/\d+/g, '');
  let n = 0;
  for (const ch of letras.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export async function leerExcel(datos: ArrayBuffer | Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(datos);

  // La primera hoja según el libro (no siempre se llama sheet1.xml).
  let rutaHoja = 'xl/worksheets/sheet1.xml';
  const libro = await zip.file('xl/workbook.xml')?.async('string');
  const rels = await zip.file('xl/_rels/workbook.xml.rels')?.async('string');
  const rid = libro?.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1];
  if (rid && rels) {
    const destino = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map(m => m[0]).find(r => r.includes(`Id="${rid}"`))?.match(/Target="([^"]+)"/)?.[1];
    if (destino) rutaHoja = destino.startsWith('/') ? destino.slice(1) : `xl/${destino}`;
  }
  const hoja = await zip.file(rutaHoja)?.async('string');
  if (!hoja) throw new Error('No encontré ninguna hoja en el archivo de Excel.');

  const compartidos = await zip.file('xl/sharedStrings.xml')?.async('string');
  const cadenas = compartidos ? [...compartidos.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => textos(m[1])) : [];

  const lineas: string[] = [];
  for (const fila of hoja.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const celdas: string[] = [];
    for (const c of fila[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1], dentro = c[2] ?? '';
      const ref = attrs.match(/\br="([A-Z]+\d+)"/)?.[1];
      const tipo = attrs.match(/\bt="(\w+)"/)?.[1];
      const v = dentro.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let valor = '';
      if (tipo === 's' && v !== undefined) valor = cadenas[Number(v)] ?? '';
      else if (tipo === 'inlineStr') valor = textos(dentro);
      else if (v !== undefined) valor = decodificar(v);
      const k = ref ? columnaDe(ref) : celdas.length;
      while (celdas.length < k) celdas.push('');
      celdas[k] = valor.replace(/[\t\r\n]+/g, ' ').trim();
    }
    lineas.push(celdas.join('\t'));
  }
  return lineas.join('\n');
}
