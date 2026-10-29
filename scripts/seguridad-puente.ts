import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ViteDevServer } from 'vite';

export const CARPETA_RESPALDOS = resolve(homedir(), '.local/share/eduplanmx-v2/respaldos');
export function guardarRespaldo(nombre: string, datos: unknown): string {
  if (nombre !== nombre.split(/[\\/]/).pop()) throw new Error('Nombre de respaldo inválido');
  mkdirSync(CARPETA_RESPALDOS, { recursive: true, mode: 0o700 });
  const ruta = resolve(CARPETA_RESPALDOS, nombre);
  writeFileSync(ruta, JSON.stringify(datos, null, 2), { mode: 0o600, flag: 'wx' });
  return ruta;
}

type Handler = (pedido: any, signal: AbortSignal) => Promise<unknown>;
export function crearProteccionPuente(port: () => number, rutas: Record<string, Handler>) {
  const token = randomBytes(32).toString('hex');
  let ocupado = false;
  let inicios: number[] = [];
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const hosts = [`127.0.0.1:${port()}`, `localhost:${port()}`, `[::1]:${port()}`];
    const fail = (status: number, error: string) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ error }));
    };
    // También protege el código servido por Vite frente a DNS rebinding.
    if (!hosts.includes(req.headers.host || '')) return fail(403, 'Host local no permitido.');
    const path = (req.url || '').split('?')[0];
    if (path.includes('planeaciones-generadas') || path.includes('/respaldos/')) return fail(403, 'Respaldo privado.');
    if (!path.startsWith('/api/ia/')) return next();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');
    const origin = req.headers.origin;
    const sameOrigin = origin === `http://${req.headers.host}`;
    if (path === '/api/ia/sesion') {
      if (req.method !== 'GET') return fail(405, 'Método no permitido.');
      // La cabecera personalizada fuerza preflight en sitios ajenos; no habilitamos CORS.
      if (req.headers['x-eduplan-local'] !== '1' || req.headers['sec-fetch-site'] !== 'same-origin'
        || (origin && !sameOrigin)) return fail(403, 'Abre EduPlan desde este servidor local.');
      res.end(JSON.stringify({ token }));
      return;
    }
    if (!rutas[path]) return fail(404, 'Ruta inexistente.');
    if (req.method !== 'POST') return fail(405, 'Método no permitido.');
    if (!sameOrigin || req.headers['x-eduplan-token'] !== token) return fail(403, 'Sesión local no válida. Recarga la página.');
    if (!req.headers['content-type']?.startsWith('application/json')) return fail(415, 'Se requiere JSON.');
    if (ocupado) return fail(429, 'Ya hay una generación en curso.');
    inicios = inicios.filter(t => Date.now() - t < 60_000);
    if (inicios.length >= 6) return fail(429, 'Espera un minuto antes de volver a generar.');
    ocupado = true;
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', disconnect);
    const timer = setTimeout(() => { controller.abort(); if (!res.writableEnded) fail(408, 'Tiempo de solicitud agotado.'); }, 600_000);
    try {
      const body = await new Promise<string>((resolveBody, reject) => {
        let size = 0;
        const chunks: Buffer[] = [];
        const bodyTimer = setTimeout(() => reject(Object.assign(new Error('Solicitud incompleta.'), { status: 408 })), 10_000);
        const cleanup = () => clearTimeout(bodyTimer);
        req.on('data', (c: Buffer) => {
          size += c.length;
          if (size > 2_000_000) { cleanup(); reject(Object.assign(new Error('Solicitud demasiado grande.'), { status: 413 })); }
          else chunks.push(c);
        });
        req.on('end', () => { cleanup(); resolveBody(Buffer.concat(chunks).toString('utf8')); });
        req.on('error', e => { cleanup(); reject(e); });
        req.on('aborted', () => { cleanup(); reject(new Error('Solicitud cancelada.')); });
      });
      let pedido: any;
      try { pedido = JSON.parse(body); } catch { return fail(400, 'JSON inválido.'); }
      if (!pedido || typeof pedido.mensaje !== 'string' || !pedido.mensaje.trim()
        || (path.endsWith('/terminal') ? typeof pedido.systemInstruction !== 'string' || !pedido.esquema : typeof pedido.systemPrompt !== 'string' || !['examen','rubrica','revision'].includes(pedido.tipo))) return fail(400, 'Solicitud incompleta.');
      if (controller.signal.aborted) return;
      inicios.push(Date.now());
      const resultado = await rutas[path](pedido, controller.signal);
      if (!res.writableEnded && !controller.signal.aborted) res.end(JSON.stringify(resultado));
    } catch (e: any) {
      if (!res.writableEnded && !res.destroyed) fail(e.status || 500, e.message || 'No se pudo generar.');
    } finally {
      clearTimeout(timer);
      res.off('close', disconnect);
      ocupado = false;
    }
  };
}
export function protegerPuente(server: ViteDevServer, rutas: Record<string, Handler>) {
  server.middlewares.use(crearProteccionPuente(() => {
    const address = server.httpServer?.address();
    return address && typeof address === 'object' ? address.port : server.config.server.port;
  }, rutas));
}
