// Exclusivamente contra emuladores locales. Nunca usa una cuenta real.
const {chromium} = require('playwright');
const {initializeTestEnvironment} = require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc} = require('firebase/firestore');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const env=await initializeTestEnvironment({projectId:'eduplanmx-pruebas',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.pruebas.rules','utf8')}});
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const pass='Solo-emulador-2026';
 try {
  const personas=[];
  for(const nombre of ['Ana','Beto']) {
   const email=`seguridad-${nombre.toLowerCase()}-${Date.now()}@example.test`;
   const r=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulador',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass,returnSecureToken:true})});
   const data=await r.json();assert.ok(data.localId,'Cuenta sintética creada');
   personas.push({nombre,email,id:data.localId});
  }
  await env.withSecurityRulesDisabled(async c=>{
   await setDoc(doc(c.firestore(),'schools/seguridad-A'),{nombre:'Plantel Sintético',cct:'21TEST0001A',createdBy:personas[0].id});
   for(const u of personas) {
    await setDoc(doc(c.firestore(),'users',u.id),{...u,apellidoPaterno:'Prueba',rol:'maestro',activo:true,onboardingCompleto:true,schoolId:'seguridad-A',schoolName:'Plantel Sintético',puesto:'Docente'});
    await setDoc(doc(c.firestore(),'schools/seguridad-A/miembros',u.id),{uid:u.id,rol:'docente',estado:'aprobado'});
   }
  });
  const context=await browser.newContext();const page=await context.newPage();
  const login=async u=>{
   await page.goto('http://127.0.0.1:3016/login');
   await page.locator('#email').fill(u.email);await page.locator('#password').fill(pass);
   await page.getByRole('button',{name:'Iniciar Sesión',exact:true}).click();
   await page.getByRole('button',{name:'Cerrar Sesión',exact:true}).waitFor({timeout:20000});
  };
  await login(personas[0]);
  const enlace=await page.evaluate(async()=>{
   const {obtenerAlmacenCuenta}=await import('/src/security/almacenCuenta.ts');
   obtenerAlmacenCuenta().setItem('diagnosticoGrupo','Diagnóstico privado de Ana');
   sessionStorage.setItem('gemini_api_key','CLAVE FICTICIA');
   const {crearInvitacionRegistro}=await import('/src/services/invitacionesRegistro.ts');
   return crearInvitacionRegistro('seguridad-A');
  });
  const documentoAnterior=await page.evaluate(()=>performance.timeOrigin);
  await page.getByRole('button',{name:'Cerrar Sesión',exact:true}).click();
  await page.waitForFunction(anterior=>performance.timeOrigin!==anterior,documentoAnterior);
  await login(personas[1]);
  const aislamiento=await page.evaluate(async()=>{
   const {obtenerAlmacenCuenta}=await import('/src/security/almacenCuenta.ts');
   return {diagnostico:obtenerAlmacenCuenta().getItem('diagnosticoGrupo'),clave:sessionStorage.getItem('gemini_api_key')};
  });assert.deepEqual(aislamiento,{diagnostico:null,clave:null});
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'users',personas[1].id),{activo:false}));
  await page.getByRole('heading',{name:'Iniciar Sesión',exact:true}).waitFor({timeout:15000});
  assert.equal(await page.getByRole('button',{name:'Cerrar Sesión',exact:true}).count(),0);
  const anon=await browser.newContext();const form=await anon.newPage();
  form.on('dialog',async d=>{console.error('Diálogo del registro:',d.message());await d.dismiss();});
  await form.goto(enlace);await form.getByRole('button',{name:'Comenzar Registro'}).click();
  await form.getByPlaceholder('XXXX000000XXXXXX00').fill('XXXX000000XXXXXX00');
  await form.getByPlaceholder('Juan',{exact:true}).fill('Alumno Sintético');
  await form.getByPlaceholder('Pérez',{exact:true}).fill('Prueba');
  await form.getByPlaceholder('García',{exact:true}).fill('Prueba');
  for(let i=0;i<4;i++) await form.getByRole('button',{name:'Siguiente →'}).click();
  await form.getByRole('button',{name:'Guardar Alumno'}).click();
  await form.getByRole('heading',{name:'¡Registro Exitoso!'}).waitFor({timeout:15000});
  assert.equal(await form.evaluate(()=>localStorage.getItem('formulario_alumno_progreso')),null);
  const token=new URLSearchParams(new URL(enlace).hash.slice(1)).get('invitacion');
  await env.withSecurityRulesDisabled(async c=>assert.equal((await getDoc(doc(c.firestore(),'alumnos',token))).data().schoolId,'seguridad-A'));
  console.log('OK navegador: cambio de cuenta sin diagnóstico ni clave heredados; desactivación cierra sesión abierta; registro real con enlace individual y formulario de cinco pasos, sin datos persistentes del alumno.');
 }finally{await browser.close();await env.cleanup();}
})().catch(e=>{console.error(e);process.exitCode=1;});
