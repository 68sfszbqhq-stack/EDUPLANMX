import React from 'react';
import { School, User, BookOpen, GraduationCap } from 'lucide-react';
import type { Usuario } from '../../types/auth';

interface DashboardHeaderProps {
    user: Usuario;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Escuela */}
                    <div className="flex items-center mb-3">
                        <School className="w-6 h-6 mr-3 opacity-90" />
                        <div>
                            <p className="text-sm text-indigo-100">Escuela</p>
                            <h2 className="text-2xl font-bold">{user.schoolName || 'Sin escuela asignada'}</h2>
                        </div>
                    </div>

                    {/* Docente */}
                    <div className="flex items-center mb-3">
                        <User className="w-5 h-5 mr-3 opacity-90" />
                        <div>
                            <p className="text-sm text-indigo-100">Docente</p>
                            <h3 className="text-xl font-semibold">
                                {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
                            </h3>
                            <p className="text-sm text-indigo-200">{user.puesto || 'Docente'}</p>
                        </div>
                    </div>

                    {/* Materias y Semestres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Materias */}
                        {user.materias && user.materias.length > 0 && (
                            <div className="flex items-start">
                                <BookOpen className="w-5 h-5 mr-2 mt-1 opacity-90" />
                                <div>
                                    <p className="text-sm text-indigo-100 mb-1">Materias</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.materias.map((materia, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                                            >
                                                {materia}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Semestres */}
                        {user.grados && user.grados.length > 0 && (
                            <div className="flex items-start">
                                <GraduationCap className="w-5 h-5 mr-2 mt-1 opacity-90" />
                                <div>
                                    <p className="text-sm text-indigo-100 mb-1">Semestres</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.grados.map((grado, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                                            >
                                                {grado}°
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Badge de Rol */}
                <div className="ml-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                        <p className="text-xs text-indigo-100 mb-1">Rol</p>
                        <p className="text-lg font-bold capitalize">{user.rol}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
