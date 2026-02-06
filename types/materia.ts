// ============================================
// TIPOS PARA GUÍA CURRICULAR INTERACTIVA
// ============================================

export type Grado = 1 | 2 | 3 | 4 | 5 | 6;

export type CategoriaMCCEMS =
    | 'Recurso Sociocognitivo'
    | 'Área de Conocimiento'
    | 'Ámbito de Formación Socioemocional';

// ============================================
// UNIDADES Y TEMAS
// ============================================

export interface Tema {
    numero: string; // "1.1", "1.2", etc.
    nombre: string;
    contenidos: string[];
    aprendizajesEsperados: string[];
    duracionHoras: number;
}

export interface Unidad {
    numero: number;
    nombre: string;
    proposito: string;
    duracionHoras: number;
    temas: Tema[];
    actividadesSugeridas: string[];
}

// ============================================
// RECURSOS
// ============================================

export interface Recurso {
    tipo: 'libro' | 'articulo' | 'manual';
    titulo: string;
    autor: string;
    editorial?: string;
    año?: number;
    disponibilidad: 'biblioteca' | 'digital' | 'compra';
}

export interface RecursoDigital {
    tipo: 'video' | 'simulador' | 'plataforma' | 'app' | 'documento';
    nombre: string;
    url: string;
    descripcion: string;
}

// ============================================
// EVALUACIÓN
// ============================================

export interface CriterioEvaluacion {
    aspecto: string;
    descripcion: string;
    porcentaje: number;
}

// ============================================
// MATERIA COMPLETA
// ============================================

export interface Materia {
    id: string;
    nombre: string;
    clave: string;
    grado: Grado;

    // Clasificación MCCEMS
    categoria: CategoriaMCCEMS;

    horasSemanales: number;
    totalHoras: number;

    // Información Curricular
    proposito: string;
    competencias: string[];
    ejesFormativos: string[];

    // Contenido Organizado por Unidades
    unidades: Unidad[];

    // Recursos
    bibliografiaBasica: Recurso[];
    bibliografiaComplementaria: Recurso[];
    recursosDigitales: RecursoDigital[];

    // Evaluación
    criteriosEvaluacion: CriterioEvaluacion[];
    instrumentosEvaluacion: string[];

    // Metadata
    activa: boolean;
    fechaCreacion: string;
    creadoPor: string;
}

// ============================================
// DATOS PARA CREAR MATERIA
// ============================================

export interface CrearMateriaData {
    nombre: string;
    clave: string;
    grado: Grado;
    categoria: CategoriaMCCEMS;
    horasSemanales: number;
    totalHoras: number;
    proposito: string;
    competencias: string[];
    ejesFormativos: string[];
    unidades: Unidad[];
    bibliografiaBasica: Recurso[];
    bibliografiaComplementaria: Recurso[];
    recursosDigitales: RecursoDigital[];
    criteriosEvaluacion: CriterioEvaluacion[];
    instrumentosEvaluacion: string[];
}

// ============================================
// PROGRESO DEL MAESTRO (FUTURO)
// ============================================

export interface ProgresoMateria {
    materiaId: string;
    maestroId: string;
    temasVistos: string[]; // IDs de temas: "1.1", "1.2", etc.
    notas: NotaPersonal[];
    ultimaActualizacion: string;
}

export interface NotaPersonal {
    temaId: string;
    contenido: string;
    fecha: string;
}
