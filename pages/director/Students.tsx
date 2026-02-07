import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, Plus, Edit2, Trash2, X, Save,
    ArrowLeft, Filter, Download
} from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { CSVImport } from '../admin/CSVImport';

interface Student {
    id: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    firstName?: string;
    lastName?: string;
    curp?: string; // Opcional
    matricula?: string;
    email?: string;
    grado: string;
    grupo: string;
    turno?: string;
    schoolId: string;
}

const Students: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        curp: '',
        matricula: '',
        email: '',
        grado: '',
        grupo: '',
        turno: 'Matutino'
    });

    useEffect(() => {
        if (user?.schoolId) {
            loadStudents();
        }
    }, [user?.schoolId]);

    const loadStudents = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'alumnos'),
                where('schoolId', '==', user.schoolId)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));

            // Ordenar en cliente
            data.sort((a, b) => {
                const gA = a.grado || '0';
                const gB = b.grado || '0';
                if (gA !== gB) return gA.localeCompare(gB);

                const grA = a.grupo || 'A';
                const grB = b.grupo || 'A';
                if (grA !== grB) return grA.localeCompare(grB);

                const apA = a.apellidoPaterno || a.lastName || '';
                const apB = b.apellidoPaterno || b.lastName || '';
                return apA.localeCompare(apB);
            });

            setStudents(data);
        } catch (error) {
            console.error("Error loading students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (student?: Student) => {
        if (student) {
            setCurrentStudent(student);
            setFormData({
                nombre: student.nombre || student.firstName || '',
                apellidoPaterno: student.apellidoPaterno || student.lastName || '',
                apellidoMaterno: student.apellidoMaterno || '',
                curp: student.curp || '',
                matricula: student.matricula || '',
                email: student.email || '',
                grado: student.grado || '',
                grupo: student.grupo || '',
                turno: student.turno || 'Matutino'
            });
        } else {
            setCurrentStudent(null);
            setFormData({
                nombre: '',
                apellidoPaterno: '',
                apellidoMaterno: '',
                curp: '',
                matricula: '',
                email: '',
                grado: '',
                grupo: '',
                turno: 'Matutino'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!user?.schoolId) return;
        // Validación básica (nombre y grado/grupo obligatorios)
        if (!formData.nombre || !formData.grado || !formData.grupo) {
            alert('Por favor completa Nombre, Grado y Grupo.');
            return;
        }

        try {
            const studentData = {
                ...formData,
                firstName: formData.nombre,
                lastName: `${formData.apellidoPaterno} ${formData.apellidoMaterno || ''}`.trim(),
                schoolId: user.schoolId,
                schoolName: user.schoolName,
                updatedAt: new Date().toISOString()
            };

            if (currentStudent?.id) {
                // Update
                await updateDoc(doc(db, 'alumnos', currentStudent.id), studentData);
                setStudents(prev => prev.map(s => s.id === currentStudent.id ? { ...s, ...studentData } as any : s));
            } else {
                // Create
                const docRef = await addDoc(collection(db, 'alumnos'), {
                    ...studentData,
                    createdAt: new Date().toISOString()
                });
                setStudents(prev => [...prev, { id: docRef.id, ...studentData } as any]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Error al guardar alumno.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`¿Estás seguro de eliminar al alumno ${name}?`)) {
            try {
                await deleteDoc(doc(db, 'alumnos', id));
                setStudents(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error("Error deleting:", error);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (students.length === 0) return;
        if (!confirm(`🚨 ZONA DE PELIGRO 🚨\n\nEstás a punto de ELIMINAR PERMANENTEMENTE a todos los ${students.length} alumnos registrados en esta escuela.\n\n¿Estás absolutamente seguro?`)) return;
        if (!confirm(`ÚLTIMA ADVERTENCIA:\n\nEsta acción NO se puede deshacer. Se borrarán todos los datos, calificaciones y asistencias asociadas a estos alumnos.\n\n¿Proceder con la eliminación total?`)) return;

        setLoading(true);
        try {
            const promises = students.map(s => deleteDoc(doc(db, 'alumnos', s.id)));
            await Promise.all(promises);
            setStudents([]);
            alert("✅ Se han eliminado todos los alumnos de la escuela.");
        } catch (error) {
            console.error("Error al borrar todo:", error);
            alert("Ocurrió un error al intentar borrar los registros.");
        } finally {
            setLoading(false);
        }
    };

    // Filtro SEGURO contra undefined
    const filteredStudents = students.filter(s => {
        const searchLower = searchTerm.toLowerCase();

        const fullName = `${s.nombre || s.firstName || ''} ${s.apellidoPaterno || s.lastName || ''} ${s.apellidoMaterno || ''}`.toLowerCase();
        const curpMatch = s.curp ? s.curp.toLowerCase().includes(searchLower) : false;
        const matriculaMatch = s.matricula ? s.matricula.toLowerCase().includes(searchLower) : false;
        const emailMatch = s.email ? s.email.toLowerCase().includes(searchLower) : false;
        const groupMatch = s.grupo ? s.grupo.toLowerCase().includes(searchLower) : false;

        return fullName.includes(searchLower) || curpMatch || matriculaMatch || emailMatch || groupMatch;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/directivo/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                    Gestión de Alumnos
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {students.length} estudiantes registrados en {user?.schoolName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 flex items-center gap-2 border border-slate-200"
                            >
                                <Users className="w-4 h-4" />
                                Importar Excel/CSV
                            </button>

                            {students.length > 0 && (
                                <button
                                    onClick={handleDeleteAll}
                                    className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-50 flex items-center gap-2 border border-transparent hover:border-red-100 transition-all"
                                    title="Eliminar a todos los alumnos mostrados"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Borrar Todos
                                </button>
                            )}
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm shadow-indigo-200"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo Alumno
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Search Bar */}
                <div className="mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar por nombre, matrícula, CURP..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4 border-b border-slate-200">Alumno</th>
                                        <th className="p-4 border-b border-slate-200">Matrícula / CURP</th>
                                        <th className="p-4 border-b border-slate-200">Grado/Grupo</th>
                                        <th className="p-4 border-b border-slate-200">Turno</th>
                                        <th className="p-4 border-b border-slate-200 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">
                                                    {student.nombre || student.firstName} {student.apellidoPaterno || student.lastName} {student.apellidoMaterno || ''}
                                                </div>
                                                <div className="text-xs text-slate-500">{student.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-mono text-slate-800">{student.matricula || 'S/M'}</div>
                                                <div className="text-xs text-slate-400">{student.curp || ''}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {student.grado || '?'}° "{student.grupo || '?'}"
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">{student.turno || 'N/A'}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(student)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student.id, `${student.nombre || student.firstName} ${student.apellidoPaterno || student.lastName}`)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                                No se encontraron alumnos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between">
                            <span>Mostrando {filteredStudents.length} de {students.length} registros</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Edición/Creación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-900">
                                {currentStudent ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre(s) *</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej. Juan Pablo" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Apellido Paterno *</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        value={formData.apellidoPaterno} onChange={e => setFormData({ ...formData, apellidoPaterno: e.target.value })} placeholder="Ej. Pérez" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Apellido Materno</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        value={formData.apellidoMaterno} onChange={e => setFormData({ ...formData, apellidoMaterno: e.target.value })} placeholder="Ej. López" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Matrícula</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} placeholder="Opcional" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">CURP</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 uppercase"
                                        value={formData.curp} onChange={e => setFormData({ ...formData, curp: e.target.value.toUpperCase() })} placeholder="Opcional" maxLength={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
                                <input type="email" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="ejemplo@escuela.mx" />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Grado *</label>
                                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                                        value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                                        <option value="">Selecciona</option>
                                        <option value="1">1°</option>
                                        <option value="2">2°</option>
                                        <option value="3">3°</option>
                                        <option value="4">4°</option>
                                        <option value="5">5°</option>
                                        <option value="6">6°</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Grupo *</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl uppercase text-center"
                                        value={formData.grupo} onChange={e => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })} placeholder="A" maxLength={2} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Turno</label>
                                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white"
                                        value={formData.turno} onChange={e => setFormData({ ...formData, turno: e.target.value })}>
                                        <option value="Matutino">Matutino</option>
                                        <option value="Vespertino">Vespertino</option>
                                        <option value="Completo">Completo</option>
                                        <option value="">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Guardar Alumno
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Importación */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-900">
                                Importación Masiva de Alumnos
                            </h3>
                            <button onClick={() => { setIsImportModalOpen(false); loadStudents(); }} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <CSVImport directorSchoolId={user?.schoolId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
