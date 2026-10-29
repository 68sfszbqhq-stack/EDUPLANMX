import {readFileSync} from 'node:fs';
import {LOGOS_BGO, type LogosBytes} from '../src/services/formatoBGO';
const logos = Object.fromEntries(Object.entries(LOGOS_BGO).map(([k,p])=>[k,readFileSync(new URL('../public/'+p,import.meta.url))])) as LogosBytes;
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import JSZip from 'jszip';
import PlanDocument from '../components/PlanDocument';
import {crearWordPlaneacion} from '../src/services/wordService';
import {fechaPlan,periodoPlan,horasPlan,fechasSesiones} from '../src/features/planeacion/presentacionPlan';
import {comprobarInstrumento,COLUMNAS_COTEJO} from '../services/paqueteClase';
import {auditarPlaneacion} from '../src/features/planeacion/auditoriaPedagogica';
import {programasSEPService} from '../src/services/programasSEPService';
import muestra from '../src/demo/planMuestra.json';
import type {LessonPlan} from '../types';
const plan=()=>structuredClone(muestra) as unknown as LessonPlan;
test('horas ausentes y fechas de calendario se presentan sin valores inventados',()=>{
 assert.equal(horasPlan(0),'Horas por registrar'); assert.equal(fechaPlan('2026-10-26'),'26/10/2026');
 assert.equal(periodoPlan({...plan().meta!,startDate:'2026-10-26',endDate:'2026-10-27',period:'Por definir'}),'26/10/2026 — 27/10/2026');
 const sessions=Array.from({length:3},(_,i)=>({...plan().sessions![0],sessionNumber:i+1,date:'Inventada'}));
 assert.deepEqual(fechasSesiones(sessions,'2026-10-26','2026-10-30')?.map(s=>s.date),['2026-10-26','Por asignar','2026-10-30']);
});
test('lista de cotejo no acepta una escala bajo otro nombre',()=>{
 assert.doesNotThrow(()=>comprobarInstrumento('Lista de Cotejo',{columns:COLUMNAS_COTEJO}));
 assert.throws(()=>comprobarInstrumento('Lista de Cotejo',{columns:['Sí','En proceso','Aún no']}));
 assert.doesNotThrow(()=>comprobarInstrumento('Rúbrica Analítica',{columns:['3','2','1']}));
});
test('catálogo Cultura Digital I cotejado no mezcla categorías de progresiones',()=>{
 const p=programasSEPService.buscarPorMateria('Cultura Digital I').find(p=>p.modelo==='2024')!;
 assert.equal(p.metadata.horas_semanales,3); assert.equal(p.metadata.creditos,6);
 assert.deepEqual(p.progresiones[0].categorias,['Ciudadanía Digital']);assert.equal(p.progresiones[0].subcategorias?.length,4);
 assert.equal(p.progresiones[0].metas.length,3);assert.equal(p.progresiones[4].metas.length,2);assert.match(p.progresiones[9].metas[0],/pensamiento algorítmico/);
 assert.deepEqual(p.progresiones[9].categorias,['Pensamiento Algorítmico']);assert.match(p.progresiones[9].descripcion,/^Utiliza/);
});
test('auditoría no declara PEC al detectar cualquier texto y enumera faltantes exactos',()=>{
 const p=plan();p.meta={...p.meta!,semester:1,componente:'fundamental',areaOrRecurso:''};p.paec={isLinked:false,estado:'sin_vinculo',communityProblem:'',projectTrigger:''};
 const checks=auditarPlaneacion(p,[]).results;
 const text=JSON.stringify(checks.find(c=>c.label==='Datos de identificación'));assert.match(text,/Falta declarar: área o recurso/);
 assert.doesNotMatch(JSON.stringify(checks.find(c=>c.label==='Transversalidad')),/Declara el vínculo con otras UAC y con el PEC/);
});
test('pantalla y Word comparten periodo, horas pendientes y vocabulario 2025; fichas separadas',async()=>{
 const p=plan();p.meta={...p.meta!,modelo:'2025',hoursPerWeek:0,startDate:'2026-10-26',endDate:'2026-10-27',period:'Por definir'};
 p.date='2026-10-26T04:00:00Z';p.resources=['Caso incluido en teachingKit'];
 p.teachingKit=[{title:'Ficha inicial',sessionNumber:1,delivery:'Al inicio',content:'Lee este caso.',questions:[{prompt:'Justifica con dos hechos',lines:8}],teacherNotes:'Guía inicial',preparation:'16 copias'}, {title:'Caso reservado',sessionNumber:2,delivery:'Solo al evaluar en sesión 2',content:'Nuevo caso.',questions:[],teacherNotes:'Respuesta reservada',preparation:'No entregar antes'}];
 const html=renderToStaticMarkup(<PlanDocument plan={p}/>);assert.match(html,/Horas por registrar/);assert.doesNotMatch(html,/4 hrs\/sem|2026-10-26T/);assert.match(html,/26\/10\/2026/);
 const zip=await JSZip.loadAsync(await(await crearWordPlaneacion(p,undefined,undefined,logos)).arrayBuffer());const xml=await zip.file('word/document.xml')!.async('string');
 for(const text of ['26/10/2026 — 27/10/2026','Horas por registrar','Propósito formativo','Metas educativas','Solo al evaluar en sesión 2','Justifica con dos hechos'])assert.ok(xml.includes(text),text);
 assert.ok(!xml.includes('teachingKit'));assert.ok((xml.match(/w:pageBreakBefore/g)||[]).length>=3);assert.ok((xml.match(/w:pBdr/g)||[]).length>=8);
});
