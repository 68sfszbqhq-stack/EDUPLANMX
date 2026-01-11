// 🧪 Script para agregar 5 alumnos de prueba a Firebase
// Ejecutar con: npx tsx agregar-alumnos-prueba.ts

import { alumnosService } from './src/services/alumnosFirebase';
import type { Alumno } from './types/diagnostico';

const alumnosPrueba: Omit<Alumno, 'id'>[] = [
    {
        datosAdministrativos: {
            curp: 'GOMJ050815HMCRNS01',
            nombre: 'Juan Carlos',
            apellidoPaterno: 'Gómez',
            apellidoMaterno: 'Martínez',
            genero: 'Masculino',
            promedioSecundaria: 8.5,
            tipoSecundaria: 'General',
            sostenimiento: 'Público'
        },
        datosNEM: {
            tipoFamilia: 'Nuclear',
            redApoyo: {
                nombreTutor: 'María Martínez López',
                parentesco: 'Madre',
                telefonoPadre: '5551234567',
                telefonoMadre: '5557654321',
                telefonoTutor: '5557654321',
                telefonoEmergencia: '5559876543'
            },
            gradoEstudioPadre: 'Preparatoria',
            gradoEstudioMadre: 'Licenciatura',
            ocupacionPadre: 'Obrero',
            ocupacionMadre: 'Profesionista',
            situacionLaboral: 'Solo estudia',
            horasTrabajoSemanal: 0,
            tipoVivienda: 'Propia',
            serviciosVivienda: {
                agua: true,
                luz: true,
                drenaje: true,
                internet: true,
                tvCable: false,
                aireAcondicionado: false
            },
            ingresosMensuales: '10001-20000',
            personasAportanIngreso: 2,
            cuentaConBeca: false,
            tipoBeca: '',
            institucionSalud: 'IMSS',
            enfermedadesCronicas: [],
            tratamientoEnfermedades: '',
            problemasComunitarios: ['Violencia', 'Contaminación'],
            deficienciasServicios: ['Alumbrado público', 'Áreas verdes'],
            consumoSustanciasCuadra: ['Alcohol'],
            consumoSustanciasCasa: [],
            frecuenciaDiscusionesComunidad: 'Rara vez',
            intensidadPeleasComunidad: 'Leve',
            frecuenciaDiscusionesFamilia: 'Nunca',
            intensidadPeleasFamilia: 'Ninguna',
            tradicionesLocales: ['Día de Muertos', 'Fiestas patronales'],
            practicasDiscriminatorias: [],
            materiasPreferidas: ['Matemáticas', 'Ciencias'],
            actividadesInteres: ['Deportes', 'Lectura']
        },
        fechaRegistro: new Date().toISOString()
    },
    {
        datosAdministrativos: {
            curp: 'LOPM060320MDFPRL02',
            nombre: 'María Fernanda',
            apellidoPaterno: 'López',
            apellidoMaterno: 'Pérez',
            genero: 'Femenino',
            promedioSecundaria: 9.2,
            tipoSecundaria: 'Técnica',
            sostenimiento: 'Público'
        },
        datosNEM: {
            tipoFamilia: 'Monoparental',
            redApoyo: {
                nombreTutor: 'Rosa Pérez Sánchez',
                parentesco: 'Madre',
                telefonoPadre: '',
                telefonoMadre: '5558765432',
                telefonoTutor: '5558765432',
                telefonoEmergencia: '5551239876'
            },
            gradoEstudioPadre: 'Sin estudios',
            gradoEstudioMadre: 'Secundaria',
            ocupacionPadre: 'Desempleado',
            ocupacionMadre: 'Comercio',
            situacionLaboral: 'Estudia y trabaja',
            horasTrabajoSemanal: 15,
            tipoVivienda: 'Rentada',
            serviciosVivienda: {
                agua: true,
                luz: true,
                drenaje: true,
                internet: false,
                tvCable: false,
                aireAcondicionado: false
            },
            ingresosMensuales: '5001-10000',
            personasAportanIngreso: 1,
            cuentaConBeca: true,
            tipoBeca: 'Benito Juárez',
            institucionSalud: 'Bienestar',
            enfermedadesCronicas: [],
            tratamientoEnfermedades: '',
            problemasComunitarios: ['Violencia', 'Pandillerismo', 'Robos'],
            deficienciasServicios: ['Alumbrado público', 'Transporte público', 'Centros de salud'],
            consumoSustanciasCuadra: ['Alcohol', 'Drogas'],
            consumoSustanciasCasa: [],
            frecuenciaDiscusionesComunidad: 'Frecuente',
            intensidadPeleasComunidad: 'Moderada',
            frecuenciaDiscusionesFamilia: 'A veces',
            intensidadPeleasFamilia: 'Leve',
            tradicionesLocales: ['Día de Muertos'],
            practicasDiscriminatorias: ['Machismo'],
            materiasPreferidas: ['Español', 'Historia'],
            actividadesInteres: ['Lectura', 'Arte', 'Música']
        },
        fechaRegistro: new Date().toISOString()
    },
    {
        datosAdministrativos: {
            curp: 'HERS050912HDFRDN03',
            nombre: 'Roberto',
            apellidoPaterno: 'Hernández',
            apellidoMaterno: 'Rodríguez',
            genero: 'Masculino',
            promedioSecundaria: 7.8,
            tipoSecundaria: 'Telesecundaria',
            sostenimiento: 'Público'
        },
        datosNEM: {
            tipoFamilia: 'Extensa',
            redApoyo: {
                nombreTutor: 'Pedro Hernández García',
                parentesco: 'Padre',
                telefonoPadre: '5552345678',
                telefonoMadre: '5556789012',
                telefonoTutor: '5552345678',
                telefonoEmergencia: '5553456789'
            },
            gradoEstudioPadre: 'Primaria',
            gradoEstudioMadre: 'Primaria',
            ocupacionPadre: 'Negocio propio',
            ocupacionMadre: 'Hogar',
            situacionLaboral: 'Trabaja y estudia',
            horasTrabajoSemanal: 25,
            tipoVivienda: 'Prestada',
            serviciosVivienda: {
                agua: true,
                luz: true,
                drenaje: false,
                internet: false,
                tvCable: false,
                aireAcondicionado: false
            },
            ingresosMensuales: '0-5000',
            personasAportanIngreso: 3,
            cuentaConBeca: false,
            tipoBeca: '',
            institucionSalud: 'Ninguna',
            enfermedadesCronicas: [],
            tratamientoEnfermedades: '',
            problemasComunitarios: ['Mala alimentación', 'Contaminación', 'Robos'],
            deficienciasServicios: ['Alumbrado público', 'Transporte público', 'Áreas verdes', 'Rampas para discapacidad'],
            consumoSustanciasCuadra: ['Alcohol', 'Tabaco'],
            consumoSustanciasCasa: ['Tabaco'],
            frecuenciaDiscusionesComunidad: 'A veces',
            intensidadPeleasComunidad: 'Leve',
            frecuenciaDiscusionesFamilia: 'Frecuente',
            intensidadPeleasFamilia: 'Moderada',
            tradicionesLocales: ['Día de Muertos', 'Fiestas patronales', 'Semana Santa'],
            practicasDiscriminatorias: [],
            materiasPreferidas: ['Educación Física', 'Artes'],
            actividadesInteres: ['Deportes', 'Manualidades']
        },
        fechaRegistro: new Date().toISOString()
    },
    {
        datosAdministrativos: {
            curp: 'SANA060505MDFNNN04',
            nombre: 'Ana Sofía',
            apellidoPaterno: 'Sánchez',
            apellidoMaterno: 'Núñez',
            genero: 'Femenino',
            promedioSecundaria: 9.5,
            tipoSecundaria: 'Particular',
            sostenimiento: 'Privado'
        },
        datosNEM: {
            tipoFamilia: 'Nuclear',
            redApoyo: {
                nombreTutor: 'Carlos Sánchez Ruiz',
                parentesco: 'Padre',
                telefonoPadre: '5554567890',
                telefonoMadre: '5558901234',
                telefonoTutor: '5554567890',
                telefonoEmergencia: '5557890123'
            },
            gradoEstudioPadre: 'Posgrado',
            gradoEstudioMadre: 'Licenciatura',
            ocupacionPadre: 'Profesionista',
            ocupacionMadre: 'Profesionista',
            situacionLaboral: 'Solo estudia',
            horasTrabajoSemanal: 0,
            tipoVivienda: 'Propia',
            serviciosVivienda: {
                agua: true,
                luz: true,
                drenaje: true,
                internet: true,
                tvCable: true,
                aireAcondicionado: true
            },
            ingresosMensuales: '40001+',
            personasAportanIngreso: 2,
            cuentaConBeca: false,
            tipoBeca: '',
            institucionSalud: 'Seguro privado',
            enfermedadesCronicas: [],
            tratamientoEnfermedades: '',
            problemasComunitarios: [],
            deficienciasServicios: [],
            consumoSustanciasCuadra: [],
            consumoSustanciasCasa: [],
            frecuenciaDiscusionesComunidad: 'Nunca',
            intensidadPeleasComunidad: 'Ninguna',
            frecuenciaDiscusionesFamilia: 'Rara vez',
            intensidadPeleasFamilia: 'Ninguna',
            tradicionesLocales: ['Día de Muertos', 'Navidad'],
            practicasDiscriminatorias: [],
            materiasPreferidas: ['Matemáticas', 'Ciencias', 'Inglés'],
            actividadesInteres: ['Tecnología', 'Lectura', 'Música']
        },
        fechaRegistro: new Date().toISOString()
    },
    {
        datosAdministrativos: {
            curp: 'RAMC050728HDFRRL05',
            nombre: 'Carlos Eduardo',
            apellidoPaterno: 'Ramírez',
            apellidoMaterno: 'Cruz',
            genero: 'Masculino',
            promedioSecundaria: 8.0,
            tipoSecundaria: 'General',
            sostenimiento: 'Público'
        },
        datosNEM: {
            tipoFamilia: 'Compuesta',
            redApoyo: {
                nombreTutor: 'Laura Cruz Mendoza',
                parentesco: 'Madre',
                telefonoPadre: '5556781234',
                telefonoMadre: '5559012345',
                telefonoTutor: '5559012345',
                telefonoEmergencia: '5550123456'
            },
            gradoEstudioPadre: 'Secundaria',
            gradoEstudioMadre: 'Preparatoria',
            ocupacionPadre: 'Técnico',
            ocupacionMadre: 'Comercio',
            situacionLaboral: 'Solo estudia',
            horasTrabajoSemanal: 0,
            tipoVivienda: 'Propia',
            serviciosVivienda: {
                agua: true,
                luz: true,
                drenaje: true,
                internet: true,
                tvCable: true,
                aireAcondicionado: false
            },
            ingresosMensuales: '20001-40000',
            personasAportanIngreso: 2,
            cuentaConBeca: false,
            tipoBeca: '',
            institucionSalud: 'ISSSTE',
            enfermedadesCronicas: [],
            tratamientoEnfermedades: '',
            problemasComunitarios: ['Contaminación'],
            deficienciasServicios: ['Áreas verdes'],
            consumoSustanciasCuadra: [],
            consumoSustanciasCasa: [],
            frecuenciaDiscusionesComunidad: 'Rara vez',
            intensidadPeleasComunidad: 'Ninguna',
            frecuenciaDiscusionesFamilia: 'Rara vez',
            intensidadPeleasFamilia: 'Leve',
            tradicionesLocales: ['Día de Muertos', 'Fiestas patronales'],
            practicasDiscriminatorias: [],
            materiasPreferidas: ['Geografía', 'Ciencias', 'Educación Física'],
            actividadesInteres: ['Deportes', 'Tecnología', 'Cocina']
        },
        fechaRegistro: new Date().toISOString()
    }
];

async function agregarAlumnosPrueba() {
    console.log('🔥 Iniciando carga de alumnos de prueba a Firebase...\n');

    try {
        let exitosos = 0;
        let fallidos = 0;

        for (let i = 0; i < alumnosPrueba.length; i++) {
            const alumno = alumnosPrueba[i];
            const numero = i + 1;

            try {
                console.log(`📝 [${numero}/5] Guardando: ${alumno.datosAdministrativos.nombre} ${alumno.datosAdministrativos.apellidoPaterno}...`);

                const id = await alumnosService.guardarAlumno(alumno);

                console.log(`   ✅ Guardado con ID: ${id}`);
                exitosos++;

                // Pequeña pausa entre inserciones
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`   ❌ Error al guardar alumno ${numero}:`, error);
                fallidos++;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RESUMEN:');
        console.log(`   ✅ Exitosos: ${exitosos}`);
        console.log(`   ❌ Fallidos: ${fallidos}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (exitosos > 0) {
            console.log('🎉 ¡Alumnos agregados exitosamente!');
            console.log('\n📍 Verifica en Firebase Console:');
            console.log('   → https://console.firebase.google.com/');
            console.log('   → Firestore Database > Data > alumnos\n');

            console.log('📱 O en tu aplicación:');
            console.log('   → npm run dev');
            console.log('   → Ir a: Diagnóstico > Ver lista de alumnos\n');
        }

        if (fallidos > 0) {
            console.log('\n⚠️  Algunos alumnos no se pudieron guardar.');
            console.log('   Verifica que Firebase esté configurado correctamente.');
            console.log('   Consulta: README-FIREBASE.md\n');
        }

    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error);
        console.log('\n📋 Posibles causas:');
        console.log('   1. Firebase no está configurado (falta .env.local)');
        console.log('   2. Firestore no está habilitado');
        console.log('   3. Reglas de seguridad muy restrictivas');
        console.log('   4. Sin conexión a internet');
        console.log('\n📖 Consulta: README-FIREBASE.md para configurar Firebase\n');
    }
}

// Ejecutar
agregarAlumnosPrueba()
    .then(() => {
        console.log('✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
