/**
 * Contrato de la planeación de FORMACIÓN LABORAL BÁSICA.
 *
 * Va aparte del fundamental porque es otro modelo curricular, no una variante:
 *   fundamental → Progresión · Metas de aprendizaje · Categorías
 *   laboral     → Módulo · Submódulo · Competencia Laboral Básica · Actividad clave
 * Pedirle al modelo un esquema con progresiones para una UAC laboral es lo que hace
 * que salgan planeaciones que la asesoría técnico-pedagógica regresa a la primera.
 *
 * Diferencias frente al fundamental, tomadas de la lista de cotejo de la ATP:
 *   - NO lleva estudio independiente (esa lista no lo pide)
 *   - la transversalidad suma Habilidades para la Vida y el Trabajo, y los conceptos
 *     centrales de la educación para el desarrollo sostenible
 *   - la actividad clave es texto oficial: la secuencia la desarrolla, no la sustituye
 */
import { Type } from "@google/genai";
import { SchoolContext } from "../types";

export function construirSystemInstructionLaboral(args: {
    contextoOficial: string;
    school: Pick<SchoolContext, 'schoolName' | 'vision'>;
    prompt: string;
    bloquePerfil?: string;
}): string {
    const { contextoOficial, school, prompt, bloquePerfil = '' } = args;
    return `
    Eres un experto pedagogo de la DGB/SEP especializado en FORMACIÓN LABORAL BÁSICA
    del MCCEMS. Generas planeaciones didácticas profesionales pero CONCISAS.

    REGLAS CRÍTICAS:
    1. BREVEDAD: describe las actividades de forma directa (máx 2-3 enunciados por celda).
    2. RESPUESTA: solo el JSON válido, sin texto adicional.
    3. IDIOMA: español.
    4. SECUENCIA: genera EXACTAMENTE el número de sesiones solicitado.

    ESTO ES FORMACIÓN LABORAL, NO CURRÍCULUM FUNDAMENTAL:
    5. NO existen progresiones, ni metas de aprendizaje, ni categorías. No las menciones.
    6. La ACTIVIDAD CLAVE del programa oficial es el eje de toda la planeación. Tu
       secuencia la DESARROLLA paso a paso a lo largo de las sesiones: no la sustituyas
       por otra actividad ni la resumas. Repártela en inicio, desarrollo y cierre.
    7. La COMPETENCIA LABORAL BÁSICA es el resultado de aprendizaje esperado. Cópiala
       literal del programa oficial en laboral.competenciaLaboralBasica.
    8. CONTENIDOS: dedúcelos de las actividades necesarias para desarrollar la
       competencia laboral, y ponlos en laboral.contenidos.
    9. SENTIDO LABORAL REAL: las actividades deben conectar con el desempeño en un
       sitio de inserción laboral real del entorno del plantel, no quedarse en el aula.

    TRANSVERSALIDAD DEL COMPONENTE LABORAL (la lista de cotejo la revisa completa):
    10. transversalityLink: cómo se vincula con otras UAC y con el Proyecto Escolar
        Comunitario (PEC).
    11. laboral.habilidadesVidaTrabajo: qué Habilidades para la Vida y el Trabajo se
        desarrollan y en qué actividad concreta.
    12. laboral.desarrolloSostenible: con qué conceptos centrales de la educación para
        el desarrollo sostenible se vincula y cómo.
    13. socioemotionalLink: vínculo con el ámbito de formación socioemocional.

    ENFOQUE NEM MODELO 2025 (así lo revisa la supervisión escolar):
    14. APERTURA: diagnóstico activo con escucha empática; el estudiantado contextualiza
        la actividad a su entorno y se consensúan producto y criterios de evaluación.
    15. DESARROLLO: micro-intervenciones del docente con preguntas metacognitivas
        explícitas ("¿Cómo llegaste a esa conclusión?", "¿Cómo se hace esto en un taller
        de verdad?").
    16. CIERRE: asamblea de reflexión, nunca un juicio final. Dos ejes: lo técnico
        (¿cumplimos los criterios?) y lo humano (¿cómo nos sentimos?).
    17. ERROR: oportunidad de aprendizaje, nunca algo punitivo.
    18. LENGUAJE INCLUYENTE: "el estudiantado", "las y los estudiantes".

    LISTA DE COTEJO DE LA ASESORÍA TÉCNICO-PEDAGÓGICA (si un punto falta, la
    planeación se regresa al docente):
    19. EVALUACIÓN — cada renglón de evaluationTable lleva sus cinco datos:
        - moment: "Diagnóstica", "Formativa" o "Sumativa"
        - agent: "Autoevaluación", "Coevaluación" o "Heteroevaluación" (es QUIÉN evalúa;
          nunca escribas "Docente")
        - instrument, percentage y criteria
        LA SUMA DE LOS PORCENTAJES DEBE DAR EXACTAMENTE 100.
        Si el contexto oficial te dio un INSTRUMENTO DE EVALUACIÓN, úsalo tal cual en
        lugar de inventar otro.
    20. RETROALIMENTACIÓN — feedbackStrategy dice SIEMPRE dos cosas: si es INDIVIDUAL o
        GRUPAL, y EN QUÉ MOMENTO ocurre.
    21. TRABAJO COLABORATIVO — collaborativeWork describe la dinámica concreta (equipos
        de cuántos, cómo se forman, qué rol tiene cada quien). No basta "trabajo en equipo".
    22. PRODUCTOS — "products" son las evidencias que elabora el estudiantado y deben
        coincidir con las declaradas en las sesiones.
    23. PEC — si se vincula a un Proyecto Escolar Comunitario, escribe su nombre en
        paec.pecName y en paec.pecProducts los productos con que se evidencia el
        aprendizaje dentro del PEC.
    24. REFERENCIAS — llena "references" con fuentes reales y verificables. No inventes
        libros ni autores: si no tienes una referencia real, cita el programa oficial.
    25. CICLO DE RETROALIMENTACIÓN: llena feedbackCycle con las tres preguntas. En
        "howToGetThere" da sugerencias CONCRETAS (mal: "practicar más"; bien: "repetir
        el modelado en cera del cubo 2 corrigiendo la cara oclusal antes del viernes").

    ${contextoOficial}

    CONTEXTO ESCUELA: ${school.schoolName}, ${school.vision}.
    SOLICITUD: "${prompt}"
    ${bloquePerfil}
  `;
}

const MOMENTO_SECUENCIA = {
    type: Type.OBJECT,
    properties: {
        activity: { type: Type.STRING },
        studentActivity: { type: Type.STRING },
        time: { type: Type.STRING },
        evidence: { type: Type.STRING },
    },
};

export const PLAN_LABORAL_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        date: { type: Type.STRING },
        subject: { type: Type.STRING },
        meta: {
            type: Type.OBJECT,
            properties: {
                teacher: { type: Type.STRING },
                cycle: { type: Type.STRING },
                period: { type: Type.STRING },
                gradeGroup: { type: Type.STRING },
                totalSessions: { type: Type.NUMBER },
                hoursPerWeek: { type: Type.NUMBER },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                methodology: { type: Type.STRING },
            },
        },
        laboral: {
            type: Type.OBJECT,
            properties: {
                competenciaLaboralBasica: { type: Type.STRING },
                actividadClave: { type: Type.STRING },
                competenciasLaborales: { type: Type.ARRAY, items: { type: Type.STRING } },
                contenidos: { type: Type.ARRAY, items: { type: Type.STRING } },
                habilidadesVidaTrabajo: { type: Type.STRING },
                desarrolloSostenible: { type: Type.STRING },
            },
            required: [
                'competenciaLaboralBasica', 'actividadClave', 'competenciasLaborales',
                'contenidos', 'habilidadesVidaTrabajo', 'desarrolloSostenible',
            ],
        },
        context: {
            type: Type.OBJECT,
            properties: {
                diagnosis: { type: Type.STRING },
                studentProfile: { type: Type.STRING },
            },
        },
        paec: {
            type: Type.OBJECT,
            properties: {
                isLinked: { type: Type.BOOLEAN },
                communityProblem: { type: Type.STRING },
                projectTrigger: { type: Type.STRING },
                pecName: { type: Type.STRING },
                pecProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
        fundamento: {
            type: Type.OBJECT,
            properties: {
                progressionJustification: { type: Type.STRING },
                transversalityLink: { type: Type.STRING },
                socioemotionalLink: { type: Type.STRING },
                socioemotionalScope: { type: Type.STRING },
                socioemotionalMeta: { type: Type.STRING },
                socioemotionalContent: { type: Type.STRING },
            },
            required: ['progressionJustification', 'transversalityLink', 'socioemotionalLink'],
        },
        products: { type: Type.ARRAY, items: { type: Type.STRING } },
        collaborativeWork: { type: Type.STRING },
        sessions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sessionNumber: { type: Type.NUMBER },
                    date: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    sequence: {
                        type: Type.OBJECT,
                        properties: {
                            opening: MOMENTO_SECUENCIA,
                            development: MOMENTO_SECUENCIA,
                            closing: MOMENTO_SECUENCIA,
                        },
                        required: ['opening', 'development', 'closing'],
                    },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
        },
        evaluationTable: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    instrument: { type: Type.STRING },
                    percentage: { type: Type.NUMBER },
                    moment: { type: Type.STRING },
                    agent: { type: Type.STRING },
                    criteria: { type: Type.STRING },
                },
                required: ['instrument', 'percentage', 'moment', 'agent', 'criteria'],
            },
        },
        feedbackStrategy: { type: Type.STRING },
        feedbackCycle: {
            type: Type.OBJECT,
            properties: {
                whereGoing: { type: Type.STRING },
                whereIs: { type: Type.STRING },
                howToGetThere: { type: Type.STRING },
            },
            required: ['whereGoing', 'whereIs', 'howToGetThere'],
        },
        resources: { type: Type.ARRAY, items: { type: Type.STRING } },
        references: { type: Type.ARRAY, items: { type: Type.STRING } },
        duaStrategies: { type: Type.STRING },
        evaluation: { type: Type.STRING },
        duration: { type: Type.STRING },
    },
    required: [
        'title', 'subject', 'sessions', 'meta', 'laboral', 'evaluationTable',
        'fundamento', 'products', 'collaborativeWork', 'resources', 'references',
        'feedbackStrategy', 'feedbackCycle',
    ],
} as const;
