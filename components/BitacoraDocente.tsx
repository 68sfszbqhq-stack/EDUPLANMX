import React, { useState } from 'react';
import { NotebookPen, Trash2, AlertTriangle, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { BitacoraEntry, SemaforoNivel } from '../types';
import { bitacoraService, SEMAFORO_INFO } from '../src/services/bitacoraService';
import { flujoContextoService } from '../src/services/flujoContextoService';

interface BitacoraDocenteProps {
    materiaActiva?: string;
    onNavigate: (view: string) => void;
}

// Fecha local en formato YYYY-MM-DD. No usamos toISOString(): convierte a UTC y en México
// (UTC-6) las sesiones de la tarde-noche quedarían fechadas al día siguiente.
const hoyISO = () => {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${ahora.getFullYear()}-${mes}-${dia}`;
};

const BitacoraDocente: React.FC<BitacoraDocenteProps> = ({ materiaActiva, onNavigate }) => {
    const [entradas, setEntradas] = useState<BitacoraEntry[]>(() => bitacoraService.listar());
    const [copiado, setCopiado] = useState(false);
    const [volcado, setVolcado] = useState(false);

    const [form, setForm] = useState({
        fecha: hoyISO(),
        grupo: '',
        materia: materiaActiva || '',
        tema: '',
        semaforo: 'verde' as SemaforoNivel,
        quePaso: '',
        queFallo: '',
        queSigue: '',
    });

    const resumen = bitacoraService.resumen(entradas);
    const resumenTexto = bitacoraService.generarResumenParaDiagnostico(entradas);

    const registrar = () => {
        if (!form.tema.trim()) return;
        setEntradas(bitacoraService.guardar(form));
        setForm(f => ({ ...f, tema: '', quePaso: '', queFallo: '', queSigue: '', semaforo: 'verde' }));
    };

    const borrar = (id: string) => setEntradas(bitacoraService.eliminar(id));

    const copiarResumen = () => {
        navigator.clipboard.writeText(resumenTexto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    // Cierra el ciclo: los hallazgos vuelven al Flujo de Contextualización (Fase 1)
    const volcarADiagnostico = () => {
        const flujo = flujoContextoService.load();
        const previo = flujo.grupo.desafios.trim();
        flujoContextoService.save({
            ...flujo,
            grupo: {
                ...flujo.grupo,
                desafios: previo ? `${previo}\n\n[Desde bitácora] ${resumenTexto}` : `[Desde bitácora] ${resumenTexto}`,
            },
        });
        setVolcado(true);
        setTimeout(() => setVolcado(false), 3000);
    };

    return (
        <div className="space-y-5 pb-16 max-w-3xl mx-auto">
            <div className="bg-slate-800 text-white rounded-2xl p-6">
                <div className="flex items-center gap-3">
                    <NotebookPen className="w-8 h-8 text-emerald-300" />
                    <div>
                        <h2 className="text-xl font-bold">Bitácora Docente</h2>
                        <p className="text-slate-300 text-sm">Menos es más: qué pasó, qué falló y qué sigue. Un registro por sesión.</p>
                    </div>
                </div>
                {resumen.total > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                        {(Object.keys(SEMAFORO_INFO) as SemaforoNivel[]).map(nivel => (
                            <div key={nivel} className="flex items-center gap-1.5 bg-slate-700 px-3 py-1.5 rounded-lg">
                                <span>{SEMAFORO_INFO[nivel].emoji}</span>
                                <span className="text-sm font-bold">{resumen[nivel]}</span>
                                <span className="text-xs text-slate-300">{SEMAFORO_INFO[nivel].etiqueta}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 bg-slate-700 px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-bold">{resumen.total}</span>
                            <span className="text-xs text-slate-300">sesiones registradas</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Alerta basada en evidencia: argumento ante la Academia de Zona */}
            {resumen.alerta && (
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-red-900 text-sm">
                            El {resumen.porcentajeRojo}% de tus sesiones registradas quedó en rojo
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                            Esto es evidencia sólida —no una impresión— para llevar a la Academia de Zona y solicitar
                            apoyos o proponer un proyecto de refuerzo. También justifica ajustar tu PMC.
                        </p>
                    </div>
                </div>
            )}

            {/* Formulario de registro */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-4">Registrar sesión</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Fecha</label>
                        <input
                            type="date"
                            value={form.fecha}
                            onChange={e => setForm({ ...form, fecha: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Grupo</label>
                        <input
                            type="text"
                            value={form.grupo}
                            onChange={e => setForm({ ...form, grupo: e.target.value })}
                            placeholder="Ej. 3°B"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">Materia</label>
                        <input
                            type="text"
                            value={form.materia}
                            onChange={e => setForm({ ...form, materia: e.target.value })}
                            placeholder="Ej. Pensamiento Matemático"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                </div>

                <div className="space-y-1 mb-3">
                    <label className="text-xs font-bold text-slate-600">Tema de la sesión</label>
                    <input
                        type="text"
                        value={form.tema}
                        onChange={e => setForm({ ...form, tema: e.target.value })}
                        placeholder="Ej. Tablas de verdad y conectores lógicos"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Semáforo grupal</label>
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(SEMAFORO_INFO) as SemaforoNivel[]).map(nivel => (
                            <button
                                key={nivel}
                                type="button"
                                onClick={() => setForm({ ...form, semaforo: nivel })}
                                className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.semaforo === nivel
                                    ? SEMAFORO_INFO[nivel].clase + ' scale-105'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                                {SEMAFORO_INFO[nivel].emoji} {SEMAFORO_INFO[nivel].etiqueta}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700">¿Qué pasó?</label>
                        <textarea
                            value={form.quePaso}
                            onChange={e => setForm({ ...form, quePaso: e.target.value })}
                            placeholder="Logros de la sesión"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-400 min-h-[70px]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-700">¿Qué falló?</label>
                        <textarea
                            value={form.queFallo}
                            onChange={e => setForm({ ...form, queFallo: e.target.value })}
                            placeholder="Obstáculos didácticos o técnicos"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400 min-h-[70px]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-indigo-700">¿Qué sigue?</label>
                        <textarea
                            value={form.queSigue}
                            onChange={e => setForm({ ...form, queSigue: e.target.value })}
                            placeholder="Acuerdo de mejora o ajuste"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 min-h-[70px]"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={registrar}
                    disabled={!form.tema.trim()}
                    className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold transition-colors"
                >
                    Registrar en la bitácora
                </button>
            </section>

            {/* Cierre del ciclo: los hallazgos regresan al flujo */}
            {resumenTexto && (
                <section className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-5">
                    <h3 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Cierra el ciclo: alimenta tu próximo diagnóstico
                    </h3>
                    <p className="text-xs text-indigo-700 mb-3">
                        Esto es lo que tu bitácora dice del grupo. Mándalo al Flujo de Contextualización y la Fase 1
                        del siguiente parcial ya no empieza de cero.
                    </p>
                    <p className="bg-white rounded-xl border border-indigo-200 p-3 text-sm text-slate-700 mb-3">
                        {resumenTexto}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={volcarADiagnostico}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold"
                        >
                            {volcado ? <><CheckCircle2 className="w-4 h-4" /> Enviado al flujo</> : <>Enviar al Flujo de Contextualización</>}
                        </button>
                        <button
                            type="button"
                            onClick={copiarResumen}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-sm font-bold hover:bg-indigo-100"
                        >
                            {copiado ? <><CheckCircle2 className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate('flujo')}
                            className="px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-sm font-bold hover:bg-indigo-100"
                        >
                            Abrir el flujo
                        </button>
                    </div>
                </section>
            )}

            {/* Historial */}
            <section>
                <h3 className="font-bold text-slate-800 mb-3">Historial</h3>
                {entradas.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <NotebookPen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Aún no registras sesiones. La primera toma menos de un minuto.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entradas.map(e => (
                            <div key={e.id} className={`rounded-2xl border-2 p-4 ${SEMAFORO_INFO[e.semaforo].clase}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm">
                                            {SEMAFORO_INFO[e.semaforo].emoji} {e.tema}
                                        </p>
                                        <p className="text-[11px] opacity-80">
                                            {e.fecha}{e.grupo && ` · ${e.grupo}`}{e.materia && ` · ${e.materia}`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => borrar(e.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/60 flex-shrink-0"
                                        title="Eliminar registro"
                                    >
                                        <Trash2 className="w-4 h-4 opacity-60" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                                    {e.quePaso && <p><span className="font-bold">Pasó: </span>{e.quePaso}</p>}
                                    {e.queFallo && <p><span className="font-bold">Falló: </span>{e.queFallo}</p>}
                                    {e.queSigue && <p><span className="font-bold">Sigue: </span>{e.queSigue}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default BitacoraDocente;
