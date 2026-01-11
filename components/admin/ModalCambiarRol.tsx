import React, { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { usuariosService } from '../../src/services/usuariosService';
import type { Usuario, UserRole } from '../../types/auth';

interface ModalCambiarRolProps {
    usuario: Usuario;
    onCerrar: () => void;
    onCambiado: () => void;
}

const ModalCambiarRol: React.FC<ModalCambiarRolProps> = ({ usuario, onCerrar, onCambiado }) => {
    const [nuevoRol, setNuevoRol] = useState<UserRole>(usuario.rol);
    const [guardando, setGuardando] = useState(false);

    const roles: { value: UserRole; label: string; description: string; color: string }[] = [
        {
            value: 'superadmin',
            label: 'Super Administrador',
            description: 'Control total del sistema',
            color: 'border-red-300 bg-red-50'
        },
        {
            value: 'directivo',
            label: 'Directivo',
            description: 'Gestión de institución',
            color: 'border-blue-300 bg-blue-50'
        },
        {
            value: 'maestro',
            label: 'Maestro',
            description: 'Gestión de grupos y alumnos',
            color: 'border-green-300 bg-green-50'
        },
        {
            value: 'alumno',
            label: 'Alumno',
            description: 'Acceso a su perfil',
            color: 'border-purple-300 bg-purple-50'
        }
    ];

    const handleGuardar = async () => {
        if (nuevoRol === usuario.rol) {
            onCerrar();
            return;
        }

        const confirmar = window.confirm(
            `¿Estás seguro de cambiar el rol de ${usuario.nombre} ${usuario.apellidoPaterno} a ${roles.find(r => r.value === nuevoRol)?.label}?`
        );

        if (!confirmar) return;

        try {
            setGuardando(true);
            await usuariosService.cambiarRol(usuario.id, nuevoRol);
            onCambiado();
        } catch (error) {
            console.error('Error al cambiar rol:', error);
            alert('Error al cambiar rol');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Cambiar Rol</h2>
                            <p className="text-sm text-slate-600">
                                {usuario.nombre} {usuario.apellidoPaterno}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCerrar}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    {/* Alerta */}
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Importante:</p>
                            <p>Cambiar el rol afectará los permisos y el acceso del usuario al sistema.</p>
                        </div>
                    </div>

                    {/* Rol Actual */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Rol Actual
                        </label>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-lg font-semibold text-slate-900">
                                {roles.find(r => r.value === usuario.rol)?.label}
                            </span>
                        </div>
                    </div>

                    {/* Seleccionar Nuevo Rol */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Nuevo Rol
                        </label>
                        <div className="space-y-3">
                            {roles.map((rol) => (
                                <button
                                    key={rol.value}
                                    onClick={() => setNuevoRol(rol.value)}
                                    className={`w-full p-4 border-2 rounded-xl text-left transition-all ${nuevoRol === rol.value
                                            ? `${rol.color} border-opacity-100`
                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-slate-900 mb-1">
                                                {rol.label}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {rol.description}
                                            </div>
                                        </div>
                                        {nuevoRol === rol.value && (
                                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                    <button
                        onClick={onCerrar}
                        disabled={guardando}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={guardando || nuevoRol === usuario.rol}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {guardando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            'Cambiar Rol'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalCambiarRol;
