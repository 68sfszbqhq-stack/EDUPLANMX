import { obtenerAlmacenCuenta } from '../src/security/almacenCuenta';

import React, { useState } from 'react';
import { Layout, Settings, Users, PlusCircle, History, GraduationCap, BookOpen, LogOut, TrendingUp, Network, Sparkles, ChevronDown, CheckCircle2, Menu, X, Compass, NotebookPen, ClipboardList, ListChecks, Building2, Globe } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { analyticsService } from '../src/services/analyticsService';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
}

// Lee el progreso real del docente desde localStorage (donde App.tsx lo persiste)
const getStepProgress = () => {
    const almacen = obtenerAlmacenCuenta();
    let contextoListo = false;
    let tienePlaneaciones = false;
    let flujoCompleto = false;
    let tieneBitacora = false;
    try {
        const school = JSON.parse(almacen.getItem('schoolContext') || '{}');
        contextoListo = Boolean(school?.vision?.trim() || school?.municipality?.trim() || school?.cct?.trim());
        const plans = JSON.parse(almacen.getItem('savedPlans') || '[]');
        tienePlaneaciones = Array.isArray(plans) && plans.length > 0;
        // Flujo de contextualización: completo cuando las 4 fases (plantel, grupo, BAP, PAEC) tienen datos
        const flujo = JSON.parse(almacen.getItem('flujoContexto') || '{}');
        const hayTexto = (obj: any) => obj && Object.values(obj).some((v: any) => typeof v === 'string' && v.trim());
        flujoCompleto = Boolean(
            hayTexto(flujo?.plantel) &&
            hayTexto(flujo?.grupo) &&
            flujo?.bap && Object.values(flujo.bap).some((c: any) => c?.detectada) &&
            (hayTexto(flujo?.paec) || (Array.isArray(flujo?.paec?.asignaturas) && flujo.paec.asignaturas.length > 0))
        );
        const bitacora = JSON.parse(almacen.getItem('bitacoraDocente') || '[]');
        tieneBitacora = Array.isArray(bitacora) && bitacora.length > 0;
    } catch {
        // localStorage corrupto: sin palomitas, sin drama
    }
    return { contextoListo, tienePlaneaciones, flujoCompleto, tieneBitacora };
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {

    const { logout, user } = useAuth();
    const almacen = obtenerAlmacenCuenta();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const { contextoListo, tienePlaneaciones, flujoCompleto, tieneBitacora } = getStepProgress();

    // Ruta principal del docente, en el orden en que debe recorrerla
    const tienePerfil = Boolean(almacen.getItem('perfilDocente'));

    // Lo de todos los días va arriba; lo que se llena una sola vez, abajo. Cada dato se
    // captura en un solo lugar: lista, asistencia, diario y calificaciones viven en Mis clases.
    const diario = [
        { id: 'grupos', label: 'Mis clases', icon: ListChecks, step: '•', done: false, destacado: true },
        { id: 'generator', label: 'Generar Planeación', icon: PlusCircle, step: '•', done: false, destacado: true },
        { id: 'plans', label: 'Mis Planeaciones', icon: History, step: '•', done: tienePlaneaciones },
    ];
    const unaVez = [
        { id: 'perfil-docente', label: 'Cómo doy clase', icon: ClipboardList, step: 1, done: tienePerfil },
        { id: 'context', label: 'Contexto Escolar', icon: Settings, step: 2, done: contextoListo },
        { id: 'flujo', label: 'Flujo de Contextualización', icon: Compass, step: 3, done: flujoCompleto },
        { id: 'cuaderno', label: 'Cuaderno escolar · CAPEMS', icon: BookOpen, step: 4, done: false },
        { id: 'mi-pagina', label: 'Mi página de clases', icon: Globe, step: 5, done: false },
    ];

    const masHerramientas = [
        { id: 'mi-escuela', label: 'Mi escuela y su personal', icon: Building2 },
        { id: 'diagnostico', label: 'Diagnóstico (formulario anterior)', icon: Users },
        { id: 'bitacora', label: 'Bitácora (anterior al Diario de clase)', icon: NotebookPen },
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
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-indigo-600" />
                    <h1 className="font-semibold text-xl tracking-tight text-slate-900">EduPlan MX</h1>
                </div>
                <p className="text-xs text-slate-500 mt-2 uppercase font-medium tracking-wide">Bachillerato Oficial</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
                {/* Inicio */}
                <button
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeView === 'dashboard'
                        ? 'bg-slate-200/70 text-slate-900'
                        : 'hover:bg-slate-200/50 text-slate-700'
                        }`}
                >
                    <Layout className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">Inicio</span>
                </button>

                {[['Tu día a día', diario], ['Se llena una sola vez', unaVez]].map(([titulo, pasos]) => (
                <React.Fragment key={titulo as string}>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider px-4 pt-4 pb-1">
                    {titulo as string}
                </p>
                {(pasos as typeof diario).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-slate-200/70 text-slate-900'
                                : item.destacado
                                    ? 'hover:bg-slate-200/50 text-slate-900 font-semibold'
                                    : 'hover:bg-slate-200/50 text-slate-700'
                                }`}
                        >
                            {/* Número de paso o palomita de completado */}
                            {item.done ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive || item.destacado ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-300'
                                    }`}>
                                    {item.step}
                                </span>
                            )}
                            <Icon className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-sm text-left flex-1">{item.label}</span>
                        </button>
                    );
                })}
                </React.Fragment>
                ))}

                {/* Más herramientas (plegable) */}
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full flex items-center justify-between px-4 py-3 mt-4 rounded-xl hover:bg-slate-200/50 text-slate-500 transition-colors"
                >
                    <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Más herramientas</span>
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
                                        ? 'bg-slate-200/70 text-slate-900'
                                        : 'hover:bg-slate-200/50 text-slate-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 text-slate-500" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
                <div className="mt-4 text-xs text-slate-400 text-center">
                    v1.0.0 - Hecho para México
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Sidebar de escritorio */}
            <aside className="w-64 bg-slate-50 border-r border-slate-200 text-slate-900 flex-shrink-0 flex-col hidden md:flex h-screen sticky top-0">
                <NavContent />
            </aside>

            {/* Botón hamburguesa (solo móvil) */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed bottom-5 left-5 z-40 p-3.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
                aria-label="Abrir menú"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Drawer móvil */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Fondo oscuro: cierra al tocar */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-72 max-w-[85vw] bg-slate-50 text-slate-900 flex flex-col h-full shadow-2xl">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 z-10"
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
