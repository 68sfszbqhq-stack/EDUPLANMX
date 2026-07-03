
import React, { useState } from 'react';
import { Layout, Settings, Users, PlusCircle, History, GraduationCap, BookOpen, LogOut, TrendingUp, Network, Sparkles, ChevronDown, CheckCircle2, Menu, X } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { analyticsService } from '../src/services/analyticsService';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

// Lee el progreso real del docente desde localStorage (donde App.tsx lo persiste)
const getStepProgress = () => {
    let contextoListo = false;
    let tienePlaneaciones = false;
    try {
        const school = JSON.parse(localStorage.getItem('schoolContext') || '{}');
        contextoListo = Boolean(school?.vision?.trim() || school?.municipality?.trim() || school?.cct?.trim());
        const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
        tienePlaneaciones = Array.isArray(plans) && plans.length > 0;
    } catch {
        // localStorage corrupto: sin palomitas, sin drama
    }
    return { contextoListo, tienePlaneaciones };
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {

    const { logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const { contextoListo, tienePlaneaciones } = getStepProgress();

    // Ruta principal del docente, en el orden en que debe recorrerla
    const pasos = [
        { id: 'context', label: 'Contexto Escolar', icon: Settings, step: 1, done: contextoListo },
        { id: 'diagnostico', label: 'Diagnóstico del Grupo', icon: Users, step: 2, done: false },
        { id: 'generator', label: 'Generar Planeación', icon: PlusCircle, step: 3, done: false, destacado: true },
        { id: 'plans', label: 'Mis Planeaciones', icon: History, step: 4, done: tienePlaneaciones },
    ];

    const masHerramientas = [
        { id: 'guia-curricular', label: 'Guía Curricular', icon: BookOpen },
        { id: 'herramientas', label: 'Herramientas', icon: Sparkles },
        { id: 'ficha12', label: 'Ficha 12 (Taller)', icon: BookOpen },
        { id: 'pmc', label: 'PMC Directivo', icon: TrendingUp },
        { id: 'paec', label: 'Comité PAEC', icon: Network },
    ];

    if (user?.rol === 'superadmin') {
        masHerramientas.push({ id: 'admin-asignacion', label: 'Asignar Materias', icon: BookOpen });
        masHerramientas.push({ id: 'admin-alumnos', label: 'Gestión de Alumnos', icon: Users });
    }

    // "Más herramientas" queda abierto si la vista activa vive ahí dentro
    const moreIsActive = masHerramientas.some(item => item.id === activeView);

    const handleNavigate = (viewId: string) => {
        analyticsService.trackModuloAbierto(viewId);
        setMobileOpen(false);
        onNavigate(viewId);
    };

    const NavContent = () => (
        <>
            <div className="p-6 border-b border-indigo-800">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-indigo-300" />
                    <h1 className="font-bold text-xl tracking-tight">EduPlan MX</h1>
                </div>
                <p className="text-xs text-indigo-300 mt-2 uppercase font-semibold">Bachillerato Oficial</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
                {/* Inicio */}
                <button
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'dashboard'
                        ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-900/50'
                        : 'hover:bg-indigo-800/50 text-indigo-100'
                        }`}
                >
                    <Layout className={`w-5 h-5 ${activeView === 'dashboard' ? 'text-indigo-300' : ''}`} />
                    <span className="font-medium">Inicio</span>
                </button>

                {/* Ruta numerada: el camino del docente */}
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest px-4 pt-4 pb-1">
                    Tu planeación en 4 pasos
                </p>
                {pasos.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-900/50'
                                : item.destacado
                                    ? 'bg-indigo-600/40 hover:bg-indigo-600/60 text-white border border-indigo-500/50'
                                    : 'hover:bg-indigo-800/50 text-indigo-100'
                                }`}
                        >
                            {/* Número de paso o palomita de completado */}
                            {item.done ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive || item.destacado ? 'bg-white text-indigo-700' : 'bg-indigo-800 text-indigo-200 border border-indigo-600'
                                    }`}>
                                    {item.step}
                                </span>
                            )}
                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-indigo-300/70'}`} />
                            <span className="font-medium text-sm text-left flex-1">{item.label}</span>
                        </button>
                    );
                })}

                {/* Más herramientas (plegable) */}
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full flex items-center justify-between px-4 py-3 mt-4 rounded-xl hover:bg-indigo-800/50 text-indigo-200 transition-colors"
                >
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Más herramientas</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${(showMore || moreIsActive) ? 'rotate-180' : ''}`} />
                </button>
                {(showMore || moreIsActive) && (
                    <div className="space-y-1">
                        {masHerramientas.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${isActive
                                        ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-900/50'
                                        : 'hover:bg-indigo-800/50 text-indigo-200'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-indigo-300/60'}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
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
        </>
    );

    return (
        <>
            {/* Sidebar de escritorio */}
            <aside className="w-64 bg-indigo-900 text-white flex-shrink-0 flex-col hidden md:flex h-screen sticky top-0">
                <NavContent />
            </aside>

            {/* Botón hamburguesa (solo móvil) */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed bottom-5 left-5 z-40 p-3.5 bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-900/40 active:scale-95 transition-transform"
                aria-label="Abrir menú"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Drawer móvil */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Fondo oscuro: cierra al tocar */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-72 max-w-[85vw] bg-indigo-900 text-white flex flex-col h-full shadow-2xl">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 text-indigo-300 hover:text-white z-10"
                            aria-label="Cerrar menú"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <NavContent />
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
