import React, { useState, useRef } from 'react';
import { Leaf, Sun, User, BookOpen, X, Info, FileDown, ShieldCheck } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface VisualizacionProps {
    data: {
        arbol: { raices: string; tronco: string; copa: string };
        huella: string;
        reflexion: string;
        mapaSol: { identidad: string; areas: string; acciones: string };
    };
    userName?: string;
}

export const VisualizacionFicha12: React.FC<VisualizacionProps> = ({ data, userName }) => {
    const [selectedItem, setSelectedItem] = useState<{ title: string, content: string, type: string } | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Ficha12_Identidad_Docente_${userName || 'Usuario'}_${new Date().toLocaleDateString()}`,
    });

    const splitContent = (text: string) => {
        if (!text) return [];
        return text.split(/[,\n;]/).map(s => s.trim()).filter(s => s.length > 0);
    };

    const leaves = splitContent(data.arbol.copa);
    const qualities = splitContent(data.arbol.tronco);
    const origins = splitContent(data.arbol.raices);

    const renderInteractiveItem = (text: string, type: 'leaf' | 'trunk' | 'root', index: number) => {
        const colors = {
            leaf: 'bg-emerald-500 text-white shadow-emerald-500/30 border-emerald-400',
            trunk: 'bg-amber-700 text-white shadow-amber-900/30 border-amber-600',
            root: 'bg-stone-700 text-stone-100 shadow-stone-900/30 border-stone-600'
        };

        const titles = {
            leaf: 'Proyección (Copa)',
            trunk: 'Cualidad (Tronco)',
            root: 'Origen (Raíz)'
        };

        return (
            <button
                key={`${type}-${index}`}
                onClick={() => setSelectedItem({ title: titles[type], content: text, type })}
                className={`
                    group relative inline-block h-auto px-5 py-2.5 rounded-2xl text-sm font-semibold 
                    transition-all duration-300 hover:scale-105 shadow-md border-b-2
                    min-w-[100px] max-w-[320px] break-words text-center
                    ${colors[type]} animate-in zoom-in duration-500 
                    print:shadow-none print:max-w-none print:border-slate-300 print:text-white print:bg-opacity-100
                `}
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <span className="relative z-10 block leading-tight">
                    {text}
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity print:hidden"></div>
            </button>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-12 relative">
            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .print-container { 
                        padding: 20px !important; 
                        margin: 0 !important; 
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    section { 
                        break-inside: avoid !important; 
                        margin-bottom: 15px !important; 
                        border: 1px solid #f1f5f9 !important;
                        padding: 20px !important;
                        min-height: auto !important;
                        height: auto !important;
                    }
                    .tree-section {
                        min-height: 500px !important;
                        background: linear-gradient(to bottom, #f0f9ff, #ecfdf5, #fffbeb) !important;
                    }
                    .sun-section {
                        background: #0f172a !important;
                        color: white !important;
                    }
                    h2, h3 { margin-top: 0 !important; }
                    .tag-item { break-inside: avoid !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                `}
            </style>

            {/* Print Toolbar */}
            <div className="flex flex-col items-end gap-3 no-print sticky top-4 z-40">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs font-bold shadow-sm flex items-center gap-2 animate-bounce">
                    <Info className="w-4 h-4" />
                    IMPORTANTE: Activa "Gráficos de fondo" en las opciones de impresión
                </div>
                <button
                    onClick={() => handlePrint()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
                >
                    <FileDown className="w-6 h-6" />
                    Exportar PDF Completísimo
                </button>
            </div>

            <div ref={componentRef} className="space-y-8 print-container bg-white p-6 rounded-[3rem] border border-slate-100">
                {/* Modal for Details (Hidden in Print) */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
                            <div className={`p-6 flex justify-between items-center ${
                                selectedItem.type === 'leaf' ? 'bg-emerald-600' : 
                                selectedItem.type === 'trunk' ? 'bg-amber-700' : 'bg-stone-800'
                            } text-white`}>
                                <h4 className="text-xl font-bold flex items-center gap-2">
                                    <Info className="w-5 h-5" />
                                    {selectedItem.title}
                                </h4>
                                <button onClick={() => setSelectedItem(null)} className="hover:rotate-90 transition-transform">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8">
                                <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                                    {selectedItem.content}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tu Identidad Docente</h2>
                        <p className="text-slate-500 text-sm font-medium">Ficha 12: Reflexión Crítica sobre la Práctica</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <div className="bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-indigo-100">
                            <User className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-indigo-900 text-sm">{userName || 'Docente EDUPLAN'}</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            Documento Oficial EDUPLAN MX
                        </p>
                    </div>
                </div>

                {/* El Árbol de la Vida Interactivo */}
                <section className="tree-section relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-sky-50 via-emerald-50 to-amber-50 border border-emerald-100 shadow-xl p-8 md:p-12 min-h-[600px] flex flex-col items-center">
                    <h3 className="text-2xl font-black text-emerald-900 flex items-center gap-3 mb-12 relative z-10">
                        <Leaf className="w-8 h-8 text-emerald-600" />
                        Mi Árbol de la Vida
                    </h3>

                    <div className="relative w-full max-w-4xl flex flex-col items-center z-10 flex-1">
                        {/* Copa / Canopy */}
                        <div className="w-full mb-8">
                            <div className="bg-emerald-100/30 backdrop-blur-sm border border-emerald-200 rounded-[3rem] p-6 min-h-[200px] flex flex-wrap justify-center items-center gap-3 relative overflow-hidden">
                                {leaves.length > 0 ? (
                                    leaves.map((leaf, i) => (
                                        <div key={i} className="tag-item">{renderInteractiveItem(leaf, 'leaf', i)}</div>
                                    ))
                                ) : (
                                    <p className="text-emerald-700/50 italic font-medium">Proyecciones futuras...</p>
                                )}
                            </div>
                        </div>

                        {/* Tronco / Trunk */}
                        <div className="w-56 relative mb-4">
                            <div className="bg-gradient-to-b from-amber-800 to-amber-950 w-full min-h-[160px] rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 p-4 border-x-4 border-amber-900/50">
                                {qualities.length > 0 ? (
                                    qualities.map((q, i) => (
                                        <div key={i} className="tag-item">{renderInteractiveItem(q, 'trunk', i)}</div>
                                    ))
                                ) : (
                                    <p className="text-amber-200/30 text-xs text-center italic">Cualidades...</p>
                                )}
                            </div>
                        </div>

                        {/* Raíces / Roots */}
                        <div className="w-full">
                            <div className="bg-stone-200/30 backdrop-blur-sm border border-stone-300 rounded-b-[3rem] rounded-t-2xl p-6 min-h-[160px] flex flex-wrap justify-center items-center gap-3 relative">
                                {origins.length > 0 ? (
                                    origins.map((root, i) => (
                                        <div key={i} className="tag-item">{renderInteractiveItem(root, 'root', i)}</div>
                                    ))
                                ) : (
                                    <p className="text-stone-500/50 italic font-medium">Orígenes...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mapa de Sol */}
                <section className="sun-section relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 shadow-xl p-8 md:p-12 text-white min-h-[400px]">
                    <h3 className="text-2xl font-black text-amber-400 flex items-center gap-3 mb-12 justify-center relative z-10">
                        <Sun className="w-8 h-8" />
                        Mapa de Sol: Resignificación
                    </h3>

                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-1 text-right space-y-4">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-[1.5rem] shadow-xl">
                                <h4 className="text-amber-300 font-black text-sm mb-2 uppercase tracking-wider">Áreas de Oportunidad</h4>
                                <p className="text-slate-100 text-sm leading-relaxed">{data.mapaSol.areas || "Sin definir..."}</p>
                            </div>
                        </div>

                        <div className="w-56 h-56 shrink-0 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 rounded-full shadow-2xl flex items-center justify-center p-6 text-center border-4 border-white/30">
                            <div>
                                <h4 className="text-amber-950 font-black text-xl mb-1">Identidad</h4>
                                <p className="text-amber-900 font-bold leading-tight text-sm">
                                    {data.mapaSol.identidad || "Tu centro..."}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 text-left space-y-4">
                            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-[1.5rem] shadow-xl">
                                <h4 className="text-amber-300 font-black text-sm mb-2 uppercase tracking-wider">Acciones de Mejora</h4>
                                <p className="text-slate-100 text-sm leading-relaxed">{data.mapaSol.acciones || "Sin definir..."}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Huella y Reflexión */}
                <div className="grid md:grid-cols-2 gap-6">
                    <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl min-h-[250px]">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><User className="w-5 h-5" /></div>
                            Huella Docente
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {data.huella || "Sin definir..."}
                        </p>
                    </section>

                    <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl min-h-[250px]">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                            Texto Reflexivo
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic bg-slate-50 p-4 rounded-xl">
                            "{data.reflexion || "Sin definir..."}"
                        </p>
                    </section>
                </div>

                {/* Print Footer */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <p>© 2026 EDUPLAN MX</p>
                    <p>Generado: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};


