import React, { useState, useEffect } from 'react';
import { Users, BookOpen, AlertCircle, CheckCircle, Save, RefreshCw } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/contexts/AuthContext';

export interface DiagnosticoGrupo {
    grupoId: string;
    nombreGrupo: string;
    semestre: number;
    totalAlumnos: number;

    // Perfil del grupo
    perfilGeneral: string;
    estilosAprendizaje: {
        visual: number;    // porcentaje
        auditivo: number;
        kinestesico: number;
    };

    // Conocimientos previos
    conocimientosPrevios: {
        nivel: 'bajo' | 'medio' | 'alto';
        descripcion: string;
        areasFortaleza: string[];
        areasOportunidad: string[];
    };

    // Necesidades especiales
    necesidadesEspeciales: {
        tieneAlumnosBAP: boolean;
        cantidadBAP: number;
        tiposApoyo: string[];
        ajustesRazonables: string;
    };

    // Contexto socioemocional
    contextoSocioemocional: {
        climaGrupal: 'positivo' | 'neutro' | 'desafiante';
        observaciones: string;
    };

    // Recursos tecnológicos
    recursosTecnologicos: {
        tienenDispositivo: number; // porcentaje con dispositivo propio
        tienenInternet: number;    // porcentaje con internet en casa
        nivelAlfabetizacionDigital: 'basico' | 'intermedio' | 'avanzado';
    };

    // Metadata
    actualizadoPor: string;
    fechaActualizacion: string;
}

interface DiagnosticoGrupoFormProps {
    grupoId: string;
    nombreGrupo: string;
    semestre: number;
    onSave?: (diagnostico: DiagnosticoGrupo) => void;
    readOnly?: boolean;
}

const INICIAL_DIAGNOSTICO: Omit<DiagnosticoGrupo, 'grupoId' | 'nombreGrupo' | 'semestre' | 'actualizadoPor' | 'fechaActualizacion'> = {
    totalAlumnos: 0,
    perfilGeneral: '',
    estilosAprendizaje: { visual: 33, auditivo: 33, kinestesico: 34 },
    conocimientosPrevios: {
        nivel: 'medio',
        descripcion: '',
        areasFortaleza: [],
        areasOportunidad: []
    },
    necesidadesEspeciales: {
        tieneAlumnosBAP: false,
        cantidadBAP: 0,
        tiposApoyo: [],
        ajustesRazonables: ''
    },
    contextoSocioemocional: {
        climaGrupal: 'positivo',
        observaciones: ''
    },
    recursosTecnologicos: {
        tienenDispositivo: 50,
        tienenInternet: 50,
        nivelAlfabetizacionDigital: 'basico'
    }
};

export const DiagnosticoGrupoForm: React.FC<DiagnosticoGrupoFormProps> = ({
    grupoId,
    nombreGrupo,
    semestre,
    onSave,
    readOnly = false
}) => {
    const { user } = useAuth();
    const [diagnostico, setDiagnostico] = useState<DiagnosticoGrupo>({
        ...INICIAL_DIAGNOSTICO,
        grupoId,
        nombreGrupo,
        semestre,
        actualizadoPor: user?.nombre || '',
        fechaActualizacion: new Date().toISOString()
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Input temporal para listas
    const [tempFortaleza, setTempFortaleza] = useState('');
    const [tempOportunidad, setTempOportunidad] = useState('');
    const [tempApoyo, setTempApoyo] = useState('');

    useEffect(() => {
        cargarDiagnostico();
    }, [grupoId]);

    const cargarDiagnostico = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, 'diagnosticos_grupo', grupoId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setDiagnostico(docSnap.data() as DiagnosticoGrupo);
            }
        } catch (error) {
            console.error('Error al cargar diagnóstico:', error);
        } finally {
            setLoading(false);
        }
    };

    const guardarDiagnostico = async () => {
        if (!user?.schoolId) return;

        try {
            setSaving(true);
            const docRef = doc(db, 'diagnosticos_grupo', grupoId);

            const dataToSave = {
                ...diagnostico,
                actualizadoPor: user.nombre || user.email,
                fechaActualizacion: new Date().toISOString(),
                schoolId: user.schoolId
            };

            await setDoc(docRef, dataToSave, { merge: true });

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);

            onSave?.(dataToSave);
        } catch (error) {
            console.error('Error al guardar diagnóstico:', error);
            alert('Error al guardar el diagnóstico');
        } finally {
            setSaving(false);
        }
    };

    const addToList = (list: 'areasFortaleza' | 'areasOportunidad' | 'tiposApoyo', value: string) => {
        if (!value.trim()) return;

        setDiagnostico(prev => {
            if (list === 'tiposApoyo') {
                return {
                    ...prev,
                    necesidadesEspeciales: {
                        ...prev.necesidadesEspeciales,
                        tiposApoyo: [...prev.necesidadesEspeciales.tiposApoyo, value.trim()]
                    }
                };
            }
            return {
                ...prev,
                conocimientosPrevios: {
                    ...prev.conocimientosPrevios,
                    [list]: [...prev.conocimientosPrevios[list], value.trim()]
                }
            };
        });
    };

    const removeFromList = (list: 'areasFortaleza' | 'areasOportunidad' | 'tiposApoyo', index: number) => {
        setDiagnostico(prev => {
            if (list === 'tiposApoyo') {
                return {
                    ...prev,
                    necesidadesEspeciales: {
                        ...prev.necesidadesEspeciales,
                        tiposApoyo: prev.necesidadesEspeciales.tiposApoyo.filter((_, i) => i !== index)
                    }
                };
            }
            return {
                ...prev,
                conocimientosPrevios: {
                    ...prev.conocimientosPrevios,
                    [list]: prev.conocimientosPrevios[list].filter((_, i) => i !== index)
                }
            };
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-slate-600">Cargando diagnóstico...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        <div>
                            <h2 className="text-xl font-bold">Diagnóstico del Grupo</h2>
                            <p className="text-indigo-100">{nombreGrupo} - Semestre {semestre}</p>
                        </div>
                    </div>
                    {!readOnly && (
                        <button
                            onClick={guardarDiagnostico}
                            disabled={saving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${saved
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-indigo-600 hover:bg-indigo-50'
                                }`}
                        >
                            {saving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saved ? 'Guardado' : 'Guardar'}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Información básica */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Total de Alumnos
                            </label>
                            <input
                                type="number"
                                value={diagnostico.totalAlumnos}
                                onChange={(e) => setDiagnostico(prev => ({
                                    ...prev,
                                    totalAlumnos: parseInt(e.target.value) || 0
                                }))}
                                disabled={readOnly}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Perfil General del Grupo
                        </label>
                        <textarea
                            value={diagnostico.perfilGeneral}
                            onChange={(e) => setDiagnostico(prev => ({
                                ...prev,
                                perfilGeneral: e.target.value
                            }))}
                            disabled={readOnly}
                            rows={3}
                            placeholder="Describa las características generales del grupo: intereses, motivación, dinámicas de trabajo..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />
                    </div>
                </section>

                {/* Estilos de aprendizaje */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Estilos de Aprendizaje (VAK)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {(['visual', 'auditivo', 'kinestesico'] as const).map(estilo => (
                            <div key={estilo} className="text-center">
                                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                                    {estilo}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={diagnostico.estilosAprendizaje[estilo]}
                                    onChange={(e) => setDiagnostico(prev => ({
                                        ...prev,
                                        estilosAprendizaje: {
                                            ...prev.estilosAprendizaje,
                                            [estilo]: parseInt(e.target.value)
                                        }
                                    }))}
                                    disabled={readOnly}
                                    className="w-full"
                                />
                                <span className="text-lg font-bold text-indigo-600">
                                    {diagnostico.estilosAprendizaje[estilo]}%
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Conocimientos previos */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Conocimientos Previos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nivel General
                            </label>
                            <select
                                value={diagnostico.conocimientosPrevios.nivel}
                                onChange={(e) => setDiagnostico(prev => ({
                                    ...prev,
                                    conocimientosPrevios: {
                                        ...prev.conocimientosPrevios,
                                        nivel: e.target.value as 'bajo' | 'medio' | 'alto'
                                    }
                                }))}
                                disabled={readOnly}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                            >
                                <option value="bajo">Bajo</option>
                                <option value="medio">Medio</option>
                                <option value="alto">Alto</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        value={diagnostico.conocimientosPrevios.descripcion}
                        onChange={(e) => setDiagnostico(prev => ({
                            ...prev,
                            conocimientosPrevios: {
                                ...prev.conocimientosPrevios,
                                descripcion: e.target.value
                            }
                        }))}
                        disabled={readOnly}
                        rows={2}
                        placeholder="Descripción de los conocimientos previos del grupo..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 mb-4"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fortalezas */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Áreas de Fortaleza
                            </label>
                            {!readOnly && (
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tempFortaleza}
                                        onChange={(e) => setTempFortaleza(e.target.value)}
                                        placeholder="Agregar fortaleza..."
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addToList('areasFortaleza', tempFortaleza);
                                                setTempFortaleza('');
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            addToList('areasFortaleza', tempFortaleza);
                                            setTempFortaleza('');
                                        }}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {diagnostico.conocimientosPrevios.areasFortaleza.map((f, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                    >
                                        {f}
                                        {!readOnly && (
                                            <button
                                                onClick={() => removeFromList('areasFortaleza', i)}
                                                className="hover:text-green-900"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Oportunidades */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Áreas de Oportunidad
                            </label>
                            {!readOnly && (
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tempOportunidad}
                                        onChange={(e) => setTempOportunidad(e.target.value)}
                                        placeholder="Agregar área de oportunidad..."
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addToList('areasOportunidad', tempOportunidad);
                                                setTempOportunidad('');
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            addToList('areasOportunidad', tempOportunidad);
                                            setTempOportunidad('');
                                        }}
                                        className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {diagnostico.conocimientosPrevios.areasOportunidad.map((o, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
                                    >
                                        {o}
                                        {!readOnly && (
                                            <button
                                                onClick={() => removeFromList('areasOportunidad', i)}
                                                className="hover:text-amber-900"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recursos tecnológicos */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recursos Tecnológicos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                % con dispositivo propio
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={diagnostico.recursosTecnologicos.tienenDispositivo}
                                onChange={(e) => setDiagnostico(prev => ({
                                    ...prev,
                                    recursosTecnologicos: {
                                        ...prev.recursosTecnologicos,
                                        tienenDispositivo: parseInt(e.target.value)
                                    }
                                }))}
                                disabled={readOnly}
                                className="w-full"
                            />
                            <span className="text-lg font-bold text-indigo-600">
                                {diagnostico.recursosTecnologicos.tienenDispositivo}%
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                % con internet en casa
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={diagnostico.recursosTecnologicos.tienenInternet}
                                onChange={(e) => setDiagnostico(prev => ({
                                    ...prev,
                                    recursosTecnologicos: {
                                        ...prev.recursosTecnologicos,
                                        tienenInternet: parseInt(e.target.value)
                                    }
                                }))}
                                disabled={readOnly}
                                className="w-full"
                            />
                            <span className="text-lg font-bold text-indigo-600">
                                {diagnostico.recursosTecnologicos.tienenInternet}%
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nivel de Alfabetización Digital
                            </label>
                            <select
                                value={diagnostico.recursosTecnologicos.nivelAlfabetizacionDigital}
                                onChange={(e) => setDiagnostico(prev => ({
                                    ...prev,
                                    recursosTecnologicos: {
                                        ...prev.recursosTecnologicos,
                                        nivelAlfabetizacionDigital: e.target.value as 'basico' | 'intermedio' | 'avanzado'
                                    }
                                }))}
                                disabled={readOnly}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                            >
                                <option value="basico">Básico</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Contexto Socioemocional */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Contexto Socioemocional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Clima Grupal
                            </label>
                            <select
                                value={diagnostico.contextoSocioemocional.climaGrupal}
                                onChange={(e) => setDiagnostico(prev => ({
                                    ...prev,
                                    contextoSocioemocional: {
                                        ...prev.contextoSocioemocional,
                                        climaGrupal: e.target.value as 'positivo' | 'neutro' | 'desafiante'
                                    }
                                }))}
                                disabled={readOnly}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                            >
                                <option value="positivo">Positivo</option>
                                <option value="neutro">Neutro</option>
                                <option value="desafiante">Desafiante</option>
                            </select>
                        </div>
                    </div>
                    <textarea
                        value={diagnostico.contextoSocioemocional.observaciones}
                        onChange={(e) => setDiagnostico(prev => ({
                            ...prev,
                            contextoSocioemocional: {
                                ...prev.contextoSocioemocional,
                                observaciones: e.target.value
                            }
                        }))}
                        disabled={readOnly}
                        rows={2}
                        placeholder="Observaciones sobre el clima socioemocional del grupo..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />
                </section>

                {/* Última actualización */}
                {diagnostico.fechaActualizacion && (
                    <div className="text-sm text-slate-500 text-right border-t pt-4">
                        Última actualización: {new Date(diagnostico.fechaActualizacion).toLocaleString('es-MX')}
                        {diagnostico.actualizadoPor && ` por ${diagnostico.actualizadoPor}`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosticoGrupoForm;
