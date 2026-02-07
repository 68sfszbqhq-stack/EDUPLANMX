import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Users, Database, Upload, GraduationCap, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { SchoolsManagement } from './SchoolsManagement';

type AdminView = 'overview' | 'schools' | 'users' | 'data' | 'import';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [currentView, setCurrentView] = useState<AdminView>('overview');

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const menuItems = [
        { id: 'overview' as AdminView, label: 'Vista General', icon: Home },
        { id: 'schools' as AdminView, label: 'Escuelas', icon: School },
        { id: 'users' as AdminView, label: 'Usuarios', icon: Users },
        { id: 'data' as AdminView, label: 'Base de Datos', icon: Database },
        { id: 'import' as AdminView, label: 'Importar CSV', icon: Upload },
    ];

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

            {/* Menú de Navegación */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex gap-2 overflow-x-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id)}
                                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {currentView === 'overview' && (
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">
                                Dashboard Super Admin
                            </h1>
                            <p className="text-slate-600 mb-8">
                                Vista general del sistema EduPlan MX
                            </p>

                            {/* Cards de Bienvenida */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {menuItems.slice(1).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setCurrentView(item.id)}
                                            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all text-left group"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                                    <Icon className="w-6 h-6 text-indigo-600" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">{item.label}</h3>
                                            <p className="text-sm text-slate-500">
                                                {item.id === 'schools' && 'Administra todas las escuelas del sistema'}
                                                {item.id === 'users' && 'Gestiona usuarios y sus roles'}
                                                {item.id === 'data' && 'Consulta y exporta datos'}
                                                {item.id === 'import' && 'Importa datos masivos desde CSV'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Información */}
                            <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                                <h3 className="font-bold text-indigo-900 mb-2">🎉 Panel de Administración Completo</h3>
                                <p className="text-indigo-800 text-sm">
                                    Desde aquí puedes administrar todo el sistema EduPlan MX. Selecciona una sección del menú superior para comenzar.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentView === 'schools' && <SchoolsManagement />}

                    {currentView === 'users' && (
                        <div className="text-center py-20">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestión de Usuarios</h2>
                            <p className="text-slate-600">En desarrollo... (Fase 2)</p>
                        </div>
                    )}

                    {currentView === 'data' && (
                        <div className="text-center py-20">
                            <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Base de Datos</h2>
                            <p className="text-slate-600">En desarrollo... (Fase 4)</p>
                        </div>
                    )}

                    {currentView === 'import' && (
                        <div className="text-center py-20">
                            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Importar CSV</h2>
                            <p className="text-slate-600">En desarrollo... (Fase 3)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
