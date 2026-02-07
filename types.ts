
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

export type AppView = 'dashboard' | 'context' | 'generator' | 'plans' | 'diagnostico' | 'admin-asignacion' | 'admin-alumnos' | 'pmc' | 'paec';

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
