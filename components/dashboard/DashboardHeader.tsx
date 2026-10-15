import React, { useState } from 'react';
import { School, User, BookOpen, GraduationCap, Settings } from 'lucide-react';
import type { Usuario } from '../../types/auth';
import { UserProfileModal } from '../UserProfileModal';

interface DashboardHeaderProps {
    user: Usuario;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}
            <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 p-6 mb-6">
                <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Escuela */}
                        <div className="flex items-center mb-3">
                            <School className="w-6 h-6 mr-3 text-indigo-600" />
                            <div>
                                <p className="text-sm text-slate-500">Escuela</p>
                                <h2 className="text-2xl font-semibold tracking-tight">{user.schoolName || 'Sin escuela asignada'}</h2>
                            </div>
                        </div>

                        {/* Docente */}
                        <div className="flex items-center mb-3">
                            <User className="w-5 h-5 mr-3 text-indigo-600" />
                            <div>
                                <p className="text-sm text-slate-500">Docente</p>
                                <h3 className="text-xl font-semibold">
                                    {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
                                </h3>
                                <p className="text-sm text-slate-500">{user.puesto || 'Docente'}</p>
                            </div>
                        </div>

                        {/* Materias y Semestres */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Materias */}
                            {user.materias && user.materias.length > 0 && (
                                <div className="flex items-start">
                                    <BookOpen className="w-5 h-5 mr-2 mt-1 text-indigo-600" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Materias</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.materias.map((materia, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
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
                                    <GraduationCap className="w-5 h-5 mr-2 mt-1 text-indigo-600" />
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Semestres</p>
                                        <div className="flex flex-wrap gap-2">
                                            {user.grados.map((grado, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
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

                    {/* Badge de Rol y Botón de Perfil */}
                    <div className="flex sm:flex-col gap-2 sm:ml-4">
                        <div className="bg-slate-50 rounded-xl px-4 py-2 text-center">
                            <p className="text-xs text-slate-500 mb-1">Rol</p>
                            <p className="text-lg font-semibold capitalize">{user.rol}</p>
                        </div>
                        <button
                            onClick={() => setShowProfile(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-xl transition-colors text-sm font-medium"
                            title="Ver perfil"
                        >
                            <Settings className="w-4 h-4" />
                            Perfil
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
