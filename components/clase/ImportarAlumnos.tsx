import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { AlumnoLista, VistaPrevia, compararLista } from '../../src/features/grupos/model';
import { leerExcel } from '../../src/features/clase/excel';
import { input, boton } from './ui';

/**
 * Pegar desde Excel o subir el archivo. La vista previa se arma mientras pegas:
 * cada alumno nuevo trae una casilla para quitarlo si se coló un título.
 * Devuelve la vista ya filtrada con lo que el docente dejó marcado.
 */
export default function ImportarAlumnos({ existentes, onCambio, onError }: {
  existentes: AlumnoLista[];
  onCambio: (v: VistaPrevia | null, aplicarCambios: boolean) => void;
  onError: (e: string) => void;
}) {
  const [texto, setTexto] = useState('');
  const [quitadas, setQuitadas] = useState<Set<number>>(new Set());
  const [aplicarCambios, setAplicarCambios] = useState(true);
  const [leyendo, setLeyendo] = useState(false);

  const vista = useMemo(() => (texto.trim() ? compararLista(texto, existentes) : null), [texto, existentes]);

  // Al cambiar el texto, las filas dudosas (títulos) vienen desmarcadas.
  const actualizar = (t: string) => {
    setTexto(t);
    const v = t.trim() ? compararLista(t, existentes) : null;
    const q = new Set((v?.nuevos ?? []).filter(f => f.dudosa).map(f => f.fila));
    setQuitadas(q);
    avisar(v, q, aplicarCambios);
  };
  const avisar = (v: VistaPrevia | null, q: Set<number>, ap: boolean) =>
    onCambio(v && { ...v, nuevos: v.nuevos.filter(f => !q.has(f.fila)) }, ap);

  const alternar = (fila: number) => {
    const q = new Set(quitadas);
    q.has(fila) ? q.delete(fila) : q.add(fila);
    setQuitadas(q); avisar(vista, q, aplicarCambios);
  };

  const subir = async (f?: File) => {
    if (!f) return;
    setLeyendo(true);
    try {
      const t = /\.xlsx$/i.test(f.name) ? await leerExcel(await f.arrayBuffer())
        : /\.xls$/i.test(f.name) ? (() => { throw new Error('Ese es un Excel antiguo (.xls). Ábrelo y guárdalo como .xlsx, o copia la columna de nombres y pégala aquí.'); })()
        : await f.text();
      actualizar(t);
    } catch (e: any) { onError(e.message); } finally { setLeyendo(false); }
  };

  const nuevos = vista?.nuevos ?? [];
  const marcados = nuevos.filter(f => !quitadas.has(f.fila)).length;

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <textarea className={`${input} font-mono text-xs h-56`} value={texto} onChange={e => actualizar(e.target.value)} aria-label="Lista de alumnos"
            placeholder={'Copia en Excel la columna de nombres y pégala aquí.\n\nPérez López Ana\nRuiz Gómez Beto\nSánchez Díaz Carla\n\nTambién sirve con apellidos en columnas separadas,\no con matrícula si la tienes.'} />
          <label className={`${boton} border border-slate-300 text-slate-700 cursor-pointer`}>
            <FileSpreadsheet className="w-4 h-4" /> {leyendo ? 'Leyendo…' : 'O sube el archivo de Excel'}
            <input type="file" accept=".xlsx,.xls,.csv,.txt,.tsv" className="sr-only" onChange={e => { subir(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>

        <div className="border border-slate-200 rounded-xl p-3 h-64 overflow-y-auto text-sm bg-slate-50/50">
          {!vista ? <p className="text-slate-400">Aquí verás a tus alumnos en cuanto pegues la lista.</p> : (
            <>
              <p className="font-semibold text-slate-700 mb-2">
                {marcados} {marcados === 1 ? 'alumno nuevo' : 'alumnos nuevos'}
                {vista.sinCambios.length > 0 && <span className="font-normal text-slate-500"> · {vista.sinCambios.length} ya estaban</span>}
              </p>
              <ol className="space-y-0.5">
                {nuevos.map((f, i) => (
                  <li key={f.fila}>
                    <label className={`flex items-center gap-2 ${quitadas.has(f.fila) ? 'text-slate-400 line-through' : ''}`}>
                      <input type="checkbox" checked={!quitadas.has(f.fila)} onChange={() => alternar(f.fila)} />
                      <span className="w-6 text-right text-slate-400 text-xs">{i + 1}</span>
                      <span className="flex-1">{f.nombre}</span>
                      {f.matricula && <span className="font-mono text-xs text-slate-500">{f.matricula}</span>}
                      {f.dudosa && <span className="text-[10px] text-amber-700">¿título?</span>}
                    </label>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>

      {vista && (
        <div className="space-y-1 text-sm">
          {nuevos.some(f => !f.matricula) && (
            <p className="text-slate-600">Quien no trae matrícula recibe una <b>clave</b> de 6 letras y números para entrar a Antología. Las verás en la pestaña Alumnos y las puedes imprimir.</p>
          )}
          {vista.cambios.length > 0 && (
            <details open className="text-amber-800"><summary className="cursor-pointer font-semibold">{vista.cambios.length} con el nombre escrito distinto</summary>
              <ul className="ml-5 list-disc">{vista.cambios.map(c => <li key={c.matricula}>{c.antes} → <b>{c.despues}</b></li>)}</ul>
              <label className="flex items-center gap-2 text-slate-700"><input type="checkbox" checked={aplicarCambios} onChange={e => { setAplicarCambios(e.target.checked); avisar(vista, quitadas, e.target.checked); }} /> Corregir los nombres</label>
            </details>
          )}
          {vista.nombresRepetidos.length > 0 && (
            <p className="text-amber-800"><AlertTriangle className="inline w-4 h-4 mr-1" />Nombre repetido: {vista.nombresRepetidos.map(r => r.nombre).join(', ')}. Se agregan los dos; si es un error, desmarca uno.</p>
          )}
          {vista.repetidosEnArchivo.length > 0 && (
            <p className="text-rose-700"><AlertTriangle className="inline w-4 h-4 mr-1" />Matrícula repetida en la lista: {vista.repetidosEnArchivo.map(r => `${r.matricula} (filas ${r.filas.join(', ')})`).join('; ')}. No se agregan hasta que la corrijas.</p>
          )}
          {vista.invalidas.length > 0 && (
            <p className="text-slate-500">Se ignoraron {vista.invalidas.length} filas sin nombre.</p>
          )}
          {vista.noVienen.length > 0 && existentes.length > 0 && (
            <p className="text-slate-500">{vista.noVienen.length} de tu clase no vienen en esta lista; no se borra a nadie.</p>
          )}
        </div>
      )}
    </div>
  );
}
