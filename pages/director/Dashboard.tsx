import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, GraduationCap, BookOpen, Building2,
    TrendingUp, LogOut, Home, Calendar, FileText
} from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import StatsCard from '../../components/admin/StatsCard';
import SchoolIndicators from '../../components/director/SchoolIndicators';
import PAECManager from '../../components/director/PAECManager';

interface SchoolStats {
    maestros: number;
    alumnos: number;
    planeaciones: number;
    grupos: number;
}

const DirectorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<SchoolStats>({
        maestros: 0,
        alumnos: 0,
        planeaciones: 0,
        grupos: 0
    });
    const [activeTab, setActiveTab] = useState<'general' | 'pmc' | 'paec'>('general');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.schoolId) {
            loadStats();
        }
    }, [user?.schoolId]);

    const loadStats = async () => {
        if (!user?.schoolId) return;

        try {
            setLoading(true);

            // 1. Contar Maestros de esta escuela
            const maestrosQuery = query(
                collection(db, 'users'),
                where('schoolId', '==', user.schoolId),
                where('rol', '==', 'maestro')
            );
            const maestrosSnapshot = await getDocs(maestrosQuery);

            // 2. Contar Alumnos de esta escuela
            const alumnosQuery = query(
                collection(db, 'alumnos'),
                where('schoolId', '==', user.schoolId)
            );
            const alumnosSnapshot = await getDocs(alumnosQuery);

            // 3. Contar Planeaciones de esta escuela
            const planeacionesQuery = query(
                collection(db, 'planeaciones'),
                where('schoolId', '==', user.schoolId)
            );
            const planeacionesSnapshot = await getDocs(planeacionesQuery);

            // 4. Calcular grupos únicos (basado en alumnos)
            const grupos = new Set();
            alumnosSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.grado && data.grupo) {
                    grupos.add(`${data.grado}-${data.grupo}`);
                }
            });

            setStats({
                maestros: maestrosSnapshot.size,
                alumnos: alumnosSnapshot.size,
                planeaciones: planeacionesSnapshot.size,
                grupos: grupos.size
            });

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando información de tu escuela...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo y Escuela */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                    {user?.schoolName || 'Mi Escuela'}
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">Panel Directivo</p>
                            </div>
                        </div>

                        {/* Usuario y Logout */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right mr-2">
                                <p className="text-sm font-semibold text-slate-900">
                                    {user?.nombre} {user?.apellidoPaterno}
                                </p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Navegación por Pestañas */}
                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'general'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Vista General
                    </button>
                    <button
                        onClick={() => setActiveTab('pmc')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'pmc'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Diagnóstico (PMC)
                    </button>
                    <button
                        onClick={() => setActiveTab('paec')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'paec'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Programa Aula Escuela Comunidad (PAEC)
                    </button>
                </div>

                {/* Contenido de Pestañas */}
                {activeTab === 'general' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Grid de Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatsCard
                                title="Maestros"
                                value={stats.maestros}
                                icon={GraduationCap}
                                color="blue"
                                subtitle="Docentes registrados"
                            />
                            <StatsCard
                                title="Alumnos"
                                value={stats.alumnos}
                                icon={Users}
                                color="green"
                                subtitle="Estudiantes activos"
                            />
                            <StatsCard
                                title="Planeaciones"
                                value={stats.planeaciones}
                                icon={FileText}
                                color="purple"
                                subtitle="Documentos creados"
                            />
                            <StatsCard
                                title="Grupos"
                                value={stats.grupos}
                                icon={Users}
                                color="orange"
                                subtitle="Grupos activos"
                            />
                        </div>

                        {/* Acciones Rápidas */}
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Gestión Escolar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Gestionar Maestros */}
                            <button
                                onClick={() => navigate('/directivo/maestros')}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Maestros</h4>
                                <p className="text-sm text-slate-500">Administrar plantilla docente y asignaciones</p>
                            </button>

                            {/* Gestionar Alumnos */}
                            <button
                                onClick={() => navigate('/directivo/alumnos')}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Alumnos</h4>
                                <p className="text-sm text-slate-500">Lista de estudiantes y grupos</p>
                            </button>

                            {/* Reportes */}
                            <button
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Reportes</h4>
                                <p className="text-sm text-slate-500">Estadísticas de aprovechamiento y entregas</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'pmc' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <SchoolIndicators />
                    </div>
                )}

                {activeTab === 'paec' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <PAECManager />
                    </div>
                )}

                {/* Aviso Provisional */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-blue-900 font-bold mb-1">Panel de Director Activo</h4>
                        <p className="text-blue-700 text-sm">
                            Bienvenido al panel de dirección. Desde aquí podrás gestionar toda la información de
                            <span className="font-semibold"> {user?.schoolName}</span>.
                            Próximamente se habilitarán más funciones de reportes avanzados.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DirectorDashboard;
