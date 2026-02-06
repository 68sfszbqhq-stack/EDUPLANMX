import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tool } from './types';
import { Sparkles, Crown } from 'lucide-react';

interface ToolCardProps {
    tool: Tool;
}

/**
 * Tarjeta visual para mostrar una herramienta en el catálogo
 */
export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/maestro/herramientas/${tool.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-indigo-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
            {/* Badge Pro */}
            {tool.isPro && (
                <div className="absolute top-4 right-4">
                    <Crown className="w-5 h-5 text-amber-500" />
                </div>
            )}

            {/* Badge Nuevo */}
            {tool.isNew && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Nuevo
                </div>
            )}

            {/* Icono */}
            <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <tool.icon className="w-8 h-8 text-indigo-600" />
            </div>

            {/* Título */}
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {tool.name}
            </h3>

            {/* Descripción */}
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {tool.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {tool.tags.slice(0, 3).map((tag, idx) => (
                    <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
                    >
                        {tag}
                    </span>
                ))}
                {tool.tags.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                        +{tool.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Indicador hover */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
        </div>
    );
};
