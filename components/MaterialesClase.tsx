import React from 'react';
import type { LessonPlan } from '../types';
export function MaterialesClase({plan}: {plan: LessonPlan}) {
  const instrumento = plan.assessmentInstrument;
  return <div className="space-y-5 my-5 text-sm">
    {instrumento && <section aria-label="Matriz del instrumento" className="border rounded p-3">
      <h3 className="font-bold mb-2">{instrumento.name}</h3><p className="whitespace-pre-wrap">{instrumento.instructions}</p>
      <div className="overflow-x-auto mt-3"><table className="w-full border-collapse text-xs"><thead><tr>{['Criterio',...instrumento.columns].map((t,i)=><th className="border p-2 text-left bg-slate-100" key={i}>{t}</th>)}</tr></thead>
      <tbody>{instrumento.rows.map((fila,i)=><tr key={i}><th className="border p-2 text-left">{fila.criterion}</th>{fila.descriptors.map((d,j)=><td className="border p-2 align-top" key={j}>{d}</td>)}</tr>)}</tbody></table></div>
      <p className="mt-3 whitespace-pre-wrap">{instrumento.scoring}</p>
    </section>}
    {plan.teachingKit?.length ? <section aria-label="Materiales para esta clase"><h3 className="font-bold text-base mb-3">Materiales para esta clase</h3>
      {plan.teachingKit.map((m,i)=><article key={i} className="border rounded p-4 mb-4">
        <h4 className="font-bold">{m.title}</h4><p className="font-medium">{m.sessionNumber ? `Sesión ${m.sessionNumber}` : 'Sesión por asignar'} · {m.delivery || 'Acordar momento de entrega'}</p><p className="text-slate-600 my-2">Preparación: {m.preparation}</p>
        <div className="whitespace-pre-wrap py-3 border-y">{m.content}</div>
        {m.questions?.map((q,j)=><div key={j} className="my-3"><p className="font-medium">{q.prompt}</p><div aria-label="Espacio de respuesta" className="border-b border-slate-300" style={{minHeight: `${Math.min(12,Math.max(2,q.lines || 6))*1.7}em`}} /></div>)}
        <h5 className="font-semibold mt-3">Guía del docente</h5><p className="whitespace-pre-wrap">{m.teacherNotes}</p>
      </article>)}
    </section> : <p className="text-amber-800">Esta planeación no incluye anexos desarrollados. Prepara los materiales antes de usarla.</p>}
  </div>;
}
