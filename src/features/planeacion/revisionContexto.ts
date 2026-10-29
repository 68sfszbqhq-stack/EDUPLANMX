import type { ContextoCuaderno } from '../cuaderno/model';

export interface BloqueRevision { id: string; titulo: string; texto: string; incluir: boolean }
export interface RevisionContexto {
  bloques: BloqueRevision[];
  resumen?: string[];
  cuaderno?: ContextoCuaderno;
}

/** El diario importado por Mis clases conserva su encabezado. No se adivinan nombres. */
export function separarDiagnosticoDiario(texto: string): { diagnostico: string; diario: string } {
  const inicio = texto.indexOf('Lo que pasó en las últimas clases (diario del docente):');
  if (inicio < 0) return { diagnostico: texto, diario: '' };
  const fin = texto.indexOf('Resultados de Antología del grupo ', inicio);
  return {
    diagnostico: [texto.slice(0, inicio).trim(), fin < 0 ? '' : texto.slice(fin).trim()].filter(Boolean).join('\n'),
    diario: texto.slice(inicio, fin < 0 ? undefined : fin).trim(),
  };
}

export function crearRevisionContexto(configuracion: string, diagnostico: string, flujo: string, perfil: string, cuaderno?: ContextoCuaderno): RevisionContexto {
  const separados = separarDiagnosticoDiario(diagnostico);
  const bloques = [
    { id: 'configuracion', titulo: 'Indicaciones de la planeación', texto: configuracion },
    { id: 'diagnostico', titulo: 'Diagnóstico del grupo', texto: separados.diagnostico },
    { id: 'diario', titulo: 'Fragmentos del diario de clase', texto: separados.diario },
    { id: 'flujo', titulo: 'Flujo de contextualización', texto: flujo },
    { id: 'perfil', titulo: 'Cómo doy clase', texto: perfil },
  ].filter(b => b.texto.trim()).map(b => ({ ...b, incluir: !['flujo', 'perfil'].includes(b.id) }));
  return { bloques, cuaderno: cuaderno ? structuredClone(cuaderno) : undefined };
}

/** Sin valores de respaldo: borrar o excluir un texto nunca recupera el original. */
export function contextoAutorizado(revision: RevisionContexto): { prompt: string; perfil: string; cuaderno?: ContextoCuaderno } {
  const activos = revision.bloques.filter(b => b.incluir && b.texto.trim());
  const diagnostico = activos.filter(b => ['diagnostico', 'diario'].includes(b.id)).map(b => b.texto.trim()).join('\n');
  const prompt = [
    'PRIORIDAD DEL CONTEXTO: las decisiones actuales (evaluación, recursos, tiempo y PAEC) y el diagnóstico revisado prevalecen sobre datos guardados. Los datos anteriores solo complementan lo compatible. Si falta un dato, no lo inventes. No sustituir el instrumento elegido ni activar campañas a partir del perfil.',
    ...activos.filter(b => ['configuracion', 'flujo'].includes(b.id)).map(b => b.texto.trim()),
    diagnostico ? `DIAGNÓSTICO Y DIARIO REVISADOS POR EL DOCENTE:\n${diagnostico}\nAdapta al menos una actividad a esta información y márcala como [Adaptación al grupo]. Si indica poco acceso a internet, no dejes tareas que lo requieran.` : '',
  ].filter(Boolean).join('\n\n');
  const fragments = revision.cuaderno?.fragments.filter(f => f.text.trim()).map(f => ({ ...f }));
  return {
    prompt,
    perfil: activos.find(b => b.id === 'perfil')?.texto.trim() || '',
    cuaderno: fragments?.length ? { fragments, sourceCount: new Set(fragments.map(f => f.sourceId)).size, omitted: revision.cuaderno?.omitted || 0 } : undefined,
  };
}
