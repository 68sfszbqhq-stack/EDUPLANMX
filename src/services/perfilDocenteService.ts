/**
 * PERFIL DOCENTE
 *
 * Guarda cómo da clase cada docente —recursos de su aula, estilo de enseñanza, su sello—
 * y lo convierte en instrucciones para la IA. Es lo que hace que dos docentes con la misma
 * materia y el mismo tema reciban planeaciones distintas: las suyas.
 *
 * Se guarda en Firestore ligado a la cuenta (un documento por usuario). Si el docente está
 * usando la demo sin cuenta, se guarda en su navegador para que igual pueda probarlo.
 *
 * Contestarlo es OPCIONAL: sin perfil, la generación funciona exactamente como antes.
 */

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLECCION = 'perfiles_docentes';
const CLAVE_LOCAL = 'perfilDocente';

/** Respuestas del cuestionario. Todas opcionales: se puede contestar a medias. */
export interface PerfilDocente {
    // Bloque 1 — quién es
    nombre?: string;
    formacion?: string;
    anios?: string;
    funcion?: string;

    // Bloque 2 — qué imparte
    materias?: string;
    grupos?: string;
    fueraPerfil?: string;

    // Bloque 3 — con qué cuenta (lo que más condiciona las actividades)
    proyector?: string;
    internetAula?: string;
    salaComputo?: string;
    equipoPropio?: string;
    accesoCasa?: string;
    ajustes?: string;

    // Bloque 4 — estilo (Grasha-Riechmann, escala 1-5)
    gExperto?: number;
    gAutoridad?: number;
    gModelo?: number;
    gFacilitador?: number;
    gDelegador?: number;

    // Bloque 5 — Spectrum de Mosston (estilos marcados)
    mosston?: string[];

    // Bloque 6 — su sello
    mejorClase?: string;
    nuncaFalta?: string;
    nuncaHarias?: string;
    comoTrabajan?: string;
    evidencia?: string;
    tarea?: string;
    sinRecursos?: string;
    error?: string;
    aprovechaFormacion?: string;
    recuerden?: string;

    // Bloque 7 — lo entregable
    formatoEntrega?: string;
    queRevisan?: string;
    cuandoEntrega?: string;

    actualizadoEn?: string;
}

const ETIQUETAS_MOSSTON: Record<string, string> = {
    mando: 'mando directo (el docente marca el ritmo)',
    tareas: 'asignación de tareas (cada quien a su ritmo)',
    reciproca: 'enseñanza recíproca (en parejas, con ficha de observación)',
    autoeval: 'autoevaluación guiada',
    inclusion: 'inclusión por niveles de dificultad',
    descubrimiento: 'descubrimiento guiado (preguntas encadenadas)',
    divergente: 'resolución divergente (varias soluciones válidas)',
    individualizado: 'programa individualizado',
};

const ESTILOS_GRASHA: [keyof PerfilDocente, string][] = [
    ['gExperto', 'Experto: domina el contenido y exige precisión en los términos'],
    ['gAutoridad', 'Autoridad formal: estructura, consignas cerradas y criterios definidos por el docente'],
    ['gModelo', 'Modelo personal: enseña mostrando, con ejemplos de su propia experiencia'],
    ['gFacilitador', 'Facilitador: devuelve preguntas y acompaña por equipos en vez de exponer'],
    ['gDelegador', 'Delegador: da autonomía y consensúa criterios con el grupo'],
];

export const perfilDocenteService = {

    /** Trae el perfil del docente. Devuelve null si nunca contestó el cuestionario. */
    async obtener(userId?: string): Promise<PerfilDocente | null> {
        if (userId) {
            try {
                const snap = await getDoc(doc(db, COLECCION, userId));
                if (snap.exists()) return snap.data() as PerfilDocente;
            } catch (e) {
                console.warn('No se pudo leer el perfil docente de Firestore:', e);
            }
        }
        // Sin cuenta (demo) o si Firestore falló: se intenta el navegador.
        try {
            const local = localStorage.getItem(CLAVE_LOCAL);
            if (local) return JSON.parse(local) as PerfilDocente;
        } catch { /* localStorage no disponible */ }

        return null;
    },

    /** Guarda el perfil. Siempre deja copia en el navegador, aunque haya cuenta. */
    async guardar(perfil: PerfilDocente, userId?: string): Promise<void> {
        const conFecha = { ...perfil, actualizadoEn: new Date().toISOString() };

        try {
            localStorage.setItem(CLAVE_LOCAL, JSON.stringify(conFecha));
        } catch { /* sin localStorage, se sigue */ }

        if (userId) {
            await setDoc(doc(db, COLECCION, userId), {
                ...conFecha,
                userId,
                actualizadoTimestamp: Timestamp.now(),
            }, { merge: true });
        }
    },

    /**
     * Convierte el perfil en instrucciones para la IA.
     *
     * Devuelve cadena vacía si el docente no ha contestado nada: en ese caso el prompt
     * queda idéntico al que se usaba antes de existir esta función.
     */
    generarBloquePrompt(perfil: PerfilDocente | null): string {
        if (!perfil) return '';

        const partes: string[] = [];

        // --- Recursos reales del aula: lo que más condiciona qué se puede pedir ---
        const recursos: string[] = [];
        if (perfil.proyector) recursos.push(`Proyector: ${perfil.proyector}`);
        if (perfil.internetAula) recursos.push(`Internet en el aula: ${perfil.internetAula}`);
        if (perfil.salaComputo) recursos.push(`Sala de cómputo: ${perfil.salaComputo}`);
        if (perfil.equipoPropio) recursos.push(`Equipo del docente: ${perfil.equipoPropio}`);
        if (perfil.accesoCasa) recursos.push(`Acceso a equipo en casa del estudiantado: ${perfil.accesoCasa}`);
        if (perfil.grupos) recursos.push(`Grupos: ${perfil.grupos}`);
        if (perfil.ajustes) recursos.push(`Estudiantes que requieren ajustes: ${perfil.ajustes}`);

        if (recursos.length) {
            partes.push(
                `RECURSOS REALES DEL AULA — RESPÉTALOS SIN EXCEPCIÓN:\n` +
                recursos.map(r => `  - ${r}`).join('\n') +
                `\n  REGLA: no diseñes ninguna actividad que exceda estos recursos. Si el internet ` +
                `soporta pocos dispositivos, trabaja por equipos compartiendo un dispositivo. Si no ` +
                `hay sala de cómputo, no la supongas. Toda actividad que use tecnología debe llevar ` +
                `una ruta alterna equivalente, y con el mismo valor, para quien no tenga acceso.`
            );
        }

        // --- Estilo dominante (Grasha-Riechmann) ---
        const puntajes = ESTILOS_GRASHA
            .map(([clave, desc]) => ({ desc, valor: Number(perfil[clave] ?? 0) }))
            .filter(x => x.valor > 0)
            .sort((a, b) => b.valor - a.valor);

        if (puntajes.length) {
            const dominantes = puntajes.slice(0, 2).map(p => p.desc);
            partes.push(
                `ESTILO DE ENSEÑANZA DOMINANTE (inventario de Grasha-Riechmann):\n` +
                dominantes.map(d => `  - ${d}`).join('\n') +
                `\n  Diseña las actividades desde ese estilo, no desde uno genérico.`
            );
        }

        // --- Reparto de decisiones (Mosston) ---
        if (perfil.mosston?.length) {
            partes.push(
                `ESTILOS DEL SPECTRUM DE MOSSTON CON LOS QUE SE IDENTIFICA:\n` +
                perfil.mosston.map(m => `  - ${ETIQUETAS_MOSSTON[m] || m}`).join('\n') +
                `\n  Prefiere estos estilos al proponer la metodología de la secuencia.`
            );
        }

        // --- El sello personal: lo que más peso tiene ---
        const sello: string[] = [];
        if (perfil.nuncaFalta) sello.push(`Nunca falta en sus clases: ${perfil.nuncaFalta}. INCLÚYELO.`);
        if (perfil.comoTrabajan) sello.push(`Prefiere que el estudiantado trabaje así: ${perfil.comoTrabajan}`);
        if (perfil.evidencia) sello.push(`Lo que para este docente demuestra que aprendieron: ${perfil.evidencia}. Prioriza evidencias de ese tipo.`);
        if (perfil.error) sello.push(`Trato del error: ${perfil.error}`);
        if (perfil.tarea) sello.push(`Postura sobre la tarea de casa: ${perfil.tarea}`);
        if (perfil.sinRecursos) sello.push(`Cuando un estudiante no tiene los recursos: ${perfil.sinRecursos}`);
        if (perfil.nuncaHarias) sello.push(`NUNCA propongas nada de esto, va contra su forma de dar clase: ${perfil.nuncaHarias}`);
        if (perfil.mejorClase) sello.push(`Su mejor clase, como referencia de ambición: ${perfil.mejorClase}. No subestimes al grupo.`);
        if (perfil.recuerden) sello.push(`Lo que quiere que sus estudiantes recuerden años después: ${perfil.recuerden}. Engancha con esto cuando el contenido lo permita.`);
        if (perfil.aprovechaFormacion) sello.push(`Aprovecha su formación de origen así: ${perfil.aprovechaFormacion}`);

        if (sello.length) {
            partes.push(`SELLO DEL DOCENTE — ESTO MANDA SOBRE CUALQUIER SUGERENCIA GENÉRICA:\n` +
                sello.map(s => `  - ${s}`).join('\n'));
        }

        // --- Qué le revisan al entregar ---
        if (perfil.queRevisan) {
            partes.push(
                `LO QUE MÁS LE REVISAN AL ENTREGAR: ${perfil.queRevisan}\n` +
                `  REGLA CRÍTICA: todo lo que declares en la fundamentación, el ámbito socioemocional, ` +
                `la vinculación PAEC o la transversalidad debe poder rastrearse a una actividad concreta ` +
                `de la secuencia. Nada declarativo que no se cumpla más abajo.`
            );
        }

        if (!partes.length) return '';

        return `\n\n=== PERFIL DEL DOCENTE QUE VA A DAR ESTA CLASE ===\n` +
            `Esta planeación es para un docente concreto, no para un docente promedio.\n\n` +
            partes.join('\n\n') +
            `\n=== FIN DEL PERFIL DOCENTE ===\n`;
    },
};
