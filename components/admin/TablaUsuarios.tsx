import React, { useState } from 'react';
import { Edit, Trash2, Power, PowerOff, Shield } from 'lucide-react';
import { usuariosService } from '../../src/services/usuariosService';
import ModalCambiarRol from './ModalCambiarRol';
import type { Usuario, UserRole } from '../../types/auth';

interface TablaUsuariosProps {
    usuarios: Usuario[];
    onEditar: (usuario: Usuario) => void;
    onActualizar: () => void;
    currentUserId: string;
}

const TablaUsuarios: React.FC<TablaUsuariosProps> = ({ usuarios, onEditar, onActualizar, currentUserId }) => {
    const [usuarioCambiarRol, setUsuarioCambiarRol] = useState<Usuario | null>(null);
    const [procesando, setProcesando] = useState<string | null>(null);

    const getRolColor = (rol: UserRole) => {
        const colors = {
            superadmin: 'bg-red-100 text-red-800 border-red-200',
            directivo: 'bg-blue-100 text-blue-800 border-blue-200',
            maestro: 'bg-green-100 text-green-800 border-green-200',
            alumno: 'bg-purple-100 text-purple-800 border-purple-200',
            guest: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[rol] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getRolNombre = (rol: UserRole) => {
        const nombres = {
            superadmin: 'Super Admin',
            directivo: 'Directivo',
            maestro: 'Maestro',
            alumno: 'Alumno',
            guest: 'Invitado'
        };
        return nombres[rol] || rol;
    };

    const handleCambiarEstado = async (usuario: Usuario) => {
        if (usuario.id === currentUserId) {
            alert('No puedes desactivar tu propia cuenta');
            return;
        }

        const confirmar = window.confirm(
            `¿Estás seguro de ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombre} ${usuario.apellidoPaterno}?`
        );

        if (!confirmar) return;

        try {
            setProcesando(usuario.id);
            await usuariosService.cambiarEstado(usuario.id, !usuario.activo);
            onActualizar();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar estado del usuario');
        } finally {
            setProcesando(null);
        }
    };

    const handleEliminar = async (usuario: Usuario) => {
        if (usuario.id === currentUserId) {
            alert('No puedes eliminar tu propia cuenta');
            return;
        }

        const confirmar = window.confirm(
            `¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellidoPaterno}?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmar) return;

        try {
            setProcesando(usuario.id);
            await usuariosService.eliminar(usuario.id);
            onActualizar();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar usuario');
        } finally {
            setProcesando(null);
        }
    };

    const handleCambiarRol = (usuario: Usuario) => {
        if (usuario.id === currentUserId) {
            alert('No puedes cambiar tu propio rol');
            return;
        }
        setUsuarioCambiarRol(usuario);
    };

    const handleRolCambiado = () => {
        setUsuarioCambiarRol(null);
        onActualizar();
    };

    if (usuarios.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-slate-600">No se encontraron usuarios</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Último Acceso
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {usuario.nombre.charAt(0)}{usuario.apellidoPaterno.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {usuario.nombre} {usuario.apellidoPaterno}
                                                </div>
                                                {usuario.id === currentUserId && (
                                                    <span className="text-xs text-indigo-600 font-medium">(Tú)</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {usuario.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleCambiarRol(usuario)}
                                            disabled={usuario.id === currentUserId || procesando === usuario.id}
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRolColor(usuario.rol)} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <Shield className="w-3 h-3" />
                                            {getRolNombre(usuario.rol)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {usuario.activo ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(usuario.ultimoAcceso).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEditar(usuario)}
                                                disabled={procesando === usuario.id}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCambiarEstado(usuario)}
                                                disabled={usuario.id === currentUserId || procesando === usuario.id}
                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                                                title={usuario.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                {usuario.activo ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(usuario)}
                                                disabled={usuario.id === currentUserId || procesando === usuario.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Cambiar Rol */}
            {usuarioCambiarRol && (
                <ModalCambiarRol
                    usuario={usuarioCambiarRol}
                    onCerrar={() => setUsuarioCambiarRol(null)}
                    onCambiado={handleRolCambiado}
                />
            )}
        </>
    );
};

export default TablaUsuarios;
