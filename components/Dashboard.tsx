
import React from 'react';
import { Plus, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { AppView } from '../types';
import { seedAlumnos } from '../src/studentsSeeder';

interface DashboardProps {
  setView: (view: AppView) => void;
  recentPlansCount: number;
}

import PlanFactibleWeb from './PlanFactibleWeb';

// ... inside component ...
const Dashboard: React.FC<DashboardProps> = ({ setView, recentPlansCount }) => {
  const [showPlanFactible, setShowPlanFactible] = React.useState(false);

  if (showPlanFactible) {
    return <PlanFactibleWeb onClose={() => setShowPlanFactible(false)} diagnostico={null} />;
  }

  return (
    <div className="space-y-8">

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Ahorra horas administrativas</h2>
          <p className="text-indigo-100 max-w-md">
            Genera planeaciones didácticas alineadas al MCCEMS en segundos. Solo indica qué quieres hacer en clase y nosotros nos encargamos del formato SEP.
          </p>
          <button
            onClick={() => setView('generator')}
            className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Empezar Planeación
          </button>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{recentPlansCount}</div>
          <div className="text-sm text-slate-500 font-medium">Planes Generados</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-slate-800">100%</div>
          <div className="text-sm text-slate-500 font-medium">Alineado a la SEP</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center text-amber-600 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-slate-800">4.0</div>
          <div className="text-sm text-slate-500 font-medium">Versión MCCEMS 2024</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setView('context')}
            className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="font-semibold text-slate-800">Actualizar Contexto Escolar</div>
            <div className="text-sm text-slate-500">Define tu escuela, comunidad y metas directivas.</div>
          </button>
          <button
            onClick={() => setView('plans')}
            className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="font-semibold text-slate-800">Revisar Historial</div>
            <div className="text-sm text-slate-500">Accede a tus planeaciones anteriores para reutilizarlas.</div>
          </button>

          {/* ... inside component ... */}
          <button
            onClick={async () => {
              if (confirm('¿Generar 60 alumnos ficticios para pruebas de contexto?')) {
                await seedAlumnos(60);
                alert("¡Alumnos generados! Ahora al planear, la IA detectará este contexto.");
              }
            }}
            className="p-4 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left group"
          >
            <div className="font-semibold text-slate-800 group-hover:text-emerald-700">Generar Alumnos Demo</div>
            <div className="text-sm text-slate-500">Puebla la base de datos con 60 estudiantes para pruebas.</div>
          </button>

          <button
            onClick={() => setShowPlanFactible(true)}
            className="p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
          >
            <div className="font-semibold text-slate-800">Ver Plan Factible (Web)</div>
            <div className="text-sm text-slate-500">Visualiza el sitio web generado para el proyecto de Salud.</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
