import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Plus, Lock, Unlock, BarChart3, Trash2, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AlumnoLista, Grupo } from '../../src/features/grupos/model';
import {
  ClavePregunta, Pregunta, RespuestaAlumno, TIPOS_PREGUNTA, TipoPregunta, calificarCerrada, calificarIntento, notaSobre, redondea, requiereRevision,
} from '../../src/features/evaluacion/modelo';
import { Examen, Intento, borrarIntento, cambiarEstadoExamen, guardarCasilla, guardarColumna, guardarExamen, guardarRevision, leerClave, leerIntentos, listarExamenes } from '../../src/features/evaluacion/storage';
import { PedidoExamen, generarExamen, proponerRevision } from '../../src/features/evaluacion/ia';

const input = 'w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 text-sm';
const boton = 'inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm disabled:opacity-50';
const ESTADO: Record<Examen['estado'], string> = { borrador: 'Borrador (los alumnos no lo ven)', abierto: 'Abierto: se puede contestar', cerrado: 'Cerrado' };

type Vista = { tipo: 'lista' } | { tipo: 'nuevo' } | { tipo: 'resultados'; examen: Examen };

interface EntradaDiario { fecha: string; texto: string }

export default function Examenes({ grupo, alumnos, onError, onAviso, diario = [], descripcionInicial, examenInicial, onCambio }: {
  grupo: Grupo; alumnos: AlumnoLista[]; onError: (e: string) => void; onAviso: (t: string) => void;
  /** Diario de clase: de aquí sale lo que la IA pregunta. */
  diario?: EntradaDiario[];
  /** Llega desde el diario o el cuaderno: abre "nuevo" con la descripción ya escrita. */
  descripcionInicial?: string;
  /** Llega desde una casilla "por revisar": abre los resultados de ese examen. */
  examenInicial?: string;
  /** Algo cambió (examen nuevo, abierto, calificado): el cuaderno se pone al día. */
  onCambio?: () => void;
}) {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [vista, setVista] = useState<Vista>(descripcionInicial !== undefined ? { tipo: 'nuevo' } : { tipo: 'lista' });
  const recargar = async () => {
    try {
      const xs = await listarExamenes(grupo.id);
      setExamenes(xs);
      return xs;
    } catch (e: any) { onError(`No pude leer los exámenes: ${e.message}`); return []; }
  };
  useEffect(() => {
    recargar().then(xs => {
      const ex = examenInicial && xs.find(x => x.id === examenInicial);
      if (ex) setVista({ tipo: 'resultados', examen: ex });
    });
  }, [grupo.id]);
  const cambiarEstado = async (ex: Examen, estado: Examen['estado']) => {
    try { await cambiarEstadoExamen(grupo.id, ex.id, estado); await recargar(); onCambio?.(); } catch (e: any) { onError(e.message); }
  };

  if (vista.tipo === 'nuevo') return <NuevoExamen grupo={grupo} diario={diario} descripcionInicial={descripcionInicial ?? ''} onError={onError} onListo={async (t) => { onAviso(t); await recargar(); onCambio?.(); setVista({ tipo: 'lista' }); }} onVolver={() => setVista({ tipo: 'lista' })} />;
  if (vista.tipo === 'resultados') return <Resultados grupo={grupo} examen={vista.examen} alumnos={alumnos} onError={onError} onAviso={t => { onAviso(t); onCambio?.(); }} onVolver={() => setVista({ tipo: 'lista' })} />;

  return (
    <div className="space-y-3">
      <button onClick={() => setVista({ tipo: 'nuevo' })} className={`${boton} bg-violet-600 text-white`}><Sparkles className="w-4 h-4" /> Nuevo examen con IA</button>
      {!grupo.asignaturaClave && <p className="text-sm text-amber-700">Esta asignatura no está conectada a Antología: los alumnos no podrán contestar en línea.</p>}
      {!examenes.length && <p className="text-sm text-slate-600 py-4">Aún no hay exámenes. Describe lo que pasó en clase (o escríbelo en el Diario de clase) y la IA arma uno; tú lo revisas antes de abrirlo. Su columna aparece sola en el cuaderno.</p>}
      {examenes.map(ex => (
        <article key={ex.id} className="border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-semibold text-slate-800">{ex.titulo}</h3>
            <p className="text-xs text-slate-500">{ex.preguntas.length} preguntas · {ex.minutos ? `${ex.minutos} min` : 'sin límite'} · {ESTADO[ex.estado]}</p>
          </div>
          {ex.estado !== 'abierto'
            ? <button onClick={() => cambiarEstado(ex, 'abierto')} className={`${boton} bg-emerald-600 text-white`}><Unlock className="w-4 h-4" /> Abrir</button>
            : <button onClick={() => cambiarEstado(ex, 'cerrado')} className={`${boton} bg-slate-700 text-white`}><Lock className="w-4 h-4" /> Cerrar</button>}
          <button onClick={() => setVista({ tipo: 'resultados', examen: ex })} className={`${boton} border border-slate-300 text-slate-700`}><BarChart3 className="w-4 h-4" /> Resultados y calificar</button>
        </article>
      ))}
    </div>
  );
}

// ─── Crear con IA ───────────────────────────────────────────────────────────

const TIPOS_INICIALES: Partial<Record<TipoPregunta, number>> = { opcion: 4, vf: 2, relacionar: 1, justifica: 1, abierta: 1 };

function NuevoExamen({ grupo, diario, descripcionInicial, onError, onListo, onVolver }: { grupo: Grupo; diario: EntradaDiario[]; descripcionInicial: string; onError: (e: string) => void; onListo: (t: string) => void; onVolver: () => void }) {
  const [pedido, setPedido] = useState<PedidoExamen>({ asignatura: grupo.asignaturaNombre, grupo: grupo.nombre, descripcionClase: descripcionInicial, tipos: TIPOS_INICIALES, confianza: true, dificultad: 'mixta', minutos: 30 });
  const traer = (d: EntradaDiario) => setPedido(p => ({ ...p, descripcionClase: p.descripcionClase.includes(d.texto) ? p.descripcionClase : `${p.descripcionClase.trim()}${p.descripcionClase.trim() ? '\n\n' : ''}${d.texto}` }));
  const [generando, setGenerando] = useState(false);
  const [borrador, setBorrador] = useState<{ titulo: string; instrucciones: string; preguntas: Pregunta[]; clave: Record<string, ClavePregunta>; problemas: string[] } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const total = Object.values(pedido.tipos).reduce((s, n) => s + (n ?? 0), 0);

  const generar = async () => {
    if (pedido.descripcionClase.trim().length < 40) return onError('Cuenta con más detalle qué pasó en clase (al menos un par de líneas): qué se vio, qué se les dificultó, qué ejemplos usaron.');
    if (!total) return onError('Elige al menos un tipo de pregunta.');
    setGenerando(true); setBorrador(null);
    try { setBorrador(await generarExamen(pedido)); } catch (e: any) { onError(e.message); } finally { setGenerando(false); }
  };

  const editar = (i: number, cambios: Partial<Pregunta>) => setBorrador(b => b && ({ ...b, preguntas: b.preguntas.map((p, k) => k === i ? { ...p, ...cambios } : p) }));
  const quitar = (i: number) => setBorrador(b => b && ({ ...b, preguntas: b.preguntas.filter((_, k) => k !== i) }));

  const guardar = async () => {
    if (!borrador?.preguntas.length) return;
    setGuardando(true);
    try {
      const creadoEn = new Date().toISOString();
      // El examen tiene su columna en el cuaderno de notas, para que la calificación llegue sola.
      const columnaId = await guardarColumna(grupo.id, { nombre: borrador.titulo.slice(0, 80), tipo: 'examen', max: 10, peso: 0, fecha: new Date().toLocaleDateString('en-CA'), orden: Date.now(), rubrica: null, examenId: '' });
      await guardarExamen(grupo.id, {
        titulo: borrador.titulo, instrucciones: borrador.instrucciones, minutos: pedido.minutos, estado: 'borrador',
        preguntas: borrador.preguntas, columnaId, descripcionClase: pedido.descripcionClase, creadoEn, actualizadoEn: creadoEn,
      }, Object.fromEntries(borrador.preguntas.map(p => [p.id, borrador.clave[p.id]])));
      onListo(`Examen guardado como borrador con ${borrador.preguntas.length} preguntas. Ábrelo cuando quieras que lo contesten.`);
    } catch (e: any) { onError(`No se guardó el examen: ${e.message}`); } finally { setGuardando(false); }
  };

  return (
    <div className="space-y-4">
      <button onClick={onVolver} className="text-sm text-slate-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Exámenes</button>
      {diario.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-500">Traer del diario de clase:</span>
          {diario.slice(0, 8).map(d => (
            <button key={d.fecha} onClick={() => traer(d)} title={d.texto.slice(0, 200)}
              className={`px-2 py-1 rounded-full border ${pedido.descripcionClase.includes(d.texto) ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-600 hover:border-violet-400'}`}>
              {new Date(`${d.fecha}T12:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </button>
          ))}
        </div>
      )}
      <label className="block text-sm font-semibold text-slate-700">¿Qué pasó realmente en clase?
        <textarea className={`${input} h-36 mt-1 font-normal`} value={pedido.descripcionClase} onChange={e => setPedido({ ...pedido, descripcionClase: e.target.value })}
          placeholder="Cuéntalo como se lo contarías a otro maestro: qué temas se vieron de verdad, qué ejemplos usaron, qué actividad hicieron, qué se les dificultó, qué errores o confusiones notaste, qué quedó pendiente. La IA solo preguntará sobre esto." />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-700">Tipos de pregunta y cuántas de cada uno ({total} en total)</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {(Object.keys(TIPOS_PREGUNTA) as TipoPregunta[]).map(t => (
            <label key={t} className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg p-2">
              <input type="number" min={0} max={20} className="w-14 border border-slate-300 rounded p-1 text-center" value={pedido.tipos[t] ?? 0}
                onChange={e => setPedido({ ...pedido, tipos: { ...pedido.tipos, [t]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) } })} />
              <span>{TIPOS_PREGUNTA[t]}{(t === 'justifica' || t === 'error') && <span className="ml-1 text-[10px] uppercase bg-violet-100 text-violet-700 px-1 rounded">nueva</span>}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-3 gap-2">
        <label className="text-xs font-semibold text-slate-600">Dificultad
          <select className={input} value={pedido.dificultad} onChange={e => setPedido({ ...pedido, dificultad: e.target.value as PedidoExamen['dificultad'] })}>
            <option value="basica">Básica (recordar y comprender)</option><option value="mixta">Mixta</option><option value="retadora">Retadora (aplicar y analizar)</option>
          </select></label>
        <label className="text-xs font-semibold text-slate-600">Minutos (0 = sin límite)<input type="number" min={0} max={240} className={input} value={pedido.minutos} onChange={e => setPedido({ ...pedido, minutos: Math.max(0, Math.min(240, Number(e.target.value) || 0)) })} /></label>
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-2 mt-5" title="Tras responder, el alumno marca qué tan seguro está. Verás quién está muy seguro pero equivocado: ideas erróneas a atender.">
          <input type="checkbox" checked={pedido.confianza} onChange={e => setPedido({ ...pedido, confianza: e.target.checked })} /> Preguntar qué tan seguro está <span className="text-[10px] uppercase bg-violet-100 text-violet-700 px-1 rounded">nueva</span>
        </label>
      </div>

      <button onClick={generar} disabled={generando} className={`${boton} bg-violet-600 text-white`}><Sparkles className="w-4 h-4" /> {generando ? 'Claude está armando el examen… (1-3 min)' : borrador ? 'Generar otro' : 'Generar examen'}</button>

      {borrador && (
        <div className="space-y-3 border-t pt-4">
          <input className={`${input} font-bold`} value={borrador.titulo} onChange={e => setBorrador({ ...borrador, titulo: e.target.value })} aria-label="Título del examen" />
          <textarea className={`${input} h-16`} value={borrador.instrucciones} onChange={e => setBorrador({ ...borrador, instrucciones: e.target.value })} aria-label="Instrucciones" />
          {borrador.problemas.length > 0 && <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">{borrador.problemas.map((p, i) => <p key={i}>⚠️ {p}</p>)}</div>}
          <p className="text-sm text-slate-600">Revisa cada pregunta. <b>En verde está la respuesta correcta</b>: solo tú la ves; nunca llega al celular del alumno.</p>
          {borrador.preguntas.map((p, i) => (
            <VistaPregunta key={p.id} n={i + 1} p={p} clave={borrador.clave[p.id]} onTexto={t => editar(i, { texto: t })} onPuntos={n => editar(i, { puntos: n })} onQuitar={() => quitar(i)} />
          ))}
          <button onClick={guardar} disabled={guardando || !borrador.preguntas.length} className={`${boton} bg-indigo-600 text-white`}><CheckCircle2 className="w-4 h-4" /> {guardando ? 'Guardando…' : 'Guardar como borrador'}</button>
        </div>
      )}
    </div>
  );
}

function VistaPregunta({ n, p, clave, onTexto, onPuntos, onQuitar }: { n: number; p: Pregunta; clave: ClavePregunta; onTexto: (t: string) => void; onPuntos: (n: number) => void; onQuitar: () => void }) {
  const bien = 'text-emerald-700 font-semibold';
  return (
    <article className="border border-slate-200 rounded-xl p-3 space-y-2 text-sm">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-bold text-slate-700">{n}.</span> {TIPOS_PREGUNTA[p.tipo]}
        <label className="ml-auto flex items-center gap-1">puntos <input type="number" min={0.5} step={0.5} className="w-14 border rounded p-0.5 text-center" value={p.puntos} onChange={e => onPuntos(Math.max(0.5, Number(e.target.value) || 1))} /></label>
        <button onClick={onQuitar} title="Quitar pregunta" className="text-rose-600"><Trash2 className="w-4 h-4" /></button>
      </div>
      {p.contexto && <p className="text-slate-600 italic bg-slate-50 p-2 rounded">{p.contexto}</p>}
      <textarea className={`${input} h-16`} value={p.texto} onChange={e => onTexto(e.target.value)} aria-label={`Texto de la pregunta ${n}`} />
      {p.opciones && <ol className="list-[upper-alpha] ml-6">{p.opciones.map((o, i) => <li key={i} className={(clave.correcta === i || clave.correctas?.includes(i)) ? bien : ''}>{o}</li>)}</ol>}
      {p.tipo === 'vf' && <p className={bien}>Respuesta: {clave.verdadero ? 'Verdadero' : 'Falso'}</p>}
      {p.tipo === 'completar' && <p className={bien}>Se acepta: {clave.aceptadas?.join(' · ')}</p>}
      {p.tipo === 'numerica' && <p className={bien}>Respuesta: {clave.valor} {p.unidad} {clave.tolerancia ? `(± ${clave.tolerancia})` : ''}</p>}
      {p.tipo === 'relacionar' && <ul className="ml-4">{p.izquierda!.map((x, i) => <li key={i}>{x} → <span className={bien}>{p.derecha![clave.pares![i]]}</span></li>)}</ul>}
      {p.tipo === 'ordenar' && <p className={bien}>Orden: {clave.orden!.map(i => p.elementos![i]).join(' → ')}</p>}
      {clave.criterio && <p className="text-slate-600"><b>Criterio para revisar:</b> {clave.criterio}</p>}
      {p.pedirConfianza && <p className="text-xs text-violet-700">Pedirá nivel de seguridad</p>}
    </article>
  );
}

// ─── Resultados y calificación ──────────────────────────────────────────────

function Resultados({ grupo, examen, alumnos, onError, onAviso, onVolver }: { grupo: Grupo; examen: Examen; alumnos: AlumnoLista[]; onError: (e: string) => void; onAviso: (t: string) => void; onVolver: () => void }) {
  const [clave, setClave] = useState<Record<string, ClavePregunta>>({});
  const [intentos, setIntentos] = useState<Intento[]>([]);
  const [revision, setRevision] = useState<Record<string, Record<string, number>>>({}); // matricula → qid → puntos totales
  const [motivos, setMotivos] = useState<Record<string, Record<string, string>>>({});
  const [proponiendo, setProponiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const [k, its] = await Promise.all([leerClave(grupo.id, examen.id), leerIntentos(grupo.id, examen.id)]);
      setClave(k); setIntentos(its);
      setRevision(Object.fromEntries(its.map(i => [i.matricula, i.revision ?? {}])));
    } catch (e: any) { onError(`No pude leer los resultados: ${e.message}`); }
  };
  useEffect(() => { cargar(); }, [examen.id]);

  const activos = alumnos.filter(a => a.estado === 'activo');
  const porMatricula = useMemo(() => Object.fromEntries(intentos.map(i => [i.matricula, i])), [intentos]);
  const resultados = useMemo(() => Object.fromEntries(intentos.map(i => [i.matricula, calificarIntento(examen.preguntas, clave, i.respuestas ?? {}, revision[i.matricula])])), [intentos, clave, revision, examen.preguntas]);
  const pendientesTotales = Object.values(resultados).reduce((s, r) => s + r.pendientes.length, 0);

  // Por pregunta: % de acierto entre quienes la contestaron y cuántos "seguros pero equivocados".
  const porPregunta = examen.preguntas.map(p => {
    const contestaron = intentos.filter(i => i.respuestas?.[p.id]?.valor !== undefined);
    const puntos = contestaron.map(i => requiereRevision(p) ? revision[i.matricula]?.[p.id] : calificarCerrada(p, clave[p.id] ?? {}, i.respuestas[p.id])).filter((x): x is number => typeof x === 'number');
    return { p, contestaron: contestaron.length, acierto: puntos.length ? Math.round(100 * puntos.reduce((s, x) => s + x, 0) / (puntos.length * p.puntos)) : null,
      seguros: Object.values(resultados).filter(r => r.segurosEquivocados.includes(p.id)).length };
  });

  const proponer = async () => {
    const pendientes: { n: number; matricula: string; pregunta: Pregunta; clave: ClavePregunta; respuesta: string }[] = [];
    let n = 1;
    for (const i of intentos) for (const qid of resultados[i.matricula]?.pendientes ?? []) {
      const p = examen.preguntas.find(x => x.id === qid)!; const v: any = i.respuestas[qid]?.valor;
      pendientes.push({ n: n++, matricula: i.matricula, pregunta: p, clave: clave[qid] ?? {}, respuesta: typeof v === 'string' ? v : String(v?.texto ?? '') });
    }
    if (!pendientes.length) return;
    setProponiendo(true);
    try {
      // Solo viaja el texto de cada respuesta: nunca nombres ni matrículas.
      const propuesta = await proponerRevision(pendientes.map(({ n, pregunta, clave, respuesta }) => ({ n, pregunta, clave, respuesta })));
      const rev = JSON.parse(JSON.stringify(revision)); const mot = JSON.parse(JSON.stringify(motivos));
      for (const x of pendientes) {
        const r = propuesta[x.n]; if (!r) continue;
        const parteCerrada = x.pregunta.tipo === 'abierta' ? 0 : (calificarCerrada(x.pregunta, x.clave, porMatricula[x.matricula].respuestas[x.pregunta.id]) ?? 0);
        (rev[x.matricula] ??= {})[x.pregunta.id] = redondea(parteCerrada + r.puntos, 2);
        (mot[x.matricula] ??= {})[x.pregunta.id] = `IA: ${r.motivo}`;
      }
      setRevision(rev); setMotivos(mot);
      onAviso('La IA propuso puntos para las respuestas escritas. Revísalos y ajusta lo que no compartas antes de guardar.');
    } catch (e: any) { onError(e.message); } finally { setProponiendo(false); }
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      let n = 0;
      for (const i of intentos.filter(x => x.estado === 'entregado')) {
        const r = resultados[i.matricula];
        if (r.pendientes.length) continue; // sin revisar no se pone nota
        const nota = notaSobre(r.automaticos, r.maximo, 10);
        await guardarRevision(grupo.id, examen.id, i.matricula, revision[i.matricula] ?? {}, nota);
        if (examen.columnaId) await guardarCasilla(grupo.id, i.matricula, examen.columnaId, { valor: nota, estado: 'entregado' });
        n++;
      }
      onAviso(`Se guardaron ${n} calificaciones en el examen y en el cuaderno de notas.${pendientesTotales ? ' Las que tienen respuestas sin revisar quedaron pendientes.' : ''}`);
      cargar();
    } catch (e: any) { onError(`No se guardaron las calificaciones: ${e.message}`); } finally { setGuardando(false); }
  };

  return (
    <div className="space-y-4">
      <button onClick={onVolver} className="text-sm text-slate-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Exámenes</button>
      <h3 className="font-bold text-slate-800">{examen.titulo}</h3>
      <p className="text-sm text-slate-600">
        Entregaron <b>{intentos.filter(i => i.estado === 'entregado').length}</b> de {activos.length} · en curso: {intentos.filter(i => i.estado === 'en curso').length} ·
        no lo han presentado: {activos.filter(a => !porMatricula[a.matricula]).length} (no cuenta como cero: tú decides en el cuaderno).
      </p>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-700">Por pregunta</h4>
        {porPregunta.map(({ p, contestaron, acierto, seguros }, i) => (
          <div key={p.id} className="flex items-center gap-2 text-sm">
            <span className="w-8 text-slate-500">{i + 1}.</span>
            <span className="flex-1 truncate" title={p.texto}>{p.texto}</span>
            <span className="w-24 text-right">{acierto === null ? '—' : `${acierto}% acierto`}</span>
            <span className="w-20 text-right text-xs text-slate-500">{contestaron} resp.</span>
            {seguros > 0 && <span className="text-xs text-rose-700 font-semibold" title="Marcaron 'muy seguro' y se equivocaron: idea errónea a atender"><AlertTriangle className="inline w-3 h-3" /> {seguros} seguros y equivocados</span>}
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <button onClick={proponer} disabled={proponiendo || !pendientesTotales} className={`${boton} bg-violet-600 text-white`}>
          <Sparkles className="w-4 h-4" /> {proponiendo ? 'Claude está revisando… (1-3 min)' : `Proponer puntos con IA (${pendientesTotales} respuestas escritas)`}
        </button>
        <button onClick={guardar} disabled={guardando || !intentos.length} className={`${boton} bg-indigo-600 text-white`}><CheckCircle2 className="w-4 h-4" /> {guardando ? 'Guardando…' : 'Guardar calificaciones en el cuaderno'}</button>
      </div>

      <section className="space-y-3">
        {activos.map(a => {
          const it = porMatricula[a.matricula]; const r = it && resultados[a.matricula];
          return (
            <details key={a.matricula} className="border border-slate-200 rounded-xl p-3">
              <summary className="cursor-pointer text-sm flex flex-wrap gap-2">
                <b>{a.nombre}</b>
                {!it ? <span className="text-slate-500">no lo ha presentado</span>
                  : <span>{it.estado === 'en curso' ? 'contestando…' : 'entregado'} · {r!.automaticos} / {r!.maximo} pts{r!.pendientes.length ? ` · ${r!.pendientes.length} por revisar` : ` · nota ${notaSobre(r!.automaticos, r!.maximo, 10)}`}{it.calificacion !== undefined ? ' · guardada' : ''}</span>}
              </summary>
              {it && (
                <div className="mt-2 space-y-2 text-sm">
                  {examen.preguntas.map((p, i) => {
                    const ra: RespuestaAlumno | undefined = it.respuestas?.[p.id];
                    const auto = calificarCerrada(p, clave[p.id] ?? {}, ra);
                    return (
                      <div key={p.id} className="border-t pt-1">
                        <p className="text-slate-600">{i + 1}. {p.texto}</p>
                        <p>Respuesta: <span className="font-mono">{mostrarRespuesta(p, ra)}</span>{ra?.confianza ? ` · seguridad ${['', 'poca', 'media', 'mucha'][ra.confianza]}` : ''}</p>
                        {requiereRevision(p) ? (
                          <label className="flex items-center gap-2">Puntos (de {p.puntos}):
                            <input type="number" min={0} max={p.puntos} step={0.5} className="w-16 border rounded p-0.5 text-center"
                              value={revision[a.matricula]?.[p.id] ?? ''} placeholder="?"
                              onChange={e => { const v = Math.min(p.puntos, Math.max(0, Number(e.target.value) || 0)); setRevision(r => ({ ...r, [a.matricula]: { ...(r[a.matricula] ?? {}), [p.id]: v } })); }} />
                            {motivos[a.matricula]?.[p.id] && <span className="text-xs text-violet-700">{motivos[a.matricula][p.id]}</span>}
                          </label>
                        ) : <p className={auto === p.puntos ? 'text-emerald-700' : 'text-rose-700'}>{auto === null ? 'Sin respuesta' : `${auto} / ${p.puntos}`}</p>}
                      </div>
                    );
                  })}
                  <button onClick={async () => { await borrarIntento(grupo.id, examen.id, a.matricula); cargar(); }} className="text-xs text-rose-700">Borrar este intento para que lo repita</button>
                </div>
              )}
            </details>
          );
        })}
      </section>
    </div>
  );
}

function mostrarRespuesta(p: Pregunta, ra?: RespuestaAlumno): string {
  const v: any = ra?.valor;
  if (v === undefined || v === '') return '—';
  if (p.tipo === 'opcion') return p.opciones?.[v] ?? String(v);
  if (p.tipo === 'multiple') return (v as number[]).map(i => p.opciones?.[i]).join(' · ');
  if (p.tipo === 'vf') return v ? 'Verdadero' : 'Falso';
  if (p.tipo === 'relacionar') return p.izquierda!.map((x, i) => `${x} → ${p.derecha![v[String(i)]] ?? '?'}`).join('; ');
  if (p.tipo === 'ordenar') return (v as number[]).map(i => p.elementos![i]).join(' → ');
  if (p.tipo === 'justifica' || p.tipo === 'error') return `${p.opciones?.[v.opcion] ?? '—'} · "${v.texto ?? ''}"`;
  return String(v);
}
