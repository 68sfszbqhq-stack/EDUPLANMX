
import { GoogleGenAI, Type } from "@google/genai";
import { SchoolContext, SubjectContext, LessonPlan } from "../types";
import { programasSEPService } from "../src/services/programasSEPService";

const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || '';

export const generateLessonPlan = async (
  prompt: string,
  school: SchoolContext,
  subject: SubjectContext,
  customApiKey?: string
): Promise<LessonPlan> => {

  // 1. Determinar qué API Key usar (la del usuario o la del entorno)
  const effectiveApiKey = customApiKey?.trim() || DEFAULT_API_KEY;

  if (!effectiveApiKey) {
    throw new Error("⚠️ No hay API Key de Gemini configurada. Por favor, ingresa tu clave o configurala en el archivo .env");
  }

  // 2. Inicializar el cliente de IA con la clave correcta
  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

  const model = 'gemini-1.5-flash';
  console.log('🤖 Usando modelo Gemini:', model);

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
       - Calcula las horas totales con base en la carga semanal.

    2. PROGRESIONES (NO PONGAS RESÚMENES):
       - Usa el TEXTO EXACTO y COMPLETO de la progresión oficial.
       - Indica el ID de la progresión.
       
    3. CATEGORÍAS Y SUBCATEGORÍAS (MCCEMS):
       - Identifica las CATEGORÍAS centrales y SUBCATEGORÍAS.

    4. VINCULACIÓN PAEC (Programa Aula-Escuela-Comunidad):
       - Define una problemática comunitaria REAL o SIMULADA.
       - Propón un proyecto breve que aborde esto.

    5. FUNDAMENTACIÓN PEDAGÓGICA:
       - Justifica las actividades (Estilo DGB).
       - Vinculación transversal y socioemocional.

    6. ESTUDIO INDEPENDIENTE:
       - Actividades fuera del aula (tareas), tiempo y evaluación.

    7. TABLA DE EVALUACIÓN (RIGUROSA):
       - Desglosa Instrumento, Porcentaje, Agente y Criterios.

    8. RECURSOS DIDÁCTICOS (CRÍTICO - NO OLVIDAR):
       - Genera una LISTA MAESTRA de todos los materiales, herramientas digitales, lecturas y equipos necesarios.
       - Debe ser específica (ej. "Proyector", "Hojas de rotafolio", "App de Canva", "Lectura sobre X").

    SECUENCIA DIDÁCTICA:
    - Separa claramente: Docente (Enseñanza) vs Alumno (Aprendizaje).
    
    INFORMACIÓN OFICIAL:
    ${contextoOficial}

    CONTEXTO ESCOLAR:
    - Escuela: ${school.schoolName}
    - Misión/Visión: ${school.vision}
    - Solicitud Usuario: "${prompt}"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Genera la planeación completa para ${subject.subjectName} cumpliendo estrictamente los 8 puntos de revisión, especialmente la LISTA DE RECURSOS.`,
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
                endDate: { type: Type.STRING },
                methodology: { type: Type.STRING } // Added
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
                transversalityLink: { type: Type.STRING },
                socioemotionalScope: { type: Type.STRING }, // Added
                socioemotionalMeta: { type: Type.STRING }, // Added
                socioemotionalPurpose: { type: Type.STRING }, // Added
                socioemotionalContent: { type: Type.STRING } // Added
              },
              required: ["progressionJustification", "sociocognitiveLink"]
            },

            independentStudy: {
              type: Type.OBJECT,
              properties: {
                activities: { type: Type.STRING },
                feedbackLink: { type: Type.STRING },
                feedbackStrategy: { type: Type.STRING }, // Added
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

            teacherReflection: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.STRING },
                opportunities: { type: Type.STRING },
                adjustments: { type: Type.STRING }
              }
            },

            // RECURSOS AL NIVEL DE TODA LA PLANEACIÓN (Para el Auditor)
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },

            duaStrategies: { type: Type.STRING },
            evaluation: { type: Type.STRING },
            duration: { type: Type.STRING },
            mccemsAlignment: {
              type: Type.OBJECT,
              properties: {
                documentUrl: { type: Type.STRING },
                validated: { type: Type.BOOLEAN }
              }
            },

            transversality: { type: Type.OBJECT, properties: { paecTopics: { type: Type.ARRAY, items: { type: Type.STRING } }, relationToOtherSubjects: { type: Type.STRING } } },
            sequence: { type: Type.OBJECT, properties: { opening: { type: Type.STRING }, development: { type: Type.STRING }, closing: { type: Type.STRING } } }

          },
          required: ["title", "subject", "sessions", "meta", "evaluationTable", "fundamento", "paec", "independentStudy", "curricularElements", "resources"]
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

    // --- GARANTÍA DE RECURSOS PARA EL AUDITOR ---
    // Si la IA no generó la lista maestra de recursos, la construimos extrayendo de las sesiones.
    if (!parsedData.resources || !Array.isArray(parsedData.resources) || parsedData.resources.length === 0) {
      const sessionResources = parsedData.sessions?.flatMap((s: any) => s.resources || []) || [];
      const uniqueResources = Array.from(new Set(sessionResources)) as string[]; // Deduplicar

      if (uniqueResources.length > 0) {
        parsedData.resources = uniqueResources;
      } else {
        // Fallback final si no hay nada en sesiones tampoco
        parsedData.resources = ["Pizarrón", "Cuaderno del alumno", "Libro de texto", "Dispositivo multimedia"];
      }
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
