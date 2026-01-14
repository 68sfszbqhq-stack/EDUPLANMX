export interface EncabezadoInstitucional {
    institucion_superior: string;   // Ej. Secretaría de Educación Pública
    subsecretaria: string;
    direccion_general: string;
    supervision_escolar: string;    // Ej. Zona 013
    nombre_escuela: string;         // Ej. Bachillerato General Oficial "Carlos Camacho Espíritu"
    turno: string;                  // Ej. Vespertino
    cct: string;                    // Ej. 21EBH0026G
    logo_izquierdo?: string;        // URL opcional
    logo_derecho?: string;          // URL opcional
}

export interface IdentidadProyecto {
    nombre_programa: string;        // Ej. PAEC - Programa Aula Escuela Comunidad
    titulo_proyecto: string;        // Ej. "Cuidado y prevención de la salud"
    tipo_documento: string;         // Ej. Plan Factible
    ciclo_escolar: string;          // Ej. 2025 – 2026
    fecha_elaboracion: string;
}

export interface SeccionesInformativas {
    justificacion: string;          // Texto largo (HTML/Markdown)
    proposito_general: string;      // Objetivo general
    metodologia_diseno: string;     // Diseño general / Metodología
}

export interface ActividadPAEC {
    id: string;
    fase_proyecto: 'Identificación' | 'Planeación' | 'Acción' | 'Reflexión';
    asignatura: string;             // Ej. Cultura Digital
    proposito_formativo: string;    // Objetivo específico
    contenidos_formativos: string;  // Temas
    actividades_clave: string;      // Descripción acción
    semana_ejecucion: string;       // Ej. "Semana 3 Octubre"
    participantes: string[];        // [Docentes, Estudiantes]
    instrumento_evaluacion: string; // Ej. Rúbrica
    evidencia_esperada: string;     // Ej. Infografía
}

export interface FichaAdministrativa {
    entidad_federativa: string;
    municipio: string;
    localidad: string;
    duracion_proyecto: string;
    estatus: 'Inicio' | 'Proceso' | 'Fin';
    poblacion: {
        estudiantes_hombres: number;
        estudiantes_mujeres: number;
        estudiantes_nobinarios: number;
        padres_tutores: number;
        docentes: number;
        administrativos: number;
        directivos: number;
        total_participantes: number; // Calculado
    };
}

export interface FirmaResponsable {
    nombre: string;
    cargo: string;
    grado_academico?: string;
}

export interface ProyectoPAEC {
    id: string;
    encabezado: EncabezadoInstitucional;
    identidad: IdentidadProyecto;
    contenido: SeccionesInformativas;
    matriz_actividades: ActividadPAEC[];
    ficha_administrativa: FichaAdministrativa;
    firmas: FirmaResponsable[];
}
