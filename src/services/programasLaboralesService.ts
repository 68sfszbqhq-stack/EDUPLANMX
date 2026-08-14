/**
 * Acceso a los programas de Formación Laboral Básica.
 *
 * Equivalente de programasSEPService, pero para el otro modelo curricular: aquí no
 * hay progresiones ni metas de aprendizaje, sino Módulo → Submódulo → Competencia
 * Laboral Básica → Actividad clave.
 *
 * Los datos salen de scripts/extraer_laboral.ts. Para regenerarlos:
 *   npm run extraer:laboral
 */
import programasData from '../../data/programas_laborales.json';
import type { ProgramaLaboral, SubmoduloLaboral, ModuloLaboral } from '../../types/formacionLaboral';

/** Un submódulo junto con el módulo al que pertenece: es la unidad que se planea. */
export interface SubmoduloConContexto {
    programa: ProgramaLaboral;
    modulo: ModuloLaboral;
    submodulo: SubmoduloLaboral;
    /** Identificador estable para elegirlo en el formulario, ej. "turismo…::2::1" */
    id: string;
}

const normalizar = (s: string) =>
    s.toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();

class ProgramasLaboralesService {
    private programas: ProgramaLaboral[] = [];

    constructor() {
        try {
            this.programas = programasData as unknown as ProgramaLaboral[];
            console.log(`✅ Cargados ${this.programas.length} programas de Formación Laboral`);
        } catch (error) {
            console.error('❌ Error cargando programas laborales:', error);
            this.programas = [];
        }
    }

    todos(): ProgramaLaboral[] {
        return this.programas;
    }

    /** Nombres para poblar un selector, ordenados alfabéticamente. */
    nombres(): string[] {
        return this.programas.map(p => p.nombre).sort((a, b) => a.localeCompare(b));
    }

    /** ¿Esta UAC es de Formación Laboral? Sirve para elegir el modo de generación. */
    esFormacionLaboral(nombreUAC: string): boolean {
        return this.buscarPorNombre(nombreUAC) !== null;
    }

    buscarPorNombre(nombreUAC: string): ProgramaLaboral | null {
        if (!nombreUAC) return null;
        const buscado = normalizar(nombreUAC);
        return (
            this.programas.find(p => normalizar(p.nombre) === buscado) ||
            this.programas.find(p => {
                const n = normalizar(p.nombre);
                return n.includes(buscado) || buscado.includes(n);
            }) ||
            null
        );
    }

    /** Todos los submódulos de un programa, aplanados y con su módulo a la mano. */
    submodulos(nombreUAC: string): SubmoduloConContexto[] {
        const programa = this.buscarPorNombre(nombreUAC);
        if (!programa) return [];
        return programa.modulos.flatMap(modulo =>
            modulo.submodulos.map(submodulo => ({
                programa,
                modulo,
                submodulo,
                id: `${programa.slug}::${modulo.numero}::${submodulo.numero}`,
            }))
        );
    }

    buscarSubmodulo(id: string): SubmoduloConContexto | null {
        const [slug, mod, sub] = id.split('::');
        const programa = this.programas.find(p => p.slug === slug);
        if (!programa) return null;
        const modulo = programa.modulos.find(m => m.numero === Number(mod));
        const submodulo = modulo?.submodulos.find(s => s.numero === Number(sub));
        if (!modulo || !submodulo) return null;
        return { programa, modulo, submodulo, id };
    }

    /**
     * Bloque de contexto oficial para el prompt.
     *
     * Va literal del programa de la DGB: la competencia y la actividad clave no se
     * resumen ni se reinterpretan, porque son el texto que la asesoría
     * técnico-pedagógica coteja contra la planeación entregada.
     */
    generarContextoIA(id: string): string {
        const ctx = this.buscarSubmodulo(id);
        if (!ctx) return '';
        const { programa, modulo, submodulo } = ctx;

        const partes = [
            `PROGRAMA OFICIAL: Formación Laboral Básica en ${programa.nombre}` +
            (programa.clave ? ` (clave ${programa.clave})` : ''),
            `MÓDULO ${modulo.numero}: ${modulo.nombre}`,
            `  Propósito del módulo: ${modulo.proposito}`,
            `  Horas: ${modulo.horasMediacionDocente} de mediación docente, ${modulo.horasEstudioIndependiente} de estudio independiente.`,
            `SUBMÓDULO ${submodulo.numero}: ${submodulo.nombre}`,
            `  Horas: ${submodulo.horasMediacionDocente} de mediación docente, ${submodulo.horasEstudioIndependiente} de estudio independiente.`,
            `COMPETENCIA LABORAL BÁSICA A DESARROLLAR (texto oficial, no lo reformules):`,
            `  "${submodulo.competenciaLaboralBasica}"`,
            `ACTIVIDAD CLAVE (texto oficial, la planeación debe desarrollarla, no sustituirla):`,
            `  "${submodulo.actividadClave}"`,
        ];

        const conInstrumento = submodulo.evidencias.filter(
            e => e.indicadores.length > 0 || e.criterios.length > 0
        );
        if (conInstrumento.length) {
            partes.push('INSTRUMENTO DE EVALUACIÓN OFICIAL (úsalo tal cual; no inventes otro):');
            for (const e of conInstrumento) {
                partes.push(`  · ${e.nombre}${e.niveles.length ? ` — niveles: ${e.niveles.join(', ')}` : ''}`);
                e.indicadores.forEach(i => partes.push(`      ${i.numero}. ${i.texto}`));
                e.criterios.forEach(c => partes.push(`      - ${c.criterio}${c.puntos ? ` (${c.puntos} puntos)` : ''}`));
            }
        } else {
            partes.push(
                'INSTRUMENTO DE EVALUACIÓN: el programa oficial lo trae en un formato que no se',
                'pudo extraer. Propón uno coherente con la evidencia y avisa al docente de que',
                'debe cotejarlo contra el programa impreso antes de entregar.'
            );
        }

        return partes.join('\n');
    }
}

export const programasLaboralesService = new ProgramasLaboralesService();
