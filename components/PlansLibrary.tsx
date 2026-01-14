import React, { useState, useRef } from 'react';
import { LessonPlan } from '../types';
import { FileText, Calendar, ArrowRight, Trash2, ArrowLeft, Download, BookOpen } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PlanDocument from './PlanDocument';

interface PlansLibraryProps {
  plans: LessonPlan[];
}

const PlansLibrary: React.FC<PlansLibraryProps> = ({ plans }) => {
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPlan ? `Planeacion-${selectedPlan.subject}` : 'Planeacion',
  });

  if (plans.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <FileText className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No hay planes guardados</h3>
        <p className="text-slate-500 mt-2">Tus planeaciones generadas aparecerán aquí.</p>
      </div>
    );
  }

  // Vista de Detalle de Planeación
  if (selectedPlan) {
    return (
      <div className="animate-in fade-in duration-300 pb-20">
        <div className="flex items-center justify-between mb-6 no-print">
          <button
            onClick={() => setSelectedPlan(null)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Historial
          </button>

          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
          >
            <Download className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>

        <div className="overflow-auto border border-slate-100 rounded-3xl shadow-xl print:shadow-none print:border-none print:rounded-none">
          <PlanDocument
            ref={printRef}
            plan={selectedPlan}
            teacherName={selectedPlan.meta?.teacher}
          />
        </div>
      </div>
    );
  }

  // Vista de Lista
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-indigo-600" />
        Tu Historial Administrativo
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {plans.map((plan, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex justify-between items-center group shadow-sm hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {plans.length - idx}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{plan.title || plan.subject}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {plan.subject}
                  </span>
                  {plan.duration && (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {plan.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar (No implementado)">
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedPlan(plan)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors"
              >
                Ver Detalle <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansLibrary;
