
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import MiPagina from './components/pagina/MiPagina';
import { useAuth } from './src/contexts/AuthContext';
import { AppView, SchoolContext, SubjectContext, LessonPlan } from './types';
import ContextManager from './components/ContextManager';
import PlanGenerator from './components/PlanGenerator';
import CuestionarioDocente from './components/CuestionarioDocente';
import Dashboard from './components/Dashboard';
import PlansLibrary from './components/PlansLibrary';
import DiagnosticoDashboard from './components/DiagnosticoDashboard';
import FlujoContextualizacion from './components/FlujoContextualizacion';
import BitacoraDocente from './components/BitacoraDocente';
import Sidebar from './components/Sidebar';
import AsignacionMaterias from './pages/admin/AsignacionMaterias';
import GestionAlumnos from './pages/admin/GestionAlumnos';
import { PersonalizedDashboard } from './components/PersonalizedDashboard';

import CuadernoEscolar from './components/CuadernoEscolar';
import MisClases from './components/clase/MisClases';
import MiEscuela, { AvisoAccesoEscuela } from './components/MiEscuela';
import AvisoMuestra from './components/AvisoMuestra';

import PMCDashboard from './pages/directivo/PMCDashboard';
import PAECDashboard from './pages/plantel/PAECDashboard';

// Título que se muestra arriba de cada pantalla
const TITULOS_VISTA: Record<string, string> = {
  dashboard: 'Bienvenido, Docente',
  grupos: 'Mis clases',
  generator: 'Generar planeación',
  plans: 'Mis planeaciones',
  'perfil-docente': 'Cómo doy clase',
  context: 'Contexto escolar',
  flujo: 'Flujo de contextualización',
  cuaderno: 'Cuaderno escolar · CAPEMS',
  'mi-escuela': 'Mi escuela y su personal',
  'mi-pagina': 'Mi página de clases',
  diagnostico: 'Diagnóstico',
  bitacora: 'Bitácora',
  pmc: 'PMC directivo',
  paec: 'Comité PAEC',
  'admin-asignacion': 'Asignar materias',
  'admin-alumnos': 'Gestión de alumnos',
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [view, setView] = useState<AppView | 'cuaderno'>(() => {
    // @ts-ignore
    return location.state?.view || 'dashboard';
  });
  const [schoolContext, setSchoolContext] = useState<SchoolContext>(() => {
    const saved = localStorage.getItem('schoolContext');
    return saved ? JSON.parse(saved) : {
      schoolName: 'Bachillerato General Oficial',
      cct: '',
      cycle: '2024-2025',
      shift: 'Matutino',
      municipality: '',
      vision: '',
      communityGoals: '',
      infrastructure: ''
    };
  });

  const [subjectContext, setSubjectContext] = useState<SubjectContext>(() => {
    const saved = localStorage.getItem('subjectContext');
    return saved ? JSON.parse(saved) : {
      subjectId: '',
      subjectName: '',
      formativePurpose: '',
      curriculumContent: '',
      mccemsCategory: ''
    };
  });

  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem('savedPlans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('schoolContext', JSON.stringify(schoolContext));
    localStorage.setItem('subjectContext', JSON.stringify(subjectContext));
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans));
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans));
  }, [schoolContext, subjectContext, savedPlans]);

  // Context Hydration from User Profile
  useEffect(() => {
    if (user) {
      // 1. Hydrate School
      if (user.schoolName && (!schoolContext.schoolName || schoolContext.schoolName === 'Bachillerato General Oficial')) {
        setSchoolContext(prev => ({
          ...prev,
          schoolName: user.schoolName!,
          cct: user.schoolCct || prev.cct
        }));
      } else if (user.schoolCct && !schoolContext.cct) {
        setSchoolContext(prev => ({ ...prev, cct: user.schoolCct! }));
      }

      // 2. Hydrate Subject (Select first available subject by default)
      if (!subjectContext.subjectName && user.materias && user.materias.length > 0) {
        setSubjectContext(prev => ({
          ...prev,
          subjectName: user.materias![0],
          subjectId: user.materias![0]
        }));
      }
    }
  }, [user]);

  const handleSavePlan = async (plan: LessonPlan) => {
    // Guardar en localStorage (fallback)
    setSavedPlans(prev => [plan, ...prev]);

    // Guardar en Firestore con schoolId (el modo muestra nunca toca Firebase)
    if (user?.id && user?.schoolId && user.rol !== 'guest') {
      try {
        const { planeacionesService } = await import('./src/services/planeacionesService');
        await planeacionesService.crear(plan, user.id, user.schoolId);
        console.log('✅ Planeación guardada en Firestore');
      } catch (error) {
        console.error('❌ Error al guardar en Firestore:', error);
        // El localStorage ya tiene la copia
      }
    }
  };


  const handleNavigate = (viewId: string) => {
    if (viewId === 'guia-curricular') {
      navigate('/maestro/guia-curricular');
    } else if (viewId === 'herramientas') {
      navigate('/maestro/herramientas');
    } else if (viewId === 'ficha12') {
      navigate('/maestro/ficha12');
    } else {
      setView(viewId as AppView);
    }
  };

  // const { user, logout } = useAuth(); // Moved to top

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <PersonalizedDashboard onNavigate={handleNavigate} />;
      case 'admin-asignacion':
        return <AsignacionMaterias />;
      case 'admin-alumnos':
        return <GestionAlumnos />;
      case 'pmc':
        return <PMCDashboard />;
      case 'paec':
        return <PAECDashboard />;
      case 'cuaderno':
        return <CuadernoEscolar cycle={schoolContext.cycle} subject={subjectContext.subjectName} />;
      case 'context':
        return (
          <ContextManager
            school={schoolContext}
            setSchool={setSchoolContext}
            subject={subjectContext}
            setSubject={setSubjectContext}
          />
        );
      case 'flujo':
        return (
          <FlujoContextualizacion
            school={schoolContext}
            subject={subjectContext}
            onNavigate={handleNavigate}
          />
        );
      case 'bitacora':
        return (
          <BitacoraDocente
            materiaActiva={subjectContext.subjectName}
            onNavigate={handleNavigate}
          />
        );
      case 'generator':
        return (
          <PlanGenerator
            school={schoolContext}
            subject={subjectContext}
            teacherName={user ? `${user.nombre} ${user.apellidoPaterno}` : undefined}
            onSave={handleSavePlan}
            onNavigate={handleNavigate}
          />
        );
      case 'mi-pagina':
        return <MiPagina />;
      case 'perfil-docente':
        return <CuestionarioDocente userId={user?.rol === 'guest' ? undefined : user?.id} />;
      case 'plans':
        return <PlansLibrary />;
      case 'diagnostico':
        return <DiagnosticoDashboard />;
      case 'grupos':
        return <MisClases onNavigate={handleNavigate} />;
      case 'mi-escuela':
        return <MiEscuela />;
      default:
        return <Dashboard setView={setView} recentPlansCount={savedPlans.length} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar activeView={view} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800">
            {TITULOS_VISTA[view] ?? view.replace(/[-_]/g, ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
              {schoolContext.schoolName}
            </div>
            {(() => {
              // useAuth ya está llamado arriba
              return user ? (
                <>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold text-slate-700">
                      {user.nombre} {user.apellidoPaterno}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">{user.rol}</div>
                  </div>
                  {/* Logout button removed from header as it is now in sidebar, or we can keep it for mobile? 
                      Sidebar is hidden on mobile: hidden md:flex.
                      So we should keep a way to logout on mobile. 
                  */}
                  <button
                    onClick={logout}
                    className="flex md:hidden items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : null;
            })()}
          </div>
        </header>
        <AvisoAccesoEscuela onAbrir={() => handleNavigate('mi-escuela')} />
        <AvisoMuestra />

        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
