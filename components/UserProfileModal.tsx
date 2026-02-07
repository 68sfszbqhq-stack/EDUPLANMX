import React, { useState } from 'react';
import { X, User, Mail, School, BookOpen, GraduationCap, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/config/firebase';

interface UserProfileModalProps {
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellidoPaterno: user?.apellidoPaterno || '',
        apellidoMaterno: user?.apellidoMaterno || '',
        puesto: user?.puesto || '',
        materias: user?.materias || [],
        grados: user?.grados || [],
    });

    const handleSave = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            await updateDoc(doc(db, 'users', user.id), {
                ...formData,
                updatedAt: new Date().toISOString()
            });

            alert('✅ Perfil actualizado correctamente');
            setIsEditing(false);
            window.location.reload(); // Recargar para actualizar el contexto
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            alert('❌ Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleReOnboarding = () => {
        if (confirm('¿Quieres volver a configurar tu perfil?\n\nEsto te llevará al proceso de onboarding.')) {
            // Actualizar el usuario para marcar onboarding como incompleto
            if (user?.id) {
                updateDoc(doc(db, 'users', user.id), {
                    onboardingCompleto: false
                }).then(() => {
                    window.location.href = '/onboarding';
                });
            }
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Mi Perfil</h2>
                                <p className="text-indigo-100 text-sm">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Información Personal */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Información Personal
                            </h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{user.nombre}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Paterno</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.apellidoPaterno}
                                        onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{user.apellidoPaterno}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Materno</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.apellidoMaterno}
                                        onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{user.apellidoMaterno || 'No especificado'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Puesto</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.puesto}
                                        onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: Docente, Director, etc."
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{user.puesto || 'No especificado'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información de la Escuela */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <School className="w-5 h-5 text-indigo-600" />
                            Escuela
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                            <div>
                                <p className="text-sm text-slate-600">Nombre</p>
                                <p className="text-slate-900 font-medium">{user.schoolName || 'No asignada'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Código</p>
                                <p className="text-slate-900 font-medium font-mono">{user.schoolId || 'No asignado'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Rol</p>
                                <p className="text-slate-900 font-medium capitalize">{user.rol}</p>
                            </div>
                        </div>

                        {!user.schoolId && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-amber-800 text-sm mb-2">
                                    ⚠️ No tienes una escuela asignada. Completa el onboarding para configurar tu perfil.
                                </p>
                                <button
                                    onClick={handleReOnboarding}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                                >
                                    Completar Configuración
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Materias y Semestres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Materias
                            </h3>
                            {user.materias && user.materias.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.materias.map((materia, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                                        >
                                            {materia}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">No hay materias asignadas</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                Semestres
                            </h3>
                            {user.grados && user.grados.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.grados.map((grado, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                                        >
                                            {grado}°
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">No hay semestres asignados</p>
                            )}
                        </div>
                    </div>

                    {/* Correo */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                            <Mail className="w-5 h-5 text-indigo-600" />
                            Correo Electrónico
                        </h3>
                        <p className="text-slate-900 font-medium">{user.email}</p>
                        <p className="text-slate-500 text-sm mt-1">El correo no se puede modificar</p>
                    </div>

                    {/* Botones de Acción */}
                    {isEditing && (
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="pt-4 border-t">
                            <button
                                onClick={handleReOnboarding}
                                className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                            >
                                Reconfigurar Perfil Completo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
