
import React, { useState, useEffect } from 'react';
import { Layout, ClipboardList, BookOpen, Settings, PlusCircle, History, BookMarked, GraduationCap } from 'lucide-react';
import { AppView, SchoolContext, SubjectContext, LessonPlan } from './types';
import ContextManager from './components/ContextManager';
import PlanGenerator from './components/PlanGenerator';
import Dashboard from './components/Dashboard';
import PlansLibrary from './components/PlansLibrary';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [schoolContext, setSchoolContext] = useState<SchoolContext>(() => {
    const saved = localStorage.getItem('schoolContext');
    return saved ? JSON.parse(saved) : {
      schoolName: 'Bachillerato General Oficial',
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

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} recentPlansCount={savedPlans.length} />;
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
            onSave={handleSavePlan}
          />
        );
      case 'plans':
        return <PlansLibrary plans={savedPlans} />;
      default:
        return <Dashboard setView={setView} recentPlansCount={savedPlans.length} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-300" />
            <h1 className="font-bold text-xl tracking-tight">EduPlan MX</h1>
          </div>
          <p className="text-xs text-indigo-300 mt-2 uppercase font-semibold">Bachillerato Oficial</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'dashboard' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800/50 text-indigo-100'}`}
          >
            <Layout className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setView('context')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'context' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800/50 text-indigo-100'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Contexto Escolar</span>
          </button>

          <button
            onClick={() => setView('generator')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'generator' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800/50 text-indigo-100'}`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">Nueva Planeación</span>
          </button>

          <button
            onClick={() => setView('plans')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'plans' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800/50 text-indigo-100'}`}
          >
            <History className="w-5 h-5" />
            <span className="font-medium">Historial</span>
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-800 text-xs text-indigo-400 text-center">
          v1.0.0 - Hecho para México
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize text-slate-700">
            {view === 'dashboard' ? 'Bienvenido, Docente' : view.replace('_', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
              {schoolContext.schoolName}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
