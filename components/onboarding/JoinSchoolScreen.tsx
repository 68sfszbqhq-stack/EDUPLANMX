import React, { useState } from 'react';
import { Search, Building2, MapPin, Users, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { schoolService } from '../../src/services/schoolService';
import type { SchoolSearchResult } from '../../types/school';

interface JoinSchoolScreenProps {
    onBack: () => void;
    onSchoolSelected: (schoolId: string, schoolName: string) => void;
}

export const JoinSchoolScreen: React.FC<JoinSchoolScreenProps> = ({ onBack, onSchoolSelected }) => {
    const [searchMode, setSearchMode] = useState<'code' | 'name'>('code');
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SchoolSearchResult[]>([]);
    const [error, setError] = useState('');
    const [selectedSchool, setSelectedSchool] = useState<SchoolSearchResult | null>(null);

    const handleSearchByCode = async () => {
        if (!searchTerm.trim()) {
            setError('Por favor ingresa un código de acceso');
            return;
        }

        setSearching(true);
        setError('');

        try {
            const school = await schoolService.getSchoolByCode(searchTerm.trim());

            if (school) {
                setResults([{
                    id: school.id,
                    nombre: school.nombre,
                    cct: school.cct,
                    municipio: school.municipio,
                    turno: school.turno,
                    codigoAcceso: school.codigoAcceso,
                    totalDocentes: school.estadisticas.totalDocentes
                }]);
            } else {
                setError('No se encontró ninguna escuela con ese código');
                setResults([]);
            }
        } catch (err) {
            setError('Error al buscar la escuela. Intenta de nuevo.');
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchByName = async () => {
        if (!searchTerm.trim() || searchTerm.length < 3) {
            setError('Por favor ingresa al menos 3 caracteres');
            return;
        }

        setSearching(true);
        setError('');

        try {
            const schools = await schoolService.searchSchools(searchTerm.trim());

            if (schools.length > 0) {
                setResults(schools);
            } else {
                setError('No se encontraron escuelas con ese nombre');
                setResults([]);
            }
        } catch (err) {
            setError('Error al buscar escuelas. Intenta de nuevo.');
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSearch = () => {
        if (searchMode === 'code') {
            handleSearchByCode();
        } else {
            handleSearchByName();
        }
    };

    const handleSelectSchool = (school: SchoolSearchResult) => {
        setSelectedSchool(school);
    };

    const handleContinue = () => {
        if (selectedSchool) {
            onSchoolSelected(selectedSchool.id, selectedSchool.nombre);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 md:p-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Buscar tu Escuela
                    </h1>
                    <p className="text-gray-600">
                        Encuentra tu escuela para unirte a ella
                    </p>
                </div>

                {/* Search Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => {
                            setSearchMode('code');
                            setSearchTerm('');
                            setResults([]);
                            setError('');
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${searchMode === 'code'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Buscar por Código
                    </button>
                    <button
                        onClick={() => {
                            setSearchMode('name');
                            setSearchTerm('');
                            setResults([]);
                            setError('');
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${searchMode === 'name'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Buscar por Nombre
                    </button>
                </div>

                {/* Search Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {searchMode === 'code' ? 'Código de Acceso' : 'Nombre de la Escuela'}
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={searchMode === 'code' ? 'Ej: CBT001' : 'Ej: CBT No. 1 Dr. Gustavo Baz'}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {searching ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Buscar'
                            )}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Resultados ({results.length})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {results.map((school) => (
                                <button
                                    key={school.id}
                                    onClick={() => handleSelectSchool(school)}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedSchool?.id === school.id
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${selectedSchool?.id === school.id ? 'bg-blue-500' : 'bg-gray-200'
                                            }`}>
                                            <Building2 className={`w-6 h-6 ${selectedSchool?.id === school.id ? 'text-white' : 'text-gray-600'
                                                }`} />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="font-semibold text-gray-900">{school.nombre}</h4>
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <Building2 className="w-4 h-4 mr-1" />
                                                    CCT: {school.cct}
                                                </span>
                                                <span className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {school.municipio}
                                                </span>
                                                <span className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1" />
                                                    {school.totalDocentes} docentes
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    Turno {school.turno}
                                                </span>
                                                <span className="inline-block ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">
                                                    {school.codigoAcceso}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedSchool?.id === school.id
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {selectedSchool?.id === school.id && (
                                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!selectedSchool}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${selectedSchool
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Unirme a esta Escuela
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
