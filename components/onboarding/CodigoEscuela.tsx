import React, { useState } from 'react';
import { KeyRound, Loader2, ArrowRight, Clock } from 'lucide-react';
import { schoolService } from '../../src/services/schoolService';
import { auth } from '../../src/config/firebase';

/**
 * Segundo paso para unirse a una escuela: el código secreto que da la dirección.
 * Encontrar la escuela (por CCT o nombre) es público; ENTRAR no: los datos de
 * alumnos solo los ve quien trae el código o a quien un directivo aprueba.
 */
export const CodigoEscuela: React.FC<{ schoolId: string; schoolName: string; onListo: () => void }> = ({ schoolId, schoolName, onListo }) => {
    const [codigo, setCodigo] = useState('');
    const [enviando, setEnviando] = useState<'' | 'codigo' | 'solicitud'>('');
    const [error, setError] = useState('');

    const unirse = async (conCodigo: boolean) => {
        const u = auth.currentUser;
        if (!u) return setError('Tu sesión expiró. Vuelve a entrar.');
        if (conCodigo && codigo.trim().length < 8) return setError('El código tiene 8 letras y números.');
        setEnviando(conCodigo ? 'codigo' : 'solicitud'); setError('');
        try {
            await schoolService.unirseAEscuela(schoolId, { uid: u.uid, nombre: u.displayName ?? '', email: u.email ?? '' }, conCodigo ? codigo : undefined);
            onListo();
        } catch (e: any) {
            setError(e?.message === 'codigo-incorrecto'
                ? 'Ese código no corresponde a esta escuela. Revísalo con tu director(a), o pide acceso sin código.'
                : 'No se pudo completar. Revisa tu conexión e intenta de nuevo.');
        } finally { setEnviando(''); }
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-500" /> Código de acceso de {schoolName}
            </label>
            <div className="flex gap-2">
                <input value={codigo} onChange={e => { setCodigo(e.target.value.toUpperCase()); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && !enviando && unirse(true)} placeholder="8 letras y números" autoFocus maxLength={12}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg tracking-widest" />
                <button onClick={() => unirse(true)} disabled={!!enviando || !codigo.trim()}
                    className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400">
                    {enviando === 'codigo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />} Entrar
                </button>
            </div>
            <p className="text-xs text-gray-500">Te lo da tu director(a). Protege los datos de tus alumnos: solo entra el personal de la escuela.</p>
            {error && <p className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-800">{error}</p>}
            <button onClick={() => unirse(false)} disabled={!!enviando}
                className="w-full flex items-center gap-2 p-3 rounded-xl text-left text-sm text-gray-600 hover:bg-gray-50">
                {enviando === 'solicitud' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 text-gray-400" />}
                <span>No tengo el código: <span className="font-semibold text-blue-600">pedir acceso</span>. Puedes usar EduPlan desde ya; los datos de alumnos se abren cuando la dirección te apruebe.</span>
            </button>
        </div>
    );
};
