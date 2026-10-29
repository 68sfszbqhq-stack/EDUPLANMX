/** Conector local del experimento de cinco perfiles. No entra al sitio publicado. */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Plugin } from 'vite';
import { protegerPuente, guardarRespaldo } from './seguridad-puente';
import { extraerJSON } from './puente-ia';

export function ejecutarCodex(prompt: string, signal?: AbortSignal): Promise<{ texto: string; modelo: string }> {
  return new Promise((resolveResult, reject) => {
    const carpeta = mkdtempSync(resolve(tmpdir(), 'eduplan-codex-'));
    const proceso = spawn('codex', [
      'exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check',
      '--sandbox', 'read-only', '-c', 'features.shell_tool=false',
      '-c', 'web_search="disabled"', '--color', 'never', '-',
    ], { cwd: carpeta, stdio: ['pipe', 'pipe', 'pipe'], signal, killSignal: 'SIGKILL' });
    let salida = '', errores = '';
    const timer = setTimeout(() => proceso.kill('SIGKILL'), 600_000);
    const limpiar = () => { clearTimeout(timer); rmSync(carpeta, { recursive: true, force: true }); };
    proceso.stdout.on('data', d => { salida += d; if (salida.length > 8_000_000) proceso.kill('SIGKILL'); });
    proceso.stderr.on('data', d => { errores = (errores + d).slice(-100_000); });
    proceso.on('error', e => { limpiar(); reject(new Error(`No se pudo iniciar Codex: ${e.message}`)); });
    proceso.on('close', code => {
      limpiar();
      if (code !== 0) return reject(new Error(`Codex no completó la solicitud (código ${code ?? 'tiempo agotado'}). Revisa el acceso de la sesión local.`));
      resolveResult({ texto: salida, modelo: errores.match(/^model:\s*(.+)$/m)?.[1]?.trim() || 'Codex (modelo predeterminado del CLI)' });
    });
    proceso.stdin.on('error', () => { /* el cierre se informa arriba */ });
    proceso.stdin.end(prompt);
  });
}

export function puenteCodex(): Plugin {
  return {
    name: 'eduplan-experimento-codex', apply: 'serve',
    configureServer(server) {
      protegerPuente(server, {
        '/api/ia/terminal': async (pedido, signal) => {
            const inicio = Date.now();
            const r = await ejecutarCodex(`Tu tarea exclusiva es producir una planeación didáctica. No uses herramientas ni consultes archivos. Trabaja únicamente con la información incluida.\n\n${pedido.systemInstruction}\n\nFORMATO: devuelve solamente un objeto JSON conforme a este esquema (tipos en mayúsculas), sin bloques Markdown:\n${JSON.stringify(pedido.esquema)}\n\nSOLICITUD:\n${pedido.mensaje}`, signal);
            const plan = extraerJSON(r.texto);
            if (!Array.isArray(plan.sessions) || !plan.sessions.length) throw new Error('Codex devolvió una planeación sin sesiones.');
            const nombre = `codex-${Date.now()}-${randomUUID()}.json`;
            const respaldo = guardarRespaldo(nombre, plan);
            const resultado = { plan, modelo: r.modelo, segundos: Math.round((Date.now() - inicio) / 1000), respaldo };
            console.log(`[Experimento Codex] ${r.modelo}: ${plan.sessions.length} sesiones, ${resultado.segundos}s`);
            return resultado;
        },
      });
    },
  };
}
