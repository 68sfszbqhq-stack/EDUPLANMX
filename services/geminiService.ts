
import { GoogleGenAI, Type } from "@google/genai";
import { SchoolContext, SubjectContext, LessonPlan } from "../types";
import { programasSEPService } from "../src/services/programasSEPService";

const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLessonPlan = async (
  prompt: string,
  school: SchoolContext,
  subject: SubjectContext
): Promise<LessonPlan> => {
  const model = 'gemini-2.5-flash';

  const programasOficiales = programasSEPService.buscarPorMateria(subject.subjectName);
  const programaOficial = programasOficiales.length > 0 ? programasOficiales[0] : null;

  let contextoOficial = "";
  if (programaOficial) {
    contextoOficial = programasSEPService.generarContextoIA(programaOficial.materia, programaOficial.semestre);
  } else {
    contextoOficial = "No se encontró programa oficial específico. Usar lineamientos generales del MCCEMS 2024.";
  }

  const systemInstruction = `
    Eres un experto pedagogo de la DGB/SEP con nivel de Supervisor Escolar.
    Tu tarea es generar una Planeación Didáctica detallada y rigurosa para Educación Media Superior.

    REQUISITOS OBLIGATORIOS (CRITERIOS DE REVISIÓN):

    1. DATOS GENERALES:
       - Define un "periodo aproximado" realista para cubrir el contenido.
       - Calcula las horas totales con base en la carga semanal (ej. semanal * num_semanas).

    2. PROGRESIONES (NO PONGAS RESÚMENES):
       - Usa el TEXTO EXACTO y COMPLETO de la progresión oficial.
       - Indica el ID de la progresión (ej. "Progresión 1.3").
       
    3. CATEGORÍAS Y SUBCATEGORÍAS (MCCEMS):
       - Identifica las CATEGORÍAS centrales (Conceptos clave).
       - Identifica las SUBCATEGORÍAS (Conceptos transversales o integradores).

    4. VINCULACIÓN PAEC (Programa Aula-Escuela-Comunidad):
       - Define una problemática comunitaria REAL o SIMULADA relacionada con el tema (ej. "Uso excesivo de redes en la comunidad", "Falta de agua", etc.).
       - Propón un proyecto breve que aborde esto.
       - Si no aplica, explícalo, pero intenta vincularlo.

    5. FUNDAMENTACIÓN PEDAGÓGICA (NUEVO REQUISITO):
       - Justifica: ¿Por qué estas actividades? (Estilo DGB).
       - Vinculación: Relaciona con áreas transversales (Pensamiento Crítico, Ciencias, etc.).
       - Socioemocional: ¿Qué recursos socioemocionales se activan?

    6. ESTUDIO INDEPENDIENTE:
       - Actividades fuera del aula (tareas).
       - Tiempo estimado.
       - Cómo se revisará (retroalimentación).

    7. TABLA DE EVALUACIÓN (RIGUROSA):
       - Desglosa Instrumento, Porcentaje y Agente.
       - IMPORTANTÍSIMO: Define "criteria" (¿Qué se evalúa exactamente? ej. "Ortografía y redacción", "Trabajo en equipo").

    SECUENCIA DIDÁCTICA:
    - Separa claramente: Docente (Enseñanza) vs Alumno (Aprendizaje).
    
    INFORMACIÓN OFICIAL:
    ${contextoOficial}

    CONTEXTO ESCOLAR:
    - Escuela: ${school.schoolName} (CCT: ${school.cct || 'NO CAPTURADA'})
    - Diagnóstico: ${school.vision}
    - Solicitud Usuario: "${prompt}"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Genera la planeación completa para ${subject.subjectName} cumpliendo estrictamente los 7 puntos de revisión.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        responseSchema: {
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
                endDate: { type: Type.STRING }
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
                progression: { type: Type.STRING }, // Texto completo
                progressionId: { type: Type.STRING }, // ID numérico
                learningGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                subcategories: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["progression", "learningGoals", "categories"]
            },

            paec: {
              type: Type.OBJECT,
              properties: {
                isLinked: { type: Type.BOOLEAN },
                communityProblem: { type: Type.STRING },
                projectTrigger: { type: Type.STRING }
              }
            },

            fundamento: {
              type: Type.OBJECT,
              properties: {
                progressionJustification: { type: Type.STRING },
                sociocognitiveLink: { type: Type.STRING },
                socioemotionalLink: { type: Type.STRING },
                transversalityLink: { type: Type.STRING }
              },
              required: ["progressionJustification", "sociocognitiveLink"]
            },

            independentStudy: {
              type: Type.OBJECT,
              properties: {
                activities: { type: Type.STRING },
                feedbackLink: { type: Type.STRING },
                resources: { type: Type.STRING },
                estimatedTime: { type: Type.STRING }
              }
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
                      opening: { type: Type.OBJECT, properties: { activity: { type: Type.STRING }, studentActivity: { type: Type.STRING }, time: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ["activity", "studentActivity", "time", "evidence"] },
                      development: { type: Type.OBJECT, properties: { activity: { type: Type.STRING }, studentActivity: { type: Type.STRING }, time: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ["activity", "studentActivity", "time", "evidence"] },
                      closing: { type: Type.OBJECT, properties: { activity: { type: Type.STRING }, studentActivity: { type: Type.STRING }, time: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ["activity", "studentActivity", "time", "evidence"] }
                    },
                    required: ["opening", "development", "closing"]
                  },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["sessionNumber", "sequence"]
              }
            },

            evaluationTable: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  instrument: { type: Type.STRING },
                  percentage: { type: Type.NUMBER },
                  agent: { type: Type.STRING },
                  criteria: { type: Type.STRING }
                },
                required: ["instrument", "percentage", "agent", "criteria"]
              }
            },

            evaluationDetails: {
              type: Type.OBJECT,
              properties: {
                diagnostic: { type: Type.STRING },
                formative: { type: Type.STRING },
                summative: { type: Type.STRING },
                instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
                criteria: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },

            teacherReflection: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.STRING },
                opportunities: { type: Type.STRING },
                adjustments: { type: Type.STRING }
              }
            },

            duaStrategies: { type: Type.STRING },
            evaluation: { type: Type.STRING },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            duration: { type: Type.STRING },
            mccemsAlignment: {
              type: Type.OBJECT,
              properties: {
                documentUrl: { type: Type.STRING },
                validated: { type: Type.BOOLEAN }
              }
            },

            // Legacy/Compatibilidad
            transversality: { type: Type.OBJECT, properties: { paecTopics: { type: Type.ARRAY, items: { type: Type.STRING } }, relationToOtherSubjects: { type: Type.STRING } } },
            sequence: { type: Type.OBJECT, properties: { opening: { type: Type.STRING }, development: { type: Type.STRING }, closing: { type: Type.STRING } } }

          },
          required: ["title", "subject", "sessions", "meta", "evaluationTable", "fundamento", "paec", "independentStudy", "curricularElements"]
        }
      }
    });

    let parsedData;
    try {
      parsedData = JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Error al procesar JSON (Posible respuesta trunca):", e);
      throw new Error("La planeación es muy extensa y se cortó. Intenta generar menos sesiones (ej. reducir a 3) o ser más específico.");
    }

    // --- LÓGICA DE NORMALIZACIÓN ---
    if (parsedData.sessions && Array.isArray(parsedData.sessions)) {
      parsedData.sessions = parsedData.sessions.map((s: any) => ({
        ...s,
        date: s.date || 'Por asignar',
        topic: s.topic || 'Tema General',
        sequence: {
          opening: {
            activity: s.sequence?.opening?.activity || 'El docente inicia la sesión...',
            studentActivity: s.sequence?.opening?.studentActivity || 'Los alumnos atienden y participan...',
            time: s.sequence?.opening?.time || '15 min',
            evidence: s.sequence?.opening?.evidence || 'Participación'
          },
          development: {
            activity: s.sequence?.development?.activity || 'El docente explica...',
            studentActivity: s.sequence?.development?.studentActivity || 'Los alumnos realizan...',
            time: s.sequence?.development?.time || '30 min',
            evidence: s.sequence?.development?.evidence || 'Apuntes/Ejercicios'
          },
          closing: {
            activity: s.sequence?.closing?.activity || 'El docente concluye...',
            studentActivity: s.sequence?.closing?.studentActivity || 'Los alumnos reflexionan...',
            time: s.sequence?.closing?.time || '15 min',
            evidence: s.sequence?.closing?.evidence || 'Reflexión'
          }
        },
        resources: Array.isArray(s.resources) ? s.resources : (s.resources ? [s.resources] : [])
      }));
    }

    // Compatibilidad con campos legacy
    const lessonPlan: LessonPlan = {
      ...parsedData,
      learningGoal: parsedData.curricularElements?.learningGoals?.[0] || '',
      progression: parsedData.curricularElements?.progression || '',
      sequence: parsedData.sequence?.opening ? parsedData.sequence : {
        opening: parsedData.sessions?.[0]?.sequence?.opening?.activity || "Consultar desglose por sesiones",
        development: parsedData.sessions?.[0]?.sequence?.development?.activity || "Consultar desglose por sesiones",
        closing: parsedData.sessions?.[0]?.sequence?.closing?.activity || "Consultar desglose por sesiones"
      },
      // Asegurar inicialización de reflexión docente vacía si no viene
      teacherReflection: parsedData.teacherReflection || { strengths: '', opportunities: '', adjustments: '' }
    };

    if (programaOficial) {
      if (!lessonPlan.mccemsAlignment) lessonPlan.mccemsAlignment = { documentUrl: '', validated: false };
      lessonPlan.mccemsAlignment.documentUrl = programaOficial.url_fuente;
      lessonPlan.mccemsAlignment.validated = true;
    }

    return lessonPlan;

  } catch (error: any) {
    console.error("Error Gemini:", error);
    throw new Error(error.message || "Error al generar la planeación. Intenta de nuevo.");
  }
};
