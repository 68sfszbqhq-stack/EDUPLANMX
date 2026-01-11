
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, Save, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { materiasService } from '../../src/services/materiasService';
import { useAuth } from '../../src/contexts/AuthContext';
import { Materia } from '../../types/materia';
import { Usuario } from '../../types/auth';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface Asignacion {
    id: string;
    maestroId: string;
    maestroNombre: string;
    materiaId: string;
    materiaNombre: string;
    grupo: string;
    cicloEscolar: string;
    fechaAsignacion: string;
}

const AsignacionMaterias: React.FC = () => {
    const { user } = useAuth();

    // Estados para catálogos
    const [maestros, setMaestros] = useState<Usuario[]>([]);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

    // Estados de selección
    const [selectedMaestro, setSelectedMaestro] = useState<string>('');
    const [selectedMateria, setSelectedMateria] = useState<string>('');
    const [grupo, setGrupo] = useState<string>('A');
    const [cicloEscolar, setCicloEscolar] = useState<string>('2025-2026');

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Cargar Maestros
                const usersRef = collection(db, 'usuarios');
                const qMaestros = query(usersRef, where('rol', '==', 'maestro'));
                const snapshotMaestros = await getDocs(qMaestros);
                const maestrosData = snapshotMaestros.docs.map(d => d.data() as Usuario);
                setMaestros(maestrosData);

                // 2. Cargar Materias
                const todasMaterias = await materiasService.obtenerTodas();
                setMaterias(todasMaterias);

                // 3. Suscribirse a Asignaciones
                const asignacionesRef = collection(db, 'asignaciones');
                const unsubscribe = onSnapshot(asignacionesRef, (snapshot) => {
                    const asigs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Asignacion));
                    setAsignaciones(asigs);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (err) {
                console.error("Error cargando datos:", err);
                setError("Error al cargar los catálogos");
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleAsignar = async () => {
        if (!selectedMaestro || !selectedMateria || !grupo) {
            setError("Por favor completa todos los campos");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const maestroObj = maestros.find(m => m.id === selectedMaestro);
            const materiaObj = materias.find(m => m.id === selectedMateria);

            if (!maestroObj || !materiaObj) throw new Error("Datos inválidos");

            // Verificar duplicados
            const duplicada = asignaciones.find(
                a => a.maestroId === selectedMaestro &&
                    a.materiaId === selectedMateria &&
                    a.grupo === grupo &&
                    a.cicloEscolar === cicloEscolar
            );

            if (duplicada) {
                setError("Esta asignación ya existe");
                setSaving(false);
                return;
            }

            const nuevaAsignacion = {
                maestroId: selectedMaestro,
                maestroNombre: `${maestroObj.nombre} ${maestroObj.apellidoPaterno}`,
                materiaId: selectedMateria,
                materiaNombre: materiaObj.nombre,
                grupo,
                cicloEscolar,
                fechaAsignacion: new Date().toISOString(),
                activa: true,
                creadoPor: user?.id || 'admin'
            };

            await addDoc(collection(db, 'asignaciones'), nuevaAsignacion);

            setSuccess("Materia asignada correctamente");
            // Reset parcial para facilitar múltiples asignaciones
            setSelectedMateria('');

        } catch (err: any) {
            console.error("Error al asignar:", err);
            setError(err.message || "Error al guardar la asignación");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando módulo de asignaciones...</div>;

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-8 h-8 text-indigo-600" />
                    Asignación de Carga Académica
                </h1>
                <p className="text-slate-600 mt-2">
                    Asigna las materias del MCCEMS a los docentes para el ciclo escolar.
                </p>
            </header>

            {/* Panel de Asignación */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Nueva Asignación
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Seleccionar Maestro */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Docente</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedMaestro}
                            onChange={(e) => setSelectedMaestro(e.target.value)}
                        >
                            <option value="">Seleccionar docente...</option>
                            {maestros.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.nombre} {m.apellidoPaterno} {m.apellidoMaterno}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Seleccionar Materia */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Unidad de Aprendizaje Curricular (UAC)</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedMateria}
                            onChange={(e) => setSelectedMateria(e.target.value)}
                        >
                            <option value="">Seleccionar materia...</option>
                            {materias.map(m => (
                                <option key={m.id} value={m.id}>
                                    [{m.clave}] {m.nombre} ({m.horasSemanales} hrs)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Grupo y Ciclo */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Grupo</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={grupo}
                            onChange={(e) => setGrupo(e.target.value)}
                        >
                            <option value="A">Grupo A</option>
                            <option value="B">Grupo B</option>
                            <option value="C">Grupo C</option>
                            <option value="D">Grupo D</option>
                            <option value="E">Grupo E</option>
                            <option value="F">Grupo F</option>
                        </select>
                    </div>
                </div>

                {/* Mensajes y Botón */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                                <CheckCircle className="w-4 h-4" />
                                {success}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAsignar}
                        disabled={saving}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Asignar Materia
                    </button>
                </div>
            </div>

            {/* Tabla de Asignaciones Recientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-800">Asignaciones Actuales ({cicloEscolar})</h2>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{asignaciones.length} registros</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Docente</th>
                                <th className="px-6 py-4">Materia / UAC</th>
                                <th className="px-6 py-4">Grupo</th>
                                <th className="px-6 py-4">Ciclo</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {asignaciones.map((asig) => (
                                <tr key={asig.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{asig.maestroNombre}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-indigo-400" />
                                            {asig.materiaNombre}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold">
                                            {asig.grupo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{asig.cicloEscolar}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-red-500 hover:text-red-700 text-xs font-medium">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {asignaciones.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No hay asignaciones registradas para este ciclo. Uses el formulario de arriba para comenzar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AsignacionMaterias;
