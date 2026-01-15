import React from 'react';
import { MapPin, AlertTriangle, TreePine, Users } from 'lucide-react';
import type { ContextoComunitario } from '../../types/cuestionarioIntegrado';
import { SERVICIOS_BASICOS } from '../../types/cuestionarioIntegrado';

interface Props {
    datos: ContextoComunitario;
    setDatos: React.Dispatch<React.SetStateAction<ContextoComunitario>>;
}

const PasoIntegrado5Comunidad: React.FC<Props> = ({ datos, setDatos }) => {
    const handleChange = (field: keyof ContextoComunitario, value: any) => {
        setDatos(prev => ({ ...prev, [field]: value }));
    };

    const toggleServicio = (servicio: string) => {
        const current = datos.serviciosFaltantes || [];
        const updated = current.includes(servicio)
            ? current.filter(s => s !== servicio)
            : [...current, servicio];
        handleChange('serviciosFaltantes', updated);
    };

    const problemasOpciones = [
        'Mala alimentación',
        'Contaminación',
        'Pandillerismo',
        'Violencia',
        'Consumo de sustancias adictivas',
        'Robos o asaltos',
        'Otro'
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                <div className="flex items-start gap-4">
                    <MapPin className="w-8 h-8 text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Contexto Comunitario
                        </h3>
                        <p className="text-sm text-gray-600">
                            Información sobre tu comunidad y entorno social (PAEC)
                        </p>
                    </div>
                </div>
            </div>

            {/* Problemas Principales */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Principales Problemas de la Comunidad
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Principal problema que enfrenta tu comunidad
                        </label>
                        <select
                            value={datos.principalProblema}
                            onChange={(e) => handleChange('principalProblema', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        >
                            {problemasOpciones.map(problema => (
                                <option key={problema} value={problema}>{problema}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Segundo problema más frecuente
                        </label>
                        <select
                            value={datos.segundoProblema}
                            onChange={(e) => handleChange('segundoProblema', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        >
                            {problemasOpciones.map(problema => (
                                <option key={problema} value={problema}>{problema}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tercer problema más frecuente
                        </label>
                        <select
                            value={datos.tercerProblema}
                            onChange={(e) => handleChange('tercerProblema', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        >
                            {problemasOpciones.map(problema => (
                                <option key={problema} value={problema}>{problema}</option>
                            ))}
                        </select>
                    </div>

                    {(datos.principalProblema === 'Otro' || datos.segundoProblema === 'Otro' || datos.tercerProblema === 'Otro') && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Especifica el otro problema
                            </label>
                            <input
                                type="text"
                                value={datos.otroProblema || ''}
                                onChange={(e) => handleChange('otroProblema', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="Describe el otro problema..."
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Servicios Faltantes */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">
                    ¿Qué servicios faltan en tu comunidad? (Selecciona todos los que apliquen)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SERVICIOS_BASICOS.map(servicio => (
                        <label
                            key={servicio}
                            className={`cursor-pointer p-3 border-2 rounded-lg transition-all ${datos.serviciosFaltantes?.includes(servicio)
                                    ? 'bg-teal-100 border-teal-500'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datos.serviciosFaltantes?.includes(servicio) || false}
                                onChange={() => toggleServicio(servicio)}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium text-gray-700">{servicio}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Consumo de Sustancias */}
            <div className="bg-red-50 p-5 rounded-lg border-2 border-red-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Factores de Riesgo en la Comunidad
                </h4>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                En tu cuadra, ¿hay personas que consumen alcohol o cigarro?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Sí', 'No', 'Tal vez'].map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors text-center justify-center">
                                        <input
                                            type="radio"
                                            name="alcohol_cuadra"
                                            value={option}
                                            checked={datos.consumoAlcoholCigarroCuadra === option}
                                            onChange={(e) => handleChange('consumoAlcoholCigarroCuadra', e.target.value)}
                                            className="text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                En tu casa, ¿hay personas que consumen alcohol o cigarro?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Sí', 'No', 'Tal vez'].map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors text-center justify-center">
                                        <input
                                            type="radio"
                                            name="alcohol_casa"
                                            value={option}
                                            checked={datos.consumoAlcoholCigarroCasa === option}
                                            onChange={(e) => handleChange('consumoAlcoholCigarroCasa', e.target.value)}
                                            className="text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                En tu cuadra, ¿hay personas que consumen marihuana u otras drogas?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Sí', 'No', 'Tal vez'].map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors text-center justify-center">
                                        <input
                                            type="radio"
                                            name="drogas_cuadra"
                                            value={option}
                                            checked={datos.consumoDrogasCuadra === option}
                                            onChange={(e) => handleChange('consumoDrogasCuadra', e.target.value)}
                                            className="text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                En tu casa, ¿hay personas que consumen marihuana u otras drogas?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Sí', 'No', 'Tal vez'].map(option => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors text-center justify-center">
                                        <input
                                            type="radio"
                                            name="drogas_casa"
                                            value={option}
                                            checked={datos.consumoDrogasCasa === option}
                                            onChange={(e) => handleChange('consumoDrogasCasa', e.target.value)}
                                            className="text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            En tu cuadra, ¿se presentan discusiones o peleas?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-white transition-colors">
                                    <input
                                        type="radio"
                                        name="peleas_cuadra"
                                        value={option}
                                        checked={datos.peleasCuadra === option}
                                        onChange={(e) => handleChange('peleasCuadra', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cultura y Recreación */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-green-600" />
                    Cultura y Recreación
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            En tu comunidad, ¿existen espacios de recreación o diversión como parques, campos o canchas deportivas?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="espacios"
                                        value={option}
                                        checked={datos.espaciosRecreacion === option}
                                        onChange={(e) => handleChange('espaciosRecreacion', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            En tu comunidad, ¿realizan alguna tradición o costumbre donde participe la mayoría de los habitantes?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="tradiciones"
                                        value={option}
                                        checked={datos.tradicionesComunidad === option}
                                        onChange={(e) => handleChange('tradicionesComunidad', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {datos.tradicionesComunidad === 'Sí' && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Describe la tradición o costumbre
                            </label>
                            <textarea
                                value={datos.descripcionTradicion || ''}
                                onChange={(e) => handleChange('descripcionTradicion', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                rows={3}
                                placeholder="Describe la tradición o actividad comunitaria..."
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Discriminación */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Inclusión y No Discriminación
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Se realizan prácticas machistas?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="machismo"
                                        value={option}
                                        checked={datos.practicasMachistasComunidad === option}
                                        onChange={(e) => handleChange('practicasMachistasComunidad', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Se realizan prácticas homofóbicas?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="homofobia"
                                        value={option}
                                        checked={datos.practicasHomofobicas === option}
                                        onChange={(e) => handleChange('practicasHomofobicas', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Se realizan prácticas racistas?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="racismo"
                                        value={option}
                                        checked={datos.practicasRacistas === option}
                                        onChange={(e) => handleChange('practicasRacistas', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Se realizan prácticas clasistas?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="clasismo"
                                        value={option}
                                        checked={datos.practicasClasistas === option}
                                        onChange={(e) => handleChange('practicasClasistas', e.target.value)}
                                        className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-sm text-teal-800">
                    <span className="font-semibold">PAEC (Programa Aula-Escuela-Comunidad):</span> Esta información nos ayudará a conectar tu aprendizaje con las necesidades reales de tu comunidad.
                </p>
            </div>
        </div>
    );
};

export default PasoIntegrado5Comunidad;
