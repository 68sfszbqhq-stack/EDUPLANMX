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
            color: 'bg-indigo-50 text-indigo-600',
            textColor: 'text-slate-900'
        },
        {
            title: 'Materias',
            value: totalMaterias,
            icon: BookOpen,
            color: 'bg-indigo-50 text-indigo-600',
            textColor: 'text-slate-900'
        },
        {
            title: 'Semestres',
            value: totalSemestres,
            icon: GraduationCap,
            color: 'bg-indigo-50 text-indigo-600',
            textColor: 'text-slate-900'
        },
        {
            title: 'Promedio Semanal',
            value: promedioSemanal.toFixed(1),
            icon: TrendingUp,
            color: 'bg-indigo-50 text-indigo-600',
            textColor: 'text-slate-900'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className={`text-3xl font-semibold tracking-tight ${stat.textColor}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.color} p-2 md:p-3 rounded-xl hidden sm:block`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
