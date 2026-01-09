
import React from 'react';
import { MCCEMS_DOCUMENTS } from '../data/mccemsData';
import { SubjectContext } from '../types';
import { BookMarked, ExternalLink, ShieldCheck } from 'lucide-react';

interface MCCEMSSelectorProps {
  subject: SubjectContext;
  setSubject: React.Dispatch<React.SetStateAction<SubjectContext>>;
}

const MCCEMSSelector: React.FC<MCCEMSSelectorProps> = ({ subject, setSubject }) => {
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = MCCEMS_DOCUMENTS.find(doc => doc.id === e.target.value);
    if (selected) {
      setSubject({
        subjectId: selected.id,
        subjectName: selected.name,
        mccemsCategory: selected.category,
        formativePurpose: `Alinear al Perfil de Egreso establecido en el MCCEMS para ${selected.name}.`,
        curriculumContent: `Basado en el documento oficial: ${selected.url}`
      });
    }
  };

  const currentDoc = MCCEMS_DOCUMENTS.find(d => d.id === subject.subjectId);

  return (
    <div className="space-y-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
      <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-2">
        <BookMarked className="w-4 h-4" />
        Configuración Curricular Oficial (SEP)
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Selecciona tu Recurso o Área</label>
        <select 
          value={subject.subjectId}
          onChange={handleSelect}
          className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium"
        >
          <option value="">-- Elige una UAC --</option>
          <optgroup label="Recursos Sociocognitivos">
            {MCCEMS_DOCUMENTS.filter(d => d.category === 'recurso').map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </optgroup>
          <optgroup label="Áreas de Conocimiento">
            {MCCEMS_DOCUMENTS.filter(d => d.category === 'area').map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </optgroup>
          <optgroup label="Ámbitos Socioemocionales">
            {MCCEMS_DOCUMENTS.filter(d => d.category === 'ambito').map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {currentDoc && (
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase">Documento Vinculado</div>
              <div className="text-[11px] text-slate-500 truncate max-w-[200px] md:max-w-md">{currentDoc.name} - SEP</div>
            </div>
          </div>
          <a 
            href={currentDoc.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Ver PDF Oficial"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      )}
    </div>
  );
};

export default MCCEMSSelector;
