import { obtenerAlmacenCuenta } from '../src/security/almacenCuenta';
import { fechasSesiones } from '../src/features/planeacion/presentacionPlan';
import { instruccionesEvaluacion, instruccionesPAEC, conservarPAEC, DecisionPAEC } from '../src/features/planeacion/decisionesPlan';
import { idPrograma, generacionPlan, ModeloPlan, SeleccionCurricular } from '../src/features/planeacion/seleccionCurricular';
import RevisionContextoIA from './RevisionContextoIA';
import { crearRevisionContexto, contextoAutorizado, RevisionContexto } from '../src/features/planeacion/revisionContexto';
import { perfilDocenteService } from '../src/services/perfilDocenteService';
import { listarFuentes } from '../src/features/cuaderno/storage';
import { recuperarContexto } from '../src/features/cuaderno/model';
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Save, Send, Copy, Download, CheckCircle2, Calendar, BookOpen, Clock, List, Target, Brain, Layers, Eye, FileText, User, Users, Table as TableIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ContextoCuadernoPlan, { SeleccionCuadernoPlan } from './ContextoCuadernoPlan';
import { generateLessonPlan } from '../services/geminiService';
import { analyticsService } from '../src/services/analyticsService';
import { programasSEPService } from '../src/services/programasSEPService';
import { programasLaboralesService } from '../src/services/programasLaboralesService';
import { SchoolContext, SubjectContext, LessonPlan } from '../types';
import { getStudentContextSummary } from '../src/services/studentStatsService';
import { flujoContextoService } from '../src/services/flujoContextoService';
import PlanDocument from './PlanDocument';
import { PedagogicalAuditor } from './PedagogicalAuditor';
import { RevisionDocente } from './RevisionDocente';
import { pecService } from '../src/services/pecService';
import { PECProject } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import { descargarPlaneacionWord } from '../src/services/wordService';
import { PLAN_MUESTRA } from '../src/demo/modoMuestra';

interface PlanGeneratorProps {
  school: SchoolContext;
  subject: SubjectContext;
  teacherName?: string;
  onSave: (plan: LessonPlan) => void;
  onNavigate?: (view: string) => void;
}

// Machote: prompt que el docente copia y pega en Claude/ChatGPT junto con el CSV
// de respuestas de sus Google Forms, para obtener el resumen del diagnóstico del grupo.
const MACHOTE_DIAGNOSTICO = `Eres un analista educativo experto en bachillerato mexicano (NEM/MCCEMS).

Te comparto las respuestas en CSV de un cuestionario socioeducativo aplicado a mi grupo de bachillerato. Analízalas y genera un RESUMEN DE DIAGNÓSTICO DEL GRUPO de máximo 300 palabras con esta estructura:

1. PERFIL GENERAL: cuántos alumnos, edades, contexto socioeconómico predominante.
2. CONECTIVIDAD: acceso a internet, dispositivos disponibles en casa (importante para decidir si puedo dejar tareas digitales).
3. SITUACIÓN FAMILIAR Y LABORAL: cuántos trabajan además de estudiar, tipos de familia, red de apoyo.
4. INTERESES PREDOMINANTES: qué les gusta, qué actividades los motivan.
5. TRES IMPLICACIONES DIDÁCTICAS CONCRETAS: qué debo hacer diferente en mis clases dado todo lo anterior.

REGLAS:
- NO incluyas ningún dato personal identificable (nombres, CURP, teléfonos, direcciones).
- Habla de porcentajes o proporciones aproximadas, no de alumnos individuales.
- Escribe en español, directo y sin adornos: lo voy a pegar en mi plataforma de planeación.

Aquí está el CSV:
[PEGA AQUÍ TU CSV O ADJÚNTALO]`;

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ school, subject, teacherName, onSave, onNavigate }) => {
  const { user } = useAuth();
  const almacen = obtenerAlmacenCuenta();
  const [pendiente, setPendiente] = useState<{ revision: RevisionContexto; enviar: (contexto: ReturnType<typeof contextoAutorizado>) => Promise<void> } | null>(null);
  const preparandoRef = useRef(false);
  const [preparando, setPreparando] = useState(false);
  const [editarFormulario, setEditarFormulario] = useState(false);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const [cuaderno, setCuaderno] = useState<SeleccionCuadernoPlan | null>(null);

  // Contexto capturado en el Flujo de Contextualización (panel "flujo").
  // Se lee al montar: si el docente lo edita, al volver aquí se recarga.
  const [contextoFlujo, setContextoFlujo] = useState(() => flujoContextoService.load());
  const fasesFlujoActivas = flujoContextoService.fasesCompletas(contextoFlujo);

  // Si el docente entra desde otro dispositivo y viene directo aquí sin pasar por
  // el panel del flujo, traemos su contexto de la nube para no generar en genérico.
  useEffect(() => {
    flujoContextoService.sincronizar(user).then(setContextoFlujo);
  }, [user]);

  // --- Estados Originales ---
  // API Key Manual: vive SOLO en sessionStorage (se borra al cerrar la pestaña, nunca se guarda en disco ni en Firestore)
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('gemini_api_key') || '');

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (value.trim()) {
      sessionStorage.setItem('gemini_api_key', value.trim());
    } else {
      sessionStorage.removeItem('gemini_api_key');
    }
  };
  const programasDisponibles = React.useMemo(() => programasSEPService.buscarPorMateria(subject.subjectName), [subject.subjectName]);
  const [modeloPlan, setModeloPlan] = useState<ModeloPlan>('2024');
  const [programaId, setProgramaId] = useState('');
  const opcionesPrograma = programasDisponibles.filter(p => p.modelo === modeloPlan);
  const programaElegido = opcionesPrograma.find(p => idPrograma(p) === programaId) || null;
  const progresionesDisponibles = programaElegido?.estado === 'oficial' ? programaElegido.progresiones : [];
  const cambiarModelo = (modelo: ModeloPlan) => {
    setModeloPlan(modelo);
    const opciones = programasDisponibles.filter(p => p.modelo === modelo);
    setProgramaId(opciones.length === 1 ? idPrograma(opciones[0]) : '');
    setSelectedProgression('');
  };
  const [selectedProgression, setSelectedProgression] = useState<string>('');

  // Formación Laboral: la planeación se construye sobre un submódulo del programa
  // oficial, no sobre una progresión. Se decide por la UAC seleccionada.
  const programaLaboral = React.useMemo(
    () => programasLaboralesService.buscarPorNombre(subject.subjectName),
    [subject.subjectName]
  );
  const esLaboral = !!programaLaboral;
  const submodulosLaborales = React.useMemo(
    () => (esLaboral ? programasLaboralesService.submodulos(subject.subjectName) : []),
    [esLaboral, subject.subjectName]
  );
  const [submoduloLaboralId, setSubmoduloLaboralId] = useState<string>('');
  const submoduloElegido = React.useMemo(
    () => (submoduloLaboralId ? programasLaboralesService.buscarSubmodulo(submoduloLaboralId) : null),
    [submoduloLaboralId]
  );
  const [specificTopic, setSpecificTopic] = useState('');
  const [numSessions, setNumSessions] = useState(1);
  const [sessionDuration, setSessionDuration] = useState(50);
  const [evaluationType, setEvaluationType] = useState('Lista de Cotejo');
  const [semestre, setSemestre] = useState<number | null>(null);
  const [hoursPerWeek, setHoursPerWeek] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [didacticStrategy, setDidacticStrategy] = useState('Estudio de Casos');
  const [paecMode, setPaecMode] = useState<'none' | 'manual' | 'linked'>('none');
  // Prellenado desde el Flujo de Contextualización (Fase 3): el docente puede sobrescribirlo
  const [paecProblem, setPaecProblem] = useState('');
  const [activeProjects, setActiveProjects] = useState<PECProject[]>([]);
  const [selectedPecId, setSelectedPecId] = useState('');
  const [pecActivity, setPecActivity] = useState('');
  const [studentContextSummary, setStudentContextSummary] = useState<string>('');

  // Diagnóstico del grupo escrito/pegado por el docente (persiste en este navegador)
  const [diagnosticoGrupo, setDiagnosticoGrupo] = useState(() => almacen.getItem('diagnosticoGrupo') || '');
  const [showMachote, setShowMachote] = useState(false);
  const [machoteCopiado, setMachoteCopiado] = useState(false);

  const handleDiagnosticoChange = (value: string) => {
    setDiagnosticoGrupo(value);
    almacen.setItem('diagnosticoGrupo', value);
  };

  // Respaldo en la nube del diagnóstico: se guarda al salir del campo y se
  // recupera en cualquier dispositivo (localStorage queda como caché rápida).
  const puedeUsarNube = user?.id && user.id !== 'guest' && user.rol !== 'guest';

  const guardarDiagnosticoEnNube = async () => {
    if (!puedeUsarNube) return;
    try {
      await setDoc(doc(db, 'users', user!.id), { diagnosticoGrupo }, { merge: true });
    } catch (e) {
      console.error('No se pudo respaldar el diagnóstico en la nube:', e);
    }
  };

  useEffect(() => {
    // Si este navegador no tiene diagnóstico pero la nube sí, recuperarlo
    const recuperar = async () => {
      if (!puedeUsarNube || almacen.getItem('diagnosticoGrupo')) return;
      try {
        const snap = await getDoc(doc(db, 'users', user!.id));
        const guardado = snap.data()?.diagnosticoGrupo;
        if (guardado) {
          setDiagnosticoGrupo(guardado);
          almacen.setItem('diagnosticoGrupo', guardado);
        }
      } catch (e) {
        console.error('No se pudo recuperar el diagnóstico de la nube:', e);
      }
    };
    recuperar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const copiarMachote = () => {
    navigator.clipboard.writeText(MACHOTE_DIAGNOSTICO).then(() => {
      setMachoteCopiado(true);
      setTimeout(() => setMachoteCopiado(false), 2500);
    }).catch(() => { /* clipboard bloqueado: el docente puede seleccionar y copiar manualmente */ });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Analítica: tiempo real de planeación (de abrir el generador a imprimir) ---
  const sessionStartRef = useRef<number>(Date.now());

  // --- Pantalla de espera narrada mientras Gemini genera ---
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const LOADING_MESSAGES = [
    'Consultando la progresión oficial SEP…',
    'Analizando el contexto de tu escuela y tu grupo…',
    'Diseñando la secuencia didáctica (inicio, desarrollo y cierre)…',
    'Elaborando los instrumentos de evaluación…',
    'Revisando vinculación PAEC y transversalidad…',
    'Dando los últimos toques a tu planeación…'
  ];
  const loadingMessage = LOADING_MESSAGES[Math.min(Math.floor(loadingSeconds / 7), LOADING_MESSAGES.length - 1)];
  const loadingProgress = Math.min(92, Math.round((loadingSeconds / 45) * 100));

  useEffect(() => {
    if (!isLoading) {
      setLoadingSeconds(0);
      return;
    }
    const interval = setInterval(() => setLoadingSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Analítica: el docente abrió el generador
  useEffect(() => {
    sessionStartRef.current = Date.now();
    analyticsService.trackPlaneacionIniciada(subject.subjectName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handlePrintOnly = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Planeacion-${subject.subjectName}-${new Date().toLocaleDateString()}`,
  });

  // Imprimir = planeación entregable. Registramos el tiempo total real del docente.
  const handlePrint = () => {
    const tiempoTotalSegundos = (Date.now() - sessionStartRef.current) / 1000;
    analyticsService.trackPlaneacionImpresa(subject.subjectName, tiempoTotalSegundos);
    handlePrintOnly();
  };

  useEffect(() => {
    const modelos = [...new Set(programasDisponibles.map(p => p.modelo).filter(Boolean))];
    const modelo = modelos.length === 1 && modelos[0] === '2025' ? '2025' : '2024';
    const opciones = programasDisponibles.filter(p => p.modelo === modelo);
    setModeloPlan(modelo);
    setProgramaId(opciones.length === 1 ? idPrograma(opciones[0]) : '');
    setSelectedProgression('');
    setSubmoduloLaboralId('');
    setSpecificTopic('');
  }, [programasDisponibles]);

  useEffect(() => { setSemestre(programaElegido?.semestre ?? null); setHoursPerWeek(programaElegido?.metadata.horas_semanales || 0); }, [programaElegido]);

  useEffect(() => {
    // Depende de schoolId: al inicio puede no estar cargado todavía. El modo muestra no lee Firebase.
    if (!user?.schoolId || user.rol === 'guest') return;
    const loadStudentStats = async () => {
      const stats = await getStudentContextSummary(user.schoolId);
      setStudentContextSummary(stats);
    };
    loadStudentStats();
  }, [user?.schoolId]);

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
    if (!esLaboral && opcionesPrograma.length > 1 && !programaElegido) { setError('Elige el programa de tu asignatura.'); return; }
    if (cuaderno && !cuaderno.ready) { setError('Completa el grupo, ciclo y carga las fuentes del cuaderno antes de generar.'); return; }
    // En Formación Laboral la planeación se arma sobre la Actividad Clave del
    // submódulo, así que sin submódulo no hay nada que desarrollar.
    if (esLaboral) {
      if (!submoduloLaboralId) {
        setError("Elige el módulo y submódulo que vas a planear: la planeación se construye sobre su Actividad Clave oficial.");
        return;
      }
    } else if (!selectedProgression && !specificTopic) {
      setError("Por favor selecciona una progresión o escribe un tema.");
      return;
    }

    if (sessionDuration > 60) {
      setError("La duración de la sesión no puede exceder los 60 minutos.");
      return;
    }

    if (preparandoRef.current) return;
    preparandoRef.current = true;
    setPreparando(true);
    setError(null);

    const decisionPAEC: DecisionPAEC = { modo: includeSections.paecLinks ? paecMode : 'none', problema: paecProblem,
      proyecto: activeProjects.find(p => p.id === selectedPecId), actividad: pecActivity };
    let paecContext = '';
    try { paecContext = instruccionesPAEC(decisionPAEC); }
    catch (e) { setError((e as Error).message); preparandoRef.current = false; setPreparando(false); return; }

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
          INSTRUCCIÓN: ${instruccionesEvaluacion(evaluationType)}
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
      ${includeSections.paecLinks ? '- VINCULACIÓN PAEC: Sólo con proyecto acordado y pertinente; si falta, marcar pendiente, sin inventar aprobación.' : '- VINCULACIÓN PAEC: Omitir o reducir.'}
      ${includeSections.resourcesList ? '- RECURSOS: Generar lista detallada.' : ''}
      ${includeSections.socioemotional ? '- SOCIOEMOCIONAL: Incluir desglose completo (Ámbito, Meta, Contenidos).' : '- SOCIOEMOCIONAL: Solo mención breve.'}
      ${includeSections.homework ? '- ESTUDIO INDEPENDIENTE: Incluir tarea con tiempo y retroalimentación.' : '- ESTUDIO INDEPENDIENTE: No asignar tarea.'}
      ${includeSections.evaluationInstrument ? '- EVALUACIÓN: Incluir tabla con instrumentos y porcentajes.' : '- EVALUACIÓN: Solo mencionar estrategia general.'}
      ${includeSections.bibliography ? '- BIBLIOGRAFÍA: Incluir lista de fuentes consultadas (formato APA).' : ''}
    `;

    // El diagnóstico escrito por el docente tiene prioridad sobre el resumen automático
    const diagnosticoEfectivo = diagnosticoGrupo.trim() || studentContextSummary;

    // Contexto del Flujo de Contextualización (plantel, grupo, BAP, PAEC)
    // Se relee aquí por si el docente lo editó en otra pestaña/vista antes de generar
    const bloqueFlujo = flujoContextoService.generarBloquePrompt(flujoContextoService.load());

    const contextInstructions = `
      CONTEXTO A CONSIDERAR:
      ${includeContext.schoolVision ? `- VISIÓN ESCOLAR: "${school.vision}" (Alinearse a esto).` : ''}
      ${includeContext.communityContext ? `- CONTEXTO COMUNIDAD: "${school.municipality}" (Usar ejemplos locales).` : ''}
    `;

    // Construcción del Prompt Estructurado (El "Buen Prompt" del PDF)
    const promptEstructurado = `
      ${aiPersonaInstruction}

      Modelo curricular elegido: ${modeloPlan}; generación de referencia: ${generacionPlan(modeloPlan)}.
      ${!esLaboral && programaElegido?.estado !== 'oficial' ? 'PROPUESTA GENERAL. No presentar como alineación oficial verificada.' : ''}
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
      ${instruccionesEvaluacion(evaluationType)}
      
      ${paecContext}
      
      ${sectionsInstructions}

      SALIDA ESPERADA:
      Genera el documento JSON con la estructura de planeación completa.
      Asegura que incluyas una LISTA DE RECURSOS DIDÁCTICOS (Materiales/Digitales) para cumplir auditoría.
      Asegura que el campo 'activities' refleje la PRIORIDAD seleccionada arriba.
    `;

    try {
      // PRESERVADO: Pasamos la apiKey manual (si existe) al servicio
      let contextoActual = cuaderno?.context;
      if (cuaderno) {
        const schoolId = user?.schoolId || (user?.rol === 'guest' ? 'demo' : '');
        const fuentes = await listarFuentes({ schoolId, userId: user?.id || '', mode: cuaderno.mode });
        contextoActual = recuperarContexto(fuentes, { schoolId, cycle: school.cycle, group: cuaderno.group, subject: subject.subjectName, date: startDate || new Date().toLocaleDateString('en-CA') }, specificTopic || selectedProgression);
        if (!contextoActual.fragments.length) throw new Error('No hay fuentes revisadas aplicables al grupo, ciclo y fecha. Revisa el cuaderno o desactiva su uso.');
      }
      const perfil = perfilDocenteService.generarBloquePrompt(await perfilDocenteService.obtener(puedeUsarNube ? user?.id : undefined));
      const revision = crearRevisionContexto(promptEstructurado,
        includeContext.studentDiagnosis ? diagnosticoEfectivo : '', bloqueFlujo, perfil, contextoActual);
      // Capturamos la configuración. Tras confirmar no volvemos a leer los textos originales.
      const seleccion: SeleccionCurricular | undefined = esLaboral ? undefined : {
        modelo: modeloPlan, programaId: programaElegido ? idPrograma(programaElegido) : null,
        progresionId: progresionesDisponibles.find(p => p.descripcion === selectedProgression)?.id,
      };
      revision.resumen = [subject.subjectName, `Modelo ${modeloPlan}`, selectedProgression || specificTopic || submoduloElegido?.submodulo.nombre || '', `${numSessions} sesiones × ${sessionDuration} minutos`, didacticStrategy, evaluationType, decisionPAEC.modo === 'none' ? 'Solo actividad de aula' : decisionPAEC.modo === 'manual' ? 'Vínculo comunitario por acordar' : `PEC: ${decisionPAEC.proyecto?.name}`];
      setPendiente({ revision, enviar: async (autorizado) => {
        const generationStart = Date.now();
        const plan = await generateLessonPlan(
          autorizado.prompt, school, subject, apiKey, user?.id, submoduloLaboralId || undefined, autorizado.cuaderno, autorizado.perfil, seleccion, { instrumento: evaluationType }
        );
        analyticsService.trackPlaneacionGenerada(subject.subjectName, (Date.now() - generationStart) / 1000);

        const finalPlan: LessonPlan = {
          ...plan,
          date: new Date().toISOString(),
          institution: { name: school.schoolName, cct: school.cct },
          meta: {
            ...plan.meta,
            teacher: teacherName || plan.meta?.teacher || '',
            cycle: school.cycle || plan.meta?.cycle || '',
            period: startDate || endDate ? `${startDate || 'Por asignar'} — ${endDate || 'Por asignar'}` : 'Por asignar',
            gradeGroup: cuaderno?.group || plan.meta?.gradeGroup || 'General',
            // El semestre lo sabe el formulario (viene del programa oficial), no la IA.
            // La lista de cotejo lo pide como dato separado del grupo.
            semester: semestre ?? plan.meta?.semester,
            totalSessions: numSessions,
            hoursPerWeek: hoursPerWeek || 0,
            startDate: startDate || 'Por definir',
            endDate: endDate || 'Por definir',
            methodology: didacticStrategy, // Persistimos la estrategia seleccionada
          },
          sessions: fechasSesiones(plan.sessions, startDate, endDate),
          paec: conservarPAEC(plan.paec, decisionPAEC),
          pecLinkage: decisionPAEC.modo === 'linked' ? {
            isLinked: true,
            pecId: selectedPecId,
            pecActivity: pecActivity
          } : undefined
        };

        setResult(finalPlan);
        setEditarFormulario(false);
        setTimeout(() => { resultadoRef.current?.scrollIntoView({block:'start',behavior:'smooth'}); resultadoRef.current?.focus(); }, 100);
        setPendiente(null);
      } });
    } catch (err: any) {
      setError(err.message || 'Error al generar la planeación.');
    } finally {
      preparandoRef.current = false;
      setPreparando(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (result) {
      onSave(result);
      alert('Planeación guardada con éxito.');
    }
  };

  // Fase 5 del flujo: la mediación docente queda registrada en el propio plan (Fichas 16 y 34)
  const handleConfirmRevision = (ajustes: string) => {
    setResult(prev => prev ? {
      ...prev,
      aiTrace: {
        prompt: prev.aiTrace?.prompt || '',
        model: prev.aiTrace?.model || 'gemini-2.5-flash',
        generatedAt: prev.aiTrace?.generatedAt || new Date().toISOString(),
        teacherAdjustments: ajustes,
        reviewedByTeacher: true,
        reviewedAt: new Date().toISOString(),
      }
    } : prev);
  };

  const revisionPendiente = Boolean(result && !result.aiTrace?.reviewedByTeacher);

  const handleCopyToClipboard = () => {
    if (!result) return;
    let text = `PLANEACIÓN: ${result.title || result.subject}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    {pendiente && <RevisionContextoIA inicial={pendiente.revision} onCancelar={() => setPendiente(null)} onEnviar={pendiente.enviar} />}
    <div hidden={!!pendiente} className="space-y-8 pb-20">
      <div hidden={!!result && !editarFormulario}>
      <details className="no-print border rounded-xl p-3"><summary className="cursor-pointer text-sm">Usar fuentes del cuaderno (opcional)</summary><ContextoCuadernoPlan cycle={school.cycle} subject={subject.subjectName} topic={specificTopic || selectedProgression} date={startDate} onChange={setCuaderno} onOpen={() => onNavigate?.('cuaderno')} /></details>

      {/* --- CUESTIONARIO CONFIGURADOR --- */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm no-print">
        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Prepara tu clase
        </h3>

        {/* 0. API KEY DEL DOCENTE — obligatoria: la app no incrusta ninguna clave */}
        {import.meta.env.VITE_MOTOR_IA === 'terminal' ? (
          <div className="mb-6 p-4 rounded-xl border bg-violet-50 border-violet-200 text-sm text-violet-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <b>IA conectada: {import.meta.env.VITE_TERMINAL_PROVIDER || 'Claude'}.</b> Puedes preparar tu clase sin introducir una clave.
            </span>
          </div>
        ) : (
        <div className={`mb-6 p-4 rounded-xl border ${apiKey.trim()
          ? 'bg-indigo-50 border-indigo-100'
          : 'bg-amber-50 border-amber-300'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className={`text-xs font-bold uppercase flex items-center gap-2 ${apiKey.trim() ? 'text-indigo-700' : 'text-amber-800'}`}>
              <Sparkles className="w-3 h-3" />
              Tu API Key de Gemini {apiKey.trim() ? '' : '(necesaria para generar)'}
            </label>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              ¿No tienes una? Créala GRATIS aquí (1 minuto)
            </a>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Pegar Google Gemini API Key aquí..."
            className="w-full p-2 rounded-lg border border-indigo-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-mono"
          />
          <div className="mt-2 text-[11px] text-indigo-700 leading-relaxed">
            <span className="font-bold">Cómo obtenerla:</span> 1) Abre el botón azul e inicia sesión con tu cuenta de Google →
            2) Presiona <span className="font-mono bg-indigo-100 px-1 rounded">"Create API key"</span> →
            3) Cópiala y pégala aquí. Listo, es gratuita.
          </div>
          <p className="text-[10px] text-indigo-500 mt-2 flex items-start gap-1">
            <ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              <span className="font-bold">Seguridad:</span> tu clave solo vive en este navegador mientras la pestaña está abierta
              (se borra al cerrarla) — nunca se guarda en disco ni se sube a ningún servidor. Es tuya y gratuita: cada
              docente usa la suya, así se reparte la cuota. Consíguela en
              {' '}<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google AI Studio</a>.
            </span>
          </p>
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* 1. SELECCIÓN DE PROGRESIÓN (Igual) */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              ¿Qué vas a enseñar?
            </label>
            {!esLaboral && <div className="border rounded-xl p-4 space-y-3 bg-slate-50">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm font-medium">Modelo del grupo
                  <select aria-label="Modelo del grupo" value={modeloPlan} onChange={e => cambiarModelo(e.target.value as ModeloPlan)} className="mt-1 w-full border rounded-lg p-2 bg-white">
                    <option value="2024">MCCEMS 2024</option>
                    <option value="2025">Modelo 2025</option>
                  </select>
                  <span className="block mt-1 text-xs font-normal text-slate-500">Generación de referencia: {generacionPlan(modeloPlan)}</span>
                </label>
                {opcionesPrograma.length > 1 ? <label className="text-sm font-medium">Programa
                  <select aria-label="Programa curricular" value={programaId} onChange={e => { setProgramaId(e.target.value); setSelectedProgression(''); }} className="mt-1 w-full border rounded-lg p-2 bg-white">
                    <option value="">Elige el programa</option>
                    {opcionesPrograma.map(p => <option key={idPrograma(p)} value={idPrograma(p)}>{p.materia} · semestre {p.semestre}{p.estado === 'oficial' ? '' : ' · Borrador'}</option>)}
                  </select>
                </label> : <div className="text-sm self-center"><strong>{programaElegido?.materia || subject.subjectName}</strong>{programaElegido && <p>Semestre {programaElegido.semestre}</p>}</div>}
              </div>
              {programaElegido?.estado === 'oficial' ? <p className="text-sm text-emerald-700">✓ Programa verificado en el catálogo</p> : <p className="text-sm text-amber-800">{opcionesPrograma.length > 1 && !programaElegido ? 'Elige un programa para ver su contenido.' : programaElegido ? 'Borrador sin verificar. Se generará una propuesta general.' : 'Sin programa verificado para este modelo. Se generará una propuesta general.'}</p>}
              {programaElegido?.url_fuente?.startsWith('https://') && <a className="text-sm text-blue-700 underline" href={programaElegido.url_fuente} target="_blank" rel="noopener noreferrer">Consultar fuente del programa</a>}
            </div>}

            {esLaboral ? (
              /* FORMACIÓN LABORAL: se planea un submódulo, no una progresión.
                 La Actividad Clave del programa oficial es el eje de la planeación. */
              <>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">🔧 Formación Laboral Básica en {programaLaboral!.nombre}.</span>{' '}
                  Generación {programaLaboral!.generacion}. La planeación se construye sobre la <strong>Actividad Clave</strong> del
                  submódulo, tal como viene en el programa oficial de la DGB.
                </div>

                {programaLaboral?.urlFuente?.startsWith('https://') && <a href={programaLaboral.urlFuente} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline">Consultar fuente del programa laboral</a>}
                <select
                  value={submoduloLaboralId}
                  onChange={(e) => setSubmoduloLaboralId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Elige el módulo y submódulo a planear --</option>
                  {submodulosLaborales.map(s => (
                    <option key={s.id} value={s.id}>
                      Módulo {s.modulo.numero} · Submódulo {s.submodulo.numero} — {s.submodulo.nombre}
                    </option>
                  ))}
                </select>

                {submoduloElegido && (
                  <div className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-bold">
                        Módulo {submoduloElegido.modulo.numero}: {submoduloElegido.modulo.nombre}
                      </span>
                      <span className="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-700">
                        {submoduloElegido.submodulo.horasMediacionDocente} h con docente ·{' '}
                        {submoduloElegido.submodulo.horasEstudioIndependiente} h independientes
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 uppercase text-[10px]">
                        Competencia Laboral Básica <span className="font-normal normal-case">(lo que la ATP llama Resultado de Aprendizaje)</span>
                      </p>
                      <p className="text-slate-800">{submoduloElegido.submodulo.competenciaLaboralBasica}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 uppercase text-[10px]">Actividad Clave oficial</p>
                      <p className="text-slate-800 max-h-32 overflow-y-auto">{submoduloElegido.submodulo.actividadClave}</p>
                    </div>
                    {(() => {
                      const conInstrumento = submoduloElegido.submodulo.evidencias.filter(
                        e => e.indicadores.length > 0 || e.criterios.length > 0
                      );
                      return conInstrumento.length ? (
                        <p className="text-emerald-700">
                          ✓ Se usará el instrumento oficial del programa:{' '}
                          {conInstrumento.map(e => e.nombre).join(', ')}
                        </p>
                      ) : (
                        <p className="text-amber-700">
                          ⚠ El instrumento de evaluación de este submódulo no se pudo leer del PDF oficial.
                          La IA propondrá uno: <strong>cotéjalo con tu programa impreso antes de entregar.</strong>
                        </p>
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <>
                {programaElegido?.estado === 'oficial' && <select
                  aria-label={modeloPlan === '2025' ? 'Propósito formativo' : 'Progresión oficial'}
                  value={selectedProgression}
                  onChange={(e) => setSelectedProgression(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 text-sm"
                >
                  <option value="">{modeloPlan === '2025' ? 'Elige un propósito formativo' : 'Elige una progresión oficial'}</option>
                  {progresionesDisponibles.map(p => (
                    <option key={p.id} value={p.descripcion}>
                      {p.id}. {p.descripcion.substring(0, 120)}...
                    </option>
                  ))}
                </select>}
                <input
                  type="text"
                  value={specificTopic}
                  onChange={(e) => setSpecificTopic(e.target.value)}
                  placeholder={programaElegido?.estado === 'oficial' ? "O escribe un tema específico..." : "Escribe el tema para tu propuesta general"}
                  className="w-full mt-2 p-3 rounded-xl border border-slate-200 text-sm"
                />
              </>
            )}
          </div>

<details className="col-span-1 md:col-span-2"><summary className="cursor-pointer font-medium text-sm mb-3">Enfoque especial (opcional)</summary>
          {/* --- NUEVA SECCIÓN: DIAGNÓSTICO DE NECESIDAD (Actividad PDF) --- */}
          <div className="col-span-1 md:col-span-2 bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-3">
              <Brain className="w-5 h-5" />
              ¿Quieres un enfoque especial?
            </h4>
            <p className="text-xs text-indigo-700 mb-4">
              Por defecto organizamos una secuencia clara. Puedes cambiar el enfoque.
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
                  <div className="text-[10px] text-slate-500">Instrumento elegido y retroalimentación.</div>
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
        </details>
        </div>

        <details className="border rounded-xl p-3 mb-4"><summary className="cursor-pointer font-medium text-sm">Más opciones de contenido y contexto</summary>
        {/* --- NUEVO: PERSONALIZACIÓN AVANZADA --- */}
        <div className="col-span-1 md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <List className="w-4 h-4 text-slate-500" />
            Contenido adicional
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

        {/* --- CONTEXTO DEL FLUJO DE CONTEXTUALIZACIÓN --- */}
        <div className={`col-span-1 md:col-span-2 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 mt-6 ${fasesFlujoActivas > 0
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none mt-0.5">🧭</span>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {fasesFlujoActivas > 0
                  ? `Datos de contexto guardados: ${fasesFlujoActivas}/4 fases capturadas`
                  : 'Aún no has llenado el Flujo de Contextualización'}
              </p>
              <p className="text-xs text-slate-500">
                {fasesFlujoActivas > 0
                  ? 'Podrás elegir si compartes estos datos al revisar el envío. No se incorporan automáticamente.'
                  : 'Llénalo una vez por semestre y todas tus planeaciones saldrán contextualizadas a TU grupo.'}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('flujo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${fasesFlujoActivas > 0
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {fasesFlujoActivas > 0 ? 'Editar flujo' : 'Abrir el flujo'}
            </button>
          )}
        </div>

        </details>
        {/* --- DIAGNÓSTICO DE MI GRUPO (contextualización real) --- */}
        <div className="col-span-1 md:col-span-2 bg-emerald-50 p-5 rounded-2xl border border-emerald-200 my-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              ¿Cómo es tu grupo y con qué cuenta?
            </label>
            <button
              type="button"
              onClick={() => setShowMachote(!showMachote)}
              className="text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
            >
              {showMachote ? 'Ocultar guía' : '📋 ¿Cómo generarlo desde mis Google Forms?'}
            </button>
          </div>

          {showMachote && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-3">
              <p className="font-bold text-emerald-800">Genera tu diagnóstico en 4 pasos (5 minutos, una vez por semestre):</p>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>Abre el Google Sheets con las respuestas de tu formulario → <span className="font-semibold">Archivo → Descargar → CSV</span>.</li>
                <li>Abre <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">Claude</a> o <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">ChatGPT</a> y pega el machote de abajo junto con tu CSV (adjúntalo o pega su contenido).</li>
                <li>Copia el resumen que te devuelva la IA.</li>
                <li>Pégalo en el cuadro de aquí abajo. Se guarda en este navegador y se usará en <span className="font-semibold">todas</span> tus planeaciones.</li>
              </ol>
              <div className="relative">
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{MACHOTE_DIAGNOSTICO}</pre>
                <button
                  type="button"
                  onClick={copiarMachote}
                  className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${machoteCopiado
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    }`}
                >
                  {machoteCopiado ? <><CheckCircle2 className="w-3 h-3" /> ¡Copiado!</> : <><Copy className="w-3 h-3" /> Copiar machote</>}
                </button>
              </div>
              <p className="text-[10px] text-emerald-700">
                💡 El machote le pide a la IA que NO incluya datos personales de tus alumnos: solo porcentajes y patrones del grupo.
              </p>
            </div>
          )}

          <textarea
            value={diagnosticoGrupo}
            onChange={(e) => handleDiagnosticoChange(e.target.value)}
            onBlur={guardarDiagnosticoEnNube}
            placeholder="Pega aquí el resumen del diagnóstico de tu grupo (perfil socioeconómico, acceso a internet, situación laboral/familiar, intereses, implicaciones didácticas)..."
            className="w-full p-3 rounded-xl border border-emerald-200 bg-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 min-h-[110px]"
          />
          <p className="text-[10px] text-emerald-700 mt-1.5">
            {diagnosticoGrupo.trim()
              ? 'Guardado. Revisa recursos, apoyos y condiciones actuales del grupo.'
              : 'Opcional pero poderoso: esto es lo que convierte una planeación genérica en una planeación de TU grupo.'}
          </p>
        </div>

        {/* 3. ESTRATEGIA Y PEC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Estrategia Didáctica
            </label>
            <select aria-label="Estrategia didáctica"
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
                <button type="button" onClick={() => setPaecMode('none')} className="px-2 py-1 text-xs">Solo aula</button>
                <button onClick={() => setPaecMode('manual')} className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all ${paecMode === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}>Por acordar</button>
                <button onClick={() => setPaecMode('linked')} className={`px-2 py-0.5 text-[10px] rounded-md font-bold transition-all ${paecMode === 'linked' ? 'bg-pink-500 shadow text-white' : 'text-slate-400'}`}>Vinculado</button>
              </div>
            </div>

            {paecMode === 'none' ? <p className="text-sm text-slate-500">Sin proyecto comunitario para esta clase.</p> : paecMode === 'manual' ? (
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
              <select aria-label="Número de sesiones" value={numSessions} onChange={(e) => setNumSessions(Number(e.target.value))} className="w-full p-2 border rounded-lg text-sm">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Sesiones</option>)}
              </select>
              <div className="relative w-full">
                <span className="absolute right-8 top-2 text-xs text-slate-400">min/sesión</span>
                <input
                  aria-label="Minutos por sesión" type="number"
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
            <label className="text-xs font-bold text-slate-500 uppercase">Datos del grupo</label>
            <label className="block text-xs">Semestre<input aria-label="Semestre del grupo" type="number" min={1} max={6} value={semestre || ''} onChange={e=>setSemestre(Number(e.target.value)||null)} className="w-full border rounded p-2" /></label>
            <label className="block text-xs">Horas semanales (opcional)<input aria-label="Horas semanales" type="number" min={0} value={hoursPerWeek || ''} onChange={e=>setHoursPerWeek(Number(e.target.value)||0)} className="w-full border rounded p-2" /></label>
            <span className="text-xs text-slate-500">Fechas opcionales</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-lg text-xs" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-lg text-xs" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Evaluación</label>
            <select aria-label="Instrumento de evaluación" value={evaluationType} onChange={(e) => setEvaluationType(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
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

      {isLoading ? (
        /* --- PANTALLA DE ESPERA NARRADA: el docente ve el avance y no vuelve a picar el botón --- */
        <div className="w-full p-6 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-inner">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-indigo-900 text-sm">Generando tu planeación… no cierres esta ventana</p>
              <p className="text-indigo-600 text-sm mt-0.5 animate-pulse">{loadingMessage}</p>
            </div>
          </div>
          <div className="w-full bg-indigo-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-indigo-400 mt-2 text-right">
            {import.meta.env.VITE_MOTOR_IA === 'terminal' ? `Con ${import.meta.env.VITE_TERMINAL_PROVIDER || 'Claude'} por terminal puede tardar varios minutos` : 'Esto suele tardar entre 20 y 40 segundos'} ({loadingSeconds}s)
          </p>
        </div>
      ) : (
        <button
          disabled={preparando || (esLaboral ? !submoduloLaboralId : !selectedProgression && !specificTopic)}
          onClick={handleGenerate}
          className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all ${(!selectedProgression && !specificTopic)
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            } `}
        >
          <Sparkles className="w-5 h-5" />
          {preparando ? 'Preparando vista previa…' : 'Revisar información antes de generar'}
        </button>
      )}

      {/* Modo muestra: ver el resultado sin llave de IA, con una planeación hecha antes con estos mismos datos */}
      {user?.rol === 'guest' && PLAN_MUESTRA && !isLoading && !result && (
        <div className="-mt-2 mb-2 p-4 rounded-xl border border-blue-200 bg-blue-50 text-sm text-blue-900 flex flex-wrap items-center gap-3">
          <span className="flex-1 min-w-[16rem]">También puedes explorar una planeación de ejemplo sin generar una nueva.</span>
          <button
            onClick={() => { setError(null); setResult(PLAN_MUESTRA); }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
          >
            Ver planeación de ejemplo
          </button>
        </div>
      )}

      </div>
      {
        error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">

            {error}
          </div>
        )
      }

      {
        result && (
          <div ref={resultadoRef} tabIndex={-1} className="animate-in fade-in slide-in-from-top-4 duration-700">
            <button onClick={()=>setEditarFormulario(!editarFormulario)} className="text-sm text-blue-700 underline mb-4">{editarFormulario ? 'Ocultar formulario' : 'Ajustar otra planeación'}</button>
            <p className="mb-4 text-sm">{result.sessions?.length || result.meta?.totalSessions} sesiones · {result.assessmentInstrument?.name || evaluationType} · {result.teachingKit?.length || 0} materiales desarrollados</p>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 no-print">
              <h4 className="font-bold text-slate-700 uppercase tracking-widest text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Borrador para revisar
              </h4>
              <div className="flex gap-2">
                <button onClick={handleSaveToLibrary} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100">
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button
                  onClick={() => descargarPlaneacionWord(result, school.schoolName, school.cct)}
                  disabled={revisionPendiente}
                  title={revisionPendiente ? 'Confirma primero tu revisión docente' : 'Descargar en Word'}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" /> Word
                </button>
                <button
                  onClick={() => handlePrint()}
                  disabled={revisionPendiente}
                  title={revisionPendiente ? 'Confirma primero tu revisión docente' : 'Exportar a PDF'}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>

            {/* FASE 5 — Revisión docente: la IA propone, el docente decide (Fichas 16 y 34) */}
            <div className="mb-6">
              <RevisionDocente plan={result} onConfirm={handleConfirmRevision} />
            </div>

            {/* FASE 6 — Auditoría con el checklist oficial (Ficha 01) */}
            <div className="mb-8 no-print">
              <PedagogicalAuditor
                plan={result}
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
    </>
  );
};

export default PlanGenerator;
