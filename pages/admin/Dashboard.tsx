import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Building2, AlertCircle, TrendingUp, LogOut, Home } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import { usuariosService } from '../../src/services/usuariosService';
import { materiasService } from '../../src/services/materiasService';
import { asignacionesService } from '../../src/services/asignacionesService';
import { alumnosService } from '../../src/services/alumnosFirebase';
import { useAuth } from '../../src/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        usuarios: { total: 0, maestros: 0, directivos: 0, activos: 0 },
        alumnos: 0,
        materias: { total: 0, activas: 0 },
        asignaciones: { total: 0, maestrosConAsignaciones: 0 }
    });

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);

            // Cargar estadísticas en paralelo
            const [usuariosStats, materiasStats, asignacionesStats, alumnos] = await Promise.all([
                usuariosService.obtenerEstadisticas(),
                materiasService.obtenerEstadisticas(),
                asignacionesService.obtenerEstadisticas(),
                alumnosService.obtenerAlumnos()
            ]);

            setStats({
                usuarios: {
                    total: usuariosStats.total,
                    maestros: usuariosStats.porRol.maestro,
                    directivos: usuariosStats.porRol.directivo,
                    activos: usuariosStats.activos
                },
                alumnos: alumnos.length,
                materias: {
                    total: materiasStats.total,
                    activas: materiasStats.activas
                },
                asignaciones: {
                    total: asignacionesStats.total,
                    maestrosConAsignaciones: asignacionesStats.maestrosConAsignaciones
                }
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-700">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo y título */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">EduPlan MX</h1>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                        </div>

                        {/* Usuario y acciones */}
                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="text-right mr-4">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {user.nombre} {user.apellidoPaterno}
                                    </p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                                title="Ir a inicio"
                            >
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Inicio</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            Dashboard Super Admin
                        </h1>
                        <p className="text-slate-600">
                            Vista general del sistema EduPlan MX
                        </p>
                    </div>

                    {/* Estadísticas Principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Usuarios"
                            value={stats.usuarios.total}
                            icon={Users}
                            color="blue"
                            subtitle={`${stats.usuarios.activos} activos`}
                        />
                        <StatsCard
                            title="Maestros"
                            value={stats.usuarios.maestros}
                            icon={GraduationCap}
                            color="green"
                            subtitle={`${stats.asignaciones.maestrosConAsignaciones} con asignaciones`}
                        />
                        <StatsCard
                            title="Alumnos"
                            value={stats.alumnos}
                            icon={Users}
                            color="purple"
                            subtitle="Registrados en el sistema"
                        />
                        <StatsCard
                            title="Materias"
                            value={stats.materias.total}
                            icon={BookOpen}
                            color="orange"
                            subtitle={`${stats.materias.activas} activas`}
                        />
                    </div>

                    {/* Sección de Asignaciones */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Asignaciones</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Total de asignaciones:</span>
                                    <span className="text-2xl font-bold text-slate-900">{stats.asignaciones.total}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Maestros con asignaciones:</span>
                                    <span className="text-lg font-semibold text-indigo-600">
                                        {stats.asignaciones.maestrosConAsignaciones}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Distribución de Roles</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Maestros:</span>
                                    <span className="text-lg font-semibold text-green-600">{stats.usuarios.maestros}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Directivos:</span>
                                    <span className="text-lg font-semibold text-blue-600">{stats.usuarios.directivos}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/admin/usuarios')}
                                className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                            >
                                <Users className="w-5 h-5 text-indigo-600" />
                                <span className="font-semibold text-indigo-900">Gestionar Usuarios</span>
                            </button>
                            <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200">
                                <BookOpen className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-900">Gestionar Materias</span>
                            </button>
                            <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-purple-900">Asignar Materias</span>
                            </button>
                        </div>
                    </div>

                    {/* Alertas (placeholder) */}
                    <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-green-900 mb-2">✅ Sesión 2 Completada</h3>
                                <p className="text-green-800 text-sm">
                                    La gestión de usuarios está lista. Puedes crear, editar, cambiar roles, activar/desactivar y eliminar usuarios.
                                    Click en "Gestionar Usuarios" para empezar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
