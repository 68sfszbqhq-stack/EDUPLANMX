import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Calculator, Download, X, List, Users, MapPin, FileSignature } from 'lucide-react';
import type { DiagnosticoGrupal } from '../types/diagnostico';
import { ProyectoPAEC } from '../types/paec';
import { CONTEXTO_ESCOLAR_DEFAULT } from '../data/contextoEscolar';

interface PlanFactibleWebProps {
    onClose: () => void;
    diagnostico: DiagnosticoGrupal | null;
}

const PlanFactibleWeb: React.FC<PlanFactibleWebProps> = ({ onClose, diagnostico }) => {
    // Estado del Proyecto (Fusionando Default + Diagnóstico Real)
    const [proyecto, setProyecto] = useState<ProyectoPAEC>(CONTEXTO_ESCOLAR_DEFAULT);

    // Efecto para inyectar datos del diagnóstico en la estructura del proyecto
    useEffect(() => {
        if (diagnostico) {
            setProyecto(prev => ({
                ...prev,
                identidad: {
                    ...prev.identidad,
                    titulo_proyecto: diagnostico.problemaPAEC?.problema ? `Intervención: ${diagnostico.problemaPAEC.problema}` : prev.identidad.titulo_proyecto,
                },
                ficha_administrativa: {
                    ...prev.ficha_administrativa,
                    poblacion: {
                        ...prev.ficha_administrativa.poblacion,
                        total_participantes: diagnostico.totalAlumnos || 0,
                        // Aquí se podrían mapear más datos demográficos si el diagnóstico los tuviera
                        estudiantes_hombres: Math.floor((diagnostico.totalAlumnos || 0) / 2), // Estimación simple
                        estudiantes_mujeres: Math.ceil((diagnostico.totalAlumnos || 0) / 2)
                    }
                }
            }));
        }
    }, [diagnostico]);

    const { encabezado, identidad, contenido, matriz_actividades, ficha_administrativa, firmas } = proyecto;

    return (
        <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto animate-in slide-in-from-bottom duration-300">

            {/* --- BARRA DE HERRAMIENTAS (NO IMPRIMIBLE) --- */}
            <nav className="sticky top-0 bg-white border-b border-slate-200 z-40 px-6 py-4 flex justify-between items-center shadow-sm print:hidden">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg">Visor de Plan Factible</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full border border-slate-200">Borrador</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Exportar PDF
                    </button>
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-2xl my-8 p-[2cm] print:shadow-none print:my-0 print:p-0 print:w-full">

                {/* 1. CONSTANCIA INSTITUCIONAL (HEADER) */}
                <header className="border-b-2 border-slate-800 pb-6 mb-8 text-center text-slate-900">
                    <h1 className="text-sm font-bold uppercase tracking-widest text-slate-500">{encabezado.institucion_superior}</h1>
                    <h2 className="text-xs font-semibold uppercase text-slate-500 mb-4">{encabezado.subsecretaria}</h2>

                    <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-2 text-xs font-mono text-slate-600">
                        <span>{encabezado.supervision_escolar}</span>
                        <span>CCT: <strong>{encabezado.cct}</strong></span>
                    </div>

                    <div className="text-3xl font-serif font-bold mt-4 mb-1">{encabezado.nombre_escuela}</div>
                    <div className="text-sm italic text-slate-600">Turno: {encabezado.turno}</div>
                </header>

                {/* 2. METADATA DEL PROYECTO */}
                <section className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 print:bg-white print:border-slate-800">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Programa</span>
                            <div className="font-bold text-lg text-slate-800">{identidad.nombre_programa}</div>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Ciclo Escolar</span>
                            <div className="font-bold text-lg text-slate-800">{identidad.ciclo_escolar}</div>
                        </div>
                        <div className="col-span-2 mt-2 pt-4 border-t border-slate-200 border-dashed">
                            <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Título del Proyecto</span>
                            <div className="text-2xl font-extrabold text-indigo-900 leading-tight">"{identidad.titulo_proyecto}"</div>
                        </div>
                    </div>
                </section>

                {/* 3. FICHA ADMINISTRATIVA (STATS) */}
                <section className="mb-8">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-2 mb-4">
                        <MapPin className="w-4 h-4" /> Contexto y Población
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-slate-500 text-xs">Ubicación</div>
                            <div className="font-semibold">{ficha_administrativa.localidad}, {ficha_administrativa.municipio}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-slate-500 text-xs">Población Estudiantil</div>
                            <div className="font-semibold">{ficha_administrativa.poblacion.total_participantes} Alumnos</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100">
                            <div className="text-slate-500 text-xs">Padres de Familia</div>
                            <div className="font-semibold">{ficha_administrativa.poblacion.padres_tutores} Tutores</div>
                        </div>
                    </div>
                </section>

                {/* 4. NARRATIVA (STATIC CONTENT) */}
                <section className="mb-8 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Justificación</h3>
                        <p className="text-justify text-slate-700 text-sm leading-relaxed">{contenido.justificacion}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Propósito General</h3>
                        <p className="text-justify text-slate-700 text-sm leading-relaxed">{contenido.proposito_general}</p>
                    </div>
                </section>

                {/* 5. MATRIZ DE ACTIVIDADES (GRID) */}
                <section className="mb-12">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-2 mb-4">
                        <List className="w-4 h-4" /> Matriz de Actividades y Transversalidad
                    </h3>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-3 w-1/6">Fase</th>
                                    <th className="p-3 w-1/6">Asignatura</th>
                                    <th className="p-3 w-1/3">Actividad Clave</th>
                                    <th className="p-3 w-1/6">Evidencia</th>
                                    <th className="p-3 w-1/6">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {matriz_actividades.map((act) => (
                                    <tr key={act.id} className="hover:bg-slate-50">
                                        <td className="p-3 font-semibold text-slate-900">{act.fase_proyecto}</td>
                                        <td className="p-3 text-indigo-700">{act.asignatura}</td>
                                        <td className="p-3 text-slate-600">{act.actividades_clave}</td>
                                        <td className="p-3 text-slate-500 italic">{act.evidencia_esperada}</td>
                                        <td className="p-3 text-slate-500 text-xs">{act.semana_ejecucion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 6. FIRMAS (FOOTER) */}
                <footer className="mt-16 pt-8 border-t-2 border-slate-800 break-inside-avoid">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase mb-8">
                        <FileSignature className="w-4 h-4" /> Comité Responsable
                    </h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-16">
                        {firmas.map((firma, idx) => (
                            <div key={idx} className="text-center">
                                <div className="border-b border-black w-2/3 mx-auto mb-2"></div>
                                <div className="font-bold text-sm">{firma.nombre}</div>
                                <div className="text-xs text-slate-500 uppercase">{firma.cargo}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-[10px] text-center text-slate-400 font-mono">
                        Documento generado digitalmente por Plataforma EDUPLANMX | {new Date().getFullYear()}
                    </div>
                </footer>

            </main>
        </div>
    );
};

export default PlanFactibleWeb;
