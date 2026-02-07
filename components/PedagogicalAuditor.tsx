import React, { useMemo } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Target, BookOpen } from 'lucide-react';
import { LessonPlan } from '../types';
import { programasSEPService } from '../src/services/programasSEPService';

interface PedagogicalAuditorProps {
    plan: LessonPlan;
    subjectName: string;
    semestre?: number;
}

interface AuditItem {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    details?: string;
}

export const PedagogicalAuditor: React.FC<PedagogicalAuditorProps> = ({ plan, subjectName, semestre }) => {

    const auditResults = useMemo(() => {
        const results: AuditItem[] = [];
        let score = 0;
        let maxScore = 0;

        const addCheck = (label: string, condition: boolean, successMsg: string, failMsg: string, isCritical = false) => {
            maxScore += isCritical ? 20 : 10;
            if (condition) {
                score += isCritical ? 20 : 10;
                results.push({ id: label, label, status: 'pass', message: successMsg });
            } else {
                results.push({ id: label, label, status: isCritical ? 'fail' : 'warning', message: failMsg });
            }
        };

        // 1. Verificación de Progresión Oficial
        const programas = programasSEPService.buscarPorMateria(subjectName);
        const programaOficial = programas.find(p => !semestre || p.semestre === semestre) || programas[0];

        const hasProgression = !!plan.progression;
        let isOfficialProgression = false;
        let progressionId = 'No identificado';

        if (programaOficial && hasProgression) {
            const match = programaOficial.progresiones.find(p =>
                plan.progression.includes(p.descripcion.substring(0, 50)) ||
                p.descripcion.includes(plan.progression.substring(0, 50))
            );
            if (match) {
                isOfficialProgression = true;
                progressionId = match.id.toString();
            }
        }

        addCheck(
            'Alineación de Progresión',
            isOfficialProgression,
            `Progresión oficial detectada (ID: ${progressionId})`,
            programaOficial ? 'La progresión no coincide exactamente con el catálogo oficial' : 'No se encontró programa oficial para validar',
            true
        );

        // 2. Elementos Estructurales Obligatorios (NEM)
        addCheck('Vinculación PAEC', !!plan.paec?.isLinked && !!plan.paec.communityProblem, 'Problemática comunitaria definida', 'Falta definir la problemática PAEC', true);
        addCheck('Evaluación Formativa', !!plan.evaluationTable && plan.evaluationTable.length > 0, 'Tabla de evaluación presente', 'No se detectaron criterios de evaluación');
        addCheck('Recursos Didácticos', !!plan.resources && plan.resources.length > 0, 'Recursos listados', 'Falta lista de recursos');
        addCheck('Actividades de Aprendizaje', (!!plan.sessions && plan.sessions.length > 0) || !!plan.sequence, 'Secuencia didáctica completa', 'Secuencia didáctica incompleta', true);

        // 3. Verificación de Tiempos (La regla de oro de 50 min)
        // Esto es un estimado basado en los metadatos, ya que no parseamos el texto de tiempos por actividad aun
        const totalTimeCheck = plan.meta?.hoursPerWeek ? true : false;
        addCheck('Marco Temporal', totalTimeCheck, 'Tiempos definidos en metadatos', 'Faltan metadatos de tiempo');

        const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        return { results, finalScore, programaOficial };
    }, [plan, subjectName, semestre]);

    const { results, finalScore, programaOficial } = auditResults;

    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (s >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Auditoría Pedagógica MCCEMS</h3>
                        <p className="text-xs text-slate-500">Validación de alineación con la Nueva Escuela Mexicana</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-bold text-xl flex items-center gap-2 ${getScoreColor(finalScore)}`}>
                    <span>{finalScore}%</span>
                    <span className="text-xs font-normal uppercase tracking-wider opacity-80">Cumplimiento</span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resultados del Análisis</h4>
                    {results.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            {item.status === 'pass' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                            {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                            {item.status === 'fail' && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                            <div>
                                <p className="font-semibold text-slate-700 text-sm">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                    <h4 className="text-indigo-800 font-bold mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Referencia Oficial Utilizada
                    </h4>
                    {programaOficial ? (
                        <div className="space-y-3 text-sm text-indigo-900/80">
                            <p><span className="font-semibold">Programa:</span> {programaOficial.materia}</p>
                            <p><span className="font-semibold">Semestre:</span> {programaOficial.semestre}</p>
                            <p><span className="font-semibold">Categorías MCC:</span> {programaOficial.organizador_curricular?.categorias?.join(', ') || 'No definidas'}</p>
                            <div className="pt-2 border-t border-indigo-200 mt-2">
                                <p className="text-xs text-indigo-700">
                                    Este auditor verifica que los contenidos generados correspondan con el programa oficial vigente de la SEP (2023-2024).
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-amber-700 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            No se encontró el programa oficial en la base de datos local para comparar.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
