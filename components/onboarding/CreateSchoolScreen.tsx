import React, { useState } from 'react';
import { School, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { CreateSchoolData, Turno, Puesto } from '../../types/school';

interface CreateSchoolScreenProps {
    onBack: () => void;
    onSchoolCreated: (schoolId: string, schoolName: string, puesto: Puesto) => void;
}

const TURNOS: Turno[] = ['Matutino', 'Vespertino', 'Nocturno', 'Discontinuo'];
const PUESTOS: Puesto[] = ['Director', 'Subdirector', 'Coordinador Académico', 'Docente'];

export const CreateSchoolScreen: React.FC<CreateSchoolScreenProps> = ({
    onBack,
    onSchoolCreated
}) => {
    const [formData, setFormData] = useState<CreateSchoolData>({
        nombre: '',
        cct: '',
        municipio: '',
        estado: 'México', // Default
        turno: 'Matutino',
        puestoCreador: 'Director'
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateSchoolData, string>>>({});
    const [creating, setCreating] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const validateCCT = (cct: string): boolean => {
        // Formato básico de CCT: 2 dígitos + 3 letras + 4 dígitos + 1 letra
        // Ejemplo: 15ECT0001A
        const cctRegex = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/;
        return cctRegex.test(cct.toUpperCase());
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateSchoolData, string>> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!formData.cct.trim()) {
            newErrors.cct = 'El CCT es requerido';
        } else if (!validateCCT(formData.cct)) {
            newErrors.cct = 'Formato de CCT inválido (Ej: 15ECT0001A)';
        }

        if (!formData.municipio.trim()) {
            newErrors.municipio = 'El municipio es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setCreating(true);
        setGeneralError('');

        try {
            // Importar dinámicamente para evitar circular dependency
            const { schoolService } = await import('../../src/services/schoolService');
            const { auth } = await import('../../src/config/firebase');

            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            const school = await schoolService.createSchool(formData, userId);
            onSchoolCreated(school.id, school.nombre, formData.puestoCreador);
        } catch (error: any) {
            console.error('Error al crear escuela:', error);
            setGeneralError(error.message || 'Error al crear la escuela. Intenta de nuevo.');
        } finally {
            setCreating(false);
        }
    };

    const handleChange = (field: keyof CreateSchoolData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver
                    </button>
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                            <School className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Registrar Nueva Escuela
                            </h1>
                            <p className="text-gray-600">
                                Crea el perfil de tu escuela
                            </p>
                        </div>
                    </div>
                </div>

                {/* General Error */}
                {generalError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{generalError}</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo de la Escuela *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                            placeholder="Ej: CBT No. 1 Dr. Gustavo Baz"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {errors.nombre && (
                            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                        )}
                    </div>

                    {/* CCT */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Clave de Centro de Trabajo (CCT) *
                        </label>
                        <input
                            type="text"
                            value={formData.cct}
                            onChange={(e) => handleChange('cct', e.target.value.toUpperCase())}
                            placeholder="Ej: 15ECT0001A"
                            maxLength={11}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${errors.cct ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {errors.cct && (
                            <p className="mt-1 text-sm text-red-600">{errors.cct}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Formato: 2 dígitos + 3 letras + 4 dígitos + 1 letra
                        </p>
                    </div>

                    {/* Municipio y Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Municipio *
                            </label>
                            <input
                                type="text"
                                value={formData.municipio}
                                onChange={(e) => handleChange('municipio', e.target.value)}
                                placeholder="Ej: Tlalnepantla"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.municipio ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.municipio && (
                                <p className="mt-1 text-sm text-red-600">{errors.municipio}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <input
                                type="text"
                                value={formData.estado}
                                onChange={(e) => handleChange('estado', e.target.value)}
                                placeholder="Ej: México"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Turno */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Turno *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {TURNOS.map((turno) => (
                                <button
                                    key={turno}
                                    type="button"
                                    onClick={() => handleChange('turno', turno)}
                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.turno === turno
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    {turno}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Puesto del Creador */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tu Puesto en la Escuela *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {PUESTOS.map((puesto) => (
                                <button
                                    key={puesto}
                                    type="button"
                                    onClick={() => handleChange('puestoCreador', puesto)}
                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all text-left ${formData.puestoCreador === puesto
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    {puesto}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={creating}
                    className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${creating
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                        }`}
                >
                    {creating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creando Escuela...
                        </>
                    ) : (
                        <>
                            Crear Escuela
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    )}
                </button>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> Al crear la escuela, se generará automáticamente un código de acceso único que podrás compartir con otros docentes para que se unan.
                    </p>
                </div>
            </div>
        </div>
    );
};
