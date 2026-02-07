import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Edit2, Trash2, Search, X, Mail, School,
    Shield, CheckCircle, XCircle, RefreshCw, Key, Filter
} from 'lucide-react';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, where, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import type { UserRole } from '../../types/auth';

interface User {
    id: string;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    rol: UserRole;
    schoolId?: string;
    schoolName?: string;
    puesto?: string;
    materias?: string[];
    grados?: number[];
    activo: boolean;
    createdAt: string;
    lastAccess?: string;
}

interface School {
    id: string;
    nombre: string;
    codigo: string;
}

export const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
    const [filterSchool, setFilterSchool] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rol: 'maestro' as UserRole,
        schoolId: '',
        puesto: '',
        activo: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Cargar usuarios y escuelas en paralelo
            const [usersSnapshot, schoolsSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'schools'))
            ]);

            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as User[];

            const schoolsData = schoolsSnapshot.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre,
                codigo: doc.data().codigo
            }));

            setUsers(usersData);
            setSchools(schoolsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.nombre || !formData.apellidoPaterno) {
            alert('Email, nombre y apellido paterno son obligatorios');
            return;
        }

        // Validar que tenga schoolId si no es superadmin
        if ((formData.rol as string) !== 'superadmin' && !formData.schoolId) {
            alert('Debes seleccionar una escuela para este usuario');
            return;
        }

        try {
            const schoolData = formData.schoolId
                ? schools.find(s => s.id === formData.schoolId)
                : null;

            const userData = {
                email: formData.email.toLowerCase(),
                nombre: formData.nombre,
                apellidoPaterno: formData.apellidoPaterno,
                apellidoMaterno: formData.apellidoMaterno || '',
                rol: formData.rol,
                schoolId: formData.schoolId || null,
                schoolName: schoolData?.nombre || null,
                puesto: formData.puesto || '',
                activo: formData.activo,
                onboardingCompleto: (formData.rol as string) === 'superadmin' ? true : !!formData.schoolId,
                materias: [],
                grados: [],
                updatedAt: new Date().toISOString()
            };

            if (editingUser) {
                // Actualizar usuario existente
                await updateDoc(doc(db, 'users', editingUser.id), userData);
                alert('✅ Usuario actualizado correctamente');
            } else {
                // Crear nuevo usuario
                await addDoc(collection(db, 'users'), {
                    ...userData,
                    createdAt: new Date().toISOString()
                });
                alert('✅ Usuario creado correctamente\n\n⚠️ IMPORTANTE: El usuario debe iniciar sesión con Google usando este email para activar su cuenta.');
            }

            setShowModal(false);
            setEditingUser(null);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            alert('❌ Error al guardar el usuario');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            nombre: user.nombre,
            apellidoPaterno: user.apellidoPaterno,
            apellidoMaterno: user.apellidoMaterno || '',
            rol: user.rol,
            schoolId: user.schoolId || '',
            puesto: user.puesto || '',
            activo: user.activo
        });
        setShowModal(true);
    };

    const handleToggleActive = async (user: User) => {
        const newStatus = !user.activo;
        const confirmMessage = newStatus
            ? `¿Activar al usuario ${user.nombre} ${user.apellidoPaterno}?`
            : `¿Desactivar al usuario ${user.nombre} ${user.apellidoPaterno}?\n\nNo podrá acceder al sistema.`;

        if (!confirm(confirmMessage)) return;

        try {
            await updateDoc(doc(db, 'users', user.id), {
                activo: newStatus,
                updatedAt: new Date().toISOString()
            });
            alert(`✅ Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
            loadData();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('❌ Error al cambiar el estado del usuario');
        }
    };

    const handleDelete = async (user: User) => {
        const confirmDelete = window.confirm(
            `¿Estás seguro de eliminar al usuario ${user.nombre} ${user.apellidoPaterno}?\n\n` +
            `Email: ${user.email}\n` +
            `Rol: ${user.rol}\n\n` +
            `Esta acción no se puede deshacer.`
        );

        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'users', user.id));
            alert('✅ Usuario eliminado correctamente');
            loadData();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('❌ Error al eliminar el usuario');
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            nombre: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            rol: 'maestro',
            schoolId: '',
            puesto: '',
            activo: true
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.schoolName && user.schoolName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = filterRole === 'all' || user.rol === filterRole;
        const matchesSchool = filterSchool === 'all' || user.schoolId === filterSchool;

        return matchesSearch && matchesRole && matchesSchool;
    });

    const stats = {
        total: users.length,
        activos: users.filter(u => u.activo).length,
        inactivos: users.filter(u => !u.activo).length,
        superadmin: users.filter(u => u.rol === 'superadmin').length,
        directivo: users.filter(u => u.rol === 'directivo').length,
        maestro: users.filter(u => u.rol === 'maestro').length,
        alumno: users.filter(u => u.rol === 'alumno').length,
    };

    const getRoleBadgeColor = (rol: UserRole) => {
        switch (rol) {
            case 'superadmin': return 'bg-red-100 text-red-700 border-red-200';
            case 'directivo': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'maestro': return 'bg-green-100 text-green-700 border-green-200';
            case 'alumno': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        Gestión de Usuarios
                    </h2>
                    <p className="text-slate-600 mt-1">Administra todos los usuarios del sistema</p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Activos</p>
                    <p className="text-2xl font-bold text-green-900">{stats.activos}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Inactivos</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.inactivos}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-xs text-red-600 mb-1">Superadmin</p>
                    <p className="text-2xl font-bold text-red-900">{stats.superadmin}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Directivos</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.directivo}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Maestros</p>
                    <p className="text-2xl font-bold text-green-900">{stats.maestro}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs text-purple-600 mb-1">Alumnos</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.alumno}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o escuela..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="superadmin">Superadmin</option>
                        <option value="directivo">Directivo</option>
                        <option value="maestro">Maestro</option>
                        <option value="alumno">Alumno</option>
                    </select>
                </div>

                <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                    >
                        <option value="all">Todas las escuelas</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>{school.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de Usuarios */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">
                        {searchTerm || filterRole !== 'all' || filterSchool !== 'all'
                            ? 'No se encontraron usuarios con los filtros aplicados'
                            : 'No hay usuarios registrados'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                                        Escuela
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
                                                </p>
                                                {user.puesto && (
                                                    <p className="text-sm text-slate-500">{user.puesto}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-700">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.rol)}`}>
                                                <Shield className="w-3 h-3" />
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.schoolName ? (
                                                <div className="flex items-center gap-2">
                                                    <School className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{user.schoolName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">Sin escuela</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.activo ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                                    <XCircle className="w-3 h-3" />
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.activo
                                                        ? 'text-slate-600 hover:bg-slate-100'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={user.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
            )}

            {/* Modal de Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="usuario@ejemplo.com"
                                        disabled={!!editingUser}
                                    />
                                    {!editingUser && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            El usuario debe iniciar sesión con este email en Google
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="José"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Apellido Paterno *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.apellidoPaterno}
                                        onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Mendoza"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Apellido Materno
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.apellidoMaterno}
                                        onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="García"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Puesto
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.puesto}
                                        onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Docente, Director, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Rol *
                                    </label>
                                    <select
                                        required
                                        value={formData.rol}
                                        onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="maestro">Maestro</option>
                                        <option value="directivo">Directivo</option>
                                        <option value="alumno">Alumno</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>

                                {formData.rol as string !== 'superadmin' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Escuela *
                                        </label>
                                        <select
                                            required={formData.rol !== 'superadmin'}
                                            value={formData.schoolId}
                                            onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Selecciona una escuela</option>
                                            {schools.map(school => (
                                                <option key={school.id} value={school.id}>
                                                    {school.nombre} ({school.codigo})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Usuario activo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
