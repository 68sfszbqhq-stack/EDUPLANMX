import React, { useState, useEffect } from 'react';
import {
    Shield, Users, School, DollarSign, TrendingUp, AlertTriangle,
    Lock, Unlock, Search, Filter, Download
} from 'lucide-react';
import { adminService } from '../../src/services/adminService';
import type { SystemStats, UserManagement, SchoolStats } from '../../types/admin';

export const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [users, setUsers] = useState<UserManagement[]>([]);
    const [schools, setSchools] = useState<SchoolStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'schools' | 'api'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [systemStats, allUsers, schoolStats] = await Promise.all([
                adminService.getSystemStats(),
                adminService.getAllUsers(),
                adminService.getSchoolStats()
            ]);

            setStats(systemStats);
            setUsers(allUsers);
            setSchools(schoolStats);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId: string, reason: string) => {
        if (confirm(`¿Bloquear usuario?\nRazón: ${reason}`)) {
            try {
                await adminService.blockUser(userId, reason, 'superadmin');
                await loadData();
                alert('Usuario bloqueado exitosamente');
            } catch (error) {
                alert('Error al bloquear usuario');
            }
        }
    };

    const handleUnblockUser = async (userId: string) => {
        if (confirm('¿Desbloquear usuario?')) {
            try {
                await adminService.unblockUser(userId);
                await loadData();
                alert('Usuario desbloqueado exitosamente');
            } catch (error) {
                alert('Error al desbloquear usuario');
            }
        }
    };

    const handleBlockSchool = async (schoolId: string, reason: string) => {
        if (confirm(`¿Bloquear escuela completa?\nRazón: ${reason}`)) {
            try {
                await adminService.blockSchool(schoolId, reason, 'superadmin');
                await loadData();
                alert('Escuela bloqueada exitosamente');
            } catch (error) {
                alert('Error al bloquear escuela');
            }
        }
    };

    const handleUnblockSchool = async (schoolId: string) => {
        if (confirm('¿Desbloquear escuela?')) {
            try {
                await adminService.unblockSchool(schoolId);
                await loadData();
                alert('Escuela desbloqueada exitosamente');
            } catch (error) {
                alert('Error al desbloquear escuela');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSchools = schools.filter(school =>
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Shield className="w-10 h-10 mr-4" />
                            <div>
                                <h1 className="text-3xl font-bold">Super Admin Panel</h1>
                                <p className="text-indigo-100">Control total del sistema</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-indigo-100">Acceso completo</p>
                            <p className="text-lg font-semibold">José Mendoza</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Escuelas */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Escuelas</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalSchools}</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        {stats.blockedSchools} bloqueadas
                                    </p>
                                </div>
                                <School className="w-12 h-12 text-blue-500" />
                            </div>
                        </div>

                        {/* Total Usuarios */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Usuarios</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {stats.activeUsers} activos
                                    </p>
                                </div>
                                <Users className="w-12 h-12 text-green-500" />
                            </div>
                        </div>

                        {/* API Requests */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Requests API</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats.totalApiRequests.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Este mes</p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-purple-500" />
                            </div>
                        </div>

                        {/* Costo Estimado */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Costo Estimado</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${stats.totalApiCost.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">USD este mes</p>
                                </div>
                                <DollarSign className="w-12 h-12 text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Resumen' },
                            { id: 'users', label: 'Usuarios' },
                            { id: 'schools', label: 'Escuelas' },
                            { id: 'api', label: 'Uso de API' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                {(activeTab === 'users' || activeTab === 'schools') && (
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Buscar ${activeTab === 'users' ? 'usuarios' : 'escuelas'}...`}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Escuela
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        API Uso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId} className={user.isBlocked ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.schoolName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.puesto}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.apiUsage.requestsThisMonth} / mes
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.isBlocked ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Bloqueado
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Activo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {user.isBlocked ? (
                                                <button
                                                    onClick={() => handleUnblockUser(user.userId)}
                                                    className="text-green-600 hover:text-green-900 flex items-center"
                                                >
                                                    <Unlock className="w-4 h-4 mr-1" />
                                                    Desbloquear
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockUser(user.userId, 'Uso excesivo de API')}
                                                    className="text-red-600 hover:text-red-900 flex items-center"
                                                >
                                                    <Lock className="w-4 h-4 mr-1" />
                                                    Bloquear
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Schools Tab */}
                {activeTab === 'schools' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Escuela
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuarios
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        API Requests
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Costo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSchools.map((school) => (
                                    <tr key={school.schoolId} className={school.isBlocked ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {school.schoolName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {school.totalUsers}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {school.apiRequestsThisMonth.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${school.estimatedCost.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {school.isBlocked ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Bloqueada
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Activa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {school.isBlocked ? (
                                                <button
                                                    onClick={() => handleUnblockSchool(school.schoolId)}
                                                    className="text-green-600 hover:text-green-900 flex items-center"
                                                >
                                                    <Unlock className="w-4 h-4 mr-1" />
                                                    Desbloquear
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockSchool(school.schoolId, 'Uso excesivo de API')}
                                                    className="text-red-600 hover:text-red-900 flex items-center"
                                                >
                                                    <Lock className="w-4 h-4 mr-1" />
                                                    Bloquear
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
