import React from 'react';
import { DollarSign, Home, Heart } from 'lucide-react';
import type { DatosNEM } from '../../types/diagnostico';

interface Paso3Props {
    datosNEM: Partial<DatosNEM>;
    setDatosNEM: (datos: Partial<DatosNEM>) => void;
}

const Paso3EconomiaSalud: React.FC<Paso3Props> = ({ datosNEM, setDatosNEM }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Capital Socioeconómico y Bienestar</h3>
                    <p className="text-sm text-slate-500">Información económica y de salud</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nivel Educativo de los Padres */}
                <div className="md:col-span-2">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">📚</span> Nivel Educativo de los Padres
                    </h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Escolaridad del Padre</label>
                    <select
                        value={datosNEM.gradoEstudioPadre}
                        onChange={(e) => setDatosNEM({ ...datosNEM, gradoEstudioPadre: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Sin estudios">Sin estudios</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Preparatoria">Preparatoria</option>
                        <option value="Licenciatura">Licenciatura</option>
                        <option value="Posgrado">Posgrado</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Escolaridad de la Madre</label>
                    <select
                        value={datosNEM.gradoEstudioMadre}
                        onChange={(e) => setDatosNEM({ ...datosNEM, gradoEstudioMadre: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Sin estudios">Sin estudios</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Preparatoria">Preparatoria</option>
                        <option value="Licenciatura">Licenciatura</option>
                        <option value="Posgrado">Posgrado</option>
                    </select>
                </div>

                {/* Ocupación de los Padres */}
                <div className="md:col-span-2 mt-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">💼</span> Situación Laboral de los Padres
                    </h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ocupación del Padre</label>
                    <select
                        value={datosNEM.ocupacionPadre}
                        onChange={(e) => setDatosNEM({ ...datosNEM, ocupacionPadre: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Hogar">Hogar</option>
                        <option value="Profesionista">Profesionista</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Obrero">Obrero</option>
                        <option value="Negocio propio">Negocio propio</option>
                        <option value="Comercio">Comercio</option>
                        <option value="Desempleado">Desempleado</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ocupación de la Madre</label>
                    <select
                        value={datosNEM.ocupacionMadre}
                        onChange={(e) => setDatosNEM({ ...datosNEM, ocupacionMadre: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Hogar">Hogar</option>
                        <option value="Profesionista">Profesionista</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Obrero">Obrero</option>
                        <option value="Negocio propio">Negocio propio</option>
                        <option value="Comercio">Comercio</option>
                        <option value="Desempleado">Desempleado</option>
                    </select>
                </div>

                {/* Situación del Alumno */}
                <div className="md:col-span-2 mt-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">👤</span> Estabilidad del Alumno
                    </h4>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Situación Laboral</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {['Solo estudia', 'Estudia y trabaja', 'Trabaja y estudia'].map((opcion) => (
                            <label key={opcion} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="situacionLaboral"
                                    value={opcion}
                                    checked={datosNEM.situacionLaboral === opcion}
                                    onChange={(e) => setDatosNEM({ ...datosNEM, situacionLaboral: e.target.value as any })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-slate-700">{opcion}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {datosNEM.situacionLaboral !== 'Solo estudia' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Horas de trabajo por semana</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={datosNEM.horasTrabajoSemanal || ''}
                            onChange={(e) => setDatosNEM({ ...datosNEM, horasTrabajoSemanal: parseInt(e.target.value) || undefined })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: 20"
                        />
                    </div>
                )}

                {/* Vivienda */}
                <div className="md:col-span-2 mt-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Home className="w-5 h-5 text-blue-600" />
                        Vivienda y Servicios
                    </h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Vivienda</label>
                    <select
                        value={datosNEM.tipoVivienda}
                        onChange={(e) => setDatosNEM({ ...datosNEM, tipoVivienda: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="Propia">Propia</option>
                        <option value="Rentada">Rentada</option>
                        <option value="Prestada">Prestada</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Servicios Disponibles</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.keys(datosNEM.serviciosVivienda || {}).map((servicio) => (
                            <label key={servicio} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={datosNEM.serviciosVivienda?.[servicio as keyof typeof datosNEM.serviciosVivienda] || false}
                                    onChange={(e) => setDatosNEM({
                                        ...datosNEM,
                                        serviciosVivienda: {
                                            ...datosNEM.serviciosVivienda!,
                                            [servicio]: e.target.checked
                                        }
                                    })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700 capitalize">
                                    {servicio === 'tvCable' ? 'TV Cable' : servicio === 'aireAcondicionado' ? 'Aire Acondicionado' : servicio}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Economía */}
                <div className="md:col-span-2 mt-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">💰</span> Economía Familiar
                    </h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ingresos Mensuales Familiares</label>
                    <select
                        value={datosNEM.ingresosMensuales}
                        onChange={(e) => setDatosNEM({ ...datosNEM, ingresosMensuales: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="0-5000">$0 - $5,000</option>
                        <option value="5001-10000">$5,001 - $10,000</option>
                        <option value="10001-20000">$10,001 - $20,000</option>
                        <option value="20001-40000">$20,001 - $40,000</option>
                        <option value="40001+">Más de $40,000</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Personas que aportan al ingreso</label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        value={datosNEM.personasAportanIngreso || 2}
                        onChange={(e) => setDatosNEM({ ...datosNEM, personasAportanIngreso: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={datosNEM.cuentaConBeca || false}
                            onChange={(e) => setDatosNEM({ ...datosNEM, cuentaConBeca: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">El alumno cuenta con beca</span>
                    </label>
                </div>

                {datosNEM.cuentaConBeca && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Beca</label>
                        <input
                            type="text"
                            value={datosNEM.tipoBeca || ''}
                            onChange={(e) => setDatosNEM({ ...datosNEM, tipoBeca: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Benito Juárez, Jóvenes Escribiendo el Futuro"
                        />
                    </div>
                )}

                {/* Salud */}
                <div className="md:col-span-2 mt-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-blue-600" />
                        Salud
                    </h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Institución de Seguridad Social</label>
                    <select
                        value={datosNEM.institucionSalud}
                        onChange={(e) => setDatosNEM({ ...datosNEM, institucionSalud: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="IMSS">IMSS</option>
                        <option value="ISSSTE">ISSSTE</option>
                        <option value="Bienestar">Bienestar</option>
                        <option value="Seguro privado">Seguro privado</option>
                        <option value="Ninguna">Ninguna</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Enfermedades o condiciones crónicas (opcional)
                    </label>
                    <textarea
                        value={datosNEM.enfermedadesCronicas?.join(', ') || ''}
                        onChange={(e) => setDatosNEM({
                            ...datosNEM,
                            enfermedadesCronicas: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
                        })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Ej: Diabetes, Asma, Hipertensión (separadas por comas)"
                    />
                </div>

                {datosNEM.enfermedadesCronicas && datosNEM.enfermedadesCronicas.length > 0 && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tratamiento</label>
                        <textarea
                            value={datosNEM.tratamientoEnfermedades || ''}
                            onChange={(e) => setDatosNEM({ ...datosNEM, tratamientoEnfermedades: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            placeholder="Describe el tratamiento que sigue"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Paso3EconomiaSalud;
