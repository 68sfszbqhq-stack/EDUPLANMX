import React, { useEffect, useState } from 'react';
import { Building2, KeyRound, RefreshCw, CheckCircle2, XCircle, Clock, ShieldCheck, Copy, UserCog, Trash2 } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { Membresia, schoolService } from '../src/services/schoolService';
import { CodigoEscuela } from './onboarding/CodigoEscuela';

const boton = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50';

/**
 * Quién puede ver los datos de alumnos de la escuela. El directivo comparte el
 * código con su personal, aprueba a quien pidió acceso sin código y puede
 * cambiar el código si circuló de más. El docente ve aquí si su acceso ya está
 * verificado.
 */
export default function MiEscuela() {
  const { user } = useAuth();
  const schoolId = (user as any)?.schoolId as string | undefined;
  const esSuper = user?.rol === 'superadmin';
  const [mia, setMia] = useState<Membresia | null | undefined>(undefined);
  const [miembros, setMiembros] = useState<Membresia[]>([]);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [confirmarQuitar, setConfirmarQuitar] = useState('');

  const cargar = async () => {
    if (!schoolId || !user) return;
    try {
      const m = await schoolService.miMembresia(schoolId, user.id);
      setMia(m);
      if (esSuper || (m?.estado === 'aprobado' && m.rol === 'directivo')) {
        const [ms, c] = await Promise.all([schoolService.listarMiembros(schoolId), schoolService.leerCodigo(schoolId)]);
        setMiembros(ms); setCodigo(c);
      }
    } catch (e: any) { setError(`No pude leer los datos de tu escuela: ${e.message}`); }
  };
  useEffect(() => { cargar(); }, [schoolId, user?.id]);

  if (!user || !schoolId || schoolId === 'system') return <p className="p-8 text-slate-600">Tu cuenta no está ligada a ninguna escuela.</p>;
  if (mia === undefined) return <p className="p-8 text-slate-500">Cargando…</p>;

  const directivo = esSuper || (mia?.estado === 'aprobado' && mia.rol === 'directivo');
  const accion = async (fn: () => Promise<void>, texto: string) => {
    setError(''); setAviso('');
    try { await fn(); setAviso(texto); await cargar(); } catch (e: any) { setError(e.message); }
  };
  const pendientes = miembros.filter(m => m.estado === 'pendiente');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 rounded-2xl"><Building2 className="w-7 h-7 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{(user as any).schoolName || 'Mi escuela'}</h1>
          <p className="text-slate-600 text-sm">Solo el personal verificado de la escuela ve los datos de sus alumnos (CURP, contacto, situación familiar).</p>
        </div>
      </header>
      {error && <p role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</p>}
      {aviso && <p className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">{aviso}</p>}

      {/* Estado propio */}
      {mia?.estado === 'aprobado' ? (
        <p className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
          <ShieldCheck className="w-5 h-5" /> Tu acceso está verificado{mia.rol === 'directivo' ? ' como directivo' : ''}.
        </p>
      ) : !esSuper && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
          <p className="flex items-center gap-2 text-amber-900 font-semibold">
            <Clock className="w-5 h-5" />
            {mia?.estado === 'pendiente' ? 'Tu solicitud espera la aprobación de la dirección.' : mia?.estado === 'rechazado' ? 'La dirección no aprobó tu acceso. Habla con ella.' : 'Aún no tienes acceso verificado a esta escuela.'}
          </p>
          <p className="text-sm text-amber-800">Mientras tanto puedes usar todo EduPlan (planeaciones, Mis clases); solo los datos de alumnos de la escuela quedan cerrados. Si ya tienes el código, escríbelo:</p>
          {mia?.estado !== 'rechazado' && <CodigoEscuela schoolId={schoolId} schoolName={(user as any).schoolName || 'tu escuela'} onListo={cargar} />}
        </div>
      )}

      {directivo && (
        <>
          <section className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-600" /> Código de acceso</h2>
            <p className="text-sm text-slate-600">Compártelo solo con el personal de tu escuela: con él entran sin esperar tu aprobación. Si crees que circuló de más, cámbialo; quien ya entró no pierde su acceso.</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-2xl tracking-[0.3em] bg-slate-100 px-4 py-2 rounded-lg">{codigo ?? 'sin código'}</span>
              {codigo && <button onClick={() => { navigator.clipboard?.writeText(codigo); setAviso('Código copiado.'); }} className={`${boton} border border-slate-300 text-slate-700`}><Copy className="w-4 h-4" /> Copiar</button>}
              <button onClick={() => accion(async () => { setCodigo(await schoolService.cambiarCodigo(schoolId)); }, 'Código nuevo listo. El anterior ya no sirve para entrar.')}
                className={`${boton} border border-slate-300 text-slate-700`}><RefreshCw className="w-4 h-4" /> {codigo ? 'Cambiar código' : 'Crear código'}</button>
            </div>
          </section>

          <section className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h2 className="font-bold text-slate-800">Personal con acceso ({miembros.filter(m => m.estado === 'aprobado').length}){pendientes.length > 0 && <span className="ml-2 text-sm bg-amber-500 text-white rounded-full px-2">{pendientes.length} por aprobar</span>}</h2>
            <ul className="divide-y divide-slate-100">
              {miembros.map(m => (
                <li key={m.uid} className="py-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex-1 min-w-[200px]"><b>{m.nombre || '(sin nombre)'}</b> <span className="text-slate-500">{m.email}</span>
                    <span className="block text-xs text-slate-500">
                      {m.estado === 'pendiente' ? 'Pidió acceso' : m.estado === 'rechazado' ? 'Rechazado' : m.rol === 'directivo' ? 'Directivo' : m.codigo ? 'Docente (entró con el código)' : 'Docente (aprobado)'} · {m.creadoEn?.slice(0, 10)}
                    </span>
                  </span>
                  {m.estado !== 'aprobado' && <button onClick={() => accion(() => schoolService.revisarMiembro(schoolId, m, { estado: 'aprobado', rol: 'docente' }, user.id), `${m.nombre || m.email} ya tiene acceso.`)} className={`${boton} bg-emerald-600 text-white`}><CheckCircle2 className="w-4 h-4" /> Aprobar</button>}
                  {m.estado === 'pendiente' && <button onClick={() => accion(() => schoolService.revisarMiembro(schoolId, m, { estado: 'rechazado', rol: 'docente' }, user.id), 'Solicitud rechazada.')} className={`${boton} border border-rose-200 text-rose-700`}><XCircle className="w-4 h-4" /> Rechazar</button>}
                  {m.estado === 'aprobado' && m.uid !== user.id && (
                    <button onClick={() => accion(() => schoolService.revisarMiembro(schoolId, m, { estado: 'aprobado', rol: m.rol === 'directivo' ? 'docente' : 'directivo' }, user.id), 'Rol actualizado.')} className={`${boton} border border-slate-300 text-slate-700`} title="Los directivos ven el código y aprueban al personal">
                      <UserCog className="w-4 h-4" /> {m.rol === 'directivo' ? 'Quitar directivo' : 'Hacer directivo'}
                    </button>
                  )}
                  {m.uid !== user.id && (confirmarQuitar === m.uid
                    ? <button onClick={() => accion(() => schoolService.quitarMiembro(schoolId, m.uid), 'Acceso retirado.')} className={`${boton} bg-rose-600 text-white`}>Sí, quitar acceso</button>
                    : <button onClick={() => setConfirmarQuitar(m.uid)} className="p-1.5 text-slate-400 hover:text-rose-600" title="Quitar acceso"><Trash2 className="w-4 h-4" /></button>)}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

/** Aviso discreto arriba de la app mientras el acceso a los datos de alumnos no está verificado. */
export function AvisoAccesoEscuela({ onAbrir }: { onAbrir: () => void }) {
  const { user } = useAuth();
  const schoolId = (user as any)?.schoolId as string | undefined;
  const [estado, setEstado] = useState<string | null>(null);
  useEffect(() => {
    if (!user || !schoolId || schoolId === 'system' || user.rol === 'superadmin' || user.rol === 'guest') return;
    schoolService.miMembresia(schoolId, user.id).then(m => setEstado(m?.estado ?? 'sin')).catch(() => setEstado(null));
  }, [user?.id, schoolId]);
  if (!estado || estado === 'aprobado') return null;
  return (
    <button onClick={onAbrir} className="w-full text-left px-8 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-900 flex items-center gap-2">
      <Clock className="w-4 h-4 shrink-0" />
      {estado === 'pendiente' ? 'Tu acceso a los datos de alumnos de tu escuela espera aprobación de la dirección.' : 'Verifica tu acceso a los datos de alumnos de tu escuela con el código que te da la dirección.'}
      <span className="font-semibold underline ml-1">Ver</span>
    </button>
  );
}
