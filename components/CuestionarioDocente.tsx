/**
 * CUESTIONARIO «CÓMO DOY CLASE»
 *
 * Hace que las planeaciones suenen al docente que las va a dar, en lugar de a una
 * plantilla. Es opcional: sin contestarlo, la generación funciona igual que siempre.
 *
 * Pensado para el docente que menos usa la computadora:
 *  - Una pregunta por pantalla y se contesta tocando opciones; no hay que escribir.
 *  - Solo se pregunta lo que de verdad cambia la planeación (lo que lee
 *    perfilDocenteService.generarBloquePrompt). Nombre, escuela y materias ya los
 *    sabe la cuenta.
 *  - Primero lo que más pesa (los recursos reales del aula). Después de esas 7
 *    preguntas se puede terminar; el resto es para afinar.
 *  - Cada respuesta se guarda al tocarla: si cierra la página, no pierde nada.
 *
 * Las opciones se guardan como texto en los mismos campos de antes, así que los
 * perfiles contestados con la versión larga siguen funcionando.
 *
 * Los bloques de estilo se apoyan en el Teaching Style Inventory de Grasha-Riechmann
 * y en el Spectrum de Mosston, adaptados a este contexto. No son los reactivos originales.
 */

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, ChevronLeft, Check, ClipboardList } from 'lucide-react';
import { perfilDocenteService, PerfilDocente } from '../src/services/perfilDocenteService';

interface Props {
    userId?: string;
    onListo?: () => void;
}

type Opcion = { etiqueta: string; valor: string };

type Pregunta = {
    id: string;
    texto: string;
    ayuda?: string;
    /** 'una': se toca y avanza sola. 'varias': se marcan y se da «Siguiente». */
    tipo: 'una' | 'varias';
    max?: number;
    /** Campo de texto del perfil donde se guarda; Grasha y Mosston se tratan aparte. */
    campo?: keyof PerfilDocente;
    opciones: Opcion[];
};

const SEP = '; ';
const op = (etiqueta: string, valor = etiqueta): Opcion => ({ etiqueta, valor });

const GRASHA: { campo: keyof PerfilDocente; etiqueta: string }[] = [
    { campo: 'gExperto', etiqueta: 'Explico a fondo y cuido que usen los términos correctos' },
    { campo: 'gAutoridad', etiqueta: 'Doy instrucciones claras, con pasos y tiempos' },
    { campo: 'gModelo', etiqueta: 'Primero lo hago yo frente al grupo, con ejemplos míos' },
    { campo: 'gFacilitador', etiqueta: 'Les hago preguntas y los acompaño por equipos' },
    { campo: 'gDelegador', etiqueta: 'Les dejo decidir cómo resolverlo' },
];

// Parte 1: el aula. Es lo que la IA trata como regla que no se rompe.
const AULA: Pregunta[] = [
    {
        id: 'proyector', campo: 'proyector', tipo: 'una', texto: '¿Hay proyector en tu salón?',
        opciones: [op('Sí, fijo en el salón'), op('Hay que apartarlo'), op('No hay proyector')],
    },
    {
        id: 'internetAula', campo: 'internetAula', tipo: 'una', texto: '¿Hay internet en el salón?',
        opciones: [
            op('Sí, alcanza para todo el grupo'),
            op('Solo para pocos dispositivos'),
            op('No hay internet en el salón'),
        ],
    },
    {
        id: 'salaComputo', campo: 'salaComputo', tipo: 'una', texto: '¿Tu escuela tiene sala de cómputo?',
        opciones: [
            op('Sí, y se puede apartar'),
            op('Sí, pero casi nunca está disponible'),
            op('No hay sala de cómputo'),
        ],
    },
    {
        id: 'equipoPropio', campo: 'equipoPropio', tipo: 'una', texto: '¿Qué llevas tú al salón?',
        opciones: [op('Mi laptop'), op('Solo mi celular'), op('Nada, trabajo con pizarrón')],
    },
    {
        id: 'accesoCasa', campo: 'accesoCasa', tipo: 'una',
        texto: '¿Cuántos de tus alumnos tienen computadora e internet en casa?',
        opciones: [op('Casi todos'), op('Como la mitad'), op('Pocos')],
    },
    {
        id: 'grupos', campo: 'grupos', tipo: 'una', texto: '¿Cuántos alumnos tiene un grupo tuyo, más o menos?',
        opciones: [op('Menos de 25'), op('Entre 25 y 40'), op('Más de 40')],
    },
    {
        id: 'ajustes', campo: 'ajustes', tipo: 'varias', texto: '¿Tienes alumnos que necesiten algún ajuste?',
        ayuda: 'Marca todos los que apliquen.',
        opciones: [
            op('No, ninguno'),
            op('TDAH, autismo u otra neurodivergencia'),
            op('Alguna discapacidad'),
            op('Trabajan además de estudiar'),
            op('Situación familiar difícil'),
        ],
    },
];

// Parte 2: cómo da clase. Opcional; afina el tono de la planeación.
const ESTILO: Pregunta[] = [
    {
        id: 'grasha', tipo: 'varias', max: 2, texto: '¿Cuál se parece más a tu forma de dar clase?',
        ayuda: 'Elige una o dos.',
        opciones: GRASHA.map(g => op(g.etiqueta, String(g.campo))),
    },
    {
        id: 'mosston', tipo: 'varias', max: 2, texto: 'Cuando dejas una actividad, ¿qué pasa casi siempre?',
        ayuda: 'Elige una o dos.',
        opciones: [
            op('Yo marco el ritmo y todos hacen lo mismo', 'mando'),
            op('Doy la tarea y cada quien avanza a su ritmo', 'tareas'),
            op('Trabajan en parejas y uno revisa al otro', 'reciproca'),
            op('La misma tarea tiene niveles y cada quien elige', 'inclusion'),
            op('Pregunto hasta que llegan solos a la respuesta', 'descubrimiento'),
            op('Planteo problemas con varias soluciones', 'divergente'),
        ],
    },
    {
        id: 'comoTrabajan', campo: 'comoTrabajan', tipo: 'varias', texto: '¿Cómo te gusta que trabajen en clase?',
        ayuda: 'Marca todas las que uses.',
        opciones: [
            op('En su cuaderno'), op('En equipos'), op('Con el celular'),
            op('Exponiendo al grupo'), op('Debatiendo'), op('Con movimiento o fuera del salón'),
        ],
    },
    {
        id: 'evidencia', campo: 'evidencia', tipo: 'varias', max: 3,
        texto: '¿Qué te demuestra de verdad que aprendieron?', ayuda: 'Elige hasta tres.',
        opciones: [
            op('Un examen'), op('Un producto calificado con rúbrica'), op('Una exposición'),
            op('Un proyecto'), op('El portafolio de evidencias'), op('Su participación en clase'),
        ],
    },
    {
        id: 'tarea', campo: 'tarea', tipo: 'una', texto: '¿Dejas tarea para la casa?',
        opciones: [
            op('Sí, seguido; es parte de mi método'),
            op('Solo para terminar lo de clase'),
            op('No, cierro todo en el aula'),
        ],
    },
    {
        id: 'sinRecursos', campo: 'sinRecursos', tipo: 'varias',
        texto: 'Si un alumno no tiene celular o internet para la actividad, ¿qué haces?',
        ayuda: 'Marca las que uses.',
        opciones: [
            op('Trabaja en equipo con quien sí tiene'),
            op('Le doy una versión en papel'),
            op('Le presto equipo de la escuela'),
            op('Le doy más tiempo'),
        ],
    },
    {
        id: 'error', campo: 'error', tipo: 'una', texto: 'Cuando un alumno se equivoca, ¿qué haces?',
        opciones: [
            op('Lo corrijo en el momento'),
            op('Lo uso para que todo el grupo aprenda'),
            op('Le hago preguntas para que lo descubra solo'),
        ],
    },
    {
        id: 'queRevisan', campo: 'queRevisan', tipo: 'varias', max: 2,
        texto: 'Cuando entregas tu planeación, ¿qué te revisan primero?', ayuda: 'Elige una o dos.',
        opciones: [
            op('Que coincida con el programa oficial'),
            op('Que lo que escribo sí se haga en las actividades'),
            op('El formato y los datos generales'),
            op('Nadie la revisa a detalle'),
        ],
    },
];

const PREGUNTAS = [...AULA, ...ESTILO];

/** Lo que está elegido en una pregunta, según lo guardado en el perfil. */
function elegidas(p: Pregunta, perfil: PerfilDocente): string[] {
    if (p.id === 'grasha') return GRASHA.filter(g => Number(perfil[g.campo]) >= 4).map(g => String(g.campo));
    if (p.id === 'mosston') return perfil.mosston || [];
    const texto = String(perfil[p.campo!] ?? '');
    if (!texto) return [];
    return p.tipo === 'una' ? [texto] : texto.split(SEP);
}

/** Respuesta escrita con la versión anterior del cuestionario que no es ninguna opción. */
function respuestaPrevia(p: Pregunta, perfil: PerfilDocente): string | null {
    if (!p.campo) return null;
    const valores = p.opciones.map(o => o.valor);
    const fuera = elegidas(p, perfil).filter(v => !valores.includes(v));
    return fuera.length ? fuera.join(SEP) : null;
}

const Marco: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="max-w-xl mx-auto pb-16">{children}</div>
);

const CuestionarioDocente: React.FC<Props> = ({ userId, onListo }) => {
    const [perfil, setPerfil] = useState<PerfilDocente>({});
    const [cargando, setCargando] = useState(true);
    // -1 = portada; 0..n-1 = preguntas; 'pausa' = después del aula; 'fin' = resumen
    const [paso, setPaso] = useState<number | 'pausa' | 'fin'>(-1);
    const [error, setError] = useState<string | null>(null);
    const ultimo = useRef<PerfilDocente>({});

    useEffect(() => {
        perfilDocenteService.obtener(userId)
            .then(p => {
                if (p) { setPerfil(p); ultimo.current = p; }
                // Quien ya lo contestó entra directo a su resumen para cambiar algo.
                if (p && PREGUNTAS.some(q => elegidas(q, p).length)) setPaso('fin');
            })
            .finally(() => setCargando(false));
    }, [userId]);

    const guardar = (nuevo: PerfilDocente) => {
        setPerfil(nuevo);
        ultimo.current = nuevo;
        setError(null);
        perfilDocenteService.guardar(nuevo, userId)
            .catch(() => setError('No se pudo guardar en tu cuenta. Tus respuestas quedaron en este navegador.'));
    };

    const aplicar = (p: Pregunta, valores: string[]): PerfilDocente => {
        const base = { ...ultimo.current };
        if (p.id === 'grasha') {
            GRASHA.forEach(g => { (base as any)[g.campo] = valores.includes(String(g.campo)) ? 5 : undefined; });
        } else if (p.id === 'mosston') {
            base.mosston = valores;
        } else {
            (base as any)[p.campo!] = valores.join(SEP) || undefined;
        }
        return base;
    };

    const siguiente = (i: number) => {
        if (i === AULA.length - 1) setPaso('pausa');
        else if (i >= PREGUNTAS.length - 1) { setPaso('fin'); onListo?.(); }
        else setPaso(i + 1);
    };

    if (cargando) {
        return <div className="flex items-center gap-2 p-8 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
        </div>;
    }

    // ── Portada ──────────────────────────────────────────────────────────
    if (paso === -1) {
        return (
            <Marco>
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <ClipboardList className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Cómo doy clase</h1>
                    <p className="text-slate-600 mb-2">
                        Para que tus planeaciones se ajusten a tu salón y a tu forma de enseñar.
                    </p>
                    <p className="text-slate-500 text-sm mb-6">
                        Solo tocas la opción que más se parece. No hay que escribir nada.
                        Con las primeras 7 preguntas (un minuto) ya sirve.
                    </p>
                    <button
                        onClick={() => setPaso(0)}
                        className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700"
                    >
                        Empezar
                    </button>
                </div>
            </Marco>
        );
    }

    // ── Pausa después del aula ───────────────────────────────────────────
    if (paso === 'pausa') {
        return (
            <Marco>
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">¡Listo, ya quedó guardado!</h2>
                    <p className="text-slate-600 mb-6">
                        Tus planeaciones ya no van a pedir cosas que tu salón no tiene.
                        ¿Quieres contestar {ESTILO.length} preguntas más para que también suenen a ti?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setPaso(AULA.length)}
                            className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700"
                        >
                            Sí, sigamos
                        </button>
                        <button
                            onClick={() => { setPaso('fin'); onListo?.(); }}
                            className="px-8 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-200"
                        >
                            Terminar aquí
                        </button>
                    </div>
                </div>
            </Marco>
        );
    }

    // ── Resumen: lo contestado, con «Cambiar» en cada respuesta ──────────
    if (paso === 'fin') {
        const etiquetaDe = (p: Pregunta) => {
            const sel = elegidas(p, perfil);
            if (!sel.length) return null;
            return sel.map(v => p.opciones.find(o => o.valor === v)?.etiqueta ?? v).join(', ');
        };
        const faltan = ESTILO.filter(p => !elegidas(p, perfil).length).length;
        return (
            <Marco>
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tu forma de dar clase</h1>
                </div>
                <p className="text-slate-500 mb-5">Ya está guardado. Tus próximas planeaciones lo usan.</p>
                {error && <p className="text-sm text-amber-600 mb-3">{error}</p>}
                {[{ titulo: 'Tu salón', lista: AULA, inicio: 0 }, { titulo: 'Cómo enseñas', lista: ESTILO, inicio: AULA.length }]
                    .map(({ titulo, lista, inicio }) => (
                        <section key={titulo} className="bg-white border border-slate-200 rounded-2xl mb-4 divide-y divide-slate-100">
                            <h2 className="px-5 pt-4 pb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">{titulo}</h2>
                            {lista.map((p, j) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPaso(inicio + j)}
                                    className="w-full text-left px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50"
                                >
                                    <span>
                                        <span className="block text-sm text-slate-500">{p.texto}</span>
                                        <span className={`block ${etiquetaDe(p) ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                                            {etiquetaDe(p) ?? 'Sin contestar'}
                                        </span>
                                    </span>
                                    <span className="text-indigo-600 text-sm font-medium shrink-0">Cambiar</span>
                                </button>
                            ))}
                        </section>
                    ))}
                {faltan > 0 && (
                    <button
                        onClick={() => setPaso(AULA.length + ESTILO.findIndex(p => !elegidas(p, perfil).length))}
                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                    >
                        Contestar las {faltan} que faltan
                    </button>
                )}
            </Marco>
        );
    }

    // ── Una pregunta ─────────────────────────────────────────────────────
    const i = paso;
    const p = PREGUNTAS[i];
    const sel = elegidas(p, perfil);
    const previa = respuestaPrevia(p, perfil);
    const enAula = i < AULA.length;
    const n = enAula ? i + 1 : i - AULA.length + 1;
    const total = enAula ? AULA.length : ESTILO.length;

    const tocar = (valor: string) => {
        if (p.tipo === 'una') {
            guardar(aplicar(p, [valor]));
            setTimeout(() => siguiente(i), 250);
            return;
        }
        // «Ninguno» excluye a las demás opciones y viceversa.
        const ninguno = p.opciones[0].valor.startsWith('No,') ? p.opciones[0].valor : null;
        let nuevos = sel.filter(v => p.opciones.some(o => o.valor === v));
        if (nuevos.includes(valor)) nuevos = nuevos.filter(v => v !== valor);
        else if (valor === ninguno) nuevos = [valor];
        else {
            nuevos = [...nuevos.filter(v => v !== ninguno), valor];
            if (p.max && nuevos.length > p.max) nuevos = nuevos.slice(-p.max);
        }
        guardar(aplicar(p, nuevos));
    };

    return (
        <Marco>
            {/* Avance */}
            <div className="flex items-center justify-between mb-2 text-sm text-slate-500">
                <button
                    onClick={() => setPaso(i === 0 ? -1 : i === AULA.length ? 'pausa' : i - 1)}
                    className="flex items-center gap-1 py-2 pr-3 hover:text-slate-800"
                >
                    <ChevronLeft className="w-5 h-5" /> Atrás
                </button>
                <span>{enAula ? 'Tu salón' : 'Cómo enseñas'} · {n} de {total}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(n / total) * 100}%` }} />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">{p.texto}</h2>
            <p className="text-slate-500 mb-5">{p.ayuda ?? 'Toca una opción.'}</p>

            {previa && (
                <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
                    Antes escribiste: «{previa}». Si eliges una opción, se reemplaza.
                </p>
            )}

            <div className="space-y-3">
                {p.opciones.map(o => {
                    const activa = sel.includes(o.valor);
                    return (
                        <button
                            key={o.valor}
                            onClick={() => tocar(o.valor)}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-lg flex items-center justify-between gap-3 transition ${activa
                                ? 'border-indigo-600 bg-indigo-50 text-slate-900'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'}`}
                        >
                            {o.etiqueta}
                            {activa && <Check className="w-6 h-6 text-indigo-600 shrink-0" />}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between mt-6">
                <button onClick={() => siguiente(i)} className="py-2 text-slate-500 hover:text-slate-800">
                    Saltar
                </button>
                {p.tipo === 'varias' && (
                    <button
                        onClick={() => siguiente(i)}
                        className="px-10 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700"
                    >
                        Siguiente
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-amber-600 mt-4">{error}</p>}
        </Marco>
    );
};

export default CuestionarioDocente;
