import React from 'react';
import { FileText, Calendar, BookOpen, Eye, GraduationCap, ArrowRight, Plus } from 'lucide-react';

interface Planeacion {
    id: string;
    materia: string;
    semestre: number;
    fecha: string;
    titulo?: string;
}

interface RecentPlaneacionesProps {
    planeaciones: Planeacion[];
    onView: (id: string) => void;
    onViewAll: () => void;
    onCreate?: () => void;
}

export const RecentPlaneaciones: React.FC<RecentPlaneacionesProps> = ({
    planeaciones,
    onView,
    onViewAll,
    onCreate
}) => {
    if (planeaciones.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-indigo-50 p-2 rounded-lg text-indigo-600">📋</span>
                    Planeaciones Recientes
                </h3>
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-semibold text-lg">Aún no has creado planeaciones</p>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                        Comienza creando tu primera planeación didáctica alineada al MCCEMS.
                    </p>
                    {onCreate && (
                        <button
                            onClick={onCreate}
                            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Nueva Planeación
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-indigo-50 p-2 rounded-lg text-indigo-600">📋</span>
                    Planeaciones Recientes
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1 group"
                >
                    Ver todas
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="space-y-4">
                {planeaciones.slice(0, 5).map((plan) => (
                    <div
                        key={plan.id}
                        className="group border border-slate-100 bg-slate-50/30 rounded-2xl p-4 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => onView(plan.id)}
                    >
                        {/* Indicador lateral sutil */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <div className="p-2 bg-indigo-50 rounded-lg mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">
                                        {plan.titulo || plan.materia}
                                    </h4>
                                </div>
                                <div className="flex flex-wrap items-center text-xs text-slate-500 gap-4 ml-11">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        {plan.materia}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                        {plan.semestre}° Semestre
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {new Date(plan.fecha).toLocaleDateString('es-MX', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(plan.id);
                                }}
                                className="ml-4 p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Ver detalles"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {planeaciones.length > 5 && (
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={onViewAll}
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 mx-auto"
                    >
                        Gestionar todas las planeaciones
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                            {planeaciones.length}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};
