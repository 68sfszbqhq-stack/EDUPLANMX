import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Eye, EyeOff, Globe, Loader2, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { listarGrupos } from '../../src/features/grupos/storage';
import type { Grupo } from '../../src/features/grupos/model';
import {
  COLORES, ColorPagina, LIMITES, PaginaClase, SECCIONES, Seccion,
  aSlug, ordenarAvisos, paginaVacia, problemas, promptSitioPropio, slugValido, urlAntologia,
} from '../../src/features/pagina/modelo';
import { direccionLibre, guardarPagina, miPagina, urlPagina } from '../../src/features/pagina/storage';
import { boton, input } from '../clase/ui';

const ICONOS = ['📚', '💻', '🧪', '📐', '🌎', '🎨', '🏃', '🎵', '📝', '🧠', '⚽', '🔬'];
const hoy = () => new Date().toISOString().slice(0, 10);
const emulador = import.meta.env.VITE_EMULADOR === '1';

async function copiar(texto: string) {
  try { await navigator.clipboard.writeText(texto); return true; } catch { return false; }
}

/** Mi página de clases: cuestionario para crearla y panel para mantenerla al día. */
const MiPagina: React.FC = () => {
  const { user } = useAuth();
  const uid = user?.id || '';
  const [pagina, setPagina] = useState<PaginaClase | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargado, setCargado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uid) return;
    Promise.all([miPagina(uid), listarGrupos(uid)])
      .then(([p, g]) => { setPagina(p); setGrupos(g); })
      .catch(e => setError(`No pude leer tu página: ${e.message}`))
      .finally(() => setCargado(true));
  }, [uid]);

  if (!cargado) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>;

  const nombreDocente = [user?.nombre, (user as any)?.apellidoPaterno].filter(Boolean).join(' ');

  if (editando || !pagina) {
    if (!pagina && !editando) {
      return (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Globe className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Tu página de clases</h2>
          <p className="text-slate-600 mb-6">
            Contesta 4 preguntas y EduPlan arma una página para tus alumnos: tus materias, avisos, materiales
            y el acceso a sus exámenes en Antología. No necesitas programar ni contratar nada.
          </p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <button onClick={() => setEditando(true)} className={`${boton} bg-indigo-600 text-white px-5 py-3`}>
            Empezar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return (
      <Cuestionario
        inicial={pagina ?? paginaVacia(uid, nombreDocente, (user as any)?.schoolName ?? '')}
        grupos={grupos}
        uid={uid}
        onCancelar={() => setEditando(false)}
        onGuardada={p => { setPagina(p); setEditando(false); }}
      />
    );
  }

  return <Panel pagina={pagina} onCambio={setPagina} onEditar={() => setEditando(true)} />;
};

// ─── Cuestionario de 4 pasos ─────────────────────────────────────────────────

const PASOS = ['Tú', 'Estilo y dirección', 'Tus grupos', 'Secciones'];

function Cuestionario({ inicial, grupos, uid, onCancelar, onGuardada }: {
  inicial: PaginaClase; grupos: Grupo[]; uid: string;
  onCancelar: () => void; onGuardada: (p: PaginaClase) => void;
}) {
  const [p, setP] = useState<PaginaClase>(inicial);
  const [paso, setPaso] = useState(0);
  const [libre, setLibre] = useState<boolean | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const slugAnterior = inicial.actualizadoEn ? inicial.slug : undefined;
  const cambia = (c: Partial<PaginaClase>) => { setP(x => ({ ...x, ...c })); setError(''); };

  // Revisa si la dirección está libre mientras el docente escribe.
  useEffect(() => {
    setLibre(null);
    if (!slugValido(p.slug)) return;
    const t = setTimeout(() => direccionLibre(p.slug, uid).then(setLibre), 400);
    return () => clearTimeout(t);
  }, [p.slug, uid]);

  const elegido = (g: Grupo) => p.materias.some(m => m.grupo === g.nombre && m.nombre === g.asignaturaNombre);
  const alternar = (g: Grupo) => cambia({
    materias: elegido(g)
      ? p.materias.filter(m => !(m.grupo === g.nombre && m.nombre === g.asignaturaNombre))
      : [...p.materias, { nombre: g.asignaturaNombre, grupo: g.nombre, asignaturaClave: g.asignaturaClave }].slice(0, LIMITES.materias),
  });

  const puedeSeguir = paso === 0 ? !!p.nombre.trim() : paso === 1 ? slugValido(p.slug) && libre === true : true;

  const guardar = async () => {
    const mal = problemas(p);
    if (mal.length) return setError(mal[0]);
    setGuardando(true);
    try {
      await guardarPagina(p, slugAnterior);
      onGuardada({ ...p, actualizadoEn: new Date().toISOString() });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {PASOS.map((t, i) => (
          <div key={t} className="flex-1">
            <div className={`h-1 rounded-full ${i <= paso ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <p className={`text-xs mt-1 ${i === paso ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>{i + 1}. {t}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        {paso === 0 && (<>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">¿Cómo quieres que te vean tus alumnos?</h2>
          <label className="block text-sm font-medium text-slate-700">Tu nombre en la página
            <input className={`${input} mt-1`} value={p.nombre} maxLength={LIMITES.nombre} placeholder="Mtro. José Roberto Mendoza"
              onChange={e => cambia({ nombre: e.target.value, ...(inicial.actualizadoEn ? {} : { slug: aSlug(e.target.value) }) })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Escuela
            <input className={`${input} mt-1`} value={p.escuela} maxLength={LIMITES.escuela} onChange={e => cambia({ escuela: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Unas palabras para tus alumnos <span className="text-slate-400 font-normal">(opcional)</span>
            <textarea className={`${input} mt-1`} rows={3} value={p.presentacion} maxLength={LIMITES.presentacion}
              placeholder="Bienvenidos a Cultura Digital. Aquí encontrarán los avisos, materiales y sus exámenes."
              onChange={e => cambia({ presentacion: e.target.value })} />
          </label>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Un ícono</p>
            <div className="flex flex-wrap gap-2">
              {ICONOS.map(i => (
                <button key={i} onClick={() => cambia({ icono: i })}
                  className={`w-11 h-11 text-2xl rounded-xl border ${p.icono === i ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>{i}</button>
              ))}
            </div>
          </div>
        </>)}

        {paso === 1 && (<>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Color y dirección de tu página</h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(COLORES) as ColorPagina[]).map(c => (
              <button key={c} onClick={() => cambia({ color: c })} className="flex flex-col items-center gap-1">
                <span className={`w-11 h-11 rounded-full flex items-center justify-center ${p.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ background: COLORES[c].hex }}>
                  {p.color === c && <Check className="w-5 h-5 text-white" />}
                </span>
                <span className="text-xs text-slate-500">{COLORES[c].nombre}</span>
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium text-slate-700">Dirección (lo que va después de <span className="font-mono">/clase/</span>)
            <input className={`${input} mt-1 font-mono`} value={p.slug} maxLength={LIMITES.slugMax}
              onChange={e => cambia({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
          </label>
          <p className="text-sm">
            {!slugValido(p.slug) ? <span className="text-slate-500">Usa de 3 a 40 letras, números o guiones, sin espacios ni acentos.</span>
              : libre === null ? <span className="text-slate-500">Revisando…</span>
                : libre ? <span className="text-green-700">✓ Disponible: <span className="font-mono">{urlPagina(p.slug)}</span></span>
                  : <span className="text-red-600">Esa dirección ya la usa otro docente. Prueba con otra.</span>}
          </p>
          {slugAnterior && p.slug !== slugAnterior && (
            <p className="text-sm text-orange-700 bg-orange-50 rounded-lg p-3">Si cambias la dirección, el enlace anterior deja de funcionar: vuelve a compartir el nuevo con tus alumnos.</p>
          )}
        </>)}

        {paso === 2 && (<>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">¿Qué grupos aparecen en tu página?</h2>
          {grupos.length === 0
            ? <p className="text-slate-600">Todavía no tienes clases en <b>Mis clases</b>. Puedes seguir y agregarlas después.</p>
            : <div className="space-y-2">
              {grupos.map(g => (
                <label key={g.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={elegido(g)} onChange={() => alternar(g)} className="w-4 h-4" />
                  <span className="text-slate-900">{g.asignaturaNombre} <span className="text-slate-500">· {g.nombre}</span></span>
                </label>
              ))}
            </div>}
          <p className="text-xs text-slate-500">Solo se muestra el nombre de la materia y del grupo. Nunca aparecen nombres ni datos de tus alumnos.</p>
        </>)}

        {paso === 3 && (<>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">¿Qué secciones quieres?</h2>
          <div className="space-y-2">
            {(Object.keys(SECCIONES) as Seccion[]).map(s => (
              <label key={s} className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <input type="checkbox" className="w-4 h-4 mt-1" checked={!!p.secciones[s]} onChange={e => cambia({ secciones: { ...p.secciones, [s]: e.target.checked } })} />
                <span><span className="text-slate-900 font-medium">{SECCIONES[s].nombre}</span><br /><span className="text-sm text-slate-500">{SECCIONES[s].ayuda}</span></span>
              </label>
            ))}
          </div>
          {p.secciones.asesoria && (
            <label className="block text-sm font-medium text-slate-700">Horario y contacto para asesoría
              <textarea className={`${input} mt-1`} rows={2} value={p.asesoria} maxLength={LIMITES.asesoria}
                placeholder="Martes 13:00 a 14:00 en el laboratorio de cómputo." onChange={e => cambia({ asesoria: e.target.value })} />
            </label>
          )}
          <p className="text-xs text-slate-500">Avisos y materiales los agregas en el siguiente paso, cuando tu página ya exista.</p>
        </>)}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between pt-2">
          <button onClick={() => (paso === 0 ? onCancelar() : setPaso(paso - 1))} className={`${boton} text-slate-600 hover:bg-slate-100`}>
            <ArrowLeft className="w-4 h-4" /> {paso === 0 ? 'Cancelar' : 'Atrás'}
          </button>
          {paso < PASOS.length - 1
            ? <button disabled={!puedeSeguir} onClick={() => setPaso(paso + 1)} className={`${boton} bg-indigo-600 text-white`}>Siguiente <ArrowRight className="w-4 h-4" /></button>
            : <button disabled={guardando} onClick={guardar} className={`${boton} bg-indigo-600 text-white`}>
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Crear mi página
            </button>}
        </div>
      </div>
    </div>
  );
}

// ─── Panel: la página ya existe ──────────────────────────────────────────────

function Panel({ pagina, onCambio, onEditar }: { pagina: PaginaClase; onCambio: (p: PaginaClase) => void; onEditar: () => void }) {
  const [aviso, setAviso] = useState({ fecha: hoy(), texto: '' });
  const [material, setMaterial] = useState({ titulo: '', tema: '', url: '' });
  const [mensaje, setMsg] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [verPrompt, setVerPrompt] = useState(false);
  const url = urlPagina(pagina.slug);
  const color = COLORES[pagina.color];

  const guardar = async (p: PaginaClase, msg: string) => {
    const mal = problemas(p);
    if (mal.length) { setError(mal[0]); return false; }
    setGuardando(true); setError('');
    try {
      await guardarPagina(p);
      onCambio(p); setMsg(msg); setTimeout(() => setMsg(''), 2500);
      return true;
    } catch (e: any) {
      setError(e.message); return false;
    } finally {
      setGuardando(false);
    }
  };

  const agregarAviso = async () => {
    if (!aviso.texto.trim()) return;
    if (await guardar({ ...pagina, avisos: ordenarAvisos([{ fecha: aviso.fecha, texto: aviso.texto.trim() }, ...pagina.avisos]).slice(0, LIMITES.avisos) }, 'Aviso publicado'))
      setAviso({ fecha: hoy(), texto: '' });
  };
  const agregarMaterial = async () => {
    const m = { titulo: material.titulo.trim(), tema: material.tema.trim(), url: material.url.trim() };
    if (!m.titulo || !m.url) return setError('El material necesita título y enlace.');
    if (await guardar({ ...pagina, materiales: [...pagina.materiales, m] }, 'Material agregado'))
      setMaterial({ titulo: '', tema: m.tema, url: '' });
  };
  const temas = [...new Set(pagina.materiales.map(m => m.tema).filter(Boolean))];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado con el enlace para compartir */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: color.suave }}>{pagina.icono}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{pagina.nombre}</h2>
            <p className="text-sm text-slate-500">{pagina.publicada ? 'Publicada: tus alumnos la pueden ver' : 'Oculta: nadie más la puede ver'}</p>
          </div>
          <button onClick={onEditar} className={`${boton} border border-slate-200 text-slate-700 hover:bg-slate-50`}><Pencil className="w-4 h-4" /> Editar</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm bg-slate-100 rounded-lg px-3 py-2 truncate max-w-full">{url}</span>
          <button onClick={async () => setMsg(await copiar(url) ? 'Enlace copiado' : 'No pude copiar; selecciónalo a mano')} className={`${boton} bg-indigo-600 text-white`}><Copy className="w-4 h-4" /> Copiar enlace</button>
          <a href={url} target="_blank" rel="noopener noreferrer" className={`${boton} border border-slate-200 text-slate-700 hover:bg-slate-50`}><ExternalLink className="w-4 h-4" /> Ver mi página</a>
          <button disabled={guardando} onClick={() => guardar({ ...pagina, publicada: !pagina.publicada }, pagina.publicada ? 'Página oculta' : 'Página publicada')}
            className={`${boton} border border-slate-200 text-slate-700 hover:bg-slate-50`}>
            {pagina.publicada ? <><EyeOff className="w-4 h-4" /> Ocultar</> : <><Eye className="w-4 h-4" /> Publicar</>}
          </button>
        </div>
        {mensaje && <p className="text-sm text-green-700 mt-3">✓ {mensaje}</p>}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* Avisos */}
      {pagina.secciones.avisos && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Avisos</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="date" className={`${input} sm:w-40`} value={aviso.fecha} onChange={e => setAviso({ ...aviso, fecha: e.target.value })} />
            <input className={input} value={aviso.texto} maxLength={LIMITES.textoAviso} placeholder="Ej.: La comparativa se entrega el jueves 16."
              onChange={e => setAviso({ ...aviso, texto: e.target.value })} onKeyDown={e => e.key === 'Enter' && agregarAviso()} />
            <button disabled={guardando || !aviso.texto.trim()} onClick={agregarAviso} className={`${boton} bg-indigo-600 text-white justify-center`}><Plus className="w-4 h-4" /> Publicar</button>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {pagina.avisos.map((a, i) => (
              <li key={i} className="py-2 flex items-start gap-3">
                <span className="text-xs text-slate-500 w-20 flex-shrink-0 pt-0.5">{a.fecha}</span>
                <span className="flex-1 text-slate-800 text-sm">{a.texto}</span>
                <button title="Borrar aviso" onClick={() => guardar({ ...pagina, avisos: pagina.avisos.filter((_, j) => j !== i) }, 'Aviso borrado')} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
            {!pagina.avisos.length && <li className="py-2 text-sm text-slate-400">Sin avisos todavía.</li>}
          </ul>
        </div>
      )}

      {/* Materiales */}
      {pagina.secciones.materiales && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Materiales</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <input className={input} value={material.titulo} maxLength={LIMITES.tituloMaterial} placeholder="Título: Video «¿Qué es el software libre?»" onChange={e => setMaterial({ ...material, titulo: e.target.value })} />
            <input className={input} value={material.tema} maxLength={LIMITES.tema} list="temas-pagina" placeholder="Tema (opcional): Software libre" onChange={e => setMaterial({ ...material, tema: e.target.value })} />
            <datalist id="temas-pagina">{temas.map(t => <option key={t} value={t} />)}</datalist>
            <input className={`${input} sm:col-span-2`} value={material.url} maxLength={LIMITES.url} placeholder="Enlace: https://…" onChange={e => setMaterial({ ...material, url: e.target.value })} />
          </div>
          <button disabled={guardando} onClick={agregarMaterial} className={`${boton} bg-indigo-600 text-white mt-2`}><Plus className="w-4 h-4" /> Agregar material</button>
          <ul className="mt-4 divide-y divide-slate-100">
            {pagina.materiales.map((m, i) => (
              <li key={i} className="py-2 flex items-start gap-3">
                <span className="flex-1 min-w-0">
                  <span className="text-sm text-slate-900">{m.titulo}</span>
                  {m.tema && <span className="text-xs text-slate-500"> · {m.tema}</span>}
                  <span className="block text-xs text-slate-400 truncate">{m.url}</span>
                </span>
                <button title="Borrar material" onClick={() => guardar({ ...pagina, materiales: pagina.materiales.filter((_, j) => j !== i) }, 'Material borrado')} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
            {!pagina.materiales.length && <li className="py-2 text-sm text-slate-400">Sin materiales todavía.</li>}
          </ul>
        </div>
      )}

      {/* Modo avanzado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <button onClick={() => setVerPrompt(!verPrompt)} className="flex items-center gap-2 text-slate-900 font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Modo avanzado: crear tu propio sitio con IA
        </button>
        {verPrompt && (<>
          <p className="text-sm text-slate-600 mt-2">
            Si quieres un sitio totalmente tuyo, copia este texto y pégalo en ChatGPT, Gemini o Claude. Ya lleva tus datos y las reglas
            para que tu sitio no guarde datos de alumnos (los exámenes siguen en Antología, conectados a tu cuaderno).
            Tu página de EduPlan sigue funcionando aunque hagas la tuya.
          </p>
          <textarea readOnly className={`${input} mt-3 font-mono text-xs`} rows={12} value={promptSitioPropio(pagina, url, urlAntologia(emulador))} />
          <button onClick={async () => setMsg(await copiar(promptSitioPropio(pagina, url, urlAntologia(emulador))) ? 'Prompt copiado' : 'No pude copiar; selecciónalo a mano')}
            className={`${boton} bg-indigo-600 text-white mt-2`}><Copy className="w-4 h-4" /> Copiar prompt</button>
        </>)}
      </div>
    </div>
  );
}

export default MiPagina;
