import React, { useEffect, useRef, useState } from 'react';
import { RevisionContexto, contextoAutorizado } from '../src/features/planeacion/revisionContexto';

/** La lectura breve es el estado inicial; el texto completo aparece al editar. */
function TarjetaRevision({ titulo, texto, incluido, onIncluir, children }: {
  titulo: string; texto: string; incluido: boolean; onIncluir?: () => void; children: React.ReactNode;
}) {
  const [editando, setEditando] = useState(false);
  return <div className={`border rounded-xl p-4 space-y-3 ${incluido ? 'bg-white' : 'bg-slate-50'}`}>
    <div className="flex items-start justify-between gap-3">
      <h3 className="font-semibold text-slate-900 break-words min-w-0">{titulo}</h3>
      {!incluido && <span className="text-xs text-slate-500 shrink-0">No se comparte</span>}
    </div>
    {incluido && (editando ? children : <p className="text-sm text-slate-600 whitespace-pre-wrap break-words line-clamp-3">{texto.trim() || 'Sin texto.'}</p>)}
    <div className="flex flex-wrap gap-2">
      {incluido && <button type="button" aria-label={`${editando ? 'Listo' : 'Editar'}: ${titulo}`} aria-expanded={editando} onClick={() => setEditando(!editando)} className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-blue-700 hover:bg-blue-50">{editando ? 'Listo' : 'Editar'}</button>}
      {onIncluir && <button type="button" aria-label={`${incluido ? 'No compartir' : 'Compartir'}: ${titulo}`} onClick={() => { onIncluir(); setEditando(false); }} className="px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100">{incluido ? 'No compartir' : 'Compartir'}</button>}
    </div>
  </div>;
}

export default function RevisionContextoIA({ inicial, onCancelar, onEnviar }: {
  inicial: RevisionContexto;
  onCancelar: () => void;
  onEnviar: (contexto: ReturnType<typeof contextoAutorizado>) => Promise<void>;
}) {
  const [revision, setRevision] = useState(inicial);
  const [excluidos, setExcluidos] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [compatibles, setCompatibles] = useState(false);
  const usaAnteriores = revision.bloques.some(b => ['flujo', 'perfil'].includes(b.id) && b.incluir);
  const bloqueo = useRef(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titulo.current?.focus(); }, []);
  const enviar = async () => {
    if (bloqueo.current || (usaAnteriores && !compatibles)) return;
    bloqueo.current = true;
    setEnviando(true);
    setError('');
    try {
      const revisado = { ...revision, cuaderno: revision.cuaderno ? { ...revision.cuaderno, fragments: revision.cuaderno.fragments.filter(f => !excluidos.includes(f.id)) } : undefined };
      await onEnviar(contextoAutorizado(revisado));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar. Puedes intentar de nuevo.');
    } finally { bloqueo.current = false; setEnviando(false); }
  };
  const principales = revision.bloques.filter(b => ['diagnostico', 'diario'].includes(b.id));
  const anteriores = revision.bloques.filter(b => ['flujo', 'perfil'].includes(b.id));
  const adicionales = revision.bloques.filter(b => b.id === 'configuracion');
  const fuentes = revision.cuaderno?.fragments || [];
  const compartidos = adicionales.filter(b => b.incluir && b.texto.trim()).length + fuentes.filter(f => !excluidos.includes(f.id) && f.text.trim()).length;
  const nombre = (b: RevisionContexto['bloques'][number]) => b.id === 'diario' ? 'Diario de clase' : b.id === 'flujo' ? 'Contexto del grupo y la escuela' : b.titulo;
  const tarjeta = (b: RevisionContexto['bloques'][number]) => <TarjetaRevision key={b.id} titulo={nombre(b)} texto={b.texto} incluido={b.incluir}
    onIncluir={b.id === 'configuracion' ? undefined : () => { setCompatibles(false); setRevision(r => ({ ...r, bloques: r.bloques.map(x => x.id === b.id ? { ...x, incluir: !x.incluir } : x) })); }}>
    <textarea aria-label={nombre(b)} value={b.texto} rows={6} autoFocus className="w-full border rounded-lg p-3 text-sm" onChange={e => setRevision(r => ({ ...r, bloques: r.bloques.map(x => x.id === b.id ? { ...x, texto: e.target.value } : x) }))} />
  </TarjetaRevision>;
  return <section aria-labelledby="revision-contexto-titulo" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
    <h2 id="revision-contexto-titulo" tabIndex={-1} ref={titulo} className="text-xl font-bold text-slate-900">Revisa qué compartes</h2>
    <p className="text-sm text-slate-600">Quita nombres y datos personales de estudiantes antes de enviarlos a la IA.</p>
    {revision.resumen && <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-1" aria-label="Resumen de la planeación">{revision.resumen.map((texto, i) => <p key={i} className={i === 2 ? 'max-h-24 overflow-auto' : ''}>{texto}</p>)}</div>}
    <fieldset disabled={enviando} className="space-y-3">
      {principales.map(tarjeta)}
      {!principales.length && <p className="text-sm text-slate-600">No agregaste diagnóstico ni diario para compartir.</p>}
      {!!anteriores.length && <details className="border rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium">Datos guardados de otras clases (opcionales)</summary>
        <p className="text-sm text-slate-600 my-3">Se usará tu diagnóstico actual. Agrega estos datos solo si siguen vigentes: recursos, apoyos y proyecto pueden haber cambiado.</p>
        <div className="space-y-3">{anteriores.map(tarjeta)}</div>
        {usaAnteriores && <label className="flex gap-2 text-sm mt-3"><input type="checkbox" checked={compatibles} onChange={e => setCompatibles(e.target.checked)} />Revisé que estos datos sean compatibles con esta clase. Las decisiones actuales tienen prioridad.</label>}
      </details>}
      <details className="border rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">Fuentes y detalles del envío ({compartidos})</summary>
        <div className="space-y-3 mt-4">
          <p className="text-xs text-slate-500">Los cambios se usan solo en esta planeación. También se envían el programa curricular, el formato y los datos de contexto escolar del generador.</p>
          {adicionales.map(tarjeta)}
          {fuentes.map((f, i) => <TarjetaRevision key={f.id} titulo={`Fuente ${i + 1}: ${f.title || 'Sin título'}`} texto={f.text} incluido={!excluidos.includes(f.id)} onIncluir={() => setExcluidos(ids => ids.includes(f.id) ? ids.filter(id => id !== f.id) : [...ids, f.id])}>
            {(['title', 'origin', 'text'] as const).map(campo => <label key={campo} className="block text-sm">{campo === 'title' ? 'Título' : campo === 'origin' ? 'De dónde viene' : 'Texto'}
              <textarea rows={campo === 'text' ? 6 : 2} value={f[campo]} className="w-full border rounded-lg p-2" onChange={e => setRevision(r => ({ ...r, cuaderno: r.cuaderno ? { ...r.cuaderno, fragments: r.cuaderno.fragments.map(x => x.id === f.id ? { ...x, [campo]: e.target.value } : x) } : undefined }))} />
            </label>)}
          </TarjetaRevision>)}
        </div>
      </details>
    </fieldset>
    {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    {enviando && <p role="status" className="text-sm">Generando tu planeación… Puede tardar unos minutos.</p>}
    <div className="sticky bottom-0 bg-white py-3 flex flex-wrap justify-end gap-3 border-t border-slate-100">
      <button disabled={enviando} onClick={onCancelar} className="px-4 py-3 border rounded-xl disabled:opacity-50">Volver</button>
      <button disabled={enviando || (usaAnteriores && !compatibles) || !revision.bloques.find(b => b.id === 'configuracion')?.texto.trim()} onClick={enviar} className="px-4 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">{enviando ? 'Generando…' : 'Generar planeación'}</button>
    </div>
  </section>;
}
