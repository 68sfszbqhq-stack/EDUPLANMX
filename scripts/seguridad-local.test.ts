import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { crearProteccionPuente } from './seguridad-puente';
import { activarAlmacenCuenta, obtenerAlmacenCuenta } from '../src/security/almacenCuenta';

class Memoria {
  data = new Map<string,string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string,v: string) { this.data.set(k,v); }
  removeItem(k: string) { this.data.delete(k); }
}
test('las cuentas y planteles no heredan borradores, callbacks tardíos ni claves', () => {
  Object.assign(globalThis,{localStorage:new Memoria(),sessionStorage:new Memoria()});
  localStorage.setItem('savedPlans','LEGADO SIN AUTOR');
  activarAlmacenCuenta('A','escuela1');
  const a = obtenerAlmacenCuenta();
  assert.equal(a.getItem('savedPlans'), null);
  a.setItem('savedPlans','PLAN A');
  sessionStorage.setItem('gemini_api_key','CLAVE FICTICIA');
  activarAlmacenCuenta('B','escuela1');
  const b = obtenerAlmacenCuenta();
  assert.equal(b.getItem('savedPlans'),null);
  assert.equal(sessionStorage.getItem('gemini_api_key'),null);
  a.setItem('savedPlans','CALLBACK TARDIO');
  b.setItem('savedPlans','PLAN B');
  activarAlmacenCuenta('A','escuela2');
  assert.equal(obtenerAlmacenCuenta().getItem('savedPlans'),null);
  activarAlmacenCuenta('A','escuela1');
  assert.equal(obtenerAlmacenCuenta().getItem('savedPlans'),'PLAN A');
  activarAlmacenCuenta();
  assert.equal(obtenerAlmacenCuenta().getItem('savedPlans'),null);
  assert.equal(localStorage.getItem('savedPlans'),'LEGADO SIN AUTOR');
});

test('puente HTTP bloquea origen/host falsos, uso sin token, exceso de tamaño y concurrencia', async () => {
  let port = 0, llamadas = 0;
  let liberar: (() => void) | undefined;
  const middleware = crearProteccionPuente(() => port, {'/api/ia/terminal': async (p, signal) => {
    llamadas++;
    if (p.mensaje === 'esperar') await new Promise<void>(resolve => { liberar = resolve; signal.addEventListener('abort', () => resolve(), {once:true}); });
    return {ok:true};
  }});
  const server = createServer((req,res) => { void middleware(req,res,() => { res.end('web'); }); });
  await new Promise<void>(r => server.listen(0,'127.0.0.1',r));
  port = (server.address() as any).port;
  const host = `127.0.0.1:${port}`;
  const http = (path: string, method = 'GET', headers: Record<string,string> = {}, body?: string) => new Promise<{status:number;body:any}>(resolve => {
    const req = request({hostname:'127.0.0.1',port,path,method,headers:{Host:host,...headers}},res => {
      let data='';res.on('data',c=>data+=c);res.on('end',()=>{ let parsed:any=data; try {parsed=JSON.parse(data);} catch {} resolve({status:res.statusCode!,body:parsed}); });
    });
    req.end(body);
  });
  try {
    assert.equal((await http('/vite.config.ts','GET',{Host:'malicioso.invalid'})).status,403);
    assert.equal((await http('/planeaciones-generadas/privado.json')).status,403);
    assert.equal((await http('/api/ia/sesion')).status,403);
    assert.equal((await http('/api/ia/sesion','GET',{'X-Eduplan-Local':'1','Sec-Fetch-Site':'cross-site'})).status,403);
    const sesion = await http('/api/ia/sesion','GET',{'X-Eduplan-Local':'1','Sec-Fetch-Site':'same-origin'});
    assert.equal(sesion.status,200);
    const headers = {'Content-Type':'application/json',Origin:`http://${host}`,'X-Eduplan-Token':sesion.body.token};
    const body = JSON.stringify({systemInstruction:'Solo prueba',mensaje:'prueba',esquema:{}});
    assert.equal((await http('/api/ia/terminal','POST',{'Content-Type':'application/json',Origin:`http://${host}`},body)).status,403);
    assert.equal((await http('/api/ia/terminal','POST',{...headers,Host:'malicioso.invalid',Origin:'http://malicioso.invalid'},body)).status,403);
    assert.equal((await http('/api/ia/terminal','POST',{...headers,Origin:'https://ajeno.invalid'},body)).status,403);
    assert.equal((await http('/api/ia/terminal','POST',{...headers,Origin:''},body)).status,403);
    assert.equal((await http('/api/ia/terminal','POST',headers,'{}')).status,400);
    assert.equal((await http('/api/ia/terminal','POST',headers,'x'.repeat(2_000_001))).status,413);
    assert.equal(llamadas,0);
    assert.equal((await http('/api/ia/terminal','POST',headers,body)).status,200);
    const pendiente = http('/api/ia/terminal','POST',headers,JSON.stringify({systemInstruction:'x',mensaje:'esperar',esquema:{}}));
    while (!liberar) await new Promise(r=>setTimeout(r,5));
    assert.equal((await http('/api/ia/terminal','POST',headers,body)).status,429);
    liberar();await pendiente;
    assert.equal(llamadas,2);
    for (let i=0;i<4;i++) assert.equal((await http('/api/ia/terminal','POST',headers,body)).status,200);
    assert.equal((await http('/api/ia/terminal','POST',headers,body)).status,429);
    assert.equal(llamadas,6);
  } finally {
    liberar?.();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));
  }
});
