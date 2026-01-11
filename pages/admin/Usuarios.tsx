import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { usuariosService } from '../../src/services/usuariosService';
import TablaUsuarios from '../../components/admin/TablaUsuarios';
import FormularioUsuario from '../../components/admin/FormularioUsuario';
import type { Usuario, UserRole } from '../../types/auth';

const UsuariosPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState<UserRole | 'todos'>('todos');
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

    useEffect(() => {
        cargarUsuarios();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [usuarios, busqueda, filtroRol, filtroEstado]);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.obtenerTodos();
            setUsuarios(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...usuarios];

        // Filtro de búsqueda
        if (busqueda) {
            const busquedaLower = busqueda.toLowerCase();
            resultado = resultado.filter(u =>
                u.nombre.toLowerCase().includes(busquedaLower) ||
                u.apellidoPaterno.toLowerCase().includes(busquedaLower) ||
                u.email.toLowerCase().includes(busquedaLower)
            );
        }

        // Filtro de rol
        if (filtroRol !== 'todos') {
            resultado = resultado.filter(u => u.rol === filtroRol);
        }

        // Filtro de estado
        if (filtroEstado === 'activos') {
            resultado = resultado.filter(u => u.activo);
        } else if (filtroEstado === 'inactivos') {
            resultado = resultado.filter(u => !u.activo);
        }

        setUsuariosFiltrados(resultado);
    };

    const handleCrearUsuario = () => {
        setUsuarioEditar(null);
        setMostrarFormulario(true);
    };

    const handleEditarUsuario = (usuario: Usuario) => {
        setUsuarioEditar(usuario);
        setMostrarFormulario(true);
    };

    const handleCerrarFormulario = () => {
        setMostrarFormulario(false);
        setUsuarioEditar(null);
    };

    const handleGuardadoExitoso = () => {
        setMostrarFormulario(false);
        setUsuarioEditar(null);
        cargarUsuarios();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-700">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-slate-600">
                                Administra usuarios, roles y permisos del sistema
                            </p>
                        </div>
                        <button
                            onClick={handleCrearUsuario}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Usuario
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Filtro de Rol */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={filtroRol}
                                onChange={(e) => setFiltroRol(e.target.value as UserRole | 'todos')}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                            >
                                <option value="todos">Todos los roles</option>
                                <option value="superadmin">Super Admin</option>
                                <option value="directivo">Directivo</option>
                                <option value="maestro">Maestro</option>
                                <option value="alumno">Alumno</option>
                            </select>
                        </div>

                        {/* Filtro de Estado */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'activos' | 'inactivos')}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="activos">Activos</option>
                                <option value="inactivos">Inactivos</option>
                            </select>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="mt-4 text-sm text-slate-600">
                        Mostrando <span className="font-semibold text-slate-900">{usuariosFiltrados.length}</span> de <span className="font-semibold text-slate-900">{usuarios.length}</span> usuarios
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <TablaUsuarios
                    usuarios={usuariosFiltrados}
                    onEditar={handleEditarUsuario}
                    onActualizar={cargarUsuarios}
                    currentUserId={currentUser?.id || ''}
                />

                {/* Modal de Formulario */}
                {mostrarFormulario && (
                    <FormularioUsuario
                        usuario={usuarioEditar}
                        onCerrar={handleCerrarFormulario}
                        onGuardado={handleGuardadoExitoso}
                    />
                )}
            </div>
        </div>
    );
};

export default UsuariosPage;
