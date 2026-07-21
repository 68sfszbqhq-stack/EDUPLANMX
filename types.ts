
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
  };

  // 2. Progresiones Detalladas
  curricularElements?: {
    progression: string; // Texto completo
    progressionId?: string; // Ej. 1.2
    learningGoals: string[];
    categories: string[]; // Conceptos Centrales
    subcategories: string[]; // Conceptos Transversales
  };

  // Compatibilidad hacia atrás (legacy)
  learningGoal: string;
  progression: string;

  // 3. Vinculación PAEC
  paec?: {
    isLinked: boolean;
    communityProblem: string; // Problemática comunitaria atendida
    projectTrigger: string; // Vinculo con PEC
  };

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
    agent: string;
    criteria: string;
  }>;

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
      opening: { activity: string; studentActivity: string; time: string; evidence: string };
      development: { activity: string; studentActivity: string; time: string; evidence: string };
      closing: { activity: string; studentActivity: string; time: string; evidence: string };
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

export type AppView = 'dashboard' | 'context' | 'generator' | 'plans' | 'diagnostico' | 'admin-asignacion' | 'admin-alumnos' | 'pmc' | 'paec' | 'flujo' | 'bitacora';

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
