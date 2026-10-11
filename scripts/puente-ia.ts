/**
 * PUENTE IA POR TERMINAL — solo versión 2, solo en la Mac de José.
 *
 * El navegador no puede ejecutar programas; el servidor de desarrollo sí. Este
 * plugin agrega a `npm run dev:v2` la ruta POST /api/ia/terminal, que recibe el
 * prompt YA ARMADO por services/geminiService.ts (el mismo de producción: programa
 * oficial, perfil docente, cuaderno, Formación Laboral) y se lo pasa al comando
 * `claude` con la suscripción de José. No hay API key.
 *
 * Aislamiento: el comando corre en una carpeta temporal vacía, sin herramientas
 * (--tools ""), sin servidores MCP (--strict-mcp-config: nada de WhatsApp ni
 * Gmail) y sin configuración personal (--restricted). Así, aunque un documento
 * del Cuaderno trajera instrucciones escondidas, el modelo no puede leer
 * archivos, mandar mensajes ni ejecutar nada: solo devolver texto.
 *
 * Nada de esto entra al build de producción: solo lo carga vite.v2.config.ts.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const CARPETA_RESPALDOS = resolve(process.cwd(), 'planeaciones-generadas');

interface Pedido { systemInstruction: string; mensaje: string; esquema: unknown; etiqueta?: string }
interface Respuesta { plan: any; modelo: string; segundos: number; respaldo: string }

class ErrorPasajero extends Error {}

/** Extrae el objeto JSON de la respuesta, aunque venga envuelto en ```json. */
export function extraerJSON(texto: string): any {
  const inicio = texto.indexOf('{');
  const fin = texto.lastIndexOf('}');
  if (inicio < 0 || fin <= inicio) throw new Error('La respuesta no trae un objeto JSON.');
  return JSON.parse(texto.slice(inicio, fin + 1));
}

function ejecutarClaude(systemPrompt: string, mensaje: string): Promise<{ texto: string; modelo: string }> {
  return new Promise((cumplir, fallar) => {
    const carpeta = mkdtempSync(resolve(tmpdir(), 'eduplan-v2-ia-'));
    const limpiar = () => { try { rmSync(carpeta, { recursive: true, force: true }); } catch { /* nada */ } };
    const proceso = spawn('claude', [
      '-p', '--model', 'opus', '--output-format', 'json',
      '--tools', '', '--strict-mcp-config', '--restricted', '--no-session-persistence',
      '--system-prompt', systemPrompt,
      mensaje,
    ], {
      cwd: carpeta,
      // stdin cerrado: si queda abierto, el CLI espera datos que nunca llegan.
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CLAUDE_CODE_MAX_OUTPUT_TOKENS: '32000' },
    });
    let salida = '', errores = '';
    proceso.stdout.on('data', d => { salida += d; });
    proceso.stderr.on('data', d => { errores += d; });
    proceso.on('error', (e: any) => {
      limpiar();
      fallar(new Error(e.code === 'ENOENT' ? 'No encontré el comando `claude` en esta Mac.' : e.message));
    });
    proceso.on('close', codigo => {
      limpiar();
      let j: any;
      try { j = JSON.parse(salida); } catch {
        return fallar(new Error(`El comando claude terminó con código ${codigo}: ${(errores || salida).slice(0, 300)}`));
      }
      // Respuesta vacía del servicio: es pasajera, vale la pena reintentar.
      if (j.is_error && !j.usage?.output_tokens) return fallar(new ErrorPasajero(`respuesta vacía del servicio (${j.subtype || j.stop_reason || 'sin detalle'})`));
      if (j.is_error) return fallar(new Error(String(j.result || 'Error del comando claude').slice(0, 300)));
      cumplir({ texto: String(j.result || ''), modelo: Object.keys(j.modelUsage || {})[0] || 'claude (terminal)' });
    });
  });
}

export async function generarPorTerminal(p: Pedido): Promise<Respuesta> {
  const systemPrompt = `${p.systemInstruction}

FORMATO DE SALIDA OBLIGATORIO: responde ÚNICAMENTE con un objeto JSON válido que siga
exactamente este esquema (los tipos están escritos en mayúsculas: OBJECT, ARRAY, STRING,
NUMBER, INTEGER, BOOLEAN). Sin texto antes ni después del JSON y sin comentarios.

${JSON.stringify(p.esquema)}`;

  const inicio = Date.now();
  let ultimo: Error | null = null;
  // Hasta 3 intentos: los cortes del servicio y un JSON mal cerrado son pasajeros.
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const { texto, modelo } = await ejecutarClaude(systemPrompt, p.mensaje);
      const plan = extraerJSON(texto);
      if (!Array.isArray(plan.sessions) || plan.sessions.length === 0) throw new Error('La planeación llegó sin sesiones.');

      // Respaldo en disco: si el navegador se cierra o falla Firestore, el trabajo no se pierde.
      mkdirSync(CARPETA_RESPALDOS, { recursive: true });
      const sello = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      const nombre = `${sello}_${String(p.etiqueta || 'planeacion').replace(/[^\wáéíóúñÁÉÍÓÚÑ ]/g, '').slice(0, 40).trim().replace(/\s+/g, '-')}.json`;
      writeFileSync(resolve(CARPETA_RESPALDOS, nombre), JSON.stringify(plan, null, 2));

      return { plan, modelo, segundos: Math.round((Date.now() - inicio) / 1000), respaldo: `planeaciones-generadas/${nombre}` };
    } catch (e: any) {
      ultimo = e;
      const reintentable = e instanceof ErrorPasajero || e instanceof SyntaxError || /JSON|sin sesiones/.test(e.message);
      if (!reintentable || intento === 3) break;
      console.log(`   ⚠️  Intento ${intento}: ${e.message}. Reintentando (${intento + 1} de 3)…`);
    }
  }
  throw ultimo ?? new Error('No se pudo generar la planeación.');
}

/**
 * Pedido genérico (exámenes, rúbricas, revisión de respuestas abiertas): el
 * navegador manda el prompt completo y aquí solo se garantiza que vuelva un JSON
 * con la forma mínima de cada tipo. La validación fina la hace el navegador
 * (src/features/evaluacion/modelo.ts) antes de guardar nada.
 */
const FORMA: Record<string, (x: any) => boolean> = {
  examen: x => Array.isArray(x?.preguntas) && x.preguntas.length > 0,
  rubrica: x => Array.isArray(x?.criterios) && x.criterios.length > 0,
  revision: x => Array.isArray(x?.revisiones),
};

export async function generarJSON(tipo: string, systemPrompt: string, mensaje: string): Promise<{ datos: any; modelo: string; segundos: number }> {
  if (!FORMA[tipo]) throw new Error(`Tipo de pedido desconocido: ${tipo}`);
  const inicio = Date.now();
  let ultimo: Error | null = null;
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const { texto, modelo } = await ejecutarClaude(systemPrompt, mensaje);
      const datos = extraerJSON(texto);
      if (!FORMA[tipo](datos)) throw new Error(`La respuesta no trae la forma de ${tipo}.`);
      return { datos, modelo, segundos: Math.round((Date.now() - inicio) / 1000) };
    } catch (e: any) {
      ultimo = e;
      const reintentable = e instanceof ErrorPasajero || e instanceof SyntaxError || /JSON|forma/.test(e.message);
      if (!reintentable || intento === 3) break;
      console.log(`   ⚠️  Intento ${intento}: ${e.message}. Reintentando (${intento + 1} de 3)…`);
    }
  }
  throw ultimo ?? new Error('No se pudo generar.');
}

/** Plugin de Vite: agrega POST /api/ia/terminal al servidor de desarrollo de la v2. */
export function puenteIA(): Plugin {
  return {
    name: 'puente-ia-terminal',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/ia/json', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let cuerpo = '';
        req.on('data', c => { cuerpo += c; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { tipo, systemPrompt, mensaje } = JSON.parse(cuerpo);
            console.log(`\n🧠 [IA por terminal] Generando ${tipo} con Claude (tu suscripción)…`);
            const r = await generarJSON(tipo, String(systemPrompt), String(mensaje));
            console.log(`✅ [IA por terminal] ${tipo} listo en ${r.segundos}s con ${r.modelo}\n`);
            res.end(JSON.stringify(r));
          } catch (e: any) {
            console.error('❌ [IA por terminal]', e.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
      server.middlewares.use('/api/ia/terminal', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let cuerpo = '';
        req.on('data', c => { cuerpo += c; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const pedido = JSON.parse(cuerpo) as Pedido;
            console.log(`\n🧠 [IA por terminal] Generando "${pedido.etiqueta || 'planeación'}" con Claude (tu suscripción). Tarda de 1 a 5 minutos…`);
            const r = await generarPorTerminal(pedido);
            console.log(`✅ [IA por terminal] Listo en ${r.segundos}s con ${r.modelo} — ${r.plan.sessions.length} sesiones · respaldo: ${r.respaldo}\n`);
            res.end(JSON.stringify(r));
          } catch (e: any) {
            console.error('❌ [IA por terminal]', e.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}
