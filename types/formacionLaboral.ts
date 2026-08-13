/**
 * Estructura curricular de la Formación Laboral Básica (DGB/SEP).
 *
 * NO es una variante del Currículum Fundamental: es otro modelo curricular.
 * Donde el fundamental tiene Progresión → Metas → Categorías, el laboral tiene
 * Módulo → Submódulo → Competencia Laboral Básica → Actividad clave.
 *
 * Verificado contra los programas oficiales en data/pdfs_dgb/ (edición 2025,
 * generación 2023-2026): 4 módulos y 8 submódulos por programa, de 3º a 6º semestre.
 *
 * Equivalencia acordada con la lista de cotejo de la ATP: lo que ella llama
 * "Resultado de Aprendizaje" es la Competencia Laboral Básica del programa oficial.
 */

/** Un renglón de la lista de cotejo oficial que trae el propio programa. */
export interface IndicadorEvaluacion {
    numero: number;
    texto: string;
}

/**
 * Un criterio de rúbrica.
 *
 * NOTA IMPORTANTE sobre `descripcionNiveles`: en el PDF la rúbrica es una tabla, y al
 * extraer el texto las cuatro descripciones (una por nivel) quedan pegadas sin ningún
 * separador. Repartirlas entre los niveles sería adivinar, así que se guardan juntas
 * y tal cual. El docente ve la rúbrica oficial completa y la app no inventa cortes.
 */
export interface CriterioRubrica {
    criterio: string;       // "ANÁLISIS", "SOCIODRAMA"…
    puntos?: number;        // los que vienen entre paréntesis
    descripcionNiveles: string;
}

/** Los dos instrumentos que usan los programas laborales. */
export type TipoInstrumento = 'lista-cotejo' | 'rubrica';

/**
 * Evidencia con su instrumento de evaluación. Viene tal cual del programa oficial,
 * así que el instrumento no lo inventa la IA: lo dicta la DGB.
 */
export interface EvidenciaEvaluacion {
    nombre: string; // "Folleto", "Guía de actividades"… o genérico si el programa no lo nombra
    tipoInstrumento: TipoInstrumento;
    /** Solo en lista de cotejo */
    indicadores: IndicadorEvaluacion[];
    /** Solo en rúbrica */
    niveles: string[];              // ÓPTIMO, ADECUADO, SUFICIENTE, DEBE MEJORAR
    criterios: CriterioRubrica[];
}

export interface SubmoduloLaboral {
    numero: number;
    nombre: string;
    /** HMD: horas de clase con el docente */
    horasMediacionDocente: number;
    /** HEI: horas de estudio independiente */
    horasEstudioIndependiente: number;
    /** La ATP la pide como "Resultado de Aprendizaje" */
    competenciaLaboralBasica: string;
    /** Actividad clave: describe qué se hace. Es el corazón de la planeación laboral. */
    actividadClave: string;
    evidencias: EvidenciaEvaluacion[];
}

export interface ModuloLaboral {
    numero: number;
    nombre: string;
    horasMediacionDocente: number;
    horasEstudioIndependiente: number;
    proposito: string;
    submodulos: SubmoduloLaboral[];
}

export type CalidadExtraccion = 'BUENA' | 'PARCIAL' | 'FALLIDA';

export interface ProgramaLaboral {
    nombre: string;
    slug: string;
    /** Clave del programa, ej. "3012701003-25" */
    clave?: string;
    generacion: string; // "2023-2026"
    semestres: number[];
    modulos: ModuloLaboral[];
    urlFuente?: string;
    /**
     * Mide la ESTRUCTURA CURRICULAR (módulos, submódulos, competencias, actividades
     * clave y horas), que es lo que se necesita para planear y lo que revisa la ATP.
     * Los instrumentos de evaluación se miden aparte en `coberturaInstrumentos`.
     */
    calidadExtraccion: CalidadExtraccion;
    /**
     * Cuántos submódulos traen su instrumento de evaluación extraído.
     * Cada programa maqueta esa tabla a su manera, así que la cobertura es parcial;
     * donde falta, el docente arma el instrumento a mano y la app no inventa uno.
     */
    coberturaInstrumentos: { conInstrumento: number; total: number };
    /** Qué no se pudo extraer. Se guarda para no confiar a ciegas en el resultado. */
    avisos: string[];
    extraidoEl: string; // ISO
}

/** Suma de horas de todo el programa, para los datos de identificación. */
export function horasTotales(p: ProgramaLaboral) {
    return p.modulos.reduce(
        (acc, m) => ({
            mediacionDocente: acc.mediacionDocente + m.horasMediacionDocente,
            estudioIndependiente: acc.estudioIndependiente + m.horasEstudioIndependiente,
        }),
        { mediacionDocente: 0, estudioIndependiente: 0 }
    );
}

/** Todos los submódulos en una lista plana, para poder elegir uno al planear. */
export function submodulosDe(p: ProgramaLaboral): Array<SubmoduloLaboral & { modulo: number; moduloNombre: string }> {
    return p.modulos.flatMap(m =>
        m.submodulos.map(s => ({ ...s, modulo: m.numero, moduloNombre: m.nombre }))
    );
}
