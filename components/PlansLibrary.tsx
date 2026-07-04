import React, { useState, useRef, useEffect } from 'react';
import { LessonPlan } from '../types';
import { FileText, Calendar, ArrowRight, Trash2, ArrowLeft, Download, BookOpen, Search, Filter, Loader } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PlanDocument from './PlanDocument';
import { useAuth } from '../src/contexts/AuthContext';
import { planeacionesService, PlaneacionFirestore } from '../src/services/planeacionesService';
import { descargarPlaneacionWord } from '../src/services/wordService';

const PlansLibrary: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlaneacionFirestore[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PlaneacionFirestore[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlaneacionFirestore | null>(null);
  const [loading, setLoading] = useState(true);
  // Biblioteca del plantel: memoria pedagógica colectiva de la escuela
  const [vista, setVista] = useState<'mias' | 'escuela'>('mias');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPlan ? `Planeacion-${selectedPlan.subject}` : 'Planeacion',
  });

  // Cargar planeaciones desde Firestore (propias o de toda la escuela)
  useEffect(() => {
    if (user?.id && user?.schoolId) {
      loadPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, vista]);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [plans, searchTerm, filterSubject, filterSemester]);

  /**
   * Rescate único: sube a Firestore las planeaciones que quedaron atrapadas
   * solo en localStorage (guardados previos a la nube, o fallos de red).
   * Sin esto, limpiar el navegador o cambiar de equipo las pierde para siempre.
   */
  const sincronizarLocalesPendientes = async (nubeActual: PlaneacionFirestore[]) => {
    if (!user?.id || !user?.schoolId) return false;
    try {
      const locales: LessonPlan[] = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      if (!Array.isArray(locales) || locales.length === 0) return false;

      const enNube = new Set(nubeActual.map(p => `${p.title}|${p.subject}`));
      const pendientes = locales.filter(p => p?.subject && !enNube.has(`${(p as any).title || p.subject}|${p.subject}`));
      if (pendientes.length === 0) return false;

      console.log(`☁️ Rescatando ${pendientes.length} planeaciones locales hacia Firestore...`);
      for (const plan of pendientes) {
        await planeacionesService.crear(plan, user.id, user.schoolId);
      }
      return true;
    } catch (e) {
      console.error('No se pudieron sincronizar planeaciones locales:', e);
      return false;
    }
  };

  const loadPlans = async () => {
    if (!user?.id || !user?.schoolId) return;

    try {
      setLoading(true);

      if (vista === 'escuela') {
        // Biblioteca del plantel: lo que han creado todos los colegas
        const plansData = await planeacionesService.getEscuela(user.schoolId, 100);
        setPlans(plansData);
        return;
      }

      let plansData = await planeacionesService.getMias(user.id, user.schoolId);

      // Subir rezagadas de localStorage y recargar si hubo cambios
      const huboRescate = await sincronizarLocalesPendientes(plansData);
      if (huboRescate) {
        plansData = await planeacionesService.getMias(user.id, user.schoolId);
      }

      setPlans(plansData);
    } catch (error) {
      console.error('Error al cargar planeaciones:', error);
      // Fallback a localStorage si falla Firestore
      const savedPlans = localStorage.getItem('savedPlans');
      if (savedPlans) {
        const localPlans = JSON.parse(savedPlans);
        setPlans(localPlans.map((p: any) => ({
          id: p.id || Date.now().toString(),
          userId: user.id,
          schoolId: user.schoolId,
          title: p.title || p.subject,
          subject: p.subject,
          semester: p.meta?.semester,
          content: p,
          createdAt: p.meta?.startDate || new Date().toISOString()
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plans];

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.title?.toLowerCase().includes(term) ||
        plan.subject?.toLowerCase().includes(term)
      );
    }

    // Filtro por materia
    if (filterSubject !== 'all') {
      filtered = filtered.filter(plan => plan.subject === filterSubject);
    }

    // Filtro por semestre
    if (filterSemester !== 'all') {
      filtered = filtered.filter(plan => plan.semester?.toString() === filterSemester);
    }

    setFilteredPlans(filtered);
  };

  const handleDelete = async (planId: string, planTitle: string) => {
    if (!user?.id || !user?.schoolId) return;

    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar la planeación "${planTitle}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      await planeacionesService.eliminar(planId, user.id, user.schoolId);

      // Actualizar lista local
      setPlans(prev => prev.filter(p => p.id !== planId));

      // También actualizar localStorage
      const savedPlans = localStorage.getItem('savedPlans');
      if (savedPlans) {
        const localPlans = JSON.parse(savedPlans);
        const updated = localPlans.filter((p: any) => p.id !== planId);
        localStorage.setItem('savedPlans', JSON.stringify(updated));
      }

      console.log('✅ Planeación eliminada:', planId);
    } catch (error) {
      console.error('Error al eliminar planeación:', error);
      alert('Error al eliminar la planeación. Intenta de nuevo.');
    }
  };

  // Obtener materias únicas para el filtro
  const uniqueSubjects = Array.from(new Set(plans.map(p => p.subject).filter(Boolean)));
  const uniqueSemesters = Array.from(new Set(plans.map(p => p.semester).filter(Boolean))).sort();

  // Estado de carga
  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Cargando planeaciones...</p>
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

          <div className="flex gap-2">
            {/* Solo el autor puede eliminar su planeación */}
            {selectedPlan.userId === user?.id && (
              <button
                onClick={() => handleDelete(selectedPlan.id!, selectedPlan.title)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            )}
            <button
              onClick={() => descargarPlaneacionWord(selectedPlan.content as LessonPlan)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all"
            >
              <FileText className="w-4 h-4" /> Word
            </button>
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
            >
              <Download className="w-4 h-4" /> Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="overflow-auto border border-slate-100 rounded-3xl shadow-xl print:shadow-none print:border-none print:rounded-none">
          <PlanDocument
            ref={printRef}
            plan={selectedPlan.content as LessonPlan}
            teacherName={selectedPlan.content?.meta?.teacher}
          />
        </div>
      </div>
    );
  }

  // Vista de Lista con Filtros
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          {vista === 'mias' ? 'Tu Historial de Planeaciones' : 'Biblioteca del Plantel'}
          <span className="text-sm font-normal text-slate-500">({filteredPlans.length})</span>
        </h3>

        {/* Pestañas: mis planeaciones / las de toda mi escuela */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setVista('mias')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${vista === 'mias' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mis planeaciones
          </button>
          <button
            onClick={() => setVista('escuela')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${vista === 'escuela' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            De mi escuela
          </button>
        </div>
      </div>

      {vista === 'escuela' && (
        <p className="text-xs text-slate-500 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
          💡 Memoria pedagógica del plantel: consulta cómo planean tus colegas. Puedes verlas, imprimirlas
          o bajarlas a Word como referencia — solo cada autor puede eliminar las suyas.
        </p>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filtros:</span>
          </div>

          {/* Filtro por Materia */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas las materias</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          {/* Filtro por Semestre */}
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los semestres</option>
            {uniqueSemesters.map(semester => (
              <option key={semester} value={semester}>Semestre {semester}</option>
            ))}
          </select>

          {/* Limpiar Filtros */}
          {(searchTerm || filterSubject !== 'all' || filterSemester !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('all');
                setFilterSemester('all');
              }}
              className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Planeaciones */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-slate-600 font-medium">
            {plans.length === 0
              ? (vista === 'mias'
                ? 'Aún no tienes planeaciones guardadas. Genera tu primera en el paso ③.'
                : 'Tu escuela aún no tiene planeaciones compartidas.')
              : 'No se encontraron planeaciones con los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.map((plan, idx) => (
            <div key={plan.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex justify-between items-center group shadow-sm hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {filteredPlans.length - idx}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{plan.title}</h4>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {vista === 'escuela' && (plan.content as any)?.meta?.teacher && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {(plan.content as any).meta.teacher}
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {plan.subject}
                    </span>
                    {plan.semester && (
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Semestre {plan.semester}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(plan.createdAt as string).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {plan.userId === user?.id && (
                  <button
                    onClick={() => handleDelete(plan.id!, plan.title)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar planeación"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
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
      )}
    </div>
  );
};

export default PlansLibrary;
