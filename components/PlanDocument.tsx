import React from 'react';
import { LessonPlan } from '../types';

interface PlanDocumentProps {
    plan: LessonPlan;
    teacherName?: string;
    schoolName?: string;
    cct?: string;
}

const PlanDocument = React.forwardRef<HTMLElement, PlanDocumentProps>(({ plan, teacherName, schoolName, cct }, ref) => {
    return (
        <article ref={ref} className="bg-white border border-slate-200 shadow-2xl rounded-none md:rounded-3xl p-10 print:p-0 print:border-none print:shadow-none font-serif text-sm print:w-full print:m-0 max-w-[216mm] mx-auto">

            {/* Encabezado con Logos de Puebla */}
            <div className="flex justify-start items-center gap-6 mb-6 border-b-2 border-slate-900 pb-4">
                <img
                    src="/assets/logo_puebla_gob.png"
                    alt="Puebla Gobierno del Estado - Educación"
                    className="h-16 w-auto object-contain"
                />
                <img
                    src="/assets/logo_puebla_amor.png"
                    alt="Por Amor a Puebla - Pensar en Grande"
                    className="h-12 w-auto object-contain"
                />
            </div>

            {/* 1. DATOS GENERALES */}
            <div className="mb-6 border border-slate-900 rounded-sm">
                <div className="bg-slate-800 text-white px-3 py-1 border-b border-slate-900 font-bold text-xs uppercase text-center print:bg-slate-900 print:text-white">
                    I. Datos Generales de Identificación
                </div>
                <div className="grid grid-cols-4 text-xs divide-x divide-slate-300 border-b border-slate-300">
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">Plantel</span>
                        <span className="font-bold text-slate-900">{schoolName || 'Escuela'}</span>
                    </div>
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">C.C.T.</span>
                        <span className="font-bold text-slate-900">{cct || 'NO CAPTURADA'}</span>
                    </div>
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">Docente</span>
                        <span className="font-bold text-slate-900">{teacherName || plan.meta?.teacher}</span>
                    </div>
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">Ciclo Escolar</span>
                        <span className="font-bold text-slate-900">{plan.meta?.cycle || '2024-2025'}</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 text-xs divide-x divide-slate-300">
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">UAC (Unidad de Aprendizaje)</span>
                        <span className="font-bold text-slate-900 bg-yellow-50 px-1">{plan.subject}</span>
                    </div>
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">Grupo / Semestre</span>
                        <span className="font-bold text-slate-900">{plan.meta?.gradeGroup}</span>
                    </div>
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">Metodología Activa</span>
                        <span className="font-bold text-slate-900 bg-orange-50 px-1">{plan.meta?.methodology || 'No definida'}</span>
                    </div>
                    <div className="p-2">
                        <span className="block font-bold text-slate-500 uppercase text-[9px]">Periodo de Trabajo</span>
                        <span className="font-bold text-slate-900">
                            {plan.meta?.startDate || 'Inicio'} - {plan.meta?.endDate || 'Fin'}
                            <span className="text-slate-500 font-normal ml-1">({plan.meta?.hoursPerWeek || 4} hrs/sem)</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. ELEMENTOS CURRICULARES */}
            <div className="mb-6 border border-slate-900 rounded-sm">
                <div className="bg-slate-100 px-3 py-1 border-b border-slate-300 font-bold text-xs uppercase print:bg-slate-200">
                    II. Elementos del Marco Curricular Común
                </div>
                <div className="p-3 space-y-4">

                    {/* Progresión */}
                    <div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                                {plan.curricularElements?.progressionId || 'Progresión'}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Descripción de la Progresión:</span>
                        </div>
                        <p className="text-xs text-slate-900 italic bg-slate-50 p-2 border border-slate-200 rounded text-justify">
                            "{plan.curricularElements?.progression || plan.progression}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Categorías */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 border-b border-slate-200">Categorías (Conceptos Centrales)</p>
                            <ul className="list-disc list-inside text-xs text-slate-800">
                                {plan.curricularElements?.categories?.map((cat, i) => (
                                    <li key={i}>{cat}</li>
                                )) || <li className="text-red-500">Sin categorías definidas</li>}
                            </ul>
                        </div>
                        {/* Subcategorías */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 border-b border-slate-200">Subcategorías (Conceptos Transversales)</p>
                            <ul className="list-disc list-inside text-xs text-slate-800">
                                {plan.curricularElements?.subcategories?.map((sub, i) => (
                                    <li key={i}>{sub}</li>
                                )) || <li>Se aborda de forma integradora.</li>}
                            </ul>
                        </div>
                    </div>

                    {/* Metas de Aprendizaje */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Metas de Aprendizaje:</p>
                        <div className="flex flex-wrap gap-1">
                            {plan.curricularElements?.learningGoals.map((goal, i) => (
                                <span key={i} className="bg-indigo-50 text-indigo-800 text-[10px] px-2 py-1 rounded border border-indigo-100">
                                    {goal}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* 3. VINCULACIÓN PAEC */}
                <div className="border border-slate-300 rounded-sm p-3 bg-white">
                    <div className="font-bold text-xs uppercase text-slate-700 mb-2 border-b border-slate-200 pb-1 flex justify-between">
                        III. Vinculación PAEC
                        {plan.paec?.isLinked ?
                            <span className="text-green-600">✅ Aplica</span> :
                            <span className="text-slate-400">⚪ No aplica</span>
                        }
                    </div>
                    {plan.paec?.isLinked ? (
                        <div className="space-y-2 text-xs">
                            <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Problemática Comunitaria:</span>
                                {plan.paec.communityProblem}
                            </div>
                            <div>
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Proyecto / Acción:</span>
                                {plan.paec.projectTrigger}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No se vincula directamente con un proyecto comunitario en esta sesión.</p>
                    )}
                </div>

                {/* 4. CONTEXTO Y DIAGNÓSTICO */}
                <div className="border border-slate-300 rounded-sm p-3 bg-white">
                    <div className="font-bold text-xs uppercase text-slate-700 mb-2 border-b border-slate-200 pb-1">
                        IV. Diagnóstico del Grupo
                    </div>
                    <p className="text-xs text-slate-800 text-justify line-clamp-6">
                        {plan.context?.studentProfile || plan.context?.diagnosis || 'Sin diagnóstico registrado.'}
                    </p>
                </div>
            </div>

            {/* 5. FUNDAMENTACIÓN Y SOCIOEMOCIONAL (DESGLOSE 2024) */}
            <div className="mb-6 border border-slate-300 rounded-sm">
                <div className="bg-slate-100 px-3 py-1 border-b border-slate-300 font-bold text-xs uppercase print:bg-slate-200">
                    V. Fundamentación y Ámbito Socioemocional
                </div>
                <div className="p-3 text-xs space-y-3">

                    {/* Nueva Tabla Socioemocional */}
                    <div className="border border-indigo-100 bg-indigo-50/50 rounded p-2 mb-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block font-bold text-indigo-900 text-[9px] uppercase">Ámbito Socioemocional</span>
                                <p className="text-indigo-800">{plan.fundamento?.socioemotionalScope || 'Bienestar socioemocional general'}</p>
                            </div>
                            <div>
                                <span className="block font-bold text-indigo-900 text-[9px] uppercase">Meta Socioemocional</span>
                                <p className="text-indigo-800">{plan.fundamento?.socioemotionalMeta || 'Fomentar la autorregulación.'}</p>
                            </div>
                            <div className="col-span-2 border-t border-indigo-200 pt-1">
                                <span className="block font-bold text-indigo-900 text-[9px] uppercase">Contenidos Formativos (Socioemocional)</span>
                                <p className="text-indigo-800 italic">{plan.fundamento?.socioemotionalContent || plan.fundamento?.socioemotionalLink}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="block font-bold text-slate-600 text-[10px] uppercase">Justificación Didáctica</span>
                            <p className="text-justify">{plan.fundamento?.progressionJustification || plan.duaStrategies}</p>
                        </div>
                        <div>
                            <span className="block font-bold text-slate-600 text-[10px] uppercase">Transversalidad</span>
                            <p className="italic text-slate-700">{plan.fundamento?.transversalityLink}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. SECUENCIA DIDÁCTICA */}
            <div className="mb-6">
                <div className="bg-slate-900 text-white px-3 py-2 font-bold text-sm uppercase text-center print:bg-slate-900 rounded-t-sm">
                    VI. Secuencia Didáctica
                </div>
                <div className="border border-slate-900 border-t-0 p-0">
                    {plan.sessions?.map((session, index) => (
                        <div key={index} className="avoid-break border-b border-slate-400 last:border-b-0">
                            <div className="bg-slate-100 p-2 text-xs font-bold border-b border-slate-300 flex justify-between print:bg-slate-200">
                                <span>SESIÓN {session.sessionNumber}: {session.topic}</span>
                                <span>{session.date}</span>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-300 bg-slate-50 text-[10px] uppercase text-slate-500">
                                        <th className="p-2 w-[10%]">Fase / Tiempo</th>
                                        <th className="p-2 w-[35%]">Actividad Docente (Enseñanza)</th>
                                        <th className="p-2 w-[35%]">Actividad Estudiante (Aprendizaje)</th>
                                        <th className="p-2 w-[20%]">Evaluación / Evidencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    <tr className="align-top">
                                        <td className="p-2 font-bold bg-slate-50/50">Inicio <br /><span className="font-normal text-slate-500">{session.sequence.opening.time}</span></td>
                                        <td className="p-2">{session.sequence.opening.activity}</td>
                                        <td className="p-2">{session.sequence.opening.studentActivity}</td>
                                        <td className="p-2 italic">{session.sequence.opening.evidence}</td>
                                    </tr>
                                    <tr className="align-top bg-white">
                                        <td className="p-2 font-bold bg-slate-50/50">Desarrollo <br /><span className="font-normal text-slate-500">{session.sequence.development.time}</span></td>
                                        <td className="p-2">{session.sequence.development.activity}</td>
                                        <td className="p-2">{session.sequence.development.studentActivity}</td>
                                        <td className="p-2 italic">{session.sequence.development.evidence}</td>
                                    </tr>
                                    <tr className="align-top">
                                        <td className="p-2 font-bold bg-slate-50/50">Cierre <br /><span className="font-normal text-slate-500">{session.sequence.closing.time}</span></td>
                                        <td className="p-2">{session.sequence.closing.activity}</td>
                                        <td className="p-2">{session.sequence.closing.studentActivity}</td>
                                        <td className="p-2 italic">{session.sequence.closing.evidence}</td>
                                    </tr>
                                </tbody>
                            </table>
                            {/* Recursos de la sesión */}
                            <div className="p-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500">
                                <span className="font-bold uppercase mr-2">Recursos:</span>
                                {session.resources.join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7. ESTUDIO INDEPENDIENTE */}
            <div className="mb-6 border border-slate-500 rounded-sm bg-white avoid-break">
                <div className="bg-slate-700 text-white px-3 py-1 border-b border-slate-500 font-bold text-xs uppercase print:bg-slate-800">
                    VII. Estudio Independiente
                </div>
                <div className="p-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <span className="block font-bold text-slate-600 text-[10px] uppercase">Actividades Autónomas</span>
                        <p>{plan.independentStudy?.activities || 'Repaso y organización de apuntes.'}</p>
                    </div>
                    <div>
                        <span className="block font-bold text-slate-600 text-[10px] uppercase">Tiempo Estimado</span>
                        <p>{plan.independentStudy?.estimatedTime || '60 min semana'}</p>
                    </div>
                    <div className="md:col-span-3 border-t border-slate-200 pt-2 mt-1">
                        <span className="block font-bold text-slate-600 text-[10px] uppercase">Estrategia de Retroalimentación</span>
                        <p className="italic text-slate-700">{plan.independentStudy?.feedbackLink || 'Revisión en la siguiente clase mediante preguntas aleatorias.'}</p>
                    </div>
                </div>
            </div>

            {/* 8. EVALUACIÓN Y ACREDITACIÓN */}
            {plan.evaluationTable && plan.evaluationTable.length > 0 && (
                <div className="mb-6 border border-slate-500 rounded-sm avoid-break">
                    <div className="bg-slate-700 text-white px-3 py-2 border-b border-slate-500 font-bold text-sm uppercase text-center print:bg-slate-800 print:text-white">
                        VIII. Plan de Evaluación y Acreditación
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 print:bg-slate-200">
                                <th className="p-3 border-r border-slate-300 w-[25%] font-bold uppercase text-[10px]">Instrumento / Evidencia</th>
                                <th className="p-3 border-r border-slate-300 w-[10%] text-center font-bold uppercase text-[10px]">Valor</th>
                                <th className="p-3 border-r border-slate-300 w-[15%] font-bold uppercase text-[10px]">Agente</th>
                                <th className="p-3 w-[50%] font-bold uppercase text-[10px]">Criterio Específico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                            {plan.evaluationTable.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-300">
                                    <td className="p-3 border-r border-slate-300 font-bold text-slate-900">{item.instrument}</td>
                                    <td className="p-3 border-r border-slate-300 text-center font-bold">{item.percentage}%</td>
                                    <td className="p-3 border-r border-slate-300 text-slate-700">{item.agent}</td>
                                    <td className="p-3 text-slate-700 align-top">
                                        {item.criteria}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                                <td className="p-3 border-r border-slate-300 text-right uppercase text-[10px]">Total Acumulado</td>
                                <td className="p-3 border-r border-slate-300 text-center">
                                    {plan.evaluationTable.reduce((sum, i) => sum + i.percentage, 0)}%
                                </td>
                                <td colSpan={2} className="p-3 bg-slate-50 text-[10px] font-normal italic text-slate-500">
                                    * La evaluación formativa es continua y sistemática.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* 9. REFLEXIÓN DOCENTE (ESPACIO PARA LLENAR) */}
            <div className="mb-6 border border-slate-400 border-dashed rounded-sm p-4 bg-slate-50/50 avoid-break print:block hidden">
                <div className="font-bold text-xs uppercase text-slate-500 mb-4 text-center">
                    IX. Retroalimentación de la Práctica Docente (A llenar al finalizar la unidad)
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase mb-6 border-b border-slate-300">Fortalezas / Lo que funcionó</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase mb-6 border-b border-slate-300">Áreas de Oportunidad / Lo que no funcionó</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase mb-6 border-b border-slate-300">Ajustes para futuras planeaciones</p>
                        <p className="text-[10px] text-slate-400 uppercase mb-6 border-b border-slate-300 pt-8">Firma del Docente</p>
                    </div>
                </div>
            </div>

            {/* VALIDACIÓN */}
            <div className="mt-12 flex justify-between items-end pt-8 border-t border-slate-200 gap-4">
                <div className="text-center w-1/4">
                    <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                        <p className="font-bold text-slate-900 uppercase text-xs">{teacherName || plan.meta?.teacher}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Elaboró</p>
                    </div>
                </div>
                <div className="text-center w-1/4">
                    <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                        <p className="font-bold text-slate-900 uppercase text-xs">Jefe Disciplinar</p>
                        <p className="text-[10px] text-slate-500 uppercase">Revisó</p>
                    </div>
                </div>
                <div className="text-center w-1/4">
                    <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                        <p className="font-bold text-slate-900 uppercase text-xs">Coordinación</p>
                        <p className="text-[10px] text-slate-500 uppercase">Autoriza</p>
                    </div>
                </div>
                <div className="text-center w-1/4">
                    <div className="border-t border-slate-400 w-3/4 mx-auto pt-2">
                        <p className="font-bold text-slate-900 uppercase text-xs">Director(a)</p>
                        <p className="text-[10px] text-slate-500 uppercase">Visto Bueno</p>
                    </div>
                </div>
            </div>

        </article>
    );
});

export default PlanDocument;


