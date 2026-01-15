import React from 'react';
import { Users, Phone, Heart, AlertCircle } from 'lucide-react';
import type { DatosFamiliares } from '../../types/cuestionarioIntegrado';

interface Props {
    datos: DatosFamiliares;
    setDatos: React.Dispatch<React.SetStateAction<DatosFamiliares>>;
}

const PasoIntegrado2Familia: React.FC<Props> = ({ datos, setDatos }) => {
    const handleChange = (field: keyof DatosFamiliares, value: any) => {
        setDatos(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-start gap-4">
                    <Users className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Datos Familiares
                        </h3>
                        <p className="text-sm text-gray-600">
                            Información sobre tu familia y red de apoyo
                        </p>
                    </div>
                </div>
            </div>

            {/* Tutor/Responsable */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Tutor o Responsable
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre completo del tutor *
                        </label>
                        <input
                            type="text"
                            value={datos.nombreTutor}
                            onChange={(e) => handleChange('nombreTutor', e.target.value.toUpperCase())}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                            placeholder="APELLIDO PATERNO MATERNO NOMBRE(S)"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Comenzando por apellido paterno</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Parentesco con el alumno *
                        </label>
                        <input
                            type="text"
                            value={datos.parentescoTutor}
                            onChange={(e) => handleChange('parentescoTutor', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent capitalize"
                            placeholder="Ej: Padre, Madre, Hermano, Tío, Abuelo, etc."
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Teléfonos de contacto */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Teléfonos de Contacto
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono del Padre
                        </label>
                        <input
                            type="tel"
                            value={datos.telefonoPadre}
                            onChange={(e) => handleChange('telefonoPadre', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="10 dígitos"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono de la Madre
                        </label>
                        <input
                            type="tel"
                            value={datos.telefonoMadre}
                            onChange={(e) => handleChange('telefonoMadre', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="10 dígitos"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono del Tutor
                        </label>
                        <input
                            type="tel"
                            value={datos.telefonoTutor}
                            onChange={(e) => handleChange('telefonoTutor', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="10 dígitos"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Teléfono de Emergencia *
                        </label>
                        <input
                            type="tel"
                            value={datos.telefonoEmergencia}
                            onChange={(e) => handleChange('telefonoEmergencia', e.target.value)}
                            className="w-full px-4 py-2.5 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
                            placeholder="10 dígitos"
                            maxLength={10}
                            required
                        />
                    </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                    Proporciona al menos un número de teléfono. El teléfono de emergencia es obligatorio.
                </p>
            </div>

            {/* Estructura Familiar */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de familia *
                </label>
                <select
                    value={datos.tipoFamilia}
                    onChange={(e) => handleChange('tipoFamilia', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    required
                >
                    <option value="Nuclear">Familia nuclear (padre, madre y los hijos de ambos)</option>
                    <option value="Compuesta">Familia compuesta (padrastro o madrastra y/o hermanastros)</option>
                    <option value="Monoparental">Familia monoparental (un adulto y sus hijos)</option>
                    <option value="Extensa">Familia extensa (conviven integrantes de diferentes generaciones: padres, hijos, abuelos, tíos, etc)</option>
                    <option value="Homoparental">Familia homoparental (integrada por una pareja de hombres o mujeres e hijos)</option>
                </select>
            </div>

            {/* Número de hermanos */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ¿Cuántos hermanos y hermanas tienes?
                </label>
                <select
                    value={datos.numHermanos}
                    onChange={(e) => handleChange('numHermanos', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                    <option value="Ninguno">Ninguno</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4 o más">4 o más</option>
                </select>
            </div>

            {/* Escolaridad de los padres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Último grado de estudios de la madre
                    </label>
                    <select
                        value={datos.escolaridadMadre}
                        onChange={(e) => handleChange('escolaridadMadre', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                        <option value="Ninguna">Ninguna</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Preparatoria">Preparatoria</option>
                        <option value="Carrera Técnica">Carrera Técnica</option>
                        <option value="Licenciatura">Licenciatura</option>
                        <option value="Posgrado">Posgrado</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Último grado de estudios del padre
                    </label>
                    <select
                        value={datos.escolaridadPadre}
                        onChange={(e) => handleChange('escolaridadPadre', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                        <option value="Ninguna">Ninguna</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Preparatoria">Preparatoria</option>
                        <option value="Carrera Técnica">Carrera Técnica</option>
                        <option value="Licenciatura">Licenciatura</option>
                        <option value="Posgrado">Posgrado</option>
                    </select>
                </div>
            </div>

            {/* Ocupación de los padres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ocupación de la madre
                    </label>
                    <select
                        value={datos.ocupacionMadre}
                        onChange={(e) => handleChange('ocupacionMadre', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                        <option value="Actividades del hogar">Actividades del hogar</option>
                        <option value="Profesionista">Profesionista</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Obrero">Obrero</option>
                        <option value="Negocio propio">Negocio propio</option>
                        <option value="Comercio">Comercio</option>
                        <option value="Otra">Otra</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ocupación del padre
                    </label>
                    <select
                        value={datos.ocupacionPadre}
                        onChange={(e) => handleChange('ocupacionPadre', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                        <option value="Actividades del hogar">Actividades del hogar</option>
                        <option value="Profesionista">Profesionista</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Obrero">Obrero</option>
                        <option value="Negocio propio">Negocio propio</option>
                        <option value="Comercio">Comercio</option>
                        <option value="Otra">Otra</option>
                    </select>
                </div>
            </div>

            {/* Seguridad Social */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Atención de seguridad social
                </label>
                <select
                    value={datos.seguridadSocial}
                    onChange={(e) => handleChange('seguridadSocial', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                    <option value="IMSS">IMSS</option>
                    <option value="ISSSTE">ISSSTE</option>
                    <option value="Seguro Popular/Bienestar">Seguro Popular/Bienestar</option>
                    <option value="Seguro de gastos médicos mayores">Seguro de gastos médicos mayores</option>
                    <option value="Otro">Otro</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>

            {/* Convivencia Familiar */}
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                <h4 className="font-bold text-gray-800 mb-4">Convivencia Familiar</h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Entre los miembros de la familia, ¿se presentan discusiones o peleas?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors">
                                    <input
                                        type="radio"
                                        name="frecuencia_peleas"
                                        value={option}
                                        checked={datos.frecuenciaDiscusionesFamilia === option}
                                        onChange={(e) => handleChange('frecuenciaDiscusionesFamilia', e.target.value)}
                                        className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {datos.frecuenciaDiscusionesFamilia !== 'Nunca' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ¿Qué tan intensa es la discusión o pelea?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Baja', 'Media', 'Alta'].map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors">
                                        <input
                                            type="radio"
                                            name="intensidad_peleas"
                                            value={option}
                                            checked={datos.intensidadPeleas === option}
                                            onChange={(e) => handleChange('intensidadPeleas', e.target.value)}
                                            className="text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            En su casa, ¿se realizan prácticas machistas?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors">
                                    <input
                                        type="radio"
                                        name="practicas_machistas"
                                        value={option}
                                        checked={datos.practicasMachistas === option}
                                        onChange={(e) => handleChange('practicasMachistas', e.target.value)}
                                        className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasoIntegrado2Familia;
