export interface IndicadoresAcademicos {
    abandonoEscolar: number; // Porcentaje
    reprobacion: number; // Porcentaje
    eficienciaTerminal: number; // Porcentaje
    matriculaTotal: number;
}

export interface Infraestructura {
    aulasConElectricidad: boolean;
    aulasConInternet: boolean;
    laboratorioComputacion: boolean;
    instalacionesDeportivas: boolean;
    fortalezas: string[];
    areasOportunidad: string[];
    descripcionGeneral: string; // ej: "NUEVA CREACION..."
}

export interface ProblematicaPAEC {
    id: string;
    titulo: string; // ej: "Contaminación del río local"
    descripcion?: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
    causas: string[]; // ej: ["Basura", "Drenaje"]
    afectados: string[]; // ej: ["Comunidad", "Estudiantes"]
    criterios: {
        impactoSocial: boolean;
        viabilidad: boolean;
        interesEstudiantil: boolean;
        transversalidad: boolean;
    };
    seleccionada: boolean; // Si es la prioridad del ciclo
    fechaRegistro: string;
}

export interface DatosEscuelaPMC {
    schoolId: string;
    indicadores: IndicadoresAcademicos;
    infraestructura: Infraestructura;
    paec: ProblematicaPAEC[];
    updatedAt: string;
}
