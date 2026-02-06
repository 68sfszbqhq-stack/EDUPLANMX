import React, { useState } from 'react';
import { User, BookOpen, GraduationCap, ArrowRight, Loader2, Check } from 'lucide-react';
import type { Puesto, CompleteProfileData } from '../../types/school';

interface CompleteProfileScreenProps {
    schoolName: string;
    puesto: Puesto;
    onComplete: (profileData: CompleteProfileData) => void;
}

const MATERIAS_COMUNES = [
    'Matemáticas',
    'Física',
    'Química',
    'Biología',
    'Historia',
    'Geografía',
    'Inglés',
    'Español',
    'Filosofía',
    'Ética',
    'Informática',
    'Cultura Digital',
    'Educación Física',
    'Arte',
    'Música',
    'Orientación Educativa'
];

const SEMESTRES = [1, 2, 3, 4, 5, 6];

export const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({
    schoolName,
    puesto,
    onComplete
}) => {
    const [profileData, setProfileData] = useState<CompleteProfileData>({
        puesto,
        materias: [],
        grados: [],
        telefono: ''
    });

    const [customMateria, setCustomMateria] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isDocente = puesto === 'Docente' || puesto === 'Coordinador Académico';

    const toggleMateria = (materia: string) => {
        setProfileData(prev => ({
            ...prev,
            materias: prev.materias?.includes(materia)
                ? prev.materias.filter(m => m !== materia)
                : [...(prev.materias || []), materia]
        }));
    };

    const addCustomMateria = () => {
        if (customMateria.trim() && !profileData.materias?.includes(customMateria.trim())) {
            setProfileData(prev => ({
                ...prev,
                materias: [...(prev.materias || []), customMateria.trim()]
            }));
            setCustomMateria('');
        }
    };

    const toggleGrado = (grado: number) => {
        setProfileData(prev => ({
            ...prev,
            grados: prev.grados?.includes(grado)
                ? prev.grados.filter(g => g !== grado)
                : [...(prev.grados || []), grado]
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete(profileData);
    };

    const canSubmit = !isDocente || (profileData.materias && profileData.materias.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 md:p-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Completa tu Perfil
                            </h1>
                            <p className="text-gray-600">
                                Escuela: <span className="font-semibold text-blue-600">{schoolName}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Puesto (read-only) */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tu Puesto
                    </label>
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <div className="flex items-center">
                            <GraduationCap className="w-5 h-5 text-blue-600 mr-3" />
                            <span className="font-semibold text-blue-900">{puesto}</span>
                            <Check className="w-5 h-5 text-blue-600 ml-auto" />
                        </div>
                    </div>
                </div>

                {/* Materias (solo para docentes) */}
                {isDocente && (
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Materias que Impartes *
                        </label>

                        {/* Materias Comunes */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            {MATERIAS_COMUNES.map((materia) => (
                                <button
                                    key={materia}
                                    type="button"
                                    onClick={() => toggleMateria(materia)}
                                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${profileData.materias?.includes(materia)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    {materia}
                                </button>
                            ))}
                        </div>

                        {/* Agregar Materia Personalizada */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customMateria}
                                onChange={(e) => setCustomMateria(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addCustomMateria()}
                                placeholder="Otra materia..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <button
                                type="button"
                                onClick={addCustomMateria}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                                Agregar
                            </button>
                        </div>

                        {/* Materias Seleccionadas */}
                        {profileData.materias && profileData.materias.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Materias seleccionadas ({profileData.materias.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.materias.map((materia) => (
                                        <span
                                            key={materia}
                                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                            <BookOpen className="w-3 h-3 mr-1" />
                                            {materia}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Grados/Semestres (solo para docentes) */}
                {isDocente && (
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Semestres que Atiendes (opcional)
                        </label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {SEMESTRES.map((semestre) => (
                                <button
                                    key={semestre}
                                    type="button"
                                    onClick={() => toggleGrado(semestre)}
                                    className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${profileData.grados?.includes(semestre)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    {semestre}°
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Teléfono (opcional) */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono (opcional)
                    </label>
                    <input
                        type="tel"
                        value={profileData.telefono}
                        onChange={(e) => setProfileData(prev => ({ ...prev, telefono: e.target.value }))}
                        placeholder="Ej: 5512345678"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${canSubmit && !submitting
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Guardando Perfil...
                        </>
                    ) : (
                        <>
                            Finalizar Registro
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    )}
                </button>

                {/* Info */}
                {isDocente && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> Podrás editar esta información más tarde desde tu perfil.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
