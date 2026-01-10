// ============================================
// TIPOS PARA EL MÓDULO DE DIAGNÓSTICO RAÍZ
// ============================================

// Datos Administrativos del Alumno
export interface DatosAdministrativos {
  curp: string;
  nombre: string;
  genero: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir';
  promedioSecundaria: number;
  tipoSecundaria: 'General' | 'Técnica' | 'Telesecundaria' | 'Particular';
  sostenimiento: 'Público' | 'Privado';
}

// Batería Sociofamiliar
export interface DatosNEM {
  // Dinámica Familiar
  tipoFamilia: 'Nuclear' | 'Extensa' | 'Monoparental' | 'Reconstituida' | 'Unipersonal';
  
  // Nivel Socioeconómico
  gradoEstudioPadre: string;
  gradoEstudioMadre: string;
  ocupacionPadre: string;
  ocupacionMadre: string;
  ingresosMensuales: '0-5000' | '5001-10000' | '10001-20000' | '20001-40000' | '40001+';
  serviciosVivienda: {
    internet: boolean;
    luz: boolean;
    agua: boolean;
    drenaje: boolean;
    telefono: boolean;
  };
  
  // Salud y Riesgo
  enfermedadesCronicas: string[];
  adiccionesEntorno: string[];
  alumnoTrabaja: boolean;
  horasTrabajoSemanal?: number;
  
  // Contexto Comunitario
  problemasComunitarios: string[];
  
  // Intereses y Preferencias
  materiasPreferidas: string[];
  actividadesInteres: string[];
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
