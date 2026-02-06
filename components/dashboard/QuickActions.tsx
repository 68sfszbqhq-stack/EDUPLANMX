import React from 'react';
import { Plus, FileText, Wrench, Settings } from 'lucide-react';

interface QuickActionsProps {
    onNewPlaneacion: () => void;
    onViewPlaneaciones: () => void;
    onHerramientas: () => void;
    onContexto: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
    onNewPlaneacion,
    onViewPlaneaciones,
    onHerramientas,
    onContexto
}) => {
    const actions = [
        {
            title: 'Nueva Planeación',
            description: 'Crear una nueva planeación didáctica',
            icon: Plus,
            color: 'bg-indigo-600 hover:bg-indigo-700',
            onClick: onNewPlaneacion
        },
        {
            title: 'Ver Planeaciones',
            description: 'Consultar planeaciones guardadas',
            icon: FileText,
            color: 'bg-green-600 hover:bg-green-700',
            onClick: onViewPlaneaciones
        },
        {
            title: 'Herramientas',
            description: 'Acceder a herramientas didácticas',
            icon: Wrench,
            color: 'bg-purple-600 hover:bg-purple-700',
            onClick: onHerramientas
        },
        {
            title: 'Contexto Escolar',
            description: 'Configurar contexto de la escuela',
            icon: Settings,
            color: 'bg-orange-600 hover:bg-orange-700',
            onClick: onContexto
        }
    ];

    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`${action.color} text-white rounded-lg p-6 text-left transition-all transform hover:scale-105 shadow-md hover:shadow-lg`}
                        >
                            <Icon className="w-8 h-8 mb-3" />
                            <h4 className="text-lg font-bold mb-1">{action.title}</h4>
                            <p className="text-sm opacity-90">{action.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
