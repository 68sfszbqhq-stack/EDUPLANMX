import React, { useEffect, useState } from 'react';
import {
    Compass, School, Users, ShieldAlert, Network, BookOpen, Sparkles,
    CheckCircle2, ChevronDown, ArrowDown, RefreshCw, ArrowRight
} from 'lucide-react';
import { SchoolContext, SubjectContext, ContextoFlujo, BAPCategoriaId } from '../types';
import { flujoContextoService, ESTRATEGIAS_BAP } from '../src/services/flujoContextoService';

interface FlujoContextualizacionProps {
    school: SchoolContext;
    subject: SubjectContext;
    onNavigate: (view: string) => void;
}

// Conector visual entre fases: la flecha "se enciende" cuando la fase de arriba tiene datos
const Flecha: React.FC<{ activa: boolean; label: string }> = ({ activa, label }) => (
    <div className="flex flex-col items-center py-1" aria-hidden="true">
        <ArrowDown className={`w-6 h-6 ${activa ? 'text-emerald-500' : 'text-slate-300'}`} />
        <p className={`text-[11px] italic text-center max-w-md ${activa ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</p>
    </div>
);

// Tarjeta de fase plegable con número, fuente oficial y palomita de completado
const FaseCard: React.FC<{
    numero: string;
    titulo: string;
    fuente: string;
    completa: boolean;
    abierta: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ numero, titulo, fuente, completa, abierta, onToggle, children }) => (
    <section className={`bg-white rounded-2xl border-2 transition-colors ${completa ? 'border-emerald-300' : 'border-slate-200'}`}>
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center gap-3 p-4 text-left"
        >
            {completa ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0" />
            ) : (
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {numero}
                </span>
            )}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800">{titulo}</h3>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{fuente}</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${abierta ? 'rotate-180' : ''}`} />
        </button>
        {abierta && <div className="px-4 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </section>
);

const Campo: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    multiline?: boolean;
}> = ({ label, value, onChange, placeholder, multiline }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600">{label}</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 min-h-[70px]"
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
        )}
    </div>
);

const FlujoContextualizacion: React.FC<FlujoContextualizacionProps> = ({ school, subject, onNavigate }) => {
    const [flujo, setFlujo] = useState<ContextoFlujo>(() => flujoContextoService.load());
    const [asignaturaInput, setAsignaturaInput] = useState('');

    const fases = flujoContextoService.fases(flujo);
    const completas = flujoContextoService.fasesCompletas(flujo);

    // Abrir por defecto la primera fase sin datos
    const [abiertas, setAbiertas] = useState<Record<string, boolean>>(() => {
        const f = flujoContextoService.fases(flujoContextoService.load());
        return {
            plantel: !f.plantel,
            grupo: f.plantel && !f.grupo,
            bap: f.grupo && !f.bap,
            paec: f.bap && !f.paec,
        };
    });
    const toggle = (id: string) => setAbiertas(prev => ({ ...prev, [id]: !prev[id] }));

    // Autoguardado: cada cambio persiste de inmediato en este navegador
    useEffect(() => {
        flujoContextoService.save(flujo);
    }, [flujo]);

    const setPlantel = (campo: keyof ContextoFlujo['plantel'], valor: string) =>
        setFlujo(prev => ({ ...prev, plantel: { ...prev.plantel, [campo]: valor } }));
    const setGrupo = (campo: keyof ContextoFlujo['grupo'], valor: string) =>
        setFlujo(prev => ({ ...prev, grupo: { ...prev.grupo, [campo]: valor } }));
    const setPaec = (campo: 'problematica' | 'productoComunitario' | 'actores', valor: string) =>
        setFlujo(prev => ({ ...prev, paec: { ...prev.paec, [campo]: valor } }));

    const toggleBap = (id: BAPCategoriaId) =>
        setFlujo(prev => ({
            ...prev,
            bap: { ...prev.bap, [id]: { ...prev.bap[id], detectada: !prev.bap[id].detectada } },
        }));
    const setBapNotas = (id: BAPCategoriaId, notas: string) =>
        setFlujo(prev => ({ ...prev, bap: { ...prev.bap, [id]: { ...prev.bap[id], notas } } }));
    const toggleEstrategia = (id: BAPCategoriaId, estrategia: string) =>
        setFlujo(prev => {
            const elegidas = prev.bap[id].estrategiasElegidas;
            const nuevas = elegidas.includes(estrategia)
                ? elegidas.filter(e => e !== estrategia)
                : [...elegidas, estrategia];
            return { ...prev, bap: { ...prev.bap, [id]: { ...prev.bap[id], estrategiasElegidas: nuevas } } };
        });

    const agregarAsignatura = () => {
        const nombre = asignaturaInput.trim();
        if (!nombre || flujo.paec.asignaturas.includes(nombre)) return;
        setFlujo(prev => ({ ...prev, paec: { ...prev.paec, asignaturas: [...prev.paec.asignaturas, nombre] } }));
        setAsignaturaInput('');
    };
    const quitarAsignatura = (nombre: string) =>
        setFlujo(prev => ({ ...prev, paec: { ...prev.paec, asignaturas: prev.paec.asignaturas.filter(a => a !== nombre) } }));

    // Mapa de trazabilidad: qué dato alimenta qué sección de la planeación
    const trazabilidad: Array<{ dato: string; destino: string; listo: boolean }> = [
        { dato: 'Diagnóstico del grupo', destino: 'Apertura situada con los intereses reales del grupo', listo: fases.grupo },
        { dato: 'Registro de BAP', destino: 'Ajustes razonables marcados con [Ajuste BAP] en el desarrollo', listo: fases.bap },
        { dato: 'PAEC / comunidad', destino: 'Producto final con utilidad social en el cierre', listo: fases.paec },
        { dato: 'Contexto del plantel', destino: 'Viabilidad real: conectividad, recursos e indicadores', listo: fases.plantel },
        { dato: 'Selección curricular', destino: 'Progresión, meta educativa y propósito formativo oficiales', listo: Boolean(subject.subjectName) },
    ];

    return (
        <div className="space-y-2 pb-16 max-w-3xl mx-auto">
            {/* Encabezado con avance */}
            <div className="bg-indigo-900 text-white rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <Compass className="w-8 h-8 text-indigo-300" />
                    <div>
                        <h2 className="text-xl font-bold">Flujo de Contextualización</h2>
                        <p className="text-indigo-300 text-sm">Cada dato que rellenes aquí aterriza en una sección concreta de tu planeación.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 bg-indigo-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${(completas / 4) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-indigo-200">{completas}/4 fases</span>
                </div>
            </div>

            {/* FASE 0 — Contexto del plantel */}
            <FaseCard
                numero="0" titulo="Contexto del plantel" fuente="Fichas 43–44 · una vez por ciclo"
                completa={fases.plantel} abierta={Boolean(abiertas.plantel)} onToggle={() => toggle('plantel')}
            >
                <div className="flex items-start gap-2 mb-3 text-xs text-slate-500">
                    <School className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Los datos de identidad ({school.schoolName || 'tu plantel'}, CCT {school.cct || 'sin capturar'}) se editan en <button type="button" onClick={() => onNavigate('context')} className="text-indigo-600 underline font-semibold">Contexto Escolar</button>. Aquí capturas lo que contextualiza: indicadores y condiciones reales.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Campo label="% Aprobación" value={flujo.plantel.aprobacion} onChange={v => setPlantel('aprobacion', v)} placeholder="Ej. 78%" />
                    <Campo label="% Abandono" value={flujo.plantel.abandono} onChange={v => setPlantel('abandono', v)} placeholder="Ej. 9%" />
                    <Campo label="Eficiencia terminal" value={flujo.plantel.eficienciaTerminal} onChange={v => setPlantel('eficienciaTerminal', v)} placeholder="Ej. 72%" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Campo label="Conectividad y equipamiento" value={flujo.plantel.conectividad} onChange={v => setPlantel('conectividad', v)} placeholder="Ej. Internet intermitente, 1 proyector, sin sala de cómputo" multiline />
                    <Campo label="Fortalezas del plantel (FODA)" value={flujo.plantel.fortalezas} onChange={v => setPlantel('fortalezas', v)} placeholder="Ej. Colectivo docente unido, vínculo fuerte con la comunidad" multiline />
                </div>
            </FaseCard>

            <Flecha activa={fases.plantel} label="El plantel da el marco: viabilidad, recursos e indicadores" />

            {/* FASE 1 — Diagnóstico del grupo */}
            <FaseCard
                numero="1" titulo="Diagnóstico del grupo" fuente="Fichas 01 y 24 · inicio de semestre"
                completa={fases.grupo} abierta={Boolean(abiertas.grupo)} onToggle={() => toggle('grupo')}
            >
                <div className="flex items-start gap-2 mb-3 text-xs text-slate-500">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Desde la escucha empática (Ficha 01). Si aplicaste el cuestionario de la app, revisa el <button type="button" onClick={() => onNavigate('diagnostico')} className="text-indigo-600 underline font-semibold">Diagnóstico del Grupo</button> y resume aquí lo esencial.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Campo label="Gustos e intereses" value={flujo.grupo.intereses} onChange={v => setGrupo('intereses', v)} placeholder="Ej. Futbol, música regional, redes sociales, cocina" multiline />
                    <Campo label="Saberes previos y familiares" value={flujo.grupo.saberesPrevios} onChange={v => setGrupo('saberesPrevios', v)} placeholder="Ej. Trabajo agrícola, panadería casera, comercio local" multiline />
                    <Campo label="Desafíos de aprendizaje" value={flujo.grupo.desafios} onChange={v => setGrupo('desafios', v)} placeholder="Ej. Comprensión lectora baja, dificultad con fracciones" multiline />
                    <Campo label="Estado socioemocional" value={flujo.grupo.socioemocional} onChange={v => setGrupo('socioemocional', v)} placeholder="Ej. Ansiedad ante exposiciones, fatiga por doble jornada" multiline />
                    <Campo label="Alumnado que trabaja" value={flujo.grupo.porcentajeTrabaja} onChange={v => setGrupo('porcentajeTrabaja', v)} placeholder="Ej. ~40% trabaja por las mañanas o fines de semana" />
                    <Campo label="Estilos de aprendizaje predominantes" value={flujo.grupo.estilosAprendizaje} onChange={v => setGrupo('estilosAprendizaje', v)} placeholder="Ej. Visual y kinestésico; poca tolerancia a exposición larga" />
                </div>
            </FaseCard>

            <Flecha activa={fases.grupo} label="El grupo da la voz: la apertura parte de sus intereses reales" />

            {/* FASE 2 — Registro de BAP */}
            <FaseCard
                numero="2" titulo="Registro de Barreras (BAP)" fuente="Ficha 08 · instrumento oficial"
                completa={fases.bap} abierta={Boolean(abiertas.bap)} onToggle={() => toggle('bap')}
            >
                <div className="flex items-start gap-2 mb-3 text-xs text-slate-500">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Marca las categorías donde detectas barreras. Por cada una, la app te sugiere estrategias de la Ficha 08: las que elijas se inyectan como <span className="font-mono font-semibold">[Ajuste BAP]</span> en tu secuencia.</p>
                </div>
                <div className="space-y-3">
                    {(Object.keys(ESTRATEGIAS_BAP) as BAPCategoriaId[]).map(id => {
                        const cat = flujo.bap[id];
                        const info = ESTRATEGIAS_BAP[id];
                        return (
                            <div key={id} className={`rounded-xl border p-3 ${cat.detectada ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cat.detectada}
                                        onChange={() => toggleBap(id)}
                                        className="mt-1 w-4 h-4 accent-amber-600"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-slate-700">{info.etiqueta}</span>
                                        <p className="text-xs text-slate-500">{info.descripcion}</p>
                                    </div>
                                </label>
                                {cat.detectada && (
                                    <div className="mt-3 pl-6 space-y-2.5">
                                        <input
                                            type="text"
                                            value={cat.notas}
                                            onChange={e => setBapNotas(id, e.target.value)}
                                            placeholder="Describe brevemente la barrera en TU grupo..."
                                            className="w-full p-2 rounded-lg border border-amber-200 bg-white text-sm focus:ring-2 focus:ring-amber-400"
                                        />
                                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">⚙ Estrategias sugeridas (elige las que aplicarás)</p>
                                        {info.estrategias.map(est => (
                                            <label key={est} className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={cat.estrategiasElegidas.includes(est)}
                                                    onChange={() => toggleEstrategia(id, est)}
                                                    className="mt-0.5 w-3.5 h-3.5 accent-emerald-600"
                                                />
                                                <span>{est}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </FaseCard>

            <Flecha activa={fases.bap} label="Las barreras se vuelven ajustes razonables dentro de la secuencia" />

            {/* FASE 3 — PAEC */}
            <FaseCard
                numero="3" titulo="Contexto comunitario y PAEC" fuente="Fichas 39–42 · PAEC"
                completa={fases.paec} abierta={Boolean(abiertas.paec)} onToggle={() => toggle('paec')}
            >
                <div className="flex items-start gap-2 mb-3 text-xs text-slate-500">
                    <Network className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>El sentido social de la planeación. Si tu plantel ya tiene proyectos PEC activos, gestiónalos en <button type="button" onClick={() => onNavigate('paec')} className="text-indigo-600 underline font-semibold">Comité PAEC</button>.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Campo label="Problemática del entorno" value={flujo.paec.problematica} onChange={v => setPaec('problematica', v)} placeholder="Ej. Desperdicio de agua en la colonia, pérdida de identidad cultural" multiline />
                    <Campo label="Producto comunitario esperado" value={flujo.paec.productoComunitario} onChange={v => setPaec('productoComunitario', v)} placeholder="Ej. Campaña de carteles, feria comunitaria, video documental" multiline />
                    <Campo label="Actores de la comunidad" value={flujo.paec.actores} onChange={v => setPaec('actores', v)} placeholder="Ej. Padres de familia, autoridad local, adultos mayores" />
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Asignaturas articuladas</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={asignaturaInput}
                                onChange={e => setAsignaturaInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarAsignatura(); } }}
                                placeholder="Escribe y presiona Enter"
                                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400"
                            />
                            <button type="button" onClick={agregarAsignatura} className="px-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700">+</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {flujo.paec.asignaturas.map(a => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => quitarAsignatura(a)}
                                    title="Quitar"
                                    className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                >
                                    {a} ✕
                                </button>
                            ))}
                        </div>
                        {flujo.paec.asignaturas.length > 0 && (
                            <p className={`text-[11px] font-semibold ${flujo.paec.asignaturas.length >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {flujo.paec.asignaturas.length >= 3
                                    ? '✅ Con 3 o más asignaturas ya es PAEC formal (no solo proyecto integrador).'
                                    : `⚠️ Llevas ${flujo.paec.asignaturas.length}. El PAEC formal requiere 3 o más asignaturas; con 2 es proyecto integrador.`}
                            </p>
                        )}
                    </div>
                </div>
            </FaseCard>

            <Flecha activa={fases.paec} label="El proyecto comunitario le da destino al contenido curricular" />

            {/* FASE 4 — Selección curricular (informativa, ya vive en la app) */}
            <section className="bg-white rounded-2xl border-2 border-slate-200 p-4">
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800">Selección curricular</h3>
                        <p className="text-xs text-slate-500">
                            {subject.subjectName
                                ? <>Materia activa: <span className="font-bold text-indigo-700">{subject.subjectName}</span>. La progresión, meta y propósito se eligen al generar.</>
                                : 'Aún no tienes materia seleccionada: revisa la Guía Curricular o el Contexto Escolar.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onNavigate('guia-curricular')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                        <BookOpen className="w-4 h-4" /> Guía Curricular
                    </button>
                </div>
            </section>

            <Flecha activa={completas > 0} label="Todo lo capturado — plantel + grupo + BAP + PAEC — arma el prompt de la IA" />

            {/* RESULTADO — trazabilidad y CTA al generador */}
            <section className="bg-emerald-50 rounded-2xl border-2 border-emerald-400 p-5">
                <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                    <div>
                        <h3 className="font-bold text-emerald-900 text-lg">Planeación contextualizada</h3>
                        <p className="text-xs text-emerald-700">Mapa de trazabilidad: de dónde viene cada sección de tu documento.</p>
                    </div>
                </div>
                <ul className="space-y-2 mb-4">
                    {trazabilidad.map(t => (
                        <li key={t.dato} className="flex items-start gap-2 text-sm">
                            {t.listo
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                : <span className="w-4 h-4 rounded-full border-2 border-slate-300 mt-0.5 flex-shrink-0" />}
                            <span className={`font-mono text-xs font-bold mt-0.5 ${t.listo ? 'text-emerald-800' : 'text-slate-400'}`}>{t.dato}</span>
                            <ArrowRight className={`w-3.5 h-3.5 mt-1 flex-shrink-0 ${t.listo ? 'text-emerald-500' : 'text-slate-300'}`} />
                            <span className={t.listo ? 'text-slate-700' : 'text-slate-400'}>{t.destino}</span>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    onClick={() => onNavigate('generator')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-colors"
                >
                    <Sparkles className="w-5 h-5" />
                    Generar planeación con este contexto ({completas}/4 fases activas)
                </button>
                {completas === 0 && (
                    <p className="text-[11px] text-emerald-700 text-center mt-2">
                        Puedes generar sin fases, pero la planeación saldrá genérica. Cada fase que llenes la vuelve más TUYA.
                    </p>
                )}
            </section>

            {/* Bucle de mejora continua */}
            <div className="mt-4 border-2 border-dashed border-indigo-300 rounded-2xl p-4 flex flex-wrap items-start gap-3">
                <RefreshCw className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 flex-1 min-w-[15rem]">
                    <span className="font-bold text-slate-800">El ciclo no termina aquí.</span> Después de aplicar tu planeación,
                    registra en la bitácora qué pasó, qué falló y qué sigue (semáforo 🟢🟡🔴). Desde ahí puedes mandar
                    los hallazgos de vuelta a la Fase 1: el siguiente parcial ya no empieza de cero.
                </p>
                <button
                    type="button"
                    onClick={() => onNavigate('bitacora')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
                >
                    Abrir bitácora
                </button>
            </div>
        </div>
    );
};

export default FlujoContextualizacion;
