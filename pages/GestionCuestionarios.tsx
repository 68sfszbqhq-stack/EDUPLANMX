import React, { useState } from 'react';
import { FileText, Users, BarChart3, Download } from 'lucide-react';
import CuestionarioSocioEducativoIntegrado from '../components/cuestionarioIntegrado/CuestionarioSocioEducativoIntegrado';
import type { CuestionarioSocioEducativo } from '../types/cuestionarioIntegrado';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Página para gestionar cuestionarios socioeducativos
 * Para maestros y administradores
 */
const GestionCuestionarios: React.FC = () => {
    const [mostrarCuestionario, setMostrarCuestionario] = useState(false);
    const [cuestionarios, setCuestionarios] = useState<CuestionarioSocioEducativo[]>([]);
    const [cargando, setCargando] = useState(false);

    // Guardar cuestionario en Firestore
    const handleGuardarCuestionario = async (cuestionario: CuestionarioSocioEducativo) => {
        try {
            setCargando(true);

            const docRef = await addDoc(collection(db, 'cuestionariosSocioEducativos'), {
                ...cuestionario,
                timestamp: new Date().toISOString()
            });

            console.log('✅ Cuestionario guardado con ID:', docRef.id);
            alert('¡Cuestionario guardado exitosamente!');

            setMostrarCuestionario(false);
            cargarCuestionarios(); // Recargar lista
        } catch (error) {
            console.error('❌ Error al guardar:', error);
            alert('Error al guardar el cuestionario. Por favor intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    // Cargar cuestionarios existentes
    const cargarCuestionarios = async () => {
        try {
            setCargando(true);
            const querySnapshot = await getDocs(collection(db, 'cuestionariosSocioEducativos'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CuestionarioSocioEducativo[];

            setCuestionarios(data);
        } catch (error) {
            console.error('Error al cargar cuestionarios:', error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar al montar el componente
    React.useEffect(() => {
        cargarCuestionarios();
    }, []);

    // Exportar a CSV (ejemplo básico)
    const exportarCSV = () => {
        if (cuestionarios.length === 0) {
            alert('No hay cuestionarios para exportar');
            return;
        }

        // Crear CSV básico
        const headers = 'Nombre,Grado,Email,Tipo Familia,Gastos Mensuales,Principal Problema Comunidad\n';
        const rows = cuestionarios.map(c =>
            `"${c.datosGenerales.nombre} ${c.datosGenerales.apellidoPaterno}",` +
            `"${c.datosGenerales.gradoGrupo}",` +
            `"${c.datosGenerales.correoElectronico}",` +
            `"${c.datosFamiliares.tipoFamilia}",` +
            `"${c.datosEconomicos.gastosMensuales}",` +
            `"${c.contextoComunitario.principalProblema}"`
        ).join('\n');

        const csv = headers + rows;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cuestionarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                📋 Cuestionarios Socioeducativos
                            </h1>
                            <p className="text-gray-600">
                                Diagnóstico integral según Sergio Tobón (CIFE) y NEM
                            </p>
                        </div>
                        <button
                            onClick={() => setMostrarCuestionario(true)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <FileText className="w-5 h-5" />
                            Nuevo Cuestionario
                        </button>
                    </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Cuestionarios</p>
                                <p className="text-2xl font-bold text-gray-900">{cuestionarios.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completados</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {cuestionarios.filter(c => c.completado).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <button
                            onClick={exportarCSV}
                            disabled={cuestionarios.length === 0}
                            className="w-full h-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-6 h-6" />
                            <span className="font-semibold">Exportar CSV</span>
                        </button>
                    </div>
                </div>

                {/* Lista de Cuestionarios */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Cuestionarios Registrados
                    </h2>

                    {cargando ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Cargando...</p>
                        </div>
                    ) : cuestionarios.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No hay cuestionarios registrados</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Haz clic en "Nuevo Cuestionario" para comenzar
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cuestionarios.map((cuestionario) => (
                                <div
                                    key={cuestionario.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {cuestionario.datosGenerales.nombre}{' '}
                                                {cuestionario.datosGenerales.apellidoPaterno}{' '}
                                                {cuestionario.datosGenerales.apellidoMaterno}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span>📚 {cuestionario.datosGenerales.gradoGrupo}</span>
                                                <span>📧 {cuestionario.datosGenerales.correoElectronico}</span>
                                                <span>
                                                    📅 {new Date(cuestionario.fechaRegistro).toLocaleDateString('es-MX')}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                                    {cuestionario.datosFamiliares.tipoFamilia}
                                                </span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                    {cuestionario.contextoComunitario.principalProblema}
                                                </span>
                                                {cuestionario.datosEconomicos.servicios.internet && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                                        ✓ Con Internet
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {cuestionario.completado ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                    ✓ Completo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                                                    Incompleto
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal del Cuestionario */}
            {mostrarCuestionario && (
                <CuestionarioSocioEducativoIntegrado
                    onGuardar={handleGuardarCuestionario}
                    onCancelar={() => setMostrarCuestionario(false)}
                />
            )}
        </div>
    );
};

export default GestionCuestionarios;
