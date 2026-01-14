import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle2, ChevronRight, Plus, FolderOpen, Target, X, Save, Edit2 } from 'lucide-react';
import { pecService } from '../../src/services/pecService';
import { PECProject, ProblemPAEC } from '../../types';

const PAECDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'diagnostico' | 'banco' | 'nuevo'>('diagnostico');
    const [projects, setProjects] = useState<PECProject[]>([]);

    // Estados para gestión de problemáticas
    const [problemas, setProblemas] = useState<ProblemPAEC[]>(() => {
        const saved = localStorage.getItem('paec_problemas');
        return saved ? JSON.parse(saved) : [{
            id: '1',
            name: 'Contaminación del río local',
            severity: 'Alta',
            affected: ['Comunidad', 'Estudiantes'],
            causes: ['Basura', 'Drenaje'],
            resources: ['Voluntarios', 'Apoyo municipal']
        }];
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<ProblemPAEC | null>(null);

    // Formulario temporal
    const [formData, setFormData] = useState<ProblemPAEC>({
        id: '',
        name: '',
        severity: 'Media',
        affected: [],
        causes: [],
        resources: []
    });
    const [tempCauses, setTempCauses] = useState('');
    const [tempAffected, setTempAffected] = useState('');

    useEffect(() => {
        const loadProyectos = async () => {
            const data = await pecService.getActiveProjects();
            setProjects(data);
        };
        loadProyectos();
    }, []);

    useEffect(() => {
        localStorage.setItem('paec_problemas', JSON.stringify(problemas));
    }, [problemas]);

    const handleOpenModal = (problem?: ProblemPAEC) => {
        if (problem) {
            setEditingProblem(problem);
            setFormData(problem);
            setTempCauses(problem.causes.join(', '));
            setTempAffected(problem.affected.join(', '));
        } else {
            setEditingProblem(null);
            setFormData({
                id: Date.now().toString(),
                name: '',
                severity: 'Media',
                affected: [],
                causes: [],
                resources: []
            });
            setTempCauses('');
            setTempAffected('');
        }
        setIsModalOpen(true);
    };

    const handleSaveProblem = () => {
        const problemToSave = {
            ...formData,
            causes: tempCauses.split(',').map(s => s.trim()).filter(Boolean),
            affected: tempAffected.split(',').map(s => s.trim()).filter(Boolean)
        };

        if (editingProblem) {
            setProblemas(problemas.map(p => p.id === editingProblem.id ? problemToSave : p));
        } else {
            setProblemas([...problemas, problemToSave]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
            {/* Modal de Edición/Creación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">
                                {editingProblem ? 'Editar Problemática' : 'Nueva Problemática'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del Problema</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                    placeholder="Ej. Falta de agua en baños..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Severidad</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                                    value={formData.severity}
                                    onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                                >
                                    <option value="Baja">Baja</option>
                                    <option value="Media">Media</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Crítica">Crítica</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Causas (separar por comas)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-xl h-20 text-sm"
                                    placeholder="Ej. Tuberías viejas, falta de mantenimiento..."
                                    value={tempCauses}
                                    onChange={e => setTempCauses(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Afectados (separar por comas)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-xl h-20 text-sm"
                                    placeholder="Ej. Alumnos de 1er año, Docentes..."
                                    value={tempAffected}
                                    onChange={e => setTempAffected(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
                                Cancelar
                            </button>
                            <button onClick={handleSaveProblem} className="px-6 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 shadow-lg shadow-pink-200">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-pink-600" />
                        Comité PAEC
                    </h1>
                    <p className="text-slate-500 mt-1">Programa Aula Escuela Comunidad - Diagnóstico y Proyectos</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 border-b border-slate-200 pb-1">
                <button
                    onClick={() => setActiveTab('diagnostico')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'diagnostico' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <AlertTriangle className="w-4 h-4" /> Diagnóstico Comunitario
                </button>
                <button
                    onClick={() => setActiveTab('banco')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'banco' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <FolderOpen className="w-4 h-4" /> Banco de Proyectos (PEC)
                </button>
                <button
                    onClick={() => setActiveTab('nuevo')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'nuevo' ? 'bg-pink-50 text-pink-700 border-b-2 border-pink-500' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Plus className="w-4 h-4" /> Diseñar Nuevo PEC
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 min-h-[500px]">

                {/* VISTA: DIAGNÓSTICO */}
                {activeTab === 'diagnostico' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm mb-6">
                            <strong>Instrucciones:</strong> Identifique las problemáticas principales de la comunidad mediante encuestas y recorridos. Priorice aquellas que el plantel pueda abordar de manera transversal.
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Lista de Problemas */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="font-bold text-slate-800">Problemáticas Identificadas</h3>
                                {problemas.map(prob => (
                                    <div
                                        key={prob.id}
                                        onClick={() => handleOpenModal(prob)}
                                        className="border border-slate-200 rounded-xl p-4 hover:border-pink-300 transition-colors cursor-pointer group relative"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit2 className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex justify-between items-start mb-2 pr-8">
                                            <h4 className="font-bold text-lg text-slate-800 group-hover:text-pink-600 transition-colors">{prob.name}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${prob.severity === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {prob.severity}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                            <div>
                                                <span className="block text-xs font-bold text-slate-400 uppercase">Causas</span>
                                                <p className="text-slate-600">{prob.causes.join(', ')}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold text-slate-400 uppercase">Afectados</span>
                                                <p className="text-slate-600">{prob.affected.join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleOpenModal()}
                                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-pink-300 hover:text-pink-500 transition-all">
                                    + Registrar Nueva Problemática
                                </button>
                            </div>

                            {/* Priorización */}
                            <div className="bg-slate-50 rounded-xl p-6 h-fit">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-500" /> Criterios de Selección
                                </h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <input type="checkbox" checked readOnly className="mt-1" />
                                        impacto social alto
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <input type="checkbox" checked readOnly className="mt-1" />
                                        Viabilidad técnica y financiera
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <input type="checkbox" className="mt-1" />
                                        Interés del estudiantado
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <input type="checkbox" className="mt-1" />
                                        Oportunidad de transversalidad
                                    </li>
                                </ul>
                                <button className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">
                                    Seleccionar Prioridad del Ciclo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA: BANCO DE PROYECTOS */}
                {activeTab === 'banco' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                        {projects.map(pec => (
                            <div key={pec.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
                                <div className="h-24 bg-gradient-to-r from-pink-500 to-purple-600 p-4 relative">
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-bold">
                                        {pec.duration}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-xl text-slate-900 mb-2">{pec.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{pec.generalObjective}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Target className="w-4 h-4 text-pink-500" />
                                            <span><strong>Productos:</strong> {pec.products.length} definidos</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            <span>Vinculado a Planeaciones</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
                                        Ver Detalles y Avances
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VISTA: NUEVO PEC */}
                {activeTab === 'nuevo' && (
                    <div className="max-w-3xl mx-auto py-8 text-center animate-in fade-in">
                        <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FolderOpen className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Diseñador de Proyectos Escolares (PEC)</h3>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                            Utiliza esta herramienta para estructurar un nuevo proyecto transversal. Definirás objetivos, cronograma y productos entregables.
                        </p>
                        <button className="px-8 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200">
                            Comenzar Diseño Guiado
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PAECDashboard;
