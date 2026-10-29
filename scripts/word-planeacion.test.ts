import {readFileSync} from 'node:fs';
import {LOGOS_BGO, type LogosBytes} from '../src/services/formatoBGO';
const logos = Object.fromEntries(Object.entries(LOGOS_BGO).map(([k,p])=>[k,readFileSync(new URL('../public/'+p,import.meta.url))])) as LogosBytes;
import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {crearWordPlaneacion} from '../src/services/wordService';
import type {LessonPlan} from '../types';
import muestra from '../src/demo/planMuestra.json';
test('Word conserva PAEC pendiente, matriz y materiales sin dividir filas ni perder cabeceras',async()=>{
 const p=structuredClone(muestra) as unknown as LessonPlan;
 p.paec={isLinked:false,estado:'pendiente',communityProblem:'Agua',projectTrigger:'Análisis',pecName:'Proyecto por acordar',pecProducts:['Registro de evidencia']};
 p.assessmentInstrument={name:'Lista de cotejo',instructions:'Marcar una opción',columns:['Sí','Aún no'],rows:[{criterion:'Usa evidencia',descriptors:['Cita dato verificable','Falta dato']}],scoring:'Retroalimentar antes de calificar'};
 p.teachingKit=[{title:'Caso de práctica',content:'Texto íntegro del caso\nPregunta para responder',teacherNotes:'Orientación de respuesta',preparation:'Copiar en cuaderno'}];
 const zip=await JSZip.loadAsync(await(await crearWordPlaneacion(p,undefined,undefined,logos)).arrayBuffer());const xml=await zip.file('word/document.xml')!.async('string');
 for(const t of ['Vinculación pendiente de acuerdo','Proyecto por acordar','Registro de evidencia','Cita dato verificable','Texto íntegro del caso','Orientación de respuesta']) assert.ok(xml.includes(t),t);
 assert.ok(xml.includes('w:orient="landscape"'));
 assert.ok(xml.includes('6D0000'));
 const header=await zip.file('word/header1.xml')!.async('string');
 assert.equal((header.match(/<pic:pic(?:\s|>)/g)||[]).length,3);
 assert.equal(Object.keys(zip.files).filter(k=>k.startsWith('word/media/') && k.endsWith('.png')).length,3);
 assert.ok(!xml.includes('Beatriz Sanchéz'));
 assert.ok(xml.includes('w:tblHeader'));assert.ok(xml.includes('w:cantSplit'));assert.ok(xml.includes('w:keepNext'));
 assert.ok(!xml.includes('Vínculo con el proyecto: Proyecto integrador'));
});

test('Word conserva el plantel guardado aunque se abra fuera del generador',async()=>{
 const p=structuredClone(muestra) as unknown as LessonPlan;
 p.institution={name:'Plantel conservado',cct:'CLAVE-PRUEBA'};
 const zip=await JSZip.loadAsync(await(await crearWordPlaneacion(p,'Otro plantel','OTRA',logos)).arrayBuffer());
 const xml=await zip.file('word/document.xml')!.async('string');
 assert.ok(xml.includes('Plantel conservado'));assert.ok(xml.includes('CLAVE-PRUEBA'));assert.ok(!xml.includes('Otro plantel'));
});
