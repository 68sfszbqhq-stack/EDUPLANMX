import React, { useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCuestionarioIntegrado } from '../../hooks/useCuestionarioIntegrado';
import type { CuestionarioSocioEducativo } from '../../types/cuestionarioIntegrado';

// Importar los pasos
import PasoIntegrado1DatosGenerales from './PasoIntegrado1DatosGenerales';
import PasoIntegrado2Familia from './PasoIntegrado2Familia';
import PasoIntegrado3Economia from './PasoIntegrado3Economia';
import PasoIntegrado4Alumno from './PasoIntegrado4Alumno';
import PasoIntegrado5Comunidad from './PasoIntegrado5Comunidad';

interface Props {
    onGuardar: (cuestionario: CuestionarioSocioEducativo) => void;
    onCancelar: () => void;
}

const CuestionarioSocioEducativoIntegrado: React.FC<Props> = ({ onGuardar, onCancelar }) => {
    const [paso, setPaso] = useState(1);
    const TOTAL_PASOS = 5;

    const {
        datosGenerales,
        setDatosGenerales,
        datosFamiliares,
        setDatosFamiliares,
        datosEconomicos,
        setDatosEconomicos,
        datosAlumno,
        setDatosAlumno,
        contextoComunitario,
        setContextoComunitario,
        getCuestionarioCompleto,
        limpiarProgreso,
        getPorcentajeCompletitud
    } = useCuestionarioIntegrado();

    const handleSubmit = () => {
        const cuestionarioCompleto = getCuestionarioCompleto();
        onGuardar(cuestionarioCompleto);
        limpiarProgreso();
    };

    const renderPaso = () => {
        switch (paso) {
            case 1:
                return <PasoIntegrado1DatosGenerales datos={datosGenerales} setDatos={setDatosGenerales} />;
            case 2:
                return <PasoIntegrado2Familia datos={datosFamiliares} setDatos={setDatosFamiliares} />;
            case 3:
                return <PasoIntegrado3Economia datos={datosEconomicos} setDatos={setDatosEconomicos} />;
            case 4:
                return <PasoIntegrado4Alumno datos={datosAlumno} setDatos={setDatosAlumno} />;
            case 5:
                return <PasoIntegrado5Comunidad datos={contextoComunitario} setDatos={setContextoComunitario} />;
            default:
                return null;
        }
    };

    const pasoLabels = [
        { number: 1, label: 'Datos Generales', icon: '👤' },
        { number: 2, label: 'Familia', icon: '👨‍👩‍👧‍👦' },
        { number: 3, label: 'Economía', icon: '🏠' },
        { number: 4, label: 'Alumno', icon: '📚' },
        { number: 5, label: 'Comunidad', icon: '🌍' }
    ];

    const porcentaje = getPorcentajeCompletitud();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white rounded-t-2xl flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Cuestionario Socioeducativo</h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Paso {paso} de {TOTAL_PASOS} • {porcentaje}% completado
                            </p>
                        </div>
                        <button
                            onClick={onCancelar}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Cerrar (tu progreso se guarda automáticamente)"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                            style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }}
                        />
                    </div>

                    {/* Paso Indicadores */}
                    <div className="mt-5 grid grid-cols-5 gap-2">
                        {pasoLabels.map((item) => (
                            <div
                                key={item.number}
                                className={`flex flex-col items-center transition-all duration-300 ${paso === item.number ? 'scale-110' : 'scale-100 opacity-70'
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 text-lg transition-all duration-300 ${paso > item.number
                                            ? 'bg-green-400 text-white shadow-lg'
                                            : paso === item.number
                                                ? 'bg-white text-indigo-600 ring-4 ring-white/50 shadow-lg'
                                                : 'bg-white/20 text-white/50'
                                        }`}
                                >
                                    {paso > item.number ? '✓' : item.icon}
                                </div>
                                <span className={`text-xs font-medium hidden md:block ${paso === item.number ? 'text-white' : 'text-indigo-200'
                                    }`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-4xl mx-auto">
                        {renderPaso()}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 flex justify-between items-center flex-shrink-0 bg-gradient-to-r from-gray-50 to-slate-50">
                    <button
                        onClick={() => setPaso(Math.max(1, paso - 1))}
                        disabled={paso === 1}
                        className="px-6 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-white hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Anterior
                    </button>

                    <div className="text-center">
                        <div className="text-sm text-slate-600 font-medium">
                            {paso < TOTAL_PASOS && '💾 Tu progreso se guarda automáticamente'}
                            {paso === TOTAL_PASOS && '🎉 ¡Último paso! Revisa y guarda'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            Puedes cerrar y continuar después
                        </div>
                    </div>

                    {paso < TOTAL_PASOS ? (
                        <button
                            onClick={() => setPaso(paso + 1)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            Siguiente
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 text-lg"
                        >
                            <Save className="w-6 h-6" />
                            Guardar Cuestionario
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CuestionarioSocioEducativoIntegrado;
