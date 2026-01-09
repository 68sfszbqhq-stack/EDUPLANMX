
import React from 'react';
import { SchoolContext, SubjectContext } from '../types';
import { School, BookOpen, Target, Building2, Info } from 'lucide-react';
import MCCEMSSelector from './MCCEMSSelector';

interface ContextManagerProps {
  school: SchoolContext;
  setSchool: React.Dispatch<React.SetStateAction<SchoolContext>>;
  subject: SubjectContext;
  setSubject: React.Dispatch<React.SetStateAction<SubjectContext>>;
}

const ContextManager: React.FC<ContextManagerProps> = ({ school, setSchool, subject, setSubject }) => {
  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSchool(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSubject(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
            <School className="w-4 h-4" />
            Contexto Institucional
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Identidad de la Escuela</h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> Nombre del Plantel
              </label>
              <input 
                name="schoolName"
                value={school.schoolName}
                onChange={handleSchoolChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ej. Bachillerato Gral. Oficial Emiliano Zapata"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" /> Infraestructura
              </label>
              <input 
                name="infrastructure"
                value={school.infrastructure}
                onChange={handleSchoolChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Aulas, Proyector, Internet..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Visión de Dirección</label>
            <textarea 
              name="vision"
              value={school.vision}
              onChange={handleSchoolChange}
              rows={2}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="¿Qué busca lograr la dirección?"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
            <BookOpen className="w-4 h-4" />
            Marco Curricular Común (MCCEMS)
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Vinculación con Normativa SEP</h3>
        </div>
        <div className="p-8 space-y-8">
          {/* Nuevo Selector Automático */}
          <MCCEMSSelector subject={subject} setSubject={setSubject} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Materia / UAC</label>
              <input 
                name="subjectName"
                value={subject.subjectName}
                onChange={handleSubjectChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                placeholder="Seleccionado automáticamente..."
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoría MCCEMS</label>
              <input 
                name="mccemsCategory"
                value={subject.mccemsCategory}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 capitalize"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Contenidos Adicionales de la Escuela
              <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">Opcional</span>
            </label>
            <textarea 
              name="curriculumContent"
              value={subject.curriculumContent}
              onChange={handleSubjectChange}
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-[11px]"
              placeholder="Pega aquí progresiones específicas si no usas las del selector..."
            />
          </div>
        </div>
      </section>
      
      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
        <div className="bg-amber-500 text-white rounded-xl p-2 mt-0.5 shadow-sm">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Información Importante</h4>
          <p className="text-xs text-amber-800 leading-relaxed mt-1">
            Al seleccionar una UAC arriba, la IA consultará automáticamente los documentos base del MCCEMS (2022-2024), las Progresiones de Aprendizaje y las Líneas de Política Pública de la SEP. Esto garantiza que tus planeaciones sean técnica y legalmente válidas para auditorías de supervisión.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContextManager;
