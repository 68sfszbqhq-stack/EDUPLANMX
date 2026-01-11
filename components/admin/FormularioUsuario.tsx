import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { authService } from '../../src/services/authService';
import { usuariosService } from '../../src/services/usuariosService';
import { useAuth } from '../../src/contexts/AuthContext';
import type { Usuario, UserRole, RegisterData } from '../../types/auth';

interface FormularioUsuarioProps {
    usuario: Usuario | null; // null = crear, Usuario = editar
    onCerrar: () => void;
    onGuardado: () => void;
}

const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({ usuario, onCerrar, onGuardado }) => {
    const { user: currentUser } = useAuth();
    const esEdicion = !!usuario;

    const [formData, setFormData] = useState({
        email: usuario?.email || '',
        nombre: usuario?.nombre || '',
        apellidoPaterno: usuario?.apellidoPaterno || '',
        apellidoMaterno: usuario?.apellidoMaterno || '',
        rol: usuario?.rol || 'maestro' as UserRole,
        password: '',
        confirmarPassword: ''
    });

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validarFormulario = (): boolean => {
        if (!formData.email || !formData.nombre || !formData.apellidoPaterno) {
            setError('Por favor completa todos los campos obligatorios');
            return false;
        }

        if (!esEdicion) {
            if (!formData.password) {
                setError('La contraseña es obligatoria');
                return false;
            }

            if (formData.password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres');
                return false;
            }

            if (formData.password !== formData.confirmarPassword) {
                setError('Las contraseñas no coinciden');
                return false;
            }
        }

        return true;
    };

    const handleGuardar = async () => {
        if (!validarFormulario()) return;

        try {
            setGuardando(true);

            if (esEdicion) {
                // Editar usuario existente
                await usuariosService.actualizar(usuario.id, {
                    nombre: formData.nombre,
                    apellidoPaterno: formData.apellidoPaterno,
                    apellidoMaterno: formData.apellidoMaterno,
                    email: formData.email
                });
            } else {
                // Crear nuevo usuario
                const registerData: RegisterData = {
                    email: formData.email,
                    password: formData.password,
                    nombre: formData.nombre,
                    apellidoPaterno: formData.apellidoPaterno,
                    apellidoMaterno: formData.apellidoMaterno,
                    rol: formData.rol
                };

                await authService.register(registerData, currentUser?.id || 'system');
            }

            onGuardado();
        } catch (error: any) {
            console.error('Error al guardar usuario:', error);
            setError(error.message || 'Error al guardar usuario');
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
                            <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {esEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h2>
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
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800">{error}</div>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                Correo Electrónico *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={esEdicion} // No permitir cambiar email en edición
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                        </div>

                        {/* Nombre */}
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">
                                Nombre *
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Juan"
                            />
                        </div>

                        {/* Apellidos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="apellidoPaterno" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Apellido Paterno *
                                </label>
                                <input
                                    id="apellidoPaterno"
                                    name="apellidoPaterno"
                                    type="text"
                                    value={formData.apellidoPaterno}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Pérez"
                                />
                            </div>
                            <div>
                                <label htmlFor="apellidoMaterno" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Apellido Materno
                                </label>
                                <input
                                    id="apellidoMaterno"
                                    name="apellidoMaterno"
                                    type="text"
                                    value={formData.apellidoMaterno}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="García"
                                />
                            </div>
                        </div>

                        {/* Rol (solo al crear) */}
                        {!esEdicion && (
                            <div>
                                <label htmlFor="rol" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Rol *
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        id="rol"
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                                    >
                                        <option value="maestro">Maestro</option>
                                        <option value="directivo">Directivo</option>
                                        <option value="superadmin">Super Administrador</option>
                                        <option value="alumno">Alumno</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Contraseña (solo al crear) */}
                        {!esEdicion && (
                            <>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Contraseña *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmarPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Confirmar Contraseña *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            id="confirmarPassword"
                                            name="confirmarPassword"
                                            type="password"
                                            value={formData.confirmarPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Repite la contraseña"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
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
                        disabled={guardando}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {guardando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            esEdicion ? 'Guardar Cambios' : 'Crear Usuario'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormularioUsuario;
