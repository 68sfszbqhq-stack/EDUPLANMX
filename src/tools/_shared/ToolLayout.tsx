import React, { useState } from 'react';
import { Tool } from './types';
import { ArrowLeft, Loader2, Save, Copy, Download, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToolLayoutProps {
    tool: Tool;
    children: React.ReactNode; // Formulario específico de la herramienta
    onGenerate: () => void;
    isLoading: boolean;
    result?: string;
    onSave?: () => void;
    onExport?: () => void;
}

/**
 * Layout estándar para todas las herramientas
 * Proporciona estructura consistente: header, formulario, resultado
 */
export const ToolLayout: React.FC<ToolLayoutProps> = ({
    tool,
    children,
    onGenerate,
    isLoading,
    result,
    onSave,
    onExport
}) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            <div className="max-w-5xl mx-auto p-6 pb-20">

                {/* Botón Regresar */}
                <button
                    onClick={() => navigate('/maestro/herramientas')}
                    className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver a Herramientas</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                            <tool.icon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800">{tool.name}</h1>
                            <p className="text-slate-600 mt-1">{tool.description}</p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {tool.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 mb-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Configuración</h2>
                    {children}
                </div>

                {/* Botón Generar */}
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${isLoading
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:scale-95'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <tool.icon className="w-6 h-6" />
                            Generar {tool.name}
                        </>
                    )}
                </button>

                {/* Resultado */}
                {result && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Controles */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold">Generado con éxito</span>
                            </div>

                            <div className="flex gap-2">
                                {onSave && (
                                    <button
                                        onClick={onSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        Guardar
                                    </button>
                                )}

                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </button>

                                {onExport && (
                                    <button
                                        onClick={onExport}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Exportar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Contenido del resultado */}
                        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm">
                            <div className="prose max-w-none">
                                <pre className="whitespace-pre-wrap text-slate-700 font-sans">
                                    {result}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
