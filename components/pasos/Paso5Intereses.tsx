import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import type { DatosNEM } from '../../types/diagnostico';

interface Paso5Props {
    datosNEM: Partial<DatosNEM>;
    setDatosNEM: (datos: Partial<DatosNEM>) => void;
}

const Paso5Intereses: React.FC<Paso5Props> = ({ datosNEM, setDatosNEM }) => {
    const toggleArrayItem = (array: string[], item: string) => {
        if (array.includes(item)) {
            return array.filter(i => i !== item);
        }
        return [...array, item];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                    <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Perfil de Intereses y Motivación</h3>
                    <p className="text-sm text-slate-500">El "Hook" Pedagógico - Lo que te apasiona</p>
                </div>
            </div>

            {/* Materias Preferidas */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Afinidad Académica - Materias que más te agradan
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        'Matemáticas',
                        'Español',
                        'Inglés',
                        'Ciencias Naturales',
                        'Ciencias Sociales',
                        'Artes',
                        'Educación Física',
                        'Tecnología',
                        'Historia'
                    ].map((materia) => (
                        <label
                            key={materia}
                            className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg transition-colors ${datosNEM.materiasPreferidas?.includes(materia)
                                    ? 'bg-purple-50 border-purple-300'
                                    : 'border-slate-200 hover:bg-purple-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datosNEM.materiasPreferidas?.includes(materia) || false}
                                onChange={() => setDatosNEM({
                                    ...datosNEM,
                                    materiasPreferidas: toggleArrayItem(datosNEM.materiasPreferidas || [], materia)
                                })}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700">{materia}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Actividades de Interés */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Preferencias de Ocio - Actividades recreativas que disfrutas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        'Deportes',
                        'Música',
                        'Arte y Dibujo',
                        'Tecnología',
                        'Lectura',
                        'Videojuegos',
                        'Redes Sociales (TikTok/YouTube)',
                        'Voluntariado',
                        'Ciencia',
                        'Investigación'
                    ].map((actividad) => (
                        <label
                            key={actividad}
                            className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg transition-colors ${datosNEM.actividadesInteres?.includes(actividad)
                                    ? 'bg-purple-50 border-purple-300'
                                    : 'border-slate-200 hover:bg-purple-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datosNEM.actividadesInteres?.includes(actividad) || false}
                                onChange={() => setDatosNEM({
                                    ...datosNEM,
                                    actividadesInteres: toggleArrayItem(datosNEM.actividadesInteres || [], actividad)
                                })}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700">{actividad}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Mensaje de Finalización */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                <div className="flex items-start gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-2">¡Casi listo!</h4>
                        <p className="text-sm text-slate-600">
                            Gracias por compartir esta información. Nos ayudará a personalizar las clases
                            según tus intereses y necesidades. Al hacer clic en "Guardar Alumno",
                            tu información se guardará de forma segura.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Paso5Intereses;
