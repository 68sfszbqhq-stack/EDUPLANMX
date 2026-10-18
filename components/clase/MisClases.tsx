import React, { useEffect, useState } from 'react';
import { Plus, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { ASIGNATURAS_CONECTADAS, Grupo, VistaPrevia } from '../../src/features/grupos/model';
import { crearGrupo, importarAlumnos, listarGrupos } from '../../src/features/grupos/storage';
import ImportarAlumnos from './ImportarAlumnos';
import Clase from './Clase';
import { input, boton } from './ui';

const COLORES_TARJETA = ['from-indigo-500 to-violet-500', 'from-sky-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-fuchsia-500 to-purple-500'];

export default function MisClases({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user } = useAuth();
  const esMuestra = user?.rol === 'guest';
  // En modo muestra no se lee Firebase: el cuaderno de clases necesita una cuenta
  const uid = esMuestra ? '' : (user?.id || '');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [activo, setActivo] = useState<Grupo | null>(null);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');
  const [cargado, setCargado] = useState(false);

  const recargar = async () => {
    if (!uid) return;
    try { setGrupos(await listarGrupos(uid)); } catch (e: any) { setError(`No pude leer tus clases: ${e.message}`); } finally { setCargado(true); }
  };
  useEffect(() => { recargar(); }, [uid]);

  if (esMuestra) return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 space-y-3">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5" /> Mis clases no está en el modo muestra</h2>
      <p className="text-slate-600">Aquí cada docente lleva su lista, asistencia, calificaciones y diario, y manda el resumen del grupo a su planeación. Como guarda datos de alumnos reales, necesita una cuenta.</p>
      <p className="text-slate-600">En la muestra, el diagnóstico del grupo ya está cargado en <b>Generar planeación</b> y en el <b>Flujo de contextualización</b>.</p>
      <button onClick={() => onNavigate?.('generator')} className={`${boton} bg-indigo-600 text-white`}>Ir a Generar planeación <ArrowRight className="w-4 h-4" /></button>
    </div>
  );
  if (!uid) return <p className="p-8 text-slate-600">Inicia sesión para ver tus clases.</p>;
  if (activo) return <Clase grupo={activo} onSalir={() => { setActivo(null); recargar(); }} onNavigate={onNavigate} />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 rounded-2xl"><Users className="w-7 h-7 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis clases</h1>
          <p className="text-slate-600 text-sm">Tu cuaderno completo: lista, asistencia, tareas, rúbricas, exámenes con IA y lo que pasa en cada clase.</p>
        </div>
      </header>
      {error && <p role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</p>}

      {creando ? (
        <NuevaClase uid={uid} onError={setError} onCancelar={() => setCreando(false)}
          onCreada={g => { setCreando(false); setError(''); setActivo(g); }} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((g, i) => (
            <button key={g.id} onClick={() => setActivo(g)} className="text-left rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <div className={`h-20 bg-gradient-to-r ${COLORES_TARJETA[i % COLORES_TARJETA.length]} p-4 flex items-end`}>
                <span className="text-white text-xl font-bold drop-shadow">{g.nombre}</span>
              </div>
              <div className="p-4 flex items-center">
                <span className="flex-1"><span className="block font-semibold text-slate-800">{g.asignaturaNombre}</span><span className="text-xs text-slate-500">{g.ciclo}</span></span>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </button>
          ))}
          <button onClick={() => setCreando(true)} className="rounded-2xl border-2 border-dashed border-indigo-300 text-indigo-700 min-h-[140px] flex flex-col items-center justify-center gap-2 hover:bg-indigo-50">
            <Plus className="w-8 h-8" /><span className="font-semibold">Nueva clase</span>
            {cargado && !grupos.length && <span className="text-xs text-slate-500 px-6 text-center">Pega los nombres desde Excel y listo.</span>}
          </button>
        </div>
      )}
    </div>
  );
}

function NuevaClase({ uid, onCreada, onCancelar, onError }: { uid: string; onCreada: (g: Grupo) => void; onCancelar: () => void; onError: (e: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [clave, setClave] = useState<string>(ASIGNATURAS_CONECTADAS[0].clave);
  const [otra, setOtra] = useState('');
  const [ciclo, setCiclo] = useState('2026-2027');
  const [vista, setVista] = useState<VistaPrevia | null>(null);
  const [aplicar, setAplicar] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const n = vista?.nuevos.length ?? 0;

  const crear = async () => {
    const conectada = ASIGNATURAS_CONECTADAS.find(a => a.clave === clave);
    const asignaturaNombre = conectada ? conectada.nombre : otra.trim();
    if (!nombre.trim()) return onError('Escribe el nombre del grupo, por ejemplo "1º A Vespertino".');
    if (!asignaturaNombre) return onError('Escribe el nombre de la asignatura.');
    setGuardando(true);
    try {
      const g = await crearGrupo(uid, { nombre: nombre.trim(), asignaturaClave: conectada ? clave : '', asignaturaNombre, ciclo: ciclo.trim() });
      if (vista && n) await importarAlumnos(g, vista, aplicar);
      onCreada(g);
    } catch (e: any) { onError(`No se pudo crear la clase: ${e.message}`); } finally { setGuardando(false); }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
      <h2 className="text-lg font-bold text-slate-800">Nueva clase</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs font-semibold text-slate-600">1. Grupo
          <input className={input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="1º A Vespertino" maxLength={60} autoFocus />
        </label>
        <label className="text-xs font-semibold text-slate-600">Asignatura
          <select className={input} value={clave} onChange={e => setClave(e.target.value)}>
            {ASIGNATURAS_CONECTADAS.map(a => <option key={a.clave} value={a.clave}>{a.nombre} (conectada a Antología)</option>)}
            <option value="">Otra asignatura…</option>
          </select>
          {clave === '' && <input className={`${input} mt-1`} value={otra} onChange={e => setOtra(e.target.value)} placeholder="Nombre de la asignatura" maxLength={120} />}
        </label>
        <label className="text-xs font-semibold text-slate-600">Ciclo
          <input className={input} value={ciclo} onChange={e => setCiclo(e.target.value)} maxLength={20} />
        </label>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">2. Tus alumnos (puedes agregarlos después)</p>
        <ImportarAlumnos existentes={[]} onCambio={(v, ap) => { setVista(v); setAplicar(ap); }} onError={onError} />
      </div>
      <div className="flex gap-2">
        <button onClick={crear} disabled={guardando} className={`${boton} bg-indigo-600 text-white text-base px-5`}>
          <Sparkles className="w-4 h-4" /> {guardando ? 'Armando la clase…' : n ? `Crear la clase con ${n} alumnos` : 'Crear la clase'}
        </button>
        <button onClick={onCancelar} className={`${boton} text-slate-600`}>Cancelar</button>
      </div>
    </section>
  );
}
