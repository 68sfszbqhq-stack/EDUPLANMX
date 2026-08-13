import React, { useMemo } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, BookOpen } from 'lucide-react';
import { LessonPlan } from '../types';
import { programasSEPService } from '../src/services/programasSEPService';

interface PedagogicalAuditorProps {
    plan: LessonPlan;
    subjectName: string;
    semestre?: number;
}

type AuditStatus = 'pass' | 'warning' | 'fail';
type AuditGroup = 'estructura' | 'nem' | 'evaluacion' | 'equidad' | 'cotejo';

interface AuditItem {
    id: string;
    group: AuditGroup;
    label: string;
    status: AuditStatus;
    message: string;
    /** Qué debe hacer el docente si no pasó. Se muestra tal cual: es la acción correctiva. */
    fix?: string;
}

const GRUPOS: Record<AuditGroup, { titulo: string; fuente: string }> = {
    estructura: { titulo: 'Estructura curricular', fuente: 'MCCEMS · programa oficial' },
    nem: { titulo: 'Enfoque NEM Modelo 2025', fuente: 'Ficha 01 · así lo revisa supervisión' },
    evaluacion: { titulo: 'Evaluación formativa', fuente: 'Fichas 03 y 18 · ciclo de retroalimentación' },
    equidad: { titulo: 'Equidad e inclusión', fuente: 'Fichas 08 y 13 · BAP y perspectiva de género' },
    cotejo: { titulo: 'Lista de cotejo de la ATP', fuente: 'Asesoría Técnico-Pedagógica · así se revisa la entrega' },
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

export const PedagogicalAuditor: React.FC<PedagogicalAuditorProps> = ({ plan, subjectName, semestre }) => {

    const auditResults = useMemo(() => {
        const results: AuditItem[] = [];
        let score = 0;
        let maxScore = 0;

        const addCheck = (
            group: AuditGroup,
            label: string,
            condition: boolean,
            successMsg: string,
            failMsg: string,
            fix?: string,
            isCritical = false
        ) => {
            const peso = isCritical ? 20 : 10;
            maxScore += peso;
            if (condition) {
                score += peso;
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
        const programas = programasSEPService.buscarPorMateria(subjectName);
        const programaOficial = programas.find(p => !semestre || p.semestre === semestre) || programas[0];

        let isOfficialProgression = false;
        let progressionId = 'No identificado';
        if (programaOficial && plan.progression) {
            const match = programaOficial.progresiones.find(p =>
                plan.progression.includes(p.descripcion.substring(0, 50)) ||
                p.descripcion.includes(plan.progression.substring(0, 50))
            );
            if (match) {
                isOfficialProgression = true;
                progressionId = match.id.toString();
            }
        }

        addCheck('estructura', 'Alineación de progresión', isOfficialProgression,
            `Progresión oficial detectada (ID: ${progressionId})`,
            programaOficial ? 'La progresión no coincide con el catálogo oficial' : 'No hay programa oficial para validar',
            'Selecciona la progresión desde el catálogo del generador en lugar de escribirla a mano.',
            true);

        addCheck('estructura', 'Secuencia didáctica', (!!plan.sessions && plan.sessions.length > 0) || !!plan.sequence,
            'Secuencia completa (apertura, desarrollo y cierre)',
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
            'La Ficha 01 pide iniciar con escucha empática: agrega una exploración de gustos, saberes y desafíos del grupo.');

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
            'La Ficha 01 pide que el docente circule haciendo preguntas como "¿Cómo llegaste a esa conclusión?" y registre en bitácora.');

        // Cierre: asamblea de reflexión, no juicio final
        const hayReflexionCierre = contieneAlguna(cierre, [
            'reflexi', 'asamblea', 'autoevalua', 'metacogn', 'cómo nos sentimos', 'coevalua', 'socializ', 'dialog'
        ]);
        addCheck('nem', 'Cierre como asamblea de reflexión', hayReflexionCierre,
            'El cierre incluye reflexión colectiva, no solo entrega',
            'El cierre parece un juicio final (solo entrega o calificación)',
            'Convierte el cierre en asamblea: reflexión sobre lo técnico (¿cumplimos los criterios?) y lo humano (¿cómo nos sentimos?).');

        // Sentido social / utilidad comunitaria
        const haySentidoSocial = !!plan.paec?.isLinked && !!plan.paec.communityProblem;
        addCheck('nem', 'Sentido social y vínculo comunitario', haySentidoSocial,
            `Vinculado a: "${plan.paec?.communityProblem?.substring(0, 60) || ''}"`,
            'Sin problemática comunitaria: el producto no tiene utilidad social declarada',
            'Captura la problemática del entorno en la Fase 3 del Flujo de Contextualización.',
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
            'El MCCEMS exige el ciclo completo: meta, evidencia del punto actual y ruta concreta de mejora.',
            true);

        // La Ficha 18 insiste: sugerencias concretas, no genéricas
        const sugerenciaGenerica = contieneAlguna((ciclo?.howToGetThere || '').toLowerCase(), [
            'estudiar más', 'esforzarse más', 'poner atención', 'echarle ganas', 'practicar más', 'mejorar su desempeño'
        ]);
        addCheck('evaluacion', 'Retroalimentación concreta', cicloCompleto && !sugerenciaGenerica,
            'Las sugerencias son accionables, no genéricas',
            sugerenciaGenerica ? 'La retroalimentación usa frases genéricas tipo "estudiar más"' : 'Aún no hay retroalimentación que evaluar',
            'La Ficha 18 pide pasar de sugerencias genéricas a concretas: qué rehacer, de qué evidencia y para cuándo.');

        // Coevaluación / autoevaluación (horizontalidad y metacognición)
        const hayEvaluacionDialogica = contieneAlguna(todo, ['coevalua', 'autoevalua', 'entre pares', 'espejo', 'diana']);
        addCheck('evaluacion', 'Autoevaluación y coevaluación', hayEvaluacionDialogica,
            'Incluye procesos de auto o coevaluación',
            'Solo se observa heteroevaluación (el docente califica)',
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
            'No hay actividades marcadas como adaptadas a tu grupo',
            'Llena el diagnóstico del grupo (Fase 1) y mantén activa la casilla "Considerar Diagnóstico de Alumnos".');

        // Ficha 13: lenguaje incluyente (evitar masculino genérico)
        const hayLenguajeIncluyente = contieneAlguna(todo, [
            'estudiantado', 'las y los', 'los y las', 'alumnado', 'e students'
        ]);
        addCheck('equidad', 'Lenguaje incluyente', hayLenguajeIncluyente,
            'Usa lenguaje incluyente ("el estudiantado", "las y los")',
            'Predomina el masculino genérico ("los alumnos")',
            'La Ficha 13 pide lenguaje no sexista: cambia "los alumnos" por "el estudiantado" o "las y los estudiantes".');

        // ─── 5. LISTA DE COTEJO DE LA ATP ───────────────────────────
        // Un punto por renglón de la lista con que se revisa la planeación entregada.
        // Aquí solo va lo que se puede verificar leyendo el plan; lo pedagógico ya
        // quedó cubierto en los grupos anteriores.

        const meta = plan.meta;
        const identificacionCompleta =
            !!meta?.componente && !!meta?.areaOrRecurso?.trim() && meta?.semester != null;
        addCheck('cotejo', 'Datos de identificación', identificacionCompleta,
            'Componente de formación, área/recurso y semestre están declarados',
            'Faltan datos de identificación (componente de formación, área o recurso, semestre)',
            'Genera de nuevo desde el formulario: estos datos salen del programa oficial, no se escriben a mano.');

        const ce = plan.curricularElements;
        addCheck('cotejo', 'Contenidos a abordar', !!ce?.contents?.length,
            `${ce?.contents?.length} contenidos declarados`,
            'No se especifican los contenidos que se abordan',
            'La lista pide los contenidos derivados del análisis de las progresiones y las metas.');

        addCheck('cotejo', 'Aprendizajes de trayectoria', !!ce?.trajectoryLearning?.length,
            'Se declaran los aprendizajes de trayectoria',
            'No se declaran aprendizajes de trayectoria',
            'Se toman del programa oficial de la UAC. Si no vienen ahí, captúralos a mano antes de entregar.');

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
            'Declara el vínculo con otras UAC y con el PEC',
            'No se declara la transversalidad',
            'Indica brevemente cómo se vincula con otras UAC, con el PEC y con el ámbito socioemocional.');

        addCheck('cotejo', 'Estudio independiente', !!plan.independentStudy?.activities?.trim(),
            'Declara actividades de estudio independiente',
            'No hay actividades de estudio independiente',
            'Deben corresponder al tiempo semanal (HI) de la estructura del programa.');

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
            'La ATP revisa las dos cosas por separado. Ejemplo: "Grupal al cierre de cada sesión e individual por escrito al devolver el reporte en la sesión 4".');

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
            'Cita al menos el programa de estudios oficial de la UAC.');

        const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const criticosFallidos = results.filter(r => r.status === 'fail').length;

        return { results, finalScore, programaOficial, criticosFallidos };
    }, [plan, subjectName, semestre]);

    const { results, finalScore, programaOficial, criticosFallidos } = auditResults;

    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (s >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const veredicto = criticosFallidos > 0
        ? { texto: 'Ajustar antes de entregar', clase: 'bg-red-50 text-red-700 border-red-200' }
        : finalScore >= 80
            ? { texto: 'Lista para entregar a supervisión', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
            : { texto: 'Revisa las observaciones antes de entregar', clase: 'bg-amber-50 text-amber-700 border-amber-200' };

    const grupos = Object.keys(GRUPOS) as AuditGroup[];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Auditoría Pedagógica MCCEMS</h3>
                        <p className="text-xs text-slate-500">Mismo criterio con que la revisa la supervisión escolar</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-bold text-xl flex items-center gap-2 ${getScoreColor(finalScore)}`}>
                    <span>{finalScore}%</span>
                    <span className="text-xs font-normal uppercase tracking-wider opacity-80">Cumplimiento</span>
                </div>
            </div>

            <div className={`px-6 py-3 border-b text-sm font-bold ${veredicto.clase}`}>
                {criticosFallidos > 0 ? '⚠️ ' : finalScore >= 80 ? '✅ ' : '📝 '}{veredicto.texto}
                {criticosFallidos > 0 && (
                    <span className="font-normal"> — {criticosFallidos} punto{criticosFallidos > 1 ? 's' : ''} crítico{criticosFallidos > 1 ? 's' : ''} sin cumplir.</span>
                )}
            </div>

            <div className="p-6 space-y-6">
                {grupos.map(g => {
                    const items = results.filter(r => r.group === g);
                    if (items.length === 0) return null;
                    const cumplidos = items.filter(i => i.status === 'pass').length;
                    return (
                        <div key={g}>
                            <div className="flex items-baseline justify-between mb-2">
                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    {GRUPOS[g].titulo}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                    {cumplidos}/{items.length} · {GRUPOS[g].fuente}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                                        {item.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                                        {item.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                                        {item.status === 'fail' && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-700 text-sm">{item.label}</p>
                                            <p className="text-xs text-slate-500">{item.message}</p>
                                            {item.fix && (
                                                <p className="text-xs text-indigo-600 mt-1">
                                                    <span className="font-bold">Cómo corregirlo: </span>{item.fix}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <h4 className="text-indigo-800 font-bold mb-2 flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4" />
                        Referencia oficial utilizada
                    </h4>
                    {programaOficial ? (
                        <div className="space-y-1 text-xs text-indigo-900/80">
                            <p><span className="font-semibold">Programa:</span> {programaOficial.materia} · Semestre {programaOficial.semestre}</p>
                            <p><span className="font-semibold">Categorías MCC:</span> {programaOficial.organizador_curricular?.categorias?.join(', ') || 'No definidas'}</p>
                            <p className="pt-2 border-t border-indigo-200 mt-2 text-indigo-700">
                                Además del programa oficial, este auditor aplica el checklist "Reflexionando sobre el
                                Modelo 2025" (Ficha 01), el ciclo de retroalimentación del MCCEMS (Fichas 03 y 18) y los
                                criterios de inclusión y perspectiva de género (Fichas 08 y 13).
                            </p>
                        </div>
                    ) : (
                        <div className="text-amber-700 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            No se encontró el programa oficial local para comparar; el resto de criterios sí se evaluó.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
