import type { LessonPlan } from '../../../types';

export function fechaPlan(valor?: string): string {
  if (!valor || /^(por |sin |fecha pendiente)/i.test(valor)) return 'Por asignar';
  // Una fecha de calendario no es un instante UTC: no restar un día al mostrarla.
  const calendario = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (calendario) return `${calendario[3]}/${calendario[2]}/${calendario[1]}`;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toLocaleDateString('es-MX');
}
export function periodoPlan(meta?: LessonPlan['meta']): string {
  const inicio = fechaPlan(meta?.startDate), fin = fechaPlan(meta?.endDate);
  if (inicio !== 'Por asignar' || fin !== 'Por asignar') return `${inicio} — ${fin}`;
  return meta?.period && !/^(por |sin )/i.test(meta.period) ? meta.period : 'Por asignar';
}
export const horasPlan = (horas?: number) => Number.isFinite(horas) && horas! > 0 ? `${horas} hrs/sem` : 'Horas por registrar';
export const textoDocente = (texto: string) => texto.replace(/\bteachingKit\b/g, 'Materiales para esta clase').replace(/\bassessmentInstrument\b/g, 'instrumento de evaluación');

// Los extremos del periodo son fechas capturadas, no un calendario escolar inferido.
export function fechasSesiones(sesiones: LessonPlan['sessions'], inicio: string, fin: string): LessonPlan['sessions'] {
  return sesiones?.map((s,i) => ({...s, date: i === 0 && inicio ? inicio : i === sesiones.length - 1 && fin ? fin : 'Por asignar'}));
}
