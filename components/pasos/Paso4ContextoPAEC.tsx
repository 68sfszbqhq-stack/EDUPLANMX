import React from 'react';
import { MapPin, AlertTriangle, Users } from 'lucide-react';
import type { DatosNEM } from '../../types/diagnostico';

interface Paso4Props {
    datosNEM: Partial<DatosNEM>;
    setDatosNEM: (datos: Partial<DatosNEM>) => void;
}

const Paso4ContextoPAEC: React.FC<Paso4Props> = ({ datosNEM, setDatosNEM }) => {
    const toggleArrayItem = (array: string[], item: string) => {
        if (array.includes(item)) {
            return array.filter(i => i !== item);
        }
        return [...array, item];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Contexto Comunitario y Social (PAEC)</h3>
                    <p className="text-sm text-slate-500">Problemáticas del entorno y convivencia</p>
                </div>
            </div>

            {/* Problemas Comunitarios */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Problemática Local (Selecciona los 3 principales)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        'Mala alimentación',
                        'Contaminación',
                        'Pandillerismo',
                        'Violencia',
                        'Adicciones',
                        'Robos',
                        'Falta de servicios públicos',
                        'Desempleo',
                        'Inseguridad',
                        'Falta de espacios recreativos',
                        'Problemas de salud pública'
                    ].map((problema) => (
                        <label
                            key={problema}
                            className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg transition-colors ${datosNEM.problemasComunitarios?.includes(problema)
                                    ? 'bg-amber-50 border-amber-300'
                                    : 'border-slate-200 hover:bg-amber-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datosNEM.problemasComunitarios?.includes(problema) || false}
                                onChange={() => setDatosNEM({
                                    ...datosNEM,
                                    problemasComunitarios: toggleArrayItem(datosNEM.problemasComunitarios || [], problema)
                                })}
                                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-700">{problema}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Deficiencias de Servicios */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Servicios Deficientes en la Comunidad
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        'Alumbrado público',
                        'Transporte público',
                        'Áreas verdes',
                        'Centros de salud',
                        'Rampas para discapacidad'
                    ].map((servicio) => (
                        <label
                            key={servicio}
                            className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg transition-colors ${datosNEM.deficienciasServicios?.includes(servicio)
                                    ? 'bg-amber-50 border-amber-300'
                                    : 'border-slate-200 hover:bg-amber-50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={datosNEM.deficienciasServicios?.includes(servicio) || false}
                                onChange={() => setDatosNEM({
                                    ...datosNEM,
                                    deficienciasServicios: toggleArrayItem(datosNEM.deficienciasServicios || [], servicio)
                                })}
                                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-700">{servicio}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Factores de Riesgo */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Factores de Riesgo Próximos
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Consumo de sustancias en la cuadra
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['Alcohol', 'Tabaco', 'Drogas', 'Ninguno'].map((sustancia) => (
                                <label key={sustancia} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={datosNEM.consumoSustanciasCuadra?.includes(sustancia) || false}
                                        onChange={() => setDatosNEM({
                                            ...datosNEM,
                                            consumoSustanciasCuadra: toggleArrayItem(datosNEM.consumoSustanciasCuadra || [], sustancia)
                                        })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm text-slate-700">{sustancia}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Consumo de sustancias dentro de casa
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['Alcohol', 'Tabaco', 'Drogas', 'Ninguno'].map((sustancia) => (
                                <label key={sustancia} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={datosNEM.consumoSustanciasCasa?.includes(sustancia) || false}
                                        onChange={() => setDatosNEM({
                                            ...datosNEM,
                                            consumoSustanciasCasa: toggleArrayItem(datosNEM.consumoSustanciasCasa || [], sustancia)
                                        })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm text-slate-700">{sustancia}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Convivencia Social */}
            <div className="mt-6">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    Convivencia Social
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Frecuencia de discusiones en la comunidad
                        </label>
                        <select
                            value={datosNEM.frecuenciaDiscusionesComunidad}
                            onChange={(e) => setDatosNEM({ ...datosNEM, frecuenciaDiscusionesComunidad: e.target.value as any })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="Nunca">Nunca</option>
                            <option value="Rara vez">Rara vez</option>
                            <option value="A veces">A veces</option>
                            <option value="Frecuente">Frecuente</option>
                            <option value="Muy frecuente">Muy frecuente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Intensidad de peleas en la comunidad
                        </label>
                        <select
                            value={datosNEM.intensidadPeleasComunidad}
                            onChange={(e) => setDatosNEM({ ...datosNEM, intensidadPeleasComunidad: e.target.value as any })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="Ninguna">Ninguna</option>
                            <option value="Leve">Leve</option>
                            <option value="Moderada">Moderada</option>
                            <option value="Grave">Grave</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Frecuencia de discusiones en la familia
                        </label>
                        <select
                            value={datosNEM.frecuenciaDiscusionesFamilia}
                            onChange={(e) => setDatosNEM({ ...datosNEM, frecuenciaDiscusionesFamilia: e.target.value as any })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="Nunca">Nunca</option>
                            <option value="Rara vez">Rara vez</option>
                            <option value="A veces">A veces</option>
                            <option value="Frecuente">Frecuente</option>
                            <option value="Muy frecuente">Muy frecuente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Intensidad de peleas en la familia
                        </label>
                        <select
                            value={datosNEM.intensidadPeleasFamilia}
                            onChange={(e) => setDatosNEM({ ...datosNEM, intensidadPeleasFamilia: e.target.value as any })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="Ninguna">Ninguna</option>
                            <option value="Leve">Leve</option>
                            <option value="Moderada">Moderada</option>
                            <option value="Grave">Grave</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Cultura y Valores */}
            <div className="mt-6">
                <h4 className="font-semibold text-slate-800 mb-4">Cultura y Valores</h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tradiciones locales identificadas (opcional)
                        </label>
                        <textarea
                            value={datosNEM.tradicionesLocales?.join(', ') || ''}
                            onChange={(e) => setDatosNEM({
                                ...datosNEM,
                                tradicionesLocales: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
                            })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            rows={2}
                            placeholder="Ej: Día de Muertos, Fiestas patronales, Carnaval (separadas por comas)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Prácticas discriminatorias detectadas
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['Machismo', 'Homofobia', 'Racismo', 'Clasismo', 'Ninguna'].map((practica) => (
                                <label
                                    key={practica}
                                    className={`flex items-center gap-2 cursor-pointer p-3 border rounded-lg transition-colors ${datosNEM.practicasDiscriminatorias?.includes(practica)
                                            ? 'bg-amber-50 border-amber-300'
                                            : 'border-slate-200 hover:bg-amber-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={datosNEM.practicasDiscriminatorias?.includes(practica) || false}
                                        onChange={() => setDatosNEM({
                                            ...datosNEM,
                                            practicasDiscriminatorias: toggleArrayItem(datosNEM.practicasDiscriminatorias || [], practica)
                                        })}
                                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                    />
                                    <span className="text-sm text-slate-700">{practica}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Paso4ContextoPAEC;
