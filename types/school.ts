// ============================================
// TIPOS PARA SISTEMA MULTI-ESCUELA
// ============================================

export type Puesto =
    | 'Director'
    | 'Subdirector'
    | 'Coordinador Académico'
    | 'Docente'
    | 'Prefecto'
    | 'Orientador';

export type Turno = 'Matutino' | 'Vespertino' | 'Nocturno' | 'Discontinuo';

// ============================================
// ESCUELA
// ============================================

export interface School {
    id: string;
    nombre: string;
    cct: string;
    municipio: string;
    estado: string;
    turno: Turno;
    codigoAcceso: string; // Para que otros se unan (ej: "CBT001")

    // Contexto escolar (lo que ya tienes)
    vision?: string;
    metasComunitarias?: string;
    infraestructura?: string;

    // Metadata
    createdAt: string;
    createdBy: string; // userId del creador
    activa: boolean;

    // Opcional
    logo?: string;
    telefono?: string;
    direccion?: string;

    // Estadísticas
    estadisticas: {
        totalDocentes: number;
        totalPlaneaciones: number;
        ultimaActualizacion: string;
    };

    // Directivos (pueden editar contexto)
    directivos: string[]; // userIds
}

// ============================================
// USUARIO EXTENDIDO
// ============================================

export interface UserProfile {
    id: string;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;

    // Escuela
    schoolId: string;
    schoolName: string; // Denormalizado para queries rápidas

    // Puesto y rol
    puesto: Puesto;
    rol: 'maestro' | 'directivo' | 'superadmin';

    // Para docentes
    materias?: string[]; // ["Matemáticas", "Física"]
    grados?: number[]; // [1, 3, 5] (semestres)

    // Metadata
    createdAt: string;
    ultimoAcceso: string;
    onboardingCompleto: boolean;

    // Opcional
    telefono?: string;
    fotoPerfil?: string;
}

// ============================================
// DATOS PARA CREAR ESCUELA
// ============================================

export interface CreateSchoolData {
    nombre: string;
    cct: string;
    municipio: string;
    estado: string;
    turno: Turno;
    puestoCreador: Puesto;
}

// ============================================
// DATOS PARA COMPLETAR PERFIL
// ============================================

export interface CompleteProfileData {
    puesto: Puesto;
    materias?: string[];
    grados?: number[];
    telefono?: string;
}

// ============================================
// BÚSQUEDA DE ESCUELAS
// ============================================

export interface SchoolSearchResult {
    id: string;
    nombre: string;
    cct: string;
    municipio: string;
    turno: Turno;
    codigoAcceso: string;
    totalDocentes: number;
}

// ============================================
// INVITACIÓN A ESCUELA
// ============================================

export interface SchoolInvitation {
    id: string;
    schoolId: string;
    schoolName: string;
    codigo: string;
    creadoPor: string;
    createdAt: string;
    expiraEn: string;
    usosRestantes: number;
    activa: boolean;
}
