import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    subtitle?: string;
}

const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-600 font-medium">{title}</div>
                    {subtitle && (
                        <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
