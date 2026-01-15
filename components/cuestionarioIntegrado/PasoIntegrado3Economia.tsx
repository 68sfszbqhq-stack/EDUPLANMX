import React from 'react';
import { Home, DollarSign, Zap } from 'lucide-react';
import type { DatosEconomicosVivienda } from '../../types/cuestionarioIntegrado';

interface Props {
    datos: DatosEconomicosVivienda;
    setDatos: React.Dispatch<React.SetStateAction<DatosEconomicosVivienda>>;
}

const PasoIntegrado3Economia: React.FC<Props> = ({ datos, setDatos }) => {
    const handleChange = (field: keyof DatosEconomicosVivienda, value: any) => {
        setDatos(prev => ({ ...prev, [field]: value }));
    };

    const handleServicioChange = (servicio: string, checked: boolean) => {
        setDatos(prev => ({
            ...prev,
            servicios: { ...prev.servicios, [servicio]: checked }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-start gap-4">
                    <Home className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Datos Económicos y Vivienda
                        </h3>
                        <p className="text-sm text-gray-600">
                            Información sobre tu hogar y situación socioeconómica
                        </p>
                    </div>
                </div>
            </div>

            {/* Vivienda */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Vivienda
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            La casa que habitan es
                        </label>
                        <select
                            value={datos.tipoVivienda}
                            onChange={(e) => handleChange('tipoVivienda', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="Propia">Propia</option>
                            <option value="Rentada">Rentada</option>
                            <option value="Prestada">Prestada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Cuántas personas habitan la vivienda?
                        </label>
                        <select
                            value={datos.personasVivienda}
                            onChange={(e) => handleChange('personasVivienda', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="2 a 3">2 a 3</option>
                            <option value="4 a 6">4 a 6</option>
                            <option value="7 a 9">7 a 9</option>
                            <option value="10 o más">10 o más</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Servicios */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Servicios con los que cuenta la vivienda
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        { key: 'aguaPotable', label: 'Agua potable' },
                        { key: 'luzElectrica', label: 'Luz eléctrica' },
                        { key: 'drenaje', label: 'Drenaje' },
                        { key: 'lineaTelefonica', label: 'Línea telefónica' },
                        { key: 'internet', label: 'Internet' },
                        { key: 'tvCable', label: 'TV por cable' },
                        { key: 'aireAcondicionado', label: 'Aire acondicionado' }
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={datos.servicios[key as keyof typeof datos.servicios]}
                                onChange={(e) => handleServicioChange(key, e.target.checked)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Economía */}
            <div className="bg-white p-5 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Situación Económica
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Cuentan con automóvil propio?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="automovil"
                                        value={option}
                                        checked={datos.automovil === option}
                                        onChange={(e) => handleChange('automovil', e.target.value)}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Aproximadamente, ¿a cuánto ascienden los gastos familiares al mes?
                        </label>
                        <select
                            value={datos.gastosMensuales}
                            onChange={(e) => handleChange('gastosMensuales', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="Menos de 5 mil pesos">Menos de 5 mil pesos</option>
                            <option value="De 5 mil a 10 mil pesos">De 5 mil a 10 mil pesos</option>
                            <option value="De 10 mil a 15 mil pesos">De 10 mil a 15 mil pesos</option>
                            <option value="Más de 15 mil pesos">Más de 15 mil pesos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Número de personas que apoyan a la economía familiar
                        </label>
                        <select
                            value={datos.personasApoyanEconomia}
                            onChange={(e) => handleChange('personasApoyanEconomia', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5 o más">5 o más</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ¿Recibes algún tipo de beca o apoyo?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Sí', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="beca"
                                        value={option}
                                        checked={datos.recibeBecaApoyo === option}
                                        onChange={(e) => handleChange('recibeBecaApoyo', e.target.value)}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {datos.recibeBecaApoyo === 'Sí' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ¿Qué tipo de beca o apoyo recibes?
                            </label>
                            <input
                                type="text"
                                value={datos.tipoBeca || ''}
                                onChange={(e) => handleChange('tipoBeca', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ej: Beca Benito Juárez, Apoyo municipal, etc."
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                    <span className="font-semibold">Confidencialidad:</span> Esta información es confidencial y solo se usa para entender mejor el contexto de nuestros estudiantes.
                </p>
            </div>
        </div>
    );
};

export default PasoIntegrado3Economia;
