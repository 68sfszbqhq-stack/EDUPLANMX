
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Save, Send, Copy, Download, CheckCircle2, Calendar, User, BookOpen, Clock, Table as TableIcon, List, Target } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { generateLessonPlan } from '../services/geminiService';
import { programasSEPService } from '../src/services/programasSEPService';
import { SchoolContext, SubjectContext, LessonPlan } from '../types';
import { getStudentContextSummary } from '../src/services/studentStatsService';
import PlanDocument from './PlanDocument';
import { PedagogicalAuditor } from './PedagogicalAuditor';
import { pecService } from '../src/services/pecService';
import { PECProject } from '../types';

interface PlanGeneratorProps {
  school: SchoolContext;
  subject: SubjectContext;
  teacherName?: string;
  onSave: (plan: LessonPlan) => void;
}

import { useAuth } from '../src/contexts/AuthContext';

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ school, subject, teacherName, onSave }) => {
  const { user } = useAuth();
  // Estados del Formulario Guiado
  // Estados del Formulario Guiado
  const [apiKey, setApiKey] = useState(''); // Estado para la API Key Manual
  const [progresionesDisponibles, setProgresionesDisponibles] = useState<{ id: number, descripcion: string }[]>([]);
  const [selectedProgression, setSelectedProgression] = useState<string>('');
  const [specificTopic, setSpecificTopic] = useState('');
  const [numSessions, setNumSessions] = useState(1);
  const [evaluationType, setEvaluationType] = useState('Rúbrica');
  const [semestre, setSemestre] = useState<number | null>(null);

  // Nuevos Estados requeridos por Supervisión
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Nuevos Estados de Mejora
  const [didacticStrategy, setDidacticStrategy] = useState('Aprendizaje Basado en Proyectos (ABP)');

  // Estado PAEC Flexible (Manual o Vinculado)
  const [paecMode, setPaecMode] = useState<'manual' | 'linked'>('manual');
  const [paecProblem, setPaecProblem] = useState(''); // Modo manual

  // Modo Vinculado (PEC)
  const [activeProjects, setActiveProjects] = useState<PECProject[]>([]);
  const [selectedPecId, setSelectedPecId] = useState('');
  const [pecActivity, setPecActivity] = useState('');

  const [studentContextSummary, setStudentContextSummary] = useState<string>('');

  // Estados de carga y resultado
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Ref para impresión
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Planeacion-${subject.subjectName}-${new Date().toLocaleDateString()}`,
  });

  // Cargar progresiones oficiales al iniciar o cambiar materia
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

  // Cargar contexto de estudiantes (estadísticas reales)
  useEffect(() => {
    const loadStudentStats = async () => {
      const stats = await getStudentContextSummary();
      setStudentContextSummary(stats);
    };
    loadStudentStats();
  }, []);

  // Cargar Proyectos PEC Activos
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
    // Validación básica
    if (!selectedProgression && !specificTopic) {
      setError("Por favor selecciona una progresión o escribe un tema.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Determinar contexto PAEC según modo
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
      // Modo Vinculado
      const pec = activeProjects.find(p => p.id === selectedPecId);
      if (pec) {
        paecContext = `
           VINCULACIÓN AL PROYECTO ESCOLAR COMUNITARIO (PEC):
           - Nombre Proyecto: "${pec.name}"
           - Problemática: "${pec.problemId}"
           - Justificación: "${pec.justification}"
           - Objetivo General: "${pec.generalObjective}"
           - ACTIVIDAD ESPECÍFICA A DESARROLLAR EN ESTA CLASE: "${pecActivity}"
           
           INSTRUCCIÓN SOBRE PEC:
           La planeación DEBE girar en torno a contribuir a este proyecto desde la asignatura de ${subject.subjectName}.
         `;
        finalPaecData = {
          isLinked: true,
          communityProblem: pec.name, // Usamos el nombre del proyecto como "problema" visible
          projectTrigger: pec.generalObjective
        };
      }
    }

    // Construcción del Prompt Estructurado para la IA
    const promptEstructurado = `
      Genera una planeación didáctica para la materia "${subject.subjectName}" (Semestre ${semestre || 'General'}).
      
      CONTEXTO ESCOLAR:
      - Escuela: ${school.schoolName}
      - Turno: ${school.shift || 'Matutino'}
      - Municipio: ${school.municipality || 'Puebla'}
      - Visión: ${school.vision}
      
      DATOS DEL DOCENTE:
      - Nombre: ${teacherName || 'Por definir'}
      
      CONFIGURACIÓN DE TIEMPO (REQUERIDO):
      - Sesiones: ${numSessions}
      - Horas por semana: ${hoursPerWeek}
      - Periodo: Del ${startDate || 'Inicio'} al ${endDate || 'Fin'}
      - DURACIÓN POR SESIÓN: 50 MINUTOS (ESTRICTO).
      
      DIAGNÓSTICO DEL GRUPO (DATOS REALES):
      ${studentContextSummary || 'No hay datos de alumnos registrados.'}

      CONFIGURACIÓN PEDAGÓGICA:
      1. PROGRESIÓN OFICIAL: "${selectedProgression || 'No especificada'}"
      2. TEMA / SITUACIÓN: "${specificTopic}"
      3. ESTRATEGIA DIDÁCTICA: "${didacticStrategy}"
      4. ESTRATEGIA DE EVALUACIÓN: "${evaluationType}"
      
      ${paecContext}
      
      INSTRUCCIONES CLAVE:
      - Usa la Estrategia Didáctica seleccionada como eje de la secuencia.
      - Si hay Problemática PAEC/PEC, vincula todas las actividades a ella.
      - Detalla actividad docente vs estudiante.
      - Incluye tabla de evaluación con criterios específicos.
      - IMPORTANTE: Ajusta los tiempos de Inicio, Desarrollo y Cierre para que sumen EXACTAMENTE 50 minutos por sesión (Ej. 10min, 30min, 10min).
    `;

    try {
      // Pasamos la apiKey manual (si existe) al servicio
      const plan = await generateLessonPlan(promptEstructurado, school, subject, apiKey);

      // FORZAR DATOS DEL USUARIO EN LA PLANEACIÓN FINAL
      const finalPlan: LessonPlan = {
        ...plan,
        meta: {
          ...plan.meta,
          teacher: teacherName || plan.meta?.teacher || '',
          cycle: plan.meta?.cycle || '2024-2025',
          period: plan.meta?.period || 'Semestral',
          gradeGroup: plan.meta?.gradeGroup || 'General',
          totalSessions: numSessions,
          hoursPerWeek: hoursPerWeek,
          startDate: startDate || 'Por definir',
          endDate: endDate || 'Por definir'
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
          Configurador de Clase (Oficial SEP)
        </h3>

        {/* 0. API KEY MANUAL (NUEVO) */}
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


          {/* 1. Selección de Progresión */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Progresión de Aprendizaje ({progresionesDisponibles.length} disponibles)
            </label>
            <select
              value={selectedProgression}
              onChange={(e) => setSelectedProgression(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white transition-all text-sm"
            >
              <option value="">-- Selecciona una progresión oficial --</option>
              {progresionesDisponibles.map(p => (
                <option key={p.id} value={p.descripcion}>
                  {p.id}. {p.descripcion.substring(0, 120)}...
                </option>
              ))}
            </select>
          </div>

          {/* 2. Tema Específico */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Tema o Situación Específica
            </label>
            <input
              type="text"
              value={specificTopic}
              onChange={(e) => setSpecificTopic(e.target.value)}
              placeholder="Ej. Ciberseguridad y redes sociales..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          {/* 3. Estrategia y Vinculación PEC (Modificado) */}
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
                <option value="Aprendizaje Basado en Proyectos (ABP)">Aprendizaje Basado en Proyectos (ABP)</option>
                <option value="Aprendizaje Basado en Problemas (ABPr)">Aprendizaje Basado en Problemas (ABPr)</option>
                <option value="Estudio de Casos">Estudio de Casos</option>
                <option value="Aprendizaje Colaborativo">Aprendizaje Colaborativo</option>
                <option value="Aula Invertida">Aula Invertida</option>
                <option value="Indagación (STEAM)">Indagación (STEAM)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-500" />
                  Vinculación PEC
                </label>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setPaecMode('manual')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all ${paecMode === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>
                    Manual
                  </button>
                  <button
                    onClick={() => setPaecMode('linked')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all ${paecMode === 'linked' ? 'bg-pink-500 shadow text-white' : 'text-slate-400'}`}>
                    Proyecto Vinculado
                  </button>
                </div>
              </div>

              {paecMode === 'manual' ? (
                <input
                  type="text"
                  value={paecProblem}
                  onChange={(e) => setPaecProblem(e.target.value)}
                  placeholder="Ej. Falta de agua, Contaminación..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-pink-500 text-sm"
                />
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedPecId}
                    onChange={(e) => setSelectedPecId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-pink-200 bg-pink-50 focus:border-pink-500 text-sm text-pink-900 font-medium"
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
                      placeholder="¿Qué actividad específica del proyecto harás?"
                      className="w-full p-2 rounded-lg border border-pink-200 bg-white text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Configuración Técnica Detallada */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">

            {/* Sesiones y Horas */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3" /> Duración
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={numSessions}
                    onChange={(e) => setNumSessions(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Sesiones</option>)}
                  </select>
                  <select
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Hrs/Sem</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3" /> Periodo de Aplicación
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="p-2 border border-slate-200 rounded-lg text-xs" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" className="p-2 border border-slate-200 rounded-lg text-xs" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            {/* Evaluación */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                <List className="w-3 h-3" /> Tipo de Evaluación
              </label>
              <select
                value={evaluationType}
                onChange={(e) => setEvaluationType(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:border-purple-500 text-sm"
              >
                <option value="Rúbrica Detallada">Rúbrica Detallada</option>
                <option value="Lista de Cotejo">Lista de Cotejo</option>
                <option value="Guía de Observación">Guía de Observación</option>
                <option value="Proyecto Transversal">Proyecto Transversal</option>
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
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isLoading ? 'Generando Planeación Oficial...' : 'Generar Planeación Completa'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl animate-in zoom-in duration-300">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {/* Controls - Hidden in print */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4 no-print">
            <h4 className="font-bold text-slate-700 uppercase tracking-widest text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Planeación Lista
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
                title="Guardar en historial"
              >
                <Save className="w-4 h-4" /> Guardar
              </button>

              <button
                onClick={handleCopyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                title="Copiar texto plano"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copiado' : 'Copiar Texto'}
              </button>

              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-shadow shadow-lg shadow-slate-200"
                title="Imprimir o guardar como PDF"
              >
                <Download className="w-4 h-4" /> Exportar a PDF
              </button>
            </div>
          </div>

          {/* Auditoría Pedagógica */}
          <div className="mb-8 no-print animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <PedagogicalAuditor
              plan={result}
              subjectName={subject.subjectName}
              semestre={semestre || undefined}
            />
          </div>

          {/* Printable Document */}
          <div className="overflow-auto border border-slate-100 rounded-3xl shadow-xl print:shadow-none print:border-none print:rounded-none">
            <PlanDocument
              ref={printRef}
              plan={result}
              teacherName={teacherName}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanGenerator;
