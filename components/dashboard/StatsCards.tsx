import React from 'react';
import { FileText, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    totalPlaneaciones: number;
    totalMaterias: number;
    totalSemestres: number;
    promedioSemanal?: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    totalPlaneaciones,
    totalMaterias,
    totalSemestres,
    promedioSemanal = 0
}) => {
    const stats = [
        {
            title: 'Planeaciones',
            value: totalPlaneaciones,
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Materias',
            value: totalMaterias,
            icon: BookOpen,
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Semestres',
            value: totalSemestres,
            icon: GraduationCap,
            color: 'bg-purple-500',
            textColor: 'text-purple-600'
        },
        {
            title: 'Promedio Semanal',
            value: promedioSemanal.toFixed(1),
            icon: TrendingUp,
            color: 'bg-orange-500',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className={`text-3xl font-bold ${stat.textColor}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
