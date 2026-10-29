import { fechaPlan, periodoPlan, horasPlan, textoDocente } from '../features/planeacion/presentacionPlan';
import { estadoPAEC } from '../features/planeacion/decisionesPlan';
/**
 * Formato de planeación del BGO "Carlos Camacho Espíritu", Turno Vespertino
 * (CCT 21EBH0026G, Supervisión 013).
 *
 * Reproduce el formato oficial que entrega el plantel ("FORMATO VACIO DE
 * PLANEACIÓN"): hoja oficio horizontal, logotipos institucionales en el
 * encabezado, barras guinda y las mismas casillas en el mismo orden. La
 * supervisión revisa contra ese formato, así que aquí no se "mejora" su
 * estructura: se llena.
 *
 * No toca el navegador ni Firebase a propósito: los logotipos entran como
 * bytes. Así lo usan igual el botón de la app (ver wordService.ts) y el script
 * de terminal que genera planeaciones en lote (scripts/generar-formato-bgo.ts).
 */
import {
    Document, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header,
    AlignmentType, WidthType, BorderStyle, ShadingType, PageOrientation,
    VerticalAlign, LevelFormat, PageBreak, TableLayoutType,
} from 'docx';
import type { LessonPlan, SessionPhase } from '../../types';
import { vocabularioCurricular, COMPONENTES_FORMACION } from '../../data/vocabularioCurricular';

export interface FormatoPlantel {
    escuela: string;
    turno: string;
    cct: string;
    /** Rótulo pequeño arriba a la derecha de la primera hoja, como en el original */
    rotulo: string;
    autoriza: { nombre: string; cargo: string };
    vobo: { nombre: string; cargo: string };
}

/** Datos tal como vienen impresos en el formato que entrega la dirección. */
export const FORMATO_BGO_CAMACHO: FormatoPlantel = {
    escuela: 'Bachillerato General Oficial “Carlos Camacho Espíritu”',
    turno: 'Turno Vespertino',
    cct: '21EBH0026G',
    rotulo: '“CARLOS CAMACHO ESPIRITU” TURNO VESPERTINO',
    autoriza: { nombre: 'C. Beatriz Sanchéz Torres', cargo: 'Responsable de Dirección' },
    vobo: { nombre: 'C. Adalberto Alejandro Molina Baéz', cargo: 'Supervisor Escolar 013' },
};

/** Rutas de los logotipos dentro de public/ (el navegador) o de la raíz del repo + public/ (terminal) */
export const LOGOS_BGO = {
    izquierda: 'formatos/bgo/logo-gobierno-puebla.png',
    centro: 'formatos/bgo/logo-pensar-en-grande.png',
    derecha: 'formatos/bgo/logo-bgo.png',
} as const;

export type LogosBytes = Record<keyof typeof LOGOS_BGO, Uint8Array | ArrayBuffer>;

// ─── Medidas y colores tomados del PDF original ────────────────────────────
const GUINDA = '6D0000';
const CAFE = '80340D';
const ENCABEZADO_TABLA = 'EDE3E3';
const LETRA = 'Arial';
const TAM = 17;            // 8.5 pt
const ANCHO = 17560;       // ancho útil en DXA de la hoja oficio horizontal con los márgenes del original

const linea = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const bordes = { top: linea, bottom: linea, left: linea, right: linea };
const nada = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const sinBordes = { top: nada, bottom: nada, left: nada, right: nada };

const SEMESTRES = ['', 'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto'];

// ─── Piezas ────────────────────────────────────────────────────────────────

/** "**negritas** normal" → runs. Es el único marcado que se acepta en el texto. */
function runs(texto: string, opts: { size?: number; color?: string; bold?: boolean } = {}): TextRun[] {
    return texto.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(parte => {
        const negrita = parte.startsWith('**') && parte.endsWith('**');
        return new TextRun({
            text: negrita ? parte.slice(2, -2) : parte,
            bold: negrita || opts.bold, font: LETRA, size: opts.size ?? TAM, color: opts.color,
        });
    });
}

/** Cada línea es un párrafo; las que empiezan con "- " son viñetas. */
function parrafos(lineas: string | string[], opts: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; size?: number; color?: string } = {}): Paragraph[] {
    const lista = (Array.isArray(lineas) ? lineas : [lineas]).filter(l => l !== undefined && l !== null);
    if (lista.length === 0) lista.push('');
    return lista.map(l => {
        const vineta = l.startsWith('- ');
        return new Paragraph({
            children: runs(vineta ? l.slice(2) : l, opts),
            numbering: vineta ? { reference: 'vinetas', level: 0 } : undefined,
            alignment: opts.align,
            spacing: { after: 40 },
        });
    });
}

function celda(lineas: string | string[], ancho: number, opts: {
    span?: number; fondo?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    valign?: Exclude<(typeof VerticalAlign)[keyof typeof VerticalAlign], 'both'>; size?: number;
} = {}): TableCell {
    return new TableCell({
        borders: bordes,
        width: { size: ancho, type: WidthType.DXA },
        columnSpan: opts.span,
        verticalAlign: opts.valign ?? VerticalAlign.TOP,
        shading: opts.fondo ? { fill: opts.fondo, type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: parrafos(lineas, { align: opts.align, size: opts.size }),
    });
}

/** Casilla de datos generales: etiqueta gris arriba, valor abajo (como en el original). */
function casilla(etiqueta: string, valor: string | string[], ancho: number): TableCell {
    return new TableCell({
        borders: bordes,
        width: { size: ancho, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: [
            new Paragraph({ children: runs(etiqueta, { color: '404040' }), spacing: { after: 40 } }),
            ...parrafos(valor || ''),
        ],
    });
}

function tabla(anchos: number[], filas: TableRow[]): Table {
    return new Table({
        width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: anchos,
        layout: TableLayoutType.FIXED,
        rows: filas,
    });
}

function barra(texto: string, color = GUINDA): Table {
    return tabla([ANCHO], [new TableRow({ children: [new TableCell({
        borders: bordes, width: { size: ANCHO, type: WidthType.DXA },
        shading: { fill: color, type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 20, bottom: 20 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: texto, bold: true, color: 'FFFFFF', font: 'Times New Roman', size: 30 }),
        ] })],
    })] })]);
}

const espacio = (after = 160) => new Paragraph({ spacing: { after }, children: [] });

const unicos = (xs: (string | undefined)[]) =>
    [...new Set(xs.map(x => (x || '').trim()).filter(Boolean))];

// ─── Traducción de la planeación a las casillas del formato ───────────────

function textoPAEC(plan: LessonPlan): string[] {
    const p = plan.paec;
    if (!p || p.estado === 'sin_vinculo') return [estadoPAEC(p)];
    const lineas: string[] = [estadoPAEC(p)];
    if (p.pecName) lineas.push(`**${p.pecName}.**`);
    if (p.communityProblem) lineas.push(p.communityProblem);
    if (p.projectTrigger) lineas.push(p.projectTrigger);
    if (p.pecProducts?.length) lineas.push(`**Producto en el PEC:** ${p.pecProducts.join('; ')}`);
    return lineas.length ? lineas : [''];
}

function textoProgresion(plan: LessonPlan, modelo?: string): string[] {
    const ce = plan.curricularElements;
    const voc = vocabularioCurricular(modelo);
    const lineas: string[] = [`**${voc.progresion}:**`];
    const etiqueta = ce?.progressionId ? `${voc.progresion} ${ce.progressionId}` : voc.progresion;
    lineas.push(`**${etiqueta}:**`);
    lineas.push(ce?.progression || plan.progression || '');
    if (ce?.learningGoals?.length) {
        lineas.push(`**${voc.metas}:** ${ce.learningGoals.join(' ')}`);
    }
    if (ce?.trajectoryLearning?.length) {
        lineas.push(`**${voc.trayectoria}:** ${ce.trajectoryLearning.join(' ')}`);
    }
    return lineas;
}

function textoContenidos(plan: LessonPlan, modelo?: string): string[] {
    const ce = plan.curricularElements;
    const voc = vocabularioCurricular(modelo);
    const lineas: string[] = ['**Contenidos:**'];
    if (voc.modelo === '2025') {
        lineas.push(`**${voc.contenidoNivel1}:**`);
        [...(ce?.contents || []), ...(ce?.categories || []), ...(ce?.subcategories || [])].forEach(c => lineas.push(`- ${c}`));
    } else {
        if (ce?.categories?.length) lineas.push(`**${voc.contenidoNivel1}:** ${ce.categories.join('; ')}`);
        if (ce?.subcategories?.length) lineas.push(`**${voc.contenidoNivel2}:** ${ce.subcategories.join('; ')}`);
        (ce?.contents || []).forEach(c => lineas.push(`- ${c}`));
    }
    if (plan.meta?.methodology) lineas.push(`**Metodología:** ${plan.meta.methodology}`);
    return lineas;
}

const MOMENTOS: Array<['opening' | 'development' | 'closing', string]> = [
    ['opening', 'Apertura'], ['development', 'Desarrollo'], ['closing', 'Cierre'],
];

function filaSesion(ses: NonNullable<LessonPlan['sessions']>[number], minutos: string, anchos: number[], metodologia?: string): TableRow {
    const fases = MOMENTOS.map(([k, nombre]) => [nombre, ses.sequence?.[k] as SessionPhase | undefined] as const);

    const actividades: string[] = [];
    for (const [nombre, f] of fases) {
        if (!f) continue;
        const tiempo = f.time ? ` (${f.time})` : '';
        actividades.push(`**${nombre}${tiempo}.** ${f.activity || ''}`.trim());
        if (f.studentActivity) actividades.push(`**Estudiantado:** ${f.studentActivity}`);
    }

    const tecnicas = unicos(fases.map(([, f]) => f?.technique));
    if (tecnicas.length === 0 && metodologia) tecnicas.push(metodologia);

    const tiempos = fases.map(([, f]) => /^(\d+)\s*(?:minutos?|min)\.?$/i.exec(f?.time?.trim() || ''));
    const duracion = tiempos.every(Boolean) ? `${tiempos.reduce((n,t)=>n+Number(t![1]),0)} minutos` : minutos;
    const fase = [`**Sesión ${ses.sessionNumber}**`, `(${duracion})`];
    fase.push(fechaPlan(ses.date));
    if (ses.topic) fase.push('', ses.topic);

    return new TableRow({ children: [
        celda(fase, anchos[0], { align: AlignmentType.CENTER }),
        celda(actividades, anchos[1]),
        celda(tecnicas.map(t => `- ${t}`), anchos[2]),
        celda(unicos(fases.map(([, f]) => f?.evidence)).map(e => `- ${e}`), anchos[3]),
        celda(unicos(ses.resources || []).map(r => `- ${textoDocente(r)}`), anchos[4]),
    ] });
}

// ─── Documento ─────────────────────────────────────────────────────────────

export interface OpcionesFormatoBGO {
    logos: LogosBytes;
    plantel?: FormatoPlantel;
    /** Duración de cada sesión tal como se imprime: "50 minutos" */
    minutosSesion?: string;
    /** Evaluación completa, recursos y fichas actuales, con la plantilla institucional. */
    complemento?: (Paragraph | Table)[];
}

export function construirFormatoBGO(plan: LessonPlan, opciones: OpcionesFormatoBGO): Document {
    const plantel = opciones.plantel ?? FORMATO_BGO_CAMACHO;
    const minutos = opciones.minutosSesion ?? 'duración según actividades';
    const m = plan.meta;
    const modelo = plan.curricularSource?.model || m?.modelo;
    const sesiones = plan.sessions ?? [];

    const logo = (bytes: Uint8Array | ArrayBuffer, w: number, h: number) =>
        new ImageRun({ type: 'png', data: bytes, transformation: { width: w, height: h } });

    const encabezado = new Header({ children: [
        tabla([6400, 7000, 4160], [new TableRow({ children: [
            new TableCell({ borders: sinBordes, width: { size: 6400, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ children: [logo(opciones.logos.izquierda, 293, 59)] })] }),
            new TableCell({ borders: sinBordes, width: { size: 7000, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ children: [logo(opciones.logos.centro, 240, 67)] })] }),
            new TableCell({ borders: sinBordes, width: { size: 4160, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [logo(opciones.logos.derecha, 84, 67)] })] }),
        ] })]),
    ] });

    // 1. DATOS GENERALES
    const A1 = [5178, 2728, 2728, 3311, 1867, 1748];
    const componente = m?.componente ? COMPONENTES_FORMACION[m.componente] : '';
    const periodo = periodoPlan(m);
    const numSesiones = `${m?.totalSessions || sesiones.length} sesiones de ${minutos}`;
    const datos = tabla(A1, [
        new TableRow({ children: [new TableCell({
            borders: bordes, columnSpan: 6, width: { size: ANCHO, type: WidthType.DXA },
            shading: { fill: GUINDA, type: ShadingType.CLEAR, color: 'auto' },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
                new TextRun({ text: '1.   DATOS GENERALES', bold: true, color: 'FFFFFF', font: LETRA, size: 19 })] })],
        })] }),
        new TableRow({ children: [
            casilla('ESCUELA:', `${plantel.escuela}${plantel.turno ? ', ' + plantel.turno : ''}. CCT ${plantel.cct}`, A1[0]),
            casilla('Nombre del Docente:', m?.teacher || '', A1[1]),
            casilla('Asignatura:', plan.subject || '', A1[2]),
            casilla('Componente:', componente, A1[3]),
            casilla('Ciclo Escolar:', m?.cycle || '', A1[4]),
            casilla('Grupo:', m?.group || m?.gradeGroup || '', A1[5]),
        ] }),
        new TableRow({ children: [
            casilla('Vinculación con el PAEC/PEC:', textoPAEC(plan), A1[0]),
            casilla('Transversalidad:', plan.fundamento?.transversalityLink || '', A1[1]),
            casilla('Vinculación con otro programa:', plan.fundamento?.socioemotionalLink || '', A1[2]),
            casilla('Periodo de Aplicación:', periodo || '', A1[3]),
            casilla('Semestre:', m?.semester ? SEMESTRES[m.semester] || String(m.semester) : '', A1[4]),
            casilla('Número de sesiones:', [numSesiones, horasPlan(m?.hoursPerWeek)], A1[5]),
        ] }),
    ]);

    const concepto = tabla([2582, 14978], [new TableRow({ children: [
        celda('**Concepto Central:**', 2582),
        celda(plan.curricularElements?.centralConcept || plan.title || '', 14978),
    ] })]);

    const progresiones = tabla([9291, 8269], [new TableRow({ children: [
        celda(textoProgresion(plan, modelo), 9291),
        celda(textoContenidos(plan, modelo), 8269),
    ] })]);

    // 2. PLANEACIÓN
    const A2 = [2523, 7613, 2334, 2669, 2421];
    const encabezadoSesiones = (t: string, w: number) =>
        celda(`**${t}**`, w, { align: AlignmentType.CENTER, valign: VerticalAlign.CENTER });
    const planeacion = tabla(A2, [
        new TableRow({ tableHeader: true, children: [
            celda('**Diagnóstico**', A2[0], { align: AlignmentType.CENTER }),
            celda(plan.context?.diagnosis || '', A2[1] + A2[2] + A2[3] + A2[4], { span: 4 }),
        ] }),
        new TableRow({ tableHeader: true, children: [
            encabezadoSesiones('Fase / Momento', A2[0]), encabezadoSesiones('Actividades', A2[1]),
            encabezadoSesiones('Técnica', A2[2]), encabezadoSesiones('Evidencia de desempeño', A2[3]),
            encabezadoSesiones('Materiales/ Recursos', A2[4]),
        ] }),
        ...sesiones.map(s => filaSesion(s, minutos, A2, m?.methodology)),
        ...(!sesiones.length ? [new TableRow({ children: [
          celda('Secuencia didáctica', A2[0]),
          celda(MOMENTOS.map(([key, label]) => `**${label}:** ${plan.sequence?.[key] || ''}`), A2.slice(1).reduce((a,b)=>a+b,0), {span:4}),
        ] })] : []),
    ]);

    // 3. EVALUACIÓN Y RETROALIMENTACIÓN
    const A3 = [1900, 6360, 3000, 3300, 3000];
    const filasEval = plan.evaluationTable ?? [];
    const total = filasEval.reduce((s, f) => s + (Number(f.percentage) || 0), 0);
    const tablaEval = tabla(A3, [
        new TableRow({ tableHeader: true, children: ['Tipo', 'Evidencia y criterios', 'Instrumento', 'Agente', 'Ponderación']
            .map((t, i) => celda(`**${t}**`, A3[i], { align: AlignmentType.CENTER, fondo: ENCABEZADO_TABLA })) }),
        ...filasEval.map(f => new TableRow({ children: [
            celda(f.moment, A3[0]), celda(f.criteria, A3[1]), celda(f.instrument, A3[2]), celda(f.agent, A3[3]),
            celda(`${f.percentage} %`, A3[4], { align: AlignmentType.CENTER }),
        ] })),
        new TableRow({ children: [
            celda('', A3[0]), celda('', A3[1]), celda('', A3[2]), celda('**Total**', A3[3]),
            celda(`**${total} %**${total !== 100 ? ' — Revisar ponderación: debe sumar 100%.' : ''}`, A3[4], { align: AlignmentType.CENTER }),
        ] }),
    ]);

    const evaluacion: (Paragraph | Table)[] = [barra('3. EVALUACIÓN Y RETROALIMENTACIÓN'), espacio(), tablaEval];

    if (plan.rubric?.length) {
        const A4 = [14560, 3000];
        evaluacion.push(espacio(),
            new Paragraph({ spacing: { after: 80 }, children: runs(`**Rúbrica del producto${plan.products?.[0] ? `: ${plan.products[0]}` : ''}**`, { size: 18 }) }),
            tabla(A4, [
                new TableRow({ tableHeader: true, children: ['Criterio', 'Peso']
                    .map((t, i) => celda(`**${t}**`, A4[i], { align: AlignmentType.CENTER, fondo: ENCABEZADO_TABLA })) }),
                ...plan.rubric.map(r => new TableRow({ children: [
                    celda(r.criterion, A4[0]), celda(`${r.weight} %`, A4[1], { align: AlignmentType.CENTER }),
                ] })),
            ]));
    }

    const retro: string[] = ['**Retroalimentación**'];
    if (plan.independentStudy?.feedbackStrategy) retro.push(`- **Cómo y cuándo:** ${plan.independentStudy.feedbackStrategy}`);
    if (plan.feedbackCycle) {
        retro.push(`- **¿Hacia dónde va el estudiantado?** ${plan.feedbackCycle.whereGoing}`);
        retro.push(`- **¿Dónde se encuentra?** ${plan.feedbackCycle.whereIs}`);
        retro.push(`- **¿Cómo puede llegar?** ${plan.feedbackCycle.howToGetThere}`);
    }
    if (plan.duaStrategies) retro.push(`- **Inclusión (DUA):** ${plan.duaStrategies}`);
    evaluacion.push(espacio(), ...parrafos(retro));

    const referencias = (plan.references ?? []).map(r => new Paragraph({
        children: runs(r, { size: 18 }), indent: { left: 567, hanging: 567 }, spacing: { after: 80 },
    }));

    // FIRMAS
    const A6 = [4390, 4390, 4390, 4390];
    const raya = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
    const firma = (titulo: string, nombre: string, cargo: string, w: number) => new TableCell({
        borders: sinBordes, width: { size: w, type: WidthType.DXA }, margins: { left: 200, right: 200 }, children: [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1400 }, children: runs(titulo, { size: 20 }) }),
            new Paragraph({ alignment: AlignmentType.CENTER, border: { top: raya }, children: runs(nombre, { size: 20 }) }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: runs(cargo, { size: 20 }) }),
        ],
    });
    const firmas = tabla(A6, [new TableRow({ children: [
        firma('Elaboró', m?.teacher || '', 'Docente', A6[0]),
        firma('Revisó', '', '', A6[1]),
        firma('Autoriza', plantel.autoriza.nombre, plantel.autoriza.cargo, A6[2]),
        firma('Vo.Bo', plantel.vobo.nombre, plantel.vobo.cargo, A6[3]),
    ] })]);

    const rotulo = (t: string) => new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t, font: 'Times New Roman', size: 15 })] });

    return new Document({
        creator: m?.teacher || 'EduPlanMX',
        title: plan.title,
        styles: { default: { document: { run: { font: LETRA, size: TAM } } } },
        numbering: { config: [{ reference: 'vinetas', levels: [{
            level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 240, hanging: 180 } } },
        }] }] },
        sections: [{
            properties: { page: {
                // Oficio (8.5" × 14") horizontal, como el original
                size: { width: 12240, height: 20160, orientation: PageOrientation.LANDSCAPE },
                margin: { top: 1900, bottom: 900, left: 1300, right: 1300, header: 500 },
            } },
            headers: { default: encabezado },
            children: [
                rotulo(plantel.rotulo), rotulo(`CCT. ${plantel.cct}`),
                datos, concepto, progresiones,
                ...(plan.curricularSource ? parrafos(`${plan.curricularSource.status === 'general' ? 'Propuesta general · alineación curricular pendiente de cotejo.' : 'Fuente curricular verificada en el catálogo · planeación generada con apoyo de IA.'} ${plan.curricularSource.subject} · modelo ${plan.curricularSource.model} · generación ${plan.curricularSource.generation}.${plan.curricularSource.url ? ` Fuente: ${plan.curricularSource.url}` : ''}`) : []),
                new Paragraph({ pageBreakBefore: true, spacing: { before: 0, after: 0, line: 1 }, children: [new TextRun({text: '', size: 1})] }), barra('2. PLANEACIÓN'), planeacion,
                new Paragraph({ children: [new PageBreak()] }),
                ...(opciones.complemento ? [barra('3. EVALUACIÓN Y RETROALIMENTACIÓN'), espacio(), tablaEval, ...opciones.complemento] : [...evaluacion, espacio(), barra('REFERENCIAS'), espacio(), ...referencias]),
                new Paragraph({ children: [new PageBreak()] }),
                espacio(400), barra('REVISIÓN Y VISTO BUENO', CAFE), espacio(700), firmas,
            ],
        }],
    });
}
