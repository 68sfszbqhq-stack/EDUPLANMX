import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, GraduationCap, BookOpen, Building2,
    TrendingUp, LogOut, Home, Calendar, FileText, Bug
} from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, where, getDocs, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import StatsCard from '../../components/admin/StatsCard';
import SchoolIndicators from '../../components/director/SchoolIndicators';
import PAECManager from '../../components/director/PAECManager';

interface SchoolStats {
    maestros: number;
    alumnos: number;
    planeaciones: number;
    grupos: number;
}

const DirectorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<SchoolStats>({
        maestros: 0,
        alumnos: 0,
        planeaciones: 0,
        grupos: 0
    });
    const [activeTab, setActiveTab] = useState<'general' | 'pmc' | 'paec'>('general');
    const [loading, setLoading] = useState(true);

    // Debug states
    const [debugMode, setDebugMode] = useState(false);
    const [sampleStudent, setSampleStudent] = useState<any>(null);

    useEffect(() => {
        if (user?.schoolId) {
            loadStats();
        }
    }, [user?.schoolId]);

    const loadStats = async () => {
        if (!user?.schoolId) return;

        try {
            setLoading(true);

            // 1. Contar Maestros de esta escuela
            const maestrosQuery = query(
                collection(db, 'users'),
                where('schoolId', '==', user.schoolId),
                where('rol', '==', 'maestro')
            );
            const maestrosSnapshot = await getDocs(maestrosQuery);

            // 2. Contar Alumnos de esta escuela
            const alumnosQuery = query(
                collection(db, 'alumnos'),
                where('schoolId', '==', user.schoolId)
            );
            const alumnosSnapshot = await getDocs(alumnosQuery);

            // 3. Contar Planeaciones de esta escuela
            const planeacionesQuery = query(
                collection(db, 'planeaciones'),
                where('schoolId', '==', user.schoolId)
            );
            const planeacionesSnapshot = await getDocs(planeacionesQuery);

            // 4. Calcular grupos únicos (basado en alumnos)
            const grupos = new Set();
            alumnosSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.grado && data.grupo) {
                    grupos.add(`${data.grado}-${data.grupo}`);
                }
            });

            setStats({
                maestros: maestrosSnapshot.size,
                alumnos: alumnosSnapshot.size,
                planeaciones: planeacionesSnapshot.size,
                grupos: grupos.size
            });

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const runDiagnosis = async () => {
        try {
            // Obtener un estudiante cualquiera para ver su estructura
            const q = query(collection(db, 'alumnos'), limit(1));
            const s = await getDocs(q);
            if (!s.empty) {
                setSampleStudent({
                    id: s.docs[0].id,
                    data: s.docs[0].data(),
                    mySchoolId: user?.schoolId,
                    match: s.docs[0].data().schoolId === user?.schoolId ? 'YES' : 'NO'
                });
            } else {
                setSampleStudent({ message: 'No students found at all in DB' });
            }
        } catch (e) {
            console.error(e);
            setSampleStudent({ error: JSON.stringify(e) });
        }
    };

    const [migrationStatus, setMigrationStatus] = useState('');

    const migrateStudents = async () => {
        if (!user?.schoolId || !user?.schoolName) return;
        if (!confirm(`⚠️ ACCIÓN CRÍTICA ⚠️\n\n¿Estás seguro de asignar TODOS los alumnos existentes en la base de datos a TU escuela actual?\n\nEscuela: ${user.schoolName}\nID: ${user.schoolId}\n\nEsto moverá a todos los alumnos huérfanos a tu panel. Solo haz esto si estás seguro de que, en este sistema, TÚ eres la única escuela activa.`)) return;

        setMigrationStatus('⏳ Migrando alumnos, por favor espera...');
        try {
            const q = query(collection(db, 'alumnos'));
            const snap = await getDocs(q);

            let count = 0;

            const promises = snap.docs.map(async (d) => {
                const data = d.data();
                // Si no tiene schoolId o es diferente al mío
                if (data.schoolId !== user.schoolId) {
                    count++;
                    return updateDoc(doc(db, 'alumnos', d.id), {
                        schoolId: user.schoolId,
                        schoolName: user.schoolName
                    });
                }
            });

            await Promise.all(promises);

            setMigrationStatus(`✅ ¡Éxito! Se han asociado ${count} alumnos a tu escuela.`);
            loadStats(); // Recargar estadísticas
            runDiagnosis(); // Actualizar muestra

        } catch (error) {
            console.error(error);
            setMigrationStatus(`❌ Error migrando: ${error}`);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando información de tu escuela...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo y Escuela */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                    {user?.schoolName || 'Mi Escuela'}
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">Panel Directivo</p>
                            </div>
                        </div>

                        {/* Usuario y Logout */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right mr-2">
                                <p className="text-sm font-semibold text-slate-900">
                                    {user?.nombre} {user?.apellidoPaterno}
                                </p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => { setDebugMode(!debugMode); runDiagnosis(); }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Diagnóstico de Datos"
                            >
                                <Bug className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Navegación por Pestañas */}
                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'general'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Vista General
                    </button>
                    <button
                        onClick={() => setActiveTab('pmc')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'pmc'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Diagnóstico (PMC)
                    </button>
                    <button
                        onClick={() => setActiveTab('paec')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'paec'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Programa Aula Escuela Comunidad (PAEC)
                    </button>
                </div>

                {/* Contenido de Pestañas */}
                {activeTab === 'general' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Grid de Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatsCard
                                title="Maestros"
                                value={stats.maestros}
                                icon={GraduationCap}
                                color="blue"
                                subtitle="Docentes registrados"
                            />
                            <StatsCard
                                title="Alumnos"
                                value={stats.alumnos}
                                icon={Users}
                                color="green"
                                subtitle="Estudiantes activos"
                            />
                            <StatsCard
                                title="Planeaciones"
                                value={stats.planeaciones}
                                icon={FileText}
                                color="purple"
                                subtitle="Documentos creados"
                            />
                            <StatsCard
                                title="Grupos"
                                value={stats.grupos}
                                icon={Users}
                                color="orange"
                                subtitle="Grupos activos"
                            />
                        </div>

                        {/* Acciones Rápidas */}
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Gestión Escolar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Gestionar Maestros */}
                            <button
                                onClick={() => navigate('/directivo/maestros')}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Maestros</h4>
                                <p className="text-sm text-slate-500">Administrar plantilla docente y asignaciones</p>
                            </button>

                            {/* Gestionar Alumnos */}
                            <button
                                onClick={() => navigate('/directivo/alumnos')}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Alumnos</h4>
                                <p className="text-sm text-slate-500">Lista de estudiantes y grupos</p>
                            </button>

                            {/* Reportes */}
                            <button
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Reportes</h4>
                                <p className="text-sm text-slate-500">Estadísticas de aprovechamiento y entregas</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'pmc' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <SchoolIndicators />
                    </div>
                )}

                {activeTab === 'paec' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <PAECManager />
                    </div>
                )}

                {/* Aviso Provisional */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-blue-900 font-bold mb-1">Panel de Director Activo</h4>
                        <p className="text-blue-700 text-sm">
                            Bienvenido al panel de dirección. Desde aquí podrás gestionar toda la información de
                            <span className="font-semibold"> {user?.schoolName}</span>.
                            Próximamente se habilitarán más funciones de reportes avanzados.
                        </p>
                    </div>
                </div>
            </main>

            {/* Debug Tool */}
            <button
                onClick={() => { setDebugMode(!debugMode); runDiagnosis(); }}
                className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-colors z-50 origin-center hover:scale-110"
                title="Herramienta de Diagnóstico"
            >
                <Bug className="w-5 h-5" />
            </button>

            {debugMode && (
                <div className="fixed bottom-20 right-4 bg-white p-6 shadow-2xl border border-slate-200 rounded-2xl max-w-md z-50 text-xs font-mono overflow-auto max-h-[80vh] w-full animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h4 className="font-bold text-sm text-slate-800">Diagnóstico de Datos</h4>
                        <button onClick={() => setDebugMode(false)} className="text-slate-400 hover:text-red-500">cerrar</button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded border">
                            <h5 className="font-bold text-slate-600 mb-1">Mi Usuario (Director)</h5>
                            <p><strong>Nombre:</strong> {user?.nombre}</p>
                            <p><strong>School Name:</strong> {user?.schoolName}</p>
                            <p className="text-blue-600 break-all"><strong>School ID (Firestore):</strong> {user?.schoolId}</p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded border">
                            <h5 className="font-bold text-slate-600 mb-1">Estadísticas Actuales</h5>
                            <p><strong>Alumnos (filtrados por ID):</strong> {stats.alumnos}</p>
                        </div>

                        {sampleStudent && (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                                <h5 className="font-bold text-indigo-800 mb-1">Muestra de Alumno (Cualquiera en DB)</h5>
                                {sampleStudent.message ? (
                                    <p>{sampleStudent.message}</p>
                                ) : (
                                    <>
                                        <p><strong>ID Alumno:</strong> {sampleStudent.id}</p>
                                        <p><strong>Nombre:</strong> {sampleStudent.data?.nombre || sampleStudent.data?.firstName} {sampleStudent.data?.apellidoPaterno || sampleStudent.data?.lastName}</p>
                                        <p className="text-red-600 break-all text-xs"><strong>School ID Actual:</strong> {sampleStudent.data?.schoolId}</p>
                                        <div className={`mt-2 p-2 rounded text-center font-bold text-white text-xs ${sampleStudent.match === 'YES' ? 'bg-green-500' : 'bg-red-500'}`}>
                                            ¿Coincide ID? {sampleStudent.match}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="text-slate-500 italic text-[10px] mt-2">
                            *Si el ID no coincide, contacta a soporte para migración de datos.
                        </div>

                        {/* Migration Tool */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h5 className="font-bold text-red-600 mb-2">⚠ Zona de Peligro / Reparación</h5>
                            <p className="text-xs text-slate-600 mb-3">Si ves 0 alumnos pero sabes que existen, usa este botón para adoptarlos a tu escuela.</p>

                            {migrationStatus && (
                                <div className={`mb-3 p-2 rounded text-xs font-bold ${migrationStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {migrationStatus}
                                </div>
                            )}

                            <button
                                onClick={migrateStudents}
                                className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded font-bold hover:bg-red-100 transition-colors"
                            >
                                🔧 Asociar TODOS los alumnos a MÍ ({user?.schoolName})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DirectorDashboard;
