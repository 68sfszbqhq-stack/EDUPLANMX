import React from 'react';
import { FileText, Calendar, BookOpen, Eye } from 'lucide-react';

interface Planeacion {
    id: string;
    materia: string;
    semestre: number;
    fecha: string;
    titulo?: string;
}

interface RecentPlaneacionesProps {
    planeaciones: Planeacion[];
    onView: (id: string) => void;
}

export const RecentPlaneaciones: React.FC<RecentPlaneacionesProps> = ({
    planeaciones,
    onView
}) => {
    if (planeaciones.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📋 Planeaciones Recientes
                </h3>
                <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no has creado planeaciones</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Comienza creando tu primera planeación didáctica
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
                📋 Planeaciones Recientes
            </h3>
            <div className="space-y-3">
                {planeaciones.slice(0, 5).map((plan) => (
                    <div
                        key={plan.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => onView(plan.id)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
                                    <h4 className="font-semibold text-gray-900">
                                        {plan.titulo || plan.materia}
                                    </h4>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 space-x-4">
                                    <span className="flex items-center">
                                        <FileText className="w-4 h-4 mr-1" />
                                        {plan.materia}
                                    </span>
                                    <span className="flex items-center">
                                        <GraduationCap className="w-4 h-4 mr-1" />
                                        {plan.semestre}° Semestre
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(plan.fecha).toLocaleDateString('es-MX')}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(plan.id);
                                }}
                                className="ml-4 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {planeaciones.length > 5 && (
                <div className="mt-4 text-center">
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        Ver todas las planeaciones ({planeaciones.length})
                    </button>
                </div>
            )}
        </div>
    );
};

// Importar GraduationCap
import { GraduationCap } from 'lucide-react';
