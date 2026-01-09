
import React, { useState } from 'react';
import { Sparkles, Loader2, Save, Send, Copy, Download, CheckCircle2, FileText } from 'lucide-react';
import { generateLessonPlan } from '../services/geminiService';
import { SchoolContext, SubjectContext, LessonPlan } from '../types';

interface PlanGeneratorProps {
  school: SchoolContext;
  subject: SubjectContext;
  onSave: (plan: LessonPlan) => void;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ school, subject, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const plan = await generateLessonPlan(prompt, school, subject);
      setResult(plan);
    } catch (err: any) {
      setError(err.message || 'Error al generar la planeación. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (result) {
      onSave(result);
      alert('Planeación guardada con éxito en tu historial.');
    }
  };

  const handleCopyToClipboard = () => {
    if (!result) return;
    const text = `
PLANEACIÓN DIDÁCTICA: ${result.title}
MATERIA: ${result.subject}
ESCUELA: ${school.schoolName}

META DE APRENDIZAJE:
${result.learningGoal}

PROGRESIÓN:
${result.progression}

SECUENCIA DIDÁCTICA:
1. APERTURA: ${result.sequence.opening}
2. DESARROLLO: ${result.sequence.development}
3. CIERRE: ${result.sequence.closing}

EVALUACIÓN: ${result.evaluation}
RECURSOS: ${result.resources.join(', ')}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm no-print">
        <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Diseñador de Clase
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Describe tu clase y la IA la transformará en un formato técnico de la SEP.
        </p>
        
        <div className="relative group">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-indigo-400 outline-none transition-all min-h-[140px] text-lg text-slate-700 placeholder:text-slate-300"
            placeholder="Ej. Una clase sobre biodiversidad local para primer semestre..."
          />
          <button 
            disabled={isLoading || !prompt.trim()}
            onClick={handleGenerate}
            className={`absolute bottom-4 right-4 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${
              isLoading || !prompt.trim() 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isLoading ? 'Redactando...' : 'Generar Formato'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl animate-in zoom-in duration-300">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex flex-wrap justify-between items-center mb-6 gap-4 no-print">
             <h4 className="font-bold text-slate-700 uppercase tracking-widest text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Planeación Lista para Entrega
             </h4>
             <div className="flex flex-wrap gap-2">
               <button 
                onClick={handleSaveToLibrary}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
               >
                 <Save className="w-4 h-4" /> Guardar
               </button>
               <button 
                onClick={handleCopyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
               >
                 {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 {copied ? 'Copiado' : 'Copiar Texto'}
               </button>
               <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-shadow shadow-lg shadow-slate-200"
               >
                 <Download className="w-4 h-4" /> Exportar a PDF
               </button>
             </div>
           </div>

           <article className="bg-white border border-slate-200 shadow-2xl rounded-none md:rounded-3xl p-10 print:p-0 print:border-none print:shadow-none">
              {/* Encabezado Formal SEP */}
              <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                <div className="space-y-1">
                   <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Sistema de Educación Media Superior</div>
                   <h1 className="text-3xl font-black text-slate-900 leading-none">{result.title}</h1>
                   <p className="text-indigo-600 font-bold text-sm mt-2">{result.subject} — {school.schoolName}</p>
                </div>
                <div className="text-right">
                   <div className="bg-slate-900 text-white px-3 py-1 text-[9px] font-black rounded-sm mb-2">MCCEMS 2024</div>
                   <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-tighter">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
                 <div className="md:col-span-7 space-y-6">
                    <section>
                      <h5 className="font-bold text-indigo-700 text-xs uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-700"></span>
                        Metas de Aprendizaje
                      </h5>
                      <p className="text-slate-700 text-sm leading-relaxed border-l-2 border-slate-100 pl-4">{result.learningGoal}</p>
                    </section>
                    <section>
                      <h5 className="font-bold text-indigo-700 text-xs uppercase mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-700"></span>
                        Progresión Curricular
                      </h5>
                      <p className="text-slate-700 text-sm italic bg-slate-50 p-4 rounded-xl border border-slate-100">{result.progression}</p>
                    </section>
                 </div>
                 <div className="md:col-span-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Carga Horaria</h6>
                          <div className="text-sm font-black text-slate-800">{result.duration}</div>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <h6 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha</h6>
                          <div className="text-sm font-black text-slate-800">{result.date || 'Ciclo 24-25'}</div>
                       </div>
                    </div>
                    <section>
                      <h5 className="font-bold text-indigo-700 text-xs uppercase mb-3">Recursos Didácticos</h5>
                      <div className="flex flex-wrap gap-2">
                        {result.resources.map((res, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 shadow-sm">
                            • {res}
                          </span>
                        ))}
                      </div>
                    </section>
                 </div>
              </div>

              <div className="space-y-10">
                 <div className="relative pl-8 border-l-4 border-emerald-500">
                   <div className="absolute -left-[14px] top-0 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                   <h5 className="font-black text-slate-900 mb-3 text-sm tracking-wide">FASE DE APERTURA (Inicio)</h5>
                   <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-emerald-50/30 p-4 rounded-r-2xl">{result.sequence.opening}</p>
                 </div>

                 <div className="relative pl-8 border-l-4 border-indigo-500">
                   <div className="absolute -left-[14px] top-0 bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                   <h5 className="font-black text-slate-900 mb-3 text-sm tracking-wide">FASE DE DESARROLLO (Construcción)</h5>
                   <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-indigo-50/30 p-4 rounded-r-2xl">{result.sequence.development}</p>
                 </div>

                 <div className="relative pl-8 border-l-4 border-rose-500">
                   <div className="absolute -left-[14px] top-0 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</div>
                   <h5 className="font-black text-slate-900 mb-3 text-sm tracking-wide">FASE DE CIERRE (Evaluación)</h5>
                   <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-rose-50/30 p-4 rounded-r-2xl">{result.sequence.closing}</p>
                 </div>
              </div>

              <div className="mt-12 p-8 bg-slate-900 text-white rounded-3xl">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-indigo-500 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                   </div>
                   <h5 className="font-bold text-sm">Sugerencias de Evaluación Formativa</h5>
                 </div>
                 <p className="text-slate-300 text-sm leading-relaxed italic">{result.evaluation}</p>
              </div>

              <div className="mt-16 pt-12 border-t border-slate-100 grid grid-cols-2 gap-20">
                 <div className="text-center">
                    <div className="border-t border-slate-300 pt-4">
                       <p className="text-[10px] font-black text-slate-900 uppercase">Firma del Docente</p>
                       <p className="text-[9px] text-slate-400 mt-1">Nombre y Apellido</p>
                    </div>
                 </div>
                 <div className="text-center">
                    <div className="border-t border-slate-300 pt-4">
                       <p className="text-[10px] font-black text-slate-900 uppercase">Sello de la Dirección</p>
                       <p className="text-[9px] text-slate-400 mt-1">Vo. Bo. Autoridad Escolar</p>
                    </div>
                 </div>
              </div>
           </article>
        </div>
      )}
    </div>
  );
};

export default PlanGenerator;
