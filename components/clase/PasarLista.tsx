import React, { useMemo, useState } from 'react';
import { CheckCheck, NotebookPen, Trash2 } from 'lucide-react';
import { AlumnoLista } from '../../src/features/grupos/model';
import { MarcaAsistencia, Sesion, resumirAsistencia } from '../../src/features/evaluacion/modelo';
import { borrarSesion, hoy, marcarAsistencia } from '../../src/features/clase/storage';
import { boton, iniciales } from './ui';

const MARCAS: { v: MarcaAsistencia; corto: string; largo: string; activo: string }[] = [
  { v: 'P', corto: 'Presente', largo: 'Presente', activo: 'bg-emerald-600 text-white border-emerald-600' },
  { v: 'R', corto: 'Retardo', largo: 'Llegó tarde (cuenta como asistencia)', activo: 'bg-amber-500 text-white border-amber-500' },
  { v: 'F', corto: 'Falta', largo: 'Falta', activo: 'bg-rose-600 text-white border-rose-600' },
  { v: 'J', corto: 'Justificada', largo: 'Falta justificada (no cuenta)', activo: 'bg-sky-600 text-white border-sky-600' },
];

export default function PasarLista({ grupoId, alumnos, sesiones, onError, onDiario }: {
  grupoId: string; alumnos: AlumnoLista[]; sesiones: Sesion[]; onError: (e: string) => void; onDiario: (fecha: string) => void;
}) {
  const [fecha, setFecha] = useState(hoy());
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);
  const sesion = sesiones.find(s => s.fecha === fecha);
  const marcas = sesion?.marcas ?? {};
  const cuenta = useMemo(() => Object.fromEntries(MARCAS.map(m => [m.v, Object.values(marcas).filter(x => x === m.v).length])), [marcas]);
  const sinMarcar = alumnos.filter(a => !marcas[a.matricula]).length;

  const marcar = async (cambios: Record<string, MarcaAsistencia | null>) => {
    try { await marcarAsistencia(grupoId, fecha, cambios); } catch (e: any) { onError(`No se guardó la asistencia: ${e.message}`); }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={fecha} onChange={e => { setFecha(e.target.value); setConfirmarBorrar(false); }} className="border border-slate-300 rounded-lg p-2 text-sm" aria-label="Fecha de la sesión" />
          <button onClick={() => marcar(Object.fromEntries(alumnos.filter(a => !marcas[a.matricula]).map(a => [a.matricula, 'P' as const])))} disabled={!sinMarcar}
            className={`${boton} bg-emerald-600 text-white`}><CheckCheck className="w-4 h-4" /> {sinMarcar === alumnos.length ? 'Todos presentes' : `Presentes los ${sinMarcar} sin marcar`}</button>
          <button onClick={() => onDiario(fecha)} className={`${boton} border border-slate-300 text-slate-700`}><NotebookPen className="w-4 h-4" /> ¿Qué pasó en esta clase?</button>
          <span className="ml-auto text-sm text-slate-600">
            {cuenta.P} presentes · {cuenta.R} retardos · <b className="text-rose-700">{cuenta.F} faltas</b> · {cuenta.J} justificadas{sinMarcar ? ` · ${sinMarcar} sin marcar` : ''}
          </span>
        </div>
        <p className="text-xs text-slate-500">Lo más rápido: marca solo a quien faltó o llegó tarde, y luego "Presentes los sin marcar". Cada toque se guarda solo.</p>
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
          {alumnos.map((a, i) => {
            const actual = marcas[a.matricula];
            const r = resumirAsistencia(sesiones, a.matricula);
            return (
              <li key={a.matricula} className="flex flex-wrap items-center gap-2 p-2">
                <span className="text-[10px] text-slate-400 w-5 text-right">{i + 1}</span>
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{iniciales(a.nombre)}</span>
                <span className="flex-1 min-w-[160px]">{a.nombre}
                  {r.faltas > 0 && <span className={`ml-2 text-[11px] ${r.porcentaje !== null && r.porcentaje < 80 ? 'text-rose-700 font-semibold' : 'text-slate-400'}`}>{r.faltas} {r.faltas === 1 ? 'falta' : 'faltas'} · {r.porcentaje}%</span>}
                </span>
                <div className="flex gap-1">
                  {MARCAS.map(m => (
                    <button key={m.v} onClick={() => marcar({ [a.matricula]: actual === m.v ? null : m.v })} title={m.largo} aria-pressed={actual === m.v}
                      className={`text-xs px-3 py-2 rounded-lg border font-semibold ${actual === m.v ? m.activo : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {m.corto}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        {sesion && (confirmarBorrar
          ? <button onClick={async () => { try { await borrarSesion(grupoId, fecha); setConfirmarBorrar(false); } catch (e: any) { onError(e.message); } }} className={`${boton} bg-rose-600 text-white`}><Trash2 className="w-4 h-4" /> Sí, borrar la asistencia de este día</button>
          : <button onClick={() => setConfirmarBorrar(true)} className="text-xs text-rose-700">Borrar la asistencia de este día</button>)}
      </div>

      <aside className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Sesiones registradas ({sesiones.length})</h3>
        <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
          {[...sesiones].reverse().map(s => {
            const vals = Object.values(s.marcas);
            const faltas = vals.filter(v => v === 'F').length;
            return (
              <li key={s.fecha}>
                <button onClick={() => setFecha(s.fecha)} className={`w-full text-left text-sm p-2 rounded-lg border ${s.fecha === fecha ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                  {new Date(`${s.fecha}T12:00`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                  <span className="float-right text-xs text-slate-500">{faltas ? <span className="text-rose-700">{faltas} F</span> : 'completa'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
