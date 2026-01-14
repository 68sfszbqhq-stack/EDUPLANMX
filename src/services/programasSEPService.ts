/**
 * Servicio de Programas MCCEMS
 * Permite consultar los programas oficiales de la SEP/DGB
 * para validación de planeaciones y generación de contenido educativo
 */

import programasSEPData from '../../data/programas_sep.json';

export interface MetasAprendizaje {
    id: number;
    descripcion: string;
    metas: string[];
    tematicas?: string[];
}

export interface OrganizadorCurricular {
    categorias: string[];
    subcategorias?: string[];
    metas_aprendizaje: string[];
}

export interface ProgramaSEP {
    materia: string;
    semestre: number;
    metadata: {
        nombre_uac?: string;
        semestre?: number;
        creditos?: number;
        horas_semanales?: number;
    };
    organizador_curricular: OrganizadorCurricular;
    progresiones: MetasAprendizaje[];
    url_fuente: string;
    fecha_extraccion: string;
}

class ProgramasSEPService {
    private programas: ProgramaSEP[] = [];
    private indexPorMateria: Map<string, ProgramaSEP[]> = new Map();
    private indexPorSemestre: Map<number, ProgramaSEP[]> = new Map();

    constructor() {
        this.cargarProgramas();
        this.construirIndices();
    }

    /**
     * Carga los programas desde el JSON importado
     */
    private cargarProgramas(): void {
        try {
            this.programas = programasSEPData as ProgramaSEP[];
            console.log(`✅ Cargados ${this.programas.length} programas MCCEMS`);
        } catch (error) {
            console.error('❌ Error cargando programas SEP:', error);
            this.programas = [];
        }
    }

    /**
     * Construye índices para búsqueda rápida
     */
    private construirIndices(): void {
        // Índice por materia
        this.programas.forEach(programa => {
            const key = this.normalizarNombre(programa.materia);
            if (!this.indexPorMateria.has(key)) {
                this.indexPorMateria.set(key, []);
            }
            this.indexPorMateria.get(key)!.push(programa);
        });

        // Índice por semestre
        this.programas.forEach(programa => {
            if (!this.indexPorSemestre.has(programa.semestre)) {
                this.indexPorSemestre.set(programa.semestre, []);
            }
            this.indexPorSemestre.get(programa.semestre)!.push(programa);
        });
    }

    /**
     * Normaliza nombres para búsqueda flexible
     */
    private normalizarNombre(nombre: string): string {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
    }

    /**
     * Busca programas por nombre de materia
     */
    buscarPorMateria(nombreMateria: string): ProgramaSEP[] {
        const nombreNormalizado = this.normalizarNombre(nombreMateria);

        // Búsqueda exacta
        if (this.indexPorMateria.has(nombreNormalizado)) {
            return this.indexPorMateria.get(nombreNormalizado)!;
        }

        // Búsqueda parcial
        const resultados: ProgramaSEP[] = [];
        this.indexPorMateria.forEach((programas, key) => {
            if (key.includes(nombreNormalizado) || nombreNormalizado.includes(key)) {
                resultados.push(...programas);
            }
        });

        return resultados;
    }

    /**
     * Filtra programas por semestre
     */
    buscarPorSemestre(semestre: number): ProgramaSEP[] {
        return this.indexPorSemestre.get(semestre) || [];
    }

    /**
     * Filtra por materia Y semestre (búsqueda combinada)
     */
    buscarPorMateriaYSemestre(nombreMateria: string, semestre: number): ProgramaSEP | null {
        const porMateria = this.buscarPorMateria(nombreMateria);
        const resultado = porMateria.find(p => p.semestre === semestre);
        return resultado || null;
    }

    /**
     * Obtiene las progresiones de aprendizaje de una materia específica
     */
    obtenerProgresiones(nombreMateria: string, semestre?: number): MetasAprendizaje[] {
        let programas: ProgramaSEP[];

        if (semestre !== undefined) {
            const programa = this.buscarPorMateriaYSemestre(nombreMateria, semestre);
            programas = programa ? [programa] : [];
        } else {
            programas = this.buscarPorMateria(nombreMateria);
        }

        return programas.flatMap(p => p.progresiones);
    }

    /**
     * Obtiene las metas de aprendizaje del organizador curricular
     */
    obtenerMetasAprendizaje(nombreMateria: string, semestre: number): string[] {
        const programa = this.buscarPorMateriaYSemestre(nombreMateria, semestre);
        return programa?.organizador_curricular.metas_aprendizaje || [];
    }

    /**
     * Valida que una planeación incluya progresiones oficiales
     */
    validarPlaneacion(
        nombreMateria: string,
        semestre: number,
        progresionesEnPlaneacion: string[]
    ): {
        esValida: boolean;
        progresionesOficiales: MetasAprendizaje[];
        coincidencias: number;
        sugerencias: string[];
    } {
        const programa = this.buscarPorMateriaYSemestre(nombreMateria, semestre);

        if (!programa) {
            return {
                esValida: false,
                progresionesOficiales: [],
                coincidencias: 0,
                sugerencias: [`No se encontró el programa oficial para ${nombreMateria} semestre ${semestre}`]
            };
        }

        const progresionesOficiales = programa.progresiones;
        let coincidencias = 0;
        const sugerencias: string[] = [];

        // Análisis de coincidencias
        progresionesEnPlaneacion.forEach(progPlan => {
            const progNormalizada = this.normalizarNombre(progPlan);
            const coincide = progresionesOficiales.some(progOf =>
                this.normalizarNombre(progOf.descripcion).includes(progNormalizada) ||
                progNormalizada.includes(this.normalizarNombre(progOf.descripcion))
            );

            if (coincide) {
                coincidencias++;
            } else {
                // Buscar la progresión oficial más cercana para sugerencias
                const masCercana = progresionesOficiales[0]; // Simplificado, podría usar similitud de texto
                sugerencias.push(
                    `"${progPlan}" no coincide con progresiones oficiales. ` +
                    `Considera: "${masCercana.descripcion.substring(0, 100)}..."`
                );
            }
        });

        return {
            esValida: coincidencias > 0,
            progresionesOficiales,
            coincidencias,
            sugerencias: sugerencias.slice(0, 3) // Limitar a 3 sugerencias
        };
    }

    /**
     * Genera contexto para IA basado en el programa oficial
     */
    generarContextoIA(nombreMateria: string, semestre: number): string {
        const programa = this.buscarPorMateriaYSemestre(nombreMateria, semestre);

        if (!programa) {
            return `No se encontró información oficial para ${nombreMateria} semestre ${semestre}.`;
        }

        const contexto = `
PROGRAMA OFICIAL MCCEMS - DGB/SEP
Materia: ${programa.materia}
Semestre: ${programa.semestre}
${programa.metadata.creditos ? `Créditos: ${programa.metadata.creditos}` : ''}
${programa.metadata.horas_semanales ? `Horas semanales: ${programa.metadata.horas_semanales}` : ''}

ORGANIZADOR CURRICULAR:
Categorías: ${programa.organizador_curricular?.categorias?.join(', ') || 'No definidas'}

PROGRESIONES DE APRENDIZAJE (${programa.progresiones?.length || 0} total):
${programa.progresiones?.slice(0, 5).map(p =>
            `${p.id}. ${p.descripcion.substring(0, 150)}...`
        ).join('\n') || 'Sin progresiones registradas'}

METAS DE APRENDIZAJE:
${programa.organizador_curricular?.metas_aprendizaje?.slice(0, 3).join('\n') || 'Generales del MCCEMS'}

Fuente oficial: ${programa.url_fuente || 'DGB-SEP'}
Fecha de extracción: ${programa.fecha_extraccion ? new Date(programa.fecha_extraccion).toLocaleDateString('es-MX') : 'Reciente'}
        `.trim();

        return contexto;
    }

    /**
     * Obtiene estadísticas del catálogo
     */
    obtenerEstadisticas() {
        return {
            totalProgramas: this.programas.length,
            programasPorSemestre: Array.from(this.indexPorSemestre.entries())
                .map(([semestre, progs]) => ({ semestre, cantidad: progs.length }))
                .sort((a, b) => a.semestre - b.semestre),
            materiasDisponibles: Array.from(this.indexPorMateria.keys()),
            ultimaActualizacion: this.programas.reduce((latest, p) => {
                const fecha = new Date(p.fecha_extraccion);
                return fecha > latest ? fecha : latest;
            }, new Date(0))
        };
    }
}

// Instancia singleton
export const programasSEPService = new ProgramasSEPService();
