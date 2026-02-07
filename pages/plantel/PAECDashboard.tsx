import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle2, ChevronRight, Plus, FolderOpen, Target, X, Save, Edit2 } from 'lucide-react';
import { pecService } from '../../src/services/pecService';
import { PECProject, ProblemPAEC } from '../../types';
import PAECManager from '../../components/director/PAECManager'; // Importamos el componente conectado
import PECDesignPanel from '../../components/director/PECDesignPanel';
import { useAuth } from '../../src/contexts/AuthContext';

const PAECDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'diagnostico' | 'banco' | 'nuevo'>('diagnostico');
    const [projects, setProjects] = useState<PECProject[]>([]);

    useEffect(() => {
        const loadProyectos = async () => {
            if (user?.schoolId) {
                const data = await pecService.getActiveProjects(user.schoolId);
                setProjects(data);
            }
        };
        loadProyectos();
    }, [user?.schoolId]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
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

                {/* VISTA: DIAGNÓSTICO (Con nuevo componente Firestore ReadOnly) */}
                {activeTab === 'diagnostico' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm mb-6">
                            <strong>Instrucciones:</strong> Este diagnóstico es gestionado por el Director. Aquí puedes consultar las problemáticas prioritarias identificadas para vincularlas a tus proyectos.
                        </div>

                        {/* Componente PAECManager en modo lectura */}
                        <PAECManager readOnly={true} />
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
                    <div className="animate-in fade-in">
                        <PECDesignPanel />
                    </div>
                )}

            </div>
        </div>
    );
};

export default PAECDashboard;
