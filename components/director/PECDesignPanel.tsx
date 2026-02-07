import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calendar, Target, List, ArrowRight, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { PECProject, ProblemPAEC } from '../../types';
import { DatosEscuelaPMC, ProblematicaPAEC } from '../../types/pmc';

const PECDesignPanel: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [availableProblems, setAvailableProblems] = useState<ProblematicaPAEC[]>([]);

    // Form State
    const [project, setProject] = useState<Partial<PECProject>>({
        name: '',
        problemId: '',
        justification: '',
        generalObjective: '',
        specificObjectives: [],
        duration: '',
        stages: [
            { name: 'Diagnóstica', period: '', activities: [] },
            { name: 'Planeación', period: '', activities: [] },
            { name: 'Ejecución', period: '', activities: [] },
            { name: 'Cierre y Valoración', period: '', activities: [] }
        ],
        products: []
    });

    // Temp Inputs
    const [tempObj, setTempObj] = useState('');
    const [tempProd, setTempProd] = useState('');
    const [tempActivities, setTempActivities] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        if (user?.schoolId) {
            loadProblems();
        }
    }, [user?.schoolId]);

    const loadProblems = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'pmc', user.schoolId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as DatosEscuelaPMC;
                setAvailableProblems(data.paec || []);
            }
        } catch (error) {
            console.error("Error loading problems:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user?.schoolId || !project.name || !project.problemId) {
            alert('Por favor completa el nombre del proyecto y selecciona una problemática.');
            return;
        }

        setSaving(true);
        try {
            const newProject: PECProject = {
                ...project as PECProject,
                id: Math.random().toString(36).substr(2, 9),
            };

            const docRef = doc(db, 'pmc', user.schoolId);
            // Save to 'pecs' array to distinguish from 'paec' problems
            // We need to update the types probably, but Firestore is schemaless so it works.
            // However, to keep it clean let's use 'pecs'.
            await updateDoc(docRef, {
                pecProjects: arrayUnion(newProject)
            });

            alert('Proyecto PEC diseñado exitosamente ✨');
            // Reset form or redirect
            setProject({
                name: '',
                problemId: '',
                justification: '',
                generalObjective: '',
                specificObjectives: [],
                duration: '',
                stages: [
                    { name: 'Diagnóstica', period: '', activities: [] },
                    { name: 'Planeación', period: '', activities: [] },
                    { name: 'Ejecución', period: '', activities: [] },
                    { name: 'Cierre y Valoración', period: '', activities: [] }
                ],
                products: []
            });

        } catch (error) {
            console.error("Error saving PEC:", error);
            alert('Error al guardar el proyecto.');
        } finally {
            setSaving(false);
        }
    };

    // Helper functions
    const addSpecificObjective = () => {
        if (!tempObj.trim()) return;
        setProject(prev => ({
            ...prev,
            specificObjectives: [...(prev.specificObjectives || []), tempObj.trim()]
        }));
        setTempObj('');
    };

    const removeSpecificObjective = (index: number) => {
        setProject(prev => ({
            ...prev,
            specificObjectives: prev.specificObjectives?.filter((_, i) => i !== index)
        }));
    };

    const addProduct = () => {
        if (!tempProd.trim()) return;
        setProject(prev => ({
            ...prev,
            products: [...(prev.products || []), tempProd.trim()]
        }));
        setTempProd('');
    };

    const removeProduct = (index: number) => {
        setProject(prev => ({
            ...prev,
            products: prev.products?.filter((_, i) => i !== index)
        }));
    };

    const addActivityToStage = (stageIndex: number) => {
        const activity = tempActivities[stageIndex];
        if (!activity?.trim()) return;

        const newStages = [...(project.stages || [])];
        newStages[stageIndex].activities.push(activity.trim());

        setProject(prev => ({ ...prev, stages: newStages }));
        setTempActivities(prev => ({ ...prev, [stageIndex]: '' }));
    };

    const removeActivityFromStage = (stageIndex: number, activityIndex: number) => {
        const newStages = [...(project.stages || [])];
        newStages[stageIndex].activities = newStages[stageIndex].activities.filter((_, i) => i !== activityIndex);
        setProject(prev => ({ ...prev, stages: newStages }));
    };

    const updateStagePeriod = (stageIndex: number, period: string) => {
        const newStages = [...(project.stages || [])];
        newStages[stageIndex].period = period;
        setProject(prev => ({ ...prev, stages: newStages }));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-indigo-50 p-6 border-b border-indigo-100">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <Target className="w-6 h-6" /> Diseñador de Proyectos Escolares (PEC)
                </h2>
                <p className="text-indigo-700 text-sm mt-1">
                    Estructura tu proyecto transversal vinculando las problemáticas del diagnóstico.
                </p>
            </div>

            <div className="p-8 space-y-8">

                {/* 1. Vinculación y Datos Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">1. Problemática a Atender (Diagnóstico)</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            value={project.problemId}
                            onChange={(e) => {
                                const problemId = e.target.value;
                                const problem = availableProblems.find(p => p.id === problemId);
                                setProject(prev => ({
                                    ...prev,
                                    problemId,
                                    justification: problem ? `Atendiendo a la problemática de ${problem.titulo}...` : prev.justification
                                }));
                            }}
                        >
                            <option value="">-- Selecciona una problemática del PAEC --</option>
                            {availableProblems.map(p => (
                                <option key={p.id} value={p.id}>{p.titulo} (Prioridad: {p.prioridad})</option>
                            ))}
                        </select>

                        {project.problemId && (
                            <div className="p-3 bg-green-50 text-green-800 text-xs rounded-lg border border-green-100 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Problemática vinculada correctamente
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">2. Título del Proyecto</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                            placeholder="Ej: Feria de la Salud Integral 2024..."
                            value={project.name}
                            onChange={e => setProject({ ...project, name: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. Justificación y Objetivos */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">3. Justificación</label>
                        <textarea
                            className="w-full p-3 border border-slate-300 rounded-xl h-24 focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="¿Por qué es importante realizar este proyecto?"
                            value={project.justification}
                            onChange={e => setProject({ ...project, justification: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">4. Objetivo General</label>
                            <textarea
                                className="w-full p-3 border border-slate-300 rounded-xl h-32 focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="¿Qué queremos lograr a largo plazo?"
                                value={project.generalObjective}
                                onChange={e => setProject({ ...project, generalObjective: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">5. Objetivos Específicos</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                                    placeholder="Agregar objetivo..."
                                    value={tempObj}
                                    onChange={e => setTempObj(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSpecificObjective()}
                                />
                                <button onClick={addSpecificObjective} className="bg-indigo-100 text-indigo-700 px-3 rounded-lg hover:bg-indigo-200">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <ul className="space-y-2 max-h-24 overflow-y-auto">
                                {project.specificObjectives?.map((obj, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                        <span>• {obj}</span>
                                        <button onClick={() => removeSpecificObjective(i)} className="text-red-400 hover:text-red-600">×</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. Cronograma y Fases */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-lg font-bold text-slate-800">6. Cronograma de Actividades (Por Fases)</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">Duración Total:</span>
                            <input
                                type="text"
                                className="border border-slate-300 rounded-lg px-3 py-1 text-sm w-48"
                                placeholder="Ej: Agosto - Diciembre 2024"
                                value={project.duration}
                                onChange={e => setProject({ ...project, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {project.stages?.map((stage, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2 text-sm">
                                    <span className="bg-indigo-200 text-indigo-800 w-5 h-5 flex items-center justify-center rounded-full text-xs">{idx + 1}</span>
                                    {stage.name}
                                </h4>
                                <input
                                    type="text"
                                    className="w-full text-xs p-1 mb-3 border border-slate-200 rounded text-slate-500"
                                    placeholder="Periodo (Ej: Agosto)"
                                    value={stage.period}
                                    onChange={e => updateStagePeriod(idx, e.target.value)}
                                />

                                <div className="space-y-2 mb-3 min-h-[80px]">
                                    {stage.activities.map((act, i) => (
                                        <div key={i} className="bg-white p-2 rounded border border-slate-100 text-xs flex justify-between group">
                                            <span>{act}</span>
                                            <button onClick={() => removeActivityFromStage(idx, i)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100">×</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        className="flex-1 text-xs p-1 border border-slate-300 rounded"
                                        placeholder="Nueva actividad..."
                                        value={tempActivities[idx] || ''}
                                        onChange={e => setTempActivities({ ...tempActivities, [idx]: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && addActivityToStage(idx)}
                                    />
                                    <button onClick={() => addActivityToStage(idx)} className="bg-indigo-600 text-white rounded px-2 text-xs">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Productos Entregables */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3">7. Productos Entregables (Evidencias)</label>
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            className="flex-1 p-3 border border-slate-300 rounded-xl"
                            placeholder="Ej: Video documental, Mural comunitario, Huerto escolar..."
                            value={tempProd}
                            onChange={e => setTempProd(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addProduct()}
                        />
                        <button onClick={addProduct} className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700">
                            Agregar
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {project.products?.map((prod, i) => (
                            <div key={i} className="bg-white px-4 py-2 rounded-full border border-indigo-100 text-indigo-700 font-medium flex items-center gap-2 shadow-sm">
                                {prod}
                                <button onClick={() => removeProduct(i)} className="text-indigo-300 hover:text-red-500">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando Proyecto...' : (
                            <>
                                <Save className="w-5 h-5" /> Guardar Proyecto PEC
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PECDesignPanel;
