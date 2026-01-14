
import React, { useState, useEffect } from 'react';
import { Users, Search, PlusCircle, Edit, Trash2, Sparkles } from 'lucide-react';
import { seedAlumnos } from '../../src/studentsSeeder';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface Alumno {
    id: string;
    nombre?: string;
    apellido?: string; // Some records might have single surname or different structure
    // Or if it matches 'Usuario' type:
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    email?: string;
    matricula?: string;
    grupo?: string;
    // Add other fields from Firestore as needed
    [key: string]: any;
}

const GestionAlumnos: React.FC = () => {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarAlumnos();
    }, []);

    const cargarAlumnos = async () => {
        try {
            setLoading(true);
            const alumnosRef = collection(db, 'alumnos');
            // Try simpler query first, just get all
            const snapshot = await getDocs(alumnosRef);

            const listaAlumnos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setAlumnos(listaAlumnos);
            console.log("Alumnos cargados:", listaAlumnos);
        } catch (error) {
            console.error("Error cargando alumnos:", error);
        } finally {
            setLoading(false);
        }
    };

    const alumnosFiltrados = alumnos.filter(alumno => {
        const text = searchTerm.toLowerCase();
        // Search in all reasonable fields
        const nombreCompleto = `${alumno.nombre || ''} ${alumno.apellidoPaterno || ''} ${alumno.apellidoMaterno || ''} ${alumno.apellido || ''}`;
        const matricula = alumno.matricula || alumno.id || '';
        const email = alumno.email || '';

        return nombreCompleto.toLowerCase().includes(text) ||
            matricula.toLowerCase().includes(text) ||
            email.toLowerCase().includes(text);
    });

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Cargando base de datos de alumnos...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Gestión de Alumnos
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Administra la base de datos de estudiantes matriculados.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm font-bold text-xs"
                        onClick={async () => {
                            if (confirm('¿Generar 60 alumnos de prueba? Esto agregará datos a la base de datos real.')) {
                                setLoading(true);
                                await seedAlumnos(60);
                                await cargarAlumnos();
                                alert('¡60 Alumnos generados con éxito!');
                            }
                        }}
                    >
                        <Sparkles className="w-4 h-4" />
                        Generar 60 (Demo)
                    </button>
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                        onClick={() => alert('Función de agregar alumno pendiente de implementación')}
                    >
                        <PlusCircle className="w-5 h-5" />
                        Nuevo Alumno
                    </button>
                </div>
            </header>

            {/* Buscador y Filtros */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, matrícula o email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Could add grade/group filters here */}
            </div>

            {/* Tabla de Alumnos */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Estudiante</th>
                                <th className="px-6 py-4">Matrícula / ID</th>
                                <th className="px-6 py-4">Situación</th>
                                <th className="px-6 py-4">Tipo Beca</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {alumnosFiltrados.map((alumno) => (
                                <tr key={alumno.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">
                                            {alumno.nombre} {alumno.apellidoPaterno || alumno.apellido} {alumno.apellidoMaterno}
                                        </div>
                                        {/* If email exists show it */}
                                        {alumno.email && <div className="text-xs text-slate-400">{alumno.email}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {alumno.matricula || alumno.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${alumno.situacionLaboral === 'Trabaja y estudia' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {alumno.situacionLaboral || 'Estudiante'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {alumno.tipoBeca ? (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                                                {alumno.tipoBeca}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Sin beca</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors" title="Editar">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors" title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {alumnosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        {searchTerm ? 'No se encontraron alumnos con esa búsqueda.' : 'No hay alumnos registrados.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex justify-between items-center">
                    <span>Mostrando {alumnosFiltrados.length} registros</span>
                    <span>Colección: /alumnos</span>
                </div>
            </div>
        </div>
    );
};

export default GestionAlumnos;
