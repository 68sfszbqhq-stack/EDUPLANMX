import type { LessonPlan } from '../../../types';
export interface DecisionPAEC { modo: 'none' | 'manual' | 'linked'; problema: string; proyecto?: { id: string; name: string; generalObjective: string }; actividad: string }
export function instruccionesEvaluacion(instrumento: string) {
  return `INSTRUMENTO ELEGIDO POR EL DOCENTE: ${instrumento}. Desarróllalo completo y utilizable. No lo sustituyas por otro instrumento por preferencias anteriores del perfil. Para lista de cotejo registra presencia o ausencia, sin niveles de desempeño ni escala 2/1/0: Sí, No, No observado y Observaciones. No observado queda pendiente de evidencia y no equivale a cero. La autoevaluación puede usar los mismos criterios. Incluye instrucciones, criterios observables, opciones de registro y forma de interpretar el resultado.`;
}
export function instruccionesPAEC(d: DecisionPAEC): string {
  if (d.modo === 'none') return 'DECISIÓN PAEC: solo actividad de aula, sin vinculación a PEC. isLinked=false; no imponer campaña ni productos comunitarios aunque aparezcan en datos anteriores.';
  if (d.modo === 'linked') {
    if (!d.proyecto) throw new Error('Elige el proyecto del plantel o cambia a vínculo por acordar.');
    return `DECISIÓN PAEC: vincular al proyecto elegido "${d.proyecto.name}". Objetivo: ${d.proyecto.generalObjective}. Actividad: ${d.actividad || 'Proponer una actividad acotada a las sesiones'}. Mantener nombre y productos específicos. No afirmar autorizaciones de difusión externa.`;
  }
  if (!d.problema.trim()) throw new Error('Escribe la problemática o elige solo actividad de aula.');
  return `DECISIÓN PAEC: vínculo por acordar sobre "${d.problema}". isLinked=false. Conservar propuestas de nombre y productos como pendientes, sin afirmar aprobación o intervención comunitaria obligatoria.`;
}
export function conservarPAEC(generado: LessonPlan['paec'], d: DecisionPAEC): LessonPlan['paec'] {
  if (d.modo === 'none') return { isLinked: false, communityProblem: '', projectTrigger: '', pecName: '', pecProducts: [], estado: 'sin_vinculo' };
  if (d.modo === 'linked' && !d.proyecto) throw new Error('Falta el proyecto seleccionado.');
  return { ...generado, isLinked: d.modo === 'linked', estado: d.modo === 'linked' ? 'vinculado' : 'pendiente',
    communityProblem: d.modo === 'manual' ? d.problema : generado?.communityProblem || d.proyecto!.generalObjective,
    projectTrigger: d.actividad || generado?.projectTrigger || '',
    pecName: d.modo === 'linked' ? d.proyecto!.name : generado?.pecName || 'Por acordar',
    pecProducts: generado?.pecProducts || [] };
}
export const estadoPAEC = (p: LessonPlan['paec']) => p?.estado === 'sin_vinculo' ? 'Solo actividad de aula' : p?.estado === 'pendiente' || !p?.isLinked ? 'Vinculación pendiente de acuerdo' : 'Vinculado al proyecto seleccionado';
export function fechaVisible(valor: unknown): string {
  const fecha = valor && typeof (valor as {toDate?: unknown}).toDate === 'function'
    ? (valor as {toDate: () => Date}).toDate() : new Date(typeof valor === 'string' || typeof valor === 'number' ? valor : '');
  return Number.isNaN(fecha.getTime()) ? 'Fecha pendiente' : fecha.toLocaleDateString('es-MX');
}
