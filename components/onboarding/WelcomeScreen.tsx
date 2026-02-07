import React, { useState, useEffect } from 'react';
import { School, GraduationCap, Users, ArrowRight, Search, MapPin } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface WelcomeScreenProps {
    userName: string;
    onChoice: (choice: 'join' | 'create') => void;
    onSchoolSelected?: (schoolId: string, schoolName: string) => void;
}

interface SchoolData {
    id: string;
    nombre: string;
    codigo: string;
    direccion?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onChoice, onSchoolSelected }) => {
    const [selected, setSelected] = useState<'join' | 'create' | null>(null);
    const [schools, setSchools] = useState<SchoolData[]>([]);
    const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);

    useEffect(() => {
        loadSchools();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = schools.filter(school =>
                school.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                school.codigo.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSchools(filtered);
        } else {
            setFilteredSchools(schools);
        }
    }, [searchTerm, schools]);

    const loadSchools = async () => {
        try {
            setLoading(true);
            const schoolsSnapshot = await getDocs(collection(db, 'schools'));
            const schoolsData = schoolsSnapshot.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre,
                codigo: doc.data().codigo,
                direccion: doc.data().direccion
            }));
            setSchools(schoolsData);
            setFilteredSchools(schoolsData);
        } catch (error) {
            console.error('Error al cargar escuelas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (selected === 'join' && selectedSchool && onSchoolSelected) {
            onSchoolSelected(selectedSchool.id, selectedSchool.nombre);
        } else if (selected === 'create') {
            onChoice('create');
        } else if (selected === 'join' && !selectedSchool) {
            // Si seleccionó "join" pero no eligió escuela, ir a búsqueda manual
            onChoice('join');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                        <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        ¡Bienvenido a EDUPLANMX!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Hola, <span className="font-semibold text-blue-600">{userName}</span>
                    </p>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <p className="text-center text-gray-700 text-lg">
                        Para comenzar, necesitamos conocer tu escuela:
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-4 mb-8">
                    {/* Opción: Unirse a escuela existente */}
                    <div>
                        <button
                            onClick={() => setSelected('join')}
                            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${selected === 'join'
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${selected === 'join' ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}>
                                    <Users className={`w-6 h-6 ${selected === 'join' ? 'text-white' : 'text-gray-600'}`} />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        Mi escuela ya está registrada
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Selecciona tu escuela de la lista o búscala por nombre/código
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === 'join'
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }`}>
                                        {selected === 'join' && (
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Lista de Escuelas */}
                        {selected === 'join' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                {/* Búsqueda */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o código..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Lista */}
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-sm text-gray-600 mt-2">Cargando escuelas...</p>
                                    </div>
                                ) : filteredSchools.length === 0 ? (
                                    <div className="text-center py-8">
                                        <School className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            {searchTerm ? 'No se encontraron escuelas' : 'No hay escuelas registradas'}
                                        </p>
                                        <button
                                            onClick={() => setSelected('create')}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Registra la primera escuela
                                        </button>
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {filteredSchools.map((school) => (
                                            <button
                                                key={school.id}
                                                onClick={() => setSelectedSchool(school)}
                                                className={`w-full p-3 rounded-lg border transition-all text-left ${selectedSchool?.id === school.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-start">
                                                    <School className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selectedSchool?.id === school.id ? 'text-blue-600' : 'text-gray-400'
                                                        }`} />
                                                    <div className="ml-3 flex-1">
                                                        <p className="font-semibold text-gray-900">{school.nombre}</p>
                                                        <p className="text-sm text-gray-500">Código: {school.codigo}</p>
                                                        {school.direccion && (
                                                            <p className="text-xs text-gray-400 flex items-center mt-1">
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                {school.direccion}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="ml-2">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSchool?.id === school.id
                                                                ? 'border-blue-500 bg-blue-500'
                                                                : 'border-gray-300'
                                                            }`}>
                                                            {selectedSchool?.id === school.id && (
                                                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Opción de búsqueda manual */}
                                {filteredSchools.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                setSelectedSchool(null);
                                                onChoice('join');
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            ¿No encuentras tu escuela? Búscala por código CCT
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Opción: Crear nueva escuela */}
                    <button
                        onClick={() => setSelected('create')}
                        className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${selected === 'create'
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-start">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${selected === 'create' ? 'bg-blue-500' : 'bg-gray-200'
                                }`}>
                                <School className={`w-6 h-6 ${selected === 'create' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Registrar una nueva escuela
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Crea el perfil de tu escuela y sé el primero en registrarla
                                </p>
                            </div>
                            <div className="ml-4">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === 'create'
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                    }`}>
                                    {selected === 'create' && (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!selected || (selected === 'join' && !selectedSchool)}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${selected && (selected === 'create' || selectedSchool)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Continuar
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Sistema de Planeación Didáctica • MCCEMS 2024
                    </p>
                </div>
            </div>
        </div>
    );
};
