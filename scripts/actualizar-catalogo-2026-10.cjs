/**
 * Actualización del catálogo curricular (29-oct-2026).
 *
 * 1. Plan 2023 (generación 2023-2026): quita texto del PDF que no es progresión
 *    (índices, introducciones, "Momento 1", sugerencias de abordaje), deja solo la
 *    primera aparición de cada número y pasa a borrador los programas sin fuente real.
 * 2. Modelo 2025 (generación 2025-2028): agrega las asignaturas extraídas de los PDF
 *    oficiales de la DGB con scripts/extraer_propositos_2025.py.
 *
 * Uso: node scripts/actualizar-catalogo-2026-10.cjs
 * Respaldo previo: data/programas_sep.backup-2026-10-29.json
 */
const fs = require('fs');
const path = require('path');
const RUTA = path.join(__dirname, '../data/programas_sep.json');
const EXTRAIDO = path.join(__dirname, '../data/extraccion/json/propositos-2025.json');
const programas = JSON.parse(fs.readFileSync(RUTA, 'utf8'));
const extraido = JSON.parse(fs.readFileSync(EXTRAIDO, 'utf8'));
const HOY = '2026-10-29';
const ETAPAS = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/extraccion/json/etapas-2023.json'), 'utf8'));

// ---------- 1. Plan 2023 ----------
const BASURA_INICIO = /^\s*(Momento \d|se (especifica|plantean) |Justificaci[oó]n|Presentaci[oó]n|Índice|Fuente:|Tabla \d|Bases y fundamentos de|Fundamento ?s de las UAC|Conceptos básicos del Área|Progresiones de Aprendizaje Las|Con (el|la) (propósito|fin|objetivo|intención) de (enganchar|motivar|iniciar|atraer|abrir|despertar|promover la (curiosidad|reflexión))|Para (captar|iniciar|enganchar|evaluar los conocimientos|estudiar cómo)|Se (puede (realizar como actividad|invitar)|recomienda|sugiere|inicia la sesión)|Es aconsejable|A partir de (las siguientes )?preguntas|El (profesorado|docente) (puede|propone)|El personal docente|Al (llevar a cabo experimentos|ayudarles)|El estudiantado puede explorar|Las preguntas de investigación pueden|El avance de la ciencia depende)/i;
const PRACTICAS = /^(Hacer preguntas y definir problemas|Desarrollar y usar modelos|Planificar y realizar investigaciones|Analizar e interpretar datos|Argumentar a partir de evidencias|Obtener, evaluar y comunicar información|Usar las matemáticas y el pensamiento computacional|Construir explicaciones|La materia y sus interacciones\.|Conservación de la energía y sus interacciones con la materia\.|Ecosistemas: interacciones|Reacciones químicas: conservación|La energía en los procesos de la vida diaria\.|Organismos: estructuras y procesos\.|(Patrones|Causa y efecto|Medición|Sistemas|Conservación, flujos|Estructura y función)\. )/i;
const limpiarTexto = t => t.replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/^\s*\.\s*/, '').replace(/\s+/g, ' ').trim();
const informe = { quitadas: [], repetidas: [], borrador: [], agregadas: [] };

for (const p of programas) {
  if (p.modelo === '2025') continue;
  const vistos = new Set();
  const limpias = [];
  for (const g of p.progresiones) {
    const d = limpiarTexto(g.descripcion);
    // "1 0 Tema: ..." es la progresión 10 mal partida por el extractor anterior
    if (g.id === 1 && /^0\s/.test(d)) { g.id = 10; g.descripcion = d.replace(/^0\s+/, ''); }
    else g.descripcion = d;
    if (BASURA_INICIO.test(g.descripcion) || /\.{6,}/.test(g.descripcion) || PRACTICAS.test(g.descripcion)) {
      informe.quitadas.push(`${p.materia} #${g.id}: ${g.descripcion.slice(0, 70)}`); continue;
    }
    if (vistos.has(g.id)) { informe.repetidas.push(`${p.materia} #${g.id}: ${g.descripcion.slice(0, 70)}`); continue; }
    vistos.add(g.id); limpias.push(g);
  }
  // Restos del extractor anterior al inicio: "Etapa de Progresión 3: ..." -> ": ...", y una "c" suelta
  for (const g of limpias) g.descripcion = g.descripcion.replace(/^(?:(?::|c)\s+|\d{1,2}\s+(?=c\s))+(?=[A-ZÁÉÍÓÚ])/, '');
  // Progresiones recuperadas del PDF con scripts/extraer_etapas_2023.cjs (texto literal).
  // En CNEYT I-VI la extracción anterior estaba revuelta: se reemplaza la lista completa.
  if (ETAPAS._reemplazar.includes(p.materia)) limpias.splice(0, limpias.length);
  for (const r of ETAPAS[p.materia] || []) {
    const existente = limpias.find(g => g.id === r.id);
    if (existente) existente.descripcion = r.descripcion;
    else limpias.push({ id: r.id, descripcion: r.descripcion, metas: [] });
  }
  p.progresiones = limpias.sort((a, b) => a.id - b.id);
  // Sin fuente oficial real, o el extractor anterior no logró leer el programa
  const sinFuente = !/\.pdf/i.test(p.url_fuente || '');
  const ilegible = /^Taller de Ciencias I$/.test(p.materia) || /^Conciencia Histórica I$/.test(p.materia);
  if (p.estado === 'oficial' && (sinFuente || ilegible || p.progresiones.length < 3)) {
    p.estado = 'borrador';
    informe.borrador.push(`${p.materia} (sem ${p.semestre}): ${sinFuente ? 'sin PDF de origen' : ilegible ? 'extracción ilegible' : 'menos de 3 progresiones'}`);
  }
}

// Organización del Flujo I (5º semestre) no estaba en el catálogo
if (!programas.some(p => p.materia === 'Organización del flujo de materia y energía en los organismos I')) {
  programas.push({
    materia: 'Organización del flujo de materia y energía en los organismos I', semestre: 5,
    metadata: { nombre_uac: 'ORGANIZACIÓN DEL FLUJO DE MATERIA Y ENERGÍA EN LOS ORGANISMOS I', semestre: 5 },
    organizador_curricular: { categorias: [], metas_aprendizaje: [] },
    progresiones: ETAPAS['Organización del flujo de materia y energía en los organismos I'].map(e => ({ ...e, metas: [] })),
    url_fuente: 'https://dgb.sep.gob.mx' + encodeURI('/storage/recursos/2025/02/Qf5BmvETdx-Organización del Flujo de Materia y Energía en los Organismos I.pdf'),
    fecha_extraccion: HOY, modelo: '2024', estado: 'oficial', extraccion: 'etapas-2023 v1: etapas de progresión del PDF oficial',
  });
  informe.agregadas.push('Organización del flujo de materia y energía en los organismos I (plan 2023, sem 5)');
}

// ---------- 2. Modelo 2025 ----------
const URL = {
  'pensamiento-matematico': '/storage/recursos/2025/09/C1rup2PyU9-MCC_PENSAMIENTO-MATEMATICO.pdf',
  'pensamiento-filosofico': '/storage/recursos/2025/09/9wAH58IzrO-MCC_PENSAMIENTO-FILOSOFICO.pdf',
  'lengua-y-comunicacion': '/storage/recursos/2025/09/JZmc8tVhnJ-MCC_LENGUA-Y-COMUNICACION.pdf',
  'ingles': '/storage/recursos/2025/09/dXnau4DE8W-MCC_INGLES.pdf',
  'cultura-digital': '/storage/recursos/2025/09/Funa9XEQmp-MCC_CULTURA-DIGITAL.pdf',
  'conciencia-historica': '/storage/recursos/2025/09/H4sa0TNb65-MCC_CONCIENCIA-HISTORICA.pdf',
  'ciencias-sociales': '/storage/recursos/2025/09/Pd0FKeX8a2-MCC_CIENCIAS-SOCIALES.pdf',
  'ciencias-naturales': '/storage/recursos/2025/09/7U6gjAhlX6-MCC_CIENCIAS-NATURALES.pdf',
  'laboratorio-investigacion': '/storage/recursos/2026/02/aZrjhrneWA-Laboratorio_de_Investigacion.pdf',
  'taller-ciencias': '/storage/recursos/2026/01/xnaOIpe1Z9-Taller-de-Ciencias-2026.pdf',
  'bioetica': '/storage/recursos/2026/08/wz32yijxhY-Bioética-mas-alla-de-lo-humano.pdf',
  'corporalidades': '/storage/recursos/2026/08/9rj8325sO5-Corporalidades-genero-y-diversidad-sexual.pdf',
  'pensamiento-literario': '/storage/recursos/2026/08/OWE7iIIcZu-Pensamiento-Literario.pdf',
};
const OPTATIVAS = new Set(['bioetica', 'corporalidades', 'pensamiento-literario']);
const EXTENDIDO = new Set(['laboratorio-investigacion', 'taller-ciencias']);

// "Inglés I (A1) To Be, or Not..." -> materia "Inglés I", subtítulo "(A1) To Be, or Not..."
function separarNombre(nombre) {
  const limpio = nombre.replace(/\.$/, '').trim();
  const m = limpio.match(/^(.*?\s(?:I|II|III|IV|V|VI))(?=\s|$)\s*(.*)$/);
  return m ? { materia: m[1].trim(), subtitulo: m[2].trim() } : { materia: limpio, subtitulo: '' };
}

const nuevos = [];
for (const [archivo, asignaturas] of Object.entries(extraido)) {
  for (const a of asignaturas) {
    if (!a.propositos.length || !a.semestre) continue;
    const { materia, subtitulo } = separarNombre(a.nombre || '');
    const horas = Number((a.horas || '').match(/\d+/)?.[0]) || undefined;
    const meta = a.meta ? [a.meta] : [];
    nuevos.push({
      materia, semestre: a.semestre,
      metadata: {
        nombre_uac: materia.toUpperCase(), semestre: a.semestre, horas_semanales: horas, subtitulo,
        componente: OPTATIVAS.has(archivo) ? 'Fundamental extendido (optativa)' : EXTENDIDO.has(archivo) ? 'Fundamental extendido obligatorio' : 'Currículum fundamental',
      },
      organizador_curricular: { categorias: [], metas_aprendizaje: meta, propositos_formativos: a.propositos.map(p => p.descripcion) },
      progresiones: a.propositos.map(p => ({ id: p.id, descripcion: p.descripcion, metas: meta, tematicas: p.contenidos.filter(Boolean) })),
      url_fuente: 'https://dgb.sep.gob.mx' + encodeURI(URL[archivo]),
      fecha_extraccion: HOY, modelo: '2025', estado: 'oficial',
      extraccion: `propositos-2025 v1: tabla ${a.titulo_tabla?.match(/Tabla \d+/)?.[0] || ''}, página ${a.pagina} del PDF oficial`,
    });
  }
}
// Las asignaturas nuevas reemplazan a cualquier registro 2025 con el mismo nombre y semestre
const clave = p => `${p.materia.toLowerCase()}|${p.semestre}|${p.modelo}`;
const nuevasClaves = new Set(nuevos.map(clave));
const resultado = programas.filter(p => !nuevasClaves.has(clave(p))).concat(nuevos);
informe.agregadas.push(...nuevos.map(p => `${p.materia} (sem ${p.semestre}): ${p.progresiones.length} propósitos`));

fs.writeFileSync(RUTA, JSON.stringify(resultado, null, 2) + '\n');
console.log(`Plan 2023: ${informe.quitadas.length} textos que no eran progresión, ${informe.repetidas.length} repetidas, ${informe.borrador.length} a borrador`);
informe.borrador.forEach(l => console.log('  borrador:', l));
console.log(`Modelo 2025: ${nuevos.length} asignaturas oficiales agregadas`);
informe.agregadas.forEach(l => console.log('  +', l));
fs.writeFileSync(path.join(__dirname, '../data/extraccion/_informe-catalogo-2026-10.json'), JSON.stringify(informe, null, 2));
