import React, { useState } from 'react';
import { UserCheck, ChevronDown, Bot, CheckCircle2 } from 'lucide-react';
import { LessonPlan } from '../types';

interface RevisionDocenteProps {
    plan: LessonPlan;
    /** Se dispara al confirmar la revisión: devuelve el plan con aiTrace actualizado. */
    onConfirm: (ajustes: string) => void;
}

// Preguntas de lectura crítica del "Paso 3" de las Fichas 16 y 34:
// el docente lee sin copiar de inmediato y decide qué ajustar.
const PREGUNTAS_LECTURA_CRITICA = [
    '¿Esta estrategia se podría aplicar tal como está en mi grupo real?',
    '¿Hay lenguaje poco contextualizado o ejemplos ajenos a mi comunidad?',
    '¿Alguna actividad no se ajusta al tiempo, al espacio o a los recursos que sí tengo?',
    '¿El enfoque socioemocional y el sentido social están realmente presentes?',
];

export const RevisionDocente: React.FC<RevisionDocenteProps> = ({ plan, onConfirm }) => {
    const yaRevisado = Boolean(plan.aiTrace?.reviewedByTeacher);
    const [ajustes, setAjustes] = useState(plan.aiTrace?.teacherAdjustments || '');
    const [mostrarPrompt, setMostrarPrompt] = useState(false);

    if (yaRevisado) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 no-print">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="font-bold text-emerald-900 text-sm">Revisión docente registrada</p>
                        <p className="text-xs text-emerald-700">
                            {plan.aiTrace?.teacherAdjustments?.trim()
                                ? <>Ajustes declarados: <span className="italic">"{plan.aiTrace.teacherAdjustments}"</span></>
                                : 'Revisaste la propuesta y la validaste sin cambios.'}
                        </p>
                        <p className="text-[11px] text-emerald-600 mt-1">
                            El prompt utilizado y tu revisión quedan guardados como evidencia del criterio pedagógico docente.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 no-print">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                    <UserCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900">Revisión docente (obligatoria antes de entregar)</h3>
                    <p className="text-xs text-amber-700">
                        "La IA se utiliza como herramienta de apoyo, no como sustituto del juicio pedagógico" — Ficha 34
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-amber-200 p-4 mb-3">
                <p className="text-xs font-bold text-slate-700 mb-2">Lectura crítica: revisa antes de aceptar</p>
                <ul className="space-y-1.5">
                    {PREGUNTAS_LECTURA_CRITICA.map(p => (
                        <li key={p} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-amber-500 font-bold mt-0.5">·</span>
                            <span>{p}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <label className="text-xs font-bold text-amber-900 block mb-1.5">
                ¿Qué ajustaste o qué validaste? <span className="font-normal text-amber-700">(opcional, pero es tu evidencia ante supervisión)</span>
            </label>
            <textarea
                value={ajustes}
                onChange={e => setAjustes(e.target.value)}
                placeholder="Ej. Cambié el ejemplo de la tienda por el mercado de mi colonia; reduje la actividad 2 porque no alcanza el tiempo; agregué apoyo visual para quienes leen con dificultad."
                className="w-full p-3 rounded-xl border border-amber-200 bg-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 min-h-[80px]"
            />

            <button
                type="button"
                onClick={() => onConfirm(ajustes)}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors"
            >
                <UserCheck className="w-5 h-5" />
                Confirmo que revisé esta planeación
            </button>

            {plan.aiTrace?.prompt && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={() => setMostrarPrompt(!mostrarPrompt)}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900"
                    >
                        <Bot className="w-3.5 h-3.5" />
                        {mostrarPrompt ? 'Ocultar' : 'Ver'} el prompt que se envió a la IA
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mostrarPrompt ? 'rotate-180' : ''}`} />
                    </button>
                    {mostrarPrompt && (
                        <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-[10px] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                            {plan.aiTrace.prompt.trim()}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};
