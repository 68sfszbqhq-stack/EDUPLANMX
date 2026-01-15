import React from 'react';
import { BookOpen, Heart, Activity, AlertTriangle } from 'lucide-react';
import type { DatosAlumnoPersonales } from '../../types/cuestionarioIntegrado';
import { MATERIAS_BACHILLERATO, ACTIVIDADES_INTERES } from '../../types/cuestionarioIntegrado';

interface Props {
    datos: DatosAlumnoPersonales;
    setDatos: React.Dispatch<React.SetStateAction<DatosAlumnoPersonales>>;
}

const PasoIntegrado4Alumno: React.FC<Props> = ({ datos, setDatos }) => {
    const handleChange = (field: keyof DatosAlumnoPersonales, value: any) => {
        setDatos(prev => ({ ...prev, [field]: value }));
    };

    const toggleMateria = (materia: string) => {
        const current = datos.materiasPreferidas || [];
        const updated = current.includes(materia)
            ? current.filter(m => m !== materia)
            : [...current, materia];
        handleChange('materiasPreferidas', updated);
    };

    const toggleActividad = (actividad: string) => {
        const current = datos.actividadesPreferidas || [];
        const updated = current.includes(actividad)
            ? current.filter(a => a !== actividad)
            : [...current, actividad];
        handleChange('actividadesPreferidas', updated);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                <div className="flex items-start gap-4">
                    <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Datos del Alumno
                        </h3>
                        <p className="text-sm text-gray-600">
                            Tus intereses, situación actual y salud
                        </p>
                    </div>
                </div>
            </div>

            {/* Situación Académica/Laboral */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Situación Actual
                </h4>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Selecciona la situación en que te encuentras
                    </label>
                    <select
                        value={datos.situacionAlumno}
                        onChange={(e) => handleChange('situacionAlumno', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                        <option value="Solo estudia">Solo estudia</option>
                        <option value="Principalmente estudia y realiza algún trabajo">Principalmente estudia y realiza algún trabajo</option>
                        <option value="Principalmente trabaja y además estudia">Principalmente trabaja y además estudia</option>
                        <option value="Estudia y busca trabajo">Estudia y busca trabajo</option>
                    </select>
                </div>
            </div>

            {/* Materias Preferidas */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">
                    ¿Qué materias te agradan más? (Selecciona todas las que apliquen)
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MATERIAS_BACHILLERATO.map(materia => (
                        <label
                            key={materia}
                            className={`cursor-pointer p-3 border-2 rounded-lg transition-all ${datos.materiasPreferidas?.includes(materia)
                                    ? 'bg-indigo-100 border-indigo-500'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datos.materiasPreferidas?.includes(materia) || false}
                                onChange={() => toggleMateria(materia)}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium text-gray-700">{materia}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Actividades Preferidas */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">
                    ¿Qué actividades prefieres realizar? (Selecciona todas las que apliquen)
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ACTIVIDADES_INTERES.map(actividad => (
                        <label
                            key={actividad}
                            className={`cursor-pointer p-3 border-2 rounded-lg transition-all ${datos.actividadesPreferidas?.includes(actividad)
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datos.actividadesPreferidas?.includes(actividad) || false}
                                onChange={() => toggleActividad(actividad)}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium text-gray-700">{actividad}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Salud */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Salud
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ¿Presentas alguna enfermedad o condición de salud?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="enfermedad"
                                        value={option}
                                        checked={datos.tieneEnfermedadCondicion === option}
                                        onChange={(e) => handleChange('tieneEnfermedadCondicion', e.target.value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {datos.tieneEnfermedadCondicion === 'Sí' && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Describe la enfermedad o condición y el tratamiento que sigues (si aplica)
                            </label>
                            <textarea
                                value={datos.detalleEnfermedadCondicion || ''}
                                onChange={(e) => handleChange('detalleEnfermedadCondicion', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={4}
                                placeholder="Describe aquí la condición y el tratamiento..."
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Esta información es confidencial y nos ayudará a brindarte mejor apoyo
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">Tus intereses importan:</span> Esta información nos ayudará a diseñar actividades y clases más interesantes para ti.
                </p>
            </div>
        </div>
    );
};

export default PasoIntegrado4Alumno;
