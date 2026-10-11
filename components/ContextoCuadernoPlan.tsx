import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { ContextoCuaderno, FuenteEscolar, recuperarContexto } from '../src/features/cuaderno/model';
import { listarFuentes } from '../src/features/cuaderno/storage';
export interface SeleccionCuadernoPlan { context: ContextoCuaderno; group: string; mode: 'local' | 'escuela'; cycle: string; ready: boolean }
export default function ContextoCuadernoPlan({ cycle, subject, topic, date, onChange, onOpen }: { cycle: string; subject: string; topic: string; date: string; onChange: (s: SeleccionCuadernoPlan | null) => void; onOpen: () => void }) {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false); const [group, setGroup] = useState(''); const [mode, setMode] = useState<'local' | 'escuela'>('local');
  const [items, setItems] = useState<FuenteEscolar[]>([]); const [error, setError] = useState('');
  const [revision, setRevision] = useState(0); const [ready, setReady] = useState(false);
  const schoolId = user?.schoolId || (user?.rol === 'guest' ? 'demo' : '');
  useEffect(() => {
    let active = true; setReady(false); setItems([]); setError(''); onChange(null);
    if (enabled && schoolId && user?.id) listarFuentes({ schoolId, userId: user.id, mode }).then(rows => { if (active) { setItems(rows); setReady(true); } }).catch(() => { if (active) setError('No se pudieron cargar las fuentes. Revisa acceso y conexión, y actualiza.'); });
    return () => { active = false; };
  }, [enabled, schoolId, user?.id, mode, revision]);
  const context = recuperarContexto(items, { schoolId, cycle, subject, group, date: date || new Date().toLocaleDateString('en-CA') }, topic);
  useEffect(() => {
    onChange(enabled ? { context, group: group.trim(), mode, cycle, ready: ready && !!group.trim() && !!cycle.trim() } : null);
  }, [enabled, ready, group, cycle, subject, topic, date, items, mode]);
  return <section className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3 mb-6"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold text-indigo-900">Aprender de la memoria escolar</h3><button type="button" onClick={onOpen} className="text-indigo-700 text-sm">Abrir cuaderno escolar</button></div><label className="flex gap-2"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> Usar fuentes revisadas para adaptar este plan</label>{enabled && <><div className="flex flex-wrap gap-3"><label className="text-sm">Grupo y turno<input aria-label="Grupo y turno del cuaderno" className="block border rounded p-2" placeholder="Ej. 1 A · Vespertino" value={group} onChange={e => setGroup(e.target.value)} /></label><label className="text-sm">Cuaderno<select className="block border rounded p-2" value={mode} onChange={e => setMode(e.target.value as typeof mode)}><option value="local">Personal de este navegador</option><option value="escuela">Compartido por la escuela</option></select></label><button type="button" onClick={() => setRevision(x => x + 1)} className="text-indigo-700 text-sm">Actualizar fuentes</button></div><p className="text-sm">Ciclo: {cycle || 'Completa el contexto escolar'} · {context.sourceCount} fuentes · {context.fragments.length} fragmentos. {context.omitted > 0 && `${context.omitted} fragmentos no incluidos por límite de contexto.`}</p>{(!group.trim() || !ready) && <p className="text-sm text-amber-800">Completa grupo y turno y espera a que se carguen las fuentes. La generación esperará hasta que el cuaderno esté listo.</p>}{error && <p role="alert" className="text-red-700">{error}</p>}<details><summary className="cursor-pointer text-sm">Revisar el contexto que recibirá la IA</summary>{context.fragments.map(f => <p key={f.id} className="text-xs p-2 border-t whitespace-pre-wrap">[{f.id}] {f.title} · {f.origin}\n{f.text}</p>)}</details><p className="text-xs text-slate-600">El grupo y turno deben coincidir con los registrados en las fuentes. Sólo se incluyen revisadas, vigentes a la fecha y del mismo ciclo. Los resultados nuevos se registran en el cuaderno para orientar el siguiente plan.</p></>}</section>;
}
