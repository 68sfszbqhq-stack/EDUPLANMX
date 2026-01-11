import { useState, useEffect } from 'react';
import type { DatosAdministrativos, DatosNEM, RedApoyo } from '../types/diagnostico';

const STORAGE_KEY = 'formulario_alumno_progreso';

export const useFormularioAlumno = () => {
    // Cargar datos guardados
    const loadSavedData = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

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
    useEffect(() => {
        const dataToSave = {
            datosAdmin,
            redApoyo,
            datosNEM,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [datosAdmin, redApoyo, datosNEM]);

    const limpiarProgreso = () => {
        localStorage.removeItem(STORAGE_KEY);
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
