import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Alumno } from '../types/diagnostico';
import { useFormularioAlumno } from '../hooks/useFormularioAlumno';
import Paso1Identidad from './pasos/Paso1Identidad';
import Paso2Familia from './pasos/Paso2Familia';
import Paso3EconomiaSalud from './pasos/Paso3EconomiaSalud';
import Paso4ContextoPAEC from './pasos/Paso4ContextoPAEC';
import Paso5Intereses from './pasos/Paso5Intereses';

interface FormularioAlumnoProps {
    onGuardar: (alumno: Alumno) => void;
    onCancelar: () => void;
}

const FormularioAlumno: React.FC<FormularioAlumnoProps> = ({ onGuardar, onCancelar }) => {
    const [paso, setPaso] = useState(1);
    const TOTAL_PASOS = 5;

    const {
        datosAdmin,
        setDatosAdmin,
        redApoyo,
        setRedApoyo,
        datosNEM,
        setDatosNEM,
        limpiarProgreso
    } = useFormularioAlumno();

    const handleSubmit = () => {
        const nuevoAlumno: Alumno = {
            id: `ALU-${Date.now()}`,
            datosAdministrativos: datosAdmin,
            datosNEM: {
                ...datosNEM,
                redApoyo: redApoyo
            } as any,
            fechaRegistro: new Date().toISOString()
        };
        onGuardar(nuevoAlumno);
        limpiarProgreso();
    };

    const renderPaso = () => {
        switch (paso) {
            case 1:
                return <Paso1Identidad datosAdmin={datosAdmin} setDatosAdmin={setDatosAdmin} />;
            case 2:
                return (
                    <Paso2Familia
                        datosNEM={datosNEM}
                        setDatosNEM={setDatosNEM}
                        redApoyo={redApoyo}
                        setRedApoyo={setRedApoyo}
                    />
                );
            case 3:
                return <Paso3EconomiaSalud datosNEM={datosNEM} setDatosNEM={setDatosNEM} />;
            case 4:
                return <Paso4ContextoPAEC datosNEM={datosNEM} setDatosNEM={setDatosNEM} />;
            case 5:
                return <Paso5Intereses datosNEM={datosNEM} setDatosNEM={setDatosNEM} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Registro de Alumno</h2>
                            <p className="text-indigo-100 text-sm mt-1">Paso {paso} de {TOTAL_PASOS}</p>
                        </div>
                        <button
                            onClick={onCancelar}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }}
                        />
                    </div>

                    {/* Paso Indicadores */}
                    <div className="mt-4 flex justify-between text-xs">
                        {['Identidad', 'Familia', 'Economía', 'Comunidad', 'Intereses'].map((label, idx) => (
                            <div
                                key={label}
                                className={`flex flex-col items-center ${paso === idx + 1 ? 'text-white' : 'text-indigo-200'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${paso > idx + 1
                                            ? 'bg-white text-indigo-600'
                                            : paso === idx + 1
                                                ? 'bg-white text-indigo-600 ring-2 ring-white/50'
                                                : 'bg-white/20'
                                        }`}
                                >
                                    {paso > idx + 1 ? '✓' : idx + 1}
                                </div>
                                <span className="hidden md:block">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderPaso()}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 flex justify-between items-center flex-shrink-0 bg-slate-50">
                    <button
                        onClick={() => setPaso(Math.max(1, paso - 1))}
                        disabled={paso === 1}
                        className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Anterior
                    </button>

                    <div className="text-sm text-slate-500">
                        {paso < TOTAL_PASOS && 'Tu progreso se guarda automáticamente'}
                        {paso === TOTAL_PASOS && '¡Último paso! Revisa y guarda'}
                    </div>

                    {paso < TOTAL_PASOS ? (
                        <button
                            onClick={() => setPaso(paso + 1)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all flex items-center gap-2 font-semibold shadow-lg"
                        >
                            <Save className="w-5 h-5" />
                            Guardar Alumno
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormularioAlumno;
