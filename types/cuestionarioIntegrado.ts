// ============================================
// CUESTIONARIO SOCIO-EDUCATIVO INTEGRADO
// Sergio Tobón (2023) + Contexto Sociofamiliar La Avanzada
// ============================================

// ----------------------------------------
// DATOS GENERALES Y ADMINISTRATIVOS
// ----------------------------------------
export interface DatosGeneralesAlumno {
    // Protesta de veracidad
    protestaVerdad: boolean;

    // Datos de identidad
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombre: string;
    curp?: string;

    // Datos académicos
    gradoGrupo: string;
    correoElectronico: string;
}

// ----------------------------------------
// DATOS FAMILIARES
// ----------------------------------------
export interface DatosFamiliares {
    // Tutor/Responsable
    nombreTutor: string;
    parentescoTutor: string;
    telefonoPadre: string;
    telefonoMadre: string;
    telefonoTutor: string;
    telefonoEmergencia: string;

    // Estructura familiar
    tipoFamilia:
    | 'Nuclear'           // padre, madre y los hijos de ambos
    | 'Compuesta'         // padrastro o madrastra y/o hermanastros
    | 'Monoparental'      // un adulto y sus hijos
    | 'Extensa'           // conviven integrantes de diferentes generaciones
    | 'Homoparental';     // integrada por una pareja de hombres o mujeres e hijos

    // Educación de los padres
    escolaridadMadre: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'Carrera Técnica' | 'Licenciatura' | 'Posgrado' | 'Ninguna';
    escolaridadPadre: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'Carrera Técnica' | 'Licenciatura' | 'Posgrado' | 'Ninguna';

    // Ocupación de los padres
    ocupacionMadre: 'Actividades del hogar' | 'Profesionista' | 'Técnico' | 'Obrero' | 'Negocio propio' | 'Comercio' | 'Otra';
    ocupacionPadre: 'Actividades del hogar' | 'Profesionista' | 'Técnico' | 'Obrero' | 'Negocio propio' | 'Comercio' | 'Otra';

    // Seguridad social
    seguridadSocial: 'IMSS' | 'ISSSTE' | 'Seguro Popular/Bienestar' | 'Seguro de gastos médicos mayores' | 'Otro' | 'Ninguno';

    // Hermanos
    numHermanos: '1' | '2' | '3' | '4 o más' | 'Ninguno';

    // Convivencia familiar
    frecuenciaDiscusionesFamilia: 'Nunca' | 'Casi nunca' | 'A veces' | 'Casi siempre' | 'Siempre';
    intensidadPeleas?: 'Baja' | 'Media' | 'Alta'; // Solo si hay peleas

    // Equidad y crianza
    practicasMachistas: 'Sí' | 'No';
    manejoNormas?: string;
    tiempoCompartido?: string;
    educacionFamiliar?: string; // Estilo de crianza
}

// ----------------------------------------
// DATOS ECONÓMICOS Y VIVIENDA
// ----------------------------------------
export interface DatosEconomicosVivienda {
    // Vivienda
    tipoVivienda: 'Propia' | 'Rentada' | 'Prestada';
    personasVivienda: '2 a 3' | '4 a 6' | '7 a 9' | '10 o más';

    // Servicios
    servicios: {
        aguaPotable: boolean;
        luzElectrica: boolean;
        drenaje: boolean;
        lineaTelefonica: boolean;
        internet: boolean;
        tvCable: boolean;
        aireAcondicionado: boolean;
    };

    // Economía
    automovil: 'Sí' | 'No';
    gastosMensuales: 'Menos de 5 mil pesos' | 'De 5 mil a 10 mil pesos' | 'De 10 mil a 15 mil pesos' | 'Más de 15 mil pesos';
    personasApoyanEconomia: '1' | '2' | '3' | '4' | '5 o más';
    recibeBecaApoyo: 'Sí' | 'No';
    tipoBeca?: string; // Si recibe beca

    // Alimentación
    alimentacionHogar?: string; // Calidad de la alimentación
}

// ----------------------------------------
// DATOS DEL ALUMNO
// ----------------------------------------
export interface DatosAlumnoPersonales {
    // Situación laboral y académica
    situacionAlumno:
    | 'Solo estudia'
    | 'Principalmente estudia y realiza algún trabajo'
    | 'Principalmente trabaja y además estudia'
    | 'Estudia y busca trabajo';

    // Preferencias académicas
    materiasPreferidas: string[]; // Opción múltiple

    // Actividades e intereses
    actividadesPreferidas: string[]; // Opción múltiple
    usoTiempoLibre?: string; // Descripción de cómo usa su tiempo libre

    // Salud física y emocional
    tieneEnfermedadCondicion: 'Sí' | 'No';
    detalleEnfermedadCondicion?: string; // Si tiene enfermedad
    saludEmocional?: string; // Estado emocional general
    habilidadesSocioemocionales?: string[]; // Fortalezas socioemocionales

    // Inclusión y barreras
    tieneDiscapacidad?: 'Sí' | 'No';
    barrerasAprendizaje?: string[]; // Barreras para el aprendizaje y participación

    // Habilidades y desempeño
    desempenoAcademico?: {
        lecturaComprensiva: 'Bajo' | 'Medio' | 'Alto';
        escrituraArgumentativa: 'Bajo' | 'Medio' | 'Alto';
        calculoBasico: 'Bajo' | 'Medio' | 'Alto';
        pensamientoCritico: 'Bajo' | 'Medio' | 'Alto';
    };
    atencionConcentracion?: 'Bajo' | 'Medio' | 'Alto';

    // Convivencia escolar
    convivenciaEscolar?: string; // Cómo se relaciona con compañeros
}

// ----------------------------------------
// CONTEXTO COMUNITARIO (PAEC)
// ----------------------------------------
export interface ContextoComunitario {
    // Problemas principales (top 3)
    principalProblema: 'Mala alimentación' | 'Contaminación' | 'Pandillerismo' | 'Violencia' | 'Consumo de sustancias adictivas' | 'Robos o asaltos' | 'Otro';
    segundoProblema: 'Mala alimentación' | 'Contaminación' | 'Pandillerismo' | 'Violencia' | 'Consumo de sustancias adictivas' | 'Robos o asaltos' | 'Otro';
    tercerProblema: 'Mala alimentación' | 'Contaminación' | 'Pandillerismo' | 'Violencia' | 'Consumo de sustancias adictivas' | 'Robos o asaltos' | 'Otro';
    otroProblema?: string; // Si eligió "Otro"

    // Servicios faltantes
    serviciosFaltantes: string[]; // Opción múltiple

    // Consumo de sustancias
    consumoAlcoholCigarroCuadra: 'Sí' | 'No' | 'Tal vez';
    consumoAlcoholCigarroCasa: 'Sí' | 'No' | 'Tal vez';
    consumoDrogasCuadra: 'Sí' | 'No' | 'Tal vez';
    consumoDrogasCasa: 'Sí' | 'No' | 'Tal vez';

    // Convivencia comunitaria
    peleasCuadra: 'Nunca' | 'Casi nunca' | 'A veces' | 'Casi siempre' | 'Siempre';

    // Espacios de recreación
    espaciosRecreacion: 'Sí' | 'No';

    // Cultura y tradiciones
    tradicionesComunidad: 'Sí' | 'No';
    descripcionTradicion?: string; // Si tiene tradiciones

    // Discriminación y prácticas
    practicasMachistasComunidad: 'Sí' | 'No';
    practicasHomofobicas: 'Sí' | 'No';
    practicasRacistas: 'Sí' | 'No';
    practicasClasistas: 'Sí' | 'No';
    principalProblemaDiscriminacion?: 'Machismo' | 'Homofobia' | 'Racismo' | 'Clasismo' | 'Otro';

    // Contexto adicional PAEC
    participacionSocial?: string;
    derechosHumanos?: string;
    geografia?: string; // Eventos naturales, características geográficas
    ambiente?: string; // Calidad ambiental
}

// ----------------------------------------
// CUESTIONARIO COMPLETO
// ----------------------------------------
export interface CuestionarioSocioEducativo {
    id?: string;
    datosGenerales: DatosGeneralesAlumno;
    datosFamiliares: DatosFamiliares;
    datosEconomicos: DatosEconomicosVivienda;
    datosAlumno: DatosAlumnoPersonales;
    contextoComunitario: ContextoComunitario;
    fechaRegistro: string;
    completado: boolean;
}

// ----------------------------------------
// SÍNTESIS DIAGNÓSTICO (SERGIO TOBÓN)
// ----------------------------------------
export interface SintesisDiagnostico {
    id: string;
    titulo: string;
    nivelEducativo: string;

    metadatos: {
        nivel: string;
        escuela: string;
        municipio: string;
        colonia: string;
        tipoEscuela: string;
        grupo: string;
        carpetaDriveRegistros: string;
    };

    caracteristicasGrupo: {
        tamano: number | null;
        promedioEdad: number | null;
        rangoEdad: string;
        sexoFemenino: number | null;
        sexoMasculino: number | null;
        lugarResidencia: string;
        caracteristicasFamiliares: string;
        otrosAspectos: string;
    };

    dimensiones: Dimension[];

    referencia: {
        autor: string;
        anio: number;
        titulo: string;
        institucion: string;
        urlMateriales: string;
    };
}

export interface Dimension {
    id: string;
    nombre: string;
    descripcionItems: string[];
    fuentesInformacion: string;
    fortalezas: string;
    problemas: string;
}

// ----------------------------------------
// OPCIONES PREDEFINIDAS
// ----------------------------------------
export const MATERIAS_BACHILLERATO = [
    'Matemáticas',
    'Español',
    'Ciencias',
    'Geografía',
    'Historia',
    'Formación Cívica y Ética',
    'Artes',
    'Educación Física',
    'Tecnología',
    'Tutoría',
    'Vida Saludable'
];

export const ACTIVIDADES_INTERES = [
    'Quedarse en casa',
    'Salir a jugar',
    'Visitar a familiares',
    'Ir al cine',
    'Leer un libro',
    'Practicar algún deporte',
    'Ver televisión',
    'Jugar videojuegos',
    'Actividades tecnológicas y digitales',
    'Actividades artísticas',
    'Actividades académicas',
    'Trabajar'
];

export const SERVICIOS_BASICOS = [
    'Agua potable',
    'Luz eléctrica',
    'Drenaje',
    'Línea telefónica',
    'Internet',
    'Tv por cable',
    'Alumbrado público',
    'Transporte público frecuente',
    'Parques, áreas verdes o espacios de recreación',
    'Centros comunitarios o DIF',
    'Centro de salud',
    'Calles pavimentadas',
    'Rampas para personas con alguna discapacidad',
    'Transporte público con elevador para personas con discapacidad'
];

export const GRADOS_GRUPOS = [
    '1° A', '1° B', '1° C', '1° D',
    '2° A', '2° B', '2° C', '2° D',
    '3° A', '3° B', '3° C', '3° D',
    '4° A', '4° B', '4° C', '4° D',
    '5° A', '5° B', '5° C', '5° D',
    '6° A', '6° B', '6° C', '6° D', '6° E'
];
