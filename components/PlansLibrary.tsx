
import React from 'react';
import { LessonPlan } from '../types';
import { FileText, Calendar, ArrowRight, Trash2 } from 'lucide-react';

interface PlansLibraryProps {
  plans: LessonPlan[];
}

const PlansLibrary: React.FC<PlansLibraryProps> = ({ plans }) => {
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
                 {idx + 1}
               </div>
               <div>
                  <h4 className="font-bold text-slate-800">{plan.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {plan.subject}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {plan.duration}
                    </span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
               </button>
               <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                  Ver Detalle <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { BookOpen } from 'lucide-react';
export default PlansLibrary;
