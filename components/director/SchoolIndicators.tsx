import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, TrendingDown, TrendingUp, Users, School, Wifi, Zap, Monitor, Dumbbell } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { DatosEscuelaPMC, IndicadoresAcademicos, Infraestructura } from '../../types/pmc';

interface Props {
    readOnly?: boolean;
}

const SchoolIndicators: React.FC<Props> = ({ readOnly = false }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Estado inicial
    const [indicadores, setIndicadores] = useState<IndicadoresAcademicos>({
        abandonoEscolar: 0,
        reprobacion: 0,
        eficienciaTerminal: 0,
        matriculaTotal: 0
    });

    const [infraestructura, setInfraestructura] = useState<Infraestructura>({
        aulasConElectricidad: false,
        aulasConInternet: false,
        laboratorioComputacion: false,
        instalacionesDeportivas: false,
        fortalezas: [],
        areasOportunidad: [],
        descripcionGeneral: ''
    });

    const [newFortaleza, setNewFortaleza] = useState('');
    const [newArea, setNewArea] = useState('');

    useEffect(() => {
        if (user?.schoolId) {
            loadData();
        }
    }, [user?.schoolId]);

    const loadData = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'pmc', user.schoolId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as DatosEscuelaPMC;
                if (data.indicadores) setIndicadores(data.indicadores);
                if (data.infraestructura) setInfraestructura(data.infraestructura);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setMessage({ type: 'error', text: 'Error al cargar la información.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user?.schoolId) return;
        setSaving(true);
        setMessage(null);

        try {
            const docRef = doc(db, 'pmc', user.schoolId);

            // Guardar o actualizar (merge)
            await setDoc(docRef, {
                schoolId: user.schoolId,
                indicadores,
                infraestructura,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setMessage({ type: 'success', text: 'Información actualizada correctamente.' });

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error("Error al guardar:", error);
            setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
        } finally {
            setSaving(false);
        }
    };

    // Helpers para listas (fortalezas/debilidades)
    const addListItem = (listName: 'fortalezas' | 'areasOportunidad', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        setInfraestructura(prev => ({
            ...prev,
            [listName]: [...prev[listName], value.trim()]
        }));
        setter('');
    };

    const removeListItem = (listName: 'fortalezas' | 'areasOportunidad', index: number) => {
        setInfraestructura(prev => ({
            ...prev,
            [listName]: prev[listName].filter((_, i) => i !== index)
        }));
    };

    if (loading) return <div className="p-8 text-center">Cargando indicadores...</div>;

    return (
        <div className="space-y-8">
            {/* Header de sección */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Diagnóstico Escolar (PMC)</h2>
                    <p className="text-slate-600">Indicadores académicos e infraestructura del plantel</p>
                </div>
                {!readOnly && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {saving ? 'Guardando...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Mensaje de feedback */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* 1. Indicadores Académicos */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Indicadores Académicos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Abandono */}
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <label className="block text-sm font-medium text-red-700 mb-1">Abandonó Escolar (%)</label>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            <input
                                type="number"
                                disabled={readOnly}
                                value={indicadores.abandonoEscolar}
                                onChange={e => setIndicadores({ ...indicadores, abandonoEscolar: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white border border-red-200 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Reprobación */}
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <label className="block text-sm font-medium text-orange-700 mb-1">Reprobación (%)</label>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            <input
                                type="number"
                                disabled={readOnly}
                                value={indicadores.reprobacion}
                                onChange={e => setIndicadores({ ...indicadores, reprobacion: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Eficiencia Terminal */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <label className="block text-sm font-medium text-green-700 mb-1">Eficiencia Terminal (%)</label>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <input
                                type="number"
                                disabled={readOnly}
                                value={indicadores.eficienciaTerminal}
                                onChange={e => setIndicadores({ ...indicadores, eficienciaTerminal: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Matrícula */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="block text-sm font-medium text-blue-700 mb-1">Matrícula Total</label>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <input
                                type="number"
                                disabled={readOnly}
                                value={indicadores.matriculaTotal}
                                onChange={e => setIndicadores({ ...indicadores, matriculaTotal: parseInt(e.target.value) || 0 })}
                                className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Infraestructura */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <School className="w-5 h-5 text-indigo-600" />
                    Infraestructura y Equipamiento
                </h3>

                {/* Servicios Básicos (Switches) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${infraestructura.aulasConElectricidad ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${!readOnly ? 'cursor-pointer' : ''}`}
                        onClick={() => !readOnly && setInfraestructura({ ...infraestructura, aulasConElectricidad: !infraestructura.aulasConElectricidad })}
                    >
                        <div className="flex items-center gap-3">
                            <Zap className={`w-5 h-5 ${infraestructura.aulasConElectricidad ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`font-medium ${infraestructura.aulasConElectricidad ? 'text-indigo-900' : 'text-slate-600'}`}>Electricidad</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${infraestructura.aulasConElectricidad ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${infraestructura.aulasConElectricidad ? 'translate-x-4' : ''}`} />
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${infraestructura.aulasConInternet ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${!readOnly ? 'cursor-pointer' : ''}`}
                        onClick={() => !readOnly && setInfraestructura({ ...infraestructura, aulasConInternet: !infraestructura.aulasConInternet })}
                    >
                        <div className="flex items-center gap-3">
                            <Wifi className={`w-5 h-5 ${infraestructura.aulasConInternet ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`font-medium ${infraestructura.aulasConInternet ? 'text-indigo-900' : 'text-slate-600'}`}>Internet</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${infraestructura.aulasConInternet ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${infraestructura.aulasConInternet ? 'translate-x-4' : ''}`} />
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${infraestructura.laboratorioComputacion ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${!readOnly ? 'cursor-pointer' : ''}`}
                        onClick={() => !readOnly && setInfraestructura({ ...infraestructura, laboratorioComputacion: !infraestructura.laboratorioComputacion })}
                    >
                        <div className="flex items-center gap-3">
                            <Monitor className={`w-5 h-5 ${infraestructura.laboratorioComputacion ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`font-medium ${infraestructura.laboratorioComputacion ? 'text-indigo-900' : 'text-slate-600'}`}>Laboratorio de Cómputo</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${infraestructura.laboratorioComputacion ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${infraestructura.laboratorioComputacion ? 'translate-x-4' : ''}`} />
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${infraestructura.instalacionesDeportivas ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${!readOnly ? 'cursor-pointer' : ''}`}
                        onClick={() => !readOnly && setInfraestructura({ ...infraestructura, instalacionesDeportivas: !infraestructura.instalacionesDeportivas })}
                    >
                        <div className="flex items-center gap-3">
                            <Dumbbell className={`w-5 h-5 ${infraestructura.instalacionesDeportivas ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`font-medium ${infraestructura.instalacionesDeportivas ? 'text-indigo-900' : 'text-slate-600'}`}>Instalaciones Deportivas</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${infraestructura.instalacionesDeportivas ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${infraestructura.instalacionesDeportivas ? 'translate-x-4' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Descripción General */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción General del Estado del Plantel</label>
                    <textarea
                        disabled={readOnly}
                        className="w-full border border-slate-300 rounded-xl p-4 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700 disabled:bg-slate-50"
                        placeholder="Ej: Escuela de nueva creación, cuenta con pocas aulas..."
                        value={infraestructura.descripcionGeneral}
                        onChange={e => setInfraestructura({ ...infraestructura, descripcionGeneral: e.target.value })}
                    ></textarea>
                </div>

                {/* Fortalezas y Debilidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Fortalezas */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Principales Fortalezas
                        </h4>
                        <div className="space-y-2 mb-3">
                            {infraestructura.fortalezas.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm border border-green-100">
                                    <span>{item}</span>
                                    {!readOnly && <button onClick={() => removeListItem('fortalezas', index)} className="text-green-600 hover:text-green-800 font-bold ml-2">×</button>}
                                </div>
                            ))}
                        </div>
                        {!readOnly && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Agregar fortaleza..."
                                    value={newFortaleza}
                                    onChange={e => setNewFortaleza(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addListItem('fortalezas', newFortaleza, setNewFortaleza)}
                                />
                                <button
                                    onClick={() => addListItem('fortalezas', newFortaleza, setNewFortaleza)}
                                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                                >
                                    Agregar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Áreas de Oportunidad */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            Áreas de Oportunidad
                        </h4>
                        <div className="space-y-2 mb-3">
                            {infraestructura.areasOportunidad.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-orange-50 text-orange-800 px-3 py-2 rounded-lg text-sm border border-orange-100">
                                    <span>{item}</span>
                                    {!readOnly && <button onClick={() => removeListItem('areasOportunidad', index)} className="text-orange-600 hover:text-orange-800 font-bold ml-2">×</button>}
                                </div>
                            ))}
                        </div>
                        {!readOnly && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Agregar área..."
                                    value={newArea}
                                    onChange={e => setNewArea(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addListItem('areasOportunidad', newArea, setNewArea)}
                                />
                                <button
                                    onClick={() => addListItem('areasOportunidad', newArea, setNewArea)}
                                    className="bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                                >
                                    Agregar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolIndicators;
