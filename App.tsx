
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from './src/contexts/AuthContext';
import { AppView, SchoolContext, SubjectContext, LessonPlan } from './types';
import ContextManager from './components/ContextManager';
import PlanGenerator from './components/PlanGenerator';
import Dashboard from './components/Dashboard';
import PlansLibrary from './components/PlansLibrary';
import DiagnosticoDashboard from './components/DiagnosticoDashboard';
import Sidebar from './components/Sidebar';
import AsignacionMaterias from './pages/admin/AsignacionMaterias';
import GestionAlumnos from './pages/admin/GestionAlumnos';

import PMCDashboard from './pages/directivo/PMCDashboard';
import PAECDashboard from './pages/plantel/PAECDashboard';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<AppView>(() => {
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
  }, [schoolContext, subjectContext, savedPlans]);

  const handleSavePlan = (plan: LessonPlan) => {
    setSavedPlans(prev => [plan, ...prev]);
  };


  const handleNavigate = (viewId: string) => {
    if (viewId === 'guia-curricular') {
      navigate('/maestro/guia-curricular');
    } else {
      setView(viewId as AppView);
    }
  };

  const { user, logout } = useAuth(); // Movido al nivel superior

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} recentPlansCount={savedPlans.length} />;
      case 'admin-asignacion':
        return <AsignacionMaterias />;
      case 'admin-alumnos':
        return <GestionAlumnos />;
      case 'pmc':
        return <PMCDashboard />;
      case 'paec':
        return <PAECDashboard />;
      case 'context':
        return (
          <ContextManager
            school={schoolContext}
            setSchool={setSchoolContext}
            subject={subjectContext}
            setSubject={setSubjectContext}
          />
        );
      case 'generator':
        return (
          <PlanGenerator
            school={schoolContext}
            subject={subjectContext}
            teacherName={user ? `${user.nombre} ${user.apellidoPaterno}` : undefined}
            onSave={handleSavePlan}
          />
        );
      case 'plans':
        return <PlansLibrary plans={savedPlans} />;
      case 'diagnostico':
        return <DiagnosticoDashboard />;
      default:
        return <Dashboard setView={setView} recentPlansCount={savedPlans.length} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar activeView={view} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize text-slate-700">
            {view === 'dashboard' ? 'Bienvenido, Docente' : view.replace('_', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
              {schoolContext.schoolName}
            </div>
            {(() => {
              // useAuth ya está llamado arriba
              return user ? (
                <>
                  <div className="text-right">
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

        <div className="p-8 max-w-5xl mx-auto pb-24">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
