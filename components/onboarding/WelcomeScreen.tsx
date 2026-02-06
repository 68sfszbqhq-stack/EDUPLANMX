import React, { useState } from 'react';
import { School, GraduationCap, Users, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
    userName: string;
    onChoice: (choice: 'join' | 'create') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onChoice }) => {
    const [selected, setSelected] = useState<'join' | 'create' | null>(null);

    const handleContinue = () => {
        if (selected) {
            onChoice(selected);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
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
                                    Únete a tu escuela usando el código de acceso o buscándola por nombre
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
                    disabled={!selected}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${selected
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
