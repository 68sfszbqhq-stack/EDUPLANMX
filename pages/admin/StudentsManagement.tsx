import React, { useState, useEffect } from 'react';
import {
    Users, Search, Plus, Edit2, Trash2, X, Save,
    Filter, Download, School
} from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { CSVImport } from './CSVImport';

interface Student {
    id: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    firstName?: string;
    lastName?: string;
    curp?: string;
    matricula?: string;
    email?: string;
    grado: string;
    grupo: string;
    turno?: string;
    schoolId: string;
}

interface SchoolData {
    id: string;
    nombre: string;
    codigo: string;
}

export const StudentsManagement: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);

    // Admin specific states
    const [schools, setSchools] = useState<SchoolData[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<string>('');

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
        loadSchools();
    }, []);

    useEffect(() => {
        if (selectedSchool) {
            loadStudents();
        } else {
            setStudents([]);
        }
    }, [selectedSchool]);

    const loadSchools = async () => {
        try {
            const snap = await getDocs(collection(db, 'schools'));
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolData));
            setSchools(data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        } catch (error) {
            console.error("Error loading schools:", error);
        }
    };

    const loadStudents = async () => {
        if (!selectedSchool) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'alumnos'),
                where('schoolId', '==', selectedSchool)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));

            // Ordenar por grado/grupo/apellido
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
        if (!selectedSchool) return;

        if (!formData.nombre || !formData.grado || !formData.grupo) {
            alert('Por favor completa Nombre, Grado y Grupo.');
            return;
        }

        try {
            const currentSchool = schools.find(s => s.id === selectedSchool);

            const studentData = {
                ...formData,
                firstName: formData.nombre,
                lastName: `${formData.apellidoPaterno} ${formData.apellidoMaterno || ''}`.trim(),
                schoolId: selectedSchool,
                schoolName: currentSchool?.nombre || '',
                updatedAt: new Date().toISOString()
            };

            if (currentStudent?.id) {
                await updateDoc(doc(db, 'alumnos', currentStudent.id), studentData);
                setStudents(prev => prev.map(s => s.id === currentStudent.id ? { ...s, ...studentData } as any : s));
            } else {
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

    const filteredStudents = students.filter(s => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${s.nombre || s.firstName || ''} ${s.apellidoPaterno || s.lastName || ''} ${s.apellidoMaterno || ''}`.toLowerCase();
        const curpMatch = s.curp ? s.curp.toLowerCase().includes(searchLower) : false;
        const matriculaMatch = s.matricula ? s.matricula.toLowerCase().includes(searchLower) : false;
        const groupMatch = s.grupo ? s.grupo.toLowerCase().includes(searchLower) : false;

        return fullName.includes(searchLower) || curpMatch || matriculaMatch || groupMatch;
    });

    return (
        <div className="space-y-6">
            {/* Header y Selector de Escuela */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        Gestión Global de Alumnos
                    </h2>
                    <p className="text-slate-600">Administra los alumnos de cualquier escuela registrada</p>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 min-w-[300px]">
                    <School className="w-5 h-5 text-slate-400 ml-2" />
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full p-2 bg-transparent border-none focus:ring-0 text-slate-700 font-medium"
                    >
                        <option value="">-- Selecciona una Escuela --</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>
                                {school.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedSchool ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-12 text-center">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <School className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Selecciona una escuela para comenzar</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Para gestionar los alumnos (ver, editar, agregar o importar), primero debes seleccionar la escuela a la que pertenecen.
                    </p>
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="flex justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex-1 relative max-w-md">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 border border-slate-200 flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Importar
                            </button>
                            {students.length > 0 && (
                                <button onClick={handleDeleteAll} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-100 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Borrar Todos
                                </button>
                            )}
                            <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Nuevo
                            </button>
                        </div>
                    </div>

                    {/* Tabla */}
                    {loading ? (
                        <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4">Alumno</th>
                                        <th className="p-4">Matrícula</th>
                                        <th className="p-4">Grado/Grupo</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">{s.nombre || s.firstName} {s.apellidoPaterno || s.lastName} {s.apellidoMaterno}</div>
                                                <div className="text-xs text-slate-500">{s.email}</div>
                                            </td>
                                            <td className="p-4 text-sm font-mono">{s.matricula || '---'}</td>
                                            <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{s.grado}° "{s.grupo}"</span></td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => handleOpenModal(s)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(s.id, s.nombre || '')} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No hay alumnos en esta escuela.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold">{currentStudent ? 'Editar' : 'Nuevo'} Alumno</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Formulario simplificado para admin */}
                            <input className="p-3 border rounded-lg" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            <input className="p-3 border rounded-lg" placeholder="Apellido Paterno" value={formData.apellidoPaterno} onChange={e => setFormData({ ...formData, apellidoPaterno: e.target.value })} />
                            <input className="p-3 border rounded-lg" placeholder="Apellido Materno" value={formData.apellidoMaterno} onChange={e => setFormData({ ...formData, apellidoMaterno: e.target.value })} />
                            <input className="p-3 border rounded-lg" placeholder="Matrícula" value={formData.matricula} onChange={e => setFormData({ ...formData, matricula: e.target.value })} />
                            <input className="p-3 border rounded-lg" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <div className="flex gap-2">
                                <select className="p-3 border rounded-lg w-1/2" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })}>
                                    <option value="">Grado</option>
                                    {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}°</option>)}
                                </select>
                                <input className="p-3 border rounded-lg w-1/2" placeholder="Grupo" value={formData.grupo} onChange={e => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })} maxLength={2} />
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3 rounded-b-2xl bg-slate-50">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold">Importación Masiva</h3>
                            <button onClick={() => { setIsImportModalOpen(false); loadStudents(); }}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <div className="p-8">
                            {/* Pasamos directorSchoolId para bloquear el selector en el importador también */}
                            <CSVImport directorSchoolId={selectedSchool} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
