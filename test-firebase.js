// 🧪 Script de Prueba de Conexión a Firebase
// Este script verifica que Firebase esté configurado correctamente

import { db } from './src/config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

console.log('🔥 Iniciando prueba de conexión a Firebase...\n');

// Datos de prueba
const alumnoTest = {
    datosAdministrativos: {
        curp: 'TEST123456HDFRRL01',
        nombre: 'Alumno',
        apellidoPaterno: 'De',
        apellidoMaterno: 'Prueba',
        genero: 'Masculino',
        promedioSecundaria: 9.0,
        tipoSecundaria: 'General',
        sostenimiento: 'Público'
    },
    datosNEM: {
        tipoFamilia: 'Nuclear',
        redApoyo: {
            nombreTutor: 'Tutor de Prueba',
            parentesco: 'Padre',
            telefonoPadre: '5551234567',
            telefonoMadre: '5557654321',
            telefonoTutor: '5551234567',
            telefonoEmergencia: '5559876543'
        },
        gradoEstudioPadre: 'Licenciatura',
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
        ingresosMensuales: '20001-40000',
        personasAportanIngreso: 2,
        cuentaConBeca: false,
        tipoBeca: '',
        institucionSalud: 'IMSS',
        enfermedadesCronicas: [],
        tratamientoEnfermedades: '',
        problemasComunitarios: ['Violencia'],
        deficienciasServicios: ['Alumbrado público'],
        consumoSustanciasCuadra: [],
        consumoSustanciasCasa: [],
        frecuenciaDiscusionesComunidad: 'Nunca',
        intensidadPeleasComunidad: 'Ninguna',
        frecuenciaDiscusionesFamilia: 'Nunca',
        intensidadPeleasFamilia: 'Ninguna',
        tradicionesLocales: ['Día de Muertos'],
        practicasDiscriminatorias: [],
        materiasPreferidas: ['Matemáticas'],
        actividadesInteres: ['Deportes']
    },
    fechaRegistro: new Date().toISOString()
};

async function testFirebaseConnection() {
    try {
        console.log('📝 Paso 1: Intentando guardar alumno de prueba...');

        // Intentar guardar
        const docRef = await addDoc(collection(db, 'alumnos'), alumnoTest);
        console.log('✅ Alumno guardado con ID:', docRef.id);

        console.log('\n📖 Paso 2: Intentando leer alumnos...');

        // Intentar leer
        const querySnapshot = await getDocs(collection(db, 'alumnos'));
        console.log('✅ Total de alumnos en la base de datos:', querySnapshot.size);

        console.log('\n🗑️  Paso 3: Eliminando alumno de prueba...');

        // Eliminar el alumno de prueba
        await deleteDoc(doc(db, 'alumnos', docRef.id));
        console.log('✅ Alumno de prueba eliminado');

        console.log('\n🎉 ¡ÉXITO! Firebase está configurado correctamente\n');
        console.log('Puedes proceder a usar la aplicación normalmente.');

    } catch (error) {
        console.error('\n❌ ERROR al conectar con Firebase:\n');
        console.error(error);
        console.log('\n📋 Posibles soluciones:');
        console.log('1. Verifica que las credenciales en .env.local sean correctas');
        console.log('2. Verifica que Firestore esté habilitado en Firebase Console');
        console.log('3. Verifica las reglas de seguridad en Firestore');
        console.log('4. Verifica tu conexión a internet');
        console.log('\nPara más ayuda, consulta: ANALISIS-FIREBASE-ESTRUCTURA.md\n');
    }
}

// Ejecutar prueba
testFirebaseConnection();
