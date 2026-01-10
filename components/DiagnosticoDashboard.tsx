import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Target, TrendingUp, Wifi, WifiOff, Plus, FileText } from 'lucide-react';
import type { Alumno, DiagnosticoGrupal } from '../types/diagnostico';
import { diagnosticoService } from '../services/diagnosticoService';
import FormularioAlumno from './FormularioAlumno';

const DiagnosticoDashboard: React.FC = () => {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [diagnostico, setDiagnostico] = useState<DiagnosticoGrupal | null>(null);
    const [cargando, setCargando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Cargar alumnos desde localStorage
    useEffect(() => {
        const alumnosGuardados = localStorage.getItem('alumnos');
        if (alumnosGuardados) {
            setAlumnos(JSON.parse(alumnosGuardados));
        }
    }, []);

    // Guardar alumnos en localStorage
    useEffect(() => {
        if (alumnos.length > 0) {
            localStorage.setItem('alumnos', JSON.stringify(alumnos));
        }
    }, [alumnos]);

    const handleGuardarAlumno = (nuevoAlumno: Alumno) => {
        setAlumnos([...alumnos, nuevoAlumno]);
        setMostrarFormulario(false);
    };

    const handleGenerarDiagnostico = async () => {
        if (alumnos.length === 0) {
            alert('Necesitas al menos un alumno registrado para generar el diagnóstico');
            return;
        }

        setCargando(true);
        try {
            const resultado = await diagnosticoService.procesarDiagnosticoGrupal(alumnos);
            setDiagnostico(resultado);
        } catch (error) {
            console.error('Error al generar diagnóstico:', error);
            alert('Hubo un error al generar el diagnóstico. Verifica tu API Key.');
        } finally {
            setCargando(false);
        }
    };

    const getNivelRiesgoColor = (nivel: string) => {
        switch (nivel) {
            case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
            case 'Alto': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Diagnóstico Socioeducativo</h2>
                <p className="text-indigo-100">
                    Módulo Raíz - Análisis inteligente del contexto del alumno para PAEC y PMC
                </p>
                <div className="mt-6 flex gap-4">
                    <button
                        onClick={() => setMostrarFormulario(true)}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Alumno
                    </button>
                    <button
                        onClick={handleGenerarDiagnostico}
                        disabled={cargando || alumnos.length === 0}
                        className="bg-indigo-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText className="w-5 h-5" />
                        {cargando ? 'Procesando...' : 'Generar Diagnóstico'}
                    </button>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{alumnos.length}</div>
                            <div className="text-sm text-slate-500">Alumnos Registrados</div>
                        </div>
                    </div>
                </div>

                {diagnostico && (
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-3 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{diagnostico.promedioGrupal}</div>
                                    <div className="text-sm text-slate-500">Promedio Grupal</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 p-3 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{diagnostico.alertasAbandono.length}</div>
                                    <div className="text-sm text-slate-500">Alertas de Riesgo</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-3 rounded-xl">
                                    <Wifi className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">{diagnostico.contextoDigital.porcentajeConectividad}%</div>
                                    <div className="text-sm text-slate-500">Con Internet</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Diagnóstico Completo */}
            {diagnostico && (
                <div className="space-y-6">
                    {/* Perfil de Aprendizaje */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-indigo-600" />
                            Perfil de Aprendizaje Grupal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Estilos Dominantes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {diagnostico.perfilAprendizaje.estilosDominantes.map((estilo, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                            {estilo}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Ganchos de Interés</h4>
                                <div className="flex flex-wrap gap-2">
                                    {diagnostico.perfilAprendizaje.ganchosInteres.map((gancho, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            {gancho}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-slate-700 mb-2">Recomendaciones Didácticas</h4>
                                <ul className="space-y-2">
                                    {diagnostico.perfilAprendizaje.recomendacionesDidacticas.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="text-indigo-600 font-bold">•</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Alertas de Abandono */}
                    {diagnostico.alertasAbandono.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                                Semáforo de Abandono Escolar
                            </h3>
                            <div className="space-y-3">
                                {diagnostico.alertasAbandono.map((alerta, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${getNivelRiesgoColor(alerta.nivelRiesgo)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold">{alerta.nombreAlumno}</h4>
                                                <p className="text-xs opacity-75">ID: {alerta.alumnoId}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold">
                                                Riesgo {alerta.nivelRiesgo}
                                            </span>
                                        </div>
                                        <div className="text-sm mb-2">
                                            <strong>Factores:</strong> {alerta.factoresRiesgo.join(', ')}
                                        </div>
                                        <div className="text-sm">
                                            <strong>Recomendaciones:</strong>
                                            <ul className="mt-1 space-y-1">
                                                {alerta.recomendaciones.map((rec, i) => (
                                                    <li key={i}>• {rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PAEC y PMC */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Problema PAEC */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Problema PAEC Prioritario</h3>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                                <div className="text-3xl font-bold text-amber-900 mb-2">
                                    {diagnostico.problemaPAEC.problema}
                                </div>
                                <div className="text-sm text-amber-700">
                                    Reportado por {diagnostico.problemaPAEC.frecuencia} alumnos ({diagnostico.problemaPAEC.porcentaje}%)
                                </div>
                            </div>
                            {diagnostico.problemasSecundarios.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-slate-700 mb-2 text-sm">Problemas Secundarios</h4>
                                    <div className="space-y-2">
                                        {diagnostico.problemasSecundarios.map((prob, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-slate-600">
                                                <span>{prob.problema}</span>
                                                <span className="font-semibold">{prob.porcentaje}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Metas PMC */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Metas PMC Sugeridas</h3>
                            <ul className="space-y-3">
                                {diagnostico.metasPMC.map((meta, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm text-slate-700">{meta}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contexto Digital */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Contexto Digital del Grupo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wifi className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-900">Con Internet</span>
                                </div>
                                <div className="text-3xl font-bold text-green-900">{diagnostico.contextoDigital.conInternet}</div>
                                <div className="text-sm text-green-700">alumnos ({diagnostico.contextoDigital.porcentajeConectividad}%)</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <WifiOff className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-red-900">Sin Internet</span>
                                </div>
                                <div className="text-3xl font-bold text-red-900">{diagnostico.contextoDigital.sinInternet}</div>
                                <div className="text-sm text-red-700">alumnos ({100 - diagnostico.contextoDigital.porcentajeConectividad}%)</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="font-semibold text-blue-900 mb-2">Recomendación</div>
                                <div className="text-sm text-blue-700">
                                    {diagnostico.contextoDigital.porcentajeConectividad >= 70
                                        ? 'Puedes usar actividades digitales con alternativas offline'
                                        : 'Prioriza actividades presenciales y sin conexión'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario Modal */}
            {mostrarFormulario && (
                <FormularioAlumno
                    onGuardar={handleGuardarAlumno}
                    onCancelar={() => setMostrarFormulario(false)}
                />
            )}
        </div>
    );
};

export default DiagnosticoDashboard;
