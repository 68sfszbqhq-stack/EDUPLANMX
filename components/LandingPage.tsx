import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Sparkles, Clock, BookOpen, Users, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

/**
 * Página pública de presentación de EduPlan MX.
 * Es lo primero que ve un visitante sin sesión (QR del congreso, links compartidos).
 */
const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { loginAsGuest } = useAuth();

    const probarDemo = () => {
        loginAsGuest();
        navigate('/maestro/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Barra superior */}
            <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-700 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl text-slate-900">EduPlan MX</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
                >
                    <LogIn className="w-4 h-4" /> Iniciar sesión
                </button>
            </header>

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
                <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                    Hecha por un docente, para docentes de Bachillerato General Oficial
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
                    Tu planeación didáctica del MCCEMS,
                    <span className="text-indigo-600"> de 50 minutos a 5</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-9">
                    EduPlan MX genera planeaciones alineadas a las progresiones oficiales de la DGB,
                    con el formato que pide tu supervisión y adaptadas al diagnóstico real de tu grupo.
                    Gratis, desde tu navegador.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={probarDemo}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Sparkles className="w-5 h-5" /> Probar la demo sin cuenta
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-white border-2 border-indigo-200 text-indigo-700 rounded-2xl font-bold text-lg hover:border-indigo-400 flex items-center justify-center gap-2 transition-all"
                    >
                        Crear mi cuenta <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Qué hace */}
            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Currículo oficial integrado</h3>
                        <p className="text-sm text-slate-600">
                            Más de 75 UAC con progresiones textuales de la DGB, distinguiendo los planes 2023-2026 y 2025-2028.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Adaptada a TU grupo</h3>
                        <p className="text-sm text-slate-600">
                            El diagnóstico socioeducativo de tus alumnos alimenta cada planeación con adaptaciones explícitas y visibles.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Lista para entregar</h3>
                        <p className="text-sm text-slate-600">
                            Secuencia didáctica, evaluación, DUA, vinculación PAEC y currículum ampliado — imprime y entrega.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Gratis y honesta</h3>
                        <p className="text-sm text-slate-600">
                            Sin costo para ti ni tu escuela. Y si un programa no está verificado con la DGB, te lo dice — no lo inventa.
                        </p>
                    </div>
                </div>
            </section>

            {/* Cómo funciona */}
            <section className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Tu planeación en 4 pasos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                    {[
                        ['1', 'Configura tu escuela', 'Una sola vez, con el código de tu plantel'],
                        ['2', 'Carga tu diagnóstico', 'El perfil de tu grupo, desde tus Google Forms'],
                        ['3', 'Genera con IA', 'Elige progresión, metodología y necesidad del día'],
                        ['4', 'Imprime y entrega', 'Formato listo para supervisión y CTE'],
                    ].map(([n, titulo, desc]) => (
                        <div key={n} className="p-4">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{n}</div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{titulo}</h4>
                            <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA final */}
            <section className="max-w-3xl mx-auto px-6 py-12 text-center">
                <div className="bg-indigo-900 rounded-3xl p-10 text-white">
                    <h2 className="text-2xl font-bold mb-3">Recupera tu tiempo pedagógico</h2>
                    <p className="text-indigo-200 mb-6">
                        Nació en el Bachillerato General Oficial "Carlos Camacho Espíritu" (Zona 013, Puebla)
                        y hoy la usan docentes de todas las asignaturas.
                    </p>
                    <button
                        onClick={probarDemo}
                        className="px-8 py-4 bg-white text-indigo-800 rounded-2xl font-bold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" /> Pruébala ahora mismo
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-8">
                    © 2026 EduPlan MX · Hecho para México · Proyecto educativo sin fines de lucro ·{' '}
                    <button onClick={() => navigate('/privacidad')} className="underline hover:text-indigo-600">
                        Aviso de privacidad
                    </button>
                </p>
            </section>
        </div>
    );
};

export default LandingPage;
