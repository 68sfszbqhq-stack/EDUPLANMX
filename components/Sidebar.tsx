
import React from 'react';
import { Layout, Settings, Users, PlusCircle, History, GraduationCap, BookOpen, LogOut, TrendingUp, Network } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {

    const { logout, user } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'guia-curricular', label: 'Guía Curricular', icon: BookOpen },
        { id: 'context', label: 'Contexto Escolar', icon: Settings },
        { id: 'diagnostico', label: 'Diagnóstico', icon: Users },
        { id: 'generator', label: 'Nueva Planeación', icon: PlusCircle },
        { id: 'plans', label: 'Historial', icon: History },
        { id: 'pmc', label: 'PMC Directivo', icon: TrendingUp },
        { id: 'paec', label: 'Comité PAEC', icon: Network },
    ];

    if (user?.rol === 'superadmin') {
        menuItems.push({ id: 'admin-asignacion', label: 'Asignar Materias', icon: BookOpen });
        menuItems.push({ id: 'admin-alumnos', label: 'Gestión de Alumnos', icon: Users });
    }

    return (
        <aside className="w-64 bg-indigo-900 text-white flex-shrink-0 flex flex-col hidden md:flex h-screen sticky top-0">
            <div className="p-6 border-b border-indigo-800">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-indigo-300" />
                    <h1 className="font-bold text-xl tracking-tight">EduPlan MX</h1>
                </div>
                <p className="text-xs text-indigo-300 mt-2 uppercase font-semibold">Bachillerato Oficial</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-900/50'
                                : 'hover:bg-indigo-800/50 text-indigo-100'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-300' : ''}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-indigo-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-indigo-200 hover:text-red-200 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
                <div className="mt-4 text-xs text-indigo-400 text-center">
                    v1.0.0 - Hecho para México
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
