import { useState, useEffect } from 'react';
import type { DatosAdministrativos, DatosNEM, RedApoyo } from '../types/diagnostico';

const STORAGE_KEY = 'formulario_alumno_progreso';

export const useFormularioAlumno = () => {
    // Cargar datos guardados
    // Información de menores: conservar solo en memoria mientras está abierto el formulario.
    const loadSavedData = (): any => null;

    const savedData = loadSavedData();

    const [datosAdmin, setDatosAdmin] = useState<DatosAdministrativos>(
        savedData?.datosAdmin || {
            curp: '',
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            genero: 'Prefiero no decir',
            promedioSecundaria: 8.0,
            tipoSecundaria: 'General',
            sostenimiento: 'Público'
        }
    );

    const [redApoyo, setRedApoyo] = useState<RedApoyo>(
        savedData?.redApoyo || {
            nombreTutor: '',
            parentesco: 'Padre',
            telefonoPadre: '',
            telefonoMadre: '',
            telefonoTutor: '',
            telefonoEmergencia: ''
        }
    );

    const [datosNEM, setDatosNEM] = useState<Partial<DatosNEM>>(
        savedData?.datosNEM || {
            tipoFamilia: 'Nuclear',
            gradoEstudioPadre: 'Secundaria',
            gradoEstudioMadre: 'Secundaria',
            ocupacionPadre: 'Obrero',
            ocupacionMadre: 'Hogar',
            situacionLaboral: 'Solo estudia',
            tipoVivienda: 'Propia',
            serviciosVivienda: {
                agua: true,
                luz: true,
                drenaje: true,
                internet: false,
                tvCable: false,
                aireAcondicionado: false
            },
            ingresosMensuales: '5001-10000',
            personasAportanIngreso: 2,
            cuentaConBeca: false,
            institucionSalud: 'IMSS',
            enfermedadesCronicas: [],
            problemasComunitarios: [],
            deficienciasServicios: [],
            consumoSustanciasCuadra: [],
            consumoSustanciasCasa: [],
            frecuenciaDiscusionesComunidad: 'Rara vez',
            intensidadPeleasComunidad: 'Ninguna',
            frecuenciaDiscusionesFamilia: 'Rara vez',
            intensidadPeleasFamilia: 'Ninguna',
            tradicionesLocales: [],
            practicasDiscriminatorias: [],
            materiasPreferidas: [],
            actividadesInteres: []
        }
    );

    // Guardar automáticamente cuando cambian los datos


    const limpiarProgreso = () => {
        // No hay copia persistente que pueda recuperar el siguiente alumno.
    };

    return {
        datosAdmin,
        setDatosAdmin,
        redApoyo,
        setRedApoyo,
        datosNEM,
        setDatosNEM,
        limpiarProgreso
    };
};
