import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, FilePlus, Sparkles, CheckCircle2, Archive, Download } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { Ambito, ContextoCuaderno, FuenteEscolar, RespuestaCuaderno, TipoFuente, tipos, recuperarContexto } from '../src/features/cuaderno/model';
import { AccesoCuaderno, esRevisor, guardarFuente, listarFuentes, revisarFuente } from '../src/features/cuaderno/storage';
import { extraerArchivo } from '../src/features/cuaderno/importar';
import { consultarCuaderno } from '../src/features/cuaderno/ia';
const hoy = () => new Date().toLocaleDateString('en-CA');
const input = 'w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900';
export default function CuadernoEscolar({ cycle = '', subject = '' }: { cycle?: string; subject?: string }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'local' | 'escuela'>('local');
  const [items, setItems] = useState<FuenteEscolar[]>([]);
  const [reviewer, setReviewer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [focus, setFocus] = useState<FuenteEscolar | null>(null);
  const [form, setForm] = useState({ title: '', kind: 'documento' as TipoFuente, text: '', cycle, group: '', subject, meeting: '', date: hoy(), validUntil: '', origin: '' });
  const [scope, setScope] = useState({ cycle, group: '', subject, date: hoy() });
  const [question, setQuestion] = useState('¿Qué ajustes sustentados conviene hacer en mi próxima clase y cómo comprobaré si ayudaron a aprender?');
  const [key, setKey] = useState(() => sessionStorage.getItem('gemini_api_key') || '');
  const [result, setResult] = useState<{ answer: RespuestaCuaderno; context: ContextoCuaderno } | null>(null);
  const schoolId = user?.schoolId || (user?.rol === 'guest' ? 'demo' : '');
  const access: AccesoCuaderno = { schoolId, userId: user?.id || '', mode };
  useEffect(() => {
    setForm({ title: '', kind: 'documento', text: '', cycle, group: '', subject, meeting: '', date: hoy(), validUntil: '', origin: '' });
    setScope({ cycle, group: '', subject, date: hoy() });
  }, [schoolId, user?.id]);
  const epoch = useRef(0);
  useEffect(() => {
    const version = ++epoch.current;
    setItems([]); setFocus(null); setSelected([]); setResult(null); setError(''); setNotice(''); setReviewer(false);
    if (!schoolId || !user?.id) return;
    setBusy(true);
    Promise.all([listarFuentes(access), esRevisor(access)]).then(([rows, canReview]) => {
      if (version !== epoch.current) return;
      setItems(rows); setReviewer(canReview); setSelected(rows.filter(f => f.status === 'revisada').map(f => f.id));
    }).catch(() => {
      if (version === epoch.current) setError('No se pudo abrir el cuaderno compartido. Revisa conexión y acceso escolar. Puedes trabajar en el cuaderno local; no se ha sincronizado información.');
    }).finally(() => { if (version === epoch.current) setBusy(false); });
  }, [schoolId, user?.id, mode]);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice('');
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la operación.'); } finally { setBusy(false); }
  };
  const refresh = async () => { setItems(await listarFuentes(access)); setResult(null); };
  const save = () => run(async () => {
    const f: FuenteEscolar = { ...form, id: crypto.randomUUID(), schoolId, authorId: user!.id, status: 'borrador', createdAt: new Date().toISOString(), reviewedAt: '', reviewedBy: '' };
    await guardarFuente(access, f); await refresh(); setFocus(f); setForm(prev => ({ ...prev, title: '', text: '', origin: '' }));
    setNotice('Fuente guardada como borrador. Revisa su contenido y alcance antes de usarla con IA.');
  });
  const download = () => {
    const blob = new Blob([JSON.stringify({ version: 1, schoolId, sources: items }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cuaderno-escolar.json'; a.click(); URL.revokeObjectURL(url);
  };
  const context = recuperarContexto(items, { ...scope, schoolId }, question, selected);
  const field = (label: string, value: string, change: (v: string) => void, type = 'text') => <label className="block text-sm font-medium text-slate-600">{label}<input type={type} className={input} value={value} onChange={e => change(e.target.value)} /></label>;
  if (!schoolId || !user?.id) return <p className="p-8">Completa tu escuela en el perfil para abrir el cuaderno.</p>;
  return <div className="p-4 md:p-8 max-w-screen-2xl mx-auto space-y-6">
    <header className="flex flex-wrap justify-between gap-4"><div><p className="text-indigo-600 font-semibold flex gap-2"><BookOpen size={20} /> MEMORIA PEDAGÓGICA</p><h1 className="text-3xl font-bold mt-2">Cuaderno escolar</h1><p className="text-slate-600 mt-2">Fuentes, acuerdos CAPEMS y resultados de clase para decidir qué mejorar.</p></div><button onClick={download} className="flex items-center gap-2 text-indigo-700"><Download size={18} /> Exportar fuentes</button></header>
    <div className="rounded-xl bg-indigo-50 p-4 flex flex-wrap gap-4 items-center"><label className="font-medium">Guardar y consultar en <select aria-label="Ubicación del cuaderno" disabled={busy} value={mode} onChange={e => setMode(e.target.value as typeof mode)} className="ml-2 p-2 rounded border"><option value="local">Este navegador · personal</option><option value="escuela">Escuela · compartido</option></select></label><p className="text-sm text-slate-600">{mode === 'local' ? 'Aislado por escuela y usuario. No se comparte automáticamente.' : 'Acceso del personal autorizado; las fuentes requieren revisión antes de alimentar planes.'}</p></div>
    {error && <p role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl">{error}</p>}{notice && <p role="status" className="p-4 bg-emerald-50 rounded-xl">{notice}</p>}
    <div className="grid xl:grid-cols-[300px_minmax(0,1fr)_minmax(320px,1fr)] gap-5">
      <section className="bg-white border rounded-2xl p-4 space-y-3"><h2 className="font-bold text-lg">Fuentes · {items.length}</h2><p className="text-xs text-slate-500">Selecciona fuentes revisadas para consultar. Abre una fuente para comprobar el texto.</p><button disabled={busy} onClick={() => run(refresh)} className="text-indigo-700 text-sm">Actualizar fuentes</button>
        {items.length === 0 && <p className="py-8 text-slate-500">Agrega el primer documento, acuerdo o resultado de clase.</p>}
        {items.map(f => <article key={f.id} className={`p-3 rounded-xl border ${focus?.id === f.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}><div className="flex gap-2 items-start"><input aria-label={`Usar ${f.title}`} type="checkbox" disabled={f.status !== 'revisada' || busy} checked={selected.includes(f.id)} onChange={e => { setSelected(prev => e.target.checked ? [...prev, f.id] : prev.filter(id => id !== f.id)); setResult(null); }} /><button className="text-left font-semibold" onClick={() => setFocus(f)}>{f.title}</button></div><p className="text-xs mt-2 text-slate-500">{tipos[f.kind]} · {f.status}<br />{f.cycle} · {f.group || 'Plantel'} · {f.date}</p></article>)}
      </section>
      <section className="bg-white border rounded-2xl p-5 space-y-4"><h2 className="font-bold text-lg flex gap-2"><FilePlus /> Agregar a la memoria</h2>
        <fieldset disabled={busy} className="space-y-3">
          {field('Título', form.title, title => setForm({ ...form, title }))}
          <label className="block text-sm">Tipo<select className={input} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as TipoFuente })}>{Object.entries(tipos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">{field('Ciclo escolar', form.cycle, cycle => setForm({ ...form, cycle }))}{field('Grupo y turno (vacío: plantel)', form.group, group => setForm({ ...form, group }))}{field('Asignatura (vacío: todas)', form.subject, subject => setForm({ ...form, subject }))}{field('Reunión / CAPEMS', form.meeting, meeting => setForm({ ...form, meeting }))}{field('Fecha de fuente o actividad', form.date, date => setForm({ ...form, date }), 'date')}{field('Vigente hasta (opcional)', form.validUntil, validUntil => setForm({ ...form, validUntil }), 'date')}</div>
          {field('Procedencia: archivo, oficio, página o enlace', form.origin, origin => setForm({ ...form, origin }))}
          <label className="block text-sm">Importar texto · PDF, DOCX, TXT o MD<input type="file" accept=".pdf,.docx,.txt,.md" className="block mt-2 w-full text-sm" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void run(async () => { const text = await extraerArchivo(file); setForm(prev => ({ ...prev, text, title: prev.title || file.name, origin: file.name })); }); }} /></label>
          <label className="block text-sm">Contenido revisable<textarea className={input} rows={8} maxLength={80000} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Para una clase: qué se realizó, evidencia observada, dificultades, apoyo aplicado y próximo ajuste. Para un acuerdo: acción, responsable y plazo. Usa resultados agregados, sin datos personales." /></label>
          <p className="text-xs text-slate-500">Se conserva el texto extraído, no el archivo original ni sus imágenes. Revisa tablas y páginas; PDF escaneado requiere OCR externo. Comparte únicamente información que la escuela pueda utilizar.</p>
          <button onClick={save} className="bg-indigo-600 text-white rounded-lg px-4 py-2 disabled:opacity-50">Guardar borrador</button>
        </fieldset>
        {focus && <div className="border-t pt-4 space-y-3"><h3 className="font-bold">{focus.title}</h3><p className="text-xs text-slate-500">{focus.origin} · {focus.status}</p><pre className="whitespace-pre-wrap font-sans text-sm max-h-80 overflow-y-auto bg-slate-50 p-3 rounded">{focus.text}</pre><p className="text-xs">Revisar confirma que el texto y alcance son utilizables; no certifica obligatoriedad jurídica.</p>
          {reviewer && focus.status !== 'archivada' && <div className="flex flex-wrap gap-3">{focus.status === 'borrador' && <button disabled={busy} className="text-emerald-700 flex gap-1" onClick={() => run(async () => { await revisarFuente(access, focus.id, 'revisada'); setSelected(prev => [...prev, focus.id]); setFocus({ ...focus, status: 'revisada' }); await refresh(); })}><CheckCircle2 size={18} /> Revisar y habilitar</button>}<button disabled={busy} className="text-slate-600 flex gap-1" onClick={() => run(async () => { await revisarFuente(access, focus.id, 'archivada'); setFocus({ ...focus, status: 'archivada' }); setSelected(prev => prev.filter(id => id !== focus.id)); await refresh(); })}><Archive size={18} /> Archivar</button></div>}
          <button disabled={busy} className="text-indigo-700 text-sm" onClick={() => { setForm({ title: `${focus.title} · nueva versión`, text: focus.text, kind: focus.kind, cycle: focus.cycle, group: focus.group, subject: focus.subject, date: hoy(), validUntil: '', meeting: focus.meeting, origin: `${focus.origin} · revisión de ${focus.id}` }); }}>Preparar nueva versión</button>
          {mode === 'local' && <button disabled={busy} className="block text-indigo-700 text-sm" onClick={() => run(async () => { await guardarFuente({ ...access, mode: 'escuela' }, { ...focus, id: crypto.randomUUID(), authorId: user.id, status: 'borrador', reviewedAt: '', reviewedBy: '' }); setNotice('Copia enviada a la escuela como borrador para revisión.'); })}>Enviar copia al cuaderno compartido</button>}
        </div>}
      </section>
      <section className="bg-white border rounded-2xl p-5 space-y-4"><h2 className="font-bold text-lg flex gap-2"><Sparkles className="text-indigo-600" /> Consultar y mejorar</h2><p className="text-sm text-slate-600">La IA consulta fragmentos seleccionados. Sus propuestas requieren revisión docente.</p>
        <fieldset disabled={busy} className="space-y-3"><div className="grid grid-cols-2 gap-3">{field('Ciclo a consultar', scope.cycle, cycle => { setScope({ ...scope, cycle }); setResult(null); })}{field('Grupo y turno a consultar', scope.group, group => { setScope({ ...scope, group }); setResult(null); })}{field('Asignatura a consultar', scope.subject, subject => { setScope({ ...scope, subject }); setResult(null); })}{field('Fecha de aplicación', scope.date, date => { setScope({ ...scope, date }); setResult(null); }, 'date')}</div>
          <label className="block text-sm">Tu clave Gemini<input type="password" autoComplete="off" value={key} className={input} onChange={e => { setKey(e.target.value); sessionStorage.setItem('gemini_api_key', e.target.value); }} /></label>
          <label className="block text-sm">Pregunta<textarea rows={4} className={input} value={question} onChange={e => { setQuestion(e.target.value); setResult(null); }} /></label>
          <p className="text-xs text-slate-500">{context.sourceCount} fuentes aplicables · {context.fragments.length} fragmentos · {context.omitted} fragmentos fuera de esta consulta. Al consultar se envía este texto a Gemini con tu clave.</p>
          <details><summary className="text-sm cursor-pointer text-indigo-700">Ver fragmentos que se enviarán</summary>{context.fragments.map(f => <pre key={f.id} className="whitespace-pre-wrap font-sans text-xs p-2 border-b">[{f.id}] {f.title}\n{f.text}</pre>)}</details>
          <button disabled={!context.fragments.length || !question.trim() || busy} className="bg-indigo-600 text-white rounded-lg px-4 py-2 disabled:opacity-50" onClick={() => run(async () => { const answer = await consultarCuaderno(question, context, key); setResult({ answer, context }); })}>{busy ? 'Procesando…' : 'Consultar fuentes con IA'}</button>
        </fieldset>
        {result && <div className="space-y-4 border-t pt-4"><p className="whitespace-pre-wrap">{result.answer.answer}</p>{result.answer.recommendations.map((r, i) => <article key={i} className="bg-indigo-50 p-3 rounded-lg space-y-2"><h3 className="font-semibold">{r.change}</h3><p className="text-sm">Evidencia: {r.evidence}</p><p className="text-sm">Comprobar: {r.check}</p>{r.sourceIds.map(id => { const f = result.context.fragments.find(f => f.id === id)!; return <details key={id} className="text-xs"><summary className="cursor-pointer text-indigo-700">{f.title} · fragmento {id.split(':').pop()}</summary><p className="whitespace-pre-wrap">{f.text}</p></details>; })}</article>)}{result.answer.missing.length > 0 && <div className="bg-amber-50 p-3 rounded"><h3 className="font-semibold">Por confirmar</h3><ul className="list-disc pl-5">{result.answer.missing.map((v, i) => <li key={i}>{v}</li>)}</ul></div>}<button onClick={() => { setForm(prev => ({ ...prev, kind: 'acuerdo', title: 'Propuesta de mejora para revisión', cycle: scope.cycle, group: scope.group, subject: scope.subject, origin: 'Propuesta IA basada en: ' + result.context.fragments.map(f => f.id).join(', ').slice(0, 400), text: JSON.stringify(result.answer, null, 2) })); setNotice('Propuesta preparada en el formulario. Edítala antes de guardarla como borrador.'); }} className="text-indigo-700 text-sm">Preparar propuesta como borrador</button></div>}
      </section>
    </div>
  </div>;
}
