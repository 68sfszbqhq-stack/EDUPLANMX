import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpenCheck, CalendarCheck, NotebookPen, FileQuestion, Users, Send, RefreshCw, ArrowRight, FileText } from 'lucide-react';
import { AlumnoLista, Grupo, Resultado, resumirResultados } from '../../src/features/grupos/model';
import { leerLista, leerResultados } from '../../src/features/grupos/storage';
import { Columna, NotasAlumno, Sesion } from '../../src/features/evaluacion/modelo';
import { escucharCuaderno } from '../../src/features/evaluacion/storage';
import { Anotacion, EntradaDiario, EstadoExamenes, escucharAnotaciones, escucharAsistencia, escucharDiario, sincronizarExamenes } from '../../src/features/clase/storage';
import { estadisticaClase, textoClaseParaPlaneacion } from '../../src/features/clase/modelo';
import Cuaderno from './Cuaderno';
import PasarLista from './PasarLista';
import Diario from './Diario';
import Alumnos from './Alumnos';
import Documentos from './Documentos';
import FichaAlumno from './FichaAlumno';
import Examenes from '../evaluacion/Examenes';
import { Panel, boton } from './ui';

type Pestana = 'cuaderno' | 'lista' | 'diario' | 'examenes' | 'documentos' | 'alumnos';
const VACIO: EstadoExamenes = { porColumna: {}, porRevisar: {}, enCurso: {}, calificados: 0 };

export default function Clase({ grupo: inicial, onSalir, onNavigate }: { grupo: Grupo; onSalir: () => void; onNavigate?: (v: string) => void }) {
  const [grupo, setGrupo] = useState(inicial);
  const [alumnos, setAlumnos] = useState<AlumnoLista[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [columnas, setColumnas] = useState<Columna[]>([]);
  const [notas, setNotas] = useState<Record<string, NotasAlumno>>({});
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [diario, setDiario] = useState<EntradaDiario[]>([]);
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>([]);
  const [examenes, setExamenes] = useState<EstadoExamenes>(VACIO);
  const [pestana, setPestana] = useState<Pestana>('cuaderno');
  const [ficha, setFicha] = useState<string | null>(null);
  const [examenPedido, setExamenPedido] = useState<{ descripcion?: string; examenId?: string; n: number }>({ n: 0 });
  const [fechaDiario, setFechaDiario] = useState<string | undefined>();
  const [planeacion, setPlaneacion] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const recargarLista = useCallback(async () => {
    try {
      const [l, r] = await Promise.all([leerLista(grupo.id), leerResultados(grupo.id)]);
      setAlumnos(l); setResultados(r);
    } catch (e: any) { setError(`No pude leer la clase: ${e.message}`); }
  }, [grupo.id]);

  const sincronizar = useCallback(async (silencioso = true) => {
    setSincronizando(true);
    try {
      // La lista también: quién ya entró a Antología y qué diagnósticos llegaron.
      const [r] = await Promise.all([sincronizarExamenes(grupo.id), recargarLista()]);
      setExamenes(r);
      if (r.calificados) setAviso(`${r.calificados} ${r.calificados === 1 ? 'examen entregado se calificó solo' : 'exámenes entregados se calificaron solos'} y ya está en el cuaderno.`);
      else if (!silencioso) setAviso('Todo al día.');
    } catch (e: any) { setError(`No pude revisar los exámenes: ${e.message}`); } finally { setSincronizando(false); }
  }, [grupo.id, recargarLista]);

  useEffect(() => {
    sincronizar();
    const fallo = (que: string) => (e: Error) => setError(`No pude leer ${que}: ${e.message}`);
    const quitar = [
      escucharCuaderno(grupo.id, (c, n) => { setColumnas(c); setNotas(n); }, fallo('el cuaderno')),
      escucharAsistencia(grupo.id, setSesiones, fallo('la asistencia')),
      escucharDiario(grupo.id, setDiario, fallo('el diario')),
      escucharAnotaciones(grupo.id, setAnotaciones, fallo('las anotaciones')),
    ];
    // Mientras la clase esté abierta, los exámenes que van entregando se califican solos.
    const reloj = setInterval(() => sincronizar(), 90_000);
    return () => { quitar.forEach(q => q()); clearInterval(reloj); };
  }, [grupo.id]);

  const activos = useMemo(() => alumnos.filter(a => a.estado === 'activo'), [alumnos]);
  const ir = (p: Pestana) => { setPestana(p); setError(''); setAviso(''); };
  const hacerExamen = (descripcion: string) => { setExamenPedido(x => ({ descripcion, n: x.n + 1 })); ir('examenes'); };
  const abrirExamen = (examenId: string) => { setExamenPedido(x => ({ examenId, n: x.n + 1 })); ir('examenes'); };

  const pestanas: [Pestana, string, React.ElementType][] = [
    ['cuaderno', 'Cuaderno', BookOpenCheck], ['lista', 'Pasar lista', CalendarCheck], ['diario', 'Diario de clase', NotebookPen],
    ['examenes', 'Exámenes', FileQuestion], ['documentos', 'Documentos', FileText], ['alumnos', `Alumnos (${activos.length})`, Users],
  ];
  const porRevisar = Object.values(examenes.porRevisar).reduce((s, x) => s + x.length, 0);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <button onClick={onSalir} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Volver a Mis clases" title="Mis clases"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl font-bold text-slate-800">{grupo.nombre}</h1>
          <p className="text-sm text-slate-500">{grupo.asignaturaNombre} · {grupo.ciclo} · {activos.length} alumnos</p>
        </div>
        <button onClick={() => sincronizar(false)} disabled={sincronizando} className={`${boton} text-slate-600 border border-slate-200`} title="Revisar exámenes entregados y calificarlos">
          <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin' : ''}`} /> Actualizar
        </button>
        <button onClick={() => setPlaneacion(true)} className={`${boton} bg-emerald-600 text-white`}><Send className="w-4 h-4" /> Llevar a mi planeación</button>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200" aria-label="Secciones de la clase">
        {pestanas.map(([id, label, Icon]) => (
          <button key={id} onClick={() => { if (id === 'examenes') setExamenPedido(x => ({ n: x.n + 1 })); ir(id); }} aria-current={pestana === id}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px ${pestana === id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <Icon className="w-4 h-4" /> {label}
            {id === 'examenes' && porRevisar > 0 && <span className="ml-1 text-[10px] bg-amber-500 text-white rounded-full px-1.5">{porRevisar}</span>}
          </button>
        ))}
      </nav>

      {error && <p role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</p>}
      {aviso && <p className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">{aviso}</p>}

      {pestana === 'cuaderno' && (
        <Cuaderno grupo={grupo} alumnos={activos} columnas={columnas} notas={notas} sesiones={sesiones} resultados={resultados} examenes={examenes}
          onGrupo={setGrupo} onFicha={setFicha} onAbrirExamen={abrirExamen} onNuevoExamen={() => hacerExamen('')} onPasarLista={() => ir('lista')}
          onError={setError} onAviso={setAviso} />
      )}
      {pestana === 'lista' && (
        <PasarLista grupoId={grupo.id} alumnos={activos} sesiones={sesiones} onError={setError}
          onDiario={f => { setFechaDiario(f); ir('diario'); }} />
      )}
      {pestana === 'diario' && (
        <Diario grupoId={grupo.id} diario={diario} sesiones={sesiones} alumnos={activos} fechaInicial={fechaDiario} onError={setError} onExamen={hacerExamen} />
      )}
      {pestana === 'examenes' && (
        <Examenes key={examenPedido.n} grupo={grupo} alumnos={alumnos} onError={setError} onAviso={setAviso} diario={diario}
          descripcionInicial={examenPedido.descripcion} examenInicial={examenPedido.examenId} onCambio={() => sincronizar()} />
      )}
      {pestana === 'documentos' && (
        <Documentos grupo={grupo} alumnos={activos} columnas={columnas} notas={notas} sesiones={sesiones} diario={diario} anotaciones={anotaciones} resultados={resultados} onError={setError} />
      )}
      {pestana === 'alumnos' && (
        <Alumnos grupo={grupo} alumnos={alumnos} onCambio={recargarLista} onFicha={setFicha} onError={setError} onAviso={setAviso} />
      )}

      {ficha && (
        <FichaAlumno grupo={grupo} alumno={alumnos.find(a => a.matricula === ficha)!} columnas={columnas} notas={notas[ficha]} sesiones={sesiones}
          resultados={resultados.filter(r => r.matricula === ficha)} anotaciones={anotaciones.filter(a => a.matricula === ficha)}
          examenes={examenes} onAbrirExamen={id => { setFicha(null); abrirExamen(id); }} onCerrar={() => setFicha(null)} onError={setError} />
      )}
      {planeacion && (
        <LlevarAPlaneacion grupo={grupo} texto={textoClaseParaPlaneacion(grupo, estadisticaClase(alumnos, columnas, notas, sesiones, !!grupo.vaciasCuentanCero, grupo.ponderacion), diario, resumirResultados(alumnos, resultados))}
          onCerrar={() => setPlaneacion(false)} onNavigate={onNavigate} />
      )}
    </div>
  );
}

function LlevarAPlaneacion({ grupo, texto: inicial, onCerrar, onNavigate }: { grupo: Grupo; texto: string; onCerrar: () => void; onNavigate?: (v: string) => void }) {
  const [texto, setTexto] = useState(inicial);
  const [listo, setListo] = useState(false);
  // El docente decide: el texto se agrega al diagnóstico del grupo y ahí lo puede editar o borrar.
  const usar = () => {
    const previo = localStorage.getItem('diagnosticoGrupo') || '';
    localStorage.setItem('diagnosticoGrupo', previo.trim() ? `${previo.trim()}\n\n${texto}` : texto);
    setListo(true);
  };
  return (
    <Panel titulo={`Llevar ${grupo.nombre} a mi próxima planeación`} onCerrar={onCerrar}>
      {!inicial ? <p className="text-sm text-slate-600">Todavía no hay nada que llevar: aparecerá en cuanto registres calificaciones, asistencia o el diario de clase.</p> : (
        <>
          <p className="text-sm text-slate-600">Esto se agrega al <b>diagnóstico del grupo</b> de tu próxima planeación, para que la IA planee con lo que de verdad pasa en tu salón. No lleva nombres de alumnos. Puedes editarlo:</p>
          <textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm h-72" value={texto} onChange={e => setTexto(e.target.value)} />
          {listo
            ? <button onClick={() => onNavigate?.('generator')} className={`${boton} bg-emerald-600 text-white`}>Listo. Ir a Generar planeación <ArrowRight className="w-4 h-4" /></button>
            : <button onClick={usar} className={`${boton} bg-indigo-600 text-white`}><Send className="w-4 h-4" /> Usar en mi próxima planeación</button>}
        </>
      )}
    </Panel>
  );
}
