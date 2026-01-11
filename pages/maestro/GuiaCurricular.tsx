import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { materiasService } from '../../src/services/materiasService';
import type { Materia } from '../../types/materia';
import Sidebar from '../../components/Sidebar';

const GuiaCurricular: React.FC = () => {
    const navigate = useNavigate();
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarMaterias();
    }, []);

    const cargarMaterias = async () => {
        try {
            setLoading(true);
            const data = await materiasService.obtenerTodas();
            setMaterias(data.filter(m => m.activa));
        } catch (error) {
            console.error('Error al cargar materias:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMateriaIcon = (nombre: string) => {
        if (nombre.toLowerCase().includes('matemáticas')) return '📐';
        if (nombre.toLowerCase().includes('español')) return '📖';
        if (nombre.toLowerCase().includes('química')) return '🧪';
        if (nombre.toLowerCase().includes('historia')) return '📜';
        if (nombre.toLowerCase().includes('inglés')) return '🌍';
        return '📚';
    };

    const getMateriaColor = (nombre: string) => {
        if (nombre.toLowerCase().includes('matemáticas')) return 'from-blue-500 to-indigo-600';
        if (nombre.toLowerCase().includes('español')) return 'from-green-500 to-emerald-600';
        if (nombre.toLowerCase().includes('química')) return 'from-purple-500 to-violet-600';
        if (nombre.toLowerCase().includes('historia')) return 'from-orange-500 to-red-600';
        if (nombre.toLowerCase().includes('inglés')) return 'from-cyan-500 to-blue-600';
        return 'from-slate-500 to-slate-600';
    };

    const handleNavigate = (view: string) => {
        if (view === 'guia-curricular') return;
        navigate('/maestro/dashboard', { state: { view } });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 text-slate-900">
                <Sidebar activeView="guia-curricular" onNavigate={handleNavigate} />
                <main className="flex-1 overflow-y-auto h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-lg font-semibold text-slate-700">Cargando materias...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <Sidebar activeView="guia-curricular" onNavigate={handleNavigate} />
            <main className="flex-1 overflow-y-auto h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            📚 Guía Curricular Interactiva
                        </h1>
                        <p className="text-lg text-slate-600">
                            Explora el programa completo de cada materia con contenidos, recursos y evaluación
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-8 text-white">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Target className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">¿Qué encontrarás aquí?</h2>
                                <ul className="space-y-2 text-white/90">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        Programa completo del semestre por unidades y temas
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        Propósitos formativos y competencias a desarrollar
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        Contenidos detallados y aprendizajes esperados
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        Recursos digitales, bibliografía y actividades sugeridas
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        Criterios e instrumentos de evaluación
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Materias Grid */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Selecciona una materia:</h2>

                        {materias.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 text-lg">No hay materias disponibles</p>
                                <p className="text-slate-500 text-sm mt-2">
                                    Contacta al administrador para agregar materias
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {materias.map((materia) => (
                                    <button
                                        key={materia.id}
                                        onClick={() => navigate(`/maestro/guia-curricular/${materia.id}`)}
                                        className="group bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left"
                                    >
                                        {/* Icon y Badge */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${getMateriaColor(materia.nombre)} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                                                {getMateriaIcon(materia.nombre)}
                                            </div>
                                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                {materia.grado}° Semestre
                                            </span>
                                        </div>

                                        {/* Nombre */}
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                            {materia.nombre}
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                            {materia.proposito}
                                        </p>

                                        {/* Stats */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock className="w-4 h-4 text-indigo-500" />
                                                <span>{materia.horasSemanales} hrs/semana • {materia.totalHoras} hrs totales</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                                <span>{materia.unidades.length} unidades • {materia.unidades.reduce((sum, u) => sum + u.temas.length, 0)} temas</span>
                                            </div>
                                        </div>

                                        {/* Ver Programa */}
                                        <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                                            <span>Ver programa completo</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-3">💡 Tip para Maestros</h3>
                        <p className="text-slate-600 text-sm">
                            Cada materia incluye el programa completo del semestre con todos los contenidos,
                            recursos digitales recomendados, bibliografía y criterios de evaluación.
                            Úsalo como guía para planear tus clases y asegurarte de cubrir todos los temas.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuiaCurricular;
