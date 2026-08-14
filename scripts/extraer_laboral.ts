/**
 * Extractor de los programas de Formación Laboral Básica de la DGB.
 *
 * POR QUÉ EXISTE
 * El extractor general (scripts/extractor_mccems.py) busca progresiones y metas de
 * aprendizaje, que son del Currículum Fundamental. Los programas laborales no tienen
 * ninguna de las dos: usan Módulo → Submódulo → Competencia Laboral Básica →
 * Actividad clave. Por eso los 18 programas laborales quedaron extraídos en vacío
 * (o con basura interpretada como progresiones) sin que nada tronara.
 *
 * USO
 *   npm run extraer:laboral              # todos
 *   npm run extraer:laboral -- turismo   # solo los que casen con ese texto
 *
 * Salida: data/extraccion/laboral/<slug>.json + _reporte.md
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
import type {
    ProgramaLaboral, ModuloLaboral, SubmoduloLaboral,
    EvidenciaEvaluacion, IndicadorEvaluacion, CriterioRubrica, CalidadExtraccion,
} from '../types/formacionLaboral';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_PDFS = resolve(raiz, 'data/pdfs_dgb');
const DIR_SALIDA = resolve(raiz, 'data/extraccion/laboral');
const DIR_JSON_EXISTENTE = resolve(raiz, 'data/extraccion/json');

// ─── Limpieza del texto ──────────────────────────────────────────────

/**
 * pdf-parse intercala marcadores de página ("-- 16 of 43 --") y deja el número de
 * página suelto al inicio de cada una. Si no se quitan, se cuelan a media frase y
 * ensucian las actividades clave, que son textos largos.
 */
function limpiar(texto: string): string {
    return texto
        .replace(/--\s*\d+\s+of\s+\d+\s*--/g, ' ')
        .replace(/\s+/g, ' ')
        // El PDF parte palabras con guion al final de renglón ("COMPORTA- MIENTO ÉTICO").
        // Sin esto, los nombres de criterio salen cortados. Los guiones legítimos del
        // español no llevan espacio después ("teórico-práctico"), así que no se tocan.
        .replace(/(\p{L})-\s+(\p{L})/gu, '$1$2')
        .trim();
}

/** Quita el índice: sus renglones traen puntos de relleno ("Módulo 1......... 13"). */
function quitarIndice(texto: string): string {
    const finIndice = texto.lastIndexOf('...');
    return finIndice > 0 ? texto.slice(finIndice) : texto;
}

const limpiarCampo = (s: string) =>
    s.replace(/\s+/g, ' ').replace(/^[\s.·●-]+/, '').trim();

// ─── Extracción de los indicadores de evaluación ─────────────────────

/**
 * Del bloque de evidencia saca el instrumento oficial de evaluación.
 *
 * Los programas laborales usan DOS instrumentos y hay que reconocer los dos:
 *   - lista de cotejo: "No. Indicadores Sí No Observaciones  1 … 2 …  Total:"
 *   - rúbrica:         "CRITERIOS ÓPTIMO ADECUADO SUFICIENTE DEBE MEJORAR  ANÁLISIS (20 puntos) …"
 * Un submódulo puede traer más de una evidencia.
 */
/**
 * Nombres de nivel de desempeño que usan los programas de la DGB.
 *
 * Hacen falta porque en el PDF la rúbrica es una tabla: al pasarla a texto, los
 * nombres de los niveles quedan pegados al primer criterio y todos van en mayúsculas
 * ("ÓPTIMO ADECUADO SUFICIENTE DEBE MEJORAR PARTICIPACIÓN (20 puntos)"). Sin una
 * lista no hay forma de saber dónde acaban los niveles y dónde empieza el criterio.
 * Si aparece un nivel que no esté aquí, se queda pegado al nombre del criterio y el
 * reporte lo deja ver.
 */
const NIVELES_CONOCIDOS = [
    'DEBE MEJORAR', 'EN PROCESO', 'POR DESARROLLAR', 'NO SATISFACTORIO',
    'MUY BUENO', 'SOBRESALIENTE', 'ÓPTIMO', 'OPTIMO', 'ADECUADO', 'SUFICIENTE',
    'INSUFICIENTE', 'EXCELENTE', 'DESTACADO', 'SATISFACTORIO', 'BUENO', 'REGULAR',
    'DEFICIENTE', 'BÁSICO', 'BASICO', 'INICIAL', 'AVANZADO', 'COMPETENTE', 'NOTABLE',
];

/**
 * Encuentra el encabezado de niveles de una rúbrica o escala.
 *
 * Es el ancla común a todos los formatos: los programas escriben la tabla de muy
 * distintas maneras ("CRITERIOS ÓPTIMO…", "RÚBRICA DE EVALUACIÓN Criterios
 * Sobresaliente…", "Criterio a valuar Desempeño Sobresaliente…", "Rasgos para tomar
 * en cuenta: Sobresaliente…"), pero todos enumeran seguidos tres o más niveles de
 * desempeño. Buscar la corrida de niveles evita tener un patrón por programa.
 */
function buscarEncabezadoNiveles(texto: string, desde = 0): { inicio: number; fin: number; niveles: string[] } | null {
    const alterna = NIVELES_CONOCIDOS
        .slice()
        .sort((a, b) => b.length - a.length)
        .map(n => n.replace(/ /g, '\\s+'))
        .join('|');
    const re = new RegExp(`(?:${alterna})(?:\\s*[,/·|-]?\\s*(?:${alterna})){2,}`, 'gi');
    re.lastIndex = desde;
    const m = re.exec(texto);
    if (!m) return null;

    const reUno = new RegExp(`(?:${alterna})`, 'gi');
    const niveles = (m[0].match(reUno) || []).map(s => s.replace(/\s+/g, ' ').trim());
    return { inicio: m.index, fin: m.index + m[0].length, niveles };
}

/**
 * Separa el prefijo de niveles pegado al nombre del primer criterio.
 * Devuelve los niveles hallados y lo que queda como nombre real del criterio.
 */
function separarNiveles(nombre: string): { niveles: string[]; criterio: string } {
    const niveles: string[] = [];
    let resto = nombre.trim();
    let hubo = true;
    while (hubo) {
        hubo = false;
        for (const nivel of NIVELES_CONOCIDOS) {
            if (resto.toUpperCase().startsWith(nivel + ' ') || resto.toUpperCase() === nivel) {
                niveles.push(resto.slice(0, nivel.length));
                resto = resto.slice(nivel.length).trim();
                hubo = true;
                break;
            }
        }
    }
    return { niveles, criterio: resto || nombre };
}

/**
 * Localiza los criterios de una rúbrica: los que llevan "(N puntos)".
 *
 * Se busca el paréntesis y se retrocede, porque el nombre del criterio no tiene una
 * forma fija: unos programas lo escriben en MAYÚSCULAS ("ANÁLISIS (20 puntos)") y
 * otros en texto normal ("Selección y comprensión de la empresa. (10 puntos)").
 * Lo que sí es constante es que el nombre queda entre el final de la descripción
 * anterior —que cierra en punto— y el paréntesis.
 */
function posicionesDeCriterios(texto: string): Array<{ nombre: string; puntos: number; inicioNombre: number; finParentesis: number }> {
    const salida: Array<{ nombre: string; puntos: number; inicioNombre: number; finParentesis: number }> = [];
    const re = /\(\s*(\d+)\s*puntos?\s*\)/gi;
    let m: RegExpExecArray | null;
    let finAnterior = 0;

    while ((m = re.exec(texto)) !== null) {
        const antes = texto.slice(finAnterior, m.index);

        // Caso MAYÚSCULAS: el nombre es la corrida de mayúsculas pegada al paréntesis.
        const PALABRA = '[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ/]*';
        const NEXO = '(?:y|e|o|u|de|del|la|las|los|el|en|con|para|a)';
        const mayus = antes.match(new RegExp(`(${PALABRA}(?:\\s+(?:${NEXO}\\s+)?${PALABRA})*)\\s*\\.?\\s*$`));

        let nombre: string;
        let desplazamiento: number;
        if (mayus && mayus[1].length >= 4) {
            nombre = mayus[1].trim();
            desplazamiento = mayus.index!;
        } else {
            // Caso texto normal: el nombre va tras el último punto de la descripción
            // anterior. Se descarta el punto final del propio nombre antes de buscar.
            const sinPuntoFinal = antes.replace(/\s*\.\s*$/, '');
            const ultimoPunto = sinPuntoFinal.lastIndexOf('.');
            const candidato = sinPuntoFinal.slice(ultimoPunto + 1).trim();
            if (!candidato || candidato.length < 4 || candidato.length > 120) {
                finAnterior = m.index + m[0].length;
                continue;
            }
            nombre = candidato;
            desplazamiento = sinPuntoFinal.length - candidato.length;
        }

        salida.push({
            nombre: nombre.replace(/\s*\.\s*$/, '').trim(),
            puntos: parseInt(m[1], 10),
            inicioNombre: finAnterior + desplazamiento,
            finParentesis: m.index + m[0].length,
        });
        finAnterior = m.index + m[0].length;
    }
    return salida;
}

function extraerEvidencias(bloque: string): EvidenciaEvaluacion[] {
    type Marca = { pos: number; fin: number; tipo: 'lista-cotejo' | 'rubrica'; encabezado: string };
    const marcas: Marca[] = [];
    let m: RegExpExecArray | null;

    const reLista = /No\.?\s*Indicadores\s*S[ií]\s*No\s*Observaciones/gi;
    while ((m = reLista.exec(bloque)) !== null) {
        marcas.push({ pos: m.index, fin: m.index + m[0].length, tipo: 'lista-cotejo', encabezado: m[0] });
    }
    // Rúbricas y escalas: el ancla es la corrida de niveles de desempeño, que es lo
    // único común a todos los formatos. Ver buscarEncabezadoNiveles.
    let cursor = 0;
    for (;;) {
        const enc = buscarEncabezadoNiveles(bloque, cursor);
        if (!enc) break;
        cursor = enc.fin;
        // Si cae dentro de una lista de cotejo ya detectada, no es una tabla aparte.
        const dentroDeLista = marcas.some(mk => mk.tipo === 'lista-cotejo' && enc.inicio > mk.pos && enc.inicio < mk.fin + 40);
        if (dentroDeLista) continue;
        marcas.push({ pos: enc.inicio, fin: enc.fin, tipo: 'rubrica', encabezado: enc.niveles.join('|') });
    }

    marcas.sort((a, b) => a.pos - b.pos);
    if (!marcas.length) return [];

    return marcas.map((marca, idx) => {
        const hasta = idx + 1 < marcas.length ? marcas[idx + 1].pos : bloque.length;
        let trozo = bloque.slice(marca.fin, hasta);
        const corte = trozo.search(/Total\s*:/i);
        if (corte > 0) trozo = trozo.slice(0, corte);

        if (marca.tipo === 'rubrica') {
            const niveles = marca.encabezado.split('|').filter(Boolean);
            const hits = posicionesDeCriterios(trozo);
            const criterios: CriterioRubrica[] = hits.map((h, i) => ({
                // El primer nombre puede traer pegados los niveles cuando van en mayúsculas.
                criterio: i === 0 ? separarNiveles(h.nombre).criterio : h.nombre,
                puntos: h.puntos,
                // La descripción va del cierre del paréntesis al nombre del criterio siguiente.
                descripcionNiveles: limpiarCampo(
                    trozo.slice(h.finParentesis, i + 1 < hits.length ? hits[i + 1].inicioNombre : trozo.length)
                ),
            }));

            // Sin criterios puntuados es una escala de estimación: sus rasgos van
            // numerados ("1.- El diseño de la imagen es…").
            if (!criterios.length) {
                const rasgos = [...trozo.matchAll(/(?:^|\s)(\d{1,2})\s*[.\-–)]+\s*([^\d]{6,300}?)(?=\s+\d{1,2}\s*[.\-–)]|$)/g)];
                const indicadores: IndicadorEvaluacion[] = [];
                let esperado = 1;
                for (const r of rasgos) {
                    if (parseInt(r[1], 10) !== esperado) continue;
                    const texto = limpiarCampo(r[2]);
                    if (texto.length < 6) continue;
                    indicadores.push({ numero: esperado, texto });
                    esperado++;
                }
                if (indicadores.length) {
                    return {
                        nombre: `Escala de estimación (${indicadores.length} rasgos)`,
                        tipoInstrumento: 'rubrica' as const,
                        indicadores,
                        niveles,
                        criterios: [],
                    };
                }
            }

            return {
                nombre: criterios.length ? `Rúbrica (${criterios.length} criterios)` : `Evidencia ${idx + 1}`,
                tipoInstrumento: 'rubrica' as const,
                indicadores: [],
                niveles,
                criterios,
            };
        }

        // Lista de cotejo. Si el programa nombra la evidencia, va antes del "1".
        const primer = trozo.search(/(?:^|\s)1\s+\S/);
        const nombre = primer > 0 ? limpiarCampo(trozo.slice(0, primer)) : '';

        const indicadores: IndicadorEvaluacion[] = [];
        if (primer >= 0) {
            // Los indicadores van numerados de corrido: se corta solo en el número que
            // continúa la secuencia, porque los textos también traen cifras.
            const partes = trozo.slice(primer).split(/(?=(?:^|\s)\d{1,2}\s+[A-ZÁÉÍÓÚÑ¿"(])/);
            let esperado = 1;
            for (const parte of partes) {
                const mm = parte.trim().match(/^(\d{1,2})\s+([\s\S]+)$/);
                if (!mm || parseInt(mm[1], 10) !== esperado) continue;
                const texto = limpiarCampo(mm[2]);
                if (texto.length < 4) continue;
                indicadores.push({ numero: esperado, texto });
                esperado++;
            }
        }

        return {
            nombre: nombre || `Evidencia ${idx + 1}`,
            tipoInstrumento: 'lista-cotejo' as const,
            indicadores,
            niveles: [],
            criterios: [],
        };
    }).filter(e => e.indicadores.length > 0 || e.criterios.length > 0);
}

// ─── Extracción de submódulos ────────────────────────────────────────

// El PDF alterna "Nombre del módulo" y "Nombre del submódulo" dentro del mismo
// documento, y "Propósito"/"Propósitos". Los patrones lo contemplan.
const NOMBRE_Y_HORAS =
    /Nombre\s+del\s+subm[óo]dulo\s+Horas\s+de\s+Mediaci[óo]n\s+Docente\s+Horas\s+de\s+Estudio\s+Independiente\s+([\s\S]+?)\s+(\d{1,3})\s+(\d{1,3})\s+/i;
const NOMBRE_Y_HORAS_MOD =
    /Nombre\s+del\s+(?:sub)?m[óo]dulo\s+Horas\s+de\s+Mediaci[óo]n\s+Docente\s+Horas\s+de\s+Estudio\s+Independiente\s+([\s\S]+?)\s+(\d{1,3})\s+(\d{1,3})\s+/i;

function extraerSubmodulos(bloqueModulo: string, avisos: string[], ctx: string): SubmoduloLaboral[] {
    const submodulos: SubmoduloLaboral[] = [];

    const re = /Subm[óo]dulo\s+(\d+)/g;
    const marcas: Array<{ num: number; pos: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(bloqueModulo)) !== null) {
        marcas.push({ num: parseInt(m[1], 10), pos: m.index });
    }

    marcas.forEach((marca, i) => {
        const fin = i + 1 < marcas.length ? marcas[i + 1].pos : bloqueModulo.length;
        const bloque = bloqueModulo.slice(marca.pos, fin);

        // Solo es un submódulo real si declara su competencia laboral básica;
        // así se descartan las menciones sueltas del texto introductorio.
        const iComp = bloque.search(/Competencia\s+Laboral\s+B[áa]sica\s+a\s+desarrollar/i);
        if (iComp < 0) return;

        const encabezado = bloque.slice(0, iComp);
        const mh = encabezado.match(NOMBRE_Y_HORAS) || encabezado.match(NOMBRE_Y_HORAS_MOD);
        if (!mh) avisos.push(`${ctx} submódulo ${marca.num}: no se pudieron leer nombre y horas`);

        const resto = bloque.slice(iComp).replace(/^Competencia\s+Laboral\s+B[áa]sica\s+a\s+desarrollar\s*/i, '');

        const iAct = resto.search(/Actividad\s+clave/i);
        const competencia = limpiarCampo(iAct > 0 ? resto.slice(0, iAct) : resto);

        let actividadClave = '';
        let bloqueEvidencia = '';
        if (iAct >= 0) {
            const trasActividad = resto.slice(iAct).replace(/^Actividad\s+clave\s*/i, '');
            const iEvi = trasActividad.search(/Evidencia\s+de\s+evaluaci[óo]n/i);
            actividadClave = limpiarCampo(iEvi > 0 ? trasActividad.slice(0, iEvi) : trasActividad);
            if (iEvi >= 0) bloqueEvidencia = trasActividad.slice(iEvi);
        } else {
            avisos.push(`${ctx} submódulo ${marca.num}: sin actividad clave`);
        }

        const evidencias = extraerEvidencias(bloqueEvidencia);
        if (!evidencias.length) avisos.push(`${ctx} submódulo ${marca.num}: sin indicadores de evaluación`);

        submodulos.push({
            numero: marca.num,
            nombre: mh ? limpiarCampo(mh[1]) : '',
            horasMediacionDocente: mh ? parseInt(mh[2], 10) : 0,
            horasEstudioIndependiente: mh ? parseInt(mh[3], 10) : 0,
            competenciaLaboralBasica: competencia,
            actividadClave,
            evidencias,
        });
    });

    return submodulos;
}

// ─── Extracción del programa completo ────────────────────────────────

function extraerPrograma(texto: string, slug: string, nombre: string): ProgramaLaboral {
    const avisos: string[] = [];
    const cuerpo = quitarIndice(limpiar(texto));

    const clave = texto.match(/Clave\s*:\s*([\d-]+)/i)?.[1];

    // Los módulos reales declaran su propósito; los del índice no.
    const re = /(?<!Sub)M[óo]dulo\s+(\d+)/g;
    const marcas: Array<{ num: number; pos: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(cuerpo)) !== null) marcas.push({ num: parseInt(m[1], 10), pos: m.index });

    const modulos: ModuloLaboral[] = [];
    marcas.forEach((marca, i) => {
        const fin = i + 1 < marcas.length ? marcas[i + 1].pos : cuerpo.length;
        const bloque = cuerpo.slice(marca.pos, fin);

        const iProp = bloque.search(/Prop[óo]sitos?\s+del\s+m[óo]dulo/i);
        if (iProp < 0) return; // mención suelta, no un módulo

        const mh = bloque.slice(0, iProp).match(NOMBRE_Y_HORAS_MOD);
        if (!mh) avisos.push(`Módulo ${marca.num}: no se pudieron leer nombre y horas`);

        const trasProp = bloque.slice(iProp).replace(/^Prop[óo]sitos?\s+del\s+m[óo]dulo\s*/i, '');
        const iSub = trasProp.search(/Subm[óo]dulo\s+\d+/);
        const proposito = limpiarCampo(iSub > 0 ? trasProp.slice(0, iSub) : trasProp);

        const submodulos = extraerSubmodulos(bloque, avisos, `Módulo ${marca.num}`);

        // El mapa de la formación, al inicio del programa, también enumera los módulos
        // y a veces arrastra un "Propósito del módulo" cercano. Un módulo real siempre
        // trae submódulos; sin ellos es una mención del mapa, no el módulo.
        if (!submodulos.length && !mh) return;

        modulos.push({
            numero: marca.num,
            nombre: mh ? limpiarCampo(mh[1]) : '',
            horasMediacionDocente: mh ? parseInt(mh[2], 10) : 0,
            horasEstudioIndependiente: mh ? parseInt(mh[3], 10) : 0,
            proposito,
            submodulos,
        });
    });

    if (!modulos.length) avisos.push('No se encontró ningún módulo');

    // La calidad mide la ESTRUCTURA CURRICULAR, que es lo que hace falta para planear.
    // Los instrumentos de evaluación se reportan por separado: cada programa maqueta
    // esa tabla a su manera y la cobertura es parcial por diseño, no por descuido.
    const todos = modulos.flatMap(mo => mo.submodulos);
    const totalSub = todos.length;
    const completos = todos.filter(s =>
        s.actividadClave.length > 80 &&
        s.competenciaLaboralBasica.length > 40 &&
        s.horasMediacionDocente > 0 &&
        s.nombre.length > 2
    ).length;
    const modulosCompletos = modulos.filter(mo => mo.proposito.length > 30 && mo.nombre.length > 2).length;

    const conInstrumento = todos.filter(
        s => s.evidencias.some(e => e.indicadores.length > 0 || e.criterios.length > 0)
    ).length;

    let calidad: CalidadExtraccion = 'FALLIDA';
    if (modulos.length >= 4 && totalSub >= 6 && completos === totalSub && modulosCompletos === modulos.length) {
        calidad = 'BUENA';
    } else if (modulos.length > 0 && completos > 0) {
        calidad = 'PARCIAL';
    }

    todos.forEach((s, i) => {
        if (s.actividadClave.length <= 80) avisos.push(`Submódulo #${i + 1} (${s.nombre}): actividad clave incompleta`);
    });

    const generacion = slug.match(/(\d{4}-\d{4})/)?.[1] || '2023-2026';

    return {
        nombre,
        slug,
        clave,
        generacion,
        semestres: [3, 4, 5, 6],
        modulos,
        calidadExtraccion: calidad,
        coberturaInstrumentos: { conInstrumento, total: totalSub },
        avisos,
        extraidoEl: new Date().toISOString(),
    };
}

// ─── Programa principal ──────────────────────────────────────────────

/** Los programas laborales ya venían identificados por el extractor anterior. */
function slugsLaborales(): Array<{ slug: string; nombre: string; url?: string }> {
    const out: Array<{ slug: string; nombre: string; url?: string }> = [];
    for (const f of readdirSync(DIR_JSON_EXISTENTE)) {
        if (!f.endsWith('.json')) continue;
        const d = JSON.parse(readFileSync(resolve(DIR_JSON_EXISTENTE, f), 'utf8'));
        if (d.componente === 'laboral') out.push({ slug: d.slug, nombre: d.nombre, url: d.url });
    }
    return out.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

async function main() {
    const filtro = process.argv[2]?.toLowerCase();
    mkdirSync(DIR_SALIDA, { recursive: true });

    let programas = slugsLaborales();
    if (filtro) programas = programas.filter(p => p.slug.includes(filtro) || p.nombre.toLowerCase().includes(filtro));

    if (!programas.length) {
        console.error('No se encontraron programas laborales' + (filtro ? ` que casen con "${filtro}"` : ''));
        process.exit(1);
    }

    console.log(`Extrayendo ${programas.length} programa(s) de Formación Laboral…\n`);
    const resultados: ProgramaLaboral[] = [];

    for (const { slug, nombre, url } of programas) {
        const rutaPdf = resolve(DIR_PDFS, `${slug}.pdf`);
        if (!existsSync(rutaPdf)) {
            console.log(`  OMITIDO  ${nombre} (no está el PDF)`);
            continue;
        }

        const parser = new PDFParse({ data: readFileSync(rutaPdf) });
        const { text } = await parser.getText();
        await parser.destroy();

        const programa = extraerPrograma(text, slug, nombre);
        programa.urlFuente = url;
        resultados.push(programa);

        writeFileSync(resolve(DIR_SALIDA, `${slug}.json`), JSON.stringify(programa, null, 2), 'utf8');

        const ci = programa.coberturaInstrumentos;
        console.log(
            `  ${programa.calidadExtraccion.padEnd(8)} ${nombre.padEnd(48)} ` +
            `${programa.modulos.length} módulos · ${ci.total} submódulos · ` +
            `instrumentos ${ci.conInstrumento}/${ci.total}`
        );
    }

    // Reporte
    const lineas = [
        '# Extracción de programas de Formación Laboral Básica',
        '',
        `Generado el ${new Date().toLocaleDateString('es-MX')} con \`npm run extraer:laboral\`.`,
        '',
        'Estructura extraída: Módulo → Submódulo → Competencia Laboral Básica → Actividad clave',
        '→ instrumento de evaluación oficial.',
        '',
        '**Calidad** mide la estructura curricular, que es lo que hace falta para planear',
        'y lo que revisa la asesoría técnico-pedagógica.',
        '',
        '**Instrumentos** se mide aparte: cada programa maqueta su tabla de evaluación a su',
        'manera (lista de cotejo, rúbrica en mayúsculas, rúbrica en texto normal, escala de',
        'estimación) y la cobertura es parcial. Donde falta, el docente arma el instrumento',
        'a mano; la app no debe inventar uno y presentarlo como oficial.',
        '',
        '| Programa | Calidad | Módulos | Submódulos | Instrumentos | Avisos |',
        '|---|---|---|---|---|---|',
        ...resultados.map(p =>
            `| ${p.nombre} | ${p.calidadExtraccion} | ${p.modulos.length} | ` +
            `${p.coberturaInstrumentos.total} | ` +
            `${p.coberturaInstrumentos.conInstrumento}/${p.coberturaInstrumentos.total} | ${p.avisos.length} |`
        ),
        '',
    ];

    const conAvisos = resultados.filter(p => p.avisos.length);
    if (conAvisos.length) {
        lineas.push('## Avisos', '');
        for (const p of conAvisos) {
            lineas.push(`### ${p.nombre}`, '');
            p.avisos.forEach(a => lineas.push(`- ${a}`));
            lineas.push('');
        }
    }

    writeFileSync(resolve(DIR_SALIDA, '_reporte.md'), lineas.join('\n'), 'utf8');

    // Consolidado que consume la app. Se deja junto a programas_sep.json para que el
    // servicio lo importe igual que los del Currículum Fundamental.
    if (!filtro) {
        writeFileSync(
            resolve(raiz, 'data/programas_laborales.json'),
            JSON.stringify(resultados, null, 1),
            'utf8'
        );
        console.log('Consolidado en data/programas_laborales.json');
    } else {
        console.log('(Con filtro no se regenera el consolidado; corre sin filtro para actualizarlo.)');
    }

    const buenas = resultados.filter(p => p.calidadExtraccion === 'BUENA').length;
    console.log(`\n${buenas} de ${resultados.length} con extracción BUENA.`);
    console.log(`Salida en data/extraccion/laboral/`);
}

main().catch(e => {
    console.error('Error:', e);
    process.exit(1);
});
