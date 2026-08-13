/**
 * CUESTIONARIO DE PERFIL Y ESTILO DOCENTE
 *
 * Se contesta una vez por semestre y hace que las planeaciones suenen al docente que las
 * va a dar, en lugar de a una plantilla. Es opcional: sin contestarlo, la generación
 * funciona igual que siempre.
 *
 * Los bloques de estilo se apoyan en las dimensiones de dos instrumentos citados en la
 * literatura —el Teaching Style Inventory de Grasha-Riechmann y el Spectrum de estilos de
 * enseñanza de Mosston—, adaptadas a este contexto. No son los reactivos originales.
 */

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, ClipboardList } from 'lucide-react';
import { perfilDocenteService, PerfilDocente } from '../src/services/perfilDocenteService';

interface Props {
    userId?: string;
    onListo?: () => void;
}

const ESCALA: { campo: keyof PerfilDocente; etiqueta: string }[] = [
    { campo: 'gExperto', etiqueta: 'Explico con profundidad y me aseguro de que dominen los términos correctos' },
    { campo: 'gAutoridad', etiqueta: 'Doy consignas cerradas, con pasos y tiempos definidos, y yo fijo los criterios' },
    { campo: 'gModelo', etiqueta: 'Hago yo primero la tarea frente al grupo y uso ejemplos de mi propia experiencia' },
    { campo: 'gFacilitador', etiqueta: 'Devuelvo preguntas en vez de dar la respuesta, y acompaño por equipos' },
    { campo: 'gDelegador', etiqueta: 'Dejo que decidan cómo resolver y consensúo los criterios con el grupo' },
];

const MOSSTON: { valor: string; etiqueta: string }[] = [
    { valor: 'mando', etiqueta: 'Yo marco el ritmo y todos hacen lo mismo al mismo tiempo' },
    { valor: 'tareas', etiqueta: 'Doy la tarea y cada quien avanza a su ritmo' },
    { valor: 'reciproca', etiqueta: 'Trabajan en parejas: uno ejecuta y el otro observa con una ficha' },
    { valor: 'autoeval', etiqueta: 'Cada quien evalúa su trabajo contra un criterio que yo doy' },
    { valor: 'inclusion', etiqueta: 'La misma tarea tiene varios niveles y cada quien elige el suyo' },
    { valor: 'descubrimiento', etiqueta: 'Hago preguntas encadenadas hasta que llegan solos a la respuesta' },
    { valor: 'divergente', etiqueta: 'Planteo problemas con varias soluciones válidas' },
    { valor: 'individualizado', etiqueta: 'Cada estudiante diseña su propio programa de trabajo' },
];

const ABIERTAS: { campo: keyof PerfilDocente; etiqueta: string; ayuda?: string }[] = [
    { campo: 'mejorClase', etiqueta: 'Describe tu mejor clase: qué pasó y por qué funcionó' },
    { campo: 'nuncaFalta', etiqueta: '¿Qué es lo que NUNCA falta en tus clases?' },
    { campo: 'nuncaHarias', etiqueta: '¿Qué es lo que NUNCA harías, aunque te lo pidieran?' },
    { campo: 'comoTrabajan', etiqueta: '¿Cómo prefieres que trabajen en el aula?', ayuda: 'papel, dispositivos, movimiento, discusión' },
    { campo: 'evidencia', etiqueta: '¿Qué evidencia te dice de verdad que aprendieron?' },
    { campo: 'tarea', etiqueta: '¿La tarea de casa es parte de tu método o cierras todo en el aula?' },
    { campo: 'sinRecursos', etiqueta: 'Si un estudiante no tiene los recursos que pide la actividad, ¿cómo lo resuelves?' },
    { campo: 'error', etiqueta: '¿Cómo tratas el error en tu clase?' },
    { campo: 'aprovechaFormacion', etiqueta: '¿Qué de tu formación de origen aprovechas para dar esta materia?' },
    { campo: 'recuerden', etiqueta: '¿Qué te gustaría que recordaran de tu clase dentro de cinco años?' },
];

const CuestionarioDocente: React.FC<Props> = ({ userId, onListo }) => {
    const [perfil, setPerfil] = useState<PerfilDocente>({});
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        perfilDocenteService.obtener(userId)
            .then(p => { if (p) setPerfil(p); })
            .finally(() => setCargando(false));
    }, [userId]);

    const set = (campo: keyof PerfilDocente, valor: any) => {
        setPerfil(prev => ({ ...prev, [campo]: valor }));
        setGuardado(false);
    };

    const toggleMosston = (valor: string) => {
        const actuales = perfil.mosston || [];
        set('mosston', actuales.includes(valor)
            ? actuales.filter(v => v !== valor)
            : [...actuales, valor]);
    };

    const guardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            await perfilDocenteService.guardar(perfil, userId);
            setGuardado(true);
            onListo?.();
        } catch (e: any) {
            setError(e.message || 'No se pudo guardar. Tus respuestas quedaron en este navegador.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return <div className="flex items-center gap-2 p-8 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando tu perfil...
        </div>;
    }

    const Texto = ({ campo, etiqueta, ayuda, filas = 2 }: {
        campo: keyof PerfilDocente; etiqueta: string; ayuda?: string; filas?: number;
    }) => (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1">{etiqueta}</label>
            {ayuda && <span className="block text-xs text-slate-400 mb-1">{ayuda}</span>}
            <textarea
                rows={filas}
                value={String(perfil[campo] ?? '')}
                onChange={e => set(campo, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-28">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-6 mb-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" /> Cómo doy clase
                </h1>
                <p className="text-sm text-indigo-100 mt-2">
                    Contéstalo una vez por semestre. Con esto tus planeaciones dejan de ser genéricas
                    y se parecen a tus clases: tus recursos reales, tu estilo y tu forma de evaluar.
                    Es opcional y puedes dejarlo a medias — se guarda como vaya.
                </p>
            </div>

            {/* Bloque 1 y 2 */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h2 className="font-bold text-slate-800 mb-3">Quién eres y qué das</h2>
                <Texto campo="nombre" etiqueta="Nombre, como debe aparecer en el documento" filas={1} />
                <Texto campo="formacion" etiqueta="Formación de origen" filas={1} />
                <Texto campo="anios" etiqueta="Años dando clase, y de esos cuántos en Media Superior" filas={1} />
                <Texto campo="funcion" etiqueta="¿Tienes otra función además de la docencia?" ayuda="tutoría, jefatura, academia, ATP" filas={1} />
                <Texto campo="materias" etiqueta="Asignaturas de este semestre, con su semestre y horas" />
                <Texto campo="grupos" etiqueta="Número de grupos y estudiantes por grupo" filas={1} />
                <Texto campo="fueraPerfil" etiqueta="¿Alguna te queda fuera de tu formación? ¿Cuál te cuesta más preparar?" />
            </section>

            {/* Bloque 3 */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h2 className="font-bold text-slate-800">Con qué cuentas</h2>
                <p className="text-xs text-slate-500 mb-3">
                    Es el bloque que más cambia lo que se te genera: de aquí sale qué actividades
                    son posibles en tu aula y cuáles no.
                </p>
                <Texto campo="proyector" etiqueta="¿Hay proyector en tu salón? ¿Fijo o hay que pedirlo?" filas={1} />
                <Texto campo="internetAula" etiqueta="¿Hay internet en el aula? ¿Cuántos dispositivos aguanta?" filas={1} />
                <Texto campo="salaComputo" etiqueta="¿Hay sala de cómputo? ¿Cuántos equipos y cómo se aparta?" filas={1} />
                <Texto campo="equipoPropio" etiqueta="¿Llevas equipo propio al salón?" filas={1} />
                <Texto campo="accesoCasa" etiqueta="¿Qué proporción de tu grupo tiene equipo y conexión en casa?" filas={1} />
                <Texto campo="ajustes" etiqueta="¿Hay estudiantes que requieran ajustes?" ayuda="neurodivergencia, discapacidad, trabajo, situación familiar" />
            </section>

            {/* Bloque 4 */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h2 className="font-bold text-slate-800">Cómo das clase</h2>
                <p className="text-xs text-slate-500 mb-4">
                    Del 1 (nunca) al 5 (siempre). Dimensiones del inventario de Grasha-Riechmann.
                </p>
                {ESCALA.map(({ campo, etiqueta }) => (
                    <div key={String(campo)} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                        <span className="text-sm text-slate-700">{etiqueta}</span>
                        <div className="flex gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => set(campo, n)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition ${Number(perfil[campo]) === n
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >{n}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* Bloque 5 */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h2 className="font-bold text-slate-800">Quién decide qué</h2>
                <p className="text-xs text-slate-500 mb-3">
                    Spectrum de Mosston. Marca las que se parezcan a tu clase.
                </p>
                {MOSSTON.map(({ valor, etiqueta }) => (
                    <label key={valor} className="flex items-start gap-3 py-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={(perfil.mosston || []).includes(valor)}
                            onChange={() => toggleMosston(valor)}
                            className="mt-1 w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm text-slate-700">{etiqueta}</span>
                    </label>
                ))}
            </section>

            {/* Bloque 6 */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h2 className="font-bold text-slate-800">Tu sello</h2>
                <p className="text-xs text-slate-500 mb-3">
                    Las preguntas que más peso tienen: de aquí sale lo que distingue tus planeaciones.
                </p>
                {ABIERTAS.map(p => <Texto key={String(p.campo)} {...p} />)}
            </section>

            {/* Bloque 7 */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
                <h2 className="font-bold text-slate-800 mb-3">Lo entregable</h2>
                <Texto campo="formatoEntrega" etiqueta="¿Qué formato exige tu supervisión o academia?" filas={1} />
                <Texto campo="queRevisan" etiqueta="¿Quién revisa tus planeaciones y qué es lo primero que te observan?" />
                <Texto campo="cuandoEntrega" etiqueta="¿Cuándo las entregas: por sesión, por parcial, por semestre?" filas={1} />
            </section>

            {/* Barra de guardado */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-center gap-4 z-40">
                <button
                    onClick={guardar}
                    disabled={guardando}
                    className="flex items-center gap-2 px-7 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-300"
                >
                    {guardando
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                        : <><Save className="w-4 h-4" /> Guardar mi perfil</>}
                </button>
                {guardado && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Listo. Tus próximas planeaciones ya usan tu perfil.
                    </span>
                )}
                {error && <span className="text-sm text-amber-600">{error}</span>}
            </div>
        </div>
    );
};

export default CuestionarioDocente;
