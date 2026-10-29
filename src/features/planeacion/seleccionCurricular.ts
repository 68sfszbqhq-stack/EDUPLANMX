import type { ProgramaSEP } from '../../services/programasSEPService';
export type ModeloPlan = '2024' | '2025';
export interface SeleccionCurricular { programaId: string | null; modelo: ModeloPlan; progresionId?: number }
export const generacionPlan = (modelo: ModeloPlan) => modelo === '2025' ? '2025-2028' : '2023-2026';
export const idPrograma = (p: ProgramaSEP) => JSON.stringify([p.materia, p.semestre, p.modelo || '']);
export function resolverSeleccion(programas: ProgramaSEP[], seleccion: SeleccionCurricular): ProgramaSEP | null {
  if (!seleccion.programaId) {
    if (seleccion.progresionId !== undefined) throw new Error('Selecciona un programa antes de elegir una progresión.');
    return null;
  }
  const programa = programas.find(p => idPrograma(p) === seleccion.programaId && p.modelo === seleccion.modelo);
  if (!programa) throw new Error('El programa seleccionado ya no está disponible. Vuelve a elegirlo.');
  if (seleccion.progresionId !== undefined && (programa.estado !== 'oficial' || !programa.progresiones.some(p => p.id === seleccion.progresionId))) {
    throw new Error('La progresión no pertenece al programa verificado seleccionado. Vuelve a elegirla.');
  }
  return programa;
}
export function contextoPrograma(programa: ProgramaSEP | null, seleccion: SeleccionCurricular): string {
  const marco = `Modelo curricular: ${seleccion.modelo}. Generación de referencia del catálogo: ${generacionPlan(seleccion.modelo)}.`;
  if (programa?.estado !== 'oficial') return `${marco}\nPROPUESTA GENERAL: no hay un programa verificado seleccionado. Trabaja con el tema del docente. No inventes progresiones oficiales, metas oficiales ni alineación validada por la DGB. Identifica los elementos sugeridos como propuestas pendientes de cotejo.`;
  const progresion = programa.progresiones.find(p => p.id === seleccion.progresionId);
  return `${marco}\nPROGRAMA OFICIAL REGISTRADO EN EL CATÁLOGO\nAsignatura: ${programa.materia}\nSemestre: ${programa.semestre}\nFuente: ${programa.url_fuente || 'Sin enlace registrado'}\n${progresion ? `ELEMENTO SELECCIONADO (${progresion.id}): ${progresion.descripcion}\nMetas asociadas: ${progresion.metas?.join('; ') || 'Cotejo pendiente'}\nCategorías de esta progresión: ${progresion.categorias?.join('; ') || 'Cotejo pendiente'}\nSubcategorías de esta progresión: ${progresion.subcategorias?.join('; ') || 'Cotejo pendiente'}` : 'No se seleccionó una progresión. El docente indicó un tema; no atribuyas a la DGB elementos que no consten en este contexto.'}\nORGANIZADOR CURRICULAR: ${JSON.stringify(programa.organizador_curricular)}\nUsar el texto oficial sin reformularlo. La presencia de este programa no certifica la calidad ni la alineación de la planeación generada.`;
}
