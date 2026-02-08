import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Target, Award, TrendingUp,
    Clock, ChevronDown, ChevronUp, ExternalLink, Book,
    CheckCircle, FileText, Video, Globe
} from 'lucide-react';
import { materiasService } from '../../src/services/materiasService';
import { programasSEPService } from '../../src/services/programasSEPService';
import type { Materia, Unidad } from '../../types/materia';
import Sidebar from '../../components/Sidebar';

const ProgramaMateria: React.FC = () => {
    const { materiaId } = useParams<{ materiaId: string }>();
    const navigate = useNavigate();
    const [materia, setMateria] = useState<Materia | null>(null);
    const [loading, setLoading] = useState(true);
    const [unidadExpandida, setUnidadExpandida] = useState<number | null>(1);
    const [programaSEP, setProgramaSEP] = useState<any | null>(null);
    const [mostrarProgresionesOficiales, setMostrarProgresionesOficiales] = useState(false);

    useEffect(() => {
        if (materiaId) {
            cargarMateria();
        }
    }, [materiaId]);

    const cargarMateria = async () => {
        try {
            setLoading(true);
            let data = await materiasService.obtenerPorId(materiaId!);

            // FALLBACK LOCAL: Si no está en DB, buscar en programas oficiales
            if (!data && materiaId?.startsWith('sep-')) {
                console.log('🔍 Materia no en DB, buscando en Fallback local...');
                const stats = programasSEPService.obtenerEstadisticas();
                const materiasDisponibles = stats.materiasDisponibles;

                let foundOffline: any = null;
                for (const m of materiasDisponibles) {
                    const programs = programasSEPService.buscarPorMateria(m);
                    foundOffline = programs.find(p => `sep-${String(p.materia).replace(/\s+/g, '-')}-${p.semestre}` === materiaId);
                    if (foundOffline) break;
                }

                if (foundOffline) {
                    // Adaptador para objeto Materia
                    data = {
                        id: materiaId,
                        nombre: foundOffline.materia,
                        clave: `SEP-${foundOffline.semestre}${String(foundOffline.materia).substring(0, 3).toUpperCase()}`,
                        grado: foundOffline.semestre as any,
                        categoria: (foundOffline.organizador_curricular?.categorias?.[0] || 'Unidad de Aprendizaje'),
                        horasSemanales: foundOffline.metadata?.horas_semanales || 4,
                        totalHoras: (foundOffline.metadata?.horas_semanales || 4) * 16,
                        proposito: `Programa oficial del MCCEMS para ${foundOffline.materia}.`,
                        competencias: foundOffline.organizador_curricular?.metas_aprendizaje || [],
                        ejesFormativos: foundOffline.organizador_curricular?.categorias || [],
                        unidades: [],
                        bibliografiaBasica: [],
                        bibliografiaComplementaria: [],
                        recursosDigitales: [],
                        criteriosEvaluacion: [],
                        instrumentosEvaluacion: [],
                        activa: true,
                        fechaCreacion: new Date().toISOString(),
                        creadoPor: 'SEP-OFFICIAL'
                    };
                }
            }

            setMateria(data);

            // Intentar cargar programa oficial SEP extendido si existe
            if (data) {
                try {
                    const programaOficial = programasSEPService.buscarPorMateriaYSemestre(
                        data.nombre,
                        data.grado
                    );
                    setProgramaSEP(programaOficial);
                    console.log('✅ Programa oficial SEP encontrado:', programaOficial);
                } catch (error) {
                    console.log('ℹ️ No se encontró programa oficial SEP para esta materia');
                    setProgramaSEP(null);
                }
            }
        } catch (error) {
            console.error('Error al cargar materia:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUnidad = (numero: number) => {
        setUnidadExpandida(unidadExpandida === numero ? null : numero);
    };

    const getRecursoIcon = (tipo: string) => {
        switch (tipo) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'plataforma': return <Globe className="w-4 h-4" />;
            case 'libro': return <Book className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const handleNavigate = (view: string) => {
        if (view === 'guia-curricular') {
            navigate('/maestro/guia-curricular');
            return;
        }
        navigate('/maestro/dashboard', { state: { view } });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 text-slate-900">
                <Sidebar activeView="guia-curricular" onNavigate={handleNavigate} />
                <main className="flex-1 overflow-y-auto h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-lg font-semibold text-slate-700">Cargando programa...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!materia) {
        return (
            <div className="flex min-h-screen bg-slate-50 text-slate-900">
                <Sidebar activeView="guia-curricular" onNavigate={handleNavigate} />
                <main className="flex-1 overflow-y-auto h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg text-slate-600">Materia no encontrada</p>
                        <button
                            onClick={() => navigate('/maestro/guia-curricular')}
                            className="mt-4 text-indigo-600 hover:text-indigo-700"
                        >
                            Volver a la guía
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <Sidebar activeView="guia-curricular" onNavigate={handleNavigate} />
            <main className="flex-1 overflow-y-auto h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <button
                        onClick={() => navigate('/maestro/guia-curricular')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Volver a la guía</span>
                    </button>

                    {/* Título */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                                    {materia.nombre}
                                    {materia.id.startsWith('sep-') && (
                                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg border border-white/30 flex items-center gap-1 font-semibold">
                                            <Award className="w-3 h-3" />
                                            Versión 2025
                                        </span>
                                    )}
                                </h1>
                                <p className="text-white/90 text-lg mb-4">Programa del Semestre</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                        <span className="font-semibold">Clave:</span> {materia.clave}
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                        <Clock className="w-4 h-4" />
                                        <span>{materia.horasSemanales} hrs/semana</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{materia.totalHoras} hrs totales</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Propósitos Formativos */}
                    <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Target className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Propósitos Formativos (Versión 2025)</h2>
                        </div>
                        {programaSEP?.organizador_curricular?.propositos_formativos && programaSEP.organizador_curricular.propositos_formativos.length > 0 ? (
                            <div className="space-y-3">
                                {programaSEP.organizador_curricular.propositos_formativos.map((prop: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-500">
                                        <div className="bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed">{prop}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-700 leading-relaxed">{materia.proposito}</p>
                        )}
                    </div>

                    {/* Competencias */}
                    <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Competencias a Desarrollar</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {materia.competencias.map((competencia, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">{competencia}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Programa Oficial SEP (si existe) */}
                    {programaSEP && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-indigo-200 shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-indigo-600 p-2 rounded-lg">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            📘 Programa Oficial DGB/SEP
                                            <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">MCCEMS</span>
                                        </h2>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Marco Curricular Común de la Educación Media Superior
                                        </p>
                                    </div>
                                </div>
                                {programaSEP.url_fuente && (
                                    <a
                                        href={programaSEP.url_fuente}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Ver PDF oficial
                                    </a>
                                )}
                            </div>

                            {/* Metadata del programa oficial */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                {programaSEP.metadata?.creditos && (
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <div className="text-xs text-slate-600 font-medium">Créditos</div>
                                        <div className="text-lg font-bold text-indigo-700">{programaSEP.metadata.creditos}</div>
                                    </div>
                                )}
                                {programaSEP.metadata?.horas_semanales && (
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <div className="text-xs text-slate-600 font-medium">Horas/Semana</div>
                                        <div className="text-lg font-bold text-indigo-700">{programaSEP.metadata.horas_semanales}</div>
                                    </div>
                                )}
                                <div className="bg-white/60 rounded-lg p-3">
                                    <div className="text-xs text-slate-600 font-medium">Progresiones</div>
                                    <div className="text-lg font-bold text-indigo-700">{programaSEP.progresiones?.length || 0}</div>
                                </div>
                                <div className="bg-white/60 rounded-lg p-3">
                                    <div className="text-xs text-slate-600 font-medium">Categorías</div>
                                    <div className="text-lg font-bold text-indigo-700">{programaSEP.organizador_curricular?.categorias?.length || 0}</div>
                                </div>
                            </div>

                            {/* Progresiones de Aprendizaje Oficiales */}
                            {programaSEP.progresiones && programaSEP.progresiones.length > 0 && (
                                <div className="bg-white/80 rounded-xl p-4">
                                    <button
                                        onClick={() => setMostrarProgresionesOficiales(!mostrarProgresionesOficiales)}
                                        className="w-full flex items-center justify-between text-left font-semibold text-slate-900 hover:text-indigo-700 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                                            Progresiones de Aprendizaje Oficiales ({programaSEP.progresiones.length})
                                        </span>
                                        {mostrarProgresionesOficiales ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>

                                    {mostrarProgresionesOficiales && (
                                        <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto">
                                            {programaSEP.progresiones.map((prog: any, index: number) => (
                                                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-indigo-300 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="bg-indigo-600 text-white font-bold min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm shadow-sm">
                                                            {prog.id}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-slate-900 font-medium text-sm leading-relaxed mb-2">
                                                                {prog.descripcion}
                                                            </p>

                                                            {/* Metas de Aprendizaje */}
                                                            {prog.metas && prog.metas.length > 0 && (
                                                                <div className="mt-3 pl-3 border-l-2 border-green-400 bg-green-50/50 rounded-r py-2 pr-2">
                                                                    <p className="text-xs font-semibold text-green-700 mb-1">🎯 Metas de Aprendizaje:</p>
                                                                    {prog.metas.map((meta: string, idx: number) => (
                                                                        <div key={idx} className="text-xs text-slate-700 flex items-start gap-1 mt-1">
                                                                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                                            <span>{meta}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Temáticas (si existen) */}
                                                            {prog.tematicas && prog.tematicas.length > 0 && (
                                                                <div className="mt-3 pl-3 border-l-2 border-blue-400 bg-blue-50/50 rounded-r py-2 pr-2">
                                                                    <p className="text-xs font-semibold text-blue-700 mb-2">📚 Temáticas a desarrollar:</p>
                                                                    <ul className="space-y-1">
                                                                        {prog.tematicas.map((tema: string, idx: number) => (
                                                                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                                                                <span className="text-blue-500 font-bold">•</span>
                                                                                <span className="flex-1">{tema}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fuente y fecha */}
                            <div className="mt-4 text-xs text-slate-600 flex items-center justify-between">
                                <span>
                                    Fuente: DGB/SEP - Marco Curricular Común
                                </span>
                                {programaSEP.fecha_extraccion && (
                                    <span>
                                        Extraído: {new Date(programaSEP.fecha_extraccion).toLocaleDateString('es-MX')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ejes Formativos / Categorías */}
                    {materia.ejesFormativos && materia.ejesFormativos.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Ejes Formativos / Categorías</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {materia.ejesFormativos.map((eje, index) => (
                                    <span key={index} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium border border-blue-100">
                                        {eje}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orientaciones Didácticas (Nuevo) */}
                    {programaSEP?.orientaciones_didacticas && programaSEP.orientaciones_didacticas.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-cyan-100 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Orientaciones Didácticas Sugeridas</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {programaSEP.orientaciones_didacticas.map((ori: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="bg-cyan-500 w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-slate-700 text-sm">{ori}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unidades */}
                    {materia.unidades && materia.unidades.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">📚 Unidades del Programa</h2>
                            <div className="space-y-4">
                                {materia.unidades.map((unidad) => (
                                    <div key={unidad.numero} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
                                        {/* Header de Unidad */}
                                        <button
                                            onClick={() => toggleUnidad(unidad.numero)}
                                            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1 text-left">
                                                <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">
                                                    {unidad.numero}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-slate-900">{unidad.nombre}</h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {unidad.duracionHoras} horas
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen className="w-4 h-4" />
                                                            {unidad.temas.length} temas
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {unidadExpandida === unidad.numero ? (
                                                <ChevronUp className="w-6 h-6 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-6 h-6 text-slate-400" />
                                            )}
                                        </button>

                                        {/* Contenido de Unidad */}
                                        {unidadExpandida === unidad.numero && (
                                            <div className="border-t border-slate-200 p-6 bg-slate-50">
                                                {/* Propósito de la Unidad */}
                                                <div className="mb-6">
                                                    <h4 className="font-semibold text-slate-900 mb-2">🎯 Propósito:</h4>
                                                    <p className="text-slate-700">{unidad.proposito}</p>
                                                </div>

                                                {/* Temas */}
                                                <div className="mb-6">
                                                    <h4 className="font-semibold text-slate-900 mb-3">📝 Temas:</h4>
                                                    <div className="space-y-4">
                                                        {unidad.temas.map((tema) => (
                                                            <div key={tema.numero} className="bg-white rounded-xl p-4 border border-slate-200">
                                                                <div className="flex items-start gap-3 mb-3">
                                                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-sm font-bold">
                                                                        {tema.numero}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <h5 className="font-bold text-slate-900">{tema.nombre}</h5>
                                                                        <span className="text-xs text-slate-500">{tema.duracionHoras} horas</span>
                                                                    </div>
                                                                </div>

                                                                {/* Contenidos */}
                                                                <div className="mb-3">
                                                                    <p className="text-sm font-semibold text-slate-700 mb-2">Contenidos:</p>
                                                                    <ul className="space-y-1">
                                                                        {tema.contenidos.map((contenido, idx) => (
                                                                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                                                <span className="text-indigo-500 mt-1">•</span>
                                                                                <span>{contenido}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                {/* Aprendizajes Esperados */}
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-700 mb-2">Aprendizajes Esperados:</p>
                                                                    <ul className="space-y-1">
                                                                        {tema.aprendizajesEsperados.map((aprendizaje, idx) => (
                                                                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                                                <span>{aprendizaje}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Actividades Sugeridas */}
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 mb-3">🎨 Actividades Sugeridas:</h4>
                                                    <ul className="space-y-2">
                                                        {unidad.actividadesSugeridas.map((actividad, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-slate-700">
                                                                <TrendingUp className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
                                                                <span className="text-sm">{actividad}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recursos Digitales */}
                    {materia.recursosDigitales && materia.recursosDigitales.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Recursos Digitales Recomendados</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materia.recursosDigitales.map((recurso, index) => (
                                    <a
                                        key={index}
                                        href={recurso.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
                                    >
                                        <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                                            {getRecursoIcon(recurso.tipo)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                                                    {recurso.nombre}
                                                </h4>
                                                <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">{recurso.descripcion}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evaluación */}
                    {materia.criteriosEvaluacion && materia.criteriosEvaluacion.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Criterios de Evaluación</h2>
                            </div>
                            <div className="space-y-3">
                                {materia.criteriosEvaluacion.map((criterio, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900">{criterio.aspecto}</h4>
                                            <p className="text-sm text-slate-600">{criterio.descripcion}</p>
                                        </div>
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {criterio.porcentaje}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bibliografía (Nueva) */}
                    {materia.bibliografiaBasica && materia.bibliografiaBasica.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                    <Book className="w-5 h-5 text-slate-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Bibliografía Recomendada</h2>
                            </div>
                            <div className="space-y-2">
                                {materia.bibliografiaBasica.map((bib, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                        <div className="bg-white p-1 rounded border border-slate-200">
                                            {bib.disponibilidad === 'digital' ? <Globe className="w-3 h-3 text-blue-500" /> : <BookOpen className="w-3 h-3 text-slate-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-700 text-sm font-medium">{bib.titulo}</p>
                                            <p className="text-slate-500 text-xs italic">{bib.autor} {bib.año ? `(${bib.año})` : ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProgramaMateria;
