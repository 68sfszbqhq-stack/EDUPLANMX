import React, { useState } from 'react';
import { CheckCircle, UserPlus, School } from 'lucide-react';
import FormularioAlumno from '../components/FormularioAlumno';
import type { Alumno } from '../types/diagnostico';
import { alumnosService } from '../src/services/alumnosFirebase';

const RegistroAlumnos: React.FC = () => {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [registroExitoso, setRegistroExitoso] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [nombreAlumno, setNombreAlumno] = useState('');

    const handleGuardarAlumno = async (alumno: Alumno) => {
        setGuardando(true);
        setNombreAlumno(alumno.datosAdministrativos.nombre);

        try {
            // Guardar en Firebase
            await alumnosService.guardarAlumno({
                datosAdministrativos: alumno.datosAdministrativos,
                datosNEM: alumno.datosNEM,
                fechaRegistro: alumno.fechaRegistro
            });

            setMostrarFormulario(false);
            setRegistroExitoso(true);

            // Ocultar mensaje de éxito después de 5 segundos
            setTimeout(() => {
                setRegistroExitoso(false);
            }, 5000);
        } catch (error) {
            console.error('Error al guardar alumno:', error);
            alert('Hubo un error al guardar tu información. Por favor, intenta de nuevo.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 rounded-xl">
                            <School className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">EduPlan MX</h1>
                            <p className="text-sm text-slate-600">Registro de Alumnos - Bachillerato General Oficial</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!mostrarFormulario && !registroExitoso && (
                    <div className="text-center">
                        {/* Hero Section */}
                        <div className="bg-white rounded-3xl shadow-xl p-12 mb-8 border border-slate-200">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
                                <UserPlus className="w-10 h-10 text-white" />
                            </div>

                            <h2 className="text-4xl font-bold text-slate-900 mb-4">
                                ¡Bienvenido!
                            </h2>

                            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                                Completa tu registro para que podamos conocerte mejor y ofrecerte
                                la mejor experiencia educativa personalizada.
                            </p>

                            <button
                                onClick={() => setMostrarFormulario(true)}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <UserPlus className="w-6 h-6" />
                                Comenzar Registro
                            </button>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl">📝</span>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">Fácil y Rápido</h3>
                                <p className="text-sm text-slate-600">
                                    Solo 4 pasos sencillos para completar tu registro
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl">🔒</span>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">Seguro</h3>
                                <p className="text-sm text-slate-600">
                                    Tu información está protegida y es confidencial
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">Personalizado</h3>
                                <p className="text-sm text-slate-600">
                                    Nos ayuda a adaptar las clases a tus necesidades
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensaje de Éxito */}
                {registroExitoso && (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-green-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            ¡Registro Exitoso!
                        </h2>

                        <p className="text-xl text-slate-600 mb-6">
                            Gracias <span className="font-semibold text-indigo-600">{nombreAlumno}</span>,
                            tu información ha sido guardada correctamente.
                        </p>

                        <p className="text-slate-500 mb-8">
                            Tu docente podrá utilizar esta información para personalizar
                            las clases y ofrecerte una mejor experiencia educativa.
                        </p>

                        <button
                            onClick={() => {
                                setRegistroExitoso(false);
                                setMostrarFormulario(true);
                            }}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Registrar Otro Alumno
                        </button>
                    </div>
                )}

                {/* Formulario Modal */}
                {mostrarFormulario && (
                    <FormularioAlumno
                        onGuardar={handleGuardarAlumno}
                        onCancelar={() => setMostrarFormulario(false)}
                    />
                )}

                {/* Loading Overlay */}
                {guardando && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-lg font-semibold text-slate-900">Guardando tu información...</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-slate-500">
                        © 2026 EduPlan MX - Bachillerato General Oficial
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default RegistroAlumnos;
