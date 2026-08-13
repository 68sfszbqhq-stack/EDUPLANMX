
import { GoogleGenAI } from "@google/genai";
import { SchoolContext, SubjectContext, LessonPlan } from "../types";
import { programasSEPService } from "../src/services/programasSEPService";
import { perfilDocenteService } from "../src/services/perfilDocenteService";
import { familiaDesdeCategoria } from "../data/vocabularioCurricular";
import { PLAN_RESPONSE_SCHEMA, construirSystemInstruction } from "./planSchema";

// Se re-exportan para no romper a quien ya los importaba desde aquí.
export { PLAN_RESPONSE_SCHEMA, construirSystemInstruction };

/**
 * NO se incrusta ninguna clave de Gemini en el código.
 *
 * EduPlan MX se publica como sitio estático (GitHub Pages): todo lo que Vite
 * inyecta con `import.meta.env.VITE_*` viaja dentro del JavaScript que cualquiera
 * puede descargar y leer. Una clave puesta ahí es una clave pública, y quien la
 * extraiga consume la cuota —o genera cargos— de la cuenta que la creó.
 *
 * Por eso cada docente usa su propia clave gratuita de Google AI Studio, que se
 * guarda solo en sessionStorage de su navegador (se borra al cerrar la pestaña,
 * nunca se escribe en disco ni en Firestore). Además reparte la cuota entre el
 * colectivo en lugar de concentrarla en una sola cuenta.
 */

export const generateLessonPlan = async (
  prompt: string,
  school: SchoolContext,
  subject: SubjectContext,
  customApiKey?: string,
  userId?: string
): Promise<LessonPlan> => {

  // 1. La clave la pone el docente; no hay ninguna de respaldo (ver nota de arriba)
  const effectiveApiKey = customApiKey?.trim();

  if (!effectiveApiKey) {
    throw new Error(
      "🔑 Falta tu API Key de Gemini. Pégala en el campo del inicio del formulario " +
      "(el botón azul \"Créala GRATIS aquí\" te la da en un minuto con tu cuenta de Google). " +
      "Se guarda solo en este navegador y se borra al cerrar la pestaña."
    );
  }

  // 2. Inicializar el cliente de IA con la clave correcta
  const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

  const model = 'gemini-2.5-flash';
  console.log('🤖 Usando modelo Gemini (v2.5):', model);

  const programasOficiales = programasSEPService.buscarPorMateria(subject.subjectName);
  // Solo tratamos como "oficial" un programa con progresiones verificadas de la DGB;
  // los borradores (esqueletos provisionales) no deben alimentar a la IA como currículo real.
  const programaOficial = programasOficiales.find(p => p.estado !== 'borrador') || null;

  let contextoOficial = "";
  if (programaOficial) {
    contextoOficial = programasSEPService.generarContextoIA(programaOficial.materia, programaOficial.semestre);
  } else {
    contextoOficial = "No se encontró programa oficial específico. Usar lineamientos generales del MCCEMS 2024.";
  }

  // Perfil del docente: cómo da clase, con qué recursos cuenta y qué le revisan.
  // Si nunca contestó el cuestionario, el bloque va vacío y el prompt queda igual que antes.
  let bloquePerfil = '';
  try {
    const perfil = await perfilDocenteService.obtener(userId);
    bloquePerfil = perfilDocenteService.generarBloquePrompt(perfil);
    if (bloquePerfil) console.log('👤 Planeación personalizada con el perfil del docente');
  } catch (e) {
    console.warn('No se pudo cargar el perfil docente; se genera sin personalizar.', e);
  }

  const systemInstruction = construirSystemInstruction({ contextoOficial, school, prompt, bloquePerfil });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Genera la planeación completa para ${subject.subjectName} basándote en el prompt estructurado. Respeta el número de sesiones solicitado.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 16384,
        responseSchema: PLAN_RESPONSE_SCHEMA
      }
    });

    let parsedData;
    try {
      parsedData = JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Error al procesar JSON (Posible respuesta trunca):", e);
      throw new Error("La planeación es muy extensa y se cortó. Intenta generar menos sesiones (ej. reducir a 3) o ser más específico.");
    }
    return construirLessonPlan(parsedData, { prompt, model, subject, programaOficial });

  } catch (error: any) {
    console.error("Error Gemini:", error);

    // Traducir errores técnicos de la API a mensajes que un docente entienda
    const rawMessage: string = error.message || '';

    if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('API key not valid')) {
      throw new Error(
        '🔑 La API Key no es válida. Pega tu propia clave de Gemini en el campo de arriba ' +
        '(usa el botón "Créala GRATIS aquí" para obtenerla en 1 minuto) y vuelve a intentar.'
      );
    }
    if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429') || rawMessage.toLowerCase().includes('quota')) {
      throw new Error(
        '⏳ Se agotó la cuota gratuita de esta API Key por ahora. Espera un minuto y vuelve a intentar, ' +
        'o genera una clave nueva en Google AI Studio.'
      );
    }
    if (rawMessage.includes('fetch') || rawMessage.includes('network') || rawMessage.includes('Failed to')) {
      throw new Error(
        '📡 No hay conexión con el servicio de IA. Revisa tu internet y vuelve a intentar.'
      );
    }

    throw new Error(rawMessage || "Error al generar la planeación. Intenta de nuevo.");
  }
};

/**
 * Normaliza la respuesta del modelo y arma el LessonPlan final.
 * Separado de la llamada para poder verificarlo sin gastar cuota de API.
 */
function construirLessonPlan(
  parsedData: any,
  ctx: { prompt: string; model: string; subject: SubjectContext; programaOficial: any }
): LessonPlan {
  const { prompt, model, subject, programaOficial } = ctx;

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

    // --- GARANTÍA DE REFERENCIAS ---
    // La lista de cotejo pide "materiales, recursos Y referencias". Si el modelo no las
    // devuelve, citamos el programa oficial: es la fuente que el docente sí puede defender.
    if (!Array.isArray(parsedData.references) || parsedData.references.length === 0) {
      parsedData.references = programaOficial
        ? [`Programa de estudios oficial de ${programaOficial.materia} (DGB/SEP). ${programaOficial.url_fuente}`]
        : ['Programa de estudios oficial de la UAC (DGB/SEP), MCCEMS.'];
    }

    // --- NORMALIZACIÓN DE LA TABLA DE EVALUACIÓN ---
    // Momento y agente son dos puntos distintos de la lista de cotejo. Se dejan visibles
    // como "Por definir" en vez de en blanco: así el docente ve qué le falta completar.
    if (Array.isArray(parsedData.evaluationTable)) {
      parsedData.evaluationTable = parsedData.evaluationTable.map((fila: any) => ({
        ...fila,
        moment: fila.moment || 'Por definir',
        agent: fila.agent || 'Heteroevaluación',
        percentage: Number(fila.percentage) || 0
      }));
    }

    // --- DATOS DE IDENTIFICACIÓN QUE NO DEBE INVENTAR LA IA ---
    // Componente, área/recurso y generación curricular salen del programa oficial y del
    // catálogo, no del modelo. La lista de cotejo los revisa como datos duros y un error
    // aquí invalida la planeación entera.
    const familia = familiaDesdeCategoria(subject.mccemsCategory);
    const componente: 'fundamental' | 'ampliado' | 'laboral' =
      familia === 'laboral' ? 'laboral' : 'fundamental';

    parsedData.meta = {
      ...parsedData.meta,
      componente,
      areaOrRecurso: subject.mccemsCategory || parsedData.meta?.areaOrRecurso || '',
      modelo: (programaOficial?.modelo === '2025' ? '2025' : '2024'),
    };

    // Compatibilidad con campos legacy
    const lessonPlan: LessonPlan = {
      ...parsedData,
      date: parsedData.date || new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
      learningGoal: parsedData.curricularElements?.learningGoals?.[0] || '',
      progression: parsedData.curricularElements?.progression || '',
      sequence: parsedData.sequence?.opening ? parsedData.sequence : {
        opening: parsedData.sessions?.[0]?.sequence?.opening?.activity || "Consultar desglose por sesiones",
        development: parsedData.sessions?.[0]?.sequence?.development?.activity || "Consultar desglose por sesiones",
        closing: parsedData.sessions?.[0]?.sequence?.closing?.activity || "Consultar desglose por sesiones"
      },
      teacherReflection: parsedData.teacherReflection || { strengths: '', opportunities: '', adjustments: '' },
      // Trazabilidad del uso de IA (Fichas 16 y 34): se guarda el prompt exacto que se envió.
      // La revisión del docente se marca después, en el panel de Revisión Docente.
      aiTrace: {
        prompt,
        model,
        generatedAt: new Date().toISOString(),
        teacherAdjustments: '',
        reviewedByTeacher: false
      }
    };

    if (programaOficial) {
      if (!lessonPlan.mccemsAlignment) lessonPlan.mccemsAlignment = { documentUrl: '', validated: false };
      lessonPlan.mccemsAlignment.documentUrl = programaOficial.url_fuente;
      lessonPlan.mccemsAlignment.validated = true;
    }

    return lessonPlan;
}
