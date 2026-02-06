import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import { toolRegistry, searchTools, getToolsByCategory } from '../../src/tools/_shared/ToolRegistry';
import { ToolCard } from '../../src/tools/_shared/ToolCard';
import { ToolCategory } from '../../src/tools/_shared/types';

const CATEGORIES = [
    { id: 'all', name: 'Todas', color: 'slate' },
    { id: 'planeacion', name: 'Planeación', color: 'indigo' },
    { id: 'actividades', name: 'Actividades', color: 'emerald' },
    { id: 'evaluacion', name: 'Evaluación', color: 'purple' },
    { id: 'materiales', name: 'Materiales', color: 'amber' },
    { id: 'comunicacion', name: 'Comunicación', color: 'pink' }
];

/**
 * Página principal del catálogo de herramientas
 */
const Herramientas: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrar herramientas
    const filteredTools = useMemo(() => {
        let tools = getToolsByCategory(selectedCategory);

        if (searchQuery.trim()) {
            tools = searchTools(searchQuery);
        }

        return tools;
    }, [selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto p-6 pb-20">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800">Herramientas Educativas</h1>
                            <p className="text-slate-600 mt-1">
                                {toolRegistry.length} herramientas disponibles para potenciar tu enseñanza
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buscador */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar herramientas..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-indigo-500 focus:outline-none transition-colors text-lg"
                        />
                    </div>
                </div>

                {/* Filtros por categoría */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-slate-600" />
                        <span className="font-bold text-slate-700">Categorías</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;
                            const count = cat.id === 'all'
                                ? toolRegistry.length
                                : toolRegistry.filter(t => t.category === cat.id).length;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${isActive
                                            ? `bg-${cat.color}-500 text-white shadow-lg scale-105`
                                            : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {cat.name}
                                    <span className={`ml-2 text-sm ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                        ({count})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid de herramientas */}
                {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">
                            No se encontraron herramientas
                        </h3>
                        <p className="text-slate-600">
                            Intenta con otra búsqueda o categoría
                        </p>
                    </div>
                )}

                {/* Mensaje cuando no hay herramientas registradas */}
                {toolRegistry.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">
                            Próximamente
                        </h3>
                        <p className="text-slate-600">
                            Las herramientas se están configurando...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Herramientas;
