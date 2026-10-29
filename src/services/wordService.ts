import { construirFormatoBGO, LOGOS_BGO, type LogosBytes } from './formatoBGO';
import { textoDocente } from '../features/planeacion/presentacionPlan';
/**
 * Exportación de planeaciones a Word (.docx)
 *
 * Los docentes retocan y archivan en Word; la supervisión a veces pide el
 * editable. Este servicio genera un documento nativo con todas las secciones
 * de la planeación — sin plantillas externas ni servicios de pago.
 */

import {
    Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, BorderStyle, TableLayoutType
} from 'docx';
import type { LessonPlan } from '../../types';

const negrita = (texto: string) => new Paragraph({ keepNext: true, children: [new TextRun({ text: texto, bold: true })] });
const parrafo = (texto: string) => new Paragraph({ keepLines: true, children: [new TextRun(texto)], spacing: { after: 120 } });

const titulo = (texto: string) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    keepNext: true,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text: texto, bold: true, color: '6D0000' })]
});

const celda = (texto: string, esEncabezado = false, ancho?: number, keepNext = false) => new TableCell({
    width: ancho ? { size: ancho, type: WidthType.PERCENTAGE } : undefined,
    shading: esEncabezado ? { fill: 'EDE3E3' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: texto.split(/\n/).map(t => new Paragraph({ keepNext, children: [new TextRun({ text: t || ' ', bold: esEncabezado, size: 20 })] }))
});

const tabla = (filas: string[][], encabezado?: string[], anchos?: number[], unida = false) => new Table({
    layout: TableLayoutType.FIXED,
    columnWidths: (anchos || (encabezado || filas[0] || []).map(() => 100 / (encabezado || filas[0]).length)).map(n => Math.round(n * 175.6)),
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    },
    rows: [
        ...(encabezado ? [new TableRow({ tableHeader: true, cantSplit: true, children: encabezado.map((t,i) => celda(t, true, anchos?.[i], unida)) })] : []),
        ...filas.map((f, fila) => new TableRow({ cantSplit: true, children: f.map((t,i) => celda(t, false, anchos?.[i], unida && fila < filas.length - 1)) }))
    ]
});

export async function crearWordPlaneacion(plan: LessonPlan, schoolName?: string, cct?: string, logos?: LogosBytes) {
    schoolName = plan.institution?.name || schoolName;
    cct = plan.institution?.cct || cct;
    const p: any = plan; // campos opcionales/legacy
    const hijos: (Paragraph | Table)[] = [];

    // Estudio independiente
    if (p.independentStudy?.activities) {
        hijos.push(titulo('Estudio independiente'));
        hijos.push(parrafo(p.independentStudy.activities));
        if (p.independentStudy.feedbackStrategy || p.independentStudy.feedbackLink) {
            hijos.push(parrafo(`Retroalimentación: ${p.independentStudy.feedbackStrategy || p.independentStudy.feedbackLink}`));
        }
    }

    // 6. Inclusión (DUA)
    if (p.duaStrategies) {
        hijos.push(titulo('Estrategias de inclusión (DUA)'));
        hijos.push(parrafo(p.duaStrategies));
    }

    // Instrumento y criterios de evaluación
    hijos.push(titulo('Instrumento y criterios de evaluación'));
    if (plan.evaluation) plan.evaluation.split(/\n+/).filter(Boolean).forEach(t => hijos.push(parrafo(t)));
    const instrumento = plan.assessmentInstrument;
    if (instrumento) {
      hijos.push(negrita(instrumento.name));
      hijos.push(parrafo(instrumento.instructions));
      hijos.push(tabla(instrumento.rows.map(r=>[r.criterion,...r.descriptors]), ['Criterio',...instrumento.columns]));
      hijos.push(parrafo(instrumento.scoring));
    }

    if (p.evaluationDetails) {
        const filas: string[][] = [];
        if (p.evaluationDetails.diagnostic) filas.push(['Diagnóstica', p.evaluationDetails.diagnostic]);
        if (p.evaluationDetails.formative) filas.push(['Formativa', p.evaluationDetails.formative]);
        if (p.evaluationDetails.summative) filas.push(['Sumativa', p.evaluationDetails.summative]);
        if (filas.length) hijos.push(tabla(filas, ['Tipo', 'Descripción']));
        if (p.evaluationDetails.instruments?.length) {
            hijos.push(negrita('Instrumentos:'));
            p.evaluationDetails.instruments.forEach((i: string) =>
                hijos.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(i)] })));
        }
    }

    // 7b. Ciclo de retroalimentación formativa del MCCEMS (Fichas 03 y 18)
    if (p.feedbackCycle && (p.feedbackCycle.whereGoing || p.feedbackCycle.whereIs || p.feedbackCycle.howToGetThere)) {
        hijos.push(titulo('Ciclo de retroalimentación formativa'));
        hijos.push(tabla([
            ['¿Hacia dónde va?', p.feedbackCycle.whereGoing || '—'],
            ['¿Dónde se encuentra?', p.feedbackCycle.whereIs || '—'],
            ['¿Cómo puede llegar ahí?', p.feedbackCycle.howToGetThere || '—'],
        ], ['Pregunta orientadora', 'Respuesta']));
    }

    // 8. Recursos y referencias (la lista de cotejo pide materiales, recursos Y referencias)
    const recursos: string[] = Array.isArray(p.resources) ? p.resources : [];
    if (recursos.length) {
        hijos.push(titulo('Materiales y recursos didácticos'));
        recursos.forEach(r => hijos.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(textoDocente(r))] })));
    }

    const referencias: string[] = Array.isArray(p.references) ? p.references : [];
    if (referencias.length) {
        hijos.push(titulo('Referencias'));
        referencias.forEach(r => hijos.push(new Paragraph({ keepLines: true, bullet: { level: 0 }, children: [new TextRun(textoDocente(r))] })));
    }

    if (plan.teachingKit?.length) {
      // Cada ficha empieza en página propia: no entregar una evaluación futura junto al diagnóstico.
      for (const material of plan.teachingKit) {
        hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, keepNext: true, children: [new TextRun({text: material.title, color: '6D0000', bold: true})] }));
        hijos.push(negrita(`Material para el estudiantado · ${material.sessionNumber ? `Sesión ${material.sessionNumber}` : 'Sesión por asignar'}`));
        hijos.push(parrafo(`Entrega: ${material.delivery || 'Acordar el momento con el docente'}`));
        material.content.replace(/ (?=\d+[)] )/g, '\n').split(/\n+/).filter(Boolean).forEach(t=>hijos.push(parrafo(t)));
        if (material.questions?.length) {
          for (const question of material.questions) {
            const lines = Math.min(12, Math.max(2, question.lines || 6));
            hijos.push(negrita(question.prompt));
            for (let line = 0; line < lines; line++) hijos.push(new Paragraph({
              keepNext: line < lines - 1, spacing: { after: 0, line: 340 },
              border: { bottom: { style: BorderStyle.SINGLE, color: 'CCCCCC', size: 2 } }, children: [new TextRun(' ')]
            }));
          }
        } else {
          hijos.push(parrafo('Si la consigna requiere una respuesta extensa, utiliza tu cuaderno.'));
        }
      }
      hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, keepNext: true, children: [new TextRun({text: 'Guía del docente', color: '6D0000', bold: true})] }));
      for (const material of plan.teachingKit) {
        hijos.push(titulo(material.title));
        hijos.push(parrafo(`Preparación: ${material.preparation}`));
        material.teacherNotes.split(/\n+/).filter(Boolean).forEach(t=>hijos.push(parrafo(t)));
      }
    }

    // Constancia de mediación docente (Fichas 16 y 34: la IA apoya, el docente decide)
    if (p.aiTrace?.reviewedByTeacher) {
        hijos.push(titulo('Constancia de revisión docente'));
        hijos.push(parrafo(
            'Esta planeación fue elaborada con apoyo de inteligencia artificial y revisada por el docente, ' +
            'quien conserva la responsabilidad sobre la selección de contenidos, el enfoque socioemocional ' +
            'y la adecuación al contexto del grupo.'
        ));
        if (p.aiTrace.teacherAdjustments?.trim()) {
            hijos.push(parrafo(`Ajustes realizados por el docente: ${p.aiTrace.teacherAdjustments}`));
        }
    }

    const school = schoolName || 'Bachillerato General Oficial';
    const documento = construirFormatoBGO(plan, {
      logos: logos ?? await cargarLogos(),
      plantel: {
        escuela: school, cct: cct || 'Por registrar', turno: '', rotulo: school,
        autoriza: { nombre: '', cargo: 'Dirección' },
        vobo: { nombre: '', cargo: 'Supervisión escolar' },
      },
      complemento: hijos,
    });

    return Packer.toBlob(documento);
}

export async function descargarPlaneacionWord(plan: LessonPlan, schoolName?: string, cct?: string) {
    const blob = await crearWordPlaneacion(plan, schoolName, cct);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planeacion-${(plan.subject || 'EduPlan').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '')}-${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
}

async function cargarLogos(): Promise<LogosBytes> {
  const base = import.meta.env?.BASE_URL || '/';
  const entradas = await Promise.all(Object.entries(LOGOS_BGO).map(async ([key, path]) => {
    const response = await fetch(`${base}${path}`);
    if (!response.ok) throw new Error('No se pudieron cargar los logotipos del formato institucional. Intenta descargar de nuevo.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) {
      throw new Error('El logotipo institucional no es una imagen válida. Intenta descargar de nuevo.');
    }
    return [key, bytes];
  }));
  return Object.fromEntries(entradas) as LogosBytes;
}
