import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, AlertTriangle, Users, Target, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { DatosEscuelaPMC, ProblematicaPAEC } from '../../types/pmc';

interface Props {
    readOnly?: boolean;
}

const PAECManager: React.FC<Props> = ({ readOnly = false }) => {
    const { user } = useAuth();
    const [problematicas, setProblematicas] = useState<ProblematicaPAEC[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Estado para nuevo problema
    const [newProblem, setNewProblem] = useState<Partial<ProblematicaPAEC>>({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        causas: [],
        afectados: [],
        criterios: {
            impactoSocial: false,
            viabilidad: false,
            interesEstudiantil: false,
            transversalidad: false
        }
    });

    // Inputs temporales para listas
    const [tempCausa, setTempCausa] = useState('');
    const [tempAfectado, setTempAfectado] = useState('');

    useEffect(() => {
        if (user?.schoolId) {
            loadPAEC();
        }
    }, [user?.schoolId]);

    const loadPAEC = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'pmc', user.schoolId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as DatosEscuelaPMC;
                if (data.paec) setProblematicas(data.paec);
            }
        } catch (error) {
            console.error("Error al cargar PAEC:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProblem = async () => {
        if (!user?.schoolId || !newProblem.titulo) return;

        const problem: ProblematicaPAEC = {
            id: Math.random().toString(36).substr(2, 9),
            titulo: newProblem.titulo || 'Sin título',
            descripcion: newProblem.descripcion || '',
            prioridad: newProblem.prioridad as 'Alta' | 'Media' | 'Baja',
            causas: newProblem.causas || [],
            afectados: newProblem.afectados || [],
            criterios: newProblem.criterios || {
                impactoSocial: false,
                viabilidad: false,
                interesEstudiantil: false,
                transversalidad: false
            },
            seleccionada: false,
            fechaRegistro: new Date().toISOString()
        };

        try {
            const docRef = doc(db, 'pmc', user.schoolId);
            await setDoc(docRef, {
                paec: arrayUnion(problem)
            }, { merge: true });

            setProblematicas([...problematicas, problem]);
            setIsAdding(false);
            setNewProblem({
                titulo: '', descripcion: '', prioridad: 'Media', causas: [], afectados: [],
                criterios: { impactoSocial: false, viabilidad: false, interesEstudiantil: false, transversalidad: false }
            });

        } catch (error) {
            console.error("Error al agregar problemática:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user?.schoolId) return;
        const problemToDelete = problematicas.find(p => p.id === id);
        if (!problemToDelete) return;

        if (!confirm('¿Estás seguro de eliminar esta problemática?')) return;

        try {
            const docRef = doc(db, 'pmc', user.schoolId);
            await updateDoc(docRef, {
                paec: arrayRemove(problemToDelete)
            });
            setProblematicas(problematicas.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const handleSelectPriority = async (id: string) => {
        if (!user?.schoolId) return;

        // Optimist update
        const updatedProblems = problematicas.map(p => ({
            ...p,
            seleccionada: p.id === id // Solo una seleccionada
        }));
        setProblematicas(updatedProblems);

        try {
            const docRef = doc(db, 'pmc', user.schoolId);
            await updateDoc(docRef, {
                paec: updatedProblems
            });
        } catch (error) {
            console.error("Error al actualizar prioridad:", error);
            loadPAEC(); // Revertir si falla
        }
    };

    // Helpers para listas dentro del formulario
    const addToList = (list: 'causas' | 'afectados', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        setNewProblem(prev => ({
            ...prev,
            [list]: [...(prev[list] || []), value.trim()]
        }));
        setter('');
    };

    const removeFromList = (list: 'causas' | 'afectados', index: number) => {
        setNewProblem(prev => ({
            ...prev,
            [list]: (prev[list] || []).filter((_, i) => i !== index)
        }));
    };


    if (loading) return <div className="p-8 text-center text-slate-500">Cargando PAEC...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Programa Aula Escuela Comunidad (PAEC)</h2>
                    <p className="text-slate-600">Diagnóstico comunitario y selección de problemáticas</p>
                </div>
                {!readOnly && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Problemática
                    </button>
                )}
            </div>

            {/* Formulario de Nueva Problemática */}
            {isAdding && !readOnly && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-800 mb-4">Registrar Nueva Problemática</h3>

                    <div className="space-y-4">
                        {/* Título y Prioridad */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Problemática Identificada</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej: Contaminación del río local"
                                    value={newProblem.titulo}
                                    onChange={e => setNewProblem({ ...newProblem, titulo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Impacto</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={newProblem.prioridad}
                                    onChange={e => setNewProblem({ ...newProblem, prioridad: e.target.value as any })}
                                >
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                </select>
                            </div>
                        </div>

                        {/* Descripción Detallada con Guía PAEC */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Descripción y Justificación</label>
                                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Formato Sugerido</span>
                            </div>

                            <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                                <h4 className="font-bold mb-1">Estructura Recomendada para Rúbrica PAEC:</h4>
                                <ul className="list-disc pl-4 space-y-1 opacity-90">
                                    <li><strong>1. El Problema (Precisión):</strong> ¿Qué pasa exactamente? (Conductas observables, riesgos de salud).</li>
                                    <li><strong>2. El Contexto:</strong> ¿Cómo se ve esto en TU escuela? (Menciona el nombre del plantel y situaciones locales).</li>
                                    <li><strong>3. La Indagación:</strong> ¿Cómo te diste cuenta? (Observación, encuestas, comentarios).</li>
                                    <li><strong>4. La Propuesta:</strong> ¿Qué vamos a hacer para transformar esto? (Talleres, actividades formativas).</li>
                                </ul>
                            </div>

                            <textarea
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-48 resize-y focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                                placeholder={`Ejemplo de redacción:

"Los alumnos buscan estar en buen estado físico... sin embargo, no cuentan con orientación profesional... (El Problema).

En el contexto del Bachillerato Gral. [Nombre]... se han identificado comentarios sobre presión estética... (El Contexto).

Esta problemática fue identificada a partir de observaciones en el aula y encuestas breves... (La Indagación).

La propuesta consiste en desarrollar talleres y actividades que fortalezcan conocimientos y actitudes para el cuidado de la salud..." (La Propuesta).`}
                                value={newProblem.descripcion}
                                onChange={e => setNewProblem({ ...newProblem, descripcion: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Causas y Afectados */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Causas Principales</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-slate-300 rounded-lg px-2 py-1 text-sm"
                                        placeholder="Ej: Basura"
                                        value={tempCausa}
                                        onChange={e => setTempCausa(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addToList('causas', tempCausa, setTempCausa)}
                                    />
                                    <button onClick={() => addToList('causas', tempCausa, setTempCausa)} className="bg-slate-200 px-3 py-1 rounded text-sm hover:bg-slate-300">+</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {newProblem.causas?.map((c, i) => (
                                        <span key={i} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                                            {c} <button onClick={() => removeFromList('causas', i)} className="text-red-500 ml-1">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Población Afectada</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-slate-300 rounded-lg px-2 py-1 text-sm"
                                        placeholder="Ej: Estudiantes"
                                        value={tempAfectado}
                                        onChange={e => setTempAfectado(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addToList('afectados', tempAfectado, setTempAfectado)}
                                    />
                                    <button onClick={() => addToList('afectados', tempAfectado, setTempAfectado)} className="bg-slate-200 px-3 py-1 rounded text-sm hover:bg-slate-300">+</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {newProblem.afectados?.map((c, i) => (
                                        <span key={i} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                                            {c} <button onClick={() => removeFromList('afectados', i)} className="text-red-500 ml-1">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Criterios de Selección (Checkboxes) */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3">Criterios de Viabilidad</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox"
                                        checked={newProblem.criterios?.impactoSocial}
                                        onChange={e => setNewProblem({ ...newProblem, criterios: { ...newProblem.criterios!, impactoSocial: e.target.checked } })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Impacto Social Alto
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox"
                                        checked={newProblem.criterios?.viabilidad}
                                        onChange={e => setNewProblem({ ...newProblem, criterios: { ...newProblem.criterios!, viabilidad: e.target.checked } })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Viabilidad Técnica/Financiera
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox"
                                        checked={newProblem.criterios?.interesEstudiantil}
                                        onChange={e => setNewProblem({ ...newProblem, criterios: { ...newProblem.criterios!, interesEstudiantil: e.target.checked } })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Interés del Estudiantado
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox"
                                        checked={newProblem.criterios?.transversalidad}
                                        onChange={e => setNewProblem({ ...newProblem, criterios: { ...newProblem.criterios!, transversalidad: e.target.checked } })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Oportunidad de Transversalidad
                                </label>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddProblem}
                                disabled={!newProblem.titulo}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                            >
                                Registrar Problemática
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de Problemáticas */}
            <div className="grid grid-cols-1 gap-4">
                {problematicas.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-600">No hay problemáticas registradas</h3>
                        <p className="text-slate-500 text-sm mb-4">Comienza registrando las necesidades de tu comunidad escolar</p>
                        {!readOnly && <button onClick={() => setIsAdding(true)} className="text-indigo-600 font-medium hover:underline">Registrar ahora</button>}
                    </div>
                )}

                {problematicas.map(problem => (
                    <div
                        key={problem.id}
                        className={`bg-white rounded-xl border p-6 transition-all ${problem.seleccionada
                            ? 'border-green-500 shadow-md ring-1 ring-green-500'
                            : 'border-slate-200 hover:shadow-md'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-slate-800">{problem.titulo}</h3>
                                    {problem.seleccionada && (
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Prioridad del Ciclo
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${problem.prioridad === 'Alta' ? 'bg-red-100 text-red-700' :
                                        problem.prioridad === 'Media' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {problem.prioridad}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm">{problem.descripcion}</p>
                            </div>
                            {!readOnly && (
                                <div className="flex items-center gap-2">
                                    {!problem.seleccionada && (
                                        <button
                                            onClick={() => handleSelectPriority(problem.id)}
                                            className="text-sm text-slate-500 hover:text-green-600 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                                            title="Seleccionar como prioridad"
                                        >
                                            Seleccionar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(problem.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {/* Causas y Afectados */}
                            <div className="space-y-3">
                                <div>
                                    <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                                        <AlertTriangle className="w-3 h-3" /> Causas:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {problem.causas.map((c, i) => (
                                            <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{c}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                                        <Users className="w-3 h-3" /> Afectados:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {problem.afectados.map((a, i) => (
                                            <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Criterios */}
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="font-semibold text-slate-700 block mb-2 text-xs uppercase tracking-wider">Criterios Cumplidos:</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className={`flex items-center gap-1.5 text-xs ${problem.criterios.impactoSocial ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                                        <Check className="w-3 h-3" /> Impacto Social
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs ${problem.criterios.viabilidad ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                                        <Check className="w-3 h-3" /> Viabilidad
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs ${problem.criterios.interesEstudiantil ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                                        <Check className="w-3 h-3" /> Interés Alumnos
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-xs ${problem.criterios.transversalidad ? 'text-green-700 font-medium' : 'text-slate-400'}`}>
                                        <Check className="w-3 h-3" /> Transversalidad
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PAECManager;
