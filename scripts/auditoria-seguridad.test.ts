/** Regresiones de seguridad: accesos indebidos deben rechazarse.
 * Solo emulador local y datos sintéticos; incluye accesos legítimos y consultas.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, collection, query, where, setDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

for (const archivo of ['firestore.rules', 'firestore.pruebas.rules']) {
 test(`Regresiones de permisos: ${archivo}`, async t => {
  const env = await initializeTestEnvironment({projectId:'demo-eduplan-security',firestore:{host:'127.0.0.1',port:18080,rules:readFileSync(archivo,'utf8')}});
  try {
   await env.clearFirestore();
   await env.withSecurityRulesDisabled(async c=>{
    const db=c.firestore();
    for(const [p,d] of Object.entries({
     'users/docenteA':{rol:'maestro',activo:true},
     'users/colegaA':{rol:'maestro',activo:true},
     'users/directivoA':{rol:'directivo',activo:true},
     'users/admin':{rol:'superadmin',activo:true},
     'schools/A':{createdBy:'directivoA'},
     'schools/A/miembros/directivoA':{uid:'directivoA',rol:'directivo',estado:'aprobado'},
     'schools/A/miembros/colegaA':{uid:'colegaA',rol:'docente',estado:'aprobado'},
     'users/intruso':{rol:'maestro',schoolId:'B',activo:true},
     'users/inactivo':{rol:'maestro',schoolId:'A',activo:false},
     'schools/A/miembros/inactivo':{uid:'inactivo',rol:'docente',estado:'aprobado'},
     'schools/A/miembros/docenteA':{uid:'docenteA',rol:'docente',estado:'aprobado'},
     'alumnos/expedienteA':{schoolId:'A',curp:'SOLO-DATO-SINTETICO'},
     'planeaciones/privadaA':{userId:'docenteA',schoolId:'A',isPublic:false,content:{diagnostico:'Sintético'}},
     'fichas12/privadaA':{userId:'docenteA',schoolId:'A',reflexion:'Sintética'},
     'herramientas_generadas/privadaA':{userId:'docenteA',schoolId:'A',content:'Sintético'},
     'diagnosticos_grupo/privadoA':{schoolId:'A',diagnostico:'Sintético'},
     'asignaciones/asignacionA':{schoolId:'A',docenteId:'docenteA'},
     'pmc/A':{schoolId:'A',meta:'Sintética'}
    }))await setDoc(doc(db,p),d);
   });
   const intruso=env.authenticatedContext('intruso').firestore();
   await t.test('F1: cuenta ajena lee planeación privada, ficha e historial',async()=>{
    for(const p of ['planeaciones/privadaA','fichas12/privadaA','herramientas_generadas/privadaA'])await assertFails(getDoc(doc(intruso,p)));
   });
   await t.test('F2: cuenta ajena lee diagnóstico, cambia asignación y borra PMC',async()=>{
    await assertFails(getDoc(doc(intruso,'diagnosticos_grupo/privadoA')));
    await assertFails(updateDoc(doc(intruso,'asignaciones/asignacionA'),{docenteId:'intruso'}));
    await assertFails(deleteDoc(doc(intruso,'pmc/A')));
   });
   await t.test('F3: cuenta desactivada conserva acceso a expediente de alumno',async()=>{
    await assertFails(getDoc(doc(env.authenticatedContext('inactivo').firestore(),'alumnos/expedienteA')));
   });
   await t.test('F4: sin sesión crea expediente sin escuela existente y cuestionario sin esquema',async()=>{
    const anon=env.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(anon,'alumnos/registro-falso'),{schoolId:'escuela-inexistente',campoArbitrario:'Sintético'}));
    await assertFails(setDoc(doc(anon,'cuestionariosSocioEducativos/registro-falso'),{campoArbitrario:'Sintético'}));
   });
   await t.test('F5: autor falsificado al crear planeación de otro docente',async()=>{
    await assertFails(setDoc(doc(intruso,'planeaciones/autor-falso'),{userId:'docenteA',schoolId:'A',content:'Sintético'}));
   });
   const propio = env.authenticatedContext('docenteA').firestore();
   const colega = env.authenticatedContext('colegaA').firestore();
   const direccion = env.authenticatedContext('directivoA').firestore();
   await t.test('dueño lee y consulta sus documentos; colega no lee los privados', async () => {
    for (const c of ['planeaciones','fichas12','herramientas_generadas']) {
     await assertSucceeds(getDoc(doc(propio, c, 'privadaA')));
     await assertSucceeds(getDocs(query(collection(propio,c), where('userId','==','docenteA'))));
     await assertFails(getDocs(collection(propio,c)));
     await assertFails(getDoc(doc(colega,c,'privadaA')));
     await assertFails(updateDoc(doc(propio,c,'privadaA'),{userId:'intruso'}));
     await assertFails(updateDoc(doc(propio,c,'privadaA'),{schoolId:'B'}));
    }
   });
   await t.test('crear y editar propios; compartir únicamente dentro del plantel', async () => {
    await assertSucceeds(setDoc(doc(propio,'planeaciones/nueva'),{userId:'docenteA',schoolId:'A',isPublic:false}));
    await assertFails(setDoc(doc(propio,'planeaciones/escuela-falsa'),{userId:'docenteA',schoolId:'B'}));
    await assertSucceeds(updateDoc(doc(propio,'planeaciones/nueva'),{isPublic:true}));
    await assertSucceeds(getDoc(doc(colega,'planeaciones/nueva')));
    await assertFails(getDoc(doc(intruso,'planeaciones/nueva')));
    await assertSucceeds(getDocs(query(collection(colega,'planeaciones'),where('schoolId','==','A'),where('isPublic','==',true))));
    await assertSucceeds(setDoc(doc(propio,'fichas12/nueva'),{userId:'docenteA'}));
   });
   await t.test('institucional: docente consulta, dirección administra, escuela no cambia', async () => {
    for (const c of ['grupos','asignaciones','pmc_metas']) {
     await assertSucceeds(setDoc(doc(direccion,c,'gestionA'),{schoolId:'A'}));
     await assertSucceeds(getDocs(query(collection(propio,c),where('schoolId','==','A'))));
     await assertFails(updateDoc(doc(propio,c,'gestionA'),{texto:'x'}));
     await assertFails(updateDoc(doc(direccion,c,'gestionA'),{schoolId:'B'}));
     await assertFails(deleteDoc(doc(intruso,c,'gestionA')));
    }
    await assertSucceeds(getDoc(doc(propio,'pmc/A')));
    await assertSucceeds(setDoc(doc(direccion,'pmc/A'),{metas:[]}));
    await assertFails(setDoc(doc(propio,'pmc/A'),{metas:[]}));
    await assertFails(setDoc(doc(direccion,'pmc/B'),{metas:[]}));
    await assertFails(updateDoc(doc(propio,'alumnos/expedienteA'),{schoolId:'B'}));
   });
   await t.test('registro público: un enlace admite un alumno, con esquema y plantel válidos', async () => {
    const anon = env.unauthenticatedContext().firestore();
    const token = 'a'.repeat(64);
    const vencida = 'b'.repeat(64);
    const cancelada = 'c'.repeat(64);
    const vigente = 'd'.repeat(64);
    const invite = { schoolId:'A', createdBy:'docenteA', creadaEn:serverTimestamp(), venceEn:Timestamp.fromMillis(Date.now()+3600_000), revocada:false };
    await assertSucceeds(setDoc(doc(propio,'invitacionesRegistro',token),invite));
    await assertSucceeds(setDoc(doc(propio,'invitacionesRegistro',vigente),invite));
    await assertFails(setDoc(doc(anon,'invitacionesRegistro','e'.repeat(64)),invite));
    await assertFails(setDoc(doc(intruso,'invitacionesRegistro','e'.repeat(64)),{...invite,createdBy:'intruso'}));
    await assertFails(getDocs(collection(anon,'invitacionesRegistro')));
    await assertSucceeds(getDoc(doc(anon,'invitacionesRegistro',token)));
    await env.withSecurityRulesDisabled(async c => {
     await setDoc(doc(c.firestore(),'invitacionesRegistro',vencida),{...invite,venceEn:Timestamp.fromMillis(0)});
     await setDoc(doc(c.firestore(),'invitacionesRegistro',cancelada),{...invite,revocada:true});
    });
    const alumno = { schoolId:'A',schoolCct:'21TEST0001A',invitacion:token,fechaRegistro:'2026-10-25',
     datosAdministrativos:{nombre:'Alumno sintético',apellidoPaterno:'Prueba',promedioSecundaria:8},
     datosNEM:{redApoyo:{},serviciosVivienda:{}} };
    await assertFails(setDoc(doc(anon,'alumnos',token),{...alumno,campoArbitrario:'x'}));
    await assertFails(setDoc(doc(anon,'alumnos',token),{...alumno,schoolId:'B'}));
    await assertFails(setDoc(doc(anon,'alumnos','id-distinto'),alumno));
    await assertFails(setDoc(doc(anon,'alumnos',token),{...alumno,datosNEM:{...alumno.datosNEM,redApoyo:{campoArbitrario:'x'}}}));
    await assertFails(setDoc(doc(anon,'alumnos',token),{...alumno,datosNEM:{...alumno.datosNEM,enfermedadesCronicas:[{payload:'x'}]}}));
    for (const t of [vencida,cancelada]) await assertFails(setDoc(doc(anon,'alumnos',t),{...alumno,invitacion:t}));
    const completo = 'f'.repeat(64);
    await assertSucceeds(setDoc(doc(propio,'invitacionesRegistro',completo),invite));
    const nem = { ...alumno.datosNEM } as Record<string,unknown>;
    for (const k of ['tipoFamilia','gradoEstudioPadre','gradoEstudioMadre','ocupacionPadre','ocupacionMadre','situacionLaboral','tipoVivienda','ingresosMensuales','tipoBeca','institucionSalud','tratamientoEnfermedades','frecuenciaDiscusionesComunidad','intensidadPeleasComunidad','frecuenciaDiscusionesFamilia','intensidadPeleasFamilia','situacionFamiliar','estiloAprendizaje']) nem[k]='Respuesta sintética';
    for (const k of ['enfermedadesCronicas','problemasComunitarios','deficienciasServicios','consumoSustanciasCuadra','consumoSustanciasCasa','tradicionesLocales','practicasDiscriminatorias','materiasPreferidas','actividadesInteres','barrerasAprendizaje','intereses']) nem[k]=Array(20).fill('Texto sintético');
    Object.assign(nem,{horasTrabajoSemanal:10,personasAportanIngreso:2,cuentaConBeca:false,accesoInternet:true,
      redApoyo:{nombreTutor:'Tutor sintético',parentesco:'Padre',telefonoPadre:'',telefonoMadre:'',telefonoTutor:'',telefonoEmergencia:''},
      serviciosVivienda:{agua:true,luz:true,drenaje:true,internet:true,tvCable:false,aireAcondicionado:false}});
    await assertSucceeds(setDoc(doc(anon,'alumnos',completo),{...alumno,invitacion:completo,datosNEM:nem}));
    await assertSucceeds(setDoc(doc(anon,'alumnos',token),alumno));
    await assertFails(getDoc(doc(anon,'alumnos',token)));
    await assertFails(setDoc(doc(anon,'alumnos',token),alumno));
    await assertSucceeds(getDoc(doc(propio,'alumnos',token)));
    await assertFails(getDoc(doc(intruso,'alumnos',token)));
    await assertSucceeds(updateDoc(doc(propio,'invitacionesRegistro',vigente),{revocada:true}));
    await assertFails(setDoc(doc(anon,'alumnos',vigente),{...alumno,invitacion:vigente}));
   });
   await t.test('desactivación revoca permisos de una sesión ya iniciada', async () => {
    await env.withSecurityRulesDisabled(c => updateDoc(doc(c.firestore(),'users/docenteA'),{activo:false}));
    for (const p of ['planeaciones/privadaA','fichas12/privadaA','herramientas_generadas/privadaA','alumnos/expedienteA','pmc/A']) {
     await assertFails(getDoc(doc(propio,p)));
    }
    await assertFails(setDoc(doc(propio,'fichas12/desactivada'),{userId:'docenteA'}));
    await assertSucceeds(getDoc(doc(propio,'users/docenteA')));
   });
   await t.test('Control: cuenta ajena NO lee expediente directamente ni se hace superadmin',async()=>{
    await assertFails(getDoc(doc(intruso,'alumnos/expedienteA')));
    await assertFails(updateDoc(doc(intruso,'users/intruso'),{rol:'superadmin'}));
   });
  } finally {await env.cleanup();}
 });
}
