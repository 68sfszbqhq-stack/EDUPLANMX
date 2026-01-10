import React, { useState } from 'react';
import { User, Home, Heart, MapPin, BookOpen, X } from 'lucide-react';
import type { Alumno, DatosAdministrativos, DatosNEM } from '../types/diagnostico';

interface FormularioAlumnoProps {
    onGuardar: (alumno: Alumno) => void;
    onCancelar: () => void;
}

const FormularioAlumno: React.FC<FormularioAlumnoProps> = ({ onGuardar, onCancelar }) => {
    const [paso, setPaso] = useState(1);

    // Estado para datos administrativos
    const [datosAdmin, setDatosAdmin] = useState<DatosAdministrativos>({
        curp: '',
        nombre: '',
        genero: 'Prefiero no decir',
        promedioSecundaria: 8.0,
        tipoSecundaria: 'General',
        sostenimiento: 'Público'
    });

    // Estado para datos NEM
    const [datosNEM, setDatosNEM] = useState<DatosNEM>({
        tipoFamilia: 'Nuclear',
        gradoEstudioPadre: '',
        gradoEstudioMadre: '',
        ocupacionPadre: '',
        ocupacionMadre: '',
        ingresosMensuales: '5001-10000',
        serviciosVivienda: {
            internet: false,
            luz: true,
            agua: true,
            drenaje: true,
            telefono: false
        },
        enfermedadesCronicas: [],
        adiccionesEntorno: [],
        alumnoTrabaja: false,
        problemasComunitarios: [],
        materiasPreferidas: [],
        actividadesInteres: []
    });

    const handleSubmit = () => {
        const nuevoAlumno: Alumno = {
            id: `ALU-${Date.now()}`,
            datosAdministrativos: datosAdmin,
            datosNEM: datosNEM,
            fechaRegistro: new Date().toISOString()
        };
        onGuardar(nuevoAlumno);
    };

    const renderPaso1 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl">
                    <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Datos Administrativos</h3>
                    <p className="text-sm text-slate-500">Información básica del alumno</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CURP</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
                    <input
                        type="text"
                        value={datosAdmin.nombre}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, nombre: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Juan Pérez García"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Género</label>
                    <select
                        value={datosAdmin.genero}
                        onChange={(e) => setDatosAdmin({ ...datosAdmin, genero: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
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
                        <option value="Público">Público</option>
                        <option value="Privado">Privado</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderPaso2 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl">
                    <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Contexto Familiar y Socioeconómico</h3>
                    <p className="text-sm text-slate-500">Información del entorno del alumno</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Familia</label>
                    <select
                        value={datosNEM.tipoFamilia}
                        onChange={(e) => setDatosNEM({ ...datosNEM, tipoFamilia: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="Nuclear">Nuclear (Padres e hijos)</option>
                        <option value="Extensa">Extensa (Con abuelos, tíos, etc.)</option>
                        <option value="Monoparental">Monoparental (Un solo padre)</option>
                        <option value="Reconstituida">Reconstituida (Familias mixtas)</option>
                        <option value="Unipersonal">Unipersonal (Vive solo)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ingresos Mensuales Familiares</label>
                    <select
                        value={datosNEM.ingresosMensuales}
                        onChange={(e) => setDatosNEM({ ...datosNEM, ingresosMensuales: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="0-5000">$0 - $5,000</option>
                        <option value="5001-10000">$5,001 - $10,000</option>
                        <option value="10001-20000">$10,001 - $20,000</option>
                        <option value="20001-40000">$20,001 - $40,000</option>
                        <option value="40001+">Más de $40,000</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Escolaridad del Padre</label>
                    <input
                        type="text"
                        value={datosNEM.gradoEstudioPadre}
                        onChange={(e) => setDatosNEM({ ...datosNEM, gradoEstudioPadre: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Ej: Secundaria, Preparatoria, Licenciatura"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Escolaridad de la Madre</label>
                    <input
                        type="text"
                        value={datosNEM.gradoEstudioMadre}
                        onChange={(e) => setDatosNEM({ ...datosNEM, gradoEstudioMadre: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Ej: Secundaria, Preparatoria, Licenciatura"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Servicios en la Vivienda</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.keys(datosNEM.serviciosVivienda).map((servicio) => (
                            <label key={servicio} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={datosNEM.serviciosVivienda[servicio as keyof typeof datosNEM.serviciosVivienda]}
                                    onChange={(e) => setDatosNEM({
                                        ...datosNEM,
                                        serviciosVivienda: {
                                            ...datosNEM.serviciosVivienda,
                                            [servicio]: e.target.checked
                                        }
                                    })}
                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-700 capitalize">{servicio}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={datosNEM.alumnoTrabaja}
                            onChange={(e) => setDatosNEM({ ...datosNEM, alumnoTrabaja: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700">El alumno trabaja actualmente</span>
                    </label>
                    {datosNEM.alumnoTrabaja && (
                        <input
                            type="number"
                            value={datosNEM.horasTrabajoSemanal || ''}
                            onChange={(e) => setDatosNEM({ ...datosNEM, horasTrabajoSemanal: parseInt(e.target.value) })}
                            className="mt-2 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Horas de trabajo por semana"
                        />
                    )}
                </div>
            </div>
        </div>
    );

    const renderPaso3 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Contexto Comunitario y PAEC</h3>
                    <p className="text-sm text-slate-500">Problemas identificados en la comunidad</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Problemas Comunitarios Identificados
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        'Violencia',
                        'Contaminación',
                        'Adicciones',
                        'Falta de servicios públicos',
                        'Desempleo',
                        'Inseguridad',
                        'Falta de espacios recreativos',
                        'Problemas de salud pública'
                    ].map((problema) => (
                        <label key={problema} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-amber-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={datosNEM.problemasComunitarios.includes(problema)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setDatosNEM({
                                            ...datosNEM,
                                            problemasComunitarios: [...datosNEM.problemasComunitarios, problema]
                                        });
                                    } else {
                                        setDatosNEM({
                                            ...datosNEM,
                                            problemasComunitarios: datosNEM.problemasComunitarios.filter(p => p !== problema)
                                        });
                                    }
                                }}
                                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-700">{problema}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPaso4 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Intereses y Preferencias</h3>
                    <p className="text-sm text-slate-500">Materias y actividades favoritas</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Materias Preferidas
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
                        <label key={materia} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-purple-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={datosNEM.materiasPreferidas.includes(materia)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setDatosNEM({
                                            ...datosNEM,
                                            materiasPreferidas: [...datosNEM.materiasPreferidas, materia]
                                        });
                                    } else {
                                        setDatosNEM({
                                            ...datosNEM,
                                            materiasPreferidas: datosNEM.materiasPreferidas.filter(m => m !== materia)
                                        });
                                    }
                                }}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700">{materia}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Actividades de Interés
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        'Deportes',
                        'Música',
                        'Arte y Dibujo',
                        'Tecnología',
                        'Lectura',
                        'Videojuegos',
                        'Redes Sociales',
                        'Voluntariado',
                        'Ciencia'
                    ].map((actividad) => (
                        <label key={actividad} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-purple-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={datosNEM.actividadesInteres.includes(actividad)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setDatosNEM({
                                            ...datosNEM,
                                            actividadesInteres: [...datosNEM.actividadesInteres, actividad]
                                        });
                                    } else {
                                        setDatosNEM({
                                            ...datosNEM,
                                            actividadesInteres: datosNEM.actividadesInteres.filter(a => a !== actividad)
                                        });
                                    }
                                }}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700">{actividad}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Registro de Alumno</h2>
                            <p className="text-indigo-100 text-sm mt-1">Paso {paso} de 4</p>
                        </div>
                        <button
                            onClick={onCancelar}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(paso / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {paso === 1 && renderPaso1()}
                    {paso === 2 && renderPaso2()}
                    {paso === 3 && renderPaso3()}
                    {paso === 4 && renderPaso4()}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 flex justify-between">
                    <button
                        onClick={() => setPaso(Math.max(1, paso - 1))}
                        disabled={paso === 1}
                        className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Anterior
                    </button>

                    {paso < 4 ? (
                        <button
                            onClick={() => setPaso(paso + 1)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Guardar Alumno
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormularioAlumno;
