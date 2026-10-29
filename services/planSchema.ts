import { INSTRUCCIONES_PAQUETE, PAQUETE_PROPERTIES } from './paqueteClase';
/**
 * Contrato de la planeación: qué se le pide al modelo y con qué estructura responde.
 *
 * Vive aparte de geminiService.ts a propósito. Ese módulo arrastra Firebase (a través
 * del perfil docente), que solo existe dentro del navegador; al separar el contrato,
 * la prueba de humo puede verificarlo desde la terminal sin levantar la app entera.
 * Ver scripts/prueba-generacion.ts.
 */
import { Type } from "@google/genai";
import { SchoolContext } from "../types";

/**
 * Arma las instrucciones del sistema. Exportada para que la prueba de humo
 * (scripts/prueba-generacion.ts) mida el prompt real y no una aproximación.
 */
export function construirSystemInstruction(args: {
  contextoOficial: string;
  school: Pick<SchoolContext, 'schoolName' | 'vision'>;
  prompt: string;
  bloquePerfil?: string;
}): string {
  const { contextoOficial, school, prompt, bloquePerfil = '' } = args;
  return `
    Eres un asistente de planeación didáctica. Usa exclusivamente el modelo y programa seleccionados, sin atribuirte autoridad de la SEP.
    Tu objetivo es generar una planeación didáctica PROFESIONAL, pero CONCISA para evitar cortes de texto.
    
    ${INSTRUCCIONES_PAQUETE}

    REGLAS CRÍTICAS:
    1. BREVEDAD: Describe las actividades de forma directa (máx 2-3 enunciados por celda).
    2. PROGRESIONES: Usa el texto oficial proporcionado.
    3. SECUENCIA: Genera EXACTAMENTE el número de sesiones solicitado en el prompt.
    4. RESPUESTA: Solo devuelve el JSON válido sin texto adicional.
    5. IDIOMA: Español.

    ORIENTACIONES PEDAGÓGICAS (adaptar al tiempo, grupo y modelo elegido):
    6. APERTURA: no es solo introducción, es diagnóstico activo. Debe incluir escucha empática
       y democracia participativa: el estudiantado contextualiza la actividad a su entorno y
       se consensúan el producto esperado y los criterios de evaluación.
    7. DESARROLLO: incluye micro-intervenciones focalizadas del docente con preguntas
       metacognitivas explícitas (ej. "¿Cómo llegaste a esa conclusión?", "¿Qué otra ruta
       intentaste?", "¿Cómo se conecta esto con lo que vive tu comunidad?").
    8. CIERRE: es asamblea de reflexión, NUNCA un juicio final. Debe reflexionar en dos ejes:
       lo técnico (¿cumplimos los criterios acordados?) y lo humano (¿cómo nos sentimos?).
    9. ERROR: trátalo como oportunidad de aprendizaje, nunca de forma punitiva.
    10. CICLO DE RETROALIMENTACIÓN (MCCEMS): llena feedbackCycle con las tres preguntas.
        En "howToGetThere" da sugerencias CONCRETAS y accionables, NUNCA genéricas
        (mal: "estudiar más"; bien: "rehacer la tabla de verdad del caso 2 verificando
        la columna de la disyunción antes del viernes").
    11. LENGUAJE INCLUYENTE: usa "el estudiantado", "las y los estudiantes"; evita el
        masculino genérico y los estereotipos de género en los ejemplos.

    ELEMENTOS PARA LA REVISIÓN DOCENTE (no equivalen a aprobación institucional):
    12. RETROALIMENTACIÓN — independentStudy.feedbackStrategy debe decir SIEMPRE dos
        cosas: si es INDIVIDUAL o GRUPAL, y EN QUÉ MOMENTO ocurre.
        Mal: "se retroalimenta en clase".
        Bien: "Grupal al cierre de cada sesión e individual por escrito sobre el
        reporte, al devolverlo en la sesión 4".
    13. EVALUACIÓN — cada renglón de evaluationTable lleva sus cinco datos:
        - moment: exactamente uno de "Diagnóstica", "Formativa" o "Sumativa"
        - agent: exactamente uno de "Autoevaluación", "Coevaluación" o "Heteroevaluación"
          (es QUIÉN evalúa; no escribas "Docente" ni "Alumno")
        - instrument: el instrumento concreto (rúbrica, lista de cotejo, escala…)
        - percentage: la ponderación. LA SUMA DE TODOS DEBE DAR EXACTAMENTE 100.
        - criteria: qué se evalúa
        Usa pocos momentos viables en el tiempo disponible. La diagnóstica no tiene peso; reutiliza criterios para autoevaluación cuando corresponda.
    14. REFERENCIAS — llena "references" con las fuentes que el docente puede consultar
        y citar (libro con autor y año, programa oficial de la UAC, sitio verificable).
        No inventes libros ni autores: si no tienes una referencia real, cita el programa
        de estudios oficial de la UAC y materiales de la propia escuela.
    15. RECURSOS — "resources" es la lista maestra de materiales de toda la planeación,
        no solo de una sesión.
    16. CONTENIDOS — llena "curricularElements.contents" con los contenidos concretos
        que se abordan, derivados del análisis de la progresión y las metas. Son los
        temas del saber, no las actividades.
    17. APRENDIZAJES DE TRAYECTORIA — llena "curricularElements.trajectoryLearning"
        con los del área o recurso al que pertenece la UAC, tomados del programa
        oficial que se te proporcionó. Si no aparecen ahí, deja el arreglo vacío:
        NO los inventes.
    18. TRABAJO COLABORATIVO — "collaborativeWork" describe la dinámica concreta
        (equipos de cuántos, cómo se forman, qué rol tiene cada quien, cómo se
        reparte la responsabilidad). No basta decir "trabajo en equipo".
    19. PRODUCTOS — "products" es la lista de evidencias que elabora el estudiantado
        a lo largo de la planeación (mapa conceptual, maqueta, reporte, coreografía…).
        Deben coincidir con las evidencias declaradas en las sesiones.
    20. PEC — si la planeación se vincula a un Proyecto Escolar Comunitario, escribe
        su nombre en "paec.pecName" y en "paec.pecProducts" los productos con que el
        estudiantado evidencia su aprendizaje DENTRO del PEC (son distintos de los
        productos de la secuencia).
    21. FORMATO DEL PLANTEL — en cada momento de cada sesión escribe en "technique" la
        técnica didáctica en 2 a 5 palabras (ej. "Lluvia de ideas", "Rompecabezas",
        "Debate", "Análisis de caso"). Llena "curricularElements.centralConcept" con
        el concepto central de la secuencia en una frase.

    INFORMACIÓN OFICIAL: ${contextoOficial}
    CONTEXTO ESCUELA: ${school.schoolName}, ${school.vision}.
    SOLICITUD: "${prompt}"
    ${bloquePerfil}
  `;
}

/**
 * Esquema de salida que se le exige al modelo.
 *
 * Se exporta para que la prueba de humo (scripts/prueba-generacion.ts) valide
 * exactamente el mismo contrato que corre en producción, en vez de una copia
 * que se desincroniza al primer cambio.
 */
export const PLAN_RESPONSE_SCHEMA = {
          type: Type.OBJECT,
          properties: {
            ...PAQUETE_PROPERTIES,
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
                methodology: { type: Type.STRING }
              }
            },
            context: {
              type: Type.OBJECT,
              properties: {
                diagnosis: { type: Type.STRING },
                studentProfile: { type: Type.STRING }
              },
              required: ["diagnosis", "studentProfile"]
            },
            curricularElements: {
              type: Type.OBJECT,
              properties: {
                progression: { type: Type.STRING },
                progressionId: { type: Type.STRING },
                learningGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                subcategories: { type: Type.ARRAY, items: { type: Type.STRING } },
                trajectoryLearning: { type: Type.ARRAY, items: { type: Type.STRING } },
                contents: { type: Type.ARRAY, items: { type: Type.STRING } },
                uacSpecificElements: { type: Type.STRING },
                centralConcept: { type: Type.STRING }
              },
              required: ["progression", "learningGoals", "categories", "contents", "trajectoryLearning"]
            },
            paec: {
              type: Type.OBJECT,
              properties: {
                isLinked: { type: Type.BOOLEAN },
                communityProblem: { type: Type.STRING },
                projectTrigger: { type: Type.STRING },
                pecName: { type: Type.STRING },
                pecProducts: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            products: { type: Type.ARRAY, items: { type: Type.STRING } },
            collaborativeWork: { type: Type.STRING },
            fundamento: {
              type: Type.OBJECT,
              properties: {
                progressionJustification: { type: Type.STRING },
                sociocognitiveLink: { type: Type.STRING },
                socioemotionalLink: { type: Type.STRING },
                transversalityLink: { type: Type.STRING },
                // Sin estos tres, PlanDocument imprime un ámbito genérico de relleno
                // ("Bienestar socioemocional general / Fomentar la autorregulación")
                // que no corresponde a la planeación. Deben ser coherentes entre sí.
                socioemotionalScope: { type: Type.STRING },
                socioemotionalMeta: { type: Type.STRING },
                socioemotionalContent: { type: Type.STRING }
              },
              required: ["progressionJustification", "sociocognitiveLink"]
            },
            independentStudy: {
              type: Type.OBJECT,
              properties: {
                activities: { type: Type.STRING },
                feedbackLink: { type: Type.STRING },
                // La lista de cotejo exige decir SI es individual o grupal y CUÁNDO.
                // Sin esto el punto se marca incompleto aunque feedbackLink venga lleno.
                feedbackStrategy: { type: Type.STRING },
                resources: { type: Type.STRING },
                estimatedTime: { type: Type.STRING }
              },
              required: ["activities", "feedbackStrategy", "estimatedTime"]
            },
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
                      opening: { type: Type.OBJECT, properties: { activity: { type: Type.STRING }, studentActivity: { type: Type.STRING }, time: { type: Type.STRING }, evidence: { type: Type.STRING }, technique: { type: Type.STRING } } },
                      development: { type: Type.OBJECT, properties: { activity: { type: Type.STRING }, studentActivity: { type: Type.STRING }, time: { type: Type.STRING }, evidence: { type: Type.STRING }, technique: { type: Type.STRING } } },
                      closing: { type: Type.OBJECT, properties: { activity: { type: Type.STRING }, studentActivity: { type: Type.STRING }, time: { type: Type.STRING }, evidence: { type: Type.STRING }, technique: { type: Type.STRING } } }
                    },
                    required: ["opening", "development", "closing"]
                  },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
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
                  criteria: { type: Type.STRING }
                },
                required: ["instrument", "percentage", "moment", "agent", "criteria"]
              }
            },
            feedbackCycle: {
              type: Type.OBJECT,
              properties: {
                whereGoing: { type: Type.STRING },
                whereIs: { type: Type.STRING },
                howToGetThere: { type: Type.STRING }
              },
              required: ["whereGoing", "whereIs", "howToGetThere"]
            },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            references: { type: Type.ARRAY, items: { type: Type.STRING } },
            duaStrategies: { type: Type.STRING },
            evaluation: { type: Type.STRING },
            duration: { type: Type.STRING }
          },
          required: ['teachingKit', 'assessmentInstrument', "title", "subject", "sessions", "meta", "evaluationTable", "fundamento", "paec", "curricularElements", "resources", "references", "feedbackCycle", "independentStudy"]
} as const;
