import React, { useState } from 'react';
import { GraduationCap, KeyRound, ArrowRight, Search, PlusCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { schoolService } from '../../src/services/schoolService';

interface WelcomeScreenProps {
    userName: string;
    onChoice: (choice: 'join' | 'create') => void;
    onSchoolSelected?: (schoolId: string, schoolName: string) => void;
}

interface EscuelaEncontrada {
    id: string;
    nombre: string;
    municipio?: string;
    turno?: string;
}

/**
 * Pantalla de bienvenida CÓDIGO-PRIMERO:
 * El camino feliz es escribir el código de la escuela (o su CCT) y listo.
 * Buscar por nombre o registrar escuela nueva quedan como opciones secundarias.
 * Nota Spark: esto cuesta 1-2 lecturas de Firestore, contra las ~50 de descargar
 * la lista completa de escuelas que hacía la versión anterior.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onChoice, onSchoolSelected }) => {
    const [codigo, setCodigo] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState('');
    const [escuela, setEscuela] = useState<EscuelaEncontrada | null>(null);

    const handleBuscar = async () => {
        const clave = codigo.trim().toUpperCase();
        if (!clave) return;

        setBuscando(true);
        setError('');
        setEscuela(null);

        try {
            // 1º intento: código de acceso; 2º intento: CCT completo
            // (el CCT viene impreso en cualquier documento oficial de la escuela)
            let found = await schoolService.getSchoolByCode(clave);
            if (!found) {
                found = await schoolService.getSchoolByCCT(clave);
            }

            if (found) {
                setEscuela({
                    id: found.id,
                    nombre: found.nombre,
                    municipio: found.municipio,
                    turno: found.turno
                });
            } else {
                setError('No encontramos una escuela con esa clave. Verifica el código con tu director, o usa las opciones de abajo.');
            }
        } catch (e) {
            console.error('Error buscando escuela:', e);
            setError('Hubo un problema al buscar. Revisa tu conexión e intenta de nuevo.');
        } finally {
            setBuscando(false);
        }
    };

    const handleConfirmar = () => {
        if (escuela && onSchoolSelected) {
            onSchoolSelected(escuela.id, escuela.nombre);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        ¡Bienvenido a EduPlan MX!
                    </h1>
                    <p className="text-gray-600">
                        Hola, <span className="font-semibold text-blue-600">{userName}</span>. Solo falta conectarte con tu escuela.
                    </p>
                </div>

                {/* Camino principal: código de escuela */}
                <div className="mb-6">
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-blue-500" />
                        Escribe el código de tu escuela (o su CCT)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => { setCodigo(e.target.value); setError(''); setEscuela(null); }}
                            onKeyDown={(e) => e.key === 'Enter' && !buscando && handleBuscar()}
                            placeholder="Ej. 21EBH0026G"
                            autoFocus
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg uppercase tracking-wider"
                        />
                        <button
                            onClick={handleBuscar}
                            disabled={buscando || !codigo.trim()}
                            className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${buscando || !codigo.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {buscando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            Buscar
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Pídeselo a tu director(a). El CCT aparece en cualquier documento oficial de tu plantel.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800">
                        {error}
                    </div>
                )}

                {/* Escuela encontrada: confirmación */}
                {escuela && (
                    <div className="mb-6 p-5 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                        <div className="flex items-start gap-3 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-gray-900">{escuela.nombre}</p>
                                <p className="text-sm text-gray-600">
                                    {[escuela.municipio, escuela.turno && `Turno ${escuela.turno}`].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleConfirmar}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 transition-all"
                        >
                            Sí, esta es mi escuela — Continuar
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Opciones secundarias */}
                <div className="border-t border-gray-200 pt-5 space-y-2">
                    <button
                        onClick={() => onChoice('join')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>No tengo código: <span className="font-semibold text-blue-600">buscar mi escuela por nombre</span></span>
                    </button>
                    <button
                        onClick={() => onChoice('create')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <PlusCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Soy director(a) y mi escuela no está registrada: <span className="font-semibold text-blue-600">registrarla</span></span>
                    </button>
                </div>
            </div>
        </div>
    );
};
