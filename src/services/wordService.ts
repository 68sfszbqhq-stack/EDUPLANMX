/**
 * Exportación de planeaciones a Word (.docx)
 *
 * Los docentes retocan y archivan en Word; la supervisión a veces pide el
 * editable. Este servicio genera un documento nativo con todas las secciones
 * de la planeación — sin plantillas externas ni servicios de pago.
 */

import {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle
} from 'docx';
import type { LessonPlan } from '../../types';

const negrita = (texto: string) => new Paragraph({ children: [new TextRun({ text: texto, bold: true })] });
const parrafo = (texto: string) => new Paragraph({ children: [new TextRun(texto)], spacing: { after: 120 } });

const titulo = (texto: string) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text: texto, bold: true, color: '312E81' })]
});

const celda = (texto: string, esEncabezado = false, ancho?: number) => new TableCell({
    width: ancho ? { size: ancho, type: WidthType.PERCENTAGE } : undefined,
    shading: esEncabezado ? { fill: 'EEF2FF' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: texto || '—', bold: esEncabezado, size: 20 })] })]
});

const tabla = (filas: string[][], encabezado?: string[]) => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE' },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'C7D2FE' },
    },
    rows: [
        ...(encabezado ? [new TableRow({ children: encabezado.map(t => celda(t, true)) })] : []),
        ...filas.map(f => new TableRow({ children: f.map(t => celda(t)) }))
    ]
});

export async function descargarPlaneacionWord(plan: LessonPlan, schoolName?: string, cct?: string) {
    const p: any = plan; // campos opcionales/legacy
    const hijos: (Paragraph | Table)[] = [];

    // Encabezado institucional
    hijos.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: schoolName || 'Bachillerato General Oficial', bold: true, size: 28 })]
    }));
    if (cct) {
        hijos.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `CCT: ${cct}`, size: 20 })] }));
    }
    hijos.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 300 },
        children: [new TextRun({ text: plan.title || `Planeación Didáctica — ${plan.subject}`, bold: true, size: 32, color: '312E81' })]
    }));

    // 1. Datos generales
    hijos.push(titulo('1. Datos generales'));
    hijos.push(tabla([
        ['Docente', p.meta?.teacher || '', 'Asignatura', plan.subject || ''],
        ['Ciclo escolar', p.meta?.cycle || '', 'Periodo', p.meta?.period || ''],
        ['Grado y grupo', p.meta?.gradeGroup || '', 'Sesiones', String(p.meta?.totalSessions || '')],
        ['Fecha inicio', p.meta?.startDate || '', 'Fecha fin', p.meta?.endDate || ''],
        ['Metodología', p.meta?.methodology || '', 'Horas/semana', String(p.meta?.hoursPerWeek || '')],
    ]));

    // 2. Elementos curriculares
    hijos.push(titulo('2. Elementos curriculares (MCCEMS)'));
    if (p.curricularElements?.progression || plan.progression) {
        hijos.push(negrita('Progresión de aprendizaje:'));
        hijos.push(parrafo(p.curricularElements?.progression || plan.progression));
    }
    const metas: string[] = p.curricularElements?.learningGoals || (plan.learningGoal ? [plan.learningGoal] : []);
    if (metas.length) {
        hijos.push(negrita('Metas de aprendizaje:'));
        metas.forEach(m => hijos.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(m)] })));
    }

    // 3. Vinculación PAEC
    if (p.paec?.communityProblem) {
        hijos.push(titulo('3. Vinculación PAEC (comunidad)'));
        hijos.push(parrafo(`Problemática: ${p.paec.communityProblem}`));
        if (p.paec.projectTrigger) hijos.push(parrafo(`Vínculo con el proyecto: ${p.paec.projectTrigger}`));
    }

    // 4. Secuencia didáctica (por sesión si existe el desglose)
    hijos.push(titulo('4. Secuencia didáctica'));
    const sesiones: any[] = Array.isArray(p.sessions) ? p.sessions : [];
    if (sesiones.length > 0) {
        sesiones.forEach((s, i) => {
            hijos.push(negrita(`Sesión ${s.sessionNumber || i + 1}${s.title ? ` — ${s.title}` : ''}`));
            hijos.push(tabla(
                (['opening', 'development', 'closing'] as const).map(momento => [
                    { opening: 'Inicio', development: 'Desarrollo', closing: 'Cierre' }[momento],
                    s.sequence?.[momento]?.activity || '',
                    s.sequence?.[momento]?.studentActivity || '',
                    s.sequence?.[momento]?.time || '',
                    s.sequence?.[momento]?.evidence || '',
                ]),
                ['Momento', 'Actividad docente', 'Actividad del estudiante', 'Tiempo', 'Evidencia']
            ));
        });
    } else {
        hijos.push(tabla([
            ['Inicio', plan.sequence?.opening || ''],
            ['Desarrollo', plan.sequence?.development || ''],
            ['Cierre', plan.sequence?.closing || ''],
        ], ['Momento', 'Descripción']));
    }

    // 5. Estudio independiente
    if (p.independentStudy?.activities) {
        hijos.push(titulo('5. Estudio independiente'));
        hijos.push(parrafo(p.independentStudy.activities));
        if (p.independentStudy.feedbackStrategy || p.independentStudy.feedbackLink) {
            hijos.push(parrafo(`Retroalimentación: ${p.independentStudy.feedbackStrategy || p.independentStudy.feedbackLink}`));
        }
    }

    // 6. Inclusión (DUA)
    if (p.duaStrategies) {
        hijos.push(titulo('6. Estrategias de inclusión (DUA)'));
        hijos.push(parrafo(p.duaStrategies));
    }

    // 7. Evaluación
    hijos.push(titulo('7. Evaluación'));
    if (plan.evaluation) hijos.push(parrafo(plan.evaluation));
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
        hijos.push(titulo('7-B. Ciclo de retroalimentación formativa'));
        hijos.push(tabla([
            ['¿Hacia dónde va?', p.feedbackCycle.whereGoing || '—'],
            ['¿Dónde se encuentra?', p.feedbackCycle.whereIs || '—'],
            ['¿Cómo puede llegar ahí?', p.feedbackCycle.howToGetThere || '—'],
        ], ['Pregunta orientadora', 'Respuesta']));
    }

    // 8. Recursos
    const recursos: string[] = Array.isArray(p.resources) ? p.resources : [];
    if (recursos.length) {
        hijos.push(titulo('8. Recursos didácticos'));
        recursos.forEach(r => hijos.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(r)] })));
    }

    // Constancia de mediación docente (Fichas 16 y 34: la IA apoya, el docente decide)
    if (p.aiTrace?.reviewedByTeacher) {
        hijos.push(titulo('9. Constancia de revisión docente'));
        hijos.push(parrafo(
            'Esta planeación fue elaborada con apoyo de inteligencia artificial y revisada por el docente, ' +
            'quien conserva la responsabilidad sobre la selección de contenidos, el enfoque socioemocional ' +
            'y la adecuación al contexto del grupo.'
        ));
        if (p.aiTrace.teacherAdjustments?.trim()) {
            hijos.push(parrafo(`Ajustes realizados por el docente: ${p.aiTrace.teacherAdjustments}`));
        }
    }

    // Firmas
    hijos.push(new Paragraph({ spacing: { before: 600 }, children: [] }));
    hijos.push(tabla([[`${p.meta?.teacher || 'Docente'}\n\n_________________________\nElaboró`, '\n\n_________________________\nRevisó (Dirección)']]));

    const documento = new Document({
        styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
        sections: [{ children: hijos }]
    });

    const blob = await Packer.toBlob(documento);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planeacion-${(plan.subject || 'EduPlan').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '')}-${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
}
