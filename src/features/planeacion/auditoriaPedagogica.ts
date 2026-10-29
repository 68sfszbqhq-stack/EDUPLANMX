import type { LessonPlan } from '../../../types';
import type { ProgramaSEP } from '../../services/programasSEPService';

const normalizarTexto = (texto: string) => texto.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');

/** Nunca sustituye la fuente del resultado por la selección actual del formulario. */
export function resolverFuenteAuditoria(plan: LessonPlan, programas: ProgramaSEP[]): { programa: ProgramaSEP | null; motivo: string } {
    const fuente = plan.curricularSource;
    const noEvaluable = (motivo: string) => ({ programa: null, motivo });
    if (!fuente) return noEvaluable('Esta planeación no conserva una fuente curricular identificable.');
    if (fuente.status !== 'oficial' || fuente.catalogState !== 'oficial') return noEvaluable('Propuesta general: no hay un programa verificado asociado a este resultado.');
    if (plan.meta?.componente === 'laboral') return noEvaluable('Formación Laboral requiere cotejar la Actividad Clave y el submódulo; no se compara con progresiones del componente fundamental.');
    if (!fuente.url || fuente.semester == null) return noEvaluable('La fuente del resultado está incompleta.');
    const candidatos = programas.filter(p => p.estado === 'oficial' && p.modelo === fuente.model && p.materia === fuente.subject && p.semestre === fuente.semester && p.url_fuente === fuente.url);
    if (candidatos.length !== 1) return noEvaluable('La fuente exacta del resultado no está disponible de forma unívoca en el catálogo actual.');
    return { programa: candidatos[0], motivo: 'Fuente del resultado localizada en el catálogo.' };
}

export type AuditStatus = 'pass' | 'warning' | 'fail' | 'unavailable' | 'notapplicable';
export type AuditGroup = 'estructura' | 'nem' | 'evaluacion' | 'equidad' | 'cotejo';

export interface AuditItem {
    id: string;
    group: AuditGroup;
    label: string;
    status: AuditStatus;
    message: string;
    /** Qué debe hacer el docente si no pasó. Se muestra tal cual: es la acción correctiva. */
    fix?: string;
}

export const GRUPOS: Record<AuditGroup, { titulo: string; fuente: string }> = {
    estructura: { titulo: 'Estructura curricular', fuente: 'Fuente del resultado' },
    nem: { titulo: 'Participación y reflexión', fuente: 'Indicios en el texto' },
    evaluacion: { titulo: 'Evaluación formativa', fuente: 'Fichas 03 y 18 · ciclo de retroalimentación' },
    equidad: { titulo: 'Equidad e inclusión', fuente: 'Fichas 08 y 13 · BAP y perspectiva de género' },
    cotejo: { titulo: 'Elementos del documento', fuente: 'Revisión orientativa' },
};

/** Une todo el texto de la secuencia para buscar evidencias de enfoque pedagógico. */
const textoDeMomento = (plan: LessonPlan, momento: 'opening' | 'development' | 'closing'): string => {
    const partes: string[] = [];
    const detalle = plan.sequence?.detailed?.[momento];
    if (detalle) partes.push(detalle.activity || '', detalle.studentActivity || '', detalle.evidence || '');
    if (plan.sequence?.[momento] && typeof plan.sequence[momento] === 'string') {
        partes.push(plan.sequence[momento] as string);
    }
    plan.sessions?.forEach(s => {
        const m = s.sequence?.[momento];
        if (m) partes.push(m.activity || '', m.studentActivity || '', m.evidence || '');
    });
    return partes.join(' ').toLowerCase();
};

const textoCompleto = (plan: LessonPlan): string =>
    [
        textoDeMomento(plan, 'opening'),
        textoDeMomento(plan, 'development'),
        textoDeMomento(plan, 'closing'),
        plan.evaluation || '',
        plan.duaStrategies || '',
        plan.fundamento?.progressionJustification || '',
        plan.fundamento?.socioemotionalLink || '',
        plan.feedbackCycle?.howToGetThere || '',
    ].join(' ').toLowerCase();

const contieneAlguna = (texto: string, palabras: string[]) =>
    palabras.some(p => texto.includes(p));

export function auditarPlaneacion(plan: LessonPlan, programas: ProgramaSEP[]) {
        const results: AuditItem[] = [];

        const addCheck = (
            group: AuditGroup,
            label: string,
            condition: boolean,
            successMsg: string,
            failMsg: string,
            fix?: string,
            isCritical = false
        ) => {
            if (condition) {
                results.push({ id: label, group, label, status: 'pass', message: successMsg });
            } else {
                results.push({ id: label, group, label, status: isCritical ? 'fail' : 'warning', message: failMsg, fix });
            }
        };

        const apertura = textoDeMomento(plan, 'opening');
        const desarrollo = textoDeMomento(plan, 'development');
        const cierre = textoDeMomento(plan, 'closing');
        const todo = textoCompleto(plan);

        // ─── 1. ESTRUCTURA CURRICULAR ───────────────────────────────
        const referencia = resolverFuenteAuditoria(plan, programas);
        const programaOficial = referencia.programa;
        const textoProgresion = normalizarTexto(plan.progression || plan.curricularElements?.progression || '');
        if (!programaOficial || !textoProgresion) {
            results.push({ id: 'Texto de progresión', group: 'estructura', label: 'Texto de progresión',
                status: 'unavailable', message: !programaOficial ? referencia.motivo : 'No hay texto de progresión para comparar.',
                fix: 'Coteja el contenido con el programa aplicable antes de atribuir alineación curricular.' });
        } else {
            const coincide = programaOficial.progresiones.some(p => normalizarTexto(p.descripcion) === textoProgresion);
            addCheck('estructura', 'Texto de progresión', coincide,
                'El texto coincide con una progresión de la fuente del resultado. Esto no valida las actividades.',
                'El texto no coincide íntegramente con una progresión de esa fuente.',
                'Revisa la progresión y su relación con las actividades en el programa enlazado.');
        }

        addCheck('estructura', 'Secuencia didáctica', (!!plan.sessions && plan.sessions.length > 0) || !!plan.sequence,
            'Se detectó una secuencia; comprueba sus momentos y tiempos',
            'Secuencia didáctica incompleta',
            'Vuelve a generar: la secuencia debe tener los tres momentos.',
            true);

        addCheck('estructura', 'Recursos didácticos', !!plan.resources && plan.resources.length > 0,
            'Recursos listados', 'Falta la lista de recursos',
            'Activa la casilla "Recursos" en las secciones a incluir y regenera.');

        addCheck('estructura', 'Marco temporal', !!plan.meta?.hoursPerWeek,
            'Tiempos definidos en metadatos', 'Faltan metadatos de tiempo',
            'Captura las horas por semana antes de generar.');

        // ─── 2. ENFOQUE NEM MODELO 2025 (Ficha 01) ──────────────────
        // Apertura: diagnóstico activo + democracia participativa
        const hayEscucha = contieneAlguna(apertura, [
            'escucha', 'diagnóstic', 'saberes previos', 'lluvia de ideas', 'exploran', 'plenaria', 'rescat', 'preguntas detonad'
        ]);
        addCheck('nem', 'Apertura como diagnóstico activo', hayEscucha,
            'La apertura explora saberes e intereses del estudiantado',
            'La apertura parece solo introducción al tema, no diagnóstico',
            'Considera iniciar con escucha: agrega una exploración de gustos, saberes y desafíos del grupo.');

        const hayConsenso = contieneAlguna(apertura, [
            'consens', 'acuerd', 'negocia', 'criterios de evaluación', 'deciden', 'proponen', 'eligen', 'participativa', 'contextualiz'
        ]);
        addCheck('nem', 'Democracia participativa', hayConsenso,
            'El estudiantado participa en definir producto y/o criterios',
            'No se observa que el grupo consense producto o criterios',
            'Agrega en la apertura un momento donde el grupo acuerde el producto esperado y los criterios de evaluación.');

        // Desarrollo: micro-intervenciones y preguntas metacognitivas
        const hayMetacognicion = contieneAlguna(desarrollo, [
            '¿cómo llegaste', 'metacogn', 'pregunta', 'bitácora', 'registro de dudas', 'circula', 'monitorea', 'acompaña', 'observación'
        ]);
        addCheck('nem', 'Micro-intervenciones focalizadas', hayMetacognicion,
            'El docente acompaña con preguntas metacognitivas o registro',
            'El desarrollo no muestra intervención metacognitiva del docente',
            'Considera acompañar con preguntas como "¿Cómo llegaste a esa conclusión?" y registre en bitácora.');

        // Cierre: asamblea de reflexión, no juicio final
        const hayReflexionCierre = contieneAlguna(cierre, [
            'reflexi', 'asamblea', 'autoevalua', 'metacogn', 'cómo nos sentimos', 'coevalua', 'socializ', 'dialog'
        ]);
        addCheck('nem', 'Cierre como asamblea de reflexión', hayReflexionCierre,
            'El cierre incluye reflexión colectiva, no solo entrega',
            'No se detectaron las expresiones previstas para reflexión en el cierre',
            'Convierte el cierre en asamblea: reflexión sobre lo técnico (¿cumplimos los criterios?) y lo humano (¿cómo nos sentimos?).');

        // Sentido social / utilidad comunitaria
        const haySentidoSocial = !!plan.paec?.isLinked && !!plan.paec.communityProblem;
        if (plan.paec?.estado === 'sin_vinculo') {
            results.push({ id: 'Sentido social y vínculo comunitario', group: 'nem', label: 'Sentido social y vínculo comunitario', status: 'notapplicable', message: 'Elegiste una actividad de aula sin vinculación PAEC. No se considera una carencia.' });
        } else addCheck('nem', 'Sentido social y vínculo comunitario', haySentidoSocial,
            `Vinculado a: "${plan.paec?.communityProblem?.substring(0, 60) || ''}"`,
            'No se detectó una vinculación comunitaria explícita; revisa si corresponde a esta clase',
            'Si esta clase se vincula a un proyecto comunitario, comprueba su problemática y el acuerdo del plantel.',
            true);

        // ─── 3. EVALUACIÓN FORMATIVA (Fichas 03 y 18) ───────────────
        addCheck('evaluacion', 'Instrumentos de evaluación', !!plan.evaluationTable && plan.evaluationTable.length > 0,
            'Tabla de evaluación con instrumentos y criterios',
            'No se detectaron instrumentos de evaluación',
            'Activa la casilla de instrumento de evaluación y regenera.');

        const ciclo = plan.feedbackCycle;
        const cicloCompleto = !!ciclo?.whereGoing?.trim() && !!ciclo?.whereIs?.trim() && !!ciclo?.howToGetThere?.trim();
        addCheck('evaluacion', 'Ciclo de retroalimentación (3 preguntas)', cicloCompleto,
            'Incluye ¿hacia dónde va?, ¿dónde está? y ¿cómo llegar ahí?',
            'Falta alguna de las tres preguntas del ciclo del MCCEMS',
            'Completa la descripción del ciclo: meta, evidencia del punto actual y ruta concreta de mejora.',
            true);

        // La Ficha 18 insiste: sugerencias concretas, no genéricas
        const sugerenciaGenerica = contieneAlguna((ciclo?.howToGetThere || '').toLowerCase(), [
            'estudiar más', 'esforzarse más', 'poner atención', 'echarle ganas', 'practicar más', 'mejorar su desempeño'
        ]);
        addCheck('evaluacion', 'Retroalimentación concreta', cicloCompleto && !sugerenciaGenerica,
            'Hay una ruta de mejora y no se detectaron las frases genéricas buscadas; revisa su utilidad',
            sugerenciaGenerica ? 'La retroalimentación usa frases genéricas tipo "estudiar más"' : 'Aún no hay retroalimentación que evaluar',
            'Concreta las sugerencias: qué rehacer, de qué evidencia y para cuándo.');

        // Coevaluación / autoevaluación (horizontalidad y metacognición)
        const hayEvaluacionDialogica = contieneAlguna(todo, ['coevalua', 'autoevalua', 'entre pares', 'espejo', 'diana']);
        addCheck('evaluacion', 'Autoevaluación y coevaluación', hayEvaluacionDialogica,
            'Incluye procesos de auto o coevaluación',
            'No se detectaron las expresiones previstas para autoevaluación o coevaluación',
            'Agrega un instrumento dialógico: entrevista en espejo, diana de participación o bitácora de dudas.');

        // ─── 4. EQUIDAD E INCLUSIÓN (Fichas 08 y 13) ────────────────
        const hayDUA = !!plan.duaStrategies?.trim() || contieneAlguna(todo, ['[ajuste bap]', 'dua', 'ajuste razonable', 'diversificad', 'barrera']);
        addCheck('equidad', 'Atención a las BAP / DUA', hayDUA,
            'Incluye ajustes para barreras de aprendizaje',
            'No se declaran ajustes para atender las BAP',
            'Marca las barreras detectadas en la Fase 2 del Flujo de Contextualización y elige estrategias.');

        const hayAdaptacionGrupo = contieneAlguna(todo, ['[adaptación al grupo]', 'adaptación al grupo']);
        addCheck('equidad', 'Adaptación al grupo real', hayAdaptacionGrupo,
            'Al menos una actividad está adaptada al diagnóstico del grupo',
            'No se detectó la etiqueta de adaptación; revisa si las actividades responden al diagnóstico',
            'Llena el diagnóstico del grupo (Fase 1) y mantén activa la casilla "Considerar Diagnóstico de Alumnos".');

        // Ficha 13: lenguaje incluyente (evitar masculino genérico)
        const hayLenguajeIncluyente = contieneAlguna(todo, [
            'estudiantado', 'las y los', 'los y las', 'alumnado', 'e students'
        ]);
        addCheck('equidad', 'Lenguaje incluyente', hayLenguajeIncluyente,
            'Usa lenguaje incluyente ("el estudiantado", "las y los")',
            'La búsqueda automática no encontró las expresiones previstas; no permite concluir que el lenguaje sea excluyente.',
            'Lee las consignas y comprueba que todas las personas estén representadas; otras expresiones también pueden ser incluyentes.');

        // ─── 5. LISTA DE COTEJO DE LA ATP ───────────────────────────
        // Un punto por renglón de la lista con que se revisa la planeación entregada.
        // Aquí solo va lo que se puede verificar leyendo el plan; lo pedagógico ya
        // quedó cubierto en los grupos anteriores.

        const meta = plan.meta;
        const identificacionCompleta =
            !!meta?.componente && !!meta?.areaOrRecurso?.trim() && meta?.semester != null;
        addCheck('cotejo', 'Datos de identificación', identificacionCompleta,
            'Componente de formación, área/recurso y semestre están declarados',
            `Falta declarar: ${[!meta?.componente && 'componente de formación', !meta?.areaOrRecurso?.trim() && 'área o recurso', meta?.semester == null && 'semestre'].filter(Boolean).join(', ')}`,
            'Completa los datos de tu grupo y coteja los curriculares con la fuente aplicable.');

        // Formación Laboral y Currículum Fundamental se revisan con listas distintas:
        // la laboral pide Actividad Clave y competencias laborales donde la otra pide
        // progresiones y aprendizajes de trayectoria.
        const esLaboral = plan.meta?.componente === 'laboral';
        const ce = plan.curricularElements;
        const lab = plan.laboral;

        if (esLaboral) {
            addCheck('cotejo', 'Actividad Clave', !!lab?.actividadClave?.trim(),
                'Se declara la Actividad Clave del programa oficial',
                'Falta la Actividad Clave',
                'Es el eje de la planeación laboral. Elige el submódulo en el formulario para que se copie del programa oficial.',
                true);

            addCheck('cotejo', 'Resultado de Aprendizaje (Competencia Laboral Básica)',
                !!lab?.competenciaLaboralBasica?.trim(),
                'Se declara la Competencia Laboral Básica',
                'Falta la Competencia Laboral Básica',
                'Se copia literal del programa oficial: es el texto que la ATP coteja.',
                true);

            addCheck('cotejo', 'Competencias laborales', !!lab?.competenciasLaborales?.length,
                `${lab?.competenciasLaborales?.length} competencias laborales declaradas`,
                'No se declaran las competencias laborales que se desarrollan',
                'La lista de cotejo laboral las pide junto a la Actividad Clave y el Resultado de Aprendizaje.');

            addCheck('cotejo', 'Contenidos a abordar', !!lab?.contenidos?.length,
                `${lab?.contenidos?.length} contenidos declarados`,
                'No se especifican los contenidos que se abordan',
                'Se derivan del análisis de las actividades para el desarrollo de la competencia laboral.');

            addCheck('cotejo', 'Habilidades para la Vida y el Trabajo', !!lab?.habilidadesVidaTrabajo?.trim(),
                'Declara el vínculo con Habilidades para la Vida y el Trabajo',
                'Falta el vínculo con Habilidades para la Vida y el Trabajo',
                'La transversalidad del componente laboral lo pide explícitamente.');

            addCheck('cotejo', 'Educación para el Desarrollo Sostenible', !!lab?.desarrolloSostenible?.trim(),
                'Declara el vínculo con conceptos de desarrollo sostenible',
                'Falta el vínculo con la educación para el desarrollo sostenible',
                'La lista de cotejo laboral lo pide dentro de la transversalidad curricular.');
        } else {
            addCheck('cotejo', 'Contenidos a abordar', !!ce?.contents?.length,
                `${ce?.contents?.length} contenidos declarados`,
                'No se especifican los contenidos que se abordan',
                'La lista pide los contenidos derivados del análisis de las progresiones y las metas.');

            addCheck('cotejo', 'Aprendizajes de trayectoria', !!ce?.trajectoryLearning?.length,
                'Se declaran los aprendizajes de trayectoria',
                'No se declaran aprendizajes de trayectoria',
                'Coteja los aprendizajes con la fuente registrada. Si no están disponibles, deja constancia del cotejo pendiente.');
        }

        if (plan.paec?.isLinked) {
            addCheck('cotejo', 'Nombre del PEC', !!plan.paec.pecName?.trim(),
                `PEC: "${plan.paec.pecName}"`,
                'La planeación se vincula al PAEC pero no nombra el Proyecto Escolar Comunitario',
                'Escribe el nombre del PEC en la sección PAEC del formulario.');

            addCheck('cotejo', 'Productos que evidencian el PEC', !!plan.paec.pecProducts?.length,
                'Declara los productos con que se evidencia el aprendizaje en el PEC',
                'Faltan los productos que evidencian el aprendizaje dentro del PEC',
                'Es un punto aparte de los productos de la secuencia: qué entrega el estudiantado para el proyecto comunitario.');
        }

        addCheck('cotejo', 'Transversalidad', !!plan.fundamento?.transversalityLink?.trim(),
            'Incluye una explicación de transversalidad; requiere revisión docente',
            'No se declara la transversalidad',
            'Explica la relación pertinente con otros aprendizajes. Solo incorpora PEC si elegiste vincular esta clase.');

        // La lista de cotejo de Formación Laboral no pide estudio independiente.
        if (!esLaboral) {
            addCheck('cotejo', 'Estudio independiente', !!plan.independentStudy?.activities?.trim(),
                'Declara actividades de estudio independiente',
                'No hay actividades de estudio independiente',
                'Deben corresponder al tiempo semanal (HI) de la estructura del programa.');
        }

        // Debe decir DOS cosas: si es individual o grupal, y cuándo.
        const estrategia = (plan.independentStudy?.feedbackStrategy || '').toLowerCase();
        const diceModalidad = contieneAlguna(estrategia, ['individual', 'grupal', 'grupo', 'equipo', 'pares']);
        const diceMomento = contieneAlguna(estrategia, [
            'sesión', 'sesion', 'clase', 'cierre', 'inicio', 'semana', 'antes', 'después', 'despues', 'al final', 'durante'
        ]);
        addCheck('cotejo', 'Retroalimentación: modalidad y momento', diceModalidad && diceMomento,
            'Especifica si es individual o grupal y en qué momento',
            !estrategia
                ? 'No se declara la estrategia de retroalimentación'
                : `Falta ${!diceModalidad ? 'decir si es individual o grupal' : 'decir en qué momento se realiza'}`,
            'Indica ambas cosas. Ejemplo: "Grupal al cierre de cada sesión e individual por escrito al devolver el reporte en la sesión 4".');

        addCheck('cotejo', 'Dinámicas de trabajo colaborativo', !!plan.collaborativeWork?.trim(),
            'Declara dinámicas concretas de trabajo colaborativo',
            'No se declaran dinámicas de trabajo colaborativo',
            'No basta con decir "trabajo en equipo": describe cómo se forman los equipos y qué rol tiene cada quien.');

        addCheck('cotejo', 'Productos a realizar', !!plan.products?.length,
            `${plan.products?.length} productos declarados`,
            'No hay una lista de productos del estudiantado',
            'Son las evidencias que elabora el estudiantado: mapa conceptual, reporte, maqueta, coreografía…');

        // Ponderación, momento y agente: la lista los revisa como un solo punto pero
        // con tres condiciones, así que se separan para que el docente sepa cuál falla.
        const tabla = plan.evaluationTable || [];
        const suma = tabla.reduce((s, f) => s + (f.percentage || 0), 0);
        addCheck('cotejo', 'La ponderación suma 100%', tabla.length > 0 && suma === 100,
            'Los porcentajes suman exactamente 100%',
            tabla.length === 0 ? 'No hay tabla de evaluación' : `Los porcentajes suman ${suma}%, no 100%`,
            'Ajusta los porcentajes en la tabla de evaluación antes de entregar.',
            true);

        const moment0 = tabla.every(f => !!f.moment?.trim() && f.moment !== 'Por definir');
        addCheck('cotejo', 'Momento de evaluación en cada renglón', tabla.length > 0 && moment0,
            'Cada instrumento indica si es diagnóstica, formativa o sumativa',
            'Algún instrumento no declara su momento de evaluación',
            'Cada renglón debe decir si es diagnóstica, formativa o sumativa.');

        const agentesValidos = tabla.every(f => contieneAlguna((f.agent || '').toLowerCase(), ['auto', 'co', 'hetero']));
        addCheck('cotejo', 'Agente de evaluación en cada renglón', tabla.length > 0 && agentesValidos,
            'Cada instrumento declara su agente evaluador',
            'Algún instrumento no declara agente (autoevaluación, coevaluación o heteroevaluación)',
            'El agente es QUIÉN evalúa. No pongas "Docente": pon "Heteroevaluación".');

        addCheck('cotejo', 'Materiales y recursos', !!plan.resources?.length,
            `${plan.resources?.length} recursos enunciados`,
            'No se enuncian materiales ni recursos',
            'La lista pide enunciar materiales, recursos y referencias.');

        addCheck('cotejo', 'Referencias', !!plan.references?.length,
            `${plan.references?.length} referencias enunciadas`,
            'No se enuncian referencias',
            'Registra las fuentes realmente utilizadas; distingue las sugeridas y las pendientes de cotejo.');

        // Sin programa aplicable, estos elementos no se califican como carencias curriculares.
        if (!programaOficial && !esLaboral) {
            for (const item of results) {
                if (item.label === 'Aprendizajes de trayectoria') {
                    item.status = 'unavailable';
                    item.message = 'Sin programa aplicable confirmado no se pueden cotejar estos aprendizajes.';
                    item.fix = 'Revisa el programa que corresponde a tu grupo; no inventes elementos oficiales.';
                }
            }
        }
        return { results, referencia,
            detectados: results.filter(r => r.status === 'pass').length,
            pendientes: results.filter(r => r.status === 'warning' || r.status === 'fail').length,
            noAplican: results.filter(r => r.status === 'notapplicable').length,
            noEvaluables: results.filter(r => r.status === 'unavailable').length };

}
