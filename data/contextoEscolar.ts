import { ProyectoPAEC } from '../types/paec';

export const CONTEXTO_ESCOLAR_DEFAULT: ProyectoPAEC = {
    id: "paec-2025-001",
    encabezado: {
        institucion_superior: "Secretaría de Educación Pública",
        subsecretaria: "Subsecretaría de Educación Media Superior",
        direccion_general: "Dirección de Bachilleratos Estatales y Preparatoria Abierta",
        supervision_escolar: "Zona Escolar 013",
        nombre_escuela: 'Bachillerato General Oficial "Carlos Camacho Espíritu"',
        turno: "Vespertino",
        cct: "21EBH0026G"
    },
    identidad: {
        nombre_programa: "PAEC - Programa Aula Escuela Comunidad",
        titulo_proyecto: "Cuidado y prevención de la salud: Un enfoque integral",
        tipo_documento: "Plan Factible",
        ciclo_escolar: "2025 – 2026",
        fecha_elaboracion: new Date().toLocaleDateString('es-MX')
    },
    contenido: {
        justificacion: "El proyecto busca identificar problemáticas críticas como el sedentarismo y la mala alimentación. A través de actividades interdisciplinarias, los estudiantes diagnostican hábitos, calculan su IMC y participan en activaciones físicas.",
        proposito_general: "Identificar y atender problemas de salud mediante investigación y acción colectiva (Rally deportivo, ferias de salud) para fomentar el bienestar integral.",
        metodologia_diseno: "Aprendizaje Basado en Proyectos Comunitarios, integrando transversalidad con Cultura Digital, Ciencias y Educación Física."
    },
    matriz_actividades: [
        {
            id: "act-01",
            fase_proyecto: "Identificación",
            asignatura: "Cultura Digital II",
            proposito_formativo: "Analizar datos estadísticos de salud escolar.",
            contenidos_formativos: "Hoja de Cálculo, Gráficos Estadísticos",
            actividades_clave: "Diseño de encuestas digitales sobre hábitos alimenticios.",
            semana_ejecucion: "2ª Semana Septiembre",
            participantes: ["Docentes", "Estudiantes"],
            instrumento_evaluacion: "Lista de Cotejo",
            evidencia_esperada: "Base de datos en Excel"
        },
        {
            id: "act-02",
            fase_proyecto: "Acción",
            asignatura: "Ciencias Naturales",
            proposito_formativo: "Comprender el metabolismo y nutrición.",
            contenidos_formativos: "IMC, Nutrición Celular",
            actividades_clave: "Jornada de medición de peso y talla (Cálculo IMC).",
            semana_ejecucion: "1ª Semana Noviembre",
            participantes: ["Docentes", "Estudiantes", "Padres"],
            instrumento_evaluacion: "Rúbrica",
            evidencia_esperada: "Ficha clínica individual"
        }
    ],
    ficha_administrativa: {
        entidad_federativa: "Puebla",
        municipio: "Puebla",
        localidad: "U.H. Dr. Mateo de Regil Rodríguez",
        duracion_proyecto: "Semestral",
        estatus: "Proceso",
        poblacion: {
            estudiantes_hombres: 0, // Se llenarán dinámicamente
            estudiantes_mujeres: 0,
            estudiantes_nobinarios: 0,
            padres_tutores: 120,
            docentes: 12,
            administrativos: 3,
            directivos: 1,
            total_participantes: 0
        }
    },
    firmas: [
        { nombre: "C. Luisa Luna Barrios", cargo: "Docente Responsable" },
        { nombre: "C. Alejandra Adriana Marciano Mendoza", cargo: "Docente Responsable" },
        { nombre: "C. Hortensia Vallejo Vázquez", cargo: "Docente Responsable" },
        { nombre: "C. Griselda Caselin Cruz", cargo: "Docente Responsable" },
        { nombre: "C. Beatriz Sánchez Torres", cargo: "Docente Responsable" },
        { nombre: "Jose Roberto Mendoza Mendoza", cargo: "Docente Responsable" }
    ]
};
