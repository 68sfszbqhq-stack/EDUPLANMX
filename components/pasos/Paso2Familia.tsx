import React from 'react';
import { Users, Phone } from 'lucide-react';
import type { DatosNEM, RedApoyo } from '../../types/diagnostico';

interface Paso2Props {
    datosNEM: Partial<DatosNEM>;
    setDatosNEM: (datos: Partial<DatosNEM>) => void;
    redApoyo: RedApoyo;
    setRedApoyo: (datos: RedApoyo) => void;
}

const Paso2Familia: React.FC<Paso2Props> = ({ datosNEM, setDatosNEM, redApoyo, setRedApoyo }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Estructura Familiar y Red de Apoyo</h3>
                    <p className="text-sm text-slate-500">Información del entorno familiar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Familia</label>
                    <select
                        value={datosNEM.tipoFamilia}
                        onChange={(e) => setDatosNEM({ ...datosNEM, tipoFamilia: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="Nuclear">Nuclear (Padres e hijos)</option>
                        <option value="Extensa">Extensa (Con abuelos, tíos, etc.)</option>
                        <option value="Monoparental">Monoparental (Un solo padre)</option>
                        <option value="Compuesta">Compuesta (Familias mixtas)</option>
                        <option value="Homoparental">Homoparental</option>
                    </select>
                </div>

                {/* Red de Apoyo */}
                <div className="md:col-span-2 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-slate-800">Red de Apoyo y Contactos</h4>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Tutor Responsable</label>
                    <input
                        type="text"
                        value={redApoyo.nombreTutor}
                        onChange={(e) => setRedApoyo({ ...redApoyo, nombreTutor: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Nombre completo del tutor"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Parentesco del Tutor</label>
                    <select
                        value={redApoyo.parentesco}
                        onChange={(e) => setRedApoyo({ ...redApoyo, parentesco: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Hermano">Hermano/a</option>
                        <option value="Tío">Tío/a</option>
                        <option value="Abuelo">Abuelo/a</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono del Padre</label>
                    <input
                        type="tel"
                        value={redApoyo.telefonoPadre}
                        onChange={(e) => setRedApoyo({ ...redApoyo, telefonoPadre: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="10 dígitos"
                        maxLength={10}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de la Madre</label>
                    <input
                        type="tel"
                        value={redApoyo.telefonoMadre}
                        onChange={(e) => setRedApoyo({ ...redApoyo, telefonoMadre: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="10 dígitos"
                        maxLength={10}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono del Tutor</label>
                    <input
                        type="tel"
                        value={redApoyo.telefonoTutor}
                        onChange={(e) => setRedApoyo({ ...redApoyo, telefonoTutor: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="10 dígitos"
                        maxLength={10}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de Emergencia</label>
                    <input
                        type="tel"
                        value={redApoyo.telefonoEmergencia}
                        onChange={(e) => setRedApoyo({ ...redApoyo, telefonoEmergencia: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="10 dígitos"
                        maxLength={10}
                    />
                </div>
            </div>
        </div>
    );
};

export default Paso2Familia;
