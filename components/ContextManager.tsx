
import React from 'react';
import { SchoolContext, SubjectContext } from '../types';
import { School, BookOpen, Target, Building2, Info, Loader2 } from 'lucide-react';
import MCCEMSSelector from './MCCEMSSelector';
import { useAuth } from '../src/contexts/AuthContext';
import { schoolService } from '../src/services/schoolService';
import { useEffect, useState } from 'react';

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

  const { user } = useAuth();
  const [loadingSchool, setLoadingSchool] = useState(false);

  useEffect(() => {
    const loadSchoolData = async () => {
      if (user && user.schoolId) {
        // Pre-fill basic data from user profile
        setSchool(prev => ({
          ...prev,
          schoolName: user.schoolName || prev.schoolName,
        }));

        // Fetch detailed school data if available and we don't have CCT yet (or force update)
        if (!school.cct || school.cct !== user.schoolName /* simple check */) {
          setLoadingSchool(true);
          try {
            const schoolData = await schoolService.getSchoolById(user.schoolId);
            if (schoolData) {
              setSchool(prev => ({
                ...prev,
                cct: schoolData.cct || prev.cct,
                municipality: schoolData.municipio || prev.municipality,
                // @ts-ignore - schoolData.turno might be string, but Context expects specific union
                shift: schoolData.turno !== 'Matutino' ? schoolData.turno : prev.shift, // Keep default or update
                // schoolData has turno as string, Context expects specific string or string
              }));
            }
          } catch (error) {
            console.error("Error loading school details:", error);
          } finally {
            setLoadingSchool(false);
          }
        }
      }
    };

    loadSchoolData();
  }, [user, user?.schoolId]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
              <School className="w-4 h-4" />
              Contexto Institucional
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-1">Identidad de la Escuela</h3>
          </div>
          {user && (
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-500 uppercase font-bold">Autocompletado para</p>
              <p className="text-sm font-medium text-indigo-600">{user.nombre} {user.apellidoPaterno}</p>
            </div>
          )}
        </div>
        <div className="p-8 space-y-6">
          {loadingSchool && (
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 p-3 rounded-lg mb-4 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sincronizando datos de tu escuela...
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> Nombre del Plantel
              </label>
              <input
                name="schoolName"
                value={school.schoolName}
                onChange={handleSchoolChange}
                className={`w-full px-4 py-2 rounded-xl border outline-none transition-all ${user?.schoolName ? 'bg-indigo-50 border-indigo-200' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                placeholder="Ej. Bachillerato Gral. Oficial Emiliano Zapata"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" /> Clave de Centro de Trabajo (CCT) <span className="text-red-500">*</span>
              </label>
              <input
                name="cct"
                value={school.cct}
                onChange={handleSchoolChange}
                className={`w-full px-4 py-2 rounded-xl border outline-none transition-all uppercase ${!school.cct ? 'border-red-200 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                placeholder="Ej. 21EBH0000X"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Turno
              </label>
              <select
                name="shift"
                value={school.shift}
                // @ts-ignore
                onChange={handleSchoolChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Ciclo Escolar
              </label>
              <input
                name="cycle"
                value={school.cycle}
                onChange={handleSchoolChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ej. 2024-2025"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Municipio
              </label>
              <input
                name="municipality"
                value={school.municipality}
                onChange={handleSchoolChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ej. Puebla, Tehuacán..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
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
