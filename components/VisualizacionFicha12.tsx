import React from 'react';
import { Leaf, Sun, User, BookOpen } from 'lucide-react';

interface VisualizacionProps {
    data: {
        arbol: { raices: string; tronco: string; copa: string };
        huella: string;
        reflexion: string;
        mapaSol: { identidad: string; areas: string; acciones: string };
    };
}

export const VisualizacionFicha12: React.FC<VisualizacionProps> = ({ data }) => {
    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Tu Identidad Docente</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Una representación visual de tus reflexiones, motivaciones y propósitos para tu práctica educativa.
                </p>
            </div>

            {/* El Árbol de la Vida */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 to-emerald-50 border border-emerald-100 shadow-xl p-8 md:p-12">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-400 opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-600 opacity-10 rounded-full blur-3xl"></div>
                
                <h3 className="text-3xl font-bold text-emerald-800 flex items-center gap-3 mb-10 justify-center relative z-10">
                    <Leaf className="w-8 h-8 text-emerald-600" />
                    Árbol de la Vida
                </h3>

                <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                    {/* Copa */}
                    <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-8 rounded-t-[4rem] rounded-b-3xl shadow-lg transform transition-transform hover:scale-[1.02]">
                        <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Copa</span> Proyecciones
                        </h4>
                        <p className="text-emerald-50 leading-relaxed font-medium text-lg">
                            {data.arbol.copa || "Aún no has definido tus proyecciones..."}
                        </p>
                    </div>

                    {/* Tronco */}
                    <div className="mx-auto w-[85%] bg-gradient-to-br from-amber-700 to-amber-900 p-8 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
                        <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Tronco</span> Cualidades
                        </h4>
                        <p className="text-amber-50 leading-relaxed font-medium text-lg">
                            {data.arbol.tronco || "Aún no has definido tus cualidades..."}
                        </p>
                    </div>

                    {/* Raíces */}
                    <div className="bg-gradient-to-br from-stone-700 to-stone-900 p-8 rounded-b-[4rem] rounded-t-3xl shadow-lg transform transition-transform hover:scale-[1.02]">
                        <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Raíces</span> Origen
                        </h4>
                        <p className="text-stone-300 leading-relaxed font-medium text-lg">
                            {data.arbol.raices || "Aún no has definido tus raíces..."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mapa de Sol */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 border border-indigo-500/30 shadow-2xl p-8 md:p-12 text-white">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-amber-500 opacity-10 rounded-full blur-[100px]"></div>
                
                <h3 className="text-3xl font-bold text-amber-400 flex items-center gap-3 mb-16 justify-center relative z-10">
                    <Sun className="w-8 h-8" />
                    Mapa de Sol
                </h3>

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    {/* Rayo Izquierdo: Áreas */}
                    <div className="flex-1 text-right space-y-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transform transition-transform hover:-translate-x-2">
                            <h4 className="text-amber-300 font-bold mb-2">Áreas de Oportunidad</h4>
                            <p className="text-slate-300 leading-relaxed">{data.mapaSol.areas || "Sin definir..."}</p>
                        </div>
                    </div>

                    {/* Centro: Identidad */}
                    <div className="w-64 h-64 shrink-0 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full shadow-[0_0_60px_rgba(251,191,36,0.4)] flex items-center justify-center p-8 text-center transform transition-transform hover:scale-105 border-4 border-white/20">
                        <div>
                            <h4 className="text-amber-900 font-black text-xl mb-2">Identidad Docente</h4>
                            <p className="text-amber-800 font-medium leading-tight line-clamp-4">
                                {data.mapaSol.identidad || "Tu centro..."}
                            </p>
                        </div>
                    </div>

                    {/* Rayo Derecho: Acciones */}
                    <div className="flex-1 text-left space-y-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transform transition-transform hover:translate-x-2">
                            <h4 className="text-amber-300 font-bold mb-2">Acciones de Mejora</h4>
                            <p className="text-slate-300 leading-relaxed">{data.mapaSol.acciones || "Sin definir..."}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Huella y Reflexión */}
            <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 transform transition-all hover:-translate-y-1">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><User className="w-6 h-6" /></div>
                        Huella Docente
                    </h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {data.huella || "Aún no has definido la huella que quieres dejar..."}
                    </p>
                </section>

                <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 transform transition-all hover:-translate-y-1">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                        Texto Reflexivo
                    </h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                        "{data.reflexion || "Aún no has escrito tu reflexión..."}"
                    </p>
                </section>
            </div>
        </div>
    );
};
