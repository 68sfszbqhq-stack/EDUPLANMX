import React, { useRef } from 'react';
import { Download, X, Calendar, Target, Users, CheckCircle2, MapPin, School } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PECProject } from '../types';

interface PECPrintableDocumentProps {
    project: PECProject;
    onClose: () => void;
}

const PECPrintableDocument: React.FC<PECPrintableDocumentProps> = ({ project, onClose }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `PEC_${project.name.replace(/\s+/g, '_')}`,
    });

    return (
        <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Toolbar No Imprimible */}
            <nav className="sticky top-0 bg-white border-b border-slate-200 z-40 px-6 py-4 flex justify-between items-center shadow-sm print:hidden">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg">Vista Preliminar del Proyecto</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full border border-green-200 font-bold">Listo para Imprimir</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-colors shadow-sm shadow-pink-200"
                    >
                        <Download className="w-4 h-4" /> Guardar como PDF
                    </button>
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Documento A4 */}
            <main ref={componentRef} className="max-w-[21cm] mx-auto bg-white min-h-[29.7cm] shadow-2xl my-8 p-[2.5cm] print:shadow-none print:my-0 print:p-[1.5cm] print:w-full text-slate-900">

                {/* Header Oficial */}
                <header className="border-b-2 border-slate-900 pb-4 mb-8 text-center">
                    <div className="flex justify-center items-center gap-4 mb-4 opacity-80">
                        {/* Placeholder para logos si existieran */}
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center"><School className="w-8 h-8 text-slate-400" /></div>
                    </div>
                    <h1 className="text-sm font-bold uppercase tracking-widest text-slate-500">Subsecretaría de Educación Media Superior</h1>
                    <h2 className="text-xl font-serif font-bold text-slate-900 mt-2">Proyecto Escolar Comunitario (PEC)</h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase">Ciclo Escolar 2024-2025</p>
                </header>

                {/* Título del Proyecto */}
                <section className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 print:border-slate-300">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título del Proyecto</span>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">"{project.name}"</h1>
                </section>

                {/* Datos Generales */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Duración Estimada</h3>
                        <p className="text-sm text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> {project.duration}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Metodología</h3>
                        <p className="text-sm text-slate-700">Aprendizaje Servicio (AS)</p>
                    </div>
                </div>

                {/* Justificación y Objetivos */}
                <section className="mb-8 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Justificación</h3>
                        <p className="text-justify text-sm leading-relaxed text-slate-700">{project.justification}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Objetivo General</h3>
                        <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 text-sm text-indigo-900 italic">
                            {project.generalObjective}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Objetivos Específicos</h3>
                        <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-slate-700">
                            {project.specificObjectives.map((obj, i) => (
                                <li key={i}>{obj}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Cronograma / Fases */}
                <section className="mb-8 break-inside-avoid">
                    <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 border-b border-slate-300 pb-2">Cronograma de Actividades</h3>
                    <div className="space-y-4">
                        {project.stages.map((stage, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-4 print:border-slate-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-sm text-slate-800">{stage.name}</h4>
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{stage.period}</span>
                                </div>
                                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                                    {stage.activities.map((act, i) => (
                                        <li key={i}>{act}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Productos */}
                <section className="mb-12 break-inside-avoid">
                    <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 border-b border-slate-300 pb-2">Productos Entregables</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.products.map((prod, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-slate-700">{prod}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Firmas */}
                <footer className="mt-16 pt-8 border-t-2 border-slate-900 break-inside-avoid">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="border-b border-black mb-2 mx-4"></div>
                            <div className="text-xs font-bold uppercase">Presidente del Comité</div>
                        </div>
                        <div>
                            <div className="border-b border-black mb-2 mx-4"></div>
                            <div className="text-xs font-bold uppercase">Director del Plantel</div>
                        </div>
                        <div>
                            <div className="border-b border-black mb-2 mx-4"></div>
                            <div className="text-xs font-bold uppercase">Representante Docente</div>
                        </div>
                    </div>
                    <div className="mt-8 text-[10px] text-center text-slate-400 font-mono">
                        Documento generado digitalmente por Plataforma EduPlan MX
                    </div>
                </footer>

            </main>
        </div>
    );
};

export default PECPrintableDocument;
