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
            color: 'text-indigo-600',
            onClick: onNewPlaneacion
        },
        {
            title: 'Ver Planeaciones',
            description: 'Consultar planeaciones guardadas',
            icon: FileText,
            color: 'text-indigo-600',
            onClick: onViewPlaneaciones
        },
        {
            title: 'Herramientas',
            description: 'Acceder a herramientas didácticas',
            icon: Wrench,
            color: 'text-indigo-600',
            onClick: onHerramientas
        },
        {
            title: 'Contexto Escolar',
            description: 'Configurar contexto de la escuela',
            icon: Settings,
            color: 'text-indigo-600',
            onClick: onContexto
        }
    ];

    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="bg-white border border-slate-200 rounded-2xl p-6 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                        >
                            <Icon className={`w-7 h-7 mb-3 ${action.color}`} />
                            <h4 className="text-base font-semibold text-slate-900 mb-1">{action.title}</h4>
                            <p className="text-sm text-slate-500">{action.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
