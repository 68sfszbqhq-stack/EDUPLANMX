import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Save, Send, Copy, Download, CheckCircle2, Calendar, BookOpen, Clock, List, Target, Brain, Layers, Eye, FileText, User, Table as TableIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { generateLessonPlan } from '../services/geminiService';
import { programasSEPService } from '../src/services/programasSEPService';
import { SchoolContext, SubjectContext, LessonPlan } from '../types';
import { getStudentContextSummary } from '../src/services/studentStatsService';
import PlanDocument from './PlanDocument';
import { PedagogicalAuditor } from './PedagogicalAuditor';
import { pecService } from '../src/services/pecService';
import { PECProject } from '../types';
import { useAuth } from '../src/contexts/AuthContext';

interface PlanGeneratorProps {
  school: SchoolContext;
  subject: SubjectContext;
  teacherName?: string;
  onSave: (plan: LessonPlan) => void;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ school, subject, teacherName, onSave }) => {
  const { user } = useAuth();

  // --- Estados Originales ---
  const [apiKey, setApiKey] = useState(''); // Estado para la API Key Manual (PRESERVADO)
  const [progresionesDisponibles, setProgresionesDisponibles] = useState<{ id: number, descripcion: string }[]>([]);
  const [selectedProgression, setSelectedProgression] = useState<string>('');
  const [specificTopic, setSpecificTopic] = useState('');
  const [numSessions, setNumSessions] = useState(1);
  const [sessionDuration, setSessionDuration] = useState(50);
  const [evaluationType, setEvaluationType] = useState('Rúbrica');
  const [semestre, setSemestre] = useState<number | null>(null);
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [didacticStrategy, setDidacticStrategy] = useState('Aprendizaje Basado en Proyectos (ABP)');
  const [paecMode, setPaecMode] = useState<'manual' | 'linked'>('manual');
  const [paecProblem, setPaecProblem] = useState('');
  const [activeProjects, setActiveProjects] = useState<PECProject[]>([]);
  const [selectedPecId, setSelectedPecId] = useState('');
  const [pecActivity, setPecActivity] = useState('');
  const [studentContextSummary, setStudentContextSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // --- NUEVO: ESTADO PARA LA ACTIVIDAD DEL TALLER (Paso 2 del PDF) ---
  // Mapeamos: Problema Detectado -> Función Pedagógica
  // Mapeamos: Problema Detectado -> Función Pedagógica
  const [pedagogicalNeed, setPedagogicalNeed] = useState<string>('structure');
  const [customNeed, setCustomNeed] = useState(''); // Para la opción "Otro / Personalizado"

  // --- NUEVO: SELECTORES DE "QUÉ INCLUIR" (CHECKBOXES) ---
  const [includeSections, setIncludeSections] = useState({
    paecLinks: true,
    resourcesList: true,
    socioemotional: true,
    evaluationInstrument: true,
    homework: true,
    transversality: true,
    bibliography: true,
  });

  const [includeContext, setIncludeContext] = useState({
    studentDiagnosis: true,
    schoolVision: true,
    communityContext: false,
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Planeacion-${subject.subjectName}-${new Date().toLocaleDateString()}`,
  });

  useEffect(() => {
    if (subject.subjectName) {
      const programas = programasSEPService.buscarPorMateria(subject.subjectName);
      if (programas.length > 0) {
        const programa = programas[0];
        setProgresionesDisponibles(programa.progresiones || []);
        setSemestre(programa.semestre);
      } else {
        setProgresionesDisponibles([]);
      }
    }
  }, [subject.subjectName]);

  useEffect(() => {
    const loadStudentStats = async () => {
      const stats = await getStudentContextSummary();
      setStudentContextSummary(stats);
    };
    loadStudentStats();
  }, []);

  useEffect(() => {
    const loadPecs = async () => {
      if (user?.schoolId) {
        const projects = await pecService.getActiveProjects(user.schoolId);
        setActiveProjects(projects);
      }
    };
    loadPecs();
  }, [user?.schoolId]);

  const handleGenerate = async () => {
    if (!selectedProgression && !specificTopic) {
      setError("Por favor selecciona una progresión o escribe un tema.");
      return;
    }

    if (sessionDuration > 60) {
      setError("La duración de la sesión no puede exceder los 60 minutos.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // --- LÓGICA PAEC/PEC ---
    let paecContext = '';
    let finalPaecData: any = null;

    if (paecMode === 'manual') {
      paecContext = `PROBLEMÁTICA PAEC: "${paecProblem || 'A sugerencia de la IA basándose en el contexto'}"`;
      finalPaecData = paecProblem ? {
        isLinked: true,
        communityProblem: paecProblem,
        projectTrigger: 'Proyecto integrador'
      } : null;
    } else {
      const pec = activeProjects.find(p => p.id === selectedPecId);
      if (pec) {
        paecContext = `
           VINCULACIÓN AL PROYECTO ESCOLAR COMUNITARIO (PEC):
           - Nombre Proyecto: "${pec.name}"
           - Problemática: "${pec.problemId}"
           - Objetivo: "${pec.generalObjective}"
           - ACTIVIDAD VINCULADA: "${pecActivity}"
         `;
        finalPaecData = {
          isLinked: true,
          communityProblem: pec.name,
          projectTrigger: pec.generalObjective
        };
      }
    }

    // --- LÓGICA DEL TALLER: INYECCIÓN DE "PERSONA" IA ---
    // Esto reemplaza la necesidad de que el docente cambie de app (Diffit, Canva, etc.)
    // El "Prompt" que pide el PDF se construye aquí dinámicamente.

    let aiPersonaInstruction = "";

    switch (pedagogicalNeed) {
      case 'structure': // Problema: Secuencias confusas / Actividades poco claras
        aiPersonaInstruction = `
          ROL: Actúa como un Diseñador Instruccional experto (Estilo ChatGPT/Teachy).
          PRIORIDAD: Estructura lógica y claridad en las consignas.
          INSTRUCCIÓN: Asegúrate de que el Inicio, Desarrollo y Cierre estén perfectamente delimitados.
          Usa verbos operativos claros (Taxonomía de Bloom).
        `;
        break;
      case 'differentiation': // Problema: Grupos heterogéneos / Neurodivergencia
        aiPersonaInstruction = `
          ROL: Actúa como experto en Educación Inclusiva y DUA (Estilo MagicSchool/Diffit).
          PRIORIDAD: Diferenciación de contenidos.
          INSTRUCCIÓN: Para la actividad principal, ofrece 3 variantes:
          1. Nivel Básico (Apoyo visual/guiado).
          2. Nivel Estándar.
          3. Nivel Avanzado (Reto autónomo).
          Incluye notas sobre ajustes razonables para neurodivergencia.
        `;
        break;
      case 'visualization': // Problema: Dificultad para explicar ideas abstractas
        aiPersonaInstruction = `
          ROL: Actúa como experto en Visual Thinking (Estilo Canva/Miro).
          PRIORIDAD: Explicación visual y analogías.
          INSTRUCCIÓN: En la sección de desarrollo, sugiere específicamente qué organizadores gráficos,
          diagramas o metáforas visuales debe dibujar el docente en el pizarrón.
          Describe infografías sugeridas que faciliten la comprensión.
        `;
        break;
      case 'evaluation': // Problema: Evaluar procesos complejos
        aiPersonaInstruction = `
          ROL: Actúa como especialista en Evaluación Formativa (Estilo Copilot).
          PRIORIDAD: Retroalimentación y metacognición.
          INSTRUCCIÓN: Desarrolla una Rúbrica Analítica detallada.
          Incluye preguntas detonadoras para la autoevaluación de los alumnos al final de la clase.
        `;
        break;
      case 'gamification': // NUEVO
        aiPersonaInstruction = `
          ROL: Actúa como experto en Gamificación Educativa.
          PRIORIDAD: Motivación y Engagement.
          INSTRUCCIÓN: Integra mecánicas de juego (retos, niveles, recompensas simbólicas) en la secuencia.
          Haz que el aprendizaje se sienta como una misión.
        `;
        break;
      case 'context': // NUEVO
        aiPersonaInstruction = `
          ROL: Actúa como experto en Aprendizaje Situado.
          PRIORIDAD: Relevancia en el mundo real.
          INSTRUCCIÓN: Vincula cada concepto con un problema real, noticia actual o situación de la vida diaria de los estudiantes.
        `;
        break;
      case 'custom': // NUEVO
        aiPersonaInstruction = `
          ROL: Asistente Pedagógico Adaptable.
          PRIORIDAD: ${customNeed || 'Ajuste personalizado'}.
          INSTRUCCIÓN: Sigue estrictamente esta petición del docente: "${customNeed}".
        `;
        break;
      default:
        aiPersonaInstruction = "ROL: Docente experto en NEM.";
    }

    // Construcción de instrucciones condicionales
    const sectionsInstructions = `
      SECCIONES REQUERIDAS:
      ${includeSections.paecLinks ? '- VINCULACIÓN PAEC: Obligatoria.' : '- VINCULACIÓN PAEC: Omitir o reducir.'}
      ${includeSections.resourcesList ? '- RECURSOS: Generar lista detallada.' : ''}
      ${includeSections.socioemotional ? '- SOCIOEMOCIONAL: Incluir desglose completo (Ámbito, Meta, Contenidos).' : '- SOCIOEMOCIONAL: Solo mención breve.'}
      ${includeSections.homework ? '- ESTUDIO INDEPENDIENTE: Incluir tarea con tiempo y retroalimentación.' : '- ESTUDIO INDEPENDIENTE: No asignar tarea.'}
      ${includeSections.evaluationInstrument ? '- EVALUACIÓN: Incluir tabla con instrumentos y porcentajes.' : '- EVALUACIÓN: Solo mencionar estrategia general.'}
      ${includeSections.bibliography ? '- BIBLIOGRAFÍA: Incluir lista de fuentes consultadas (formato APA).' : ''}
    `;

    const contextInstructions = `
      CONTEXTO A CONSIDERAR:
      ${includeContext.schoolVision ? `- VISIÓN ESCOLAR: "${school.vision}" (Alinearse a esto).` : ''}
      ${includeContext.studentDiagnosis ? `- DIAGNÓSTICO GRUPO: "${studentContextSummary}" (Adaptar a estas necesidades).` : ''}
      ${includeContext.communityContext ? `- CONTEXTO COMUNIDAD: "${school.municipality}" (Usar ejemplos locales).` : ''}
    `;

    // Construcción del Prompt Estructurado (El "Buen Prompt" del PDF)
    const promptEstructurado = `
      ${aiPersonaInstruction}

      Genera una planeación didáctica para "${subject.subjectName}" (Semestre ${semestre || 'General'}).
      
      CONTEXTO Y DIAGNÓSTICO (INPUT HUMANO):
      - Escuela: ${school.schoolName} (${school.municipality})
      ${contextInstructions}
      
      CONFIGURACIÓN TÉCNICA:
      - Sesiones: ${numSessions} (Duración estricta: ${sessionDuration} min por sesión).
      - TIEMPO TOTAL POR SESIÓN: ${sessionDuration} minutos.
      - DISTRIBUCIÓN SUGERIDA (Ajustar al contenido, pero respetar total):
        * Inicio: ~${Math.round(sessionDuration * 0.2)} min
        * Desarrollo: ~${Math.round(sessionDuration * 0.6)} min
        * Cierre: ~${Math.round(sessionDuration * 0.2)} min
      - Progresión: "${selectedProgression || 'No especificada'}"
      - Tema: "${specificTopic}"
      - Estrategia Base: "${didacticStrategy}"
      - Evaluación: "${evaluationType}"
      
      ${paecContext}
      
      ${sectionsInstructions}

      SALIDA ESPERADA:
      Genera el documento JSON con la estructura de planeación completa.
      Asegura que incluyas una LISTA DE RECURSOS DIDÁCTICOS (Materiales/Digitales) para cumplir auditoría.
      Asegura que el campo 'activities' refleje la PRIORIDAD seleccionada arriba.
    `;

    try {
      // PRESERVADO: Pasamos la apiKey manual (si existe) al servicio
      const plan = await generateLessonPlan(promptEstructurado, school, subject, apiKey);

      const finalPlan: LessonPlan = {
        ...plan,
        meta: {
          ...plan.meta,
          teacher: teacherName || plan.meta?.teacher || '',
          cycle: plan.meta?.cycle || '2025-2026',
          period: plan.meta?.period || 'Semestral',
          gradeGroup: plan.meta?.gradeGroup || 'General',
          totalSessions: numSessions,
          hoursPerWeek: hoursPerWeek,
          startDate: startDate || 'Por definir',
          endDate: endDate || 'Por definir',
          methodology: didacticStrategy, // Persistimos la estrategia seleccionada
        },
        paec: finalPaecData || plan.paec,
        pecLinkage: paecMode === 'linked' ? {
          isLinked: true,
          pecId: selectedPecId,
          pecActivity: pecActivity
        } : undefined
      };

      setResult(finalPlan);
    } catch (err: any) {
      setError(err.message || 'Error al generar la planeación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (result) {
      onSave(result);
      alert('Planeación guardada con éxito.');
    }
  };

  const handleCopyToClipboard = () => {
    if (!result) return;
    let text = `PLANEACIÓN: ${result.title || result.subject}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">

      {/* --- CUESTIONARIO CONFIGURADOR --- */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm no-print">
        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Generador Inteligente NEM (Actividad Taller IA)
        </h3>

        {/* 0. API KEY MANUAL (PRESERVADO) */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <label className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3" /> API Key de Gemini (Opcional - Para mayor velocidad)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Pegar Google Gemini API Key aquí..."
            className="w-full p-2 rounded-lg border border-indigo-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-mono"
          />
          <p className="text-[10px] text-indigo-500 mt-1">
            Usar tu propia clave asegura que no tengas límites de cuota. Si lo dejas vacío, se usará la del sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* 1. SELECCIÓN DE PROGRESIÓN (Igual) */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              1. ¿Qué vamos a enseñar? (Contenido Curricular)
            </label>
            <select
              value={selectedProgression}
              onChange={(e) => setSelectedProgression(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 text-sm"
            >
              <option value="">-- Selecciona progresión oficial SEP --</option>
              {progresionesDisponibles.map(p => (
                <option key={p.id} value={p.descripcion}>
                  {p.id}. {p.descripcion.substring(0, 120)}...
                </option>
              ))}
            </select>
            <input
              type="text"
              value={specificTopic}
              onChange={(e) => setSpecificTopic(e.target.value)}
              placeholder="O escribe un tema específico..."
              className="w-full mt-2 p-3 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {/* --- NUEVA SECCIÓN: DIAGNÓSTICO DE NECESIDAD (Actividad PDF) --- */}
          <div className="col-span-1 md:col-span-2 bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5" />
              2. Diagnóstico de Necesidad Docente (Selección de Función IA)
            </label>
            <p className="text-xs text-indigo-700 mb-4">
              Basado en el Taller de IA: ¿En qué parte del diseño didáctico necesitas más apoyo hoy?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Opción 1: Estructura (ChatGPT Style) */}
              <button
                onClick={() => setPedagogicalNeed('structure')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${pedagogicalNeed === 'structure'
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                  : 'bg-white/50 border-indigo-100 hover:bg-white'
                  }`}
              >
                <div className="p-2 bg-blue-100 w-fit rounded-lg"><List className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">Estructurar</div>
                  <div className="text-[10px] text-slate-500">Secuencias claras, inicio-desarrollo-cierre.</div>
                </div>
              </button>

              {/* Opción 2: Diferenciación (Diffit Style) */}
              <button
                onClick={() => setPedagogicalNeed('differentiation')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${pedagogicalNeed === 'differentiation'
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                  : 'bg-white/50 border-indigo-100 hover:bg-white'
                  }`}
              >
                <div className="p-2 bg-purple-100 w-fit rounded-lg"><Layers className="w-4 h-4 text-purple-600" /></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">Diferenciar (DUA)</div>
                  <div className="text-[10px] text-slate-500">Adaptar para neurodivergencia o niveles.</div>
                </div>
              </button>

              {/* Opción 3: Visualización (Canva Logic) */}
              <button
                onClick={() => setPedagogicalNeed('visualization')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${pedagogicalNeed === 'visualization'
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                  : 'bg-white/50 border-indigo-100 hover:bg-white'
                  }`}
              >
                <div className="p-2 bg-pink-100 w-fit rounded-lg"><Eye className="w-4 h-4 text-pink-600" /></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">Visualizar</div>
                  <div className="text-[10px] text-slate-500">Generar analogías y diagramas explicativos.</div>
                </div>
              </button>

              {/* Opción 4: Evaluación (Copilot Logic) */}
              <button
                onClick={() => setPedagogicalNeed('evaluation')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${pedagogicalNeed === 'evaluation'
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                  : 'bg-white/50 border-indigo-100 hover:bg-white'
                  }`}
              >
                <div className="p-2 bg-emerald-100 w-fit rounded-lg"><FileText className="w-4 h-4 text-emerald-600" /></div>
                <div>
                  <div className="font-bold text-sm text-slate-800">Evaluar</div>
                  <div className="text-[10px] text-slate-500">Rúbricas detalladas y retroalimentación.</div>
                </div>
              </button>
            </div>
          </div>

          {/* OPCIÓN CUSTOM Y EXTRAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">

            {/* Opción 5: Gamificación */}
            <button
              onClick={() => setPedagogicalNeed('gamification')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${pedagogicalNeed === 'gamification'
                ? 'bg-white border-orange-500 ring-2 ring-orange-200 shadow-md'
                : 'bg-white/50 border-orange-100 hover:bg-white'
                }`}
            >
              <div className="p-2 bg-orange-100 w-fit rounded-lg"><Target className="w-4 h-4 text-orange-600" /></div>
              <div>
                <div className="font-bold text-sm text-slate-800">Gamificar</div>
                <div className="text-[10px] text-slate-500">Mecánicas de juego y retos.</div>
              </div>
            </button>

            {/* Opción 6: Contexto Real */}
            <button
              onClick={() => setPedagogicalNeed('context')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${pedagogicalNeed === 'context'
                ? 'bg-white border-teal-500 ring-2 ring-teal-200 shadow-md'
                : 'bg-white/50 border-teal-100 hover:bg-white'
                }`}
            >
              <div className="p-2 bg-teal-100 w-fit rounded-lg"><Brain className="w-4 h-4 text-teal-600" /></div>
              <div>
                <div className="font-bold text-sm text-slate-800">Contextualizar</div>
                <div className="text-[10px] text-slate-500">Casos de la vida real.</div>
              </div>
            </button>

            {/* Opción 7: Personalizado */}
            <div className="col-span-1 md:col-span-2">
              <button
                onClick={() => setPedagogicalNeed('custom')}
                className={`w-full h-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${pedagogicalNeed === 'custom'
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-md'
                  : 'bg-white/50 border-indigo-100 hover:bg-white'
                  }`}
              >
                <div className="p-2 bg-indigo-600 w-fit rounded-lg"><Sparkles className="w-4 h-4 text-white" /></div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800">Otra Necesidad (Manual)</div>
                  <div className="text-[10px] text-slate-500">Escribe tu propia instrucción para la IA.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Input para Custom Need */}
          {pedagogicalNeed === 'custom' && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-bold text-indigo-700 mb-1 block">Describe tu necesidad específica:</label>
              <textarea
                value={customNeed}
                onChange={(e) => setCustomNeed(e.target.value)}
                placeholder="Ej. Quiero que la clase se enfoque mucho en la lectura de comprensión y use textos científicos..."
                className="w-full p-3 rounded-xl border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
          )}
        </div>

        {/* --- NUEVO: PERSONALIZACIÓN AVANZADA --- */}
        <div className="col-span-1 md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <List className="w-4 h-4 text-slate-500" />
            3. Personaliza tu Planeación (Selecciona lo que necesitas)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Columna 1: Secciones */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Secciones a Incluir</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeSections.socioemotional} onChange={e => setIncludeSections({ ...includeSections, socioemotional: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Desglose Socioemocional (Currículum Ampliado)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeSections.evaluationInstrument} onChange={e => setIncludeSections({ ...includeSections, evaluationInstrument: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Instrumentos de Evaluación Detallados
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeSections.homework} onChange={e => setIncludeSections({ ...includeSections, homework: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Estudio Independiente (Tarea)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeSections.resourcesList} onChange={e => setIncludeSections({ ...includeSections, resourcesList: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Lista de Recursos Didácticos
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeSections.bibliography} onChange={e => setIncludeSections({ ...includeSections, bibliography: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  Bibliografía Consultada (APA)
                </label>
              </div>
            </div>

            {/* Columna 2: Contexto */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Contexto a Considerar</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeContext.studentDiagnosis} onChange={e => setIncludeContext({ ...includeContext, studentDiagnosis: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Considerar Diagnóstico de Alumnos
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeContext.schoolVision} onChange={e => setIncludeContext({ ...includeContext, schoolVision: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Alinear a Visión Escolar (PMC)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input type="checkbox" checked={includeContext.communityContext} onChange={e => setIncludeContext({ ...includeContext, communityContext: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Integrar Contexto Municipal ({school.municipality})
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* 3. ESTRATEGIA Y PEC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Estrategia Didáctica
            </label>
            <select
              value={didacticStrategy}
              onChange={(e) => setDidacticStrategy(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 text-sm"
            >
              <option value="Aprendizaje Basado en Proyectos (ABP)">ABP (Proyectos)</option>
              <option value="Aprendizaje Basado en Problemas (ABPr)">ABPr (Problemas)</option>
              <option value="Estudio de Casos">Estudio de Casos</option>
              <option value="Aula Invertida">Aula Invertida</option>
              <option value="Gamificación">Gamificación</option>
              <option value="Aprendizaje Cooperativo">Aprendizaje Cooperativo</option>
              <option value="Aprendizaje Basado en Indagación (STEAM)">Aprendizaje Basado en Indagación (STEAM)</option>
              <option value="Aprendizaje Servicio (AS)">Aprendizaje Servicio (AS)</option>
              <option value="Design Thinking">Design Thinking</option>
              <option value="Aprendizaje Situado">Aprendizaje Situado</option>
              <option value="Sociodrama / Role Playing">Sociodrama / Role Playing</option>
              <option value="Lluvia de Ideas">Lluvia de Ideas</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-500" />
                Vinculación PEC (Comunidad)
              </label>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                <button onClick={() => setPaecMode('manual')} className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all ${paecMode === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>Manual</button>
                <button onClick={() => setPaecMode('linked')} className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all ${paecMode === 'linked' ? 'bg-pink-500 shadow text-white' : 'text-slate-400'}`}>Vinculado</button>
              </div>
            </div>

            {paecMode === 'manual' ? (
              <input
                type="text"
                value={paecProblem}
                onChange={(e) => setPaecProblem(e.target.value)}
                placeholder="Ej. Contaminación, Violencia..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm"
              />
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedPecId}
                  onChange={(e) => setSelectedPecId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-pink-200 bg-pink-50 focus:border-pink-500 text-sm"
                >
                  <option value="">-- Selecciona Proyecto Activo --</option>
                  {activeProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {selectedPecId && (
                  <input
                    type="text"
                    value={pecActivity}
                    onChange={(e) => setPecActivity(e.target.value)}
                    placeholder="Actividad específica del PEC"
                    className="w-full p-2 rounded-lg border border-pink-200 text-xs"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. CONFIGURACIÓN TÉCNICA (Ocultable) */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Duración</label>
            <div className="flex gap-2">
              <select value={numSessions} onChange={(e) => setNumSessions(Number(e.target.value))} className="w-full p-2 border rounded-lg text-sm">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Sesiones</option>)}
              </select>
              <div className="relative w-full">
                <span className="absolute right-8 top-2 text-xs text-slate-400">min/sesión</span>
                <input
                  type="number"
                  value={sessionDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSessionDuration(val > 60 ? 60 : val);
                  }}
                  min={1}
                  max={60}
                  className="w-full p-2 border rounded-lg text-sm pr-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Fechas</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-lg text-xs" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-lg text-xs" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Evaluación</label>
            <select value={evaluationType} onChange={(e) => setEvaluationType(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
              <option value="Rúbrica Detallada">Rúbrica Analítica</option>
              <option value="Rúbrica Holística">Rúbrica Holística</option>
              <option value="Lista de Cotejo">Lista de Cotejo</option>
              <option value="Escala Estimativa">Escala Estimativa</option>
              <option value="Diario de Clase">Diario de Clase</option>
              <option value="Portafolio de Evidencias">Portafolio de Evidencias</option>
              <option value="Guía de Observación">Guía de Observación</option>
              <option value="Registro Anecdótico">Registro Anecdótico</option>
              <option value="Examen Escrito">Examen Escrito</option>
              <option value="Debate / Mesa Redonda">Debate / Mesa Redonda</option>
              <option value="Mapa Mental / Conceptual">Mapa Mental / Conceptual</option>
              <option value="Ensayo">Ensayo</option>
              <option value="Proyecto Integrador">Proyecto Integrador</option>
            </select>
          </div>
        </div>

      </div>

      <button
        disabled={isLoading || (!selectedProgression && !specificTopic)}
        onClick={handleGenerate}
        className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all ${isLoading || (!selectedProgression && !specificTopic)
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          } `}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {isLoading ? 'Aplicando Criterio Pedagógico IA...' : 'Generar Planeación Personalizada'}
      </button>

      {
        error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">

            {error}
          </div>
        )
      }

      {
        result && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 no-print">
              <h4 className="font-bold text-slate-700 uppercase tracking-widest text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Planeación Lista
              </h4>
              <div className="flex gap-2">
                <button onClick={handleSaveToLibrary} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100">
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button onClick={() => handlePrint()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800">
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>

            {/* AUDITORÍA: Cumple con el "Paso 3: Lectura crítica" del PDF */}
            <div className="mb-8 no-print">
              <PedagogicalAuditor
                plan={result}
                subjectName={subject.subjectName}
                semestre={semestre || undefined}
              />
            </div>

            <div className="overflow-auto border border-slate-100 rounded-3xl shadow-xl print:shadow-none print:border-none print:rounded-none">
              <PlanDocument
                ref={printRef}
                plan={result}
                teacherName={teacherName}
                schoolName={school.schoolName}
                cct={school.cct}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default PlanGenerator;
