
import React, { useEffect, useState } from 'react';
import { programasSEPService, ProgramaSEP } from '../src/services/programasSEPService';
import { SubjectContext } from '../types';
import { BookMarked, ExternalLink, ShieldCheck, Loader2, Star } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

interface MCCEMSSelectorProps {
  subject: SubjectContext;
  setSubject: React.Dispatch<React.SetStateAction<SubjectContext>>;
}

const MCCEMSSelector: React.FC<MCCEMSSelectorProps> = ({ subject, setSubject }) => {
  const [programas, setProgramas] = useState<ProgramaSEP[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar programas al montar
  useEffect(() => {
    const stats = programasSEPService.obtenerEstadisticas();
    // Podemos obtener 'todos' usando buscarPorMateria con cadena vacia o un metodo nuevo,
    // pero como buscarPorMateria busca parciales, '' podria traer todos si esta implementado asi.
    // Revisando el servicio, buscarPorMateria usa includes. '' includes '' es true.
    // Vamos a intentar obtener todos iterando sobre el indice o mejor aun:
    // El servicio no expone 'obtenerTodos'. Usaremos una estrategia:
    // El servicio tiene 'obtenerEstadisticas' que devuelve 'materiasDisponibles'.
    // Usaremos eso.

    const allMaterias = stats.materiasDisponibles;
    const listaCompleta: ProgramaSEP[] = [];

    allMaterias.forEach(mat => {
      const progs = programasSEPService.buscarPorMateria(mat);
      listaCompleta.push(...progs);
    });

    // Eliminar duplicados si los hubiera y ordenar por semestre
    const map = new Map();
    listaCompleta.forEach(p => map.set(p.materia + p.semestre, p));
    const unicos = Array.from(map.values()) as ProgramaSEP[];

    unicos.sort((a, b) => {
      if (a.semestre !== b.semestre) return a.semestre - b.semestre;
      return a.materia.localeCompare(b.materia);
    });

    setProgramas(unicos);
    setLoading(false);
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMateria = e.target.value;
    const selectedProg = programas.find(p => p.materia === selectedMateria);

    if (selectedProg) {
      setSubject({
        subjectId: selectedProg.materia, // Usamos nombre como ID por consistencia
        subjectName: selectedProg.materia,
        mccemsCategory: selectedProg.organizador_curricular?.categorias?.[0] || 'Asignatura MCCEMS',
        formativePurpose: `Alinear al programa oficial de ${selectedProg.materia} (Semestre ${selectedProg.semestre})`,
        curriculumContent: `Basado en el documento oficial: ${selectedProg.url_fuente}`
      });
    }
  };

  const { user } = useAuth();

  // Agrupar por semestre para el select, priorizando materias del usuario
  const misMaterias: ProgramaSEP[] = [];
  const porSemestre: Record<number, ProgramaSEP[]> = {};

  programas.forEach(p => {
    // Normalizar nombres para comparación (por si acaso minusculas/mayusculas)
    const isMySubject = user?.materias?.some(m => m.toLowerCase() === p.materia.toLowerCase());

    if (isMySubject) {
      // Evitar duplicados si ya está (aunque logicamente deberia ser unico por materia en este contexto)
      if (!misMaterias.find(mm => mm.materia === p.materia)) {
        misMaterias.push(p);
      }
    }

    // Agregar a semestre de todas formas, o solo si no es mia? 
    // Mejor agregar a semestre tambien para mantener catalogo completo, 
    // pero podriamos filtrarlas de los grupos de semestres para evitar duplicidad visual.
    // Vamos a dejarlas en ambos o filtrarlas. Filtrarlas limpio es mejor UX.

    if (!isMySubject) {
      if (!porSemestre[p.semestre]) porSemestre[p.semestre] = [];
      porSemestre[p.semestre].push(p);
    }
  });

  const selectedProgramInfo = programas.find(p => p.materia === subject.subjectId) ||
    programas.find(p => p.materia === subject.subjectName);

  return (
    <div className="space-y-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
      <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-2">
        <BookMarked className="w-4 h-4" />
        Configuración Curricular Oficial (SEP - DGB)
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Selecciona tu Asignatura Oficial</label>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm p-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando catálogo oficial...
          </div>
        ) : (
          <select
            value={subject.subjectName} // Usamos subjectName para coincidir con el valor de la opcion
            onChange={handleSelect}
            className="w-full px-4 py-3 rounded-xl border border-white bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium cursor-pointer"
          >
            <option value="">-- Elige una Materia del Catálogo --</option>

            {/* Mis Materias Group */}
            {misMaterias.length > 0 && (
              <optgroup label="⭐ Mis Materias Asignadas">
                {misMaterias.map(prog => (
                  <option key={`my-${prog.materia}`} value={prog.materia}>
                    {prog.materia}
                  </option>
                ))}
              </optgroup>
            )}

            {Object.keys(porSemestre).map(semestre => (
              <optgroup key={semestre} label={`Semestre ${semestre}`}>
                {porSemestre[Number(semestre)].map(prog => (
                  <option key={prog.materia + prog.semestre} value={prog.materia}>
                    {prog.materia}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      {selectedProgramInfo && (
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase">Programa Oficial Detectado</div>
              <div className="text-[11px] text-slate-500 truncate max-w-[200px] md:max-w-md">
                {selectedProgramInfo.materia} (Semestre {selectedProgramInfo.semestre})
              </div>
            </div>
          </div>
          <a
            href={selectedProgramInfo.url_fuente}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Ver Programa Oficial"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      )}
    </div>
  );
};

export default MCCEMSSelector;
