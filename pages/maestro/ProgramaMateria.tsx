import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Target, Award, TrendingUp,
    Clock, ChevronDown, ChevronUp, ExternalLink, Book,
    CheckCircle, FileText, Video, Globe
} from 'lucide-react';
import { materiasService } from '../../src/services/materiasService';
import type { Materia, Unidad } from '../../types/materia';

const ProgramaMateria: React.FC = () => {
    const { materiaId } = useParams<{ materiaId: string }>();
    const navigate = useNavigate();
    const [materia, setMateria] = useState<Materia | null>(null);
    const [loading, setLoading] = useState(true);
    const [unidadExpandida, setUnidadExpandida] = useState<number | null>(1);

    useEffect(() => {
        if (materiaId) {
            cargarMateria();
        }
    }, [materiaId]);

    const cargarMateria = async () => {
        try {
            setLoading(true);
            const data = await materiasService.obtenerPorId(materiaId!);
            setMateria(data);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-700">Cargando programa...</p>
                </div>
            </div>
        );
    }

    if (!materia) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-slate-600">Materia no encontrada</p>
                    <button
                        onClick={() => navigate('/maestro/guia-curricular')}
                        className="mt-4 text-indigo-600 hover:text-indigo-700"
                    >
                        Volver a la guía
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
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
                            <h1 className="text-4xl font-bold mb-2">{materia.nombre}</h1>
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

                {/* Propósito Formativo */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Propósito Formativo</h2>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{materia.proposito}</p>
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

                {/* Unidades */}
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

                {/* Recursos Digitales */}
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

                {/* Evaluación */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
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
            </div>
        </div>
    );
};

export default ProgramaMateria;
