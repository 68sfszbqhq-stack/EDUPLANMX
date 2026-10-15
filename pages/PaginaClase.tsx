import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, ClipboardCheck, ExternalLink, Loader2, Megaphone, MessageCircle, Stethoscope } from 'lucide-react';
import { COLORES, PaginaClase as Pagina, materialesPorTema, moduloAntologia, ordenarAvisos, urlAntologia, urlSegura } from '../src/features/pagina/modelo';
import { leerPagina } from '../src/features/pagina/storage';

const antologia = urlAntologia(import.meta.env.VITE_EMULADOR === '1');

function fechaBonita(f: string) {
  const d = new Date(`${f}T12:00:00`);
  return isNaN(d.getTime()) ? f : d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * Página pública de clases de un docente: /clase/:slug. No pide cuenta y no
 * muestra datos de alumnos. Los exámenes y el diagnóstico se contestan en
 * Antología, con la cuenta de Google del alumno.
 */
const PaginaClase: React.FC = () => {
  const { slug = '' } = useParams();
  const [p, setP] = useState<Pagina | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    leerPagina(slug).then(x => { setP(x && x.publicada ? x : null); setCargado(true); });
  }, [slug]);

  useEffect(() => { if (p) document.title = `${p.nombre} · Clases`; }, [p]);

  if (!cargado) return <div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!p) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-5xl mb-4">🔎</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">No encontramos esta página</h1>
          <p className="text-slate-500 mt-2">Revisa el enlace con tu profesor o profesora.</p>
        </div>
      </div>
    );
  }

  const c = COLORES[p.color] ?? COLORES.azul;
  const avisos = ordenarAvisos(p.avisos ?? []);
  const temas = materialesPorTema(p.materiales ?? []);
  const boton = 'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-medium transition-opacity hover:opacity-90';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-5xl" style={{ background: c.suave }}>{p.icono || '📚'}</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">{p.nombre}</h1>
          {p.escuela && <p className="text-slate-500 mt-2">{p.escuela}</p>}
          {p.presentacion && <p className="text-lg text-slate-700 mt-5 max-w-xl mx-auto leading-relaxed whitespace-pre-line">{p.presentacion}</p>}
          {p.materias?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {p.materias.map(m => (
                <span key={`${m.nombre}-${m.grupo}`} className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: c.suave, color: c.hex }}>
                  {m.nombre} · {m.grupo}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {(p.secciones?.examenes || p.secciones?.diagnostico) && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-1">Tus actividades</h2>
            <p className="text-sm text-slate-500 mb-4">Entras con tu cuenta de Google y tus resultados le llegan a tu profesor(a).</p>
            <div className="flex flex-col sm:flex-row gap-3">
              {p.secciones.examenes && <a href={`${antologia}/mis-examenes`} className={boton} style={{ background: c.hex }}><ClipboardCheck className="w-5 h-5" /> Mis exámenes</a>}
              {p.secciones.diagnostico && <a href={`${antologia}/diagnostico`} className={boton} style={{ background: c.hex }}><Stethoscope className="w-5 h-5" /> Diagnóstico</a>}
            </div>
            {[...new Set((p.materias ?? []).map(m => moduloAntologia(m.asignaturaClave)).filter(Boolean))].map(ruta => (
              <a key={ruta} href={`${antologia}${ruta}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium mr-4" style={{ color: c.hex }}>
                <BookOpen className="w-4 h-4" /> Módulos de {ruta === '/cultura-digital' ? 'Cultura Digital' : 'Lengua y Comunicación'}
              </a>
            ))}
          </section>
        )}

        {p.secciones?.avisos && avisos.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5" style={{ color: c.hex }} /> Avisos</h2>
            <ul className="space-y-4">
              {avisos.map((a, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-xs font-medium uppercase text-slate-500 w-20 flex-shrink-0 pt-1">{fechaBonita(a.fecha)}</span>
                  <p className="text-slate-800 whitespace-pre-line">{a.texto}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.secciones?.materiales && temas.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" style={{ color: c.hex }} /> Materiales</h2>
            <div className="space-y-5">
              {temas.map(([tema, ms]) => (
                <div key={tema}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">{tema}</h3>
                  <ul className="divide-y divide-slate-100">
                    {ms.map((m, i) => (
                      <li key={i} className="py-2">
                        {/* Solo enlaces https: lo que no pase la revisión se muestra como texto. */}
                        {urlSegura(m.url)
                          ? <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 group">
                            <span className="text-slate-900 group-hover:underline">{m.titulo}</span>
                            <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: c.hex }} />
                          </a>
                          : <span className="text-slate-900">{m.titulo}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {p.secciones?.asesoria && p.asesoria && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5" style={{ color: c.hex }} /> Asesoría</h2>
            <p className="text-slate-700 whitespace-pre-line">{p.asesoria}</p>
          </section>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-8">Hecho con EduPlan MX</footer>
    </div>
  );
};

export default PaginaClase;
