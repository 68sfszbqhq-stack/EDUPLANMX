// ============================================
// TIPOS PARA EL MÓDULO DE DIAGNÓSTICO RAÍZ
// ============================================

// Datos Administrativos del Alumno
export interface DatosAdministrativos {
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir';
  promedioSecundaria: number;
  tipoSecundaria: 'General' | 'Técnica' | 'Telesecundaria' | 'Particular';
  sostenimiento: 'Público' | 'Privado';
}

// Red de Apoyo y Contactos
export interface RedApoyo {
  nombreTutor: string;
  parentesco: 'Padre' | 'Madre' | 'Hermano' | 'Tío' | 'Abuelo' | 'Otro';
  telefonoPadre: string;
  telefonoMadre: string;
  telefonoTutor: string;
  telefonoEmergencia: string;
}

// Batería Sociofamiliar (NEM)
export interface DatosNEM {
  // Dinámica Familiar
  tipoFamilia: 'Nuclear' | 'Extensa' | 'Monoparental' | 'Compuesta' | 'Homoparental';
  redApoyo: RedApoyo;

  // Nivel Socioeconómico
  gradoEstudioPadre: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'Licenciatura' | 'Posgrado' | 'Sin estudios';
  gradoEstudioMadre: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'Licenciatura' | 'Posgrado' | 'Sin estudios';
  ocupacionPadre: 'Hogar' | 'Profesionista' | 'Técnico' | 'Obrero' | 'Negocio propio' | 'Comercio' | 'Desempleado';
  ocupacionMadre: 'Hogar' | 'Profesionista' | 'Técnico' | 'Obrero' | 'Negocio propio' | 'Comercio' | 'Desempleado';

  // Situación del Alumno
  situacionLaboral: 'Solo estudia' | 'Estudia y trabaja' | 'Trabaja y estudia';
  horasTrabajoSemanal?: number;

  // Vivienda y Servicios
  tipoVivienda: 'Propia' | 'Rentada' | 'Prestada';
  serviciosVivienda: {
    agua: boolean;
    luz: boolean;
    drenaje: boolean;
    internet: boolean;
    tvCable: boolean;
    aireAcondicionado: boolean;
  };

  // Economía
  ingresosMensuales: '0-5000' | '5001-10000' | '10001-20000' | '20001-40000' | '40001+';
  personasAportanIngreso: number;
  cuentaConBeca: boolean;
  tipoBeca?: string;

  // Salud
  institucionSalud: 'IMSS' | 'ISSSTE' | 'Bienestar' | 'Seguro privado' | 'Ninguna';
  enfermedadesCronicas: string[];
  tratamientoEnfermedades?: string;

  // Contexto Comunitario (PAEC)
  problemasComunitarios: string[];
  deficienciasServicios: string[];

  // Factores de Riesgo
  consumoSustanciasCuadra: string[];
  consumoSustanciasCasa: string[];

  // Convivencia Social
  frecuenciaDiscusionesComunidad: 'Nunca' | 'Rara vez' | 'A veces' | 'Frecuente' | 'Muy frecuente';
  intensidadPeleasComunidad: 'Ninguna' | 'Leve' | 'Moderada' | 'Grave';
  frecuenciaDiscusionesFamilia: 'Nunca' | 'Rara vez' | 'A veces' | 'Frecuente' | 'Muy frecuente';
  intensidadPeleasFamilia: 'Ninguna' | 'Leve' | 'Moderada' | 'Grave';

  // Cultura y Valores
  tradicionesLocales: string[];
  practicasDiscriminatorias: string[];

  // Intereses y Preferencias
  materiasPreferidas: string[];
  actividadesInteres: string[];

  // Nuevos campos para simplificar análisis IA
  situacionFamiliar?: string; // Resumen ej. "Nuclear estable"
  estiloAprendizaje?: string; // Visual, Auditivo, Kinestésico
  barrerasAprendizaje?: string[]; // BAP detectadas
  accesoInternet?: boolean; // Simplificado
  intereses?: string[]; // Simplificado
}

// Alumno Completo
export interface Alumno {
  id: string;
  datosAdministrativos: DatosAdministrativos;
  datosNEM: DatosNEM;
  fechaRegistro: string;
}

// ============================================
// OUTPUTS DEL PROCESAMIENTO INTELIGENTE
// ============================================

export type NivelRiesgo = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export interface PerfilAprendizajeGrupal {
  estilosDominantes: string[];
  ganchosInteres: string[];
  materiasPopulares: string[];
  actividadesPreferidas: string[];
  recomendacionesDidacticas: string[];
}

export interface AlertaAbandono {
  alumnoId: string;
  nombreAlumno: string;
  nivelRiesgo: NivelRiesgo;
  factoresRiesgo: string[];
  recomendaciones: string[];
}

export interface ProblemaComunitario {
  problema: string;
  frecuencia: number;
  porcentaje: number;
}

export interface DiagnosticoGrupal {
  totalAlumnos: number;
  perfilAprendizaje: PerfilAprendizajeGrupal;
  alertasAbandono: AlertaAbandono[];
  problemaPAEC: ProblemaComunitario;
  problemasSecundarios: ProblemaComunitario[];
  metasPMC: string[];
  promedioGrupal: number;
  contextoDigital: {
    conInternet: number;
    sinInternet: number;
    porcentajeConectividad: number;
  };
}

// ============================================
// ADAPTACIONES PARA PLANEACIÓN
// ============================================

export interface AdaptacionDidactica {
  tipo: 'Digital' | 'Presencial' | 'Híbrida' | 'SinConexion';
  justificacion: string;
  sugerencias: string[];
}

export interface EnfoquePAEC {
  problemaSeleccionado: string;
  conexionConMateria: string;
  actividadesSugeridas: string[];
}

export interface PlaneacionAdaptada {
  adaptacionTecnologica: AdaptacionDidactica;
  enfoquePAEC: EnfoquePAEC;
  consideracionesGrupales: string[];
  metasPMCRelacionadas: string[];
}
