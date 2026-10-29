import { Type } from '@google/genai';
export const INSTRUCCIONES_PAQUETE = `
DECISIONES Y VIABILIDAD:
- Respeta las decisiones actuales del docente sobre instrumento, recursos, PAEC y tarea; prevalecen sobre preferencias anteriores. No sustituyas lista de cotejo por rúbrica.
- Reduce el alcance a un aprendizaje focal y una evidencia individual principal. Cuenta organización, transiciones, lectura, respuesta y retroalimentación dentro de los minutos de cada sesión. No prometas escuchar individualmente a todo el grupo en un cierre breve: describe registro escrito/oral por turnos y seguimiento posterior cuando corresponda.
- Entrega teachingKit con los materiales mínimos que realmente se usarán: texto íntegro del caso, mensajes, tarjetas o problema y una hoja de trabajo con consignas y espacio de respuesta (puede copiarse al cuaderno). No basta enumerarlos en resources. Incluye soluciones orientativas o criterios de respuesta para el docente en teacherNotes, separadas del material del estudiante.
- Evita anexos redundantes. Reutiliza una hoja/cuaderno; respeta el número disponible de copias y la conectividad. En preparation indica preparación concreta, reparto y alternativa sin copias. No inventes noticias, artículos legales, mediciones locales ni fuentes consultadas: distingue casos ficticios y fuentes pendientes de cotejo.
- Entrega assessmentInstrument completo del tipo elegido: instrucciones, columnas, filas con un criterio observable y un descriptor por columna, y scoring con interpretación. Para lista de cotejo: columnas exactas Sí / No / No observado / Observaciones, casillas vacías para marcar y evidencia a observar; sin niveles ni descriptores graduados. Si se pide calificación usa proporción de criterios cumplidos sobre los observados (Sí=1, No=0); No observado es pendiente, no cero. No uses escala 2/1/0; para rúbrica: niveles con descriptores por criterio y puntuación. Para otros instrumentos adapta el registro al tipo solicitado. evaluationTable debe usar este instrumento principal; no pedir fabricar uno distinto.
- Comprueba cada referencia a personajes, párrafos y consignas: toda información necesaria debe leerse ANTES de responder. No anticipes el caso de transferencia ni sus respuestas en material que se entrega en la primera sesión.
- Para evaluación oral reserva por persona al menos 60–90 segundos más 30 segundos de registro/transición; calcula cupos dentro del bloque sin ocupar el mismo tiempo en otra tarea. Si faltan cupos distribúyelos entre sesiones o acuerda recuperación con tiempo equivalente, sin penalizar necesidades de apoyo. La recuperación de una tarea debe tener tiempo comparable al original.
- Cada material corresponde a una sesión y un momento de entrega: sessionNumber y delivery. Separa en materiales distintos el diagnóstico, la práctica y la transferencia que no deban verse juntos. content contiene lecturas y consignas sin guiones de respuesta; las preguntas que necesitan escritura van en questions con prompt y lines (6–12 renglones para 80–120 palabras). No mezcles soluciones con material estudiantil. La guía explica qué preparar antes de clase y qué copiar; no supongas copia instantánea de textos largos.
- En textos visibles escribe «Materiales para esta clase» e «instrumento de evaluación», nunca los nombres internos teachingKit o assessmentInstrument.
- evaluation resume cómo se recoge evidencia, cómo se aplica el instrumento y cómo se retroalimenta, sin repetir una matriz entera en párrafo.
`;
export const PAQUETE_PROPERTIES = {
  teachingKit: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
    sessionNumber: { type: Type.INTEGER }, delivery: { type: Type.STRING },
    questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, lines: { type: Type.INTEGER } }, required: ['prompt','lines'] } },
    title: { type: Type.STRING }, content: { type: Type.STRING }, teacherNotes: { type: Type.STRING }, preparation: { type: Type.STRING }
  }, required: ['title','content','teacherNotes','preparation','sessionNumber','delivery','questions'] } },
  assessmentInstrument: { type: Type.OBJECT, properties: {
    name: { type: Type.STRING }, instructions: { type: Type.STRING }, columns: { type: Type.ARRAY, items: { type: Type.STRING } },
    rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { criterion: { type: Type.STRING }, descriptors: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['criterion','descriptors'] } },
    scoring: { type: Type.STRING }
  }, required: ['name','instructions','columns','rows','scoring'] }
} as const;

export const COLUMNAS_COTEJO = ['Sí', 'No', 'No observado', 'Observaciones'];
export function comprobarInstrumento(instrumento: string | undefined, generado: { columns?: string[] } | undefined) {
  if (!/lista de cotejo/i.test(instrumento || '')) return;
  if (JSON.stringify(generado?.columns) !== JSON.stringify(COLUMNAS_COTEJO)) {
    throw new Error('La IA cambió la lista de cotejo elegida por otro formato. Conservamos tu formulario: vuelve a generar para obtener Sí, No, No observado y Observaciones.');
  }
}
