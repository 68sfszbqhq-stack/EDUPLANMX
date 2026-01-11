import React from 'react';
import { User } from 'lucide-react';
import type { DatosAdministrativos } from '../../types/diagnostico';

interface Paso1Props {
    datosAdmin: DatosAdministrativos;
    setDatosAdmin: (datos: DatosAdministrativos) => void;
}

const Paso1Identidad: React.FC<Paso1Props> = ({ datosAdmin, setDatosAdmin }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl">
                    <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Identidad y Trayectoria Académica</h3>
                    <p className="text-sm text-slate-500">Información básica del alumno</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">CURP *</label>
                    <input
                        type="text"
                        value={datosAdmin.curp}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, curp: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="XXXX000000XXXXXX00"
                        maxLength={18}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre(s) *</label>
                    <input
                        type="text"
                        value={datosAdmin.nombre}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, nombre: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Juan"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Apellido Paterno *</label>
                    <input
                        type="text"
                        value={datosAdmin.apellidoPaterno}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, apellidoPaterno: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Pérez"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Apellido Materno *</label>
                    <input
                        type="text"
                        value={datosAdmin.apellidoMaterno}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, apellidoMaterno: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="García"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Género</label>
                    <select
                        value={datosAdmin.genero}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, genero: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="Masculino">Masculino (H)</option>
                        <option value="Femenino">Femenino (M)</option>
                        <option value="Otro">Otro</option>
                        <option value="Prefiero no decir">Prefiero no decir</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Promedio de Secundaria</label>
                    <input
                        type="number"
                        step="0.1"
                        min="5"
                        max="10"
                        value={datosAdmin.promedioSecundaria}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, promedioSecundaria: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Secundaria</label>
                    <select
                        value={datosAdmin.tipoSecundaria}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, tipoSecundaria: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="General">General</option>
                        <option value="Técnica">Técnica</option>
                        <option value="Telesecundaria">Telesecundaria</option>
                        <option value="Particular">Particular</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sostenimiento</label>
                    <select
                        value={datosAdmin.sostenimiento}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, sostenimiento: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="Público">Pública</option>
                        <option value="Privado">Privada</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Paso1Identidad;
