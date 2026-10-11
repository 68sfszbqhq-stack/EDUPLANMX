import React, { useState } from 'react';
import { X, ThumbsUp, AlertTriangle, StickyNote, Trash2, FileQuestion, HandHelping } from 'lucide-react';
import { AlumnoLista, Grupo, Resultado } from '../../src/features/grupos/model';
import { CATEGORIAS, Categoria, Columna, NotasAlumno, Sesion, calcularPromedio, resumirAsistencia, valorQueCuenta } from '../../src/features/evaluacion/modelo';
import { calificarParciales, detectarRiesgo } from '../../src/features/clase/modelo';
import { Anotacion, EstadoExamenes, TipoAnotacion, agregarAnotacion, borrarAnotacion, hoy } from '../../src/features/clase/storage';
import { ESTADOS } from './Cuaderno';
import { COLOR, boton, colorNota, iniciales } from './ui';

const TIPOS_ANOTACION: Record<TipoAnotacion, { nombre: string; Icono: React.ElementType; color: string }> = {
  positiva: { nombre: 'Positiva', Icono: ThumbsUp, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  atencion: { nombre: 'A atender', Icono: AlertTriangle, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  accion: { nombre: 'Acción de apoyo', Icono: HandHelping, color: 'text-sky-800 bg-sky-50 border-sky-200' },
  nota: { nombre: 'Nota', Icono: StickyNote, color: 'text-slate-700 bg-slate-50 border-slate-200' },
};

export default function FichaAlumno({ grupo, alumno, columnas, notas, sesiones, resultados, anotaciones, examenes, onAbrirExamen, onCerrar, onError }: {
  grupo: Grupo; alumno: AlumnoLista; columnas: Columna[]; notas?: NotasAlumno; sesiones: Sesion[]; resultados: Resultado[]; anotaciones: Anotacion[];
  examenes: EstadoExamenes; onAbrirExamen: (id: string) => void; onCerrar: () => void; onError: (e: string) => void;
}) {
  const [tipo, setTipo] = useState<TipoAnotacion>('nota');
  const [texto, setTexto] = useState('');
  if (!alumno) return null;
  const asis = resumirAsistencia(sesiones, alumno.matricula);
  const p = calcularPromedio(columnas, notas, !!grupo.vaciasCuentanCero, grupo.ponderacion, asis.porcentaje);
  const riesgo = detectarRiesgo(alumno, columnas, notas, sesiones, !!grupo.vaciasCuentanCero, grupo.ponderacion);
  const parciales = grupo.parciales ?? [];
  const cp = parciales.length ? calificarParciales(columnas, notas, sesiones, alumno.matricula, !!grupo.vaciasCuentanCero, grupo.ponderacion, parciales) : null;
  const faltasFechas = sesiones.filter(s => s.marcas[alumno.matricula] === 'F').map(s => s.fecha);
  const ordenadas = [...columnas].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const anotar = async () => {
    if (!texto.trim()) return;
    try { await agregarAnotacion(grupo.id, { matricula: alumno.matricula, fecha: hoy(), tipo, texto: texto.trim() }); setTexto(''); }
    catch (e: any) { onError(`No se guardó la anotación: ${e.message}`); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end" onMouseDown={e => e.target === e.currentTarget && onCerrar()} role="dialog" aria-label={`Ficha de ${alumno.nombre}`}>
      <aside className="w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto">
        <header className="p-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-white/20 font-bold flex items-center justify-center">{iniciales(alumno.nombre)}</span>
          <div className="flex-1">
            <h2 className="font-bold text-lg leading-tight">{alumno.nombre}</h2>
            <p className="text-xs text-white/80">{alumno.generada ? 'Clave' : 'Matrícula'}: <span className="font-mono">{alumno.matricula}</span> · {alumno.cuentaUid ? `Antología: ${alumno.cuentaCorreo || 'conectado'}` : 'aún no entra a Antología'}</p>
          </div>
          <button onClick={onCerrar} aria-label="Cerrar"><X className="w-5 h-5" /></button>
        </header>

        <div className="p-5 space-y-5">
          <section className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 text-center ${p.calificacion === null ? 'bg-slate-50' : colorNota(p.calificacion / 10)}`}>
              <span className="block text-3xl font-bold">{p.calificacion ?? '—'}</span><span className="text-xs">promedio{p.sinNota ? ` · ${p.sinNota} sin nota` : ''}</span>
            </div>
            <div className={`rounded-xl p-3 text-center ${asis.porcentaje === null ? 'bg-slate-50' : asis.porcentaje < 80 ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-900'}`}>
              <span className="block text-3xl font-bold">{asis.porcentaje === null ? '—' : `${asis.porcentaje}%`}</span>
              <span className="text-xs">asistencia · {asis.faltas} F · {asis.retardos} R · {asis.justificadas} J</span>
            </div>
          </section>
          {faltasFechas.length > 0 && <p className="text-xs text-slate-500 -mt-3">Faltó: {faltasFechas.map(f => f.slice(5).split('-').reverse().join('/')).join(', ')}</p>}

          {riesgo && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <p className="font-semibold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Requiere atención</p>
              <p>{riesgo.motivos.join(' · ')}</p>
              <p className="text-xs mt-1 text-rose-700">Registra abajo una <b>acción de apoyo</b> (plática, aviso a la familia, canalización): aparece en el documento de seguimiento.</p>
            </div>
          )}
          {cp && (
            <section className="flex flex-wrap gap-2 text-sm">
              {parciales.map((pa, i) => <span key={i} className={`px-2 py-1 rounded-lg ${cp.porParcial[i] === null ? 'bg-slate-50 text-slate-400' : colorNota(cp.porParcial[i]! / 10)}`}>{pa.nombre}: <b>{cp.porParcial[i] ?? '—'}</b></span>)}
              <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800">Final: <b>{cp.final ?? '—'}</b></span>
            </section>
          )}
          {Object.keys(p.porCategoria).length > 0 && (
            <section className="flex flex-wrap gap-1">
              {Object.entries(p.porCategoria).map(([c, v]) => (
                <span key={c} className={`text-xs px-2 py-1 rounded-full ${COLOR[CATEGORIAS[c as Categoria].color].chip}`}>{CATEGORIAS[c as Categoria].nombre}: {v === null ? '—' : `${v}%`}</span>
              ))}
            </section>
          )}

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Anotaciones</h3>
            <div className="flex gap-1">
              {(Object.keys(TIPOS_ANOTACION) as TipoAnotacion[]).map(t => {
                const { nombre, Icono } = TIPOS_ANOTACION[t];
                return <button key={t} onClick={() => setTipo(t)} className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${tipo === t ? TIPOS_ANOTACION[t].color + ' ring-1 ring-current' : 'border-slate-200 text-slate-500'}`}><Icono className="w-3 h-3" />{nombre}</button>;
              })}
            </div>
            <div className="flex gap-2">
              <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === 'Enter' && anotar()} maxLength={1000}
                placeholder="Ej.: explicó a su equipo cómo instalar la app" className="flex-1 border border-slate-300 rounded-lg p-2 text-sm" />
              <button onClick={anotar} disabled={!texto.trim()} className={`${boton} bg-indigo-600 text-white`}>Anotar</button>
            </div>
            <ul className="space-y-1">
              {anotaciones.map(a => {
                const { Icono, color } = TIPOS_ANOTACION[a.tipo];
                return (
                  <li key={a.id} className={`text-sm border rounded-lg p-2 flex gap-2 ${color}`}>
                    <Icono className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{a.texto}<span className="block text-[10px] opacity-70">{a.fecha}</span></span>
                    <button onClick={() => borrarAnotacion(grupo.id, a.id).catch(e => onError(e.message))} title="Borrar" className="opacity-50 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-700">Actividades ({columnas.length})</h3>
            <ul className="divide-y divide-slate-100 text-sm">
              {ordenadas.map(c => {
                const v = notas?.valores[c.id], e = notas?.estados[c.id], com = notas?.comentarios[c.id];
                const cuenta = valorQueCuenta(c, notas, false);
                const ex = examenes.porColumna[c.id];
                const revisar = examenes.porRevisar[c.id]?.includes(alumno.matricula);
                return (
                  <li key={c.id} className="py-1.5 flex items-center gap-2">
                    <span className={`w-1.5 h-6 rounded-full ${COLOR[CATEGORIAS[c.tipo].color].punto}`} />
                    <span className="flex-1">{c.nombre}<span className="block text-[11px] text-slate-400">{c.fecha}{com ? ` · “${com}”` : ''}</span></span>
                    {ex && <button onClick={() => onAbrirExamen(ex.id)} title="Ver su examen" className="text-violet-600"><FileQuestion className="w-4 h-4" /></button>}
                    <span className={`min-w-[56px] text-center rounded px-1.5 py-0.5 text-xs font-semibold ${revisar ? 'bg-amber-50 text-amber-800' : colorNota(cuenta === null ? null : cuenta / c.max)}`}>
                      {revisar ? 'por revisar' : e === 'exento' ? 'EX' : e === 'no-entregado' ? '✗ 0' : typeof v === 'number' ? `${v}/${c.max}` : e ? ESTADOS.find(x => x.v === e)?.icono : '—'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {resultados.length > 0 && (
            <section className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700">Antología</h3>
              {resultados.map(r => (
                <div key={r.instrumento} className="text-sm">
                  <div className="flex justify-between"><span>{r.titulo}</span><b>{r.porcentaje}%</b></div>
                  <ul className="text-xs text-slate-500 ml-2">
                    {Object.entries(r.porEje ?? {}).map(([eje, x]) => <li key={eje}>{eje}: {x.ok}/{x.total}</li>)}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
