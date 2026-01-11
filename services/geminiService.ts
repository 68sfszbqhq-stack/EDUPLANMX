

import { GoogleGenAI, Type } from "@google/genai";
import { SchoolContext, SubjectContext, LessonPlan } from "../types";
import { getMCCEMSContextString } from "./mccemsService";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

export const generateLessonPlan = async (
  prompt: string,
  school: SchoolContext,
  subject: SubjectContext
): Promise<LessonPlan> => {
  const model = 'gemini-3-pro-preview';

  const mccemsDocContext = getMCCEMSContextString(subject.subjectId);

  const systemInstruction = `
    Eres el asistente de planeación didáctica definitivo para el Bachillerato en México.
    Tu conocimiento se basa estrictamente en el Marco Curricular Común de la Educación Media Superior (MCCEMS) y la Nueva Escuela Mexicana (NEM).
    
    DOCUMENTOS DE REFERENCIA OBLIGATORIA (Utiliza tu conocimiento interno de estos archivos):
    1. Documento Base MCCEMS: https://dgb.sep.gob.mx/storage/recursos/marco-curricular-comun/XFVjVjC2r1-Documento-base-MCCEMS.pdf
    2. Fundamentos: https://dgb.sep.gob.mx/storage/recursos/marco-curricular-comun/ci3oHBtKrB-FundamentosDelMCCEMS.pdf
    3. NEM Principios: https://dgb.sep.gob.mx/storage/recursos/marco-curricular-comun/YJkGKTHatN-NEMprincipiosyorientacionpedagogica.pdf
    4. Progresión Específica de esta Materia: ${subject.curriculumContent}
    
    REGLAS DE REDACCIÓN:
    - Las actividades deben ser centradas en el estudiante (NEM).
    - La secuencia didáctica debe tener: 
        - APERTURA: Recuperación de conocimientos previos y motivación.
        - DESARROLLO: Construcción del conocimiento y práctica.
        - CIERRE: Evaluación formativa y metacognición.
    - Debes mencionar la Progresión de Aprendizaje explícitamente.
    
    CONTEXTO ESCOLAR ESPECÍFICO:
    - Escuela: ${school.schoolName}
    - Metas: ${school.vision}
    - Infraestructura disponible: ${school.infrastructure}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Genera una planeación para la materia ${subject.subjectName} con el siguiente requerimiento del docente: "${prompt}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          date: { type: Type.STRING },
          subject: { type: Type.STRING },
          learningGoal: { type: Type.STRING },
          progression: { type: Type.STRING },
          sequence: {
            type: Type.OBJECT,
            properties: {
              opening: { type: Type.STRING },
              development: { type: Type.STRING },
              closing: { type: Type.STRING }
            },
            required: ["opening", "development", "closing"]
          },
          evaluation: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          duration: { type: Type.STRING },
          mccemsAlignment: {
            type: Type.OBJECT,
            properties: {
              documentUrl: { type: Type.STRING },
              validated: { type: Type.BOOLEAN }
            }
          }
        },
        required: ["title", "subject", "learningGoal", "sequence", "evaluation", "progression"]
      }
    }
  });

  try {
    const plan = JSON.parse(response.text || '{}') as LessonPlan;
    // Aseguramos la URL del documento oficial
    if (plan.mccemsAlignment) {
      plan.mccemsAlignment.documentUrl = subject.curriculumContent.includes('http')
        ? subject.curriculumContent.split(': ')[1]
        : 'https://dgb.sep.gob.mx/marco-curricular';
      plan.mccemsAlignment.validated = true;
    }
    return plan;
  } catch (error) {
    console.error("Error parsing Gemini response", error);
    throw new Error("La IA no pudo estructurar la planeación. Intenta con un prompt más descriptivo.");
  }
};
