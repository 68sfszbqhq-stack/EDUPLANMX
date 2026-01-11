// ============================================
// TIPOS PARA ASIGNACIONES DE MATERIAS
// ============================================

export interface AsignacionMateria {
    id: string;
    maestroId: string;
    maestroNombre: string; // Desnormalizado para facilitar consultas
    materiaId: string;
    materiaNombre: string; // Desnormalizado
    materiaGrado: number; // Desnormalizado
    gruposIds: string[];
    gruposNombres: string[]; // Desnormalizado
    cicloEscolar: string;
    activa: boolean;
    fechaCreacion: string;
    creadoPor: string;
}

export interface CrearAsignacionData {
    maestroId: string;
    materiaId: string;
    gruposIds: string[];
    cicloEscolar: string;
}

export interface HorarioMaestro {
    maestroId: string;
    maestroNombre: string;
    asignaciones: AsignacionMateria[];
    totalHoras: number;
    totalGrupos: number;
}
