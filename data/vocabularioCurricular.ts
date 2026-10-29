/**
 * Vocabulario curricular del MCCEMS según la generación del programa.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * El Modelo Educativo 2025 renombró casi todos los elementos curriculares. Como las
 * generaciones conviven en el plantel (quien entró en 2023 se gradúa en 2026 con el
 * plan viejo; quien entró en 2025 usa el nuevo), un mismo docente planea con dos
 * vocabularios distintos según el grupo — y la asesoría técnico-pedagógica revisa
 * cada planeación con el vocabulario que le toca.
 *
 * Verificado contra los programas oficiales de la DGB en data/pdfs_dgb/:
 *   conciencia-historica-i--2023-2026.pdf ....... 21 "progresión",  0 "propósito formativo"
 *   conciencia-historica-area--2025-2028.pdf ....  0 "progresión", 13 "propósito formativo"
 *
 * Fuente del cambio: Modelo Educativo 2025 (SEP, 1a ed.), apartado V "Elementos
 * curriculares" — ver docs/normativa/MODELO-EDUCATIVO-2025-MCCEMS.pdf
 */

/** '2024' = plan original (generación 2023-2026) · '2025' = Modelo Educativo 2025 (2025-2028) */
export type ModeloCurricular = '2024' | '2025';

/**
 * Familia de la UAC. En el modelo 2024 determina cómo se nombran sus contenidos:
 * los recursos sociocognitivos usan categorías/subcategorías y las áreas de
 * conocimiento usan conceptos centrales/transversales. No son sinónimos, y
 * confundirlos es de las cosas que la ATP marca.
 */
export type FamiliaUAC = 'recurso' | 'area' | 'socioemocional' | 'laboral';

export interface VocabularioCurricular {
    modelo: ModeloCurricular;
    generacion: string;
    /** Cómo se llama la unidad de aprendizaje */
    unidad: string;
    /** El elemento que ordena la secuencia */
    progresion: string;
    progresionPlural: string;
    /** Lo que el estudiantado debe lograr */
    metas: string;
    /** Los dos niveles de contenido */
    contenidoNivel1: string;
    contenidoNivel2: string;
    /** El horizonte formativo de todo el bachillerato */
    trayectoria: string;
}

const GENERACION: Record<ModeloCurricular, string> = {
    '2024': '2023-2026',
    '2025': '2025-2028',
};

/**
 * Devuelve cómo se nombra cada elemento curricular para una UAC concreta.
 *
 * @param modeloRaw  el campo `modelo` del programa oficial; si falta se asume '2024',
 *                   que es el plan de la mayoría de los programas vigentes (85 de 95).
 * @param familia    familia de la UAC; solo cambia el nombre de los contenidos, y
 *                   solo en el modelo 2024.
 */
export function vocabularioCurricular(
    modeloRaw?: string,
    familia: FamiliaUAC = 'recurso'
): VocabularioCurricular {
    const modelo: ModeloCurricular = modeloRaw === '2025' ? '2025' : '2024';

    if (modelo === '2025') {
        // En el Modelo 2025 se eliminó la distinción entre áreas y recursos: todas son
        // asignaturas, y categorías/subcategorías/conceptos se agruparon en "contenidos
        // formativos". Por eso aquí la familia ya no cambia nada.
        return {
            modelo,
            generacion: GENERACION[modelo],
            unidad: 'Asignatura',
            progresion: 'Propósito formativo',
            progresionPlural: 'Propósitos formativos',
            metas: 'Metas educativas',
            contenidoNivel1: 'Contenidos formativos',
            contenidoNivel2: 'Contenidos formativos (específicos)',
            trayectoria: 'Perfil de egreso',
        };
    }

    const esArea = familia === 'area';
    return {
        modelo,
        generacion: GENERACION[modelo],
        unidad: 'UAC (Unidad de Aprendizaje Curricular)',
        progresion: 'Progresión',
        progresionPlural: 'Progresiones',
        metas: 'Metas de aprendizaje',
        contenidoNivel1: esArea ? 'Conceptos centrales' : 'Categorías',
        contenidoNivel2: esArea ? 'Conceptos transversales' : 'Subcategorías',
        trayectoria: 'Aprendizajes de trayectoria',
    };
}

/**
 * Plan de estudios del programa, para escribirlo entre paréntesis después de la
 * materia y de la progresión / propósito formativo: así el docente y la ATP ven de
 * un vistazo si el grupo va con el plan 2023 (generación 2023-2026) o con el
 * Modelo 2025 (generación 2025-2028). Sin modelo se asume el plan 2023, igual que
 * en vocabularioCurricular().
 */
export function etiquetaPlan(modeloRaw?: string): string {
    return modeloRaw === '2025' ? 'Plan 2025' : 'Plan 2023';
}

/** "Pensamiento Matemático I" -> "Pensamiento Matemático I (Plan 2023)" */
export function conPlan(texto: string, modeloRaw?: string): string {
    return texto ? `${texto} (${etiquetaPlan(modeloRaw)})` : texto;
}

/** "(Progresión · Plan 2023)" o "(Propósito formativo · Plan 2025)" */
export function etiquetaElemento(modeloRaw?: string): string {
    return `(${vocabularioCurricular(modeloRaw).progresion} · ${etiquetaPlan(modeloRaw)})`;
}

/**
 * Deduce la familia de la UAC a partir de la categoría MCCEMS que ya guarda
 * SubjectContext.mccemsCategory (viene del catálogo en data/mccemsCatalogo.ts).
 */
export function familiaDesdeCategoria(categoria?: string): FamiliaUAC {
    const c = (categoria || '').toLowerCase();
    if (c.includes('área') || c.includes('area')) return 'area';
    if (c.includes('socioemocional')) return 'socioemocional';
    if (c.includes('laboral')) return 'laboral';
    return 'recurso';
}

/** Nombre legible del componente de formación, para los datos de identificación. */
export const COMPONENTES_FORMACION = {
    fundamental: 'Currículum Fundamental',
    ampliado: 'Currículum Ampliado',
    laboral: 'Formación Laboral',
} as const;

export type ComponenteFormacion = keyof typeof COMPONENTES_FORMACION;
