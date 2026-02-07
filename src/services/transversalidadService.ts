/**
 * Servicio de Transversalidad Curricular
 * Analiza el JSON de programas SEP para sugerir vinculaciones entre materias
 * basándose en temáticas compartidas y conceptos transversales
 */

import programasSEP from '../../data/programas_sep.json';

export interface SugerenciaTransversal {
    materia: string;
    semestre: number;
    progresionId: number;
    progresionDescripcion: string;
    tematicasComunes: string[];
    nivelAfinidad: 'alta' | 'media' | 'baja';
    justificacion: string;
}

export interface AnalisisTransversalidad {
    materiaOrigen: string;
    semestreOrigen: number;
    progresionOrigen: string;
    tematicasOrigen: string[];
    sugerencias: SugerenciaTransversal[];
}

// Mapeo de temáticas relacionadas (conceptos que se conectan aunque usen palabras diferentes)
const TEMATICAS_RELACIONADAS: Record<string, string[]> = {
    // Comunicación y lenguaje
    'Procesadores de texto': ['Composición de textos', 'Corrección de textos', 'Herramientas digitales'],
    'Herramientas digitales': ['Procesadores de texto', 'Hojas de cálculo', 'Presentaciones'],
    'Expresión oral': ['Debate', 'Persuasión', 'Argumentación'],
    'Comprensión lectora': ['Fuentes de información', 'Búsqueda de información'],

    // Matemáticas y análisis
    'Estadística básica': ['Recolección de datos', 'Gráficos estadísticos', 'Toma de decisiones'],
    'Hojas de cálculo': ['Estadística básica', 'Gráficos estadísticos', 'Análisis de datos'],
    'Resolución de problemas': ['Algoritmos', 'Toma de decisiones', 'Lógica'],

    // Ciencias
    'Impacto ambiental': ['Química verde', 'Recursos naturales', 'Desarrollo sostenible'],
    'Salud digital': ['Ciudadanía Digital', 'Bienestar social'],

    // Ciudadanía y ética
    'Ciudadanía Digital': ['Ciudadanía', 'Derechos digitales', 'Participación'],
    'Ética': ['Responsabilidad', 'Libertad', 'Virtudes'],
    'Participación': ['Ciudadanía', 'Democracia', 'Comunidad'],

    // Pensamiento crítico
    'Argumentación': ['Lógica', 'Falacias', 'Debate', 'Persuasión'],
    'Fuentes de información': ['Búsqueda de información', 'Fuentes confiables', 'Validez'],
};

class TransversalidadService {
    private programas = programasSEP as any[];

    /**
     * Busca materias con temáticas relacionadas a una progresión específica
     */
    buscarTransversalidad(
        materia: string,
        semestre: number,
        progresionId: number
    ): AnalisisTransversalidad {
        // Encontrar el programa y progresión origen
        const programaOrigen = this.programas.find(
            p => p.materia.toLowerCase().includes(materia.toLowerCase()) && p.semestre === semestre
        );

        if (!programaOrigen) {
            return {
                materiaOrigen: materia,
                semestreOrigen: semestre,
                progresionOrigen: 'No encontrada',
                tematicasOrigen: [],
                sugerencias: []
            };
        }

        const progresionOrigen = programaOrigen.progresiones?.find(
            (p: any) => p.id === progresionId
        );

        if (!progresionOrigen) {
            return {
                materiaOrigen: materia,
                semestreOrigen: semestre,
                progresionOrigen: 'Progresión no encontrada',
                tematicasOrigen: [],
                sugerencias: []
            };
        }

        const tematicasOrigen = progresionOrigen.tematicas || [];
        const sugerencias: SugerenciaTransversal[] = [];

        // Buscar en todos los programas (excepto el origen)
        this.programas.forEach(programa => {
            // Omitir la misma materia
            if (programa.materia === programaOrigen.materia) return;

            programa.progresiones?.forEach((prog: any) => {
                const tematicasComunes = this.encontrarTematicasComunes(
                    tematicasOrigen,
                    prog.tematicas || []
                );

                if (tematicasComunes.length > 0) {
                    const nivelAfinidad = this.calcularAfinidad(tematicasComunes.length, tematicasOrigen.length);

                    sugerencias.push({
                        materia: programa.materia,
                        semestre: programa.semestre,
                        progresionId: prog.id,
                        progresionDescripcion: prog.descripcion,
                        tematicasComunes,
                        nivelAfinidad,
                        justificacion: this.generarJustificacion(
                            programaOrigen.materia,
                            programa.materia,
                            tematicasComunes
                        )
                    });
                }
            });
        });

        // Ordenar por afinidad y número de temáticas comunes
        sugerencias.sort((a, b) => {
            const ordenAfinidad = { alta: 3, media: 2, baja: 1 };
            return ordenAfinidad[b.nivelAfinidad] - ordenAfinidad[a.nivelAfinidad]
                || b.tematicasComunes.length - a.tematicasComunes.length;
        });

        return {
            materiaOrigen: programaOrigen.materia,
            semestreOrigen: semestre,
            progresionOrigen: progresionOrigen.descripcion,
            tematicasOrigen,
            sugerencias: sugerencias.slice(0, 5) // Top 5 sugerencias
        };
    }

    /**
     * Encuentra temáticas comunes entre dos listas (directas o relacionadas)
     */
    private encontrarTematicasComunes(tematicas1: string[], tematicas2: string[]): string[] {
        const comunes: string[] = [];

        tematicas1.forEach(t1 => {
            const t1Lower = t1.toLowerCase();

            tematicas2.forEach(t2 => {
                const t2Lower = t2.toLowerCase();

                // Coincidencia directa
                if (t1Lower.includes(t2Lower) || t2Lower.includes(t1Lower)) {
                    if (!comunes.includes(t1)) comunes.push(t1);
                    return;
                }

                // Coincidencia por relación semántica
                const relacionadas = TEMATICAS_RELACIONADAS[t1] || [];
                if (relacionadas.some(r => r.toLowerCase().includes(t2Lower) || t2Lower.includes(r.toLowerCase()))) {
                    if (!comunes.includes(`${t1} ↔ ${t2}`)) {
                        comunes.push(`${t1} ↔ ${t2}`);
                    }
                }
            });
        });

        return comunes;
    }

    /**
     * Calcula el nivel de afinidad basado en coincidencias
     */
    private calcularAfinidad(coincidencias: number, totalOrigen: number): 'alta' | 'media' | 'baja' {
        const ratio = coincidencias / Math.max(totalOrigen, 1);
        if (ratio >= 0.5 || coincidencias >= 2) return 'alta';
        if (ratio >= 0.25 || coincidencias >= 1) return 'media';
        return 'baja';
    }

    /**
     * Genera una justificación pedagógica para la vinculación
     */
    private generarJustificacion(materiaOrigen: string, materiaDestino: string, tematicas: string[]): string {
        const tematicasStr = tematicas.slice(0, 2).join(' y ');
        return `La vinculación entre ${materiaOrigen} y ${materiaDestino} permite abordar de manera integral ${tematicasStr}, fortaleciendo el aprendizaje significativo a través de la interdisciplinariedad propuesta por el MCCEMS.`;
    }

    /**
     * Genera sugerencias automáticas de transversalidad para una materia completa
     */
    generarReporteTransversalidad(materia: string, semestre: number): string {
        const programa = this.programas.find(
            p => p.materia.toLowerCase().includes(materia.toLowerCase()) && p.semestre === semestre
        );

        if (!programa) return 'Programa no encontrado';

        let reporte = `# Análisis de Transversalidad: ${programa.materia} (Semestre ${semestre})\n\n`;

        programa.progresiones?.slice(0, 5).forEach((prog: any) => {
            const analisis = this.buscarTransversalidad(materia, semestre, prog.id);

            if (analisis.sugerencias.length > 0) {
                reporte += `## Progresión ${prog.id}: ${prog.descripcion.substring(0, 60)}...\n\n`;
                reporte += `**Temáticas:** ${(prog.tematicas || []).join(', ')}\n\n`;
                reporte += `**Vinculaciones sugeridas:**\n`;

                analisis.sugerencias.slice(0, 3).forEach(sug => {
                    reporte += `- **${sug.materia}** (Sem. ${sug.semestre}): ${sug.tematicasComunes.join(', ')}\n`;
                });
                reporte += '\n';
            }
        });

        return reporte;
    }

    /**
     * Obtiene las materias del mismo semestre para sugerencias rápidas
     */
    obtenerMateriasMismoSemestre(semestre: number): string[] {
        return this.programas
            .filter(p => p.semestre === semestre)
            .map(p => p.materia);
    }
}

export const transversalidadService = new TransversalidadService();
