import React from 'react';
import { User, Mail, GraduationCap, CheckCircle } from 'lucide-react';
import type { DatosGeneralesAlumno } from '../../types/cuestionarioIntegrado';
import { GRADOS_GRUPOS } from '../../types/cuestionarioIntegrado';

interface Props {
    datos: DatosGeneralesAlumno;
    setDatos: React.Dispatch<React.SetStateAction<DatosGeneralesAlumno>>;
}

const PasoIntegrado1DatosGenerales: React.FC<Props> = ({ datos, setDatos }) => {
    const handleChange = (field: keyof DatosGeneralesAlumno, value: any) => {
        setDatos(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start gap-4">
                    <User className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Datos Generales del Alumno
                        </h3>
                        <p className="text-sm text-gray-600">
                            Completa tu información personal básica para iniciar tu registro.
                        </p>
                    </div>
                </div>
            </div>

            {/* Protesta de veracidad */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={datos.protestaVerdad}
                        onChange={(e) => handleChange('protestaVerdad', e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                        <CheckCircle className="inline w-4 h-4 mr-1 text-amber-600" />
                        Bajo protesta de decir verdad, manifiesto que la información proporcionada en este documento es cierta
                    </span>
                </label>
            </div>

            {/* Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido Paterno *
                    </label>
                    <input
                        type="text"
                        value={datos.apellidoPaterno}
                        onChange={(e) => handleChange('apellidoPaterno', e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        placeholder="GARCÍA"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido Materno *
                    </label>
                    <input
                        type="text"
                        value={datos.apellidoMaterno}
                        onChange={(e) => handleChange('apellidoMaterno', e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        placeholder="LÓPEZ"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre(s) *
                    </label>
                    <input
                        type="text"
                        value={datos.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        placeholder="JUAN CARLOS"
                        required
                    />
                </div>
            </div>

            {/* CURP (opcional) */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CURP <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                    type="text"
                    value={datos.curp}
                    onChange={(e) => handleChange('curp', e.target.value.toUpperCase())}
                    maxLength={18}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono"
                    placeholder="GALJ030815HDFNPN09"
                />
                <p className="text-xs text-gray-500 mt-1">18 caracteres alfanuméricos</p>
            </div>

            {/* Correo electrónico */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Correo Electrónico Vigente *
                </label>
                <input
                    type="email"
                    value={datos.correoElectronico}
                    onChange={(e) => handleChange('correoElectronico', e.target.value.toLowerCase())}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="alumno@ejemplo.com"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Asegúrate de usar un correo al que tengas acceso, lo usaremos para comunicarnos contigo
                </p>
            </div>

            {/* Grado y Grupo */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <GraduationCap className="inline w-4 h-4 mr-1" />
                    Grado y Grupo *
                </label>
                <select
                    value={datos.gradoGrupo}
                    onChange={(e) => handleChange('gradoGrupo', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    required
                >
                    <option value="">Selecciona tu grado y grupo</option>
                    {GRADOS_GRUPOS.map(grado => (
                        <option key={grado} value={grado}>{grado}</option>
                    ))}
                </select>
            </div>

            {/* Indicador de campos obligatorios */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">Nota:</span> Los campos marcados con * son obligatorios
                </p>
            </div>
        </div>
    );
};

export default PasoIntegrado1DatosGenerales;
