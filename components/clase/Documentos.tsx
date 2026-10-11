import React, { useMemo, useState } from 'react';
import { FileText, Download, AlertTriangle, CalendarCheck, ClipboardList, Stethoscope } from 'lucide-react';
import { Packer, Document } from 'docx';
import { useAuth } from '../../src/contexts/AuthContext';
import { AlumnoLista, Grupo, Resultado, resumirResultados, textoParaPlaneacion } from '../../src/features/grupos/model';
import { Columna, NotasAlumno, Sesion, resumirAsistencia } from '../../src/features/evaluacion/modelo';
import { Anotacion, EntradaDiario, hoy } from '../../src/features/clase/storage';
import { calificarParciales, detectarRiesgo, enParcial, estadisticaClase, textoClaseParaPlaneacion } from '../../src/features/clase/modelo';
import { DatosEncabezado, diagnosticoGrupo, registroClases, reporteEvaluacion, seguimientoRiesgo } from '../../src/features/clase/documentos';
import { boton, input } from './ui';

const CLAVE_DATOS = 'datosDocumentosEscuela';

interface Props {
  grupo: Grupo; alumnos: AlumnoLista[]; columnas: Columna[]; notas: Record<string, NotasAlumno>; sesiones: Sesion[];
  diario: EntradaDiario[]; anotaciones: Anotacion[]; resultados: Resultado[]; onError: (e: string) => void;
}

export default function Documentos({ grupo, alumnos, columnas, notas, sesiones, diario, anotaciones, resultados, onError }: Props) {
  const { user } = useAuth();
  const parciales = grupo.parciales ?? [];
  const [periodo, setPeriodo] = useState<number | null>(null); // null = semestre completo
  const guardados = (() => { try { return JSON.parse(localStorage.getItem(CLAVE_DATOS) || '{}'); } catch { return {}; } })();
  const [escuela, setEscuela] = useState<string>(guardados.escuela ?? (user as any)?.schoolName ?? '');
  const [cct, setCct] = useState<string>(guardados.cct ?? (user as any)?.schoolCct ?? '');
  const [docente, setDocente] = useState<string>(guardados.docente ?? user?.nombre ?? '');
  const [generando, setGenerando] = useState('');

  const recordar = () => { try { localStorage.setItem(CLAVE_DATOS, JSON.stringify({ escuela, cct, docente })); } catch { /* sin almacenamiento: no pasa nada */ } };

  // Todo lo del periodo elegido; la final siempre se calcula con todos los parciales.
  const cols = useMemo(() => enParcial(columnas, parciales, periodo), [columnas, parciales, periodo]);
  const ses = useMemo(() => enParcial(sesiones, parciales, periodo), [sesiones, parciales, periodo]);
  const dia = useMemo(() => enParcial(diario, parciales, periodo), [diario, parciales, periodo]);
  const anot = useMemo(() => enParcial(anotaciones, parciales, periodo), [anotaciones, parciales, periodo]);
  const riesgos = useMemo(() => alumnos.map(a => detectarRiesgo(a, cols, notas[a.matricula], ses, !!grupo.vaciasCuentanCero, grupo.ponderacion)).filter(Boolean) as NonNullable<ReturnType<typeof detectarRiesgo>>[],
    [alumnos, cols, notas, ses, grupo]);

  const nombrePeriodo = periodo === null ? (parciales.length ? 'Semestre completo' : 'Todo lo registrado') : `${parciales[periodo].nombre} (${corta(parciales[periodo].inicio)} – ${corta(parciales[periodo].fin)})`;
  const datos = (): DatosEncabezado => ({ escuela, cct, docente, asignatura: grupo.asignaturaNombre, grupo: grupo.nombre, ciclo: grupo.ciclo, periodo: nombrePeriodo, fecha: hoy() });

  const descargar = async (nombre: string, construir: () => Document) => {
    recordar(); setGenerando(nombre);
    try {
      const blob = await Packer.toBlob(construir());
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${nombre} - ${grupo.nombre} - ${nombrePeriodo}.docx` });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e: any) { onError(`No se pudo armar el documento: ${e.message}`); } finally { setGenerando(''); }
  };

  const reporte = () => {
    const usarParciales = periodo === null && parciales.length > 0;
    const filas = alumnos.map(a => {
      const cp = calificarParciales(columnas, notas[a.matricula], sesiones, a.matricula, !!grupo.vaciasCuentanCero, grupo.ponderacion, parciales);
      const delPeriodo = periodo === null ? cp.final : cp.porParcial[periodo];
      const asis = resumirAsistencia(ses, a.matricula);
      const r = riesgos.find(x => x.matricula === a.matricula);
      return {
        nombre: a.nombre, matricula: a.matricula,
        calificaciones: usarParciales ? cp.porParcial : [delPeriodo],
        final: usarParciales ? cp.final : delPeriodo,
        asistencia: asis.porcentaje, faltas: asis.faltas,
        observaciones: r ? `Atención: ${r.motivos.join('; ')}` : '',
      };
    });
    const finales = filas.map(f => f.final).filter((x): x is number => x !== null);
    const asisList = filas.map(f => f.asistencia).filter((x): x is number => x !== null);
    return reporteEvaluacion(datos(), usarParciales ? parciales.map(p => p.nombre) : [periodo === null ? 'Calificación' : parciales[periodo].nombre], filas, {
      promedio: finales.length ? Math.round((finales.reduce((s, x) => s + x, 0) / finales.length) * 10) / 10 : null,
      aprobados: finales.filter(x => x >= 6).length, reprobados: finales.filter(x => x < 6).length,
      sinCalificar: filas.length - finales.length,
      asistencia: asisList.length ? Math.round(asisList.reduce((s, x) => s + x, 0) / asisList.length) : null,
    });
  };

  const seguimiento = () => seguimientoRiesgo(datos(), riesgos.map(r => ({
    ...r,
    observaciones: anot.filter(x => x.matricula === r.matricula && x.tipo === 'atencion').map(x => ({ fecha: x.fecha, texto: x.texto })),
    acciones: anot.filter(x => x.matricula === r.matricula && x.tipo === 'accion').map(x => ({ fecha: x.fecha, texto: x.texto })),
  })));

  const registro = () => registroClases(datos(), [...dia].sort((a, b) => a.fecha.localeCompare(b.fecha)).map(d => {
    const s = ses.find(x => x.fecha === d.fecha);
    const faltas = s ? Object.values(s.marcas).filter(v => v === 'F').length : 0;
    return {
      fecha: d.fecha, descripcion: d.texto,
      asistencia: s ? `${alumnos.length - faltas} de ${alumnos.length}` : '',
      actividades: cols.filter(c => c.fecha === d.fecha).map(c => c.nombre),
    };
  }));

  const diagnostico = () => {
    const e = estadisticaClase(alumnos, cols, notas, ses, !!grupo.vaciasCuentanCero, grupo.ponderacion);
    const lineasClase = textoClaseParaPlaneacion(grupo, e, [], []).split('\n').slice(1);
    const ant = textoParaPlaneacion(grupo, resumirResultados(alumnos, resultados)).split('\n').slice(1).filter(l => !l.startsWith('Quien no'));
    const conectados = alumnos.filter(a => a.cuentaUid).length;
    return diagnosticoGrupo(datos(), [
      { titulo: 'Composición del grupo', lineas: [`${alumnos.length} alumnos activos; ${conectados} ya usan Antología.`] },
      { titulo: 'Aprovechamiento y asistencia', lineas: lineasClase },
      { titulo: 'Diagnósticos contestados en Antología', lineas: ant },
      { titulo: 'Lo observado en clase (diario del docente)', lineas: [...dia].slice(0, 5).map(d => `- ${d.fecha}: ${d.texto.replace(/\s+/g, ' ').slice(0, 400)}`) },
      { titulo: 'Alumnos que requieren atención', lineas: [riesgos.length ? `${riesgos.length} alumno(s) con señales de riesgo; el detalle y las acciones están en el documento de seguimiento.` : 'Ninguno con los registros actuales.'] },
    ]);
  };

  const tarjetas = [
    { id: 'Reporte de evaluación', Icono: ClipboardList, color: 'indigo', hacer: reporte,
      que: 'Calificaciones (por parcial y final), asistencia y faltas de cada alumno, con observaciones y el resumen del grupo.',
      dato: `${alumnos.length} alumnos · ${cols.length} actividades` },
    { id: 'Seguimiento de alumnos en riesgo', Icono: AlertTriangle, color: 'rose', hacer: seguimiento,
      que: 'Quién va mal y por qué (promedio, faltas, entregas) y las acciones de apoyo que registraste en su ficha.',
      dato: `${riesgos.length} en riesgo · ${riesgos.filter(r => anot.some(x => x.matricula === r.matricula && x.tipo === 'accion')).length} con acciones registradas` },
    { id: 'Registro de clases impartidas', Icono: CalendarCheck, color: 'emerald', hacer: registro,
      que: 'Cada clase con lo que se trabajó (tu diario), la asistencia de ese día y las actividades evaluadas.',
      dato: `${dia.length} clases en el diario` },
    { id: 'Diagnóstico del grupo', Icono: Stethoscope, color: 'violet', hacer: diagnostico,
      que: 'Composición, aprovechamiento, asistencia, resultados de Antología y lo observado en clase.',
      dato: `${resumirResultados(alumnos, resultados).length} diagnósticos de Antología` },
  ] as const;
  const colores: Record<string, string> = { indigo: 'bg-indigo-100 text-indigo-700', rose: 'bg-rose-100 text-rose-700', emerald: 'bg-emerald-100 text-emerald-700', violet: 'bg-violet-100 text-violet-700' };

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <p className="text-sm text-slate-700">Estos documentos salen de lo que ya registraste: <b>no se vuelve a capturar nada</b>. Salen en Word para que los revises y, si tu plantel pide otro formato, copies las tablas. Solo dicen lo que está registrado; lo que falta aparece como "sin registro".</p>
        <div className="grid sm:grid-cols-4 gap-2">
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Escuela<input className={input} value={escuela} onChange={e => setEscuela(e.target.value)} onBlur={recordar} /></label>
          <label className="text-xs font-semibold text-slate-600">CCT<input className={input} value={cct} onChange={e => setCct(e.target.value)} onBlur={recordar} /></label>
          <label className="text-xs font-semibold text-slate-600">Docente<input className={input} value={docente} onChange={e => setDocente(e.target.value)} onBlur={recordar} /></label>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-600">Periodo:</span>
          {[null, ...parciales.map((_, i) => i)].map(i => (
            <button key={String(i)} onClick={() => setPeriodo(i)} className={`px-3 py-1 rounded-full border ${periodo === i ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-700'}`}>
              {i === null ? (parciales.length ? 'Semestre completo' : 'Todo lo registrado') : parciales[i].nombre}
            </button>
          ))}
          {!parciales.length && <span className="text-xs text-slate-500">Configura tus parciales en el Cuaderno (botón "Parciales") para sacar reportes por parcial.</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tarjetas.map(t => (
          <article key={t.id} className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-xl ${colores[t.color]}`}><t.Icono className="w-5 h-5" /></span>
              <h3 className="font-bold text-slate-800">{t.id}</h3>
            </div>
            <p className="text-sm text-slate-600 flex-1">{t.que}</p>
            <p className="text-xs text-slate-500">{t.dato}</p>
            <button onClick={() => descargar(t.id, t.hacer)} disabled={!!generando || !alumnos.length} className={`${boton} bg-indigo-600 text-white self-start`}>
              {generando === t.id ? <><FileText className="w-4 h-4 animate-pulse" /> Armando…</> : <><Download className="w-4 h-4" /> Descargar Word</>}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

const corta = (f: string) => (f ? `${f.slice(8, 10)}/${f.slice(5, 7)}` : '');
