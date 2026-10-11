import React, { useEffect, useState } from 'react';
import { Sparkles, Save, CheckCircle2 } from 'lucide-react';
import { AlumnoLista } from '../../src/features/grupos/model';
import { Sesion } from '../../src/features/evaluacion/modelo';
import { EntradaDiario, guardarDiario, hoy } from '../../src/features/clase/storage';
import { boton, input } from './ui';

const fechaLarga = (f: string) => new Date(`${f}T12:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Lo que pasó REALMENTE en cada clase, contado como a otro maestro. Es la
 * materia prima de los exámenes con IA y del diagnóstico de la próxima
 * planeación: así ambos salen de tu salón, no de un temario genérico.
 */
export default function Diario({ grupoId, diario, sesiones, alumnos, fechaInicial, onError, onExamen }: {
  grupoId: string; diario: EntradaDiario[]; sesiones: Sesion[]; alumnos: AlumnoLista[]; fechaInicial?: string;
  onError: (e: string) => void; onExamen: (descripcion: string) => void;
}) {
  const [fecha, setFecha] = useState(fechaInicial ?? hoy());
  const guardada = diario.find(d => d.fecha === fecha)?.texto ?? '';
  const [texto, setTexto] = useState(guardada);
  const [estado, setEstado] = useState<'' | 'guardando' | 'guardado'>('');
  const [elegidas, setElegidas] = useState<Set<string>>(new Set());

  // Al cambiar de fecha (o si llega lo guardado desde otro dispositivo), se carga ese día.
  useEffect(() => { setTexto(diario.find(d => d.fecha === fecha)?.texto ?? ''); setEstado(''); }, [fecha]);
  useEffect(() => { if (!estado) setTexto(guardada); }, [guardada]);

  const guardar = async () => {
    if (texto === guardada) return;
    setEstado('guardando');
    try { await guardarDiario(grupoId, fecha, texto); setEstado('guardado'); } catch (e: any) { onError(`No se guardó el diario: ${e.message}`); setEstado(''); }
  };

  const asistenciaDe = (f: string) => {
    const s = sesiones.find(x => x.fecha === f);
    if (!s) return '';
    const faltas = Object.values(s.marcas).filter(v => v === 'F').length;
    return `${alumnos.length - faltas} de ${alumnos.length} asistieron`;
  };
  const examenCon = (fechas: string[]) => {
    const t = diario.filter(d => fechas.includes(d.fecha)).sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map(d => (fechas.length > 1 ? `Clase del ${fechaLarga(d.fecha)}:\n${d.texto}` : d.texto)).join('\n\n');
    onExamen(t);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={fecha} onChange={async e => { await guardar(); setFecha(e.target.value); }} className="border border-slate-300 rounded-lg p-2 text-sm" aria-label="Fecha de la clase" />
          <span className="text-sm text-slate-600 capitalize">{fechaLarga(fecha)}</span>
          {asistenciaDe(fecha) && <span className="text-xs text-slate-500">· {asistenciaDe(fecha)}</span>}
        </div>
        <label className="block text-sm font-semibold text-slate-700">¿Qué pasó realmente en esta clase?
          <textarea className={`${input} h-64 mt-1 font-normal`} value={texto} onChange={e => { setTexto(e.target.value); setEstado(''); }} onBlur={guardar} maxLength={8000}
            placeholder={'Cuéntalo como se lo contarías a otro maestro:\n• qué temas se vieron de verdad y con qué ejemplos\n• qué actividad hicieron\n• qué se les dificultó, qué confusiones o errores notaste\n• quién participó, qué quedó pendiente\n\nCon esto la IA arma exámenes sobre lo que de verdad viste, y tu próxima planeación parte de aquí.'} />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={guardar} disabled={texto === guardada} className={`${boton} bg-indigo-600 text-white`}><Save className="w-4 h-4" /> Guardar</button>
          <button onClick={async () => { await guardar(); onExamen(texto); }} disabled={texto.trim().length < 40} className={`${boton} bg-violet-600 text-white`}
            title={texto.trim().length < 40 ? 'Escribe un poco más para que la IA tenga de dónde sacar preguntas' : ''}>
            <Sparkles className="w-4 h-4" /> Hacer examen de esta clase
          </button>
          {estado === 'guardando' && <span className="text-xs text-slate-500">Guardando…</span>}
          {estado === 'guardado' && <span className="text-xs text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Guardado</span>}
        </div>
      </section>

      <aside className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700 flex-1">Clases anteriores ({diario.length})</h3>
          {elegidas.size > 0 && (
            <button onClick={() => examenCon([...elegidas])} className={`${boton} bg-violet-600 text-white py-1 text-xs`}><Sparkles className="w-3 h-3" /> Examen de {elegidas.size} {elegidas.size === 1 ? 'clase' : 'clases'}</button>
          )}
        </div>
        {!diario.length && <p className="text-sm text-slate-500">Aquí se irán juntando tus clases. Marca varias para hacer un examen parcial de todas.</p>}
        <ul className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
          {diario.map(d => (
            <li key={d.fecha} className={`border rounded-xl p-3 text-sm bg-white ${d.fecha === fecha ? 'border-indigo-500' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <input type="checkbox" checked={elegidas.has(d.fecha)} aria-label={`Elegir la clase del ${d.fecha}`}
                  onChange={() => setElegidas(s => { const n = new Set(s); n.has(d.fecha) ? n.delete(d.fecha) : n.add(d.fecha); return n; })} />
                <button onClick={async () => { await guardar(); setFecha(d.fecha); }} className="font-semibold text-slate-800 capitalize hover:text-indigo-700">{fechaLarga(d.fecha)}</button>
              </div>
              <p className="text-slate-600 line-clamp-4 whitespace-pre-line">{d.texto}</p>
              {asistenciaDe(d.fecha) && <p className="text-[11px] text-slate-400 mt-1">{asistenciaDe(d.fecha)}</p>}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
