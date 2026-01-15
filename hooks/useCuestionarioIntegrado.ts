import { useState, useEffect } from 'react';
import type {
    CuestionarioSocioEducativo,
    DatosGeneralesAlumno,
    DatosFamiliares,
    DatosEconomicosVivienda,
    DatosAlumnoPersonales,
    ContextoComunitario
} from '../types/cuestionarioIntegrado';

const STORAGE_KEY = 'cuestionario_socio_educativo_progreso';

// Valores por defecto para cada sección
const DEFAULT_DATOS_GENERALES: DatosGeneralesAlumno = {
    protestaVerdad: false,
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombre: '',
    curp: '',
    gradoGrupo: '',
    correoElectronico: ''
};

const DEFAULT_DATOS_FAMILIARES: DatosFamiliares = {
    nombreTutor: '',
    parentescoTutor: '',
    telefonoPadre: '',
    telefonoMadre: '',
    telefonoTutor: '',
    telefonoEmergencia: '',
    tipoFamilia: 'Nuclear',
    escolaridadMadre: 'Secundaria',
    escolaridadPadre: 'Secundaria',
    ocupacionMadre: 'Actividades del hogar',
    ocupacionPadre: 'Obrero',
    seguridadSocial: 'IMSS',
    numHermanos: 'Ninguno',
    frecuenciaDiscusionesFamilia: 'Nunca',
    practicasMachistas: 'No'
};

const DEFAULT_DATOS_ECONOMICOS: DatosEconomicosVivienda = {
    tipoVivienda: 'Propia',
    personasVivienda: '4 a 6',
    servicios: {
        aguaPotable: true,
        luzElectrica: true,
        drenaje: true,
        lineaTelefonica: false,
        internet: false,
        tvCable: false,
        aireAcondicionado: false
    },
    automovil: 'No',
    gastosMensuales: 'De 5 mil a 10 mil pesos',
    personasApoyanEconomia: '2',
    recibeBecaApoyo: 'No'
};

const DEFAULT_DATOS_ALUMNO: DatosAlumnoPersonales = {
    situacionAlumno: 'Solo estudia',
    materiasPreferidas: [],
    actividadesPreferidas: [],
    tieneEnfermedadCondicion: 'No'
};

const DEFAULT_CONTEXTO_COMUNITARIO: ContextoComunitario = {
    principalProblema: 'Contaminación',
    segundoProblema: 'Violencia',
    tercerProblema: 'Robos o asaltos',
    serviciosFaltantes: [],
    consumoAlcoholCigarroCuadra: 'No',
    consumoAlcoholCigarroCasa: 'No',
    consumoDrogasCuadra: 'No',
    consumoDrogasCasa: 'No',
    peleasCuadra: 'Nunca',
    espaciosRecreacion: 'Sí',
    tradicionesComunidad: 'Sí',
    practicasMachistasComunidad: 'No',
    practicasHomofobicas: 'No',
    practicasRacistas: 'No',
    practicasClasistas: 'No'
};

export const useCuestionarioIntegrado = () => {
    // Cargar datos guardados
    const loadSavedData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error al cargar datos guardados:', e);
                return null;
            }
        }
        return null;
    };

    const savedData = loadSavedData();

    // Estados para cada sección del cuestionario
    const [datosGenerales, setDatosGenerales] = useState<DatosGeneralesAlumno>(
        savedData?.datosGenerales || DEFAULT_DATOS_GENERALES
    );

    const [datosFamiliares, setDatosFamiliares] = useState<DatosFamiliares>(
        savedData?.datosFamiliares || DEFAULT_DATOS_FAMILIARES
    );

    const [datosEconomicos, setDatosEconomicos] = useState<DatosEconomicosVivienda>(
        savedData?.datosEconomicos || DEFAULT_DATOS_ECONOMICOS
    );

    const [datosAlumno, setDatosAlumno] = useState<DatosAlumnoPersonales>(
        savedData?.datosAlumno || DEFAULT_DATOS_ALUMNO
    );

    const [contextoComunitario, setContextoComunitario] = useState<ContextoComunitario>(
        savedData?.contextoComunitario || DEFAULT_CONTEXTO_COMUNITARIO
    );

    // Auto-guardar cuando cambian los datos
    useEffect(() => {
        const dataToSave = {
            datosGenerales,
            datosFamiliares,
            datosEconomicos,
            datosAlumno,
            contextoComunitario,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [datosGenerales, datosFamiliares, datosEconomicos, datosAlumno, contextoComunitario]);

    // Función para obtener el cuestionario completo
    const getCuestionarioCompleto = (): CuestionarioSocioEducativo => {
        return {
            datosGenerales,
            datosFamiliares,
            datosEconomicos,
            datosAlumno,
            contextoComunitario,
            fechaRegistro: new Date().toISOString(),
            completado: isCompleto()
        };
    };

    // Validar si el cuestionario está completo
    const isCompleto = (): boolean => {
        // Validar datos generales (campos obligatorios)
        const generalesCompletos =
            datosGenerales.protestaVerdad &&
            datosGenerales.apellidoPaterno.trim() !== '' &&
            datosGenerales.apellidoMaterno.trim() !== '' &&
            datosGenerales.nombre.trim() !== '' &&
            datosGenerales.gradoGrupo.trim() !== '' &&
            datosGenerales.correoElectronico.trim() !== '';

        // Validar datos familiares (campos obligatorios)
        const familiaresCompletos =
            datosFamiliares.nombreTutor.trim() !== '' &&
            datosFamiliares.parentescoTutor.trim() !== '';

        // Validar al menos un teléfono
        const tieneContacto =
            datosFamiliares.telefonoPadre.trim() !== '' ||
            datosFamiliares.telefonoMadre.trim() !== '' ||
            datosFamiliares.telefonoTutor.trim() !== '' ||
            datosFamiliares.telefonoEmergencia.trim() !== '';

        return generalesCompletos && familiaresCompletos && tieneContacto;
    };

    // Función para limpiar el progreso
    const limpiarProgreso = () => {
        localStorage.removeItem(STORAGE_KEY);
        setDatosGenerales(DEFAULT_DATOS_GENERALES);
        setDatosFamiliares(DEFAULT_DATOS_FAMILIARES);
        setDatosEconomicos(DEFAULT_DATOS_ECONOMICOS);
        setDatosAlumno(DEFAULT_DATOS_ALUMNO);
        setContextoComunitario(DEFAULT_CONTEXTO_COMUNITARIO);
    };

    // Función para calcular el porcentaje de completitud
    const getPorcentajeCompletitud = (): number => {
        let camposCompletados = 0;
        let camposTotales = 0;

        // Contar campos completados en cada sección
        const contarCampos = (obj: any, prefix: string = '') => {
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    contarCampos(value, `${prefix}${key}.`);
                } else {
                    camposTotales++;
                    if (value !== '' && value !== false && value !== null &&
                        (!Array.isArray(value) || value.length > 0)) {
                        camposCompletados++;
                    }
                }
            });
        };

        contarCampos({ datosGenerales, datosFamiliares, datosEconomicos, datosAlumno, contextoComunitario });

        return Math.round((camposCompletados / camposTotales) * 100);
    };

    return {
        // Estados
        datosGenerales,
        setDatosGenerales,
        datosFamiliares,
        setDatosFamiliares,
        datosEconomicos,
        setDatosEconomicos,
        datosAlumno,
        setDatosAlumno,
        contextoComunitario,
        setContextoComunitario,

        // Funciones utilitarias
        getCuestionarioCompleto,
        limpiarProgreso,
        isCompleto,
        getPorcentajeCompletitud
    };
};
