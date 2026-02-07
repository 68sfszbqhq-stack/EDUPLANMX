import React, { useMemo } from 'react';
import { Link2, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { transversalidadService, SugerenciaTransversal } from '../../src/services/transversalidadService';

interface SugerenciasTransversalidadProps {
    materia: string;
    semestre: number;
    progresionId?: number;
    onSelectSugerencia?: (sugerencia: SugerenciaTransversal) => void;
}

export const SugerenciasTransversalidad: React.FC<SugerenciasTransversalidadProps> = ({
    materia,
    semestre,
    progresionId,
    onSelectSugerencia
}) => {
    const analisis = useMemo(() => {
        if (!progresionId) return null;
        return transversalidadService.buscarTransversalidad(materia, semestre, progresionId);
    }, [materia, semestre, progresionId]);

    if (!analisis || analisis.sugerencias.length === 0) {
        return null;
    }

    const getAfinidadColor = (nivel: 'alta' | 'media' | 'baja') => {
        switch (nivel) {
            case 'alta': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'media': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'baja': return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getAfinidadLabel = (nivel: 'alta' | 'media' | 'baja') => {
        switch (nivel) {
            case 'alta': return 'Alta afinidad';
            case 'media': return 'Afinidad media';
            case 'baja': return 'Afinidad baja';
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            Sugerencias de Transversalidad
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                        </h3>
                        <p className="text-purple-100 text-sm">
                            Materias con temáticas relacionadas a tu progresión
                        </p>
                    </div>
                </div>
            </div>

            {/* Temáticas de origen */}
            <div className="px-4 py-3 bg-white/50 border-b border-purple-100">
                <p className="text-xs text-slate-500 mb-1">Temáticas de tu progresión:</p>
                <div className="flex flex-wrap gap-2">
                    {analisis.tematicasOrigen.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Sugerencias */}
            <div className="p-4 space-y-3">
                {analisis.sugerencias.map((sug, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => onSelectSugerencia?.(sug)}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                <span className="font-semibold text-slate-800">{sug.materia}</span>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Sem. {sug.semestre}
                                </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getAfinidadColor(sug.nivelAfinidad)}`}>
                                {getAfinidadLabel(sug.nivelAfinidad)}
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                            Progresión {sug.progresionId}: {sug.progresionDescripcion}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-2">
                            {sug.tematicasComunes.map((t, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500 italic line-clamp-1">
                                {sug.justificacion}
                            </p>
                            <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Texto para copiar */}
            <div className="px-4 pb-4">
                <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                    <p className="text-xs font-medium text-slate-700 mb-1">
                        📝 Texto sugerido para tu planeación:
                    </p>
                    <p className="text-sm text-slate-600 italic">
                        "Esta planeación se vincula con <strong>{analisis.sugerencias[0]?.materia}</strong> mediante
                        el abordaje compartido de {analisis.sugerencias[0]?.tematicasComunes.slice(0, 2).join(' y ')},
                        promoviendo la interdisciplinariedad propuesta por el MCCEMS."
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Componente compacto para mostrar solo el texto de transversalidad
 */
export const TransversalidadTexto: React.FC<{
    materia: string;
    semestre: number;
    progresionId: number;
}> = ({ materia, semestre, progresionId }) => {
    const analisis = useMemo(() => {
        return transversalidadService.buscarTransversalidad(materia, semestre, progresionId);
    }, [materia, semestre, progresionId]);

    if (!analisis || analisis.sugerencias.length === 0) {
        return (
            <p className="text-slate-500 italic">
                No se encontraron sugerencias de transversalidad automáticas para esta progresión.
            </p>
        );
    }

    const top2 = analisis.sugerencias.slice(0, 2);

    return (
        <div className="space-y-2">
            <p className="text-slate-700">
                Esta planeación se vincula con:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
                {top2.map((sug, i) => (
                    <li key={i}>
                        <strong>{sug.materia}</strong> (Sem. {sug.semestre}): {sug.tematicasComunes.join(', ')}
                    </li>
                ))}
            </ul>
            <p className="text-sm text-slate-500 italic mt-2">
                {top2[0]?.justificacion}
            </p>
        </div>
    );
};

export default SugerenciasTransversalidad;
