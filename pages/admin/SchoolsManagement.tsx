import React, { useState, useEffect } from 'react';
import { School, Plus, Edit2, Trash2, Users, BookOpen, Search, X } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface School {
    id: string;
    nombre: string;
    codigo: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    createdAt: string;
    userCount?: number;
    planCount?: number;
}

export const SchoolsManagement: React.FC = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        direccion: '',
        telefono: '',
        email: ''
    });

    useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = async () => {
        try {
            setLoading(true);
            const schoolsSnapshot = await getDocs(collection(db, 'schools'));
            const schoolsData = await Promise.all(
                schoolsSnapshot.docs.map(async (schoolDoc) => {
                    const schoolData = schoolDoc.data();

                    // Contar usuarios de esta escuela
                    const usersQuery = query(collection(db, 'users'), where('schoolId', '==', schoolDoc.id));
                    const usersSnapshot = await getDocs(usersQuery);

                    // Contar planeaciones de esta escuela
                    const plansQuery = query(collection(db, 'planeaciones'), where('schoolId', '==', schoolDoc.id));
                    const plansSnapshot = await getDocs(plansQuery);

                    return {
                        id: schoolDoc.id,
                        nombre: schoolData.nombre,
                        codigo: schoolData.codigo,
                        direccion: schoolData.direccion,
                        telefono: schoolData.telefono,
                        email: schoolData.email,
                        createdAt: schoolData.createdAt,
                        userCount: usersSnapshot.size,
                        planCount: plansSnapshot.size
                    };
                })
            );

            setSchools(schoolsData);
        } catch (error) {
            console.error('Error al cargar escuelas:', error);
            alert('Error al cargar las escuelas');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.codigo) {
            alert('Nombre y código son obligatorios');
            return;
        }

        try {
            if (editingSchool) {
                // Actualizar escuela existente
                await updateDoc(doc(db, 'schools', editingSchool.id), {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
                alert('✅ Escuela actualizada correctamente');
            } else {
                // Crear nueva escuela
                await addDoc(collection(db, 'schools'), {
                    ...formData,
                    createdAt: new Date().toISOString()
                });
                alert('✅ Escuela creada correctamente');
            }

            setShowModal(false);
            setEditingSchool(null);
            setFormData({ nombre: '', codigo: '', direccion: '', telefono: '', email: '' });
            loadSchools();
        } catch (error) {
            console.error('Error al guardar escuela:', error);
            alert('❌ Error al guardar la escuela');
        }
    };

    const handleEdit = (school: School) => {
        setEditingSchool(school);
        setFormData({
            nombre: school.nombre,
            codigo: school.codigo,
            direccion: school.direccion || '',
            telefono: school.telefono || '',
            email: school.email || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (school: School) => {
        if (school.userCount! > 0) {
            alert(`⚠️ No puedes eliminar esta escuela porque tiene ${school.userCount} usuarios registrados.\n\nPrimero debes reasignar o eliminar los usuarios.`);
            return;
        }

        const confirmDelete = window.confirm(
            `¿Estás seguro de eliminar la escuela "${school.nombre}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'schools', school.id));
            alert('✅ Escuela eliminada correctamente');
            loadSchools();
        } catch (error) {
            console.error('Error al eliminar escuela:', error);
            alert('❌ Error al eliminar la escuela');
        }
    };

    const filteredSchools = schools.filter(school =>
        school.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <School className="w-7 h-7 text-indigo-600" />
                        Gestión de Escuelas
                    </h2>
                    <p className="text-slate-600 mt-1">Administra todas las escuelas del sistema</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSchool(null);
                        setFormData({ nombre: '', codigo: '', direccion: '', telefono: '', email: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Escuela
                </button>
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-indigo-600 font-medium">Total Escuelas</p>
                            <p className="text-3xl font-bold text-indigo-900 mt-1">{schools.length}</p>
                        </div>
                        <School className="w-12 h-12 text-indigo-600 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Total Usuarios</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">
                                {schools.reduce((sum, s) => sum + (s.userCount || 0), 0)}
                            </p>
                        </div>
                        <Users className="w-12 h-12 text-purple-600 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">Total Planeaciones</p>
                            <p className="text-3xl font-bold text-emerald-900 mt-1">
                                {schools.reduce((sum, s) => sum + (s.planCount || 0), 0)}
                            </p>
                        </div>
                        <BookOpen className="w-12 h-12 text-emerald-600 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Lista de Escuelas */}
            {filteredSchools.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <School className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">
                        {searchTerm ? 'No se encontraron escuelas' : 'No hay escuelas registradas'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredSchools.map((school) => (
                        <div
                            key={school.id}
                            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <School className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{school.nombre}</h3>
                                            <p className="text-sm text-slate-500">Código: {school.codigo}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        {school.direccion && (
                                            <div>
                                                <p className="text-xs text-slate-500">Dirección</p>
                                                <p className="text-sm text-slate-700">{school.direccion}</p>
                                            </div>
                                        )}
                                        {school.telefono && (
                                            <div>
                                                <p className="text-xs text-slate-500">Teléfono</p>
                                                <p className="text-sm text-slate-700">{school.telefono}</p>
                                            </div>
                                        )}
                                        {school.email && (
                                            <div>
                                                <p className="text-xs text-slate-500">Email</p>
                                                <p className="text-sm text-slate-700">{school.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600">{school.userCount} usuarios</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <BookOpen className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600">{school.planCount} planeaciones</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(school)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(school)}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingSchool ? 'Editar Escuela' : 'Nueva Escuela'}
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
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre de la Escuela *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej: Preparatoria Regional de Arandas"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Código de Escuela *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej: PREP-ARANDAS-001"
                                />
                                <p className="text-xs text-slate-500 mt-1">Este código debe ser único</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ej: Av. Principal #123, Arandas, Jalisco"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: 348-123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: contacto@escuela.edu.mx"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    {editingSchool ? 'Guardar Cambios' : 'Crear Escuela'}
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
