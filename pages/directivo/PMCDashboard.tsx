import React, { useState, useEffect } from 'react';
import { Target, Users, TrendingUp, AlertCircle, Save, Plus, Trash2, CheckSquare } from 'lucide-react';
import { PMCDiagnosis, PMCGoal } from '../../types';

const PMCDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'diagnostico' | 'metas' | 'seguimiento'>('diagnostico');
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const [diagnostico, setDiagnostico] = useState<PMCDiagnosis>(() => {
        const saved = localStorage.getItem('pmc_diagnostico');
        return saved ? JSON.parse(saved) : {
            infrastructure: '',
            totalStudents: 0,
            academicIndicators: { dropoutRate: 0, failureRate: 0, terminalEfficiency: 0 },
            strengths: '',
            areasOfOpportunity: ''
        };
    });

    const [metas, setMetas] = useState<PMCGoal[]>(() => {
        const saved = localStorage.getItem('pmc_metas');
        return saved ? JSON.parse(saved) : [];
    });

    // Auto-save effect
    useEffect(() => {
        localStorage.setItem('pmc_diagnostico', JSON.stringify(diagnostico));
        localStorage.setItem('pmc_metas', JSON.stringify(metas));
    }, [diagnostico, metas]);

    const handleManualSave = () => {
        localStorage.setItem('pmc_diagnostico', JSON.stringify(diagnostico));
        localStorage.setItem('pmc_metas', JSON.stringify(metas));
        const time = new Date().toLocaleTimeString();
        setLastSaved(time);
        alert(`Avances guardados correctamente a las ${time}`);
    };

    const handleAddGoal = () => {
        const newGoal: PMCGoal = {
            id: Date.now().toString(),
            area: 'Aprendizaje',
            description: '',
            actions: [],
            // @ts-ignore - Adding temporary tracking field for demo
            progress: 0
        };
        setMetas([...metas, newGoal]);
    };

    const updateGoal = (id: string, field: keyof PMCGoal, value: any) => {
        setMetas(metas.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const deleteGoal = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta meta?')) {
            setMetas(metas.filter(m => m.id !== id));
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                        Plan de Mejora Continua (PMC)
                    </h1>
                    <p className="text-slate-500 mt-1">Gestión del diagnóstico y metas institucionales</p>
                </div>
                <div className="flex items-center gap-4">
                    {lastSaved && <span className="text-xs text-slate-400">Guardado: {lastSaved}</span>}
                    <button
                        onClick={handleManualSave}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        <Save className="w-4 h-4" /> Guardar Avances
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('diagnostico')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'diagnostico' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    1. Diagnóstico Institucional
                </button>
                <button
                    onClick={() => setActiveTab('metas')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'metas' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    2. Metas y Acciones
                </button>
                <button
                    onClick={() => setActiveTab('seguimiento')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'seguimiento' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    3. Seguimiento
                </button>
            </div>

            {/* Contenido */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">

                {activeTab === 'diagnostico' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-indigo-500" /> Indicadores Académicos
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Abandonó Escolar (%)</label>
                                        <input type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                                            value={diagnostico.academicIndicators.dropoutRate}
                                            onChange={e => setDiagnostico({ ...diagnostico, academicIndicators: { ...diagnostico.academicIndicators, dropoutRate: Number(e.target.value) } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Reprobación (%)</label>
                                        <input type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                                            value={diagnostico.academicIndicators.failureRate}
                                            onChange={e => setDiagnostico({ ...diagnostico, academicIndicators: { ...diagnostico.academicIndicators, failureRate: Number(e.target.value) } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Eficiencia Terminal (%)</label>
                                        <input type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                                            value={diagnostico.academicIndicators.terminalEfficiency}
                                            onChange={e => setDiagnostico({ ...diagnostico, academicIndicators: { ...diagnostico.academicIndicators, terminalEfficiency: Number(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" /> Matrícula e Infraestructura
                                </h3>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Matrícula Total</label>
                                    <input type="number" className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={diagnostico.totalStudents}
                                        onChange={e => setDiagnostico({ ...diagnostico, totalStudents: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Diagnóstico de Infraestructura</label>
                                    <textarea className="w-full p-2 border border-slate-200 rounded-lg h-24 text-sm" placeholder="Estado de aulas, laboratorios, servicios..."
                                        value={diagnostico.infrastructure}
                                        onChange={e => setDiagnostico({ ...diagnostico, infrastructure: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-emerald-700 mb-2">Principales Fortalezas</label>
                                <textarea className="w-full p-3 border border-emerald-100 bg-emerald-50/50 rounded-xl h-32 focus:border-emerald-500 transition-colors"
                                    value={diagnostico.strengths}
                                    onChange={e => setDiagnostico({ ...diagnostico, strengths: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-amber-700 mb-2">Áreas de Oportunidad</label>
                                <textarea className="w-full p-3 border border-amber-100 bg-amber-50/50 rounded-xl h-32 focus:border-amber-500 transition-colors"
                                    value={diagnostico.areasOfOpportunity}
                                    onChange={e => setDiagnostico({ ...diagnostico, areasOfOpportunity: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'metas' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-end">
                            <button onClick={handleAddGoal} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                                <Plus className="w-4 h-4" /> Agregar Nueva Meta
                            </button>
                        </div>

                        {metas.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                No hay metas definidas. Comienza agregando una meta prioritaria.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {metas.map((meta, idx) => (
                                    <div key={meta.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Área de Atención</label>
                                                <select
                                                    value={meta.area}
                                                    onChange={(e) => updateGoal(meta.id, 'area', e.target.value)}
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                                >
                                                    <option value="Aprendizaje">Aprendizaje</option>
                                                    <option value="Formación Docente">Formación Docente</option>
                                                    <option value="Infraestructura">Infraestructura</option>
                                                    <option value="Convivencia">Convivencia Escolar</option>
                                                    <option value="Vinculación">Vinculación (PAEC)</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-8">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Descripción de la Meta</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                                    placeholder="Ej. Reducir la deserción en un 5%..."
                                                    value={meta.description}
                                                    onChange={(e) => updateGoal(meta.id, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex items-end justify-center">
                                                <button
                                                    onClick={() => deleteGoal(meta.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                            <button className="text-xs font-bold text-indigo-600">
                                                + Gestionar Acciones y Responsables
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'seguimiento' && (
                    <div className="animate-in fade-in">
                        {metas.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 italic">
                                Define metas primero para darles seguimiento.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm mb-6">
                                    <strong>Panel de Control:</strong> Actualiza el porcentaje de avance de cada meta trimestralmente.
                                </div>

                                {metas.map(meta => (
                                    <div key={meta.id} className="bg-white border border-slate-200 rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase mb-2 inline-block">{meta.area}</span>
                                                <h3 className="font-bold text-slate-800">{meta.description || 'Sin descripción'}</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-indigo-600">
                                                    {/* @ts-ignore */}
                                                    {meta.progress || 0}%
                                                </span>
                                                <p className="text-xs text-slate-400">Avance Global</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                                    // @ts-ignore
                                                    style={{ width: `${meta.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    // @ts-ignore
                                                    value={meta.progress || 0}
                                                    onChange={(e) => updateGoal(meta.id, 'progress', Number(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                                                <CheckSquare className="w-3 h-3" /> Evidencias Recientes
                                            </h4>
                                            <div className="text-sm text-slate-400 italic">
                                                No hay evidencias cargadas para este periodo.
                                            </div>
                                            <button className="mt-2 text-xs font-medium text-indigo-600 hover:underline">
                                                + Cargar Evidencia
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PMCDashboard;
