
export interface SchoolContext {
  schoolName: string;
  cct: string;
  cycle: string; // Ej. 2024-2025
  shift: 'Matutino' | 'Vespertino' | 'Nocturno' | 'Discontinuo' | 'Mixto';
  municipality: string;
  vision: string;
  communityGoals: string;
  infrastructure: string;
}

export interface MCCEMSMetadata {
  id: string;
  category: 'recurso' | 'area' | 'ambito';
  name: string;
  url: string;
  progresionesCount: number;
}

export interface SubjectContext {
  subjectId: string;
  subjectName: string;
  formativePurpose: string;
  curriculumContent: string;
  mccemsCategory: string;
}

/** Un momento (apertura, desarrollo o cierre) de una sesión. */
export interface SessionPhase {
  activity: string;
  studentActivity: string;
  time: string;
  evidence: string;
  /** Técnica didáctica (lluvia de ideas, rompecabezas, debate…). El formato del
   *  BGO la pide en su propia columna, separada de las actividades. */
  technique?: string;
}

export interface LessonPlan {
  title: string;
  date: string; // Fecha de creación
  subject: string;

  // 1. Datos Generales Extendidos
  meta?: {
    teacher: string;
    cycle: string;
    period: string;
    gradeGroup: string;
    totalSessions: number;
    hoursPerWeek: number; // NUEVO
    startDate: string;    // NUEVO
    endDate: string;      // NUEVO
    methodology?: string; // NUEVO: Metodología Activa (ABP, ABPr, etc.)

    // Datos de identificación que exige la lista de cotejo de la ATP.
    // No los inventa la IA: salen del programa oficial y del formulario.
    componente?: 'fundamental' | 'ampliado' | 'laboral';
    areaOrRecurso?: string; // Área de conocimiento, recurso sociocognitivo o ámbito socioemocional
    semester?: number;      // separado del grupo: la lista los pide como datos distintos
    group?: string;
    modelo?: '2024' | '2025'; // generación curricular; define el vocabulario del documento
  };

  // 2. Progresiones Detalladas
  // OJO con los nombres: en el modelo 2024 estos campos son Categorías/Subcategorías
  // para los recursos sociocognitivos y Conceptos centrales/transversales para las
  // áreas de conocimiento; en el modelo 2025 todo se llama Contenidos formativos.
  // Las etiquetas visibles salen de data/vocabularioCurricular.ts, no de aquí.
  curricularElements?: {
    progression: string; // Texto completo (o propósito formativo en el modelo 2025)
    progressionId?: string; // Ej. 1.2
    learningGoals: string[];
    categories: string[];
    subcategories: string[];
    /** Aprendizajes de trayectoria (modelo 2024) o perfil de egreso (modelo 2025) */
    trajectoryLearning?: string[];
    /** Contenidos a abordar, derivados del análisis de progresiones y metas */
    contents?: string[];
    /** Elementos propios de ciertas UAC: dimensión (Humanidades), práctica de
     *  ciencia e ingeniería (CNEyT), etc. La lista de cotejo los pide cuando aplican. */
    uacSpecificElements?: string;
    /** Concepto central de la secuencia. El formato de planeación del BGO lo pide
     *  como casilla propia, arriba de las progresiones. */
    centralConcept?: string;
  };

  // Compatibilidad hacia atrás (legacy)
  learningGoal: string;
  progression: string;

  // 3. Vinculación PAEC
  paec?: {
    isLinked: boolean;
    communityProblem: string; // Problemática comunitaria atendida
    projectTrigger: string; // Vinculo con PEC
    /** Nombre del Proyecto Escolar Comunitario. La lista de cotejo lo pide como
     *  punto propio; antes dependía de que la IA lo escribiera dentro de projectTrigger. */
    pecName?: string;
    /** Productos que evidencian el aprendizaje en el desarrollo del PEC. Es un
     *  punto distinto al de los productos de la secuencia. */
    pecProducts?: string[];
  };

  // 2b. Elementos curriculares de FORMACIÓN LABORAL
  // Van aparte a propósito: es otro modelo curricular, no una variante del fundamental.
  // Cuando meta.componente === 'laboral' se llena esto y NO curricularElements.
  laboral?: {
    programa: string;        // "Asistencia Infantil"
    moduloNumero: number;
    moduloNombre: string;
    submoduloNumero: number;
    submoduloNombre: string;
    /** Texto oficial. La ATP lo pide como "Resultado de Aprendizaje". */
    competenciaLaboralBasica: string;
    /** Texto oficial del programa: la planeación lo desarrolla, no lo sustituye. */
    actividadClave: string;
    /** Competencias laborales que se desarrollan en la secuencia */
    competenciasLaborales: string[];
    horasMediacionDocente: number;
    horasEstudioIndependiente: number;
    /** Contenidos derivados del análisis de las actividades de la competencia laboral */
    contenidos: string[];
    /** Transversalidad propia del componente laboral (la lista de cotejo laboral la
     *  pide además de la vinculación con otras UAC y el PEC) */
    habilidadesVidaTrabajo: string;
    desarrolloSostenible: string;
    /** Si el instrumento salió del programa oficial o lo propuso la IA. Se imprime,
     *  para que el docente sepa cuál debe cotejar contra el programa impreso. */
    instrumentoOficial?: boolean;
  };

  // 3b. Productos y trabajo colaborativo (dos puntos separados de la lista de cotejo)
  /** Lista consolidada de productos/evidencias que elabora el estudiantado */
  products?: string[];
  /** Dinámicas concretas que promueven el trabajo colaborativo */
  collaborativeWork?: string;

  // 4. Fundamento (La justificación pedagógica)
  fundamento?: {
    progressionJustification: string;
    sociocognitiveLink: string; // Vinculo con otros recursos (pensamiento crítico, etc)
    socioemotionalLink: string; // Vinculo con recursos socioemocionales
    transversalityLink: string; // Vinculo con otras áreas

    // NUEW: Desglose Socioemocional Detallado (Requerido 2024)
    socioemotionalScope?: string; // Ámbito (Ej. Vida Saludable)
    socioemotionalMeta?: string;  // Meta de Aprendizaje SE
    socioemotionalPurpose?: string; // Propósito específico
    socioemotionalContent?: string; // Contenido estífico
  };

  // 5. Contexto
  context?: {
    diagnosis: string;
    studentProfile: string;
  };

  // 6. Secuencia Didáctica
  sequence: {
    opening: string;
    development: string;
    closing: string;
    detailed?: {
      opening: { activity: string; studentActivity: string; time: string; evidence: string; resources?: string; evaluationType?: string; instrument?: string };
      development: { activity: string; studentActivity: string; time: string; evidence: string; resources?: string; evaluationType?: string; instrument?: string };
      closing: { activity: string; studentActivity: string; time: string; evidence: string; resources?: string; evaluationType?: string; instrument?: string };
    };
  };

  // 7. Estudio Independiente
  independentStudy?: {
    activities: string;
    feedbackLink: string; // Cómo se retroalimenta
    feedbackStrategy?: string; // NUEVO: Estrategia específica (Individual/Grupal + Momento)
    resources: string;
    estimatedTime: string;
  };

  // 8. Inclusión y DUA
  duaStrategies?: string;

  // 9. Evaluación
  evaluation: string;
  evaluationDetails?: {
    diagnostic: string;
    formative: string;
    summative: string;
    instruments: string[];
    criteria: string[];
  };

  evaluationTable?: Array<{
    instrument: string;
    percentage: number;
    // La lista de cotejo pide identificar el TIPO por momento y por agente, no solo
    // la ponderación. Sin estas dos columnas el punto se marca como incompleto.
    moment: string; // Diagnóstica | Formativa | Sumativa
    agent: string;  // Autoevaluación | Coevaluación | Heteroevaluación
    criteria: string;
  }>;

  /** Criterios de la rúbrica del producto principal, con su peso (suman 100). */
  rubric?: Array<{ criterion: string; weight: number }>;

  // 9b. Materiales, recursos y REFERENCIAS (la lista de cotejo pide los tres)
  references?: string[]; // bibliografía y fuentes consultadas

  // 10. Retroalimentación Docente (Template vacío para llenar después)
  teacherReflection?: {
    strengths: string;
    opportunities: string;
    adjustments: string;
  };

  // 10b. Ciclo de retroalimentación formativa del MCCEMS (Fichas 03 y 18)
  feedbackCycle?: {
    whereGoing: string;    // ¿Hacia dónde va? — meta clara para el estudiante
    whereIs: string;       // ¿Dónde se encuentra? — evidencia que lo muestra
    howToGetThere: string; // ¿Cómo puede llegar ahí? — sugerencias CONCRETAS
  };

  // 10c. Trazabilidad del uso de IA (Fichas 16 y 34: la IA apoya, el docente decide)
  aiTrace?: {
    prompt: string;          // prompt exacto enviado al modelo
    model: string;
    generatedAt: string;     // ISO
    teacherAdjustments: string; // qué ajustó el docente tras la lectura crítica
    reviewedByTeacher: boolean;
    reviewedAt?: string;     // ISO
  };

  resources: string[];
  duration: string;
  transversality?: any; // Compatibilidad legacy
  mccemsAlignment: {
    documentUrl: string;
    validated: boolean;
  };

  // Múltiples Sesiones (Array)
  sessions?: Array<{
    sessionNumber: number;
    date: string;
    topic: string;
    sequence: {
      opening: SessionPhase;
      development: SessionPhase;
      closing: SessionPhase;
    };
    resources: string[];
  }>;

  // 11. Vinculación PEC (NUEVO)
  pecLinkage?: {
    isLinked: boolean;
    pecId?: string;
    pecActivity?: string; // Actividad específica del PEC que se aborda
  };
}

export type AppView = 'dashboard' | 'context' | 'generator' | 'plans' | 'diagnostico' | 'admin-asignacion' | 'admin-alumnos' | 'pmc' | 'paec' | 'flujo' | 'bitacora' | 'perfil-docente' | 'grupos' | 'mi-escuela';

// --- FLUJO DE CONTEXTUALIZACIÓN (fases que alimentan la planeación) ---

export type BAPCategoriaId = 'didacticas' | 'socioeconomicas' | 'fisicas' | 'socioemocionales';

export interface BAPCategoria {
  detectada: boolean;
  notas: string;
  estrategiasElegidas: string[]; // estrategias sugeridas que el docente aceptó
}

export interface ContextoFlujo {
  // Fase 0 — Contexto del plantel (complementa SchoolContext)
  plantel: {
    aprobacion: string;          // % aprobación
    abandono: string;            // % abandono
    eficienciaTerminal: string;  // % eficiencia terminal
    conectividad: string;        // internet/dispositivos en el plantel
    fortalezas: string;          // FODA resumido
  };
  // Fase 1 — Diagnóstico del grupo (Fichas 01 y 24)
  grupo: {
    intereses: string;
    saberesPrevios: string;
    desafios: string;
    porcentajeTrabaja: string;
    estilosAprendizaje: string;
    socioemocional: string;
  };
  // Fase 2 — Registro de BAP (Ficha 08)
  bap: Record<BAPCategoriaId, BAPCategoria>;
  // Fase 3 — Contexto comunitario y PAEC (Fichas 39-42)
  paec: {
    problematica: string;
    asignaturas: string[]; // ≥3 para PAEC formal
    productoComunitario: string;
    actores: string;
  };
  actualizadoEl: string; // ISO date
}

// --- NUEVOS TIPOS PARA PMC Y PAEC ---

export interface PMCDiagnosis {
  infrastructure: string;
  totalStudents: number;
  academicIndicators: {
    dropoutRate: number;
    failureRate: number;
    terminalEfficiency: number;
  };
  strengths: string;
  areasOfOpportunity: string;
}

export interface PMCGoal {
  id: string;
  area: 'Aprendizaje' | 'Formación Docente' | 'Infraestructura' | 'Convivencia' | 'Vinculación';
  description: string; // Meta
  actions: Array<{
    action: string;
    responsible: string;
    startDate: string;
    endDate: string;
    resources: string;
    indicators: string;
  }>;
  progress?: number;
}

export interface PMC {
  schoolId: string;
  cycle: string;
  diagnosis: PMCDiagnosis;
  goals: PMCGoal[];
}

// --- BITÁCORA DOCENTE (cierra el ciclo del flujo de contextualización) ---

export type SemaforoNivel = 'verde' | 'amarillo' | 'rojo';

export interface BitacoraEntry {
  id: string;
  fecha: string;      // YYYY-MM-DD
  grupo: string;
  materia: string;
  tema: string;
  semaforo: SemaforoNivel; // 🟢 comprendido · 🟡 dudas · 🔴 no se entendió
  quePaso: string;    // logros de la sesión
  queFallo: string;   // obstáculos didácticos o técnicos
  queSigue: string;   // acuerdos de mejora / ajuste
}

export interface ProblemPAEC {
  id: string;
  name: string;
  severity: 'Alta' | 'Media' | 'Baja';
  affected: string[]; // Estudiantes, Familias...
  causes: string[];
  resources: string[];
}

export interface PECProject {
  id: string;
  name: string;
  problemId: string; // Vincula con ProblemPAEC
  justification: string;
  generalObjective: string;
  specificObjectives: string[];
  duration: string;
  // Cronograma simplificado
  stages: Array<{
    name: string;
    period: string;
    activities: string[];
  }>;
  products: string[];
}
