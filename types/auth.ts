// ============================================
// TIPOS PARA AUTENTICACIÓN Y ROLES
// ============================================

export type UserRole = 'superadmin' | 'directivo' | 'maestro' | 'alumno' | 'guest';

export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rol: UserRole;

    // Datos específicos por rol
    institucionId?: string; // Para directivos y maestros
    gruposAsignados?: string[]; // Solo maestros

    // Sistema Multi-Escuela (NUEVO)
    schoolId?: string; // ID de la escuela
    schoolName?: string; // Nombre de la escuela (denormalizado)
    schoolCct?: string; // CCT de la escuela
    puesto?: string; // Director, Docente, etc.
    onboardingCompleto?: boolean; // Si completó el onboarding

    // Perfil Académico (NUEVO)
    materias?: string[]; // Materias que imparte
    grados?: number[]; // Grados/Semestres que atiende (1, 3, 5)
    telefono?: string;

    // Metadata
    activo: boolean;
    fechaCreacion: string;
    ultimoAcceso: string;
    creadoPor?: string;
}

export interface Institucion {
    id: string;
    nombre: string;
    clave: string;
    direccion: {
        calle: string;
        ciudad: string;
        estado: string;
        codigoPostal: string;
    };
    directivoId: string;
    maestros: string[];
    activa: boolean;
    fechaCreacion: string;
}

export interface Grupo {
    id: string;
    nombre: string;
    grado: number;
    grupo: string;
    institucionId: string;
    maestroId: string;
    alumnos: string[];
    cicloEscolar: string;
    activo: boolean;
}

export interface AuthContextType {
    user: Usuario | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    loginAsGuest: () => void; // Nuevo método
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rol: UserRole;
    institucionId?: string;
}
