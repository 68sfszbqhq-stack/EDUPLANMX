import React, { useMemo, useState } from 'react';
import { UserPlus, Printer, AlertTriangle, Link2Off, UserX, UserCheck, CheckCircle2 } from 'lucide-react';
import { AlumnoLista, Grupo, VistaPrevia } from '../../src/features/grupos/model';
import { cambiarEstado, desvincular, importarAlumnos } from '../../src/features/grupos/storage';
import ImportarAlumnos from './ImportarAlumnos';
import { boton, iniciales } from './ui';

export default function Alumnos({ grupo, alumnos, onCambio, onFicha, onError, onAviso }: {
  grupo: Grupo; alumnos: AlumnoLista[]; onCambio: () => Promise<void> | void; onFicha: (m: string) => void; onError: (e: string) => void; onAviso: (t: string) => void;
}) {
  const [agregando, setAgregando] = useState(!alumnos.length);
  const [vista, setVista] = useState<VistaPrevia | null>(null);
  const [aplicar, setAplicar] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Una misma cuenta de Google ligada a dos alumnos es señal de que alguien
  // escribió una clave que no era suya: se marca para que el docente lo revise.
  const correosRepetidos = useMemo(() => {
    const vistos = new Map<string, number>();
    alumnos.forEach(a => a.cuentaCorreo && vistos.set(a.cuentaCorreo, (vistos.get(a.cuentaCorreo) ?? 0) + 1));
    return new Set([...vistos].filter(([, n]) => n > 1).map(([c]) => c));
  }, [alumnos]);
  const activos = alumnos.filter(a => a.estado === 'activo');
  const conectados = activos.filter(a => a.cuentaUid).length;

  const accion = async (fn: () => Promise<void>) => { try { await fn(); await onCambio(); } catch (e: any) { onError(e.message); } };
  const n = vista?.nuevos.length ?? 0;
  const guardar = async () => {
    if (!vista) return;
    setGuardando(true);
    try {
      const r = await importarAlumnos(grupo, vista, aplicar);
      await onCambio();
      onAviso(`Listo: ${r.agregados} ${r.agregados === 1 ? 'alumno agregado' : 'alumnos agregados'}${r.corregidos ? `, ${r.corregidos} nombres corregidos` : ''}.`);
      setAgregando(false); setVista(null);
    } catch (e: any) { onError(`No se guardó nada: ${e.message}`); } finally { setGuardando(false); }
  };

  const imprimirClaves = () => {
    const filas = activos.map(a => `<div class="t"><b>${esc(a.nombre)}</b><span>${esc(grupo.nombre)} · ${esc(grupo.asignaturaNombre)}</span><code>${esc(a.matricula)}</code><small>En Antología Digital, cuando te pida tu matrícula, escribe esta clave.</small></div>`).join('');
    const w = window.open('', '_blank');
    if (!w) return onError('Tu navegador bloqueó la ventana para imprimir. Permite ventanas emergentes para esta página.');
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Claves ${esc(grupo.nombre)}</title><style>
      body{font-family:system-ui,sans-serif;margin:16px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
      .t{border:1px dashed #999;padding:10px;display:flex;flex-direction:column;gap:4px;break-inside:avoid}
      span{font-size:11px;color:#555}code{font-size:22px;letter-spacing:3px;font-weight:700}small{font-size:10px;color:#555}
      @media print{button{display:none}}</style>
      <button onclick="print()">Imprimir</button><p>Recorta y entrega a cada alumno su clave.</p><div class="g">${filas}</div>`);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setAgregando(!agregando)} className={`${boton} bg-indigo-600 text-white`}><UserPlus className="w-4 h-4" /> Agregar alumnos</button>
        <button onClick={imprimirClaves} disabled={!activos.length} className={`${boton} border border-slate-300 text-slate-700`}><Printer className="w-4 h-4" /> Imprimir claves para Antología</button>
        <span className="text-sm text-slate-600 ml-auto">
          {activos.length} activos · {conectados} {conectados === 1 ? 'ya entró' : 'ya entraron'} a Antología
          {grupo.asignaturaClave ? '' : ' · esta asignatura no está conectada a Antología'}
        </span>
      </div>

      {agregando && (
        <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 space-y-3">
          <ImportarAlumnos existentes={alumnos} onCambio={(v, ap) => { setVista(v); setAplicar(ap); }} onError={onError} />
          <button onClick={guardar} disabled={guardando || (!n && !(aplicar && vista?.cambios.length))} className={`${boton} bg-indigo-600 text-white`}>
            <CheckCircle2 className="w-4 h-4" /> {guardando ? 'Guardando…' : n ? `Agregar ${n} ${n === 1 ? 'alumno' : 'alumnos'}` : 'Guardar'}
          </button>
        </div>
      )}

      {alumnos.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b bg-slate-50"><th className="p-2 w-8">#</th><th className="p-2">Alumno</th><th className="p-2">Matrícula o clave</th><th className="p-2">Antología</th><th></th></tr></thead>
            <tbody>
              {alumnos.map((a, i) => (
                <tr key={a.matricula} className={`border-b border-slate-100 ${a.estado === 'baja' ? 'text-slate-400' : ''}`}>
                  <td className="p-2 text-xs text-slate-400">{i + 1}</td>
                  <td className="p-2">
                    <button onClick={() => a.estado === 'activo' && onFicha(a.matricula)} className="flex items-center gap-2 hover:text-indigo-700">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">{iniciales(a.nombre)}</span>
                      {a.nombre}{a.estado === 'baja' && ' (baja)'}
                    </button>
                  </td>
                  <td className="p-2 font-mono">{a.matricula}{a.generada && <span className="ml-1 text-[10px] font-sans text-slate-400">clave</span>}</td>
                  <td className="p-2">
                    {a.cuentaUid ? (
                      <span className={correosRepetidos.has(a.cuentaCorreo) ? 'text-rose-700 font-semibold' : 'text-emerald-700'}>
                        {correosRepetidos.has(a.cuentaCorreo) && <AlertTriangle className="inline w-4 h-4 mr-1" />}{a.cuentaCorreo || 'conectado'}
                      </span>
                    ) : <span className="text-slate-400">Aún no entra</span>}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {a.cuentaUid && <button title="Quitar la cuenta ligada (si la reclamó quien no era)" onClick={() => accion(() => desvincular(grupo.id, a.matricula))} className="p-1 text-slate-500 hover:text-rose-600"><Link2Off className="w-4 h-4" /></button>}
                    {a.estado === 'activo'
                      ? <button title="Dar de baja (no se borra nada)" onClick={() => accion(() => cambiarEstado(grupo.id, a.matricula, 'baja'))} className="p-1 text-slate-500 hover:text-rose-600"><UserX className="w-4 h-4" /></button>
                      : <button title="Reactivar" onClick={() => accion(() => cambiarEstado(grupo.id, a.matricula, 'activo'))} className="p-1 text-slate-500 hover:text-emerald-600"><UserCheck className="w-4 h-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {correosRepetidos.size > 0 && (
        <p className="text-sm text-rose-700"><AlertTriangle className="inline w-4 h-4 mr-1" />Una misma cuenta aparece en varios alumnos. Revisa quién es quién y quita la cuenta que no corresponda.</p>
      )}
    </div>
  );
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
