import React, { useMemo } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, BookOpen } from 'lucide-react';
import type { LessonPlan } from '../types';
import { programasSEPService } from '../src/services/programasSEPService';
import { auditarPlaneacion, GRUPOS, AuditGroup } from '../src/features/planeacion/auditoriaPedagogica';

export const PedagogicalAuditor: React.FC<{ plan: LessonPlan }> = ({ plan }) => {
    const auditoria = useMemo(() => auditarPlaneacion(plan,
        plan.curricularSource ? programasSEPService.buscarPorMateria(plan.curricularSource.subject) : []
    ), [plan]);
    const { results, referencia, detectados, pendientes, noEvaluables, noAplican } = auditoria;
    const fuente = plan.curricularSource;
    const enlace = fuente?.url && /^https?:\/\//i.test(fuente.url) ? fuente.url : undefined;

    return (
        <section aria-label="Revisión orientativa" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    <h3 className="font-bold text-slate-800">Revisa antes de usar</h3>
                </div>
                <p className="text-sm text-slate-600 mt-2">Esta revisión detecta elementos en el texto. No valida la calidad de la clase ni el cumplimiento ante supervisión.</p>
                <p className="text-sm font-semibold text-slate-700 mt-3">
                    {detectados} elementos detectados · {pendientes} por revisar · {noEvaluables} no evaluables{noAplican > 0 ? ` · ${noAplican} no aplica` : ''}
                </p>
                <p className="text-xs text-slate-600 mt-1">Comprueba que las actividades, los materiales y la evaluación sean adecuados para tu grupo.</p>
            </div>

            <div className="p-5 border-b border-slate-100 text-sm space-y-2">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4" />Fuente de esta planeación</h4>
                {fuente ? <p>{fuente.subject} · Modelo {fuente.model} · Generación {fuente.generation}{fuente.semester != null ? ` · Semestre ${fuente.semester}` : ''}</p> : <p>Fuente no registrada en esta planeación.</p>}
                {referencia.programa ? <p className="text-slate-600">Se compara el texto de la progresión con esta fuente. La coincidencia no acredita alineación de las actividades.</p> : <p className="text-amber-800"><strong>Cotejo curricular no evaluable.</strong> {referencia.motivo}</p>}
                {enlace && <a className="text-indigo-700 underline" href={enlace} target="_blank" rel="noopener noreferrer">Consultar fuente registrada</a>}
            </div>

            <details className="p-5">
                <summary className="cursor-pointer font-semibold text-slate-800">Ver observaciones ({pendientes + noEvaluables}) y elementos detectados</summary>
                <p className="text-xs text-slate-500 mt-3">Las búsquedas por palabras pueden omitir o interpretar mal un elemento. Revisa el contenido antes de cambiarlo.</p>
                <div className="mt-4 space-y-5">
                    {(Object.keys(GRUPOS) as AuditGroup[]).map(g => {
                        const items = results.filter(r => r.group === g);
                        return <div key={g}>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">{GRUPOS[g].titulo}</h4>
                            <div className="space-y-2">{[...items].sort((a, b) => Number(a.status === 'pass') - Number(b.status === 'pass')).map(item => (
                                <div key={item.id} className="flex items-start gap-2 text-sm p-2 bg-slate-50 rounded-lg">
                                    {item.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-1" /> : (item.status === 'unavailable' || item.status === 'notapplicable') ? <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-1" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-1" />}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-700">{item.label} <span className="font-normal text-xs">· {item.status === 'pass' ? 'Detectado' : item.status === 'notapplicable' ? 'No aplica' : item.status === 'unavailable' ? 'No evaluable' : 'Por revisar'}</span></p>
                                        <p className="text-slate-600">{item.message}</p>
                                        {item.fix && <p className="text-indigo-700 text-xs mt-1">{item.fix}</p>}
                                    </div>
                                </div>
                            ))}</div>
                        </div>;
                    })}
                </div>
            </details>
        </section>
    );
};
