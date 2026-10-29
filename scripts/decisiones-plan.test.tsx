import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {conservarPAEC,instruccionesPAEC,instruccionesEvaluacion,fechaVisible} from '../src/features/planeacion/decisionesPlan';
import {crearRevisionContexto,contextoAutorizado} from '../src/features/planeacion/revisionContexto';
import {MaterialesClase} from '../components/MaterialesClase';
import {PLAN_RESPONSE_SCHEMA} from '../services/planSchema';
import {PLAN_LABORAL_RESPONSE_SCHEMA} from '../services/planSchemaLaboral';
import type {LessonPlan} from '../types';
const generado = {isLinked:false,communityProblem:'Agua',projectTrigger:'Analizar',pecName:'Por acordar',pecProducts:['Registro individual']};
test('la problemática manual no constituye aprobación y conserva productos',()=>{
 const r=conservarPAEC(generado,{modo:'manual',problema:'Agua',actividad:''});
 assert.equal(r?.isLinked,false);assert.equal(r?.estado,'pendiente');assert.deepEqual(r?.pecProducts,['Registro individual']);assert.equal(r?.pecName,'Por acordar');
});
test('el proyecto elegido mantiene identidad sin perder productos de la respuesta',()=>{
 const r=conservarPAEC(generado,{modo:'linked',problema:'',actividad:'Mural acordado',proyecto:{id:'p',name:'Agua comunitaria',generalObjective:'Comprender'}});
 assert.equal(r?.pecName,'Agua comunitaria');assert.equal(r?.isLinked,true);assert.equal(r?.projectTrigger,'Mural acordado');assert.deepEqual(r?.pecProducts,['Registro individual']);
});
test('solo aula descarta una campaña sugerida y no admite vinculación sin proyecto',()=>{
 const r=conservarPAEC({...generado,isLinked:true},{modo:'none',problema:'Agua',actividad:''});
 assert.equal(r?.estado,'sin_vinculo');assert.equal(r?.pecName,'');assert.deepEqual(r?.pecProducts,[]);
 assert.throws(()=>instruccionesPAEC({modo:'linked',problema:'',actividad:''}));
});
test('contexto anterior se incorpora solo por elección y el actual tiene prioridad',()=>{
 const r=crearRevisionContexto('Lista de cotejo','Sin proyector','USAR_PROYECTOR','RUBRICA_ANTERIOR');
 assert.ok(!JSON.stringify(contextoAutorizado(r)).includes('USAR_PROYECTOR'));
 assert.equal(contextoAutorizado(r).perfil,'');
 r.bloques.find(b=>b.id==='flujo')!.incluir=true;
 assert.ok(contextoAutorizado(r).prompt.includes('USAR_PROYECTOR'));
 assert.ok(contextoAutorizado(r).prompt.includes('prevalecen sobre datos guardados'));
});
test('evaluar pide desarrollar el instrumento elegido sin rúbrica impuesta',()=>{
 const texto=instruccionesEvaluacion('Lista de Cotejo');assert.ok(texto.includes('Lista de Cotejo'));assert.ok(!texto.includes('Desarrolla una Rúbrica'));
});
test('ambos contratos exigen materiales completos y matriz de evaluación',()=>{
 for(const esquema of [PLAN_RESPONSE_SCHEMA,PLAN_LABORAL_RESPONSE_SCHEMA]){
  assert.ok((esquema.required as readonly string[]).includes('teachingKit'));
  assert.ok((esquema.required as readonly string[]).includes('assessmentInstrument'));
  assert.ok(esquema.properties.teachingKit.items.required.includes('content'));
 }
});
test('la revisión muestra descriptores, contenido estudiantil y guía docente',()=>{
 const p={assessmentInstrument:{name:'Lista de cotejo',instructions:'Registrar',columns:['Sí','Aún no'],rows:[{criterion:'Distingue evidencia',descriptors:['Usa dato concreto','No cita datos']}],scoring:'Retroalimentar'},teachingKit:[{title:'Caso',content:'Texto íntegro de prueba',teacherNotes:'Respuesta orientativa',preparation:'Copiar al cuaderno'}]} as LessonPlan;
 const html=renderToStaticMarkup(<MaterialesClase plan={p}/>);
 for(const t of ['Usa dato concreto','No cita datos','Texto íntegro de prueba','Respuesta orientativa'])assert.ok(html.includes(t));
});
test('fechas pendientes no muestran Invalid Date',()=>{
 for(const v of ['',undefined,'Por definir']) assert.equal(fechaVisible(v),'Fecha pendiente');
 assert.notEqual(fechaVisible('2026-10-25T18:00:00Z'),'Fecha pendiente');
 assert.notEqual(fechaVisible({toDate:()=>new Date('2026-10-25T18:00:00Z')}),'Fecha pendiente');
});
