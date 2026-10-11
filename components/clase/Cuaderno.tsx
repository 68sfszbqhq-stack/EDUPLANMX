import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, Download, Sparkles, Trash2, ClipboardCheck, Scale, Search, CalendarCheck, FileQuestion, PenLine, Hourglass, MessageSquare, CalendarRange, AlertTriangle } from 'lucide-react';
import { AlumnoLista, Grupo, Resultado } from '../../src/features/grupos/model';
import {
  CATEGORIAS, Categoria, Columna, EstadoEntrega, NotasAlumno, Ponderacion, Rubrica, Sesion, TipoColumna,
  calcularPromedio, csvCuaderno, puntosDeRubrica, redondea, resumirAsistencia, valorQueCuenta,
} from '../../src/features/evaluacion/modelo';
import { borrarColumna, guardarCasilla, guardarColumna, guardarVaciasCuentanCero, rellenarColumna } from '../../src/features/evaluacion/storage';
import { EstadoExamenes, guardarParciales, guardarPonderacion, hoy } from '../../src/features/clase/storage';
import { Parcial, calificarParciales, detectarRiesgo, enParcial, parcialDe } from '../../src/features/clase/modelo';
import { generarRubrica } from '../../src/features/evaluacion/ia';
import { COLOR, Panel, boton, colorNota, iniciales, input } from './ui';

export const ESTADOS: { v: EstadoEntrega; icono: string; largo: string; tecla: string }[] = [
  { v: 'entregado', icono: '✓', largo: 'Entregó', tecla: 'v' },
  { v: 'tarde', icono: '⏰', largo: 'Tarde', tecla: 't' },
  { v: 'no-entregado', icono: '✗', largo: 'No entregó (cuenta 0)', tecla: 'x' },
  { v: 'ausente', icono: 'A', largo: 'Ausente', tecla: 'a' },
  { v: 'exento', icono: 'EX', largo: 'Exento (no cuenta)', tecla: 'e' },
];
const TIPOS = Object.fromEntries(Object.entries(CATEGORIAS).filter(([k]) => k !== 'asistencia')) as Record<TipoColumna, { nombre: string; color: string }>;
const fechaCorta = (f: string) => { const [, m, d] = f.split('-'); return d && m ? `${Number(d)}/${Number(m)}` : ''; };
type Filtro = 'todo' | TipoColumna | 'antologia';

interface Props {
  grupo: Grupo; alumnos: AlumnoLista[]; columnas: Columna[]; notas: Record<string, NotasAlumno>; sesiones: Sesion[]; resultados: Resultado[]; examenes: EstadoExamenes;
  onGrupo: (g: Grupo) => void; onFicha: (m: string) => void; onAbrirExamen: (id: string) => void; onNuevoExamen: () => void; onPasarLista: () => void;
  onError: (e: string) => void; onAviso: (t: string) => void;
}

export default function Cuaderno({ grupo, alumnos, columnas: todas, notas, sesiones: todasSesiones, resultados, examenes, onGrupo, onFicha, onAbrirExamen, onNuevoExamen, onPasarLista, onError, onAviso }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todo');
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<Columna | 'nueva' | null>(null);
  const [celda, setCelda] = useState<{ m: string; col: string } | null>(null);
  const [rubrica, setRubrica] = useState<{ col: Columna; m: string } | null>(null);
  const [ponderando, setPonderando] = useState(false);
  const [configParciales, setConfigParciales] = useState(false);
  const parciales = grupo.parciales ?? [];
  // Parcial a la vista: al abrir, el que corresponde a hoy.
  const [parcial, setParcial] = useState<number | null>(() => { const i = parcialDe(hoy(), grupo.parciales); return i >= 0 ? i : null; });
  const vaciasCero = !!grupo.vaciasCuentanCero;

  const columnas = useMemo(() => enParcial([...todas].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.orden - b.orden), parciales, parcial), [todas, parciales, parcial]);
  const sesiones = useMemo(() => enParcial(todasSesiones, parciales, parcial), [todasSesiones, parciales, parcial]);
  // Con parciales y "todo el semestre", el promedio es el de los parciales (como se reporta).
  const promedioDe = (m: string, asis: number | null) => parcial === null && parciales.length
    ? { calificacion: calificarParciales(todas, notas[m], todasSesiones, m, vaciasCero, grupo.ponderacion, parciales).final, sinNota: 0 }
    : calcularPromedio(columnas, notas[m], vaciasCero, grupo.ponderacion, asis);
  const visibles = filtro === 'todo' ? columnas : columnas.filter(c => c.tipo === filtro);
  // Antología: una columna por diagnóstico, que se llena sola cuando el alumno contesta.
  const antologia = useMemo(() => {
    const m = new Map<string, { titulo: string; por: Record<string, number> }>();
    for (const r of resultados) {
      const x = m.get(r.instrumento) ?? { titulo: r.titulo, por: {} };
      x.por[r.matricula] = r.porcentaje; m.set(r.instrumento, x);
    }
    return [...m].sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true }));
  }, [resultados]);
  const verAntologia = filtro === 'todo' || filtro === 'antologia';
  const filas = useMemo(() => {
    const q = busca.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    return q ? alumnos.filter(a => a.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(q)) : alumnos;
  }, [alumnos, busca]);
  const categoriasUsadas = useMemo(() => [...new Set(columnas.map(c => c.tipo))], [columnas]);
  const ponderada = Object.values(grupo.ponderacion ?? {}).some(w => (w ?? 0) > 0);

  const exportar = () => {
    const csv = csvCuaderno(columnas, alumnos, notas, vaciasCero, grupo.ponderacion, sesiones);
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `${grupo.nombre} - ${grupo.asignaturaNombre}.csv` });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const alternarVacias = async (v: boolean) => {
    onGrupo({ ...grupo, vaciasCuentanCero: v });
    try { await guardarVaciasCuentanCero(grupo.id, v); } catch (e: any) { onError(e.message); }
  };

  // Navegación de la captura: Enter baja al siguiente alumno; Tab pasa a la siguiente columna.
  const editables = visibles.filter(c => !c.rubrica);
  const mover = (m: string, col: string, dFila: number, dCol: number) => {
    const i = filas.findIndex(a => a.matricula === m), j = editables.findIndex(c => c.id === col);
    const ni = i + dFila, nj = j + dCol;
    if (ni < 0 || ni >= filas.length || nj < 0 || nj >= editables.length) return setCelda(null);
    setCelda({ m: filas[ni].matricula, col: editables[nj].id });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setEditando('nueva')} className={`${boton} bg-indigo-600 text-white`}><Plus className="w-4 h-4" /> Actividad</button>
        <button onClick={onNuevoExamen} className={`${boton} bg-violet-600 text-white`}><Sparkles className="w-4 h-4" /> Examen con IA</button>
        <button onClick={onPasarLista} className={`${boton} border border-slate-300 text-slate-700`}><CalendarCheck className="w-4 h-4" /> Pasar lista</button>
        <button onClick={() => setPonderando(true)} className={`${boton} border border-slate-300 text-slate-700`} title="Cuánto vale cada tipo de actividad en el promedio">
          <Scale className="w-4 h-4" /> {ponderada ? Object.entries(grupo.ponderacion!).filter(([, w]) => w).map(([c, w]) => `${CATEGORIAS[c as Categoria].nombre} ${w}%`).join(' · ') : 'Ponderación'}
        </button>
        <button onClick={() => setConfigParciales(true)} className={`${boton} border border-slate-300 text-slate-700`} title="Fechas de cada parcial"><CalendarRange className="w-4 h-4" /> Parciales</button>
        <button onClick={exportar} disabled={!columnas.length} className={`${boton} border border-slate-300 text-slate-700`}><Download className="w-4 h-4" /> Excel</button>
        <label className="ml-auto relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar alumno" className="border border-slate-300 rounded-lg py-2 pl-7 pr-2 text-sm w-44" />
        </label>
      </div>

      {parciales.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-sm">
          {[null, ...parciales.map((_, i) => i)].map(i => (
            <button key={String(i)} onClick={() => setParcial(i)}
              className={`px-3 py-1 rounded-lg font-semibold ${parcial === i ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {i === null ? 'Semestre' : parciales[i].nombre}
            </button>
          ))}
        </div>
      )}
      {(categoriasUsadas.length > 1 || antologia.length > 0) && (
        <div className="flex flex-wrap gap-1 text-xs">
          {(['todo', ...categoriasUsadas, ...(antologia.length ? ['antologia'] : [])] as Filtro[]).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-2.5 py-1 rounded-full border ${filtro === f ? 'border-slate-800 bg-slate-800 text-white' : `border-transparent ${f === 'todo' ? 'bg-slate-100 text-slate-700' : f === 'antologia' ? COLOR.fuchsia.chip : COLOR[TIPOS[f as TipoColumna].color].chip}`}`}>
              {f === 'todo' ? 'Todo' : f === 'antologia' ? 'Antología' : TIPOS[f as TipoColumna].nombre}
            </button>
          ))}
        </div>
      )}

      {!alumnos.length ? (
        <p className="text-slate-600 text-sm py-8 text-center">Esta clase no tiene alumnos. Agrégalos en la pestaña <b>Alumnos</b>: pega los nombres desde Excel.</p>
      ) : (
        <div className="overflow-auto border border-slate-200 rounded-xl max-h-[70vh] bg-white">
          <table className="text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-30 bg-slate-50 text-left p-2 min-w-[220px] border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-normal">{alumnos.length} alumnos</span>
                </th>
                {visibles.map(c => {
                  const ex = examenes.porColumna[c.id];
                  const revisar = examenes.porRevisar[c.id]?.length ?? 0;
                  return (
                    <th key={c.id} className={`p-0 min-w-[84px] max-w-[120px] align-bottom border-b border-slate-200 border-t-4 ${COLOR[TIPOS[c.tipo].color].banda}`}>
                      <button onClick={() => setEditando(c)} className="w-full text-left p-2 hover:bg-white" title={`${c.nombre} — clic para editar`}>
                        <span className="block font-semibold text-xs leading-tight line-clamp-2">{c.nombre}</span>
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                          {fechaCorta(c.fecha)} · /{c.max}{c.peso > 0 ? ` · ×${c.peso}` : ''}
                          {c.rubrica && <ClipboardCheck className="inline w-3 h-3 ml-0.5" />}
                          {ex && <FileQuestion className="inline w-3 h-3 ml-0.5" />}
                        </span>
                        {ex && <span className={`block text-[10px] font-normal ${ex.estado === 'abierto' ? 'text-emerald-700' : 'text-slate-500'}`}>{ex.estado === 'abierto' ? '● abierto' : 'cerrado'}{revisar ? ` · ${revisar} por revisar` : ''}</span>}
                      </button>
                    </th>
                  );
                })}
                {verAntologia && antologia.map(([id, a]) => (
                  <th key={id} className="p-2 min-w-[84px] align-bottom border-b border-slate-200 border-t-4 border-t-fuchsia-500 text-left" title="Llega sola desde Antología">
                    <span className="block font-semibold text-xs">{a.titulo}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Antología · %</span>
                  </th>
                ))}
                <th className="p-2 min-w-[70px] align-bottom border-b border-slate-200 border-t-4 border-t-violet-500 text-xs">Asist.</th>
                <th className="sticky right-0 z-30 p-2 min-w-[80px] align-bottom border-b border-slate-200 border-t-4 border-t-indigo-600 bg-indigo-50 text-xs">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((a, i) => {
                const n = notas[a.matricula];
                const asis = resumirAsistencia(sesiones, a.matricula);
                const p = promedioDe(a.matricula, asis.porcentaje);
                const riesgo = detectarRiesgo(a, columnas, n, sesiones, vaciasCero, grupo.ponderacion);
                return (
                  <tr key={a.matricula} className="group">
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-1.5 border-b border-slate-100">
                      <button onClick={() => onFicha(a.matricula)} className="flex items-center gap-2 text-left w-full" title="Ver la ficha del alumno">
                        <span className="text-[10px] text-slate-400 w-5 text-right">{i + 1}</span>
                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">{iniciales(a.nombre)}</span>
                        <span className="truncate hover:text-indigo-700">{a.nombre}</span>
                        {riesgo && <span title={`Requiere atención: ${riesgo.motivos.join(' · ')}`} className="shrink-0 text-rose-600"><AlertTriangle className="w-3.5 h-3.5" /></span>}
                      </button>
                    </td>
                    {visibles.map(c => (
                      <Casilla key={c.id} col={c} n={n} m={a.matricula} activa={celda?.m === a.matricula && celda.col === c.id}
                        revisar={examenes.porRevisar[c.id]?.includes(a.matricula)} enCurso={examenes.enCurso[c.id]?.includes(a.matricula)}
                        onClick={() => {
                          const ex = examenes.porColumna[c.id];
                          if (ex && (examenes.porRevisar[c.id]?.includes(a.matricula) || examenes.enCurso[c.id]?.includes(a.matricula))) return onAbrirExamen(ex.id);
                          if (c.rubrica) return setRubrica({ col: c, m: a.matricula });
                          setCelda({ m: a.matricula, col: c.id });
                        }} />
                    ))}
                    {verAntologia && antologia.map(([id, x]) => {
                      const v = x.por[a.matricula];
                      return <td key={id} className={`text-center border-b border-l border-slate-100 text-xs ${v === undefined ? 'text-slate-300' : colorNota(v / 100)}`}>{v === undefined ? '—' : `${v}%`}</td>;
                    })}
                    <td className={`text-center border-b border-l border-slate-100 text-xs ${asis.porcentaje === null ? 'text-slate-300' : asis.porcentaje < 80 ? 'text-rose-700 font-semibold' : 'text-slate-700'}`}
                      title={`${asis.presentes} asistencias · ${asis.retardos} retardos · ${asis.faltas} faltas · ${asis.justificadas} justificadas`}>
                      {asis.porcentaje === null ? '—' : `${asis.porcentaje}%`}
                    </td>
                    <td className={`sticky right-0 z-10 text-center border-b border-l border-slate-200 font-bold ${p.calificacion === null ? 'bg-indigo-50 text-slate-400' : `${colorNota(p.calificacion / 10)}`}`}>
                      {p.calificacion ?? '—'}
                      {p.sinNota > 0 && !vaciasCero && <span className="block text-[9px] font-normal text-slate-500">{p.sinNota} sin nota</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-20">
              <tr className="bg-slate-50 text-xs text-slate-600">
                <td className="sticky left-0 z-30 bg-slate-50 p-2 border-t border-slate-200 font-semibold">Promedio del grupo</td>
                {visibles.map(c => {
                  const vs = alumnos.map(a => valorQueCuenta(c, notas[a.matricula], false)).filter((v): v is number => v !== null);
                  return <td key={c.id} className="text-center border-t border-slate-200">{vs.length ? redondea(vs.reduce((s, v) => s + v, 0) / vs.length) : ''}</td>;
                })}
                {verAntologia && antologia.map(([id, x]) => {
                  const vs = Object.values(x.por);
                  return <td key={id} className="text-center border-t border-slate-200">{vs.length ? `${Math.round(vs.reduce((s, v) => s + v, 0) / vs.length)}%` : ''}</td>;
                })}
                <td className="border-t border-slate-200" />
                <td className="sticky right-0 bg-indigo-50 border-t border-slate-200 text-center font-bold">
                  {(() => { const ps = alumnos.map(a => promedioDe(a.matricula, resumirAsistencia(sesiones, a.matricula).porcentaje).calificacion).filter((x): x is number => x !== null); return ps.length ? redondea(ps.reduce((s, x) => s + x, 0) / ps.length) : ''; })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span>Clic en una casilla para calificar. <b>Enter</b> guarda y baja · <b>Tab</b> siguiente columna · <b>x</b> no entregó · <b>e</b> exento · <b>t</b> tarde · <b>a</b> ausente.</span>
        <label className="flex items-center gap-1.5 ml-auto" title="Al cerrar el periodo: lo que no tiene nota cuenta como 0">
          <input type="checkbox" checked={vaciasCero} onChange={e => alternarVacias(e.target.checked)} /> Cerrar periodo (vacías cuentan 0)
        </label>
      </div>
      {!columnas.length && alumnos.length > 0 && (
        <p className="text-slate-600 text-sm">Agrega tu primera actividad con <b>+ Actividad</b>, o crea un <b>examen con IA</b>: su columna aparece sola y se llena cuando tus alumnos lo contestan. Una casilla vacía es "aún no lo califico": no baja el promedio.</p>
      )}

      {celda && (() => {
        const col = columnas.find(c => c.id === celda.col), al = alumnos.find(a => a.matricula === celda.m);
        if (!col || !al) return null;
        return <EditorCasilla key={`${celda.m}|${celda.col}`} col={col} alumno={al} n={notas[celda.m]}
          onGuardar={async cambios => { try { await guardarCasilla(grupo.id, celda.m, celda.col, cambios); } catch (e: any) { onError(`No se guardó la nota: ${e.message}`); } }}
          onMover={(df, dc) => mover(celda.m, celda.col, df, dc)} onCerrar={() => setCelda(null)} onError={onError} />;
      })()}
      {editando && (
        <EditorColumna grupo={grupo} columna={editando === 'nueva' ? null : editando} orden={columnas.length} alumnos={alumnos} notas={notas}
          examenId={editando !== 'nueva' ? examenes.porColumna[editando.id]?.id : undefined}
          onAbrirExamen={onAbrirExamen} onCerrar={() => setEditando(null)} onError={onError} onAviso={onAviso} />
      )}
      {rubrica && (
        <CalificarConRubrica col={rubrica.col} alumno={alumnos.find(a => a.matricula === rubrica.m)!}
          elegidos={notas[rubrica.m]?.rubricas[rubrica.col.id] ?? {}}
          onGuardar={async elegidos => {
            const valor = puntosDeRubrica(rubrica.col.rubrica!, elegidos, rubrica.col.max);
            try { await guardarCasilla(grupo.id, rubrica.m, rubrica.col.id, { rubrica: elegidos, valor }); } catch (e: any) { onError(e.message); }
            // Siguiente alumno con la misma rúbrica, para calificar de corrido.
            const i = filas.findIndex(a => a.matricula === rubrica.m);
            setRubrica(i + 1 < filas.length ? { col: rubrica.col, m: filas[i + 1].matricula } : null);
          }}
          onCerrar={() => setRubrica(null)} />
      )}
      {configParciales && <EditorParciales grupo={grupo} onGuardado={ps => { onGrupo({ ...grupo, parciales: ps }); setConfigParciales(false); const i = parcialDe(hoy(), ps); setParcial(i >= 0 ? i : null); }} onCerrar={() => setConfigParciales(false)} onError={onError} />}
      {ponderando && <EditorPonderacion grupo={grupo} onGuardado={p => { onGrupo({ ...grupo, ponderacion: p }); setPonderando(false); }} onCerrar={() => setPonderando(false)} onError={onError} />}
    </div>
  );
}

function Casilla({ col, n, m, activa, revisar, enCurso, onClick }: { col: Columna; n?: NotasAlumno; m: string; activa: boolean; revisar?: boolean; enCurso?: boolean; onClick: () => void }) {
  const estado = n?.estados[col.id];
  const valor = n?.valores[col.id];
  const comentario = n?.comentarios[col.id];
  const e = ESTADOS.find(x => x.v === estado);
  const cuenta = valorQueCuenta(col, n, false);
  let contenido: React.ReactNode = <span className="text-slate-300">·</span>;
  let color = '';
  if (revisar) { contenido = <span className="flex items-center justify-center gap-0.5 text-amber-700"><PenLine className="w-3 h-3" />revisar</span>; color = 'bg-amber-50'; }
  else if (enCurso) { contenido = <span className="flex items-center justify-center gap-0.5 text-sky-700"><Hourglass className="w-3 h-3" />…</span>; color = 'bg-sky-50'; }
  else if (estado === 'exento') { contenido = <span className="text-slate-500 font-semibold">EX</span>; color = 'bg-slate-100'; }
  else if (estado === 'no-entregado') { contenido = <span className="font-semibold">✗ 0</span>; color = 'bg-rose-100 text-rose-800'; }
  else if (estado === 'ausente' && valor === undefined) { contenido = <span className="text-slate-500">A</span>; }
  else if (typeof valor === 'number') { contenido = <>{valor}{estado === 'tarde' && <span className="text-[9px] ml-0.5" title="Entregó tarde">⏰</span>}</>; color = colorNota(cuenta === null ? null : cuenta / col.max); }
  else if (e) { contenido = <span className="text-emerald-700">{e.icono}</span>; }
  return (
    <td data-celda={`${m}|${col.id}`} className={`p-0 border-b border-l border-slate-100 ${color} ${activa ? 'ring-2 ring-inset ring-indigo-500' : ''}`}>
      <button onClick={onClick} className="w-full h-9 px-1 text-center hover:ring-1 hover:ring-inset hover:ring-indigo-300 relative" title={comentario || undefined}>
        {contenido}
        {comentario && <MessageSquare className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-slate-400" />}
      </button>
    </td>
  );
}

/** Ventanita para calificar una casilla. Pensada para capturar con el teclado, de corrido. */
function EditorCasilla({ col, alumno, n, onGuardar, onMover, onCerrar, onError }: {
  col: Columna; alumno: AlumnoLista; n?: NotasAlumno;
  onGuardar: (c: Parameters<typeof guardarCasilla>[3]) => Promise<void>; onMover: (dFila: number, dCol: number) => void; onCerrar: () => void; onError: (e: string) => void;
}) {
  const valorPrevio = n?.valores[col.id];
  const estadoPrevio = n?.estados[col.id] ?? null;
  const comentarioPrevio = n?.comentarios[col.id] ?? '';
  const [texto, setTexto] = useState(valorPrevio === undefined ? '' : String(valorPrevio));
  const [estado, setEstado] = useState<EstadoEntrega | null>(estadoPrevio);
  const [comentario, setComentario] = useState(comentarioPrevio);
  const [verComentario, setVerComentario] = useState(!!comentarioPrevio);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const el = document.querySelector(`[data-celda="${alumno.matricula}|${col.id}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = el?.getBoundingClientRect();
    if (r) setPos({ top: Math.min(r.bottom + 4, window.innerHeight - 230), left: Math.max(8, Math.min(r.left, window.innerWidth - 330)) });
  }, [alumno.matricula, col.id]);
  // El cuadro existe hasta que ya hay posición: se enfoca entonces, para capturar sin tocar el ratón.
  useLayoutEffect(() => { if (pos) { ref.current?.focus(); ref.current?.select(); } }, [!!pos]);

  const guardar = async (est: EstadoEntrega | null = estado): Promise<boolean> => {
    const t = texto.trim().replace(',', '.');
    const num = t === '' ? null : Number(t);
    if (num !== null && (!Number.isFinite(num) || num < 0 || num > col.max)) { onError(`La nota de "${col.nombre}" va de 0 a ${col.max}.`); return false; }
    const cambios: Parameters<typeof guardarCasilla>[3] = {};
    if (num !== (valorPrevio ?? null)) cambios.valor = num;
    // Poner una nota sin marcar entrega cuenta como "entregó".
    const estFinal = est ?? (num !== null && !estadoPrevio ? 'entregado' : est);
    if (estFinal !== estadoPrevio) cambios.estado = estFinal;
    if (comentario.trim() !== comentarioPrevio) cambios.comentario = comentario.trim();
    if (Object.keys(cambios).length) await onGuardar(cambios);
    return true;
  };

  const tecla = async (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onCerrar();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (await guardar()) e.key === 'Enter' ? onMover(e.shiftKey ? -1 : 1, 0) : onMover(0, e.shiftKey ? -1 : 1);
      return;
    }
    const atajo = ESTADOS.find(x => x.tecla === e.key.toLowerCase());
    if (atajo && !e.metaKey && !e.ctrlKey && e.target === ref.current) {
      e.preventDefault();
      if (await guardar(atajo.v)) onMover(1, 0);
    }
  };

  if (!pos) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onMouseDown={async () => { await guardar(); onCerrar(); }} />
      <div className="fixed z-50 w-[320px] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 space-y-2" style={pos} onKeyDown={tecla} role="dialog" aria-label={`Calificar ${alumno.nombre}`}>
        <p className="text-xs text-slate-500 truncate"><b className="text-slate-800">{alumno.nombre}</b> · {col.nombre}</p>
        <div className="flex items-center gap-2">
          <input ref={ref} value={texto} onChange={e => setTexto(e.target.value.replace(/[^\d.,]/g, ''))} inputMode="decimal"
            className="w-20 border-2 border-indigo-400 rounded-lg p-1.5 text-center text-lg font-bold" aria-label="Nota" />
          <span className="text-slate-500">/ {col.max}</span>
          <div className="ml-auto flex gap-1">
            {[col.max, redondea(col.max * 0.8), redondea(col.max * 0.6)].map(v => (
              <button key={v} onClick={() => setTexto(String(v))} className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">{v}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {ESTADOS.map(x => (
            <button key={x.v} onClick={() => setEstado(estado === x.v ? null : x.v)} title={`${x.largo} (tecla ${x.tecla})`}
              className={`text-xs px-2 py-1 rounded-full border ${estado === x.v ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-700'}`}>
              {x.icono} {x.largo.split(' (')[0]}
            </button>
          ))}
        </div>
        {verComentario
          ? <input value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Comentario (solo tú lo ves)" className={input} maxLength={300} />
          : <button onClick={() => setVerComentario(true)} className="text-xs text-slate-500 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Agregar comentario</button>}
        <div className="flex gap-2 pt-1">
          <button onClick={async () => { if (await guardar()) onMover(1, 0); }} className={`${boton} bg-indigo-600 text-white py-1.5`}>Guardar ↵</button>
          <button onClick={async () => { setTexto(''); setEstado(null); await onGuardar({ valor: null, estado: null }); onCerrar(); }} className="text-xs text-slate-500 ml-auto">Vaciar casilla</button>
        </div>
      </div>
    </>
  );
}

function EditorColumna({ grupo, columna, orden, alumnos, notas, examenId, onAbrirExamen, onCerrar, onError, onAviso }: {
  grupo: Grupo; columna: Columna | null; orden: number; alumnos: AlumnoLista[]; notas: Record<string, NotasAlumno>; examenId?: string;
  onAbrirExamen: (id: string) => void; onCerrar: () => void; onError: (e: string) => void; onAviso: (t: string) => void;
}) {
  const [c, setC] = useState<Omit<Columna, 'id'> & { id?: string }>(columna ?? { nombre: '', tipo: 'tarea', max: 10, peso: 0, fecha: hoy(), orden, rubrica: null, examenId: '' });
  const [descripcion, setDescripcion] = useState('');
  const [generando, setGenerando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);
  const vacios = columna ? alumnos.filter(a => notas[a.matricula]?.valores[columna.id] === undefined && !notas[a.matricula]?.estados[columna.id]).map(a => a.matricula) : [];

  const conRubrica = async () => {
    if (!descripcion.trim()) return onError('Describe la actividad para que la IA proponga la rúbrica.');
    setGenerando(true);
    try { setC({ ...c, rubrica: await generarRubrica(grupo.asignaturaNombre, `${c.nombre}\n${descripcion}`) }); }
    catch (e: any) { onError(e.message); } finally { setGenerando(false); }
  };
  const guardar = async () => {
    if (!c.nombre.trim()) return onError('Ponle nombre a la actividad.');
    setGuardando(true);
    try { await guardarColumna(grupo.id, { ...c, nombre: c.nombre.trim() }); onCerrar(); }
    catch (e: any) { onError(`No se guardó la actividad: ${e.message}`); } finally { setGuardando(false); }
  };
  const rellenar = async (cambios: { valor?: number; estado?: EstadoEntrega }, texto: string) => {
    try { await rellenarColumna(grupo.id, columna!.id, vacios, cambios); onAviso(`${texto}: ${vacios.length} alumnos.`); onCerrar(); }
    catch (e: any) { onError(e.message); }
  };
  const editarNivel = (ci: number, ni: number, descriptor: string) => {
    const r: Rubrica = JSON.parse(JSON.stringify(c.rubrica));
    r.criterios[ci].niveles[ni].descriptor = descriptor; setC({ ...c, rubrica: r });
  };

  return (
    <Panel titulo={columna ? c.nombre || 'Actividad' : 'Nueva actividad'} onCerrar={onCerrar}>
      {examenId && (
        <button onClick={() => { onCerrar(); onAbrirExamen(examenId); }} className={`${boton} bg-violet-50 text-violet-800 w-full justify-center`}><FileQuestion className="w-4 h-4" /> Ver el examen, sus resultados y calificar lo escrito</button>
      )}
      <div className="grid sm:grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Nombre<input className={input} value={c.nombre} onChange={e => setC({ ...c, nombre: e.target.value })} maxLength={80} placeholder="Infografía: licencias de software" autoFocus={!columna} /></label>
        <div className="sm:col-span-2">
          <span className="text-xs font-semibold text-slate-600">Tipo</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {(Object.keys(TIPOS) as TipoColumna[]).map(t => (
              <button key={t} onClick={() => setC({ ...c, tipo: t })} className={`text-xs px-3 py-1.5 rounded-full ${c.tipo === t ? 'ring-2 ring-slate-800 ' : ''}${COLOR[TIPOS[t].color].chip}`}>{TIPOS[t].nombre}</button>
            ))}
          </div>
        </div>
        <label className="text-xs font-semibold text-slate-600">Fecha<input type="date" className={input} value={c.fecha} onChange={e => setC({ ...c, fecha: e.target.value })} /></label>
        <label className="text-xs font-semibold text-slate-600">Se califica sobre<input type="number" min={1} className={input} value={c.max} onChange={e => setC({ ...c, max: Number(e.target.value) || 1 })} /></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">¿Vale más que otras de su tipo? (1 = normal, 2 = doble…)
          <input type="number" min={0} max={100} className={input} value={c.peso || 1} onChange={e => { const v = Math.min(100, Math.max(1, Number(e.target.value) || 1)); setC({ ...c, peso: v === 1 ? 0 : v }); }} />
        </label>
      </div>

      {columna && vacios.length > 0 && (
        <div className="border-t pt-3 space-y-1">
          <p className="text-sm font-semibold text-slate-700">Rellenar a los {vacios.length} que aún no tienen nada</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => rellenar({ estado: 'entregado' }, 'Marcados como entregado')} className={`${boton} border border-slate-300 text-slate-700`}>✓ Todos entregaron</button>
            <button onClick={() => rellenar({ valor: c.max, estado: 'entregado' }, `Con ${c.max}`)} className={`${boton} border border-slate-300 text-slate-700`}>Poner {c.max}</button>
            <button onClick={() => rellenar({ estado: 'no-entregado' }, 'Marcados como no entregó')} className={`${boton} border border-rose-200 text-rose-700`}>✗ No entregaron</button>
          </div>
        </div>
      )}

      <div className="border-t pt-3 space-y-2">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Rúbrica (opcional)</p>
        {!c.rubrica ? (
          <>
            <textarea className={`${input} h-20`} value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe la actividad: qué entregan, qué debe demostrar, en qué formato. Ej.: infografía en equipo que compare 3 tipos de licencia con ejemplos de apps que usan." />
            <button onClick={conRubrica} disabled={generando} className={`${boton} bg-violet-600 text-white`}><Sparkles className="w-4 h-4" /> {generando ? 'Claude está armando la rúbrica… (1-2 min)' : 'Proponer rúbrica con IA'}</button>
          </>
        ) : (
          <>
            <div className="overflow-x-auto"><table className="text-xs w-full">
              <thead><tr><th className="text-left p-1">Criterio</th>{c.rubrica.criterios[0]?.niveles.map((n, i) => <th key={i} className="p-1">{n.nombre} ({n.puntos})</th>)}</tr></thead>
              <tbody>{c.rubrica.criterios.map((cr, ci) => (
                <tr key={cr.id} className="border-t align-top"><td className="p-1 font-semibold">{cr.nombre}<span className="block font-normal text-slate-500">{cr.peso}%</span></td>
                  {cr.niveles.map((n, ni) => <td key={ni} className="p-1"><textarea className="w-full border border-slate-200 rounded p-1 h-20" value={n.descriptor} onChange={e => editarNivel(ci, ni, e.target.value)} /></td>)}</tr>
              ))}</tbody>
            </table></div>
            <p className="text-xs text-slate-500">Puedes editar cada descriptor. Al calificar, eliges el nivel de cada criterio y la nota sale sola.</p>
            <button onClick={() => setC({ ...c, rubrica: null })} className="text-xs text-rose-700">Quitar la rúbrica</button>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <button onClick={guardar} disabled={guardando} className={`${boton} bg-indigo-600 text-white`}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={onCerrar} className={`${boton} text-slate-600`}>Cancelar</button>
        {columna && !examenId && (confirmarBorrar
          ? <button onClick={async () => { try { await borrarColumna(grupo.id, columna.id, alumnos.map(a => a.matricula)); onCerrar(); } catch (e: any) { onError(e.message); } }}
              className={`${boton} bg-rose-600 text-white ml-auto`}><Trash2 className="w-4 h-4" /> Sí, borrar con sus notas</button>
          : <button onClick={() => setConfirmarBorrar(true)} className={`${boton} text-rose-700 ml-auto`}><Trash2 className="w-4 h-4" /> Borrar</button>)}
      </div>
    </Panel>
  );
}

function CalificarConRubrica({ col, alumno, elegidos: iniciales, onGuardar, onCerrar }: { col: Columna; alumno: AlumnoLista; elegidos: Record<string, number>; onGuardar: (e: Record<string, number>) => Promise<void>; onCerrar: () => void }) {
  const [elegidos, setElegidos] = useState(iniciales);
  const nota = puntosDeRubrica(col.rubrica!, elegidos, col.max);
  return (
    <Panel titulo={`${col.nombre} · ${alumno.nombre}`} onCerrar={onCerrar} ancho="max-w-4xl">
      {col.rubrica!.criterios.map(cr => (
        <fieldset key={cr.id} className="space-y-1">
          <legend className="text-sm font-semibold text-slate-700">{cr.nombre} <span className="font-normal text-slate-500">({cr.peso}%)</span></legend>
          <div className="grid sm:grid-cols-4 gap-1">
            {cr.niveles.map((n, i) => (
              <button key={i} onClick={() => setElegidos(e => ({ ...e, [cr.id]: i }))}
                className={`text-left text-xs p-2 rounded-lg border ${elegidos[cr.id] === i ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}>
                <b>{n.nombre}</b><span className="block text-slate-600">{n.descriptor}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex items-center gap-3 border-t pt-3">
        <span className="text-sm">Nota: <b className="text-lg">{nota ?? '—'}</b>{nota !== null ? ` / ${col.max}` : ' (falta valorar algún criterio)'}</span>
        <button onClick={() => onGuardar(elegidos)} className={`${boton} bg-indigo-600 text-white ml-auto`}>Guardar y seguir con el siguiente</button>
      </div>
    </Panel>
  );
}

const SUGERIDA: Ponderacion = { examen: 40, proyecto: 30, tarea: 20, participacion: 10 };

function EditorPonderacion({ grupo, onGuardado, onCerrar, onError }: { grupo: Grupo; onGuardado: (p: Ponderacion) => void; onCerrar: () => void; onError: (e: string) => void }) {
  const [p, setP] = useState<Ponderacion>(grupo.ponderacion ?? {});
  const suma = Object.values(p).reduce((s: number, v) => s + (v ?? 0), 0);
  const guardar = async (x: Ponderacion) => {
    try { await guardarPonderacion(grupo.id, x); onGuardado(Object.fromEntries(Object.entries(x).filter(([, v]) => (v ?? 0) > 0))); } catch (e: any) { onError(e.message); }
  };
  return (
    <Panel titulo="¿Cuánto vale cada cosa en el promedio?" onCerrar={onCerrar} ancho="max-w-lg">
      <p className="text-sm text-slate-600">Como en iDoceo: cada tipo de actividad saca su propio promedio y luego pesa lo que digas aquí. Si un tipo aún no tiene notas, su porcentaje se reparte entre los demás.</p>
      <div className="space-y-2">
        {(Object.keys(CATEGORIAS) as Categoria[]).map(c => (
          <label key={c} className="flex items-center gap-3 text-sm">
            <span className={`w-28 px-2 py-1 rounded-full text-xs text-center ${COLOR[CATEGORIAS[c].color].chip}`}>{CATEGORIAS[c].nombre}</span>
            <input type="range" min={0} max={100} step={5} value={p[c] ?? 0} onChange={e => setP({ ...p, [c]: Number(e.target.value) })} className="flex-1" />
            <span className="w-12 text-right font-mono">{p[c] ?? 0}%</span>
          </label>
        ))}
      </div>
      <p className={`text-sm font-semibold ${suma === 100 || suma === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
        Suma: {suma}% {suma !== 100 && suma !== 0 && '— se calcula en proporción, pero lo usual es que sume 100%.'}
      </p>
      <div className="flex flex-wrap gap-2 border-t pt-3">
        <button onClick={() => guardar(p)} className={`${boton} bg-indigo-600 text-white`}>Guardar</button>
        <button onClick={() => setP(SUGERIDA)} className={`${boton} border border-slate-300 text-slate-700`}>Usar 40 / 30 / 20 / 10</button>
        <button onClick={() => guardar({})} className={`${boton} text-slate-600`}>Todo vale igual (sin ponderación)</button>
      </div>
    </Panel>
  );
}

function EditorParciales({ grupo, onGuardado, onCerrar, onError }: { grupo: Grupo; onGuardado: (p: Parcial[]) => void; onCerrar: () => void; onError: (e: string) => void }) {
  const [ps, setPs] = useState<Parcial[]>(grupo.parciales?.length ? grupo.parciales : [1, 2, 3].map(n => ({ nombre: `Parcial ${n}`, inicio: '', fin: '' })));
  const cambiar = (i: number, c: Partial<Parcial>) => setPs(xs => xs.map((x, k) => (k === i ? { ...x, ...c } : x)));
  const guardar = async () => {
    const listos = ps.filter(p => p.nombre.trim() && p.inicio && p.fin);
    if (listos.some(p => p.fin < p.inicio)) return onError('En algún parcial la fecha de fin es anterior a la de inicio.');
    try { await guardarParciales(grupo.id, listos); onGuardado(listos); } catch (e: any) { onError(e.message); }
  };
  return (
    <Panel titulo="Fechas de los parciales" onCerrar={onCerrar} ancho="max-w-lg">
      <p className="text-sm text-slate-600">Solo una vez por clase. Cada actividad, lista y entrada del diario cae sola en su parcial según su fecha, y los reportes salen por parcial.</p>
      {ps.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
          <label className="text-xs font-semibold text-slate-600">Nombre<input className={input} value={p.nombre} onChange={e => cambiar(i, { nombre: e.target.value })} maxLength={30} /></label>
          <label className="text-xs font-semibold text-slate-600">Inicia<input type="date" className={input} value={p.inicio} onChange={e => cambiar(i, { inicio: e.target.value })} /></label>
          <label className="text-xs font-semibold text-slate-600">Termina<input type="date" className={input} value={p.fin} onChange={e => cambiar(i, { fin: e.target.value })} /></label>
          <button onClick={() => setPs(xs => xs.filter((_, k) => k !== i))} className="p-2 text-slate-400 hover:text-rose-600" aria-label={`Quitar ${p.nombre}`}><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 border-t pt-3">
        <button onClick={guardar} className={`${boton} bg-indigo-600 text-white`}>Guardar</button>
        {ps.length < 6 && <button onClick={() => setPs(xs => [...xs, { nombre: `Parcial ${xs.length + 1}`, inicio: '', fin: '' }])} className={`${boton} border border-slate-300 text-slate-700`}><Plus className="w-4 h-4" /> Otro periodo</button>}
      </div>
    </Panel>
  );
}
