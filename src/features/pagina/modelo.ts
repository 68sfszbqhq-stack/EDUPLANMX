/**
 * Mi página de clases — lógica pura (sin Firebase), para probarla sin red.
 *
 *   paginasClase/{slug}   la página pública de un docente (dueño: docenteUid)
 *
 * La página NO guarda ni muestra datos de alumnos: solo lo que el docente quiere
 * que se vea (presentación, materias, avisos, materiales). Lo que los alumnos
 * contestan sigue pasando por Antología con su cuenta de Google, y de ahí llega
 * al cuaderno del docente en Mis clases. Las reglas viven en firestore.rules.
 */

export type ColorPagina = 'azul' | 'verde' | 'naranja' | 'rojo' | 'morado' | 'grafito';

export const COLORES: Record<ColorPagina, { nombre: string; hex: string; suave: string }> = {
  azul: { nombre: 'Azul', hex: '#0071e3', suave: '#f0f6ff' },
  verde: { nombre: 'Verde', hex: '#248a3d', suave: '#effaf2' },
  naranja: { nombre: 'Naranja', hex: '#c25e00', suave: '#fff8ec' },
  rojo: { nombre: 'Rojo', hex: '#c41e15', suave: '#fff2f1' },
  morado: { nombre: 'Morado', hex: '#8944ab', suave: '#f7f0fa' },
  grafito: { nombre: 'Grafito', hex: '#1d1d1f', suave: '#f5f5f7' },
};

export type Seccion = 'avisos' | 'materiales' | 'examenes' | 'diagnostico' | 'asesoria';

export const SECCIONES: Record<Seccion, { nombre: string; ayuda: string }> = {
  avisos: { nombre: 'Avisos', ayuda: 'Fechas de entrega, cambios de horario, recordatorios.' },
  materiales: { nombre: 'Materiales', ayuda: 'Enlaces a lecturas, videos o presentaciones de cada tema.' },
  examenes: { nombre: 'Mis exámenes', ayuda: 'Botón para que el alumno conteste sus exámenes en Antología.' },
  diagnostico: { nombre: 'Diagnóstico', ayuda: 'Botón al diagnóstico de inicio de ciclo en Antología.' },
  asesoria: { nombre: 'Asesoría', ayuda: 'Horario y forma de contacto para dudas.' },
};

export interface MateriaPagina { nombre: string; grupo: string; asignaturaClave: string }
export interface Aviso { fecha: string; texto: string }
export interface Material { titulo: string; url: string; tema: string }

export interface PaginaClase {
  slug: string;
  docenteUid: string;
  publicada: boolean;
  nombre: string;          // como lo verán los alumnos: "Mtro. José Roberto Mendoza"
  escuela: string;
  presentacion: string;
  icono: string;           // un emoji
  color: ColorPagina;
  materias: MateriaPagina[];
  secciones: Record<Seccion, boolean>;
  avisos: Aviso[];
  materiales: Material[];
  asesoria: string;
  actualizadoEn: string;
}

/** Límites: los mismos que revisan las reglas de Firestore. */
export const LIMITES = {
  nombre: 80, escuela: 120, presentacion: 600, icono: 8, asesoria: 300,
  materias: 8, avisos: 20, textoAviso: 500, materiales: 40, tituloMaterial: 120, url: 500, tema: 120,
  slugMin: 3, slugMax: 40,
};

/** "Mtro. José Roberto Méndez" → "jose-roberto-mendez" (sin acentos ni títulos). */
export function aSlug(texto: string): string {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b(mtro|mtra|lic|ing|dr|dra|prof|profa)\b(\(a\))?\.?/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITES.slugMax)
    .replace(/-+$/, '');
}

export const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugValido(slug: string): boolean {
  return slug.length >= LIMITES.slugMin && slug.length <= LIMITES.slugMax && SLUG_VALIDO.test(slug);
}

/** Solo enlaces https: un "javascript:" en un material sería una puerta para robar sesiones. */
export function urlSegura(url: string): boolean {
  if (url.length > LIMITES.url || !/^https:\/\//i.test(url)) return false;
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function paginaVacia(docenteUid: string, nombre: string, escuela: string): PaginaClase {
  return {
    slug: aSlug(nombre), docenteUid, publicada: true, nombre: nombre.slice(0, LIMITES.nombre),
    escuela: escuela.slice(0, LIMITES.escuela), presentacion: '', icono: '📚', color: 'azul', materias: [],
    secciones: { avisos: true, materiales: true, examenes: true, diagnostico: false, asesoria: false },
    avisos: [], materiales: [], asesoria: '', actualizadoEn: '',
  };
}

/** Lo que está mal antes de guardar, en palabras para el docente. Vacío = se puede guardar. */
export function problemas(p: PaginaClase): string[] {
  const r: string[] = [];
  if (!slugValido(p.slug)) r.push(`La dirección debe tener de ${LIMITES.slugMin} a ${LIMITES.slugMax} letras, números o guiones (sin espacios ni acentos).`);
  if (!p.nombre.trim()) r.push('Escribe tu nombre como lo verán tus alumnos.');
  if (p.nombre.length > LIMITES.nombre) r.push(`El nombre es muy largo (máximo ${LIMITES.nombre} caracteres).`);
  if (p.escuela.length > LIMITES.escuela) r.push('El nombre de la escuela es muy largo.');
  if (p.presentacion.length > LIMITES.presentacion) r.push(`La presentación es muy larga (máximo ${LIMITES.presentacion} caracteres).`);
  if (p.asesoria.length > LIMITES.asesoria) r.push(`La asesoría es muy larga (máximo ${LIMITES.asesoria} caracteres).`);
  if (!(p.color in COLORES)) r.push('Elige un color.');
  if (p.materias.length > LIMITES.materias) r.push(`Puedes mostrar hasta ${LIMITES.materias} grupos.`);
  if (p.avisos.length > LIMITES.avisos) r.push(`Puedes tener hasta ${LIMITES.avisos} avisos; borra los viejos.`);
  if (p.avisos.some(a => !a.texto.trim() || a.texto.length > LIMITES.textoAviso)) r.push(`Cada aviso necesita texto (máximo ${LIMITES.textoAviso} caracteres).`);
  if (p.materiales.length > LIMITES.materiales) r.push(`Puedes tener hasta ${LIMITES.materiales} materiales.`);
  for (const m of p.materiales) {
    if (!m.titulo.trim()) r.push('Cada material necesita un título.');
    if (!urlSegura(m.url)) r.push(`El enlace de «${m.titulo || 'un material'}» debe empezar con https://`);
  }
  return [...new Set(r)];
}

/** Dirección de Antología (donde contestan los alumnos). */
export function urlAntologia(emulador: boolean): string {
  return emulador ? 'http://localhost:4322/antologia-digital' : 'https://68sfszbqhq-stack.github.io/antologia-digital';
}

/** Módulos de Antología que existen hoy, por asignatura. */
export function moduloAntologia(asignaturaClave: string): string {
  if (asignaturaClave.startsWith('cultura-digital')) return '/cultura-digital';
  if (asignaturaClave.startsWith('lengua-y-comunicacion')) return '/lengua-y-comunicacion';
  return '';
}

/** Avisos más recientes primero. */
export function ordenarAvisos(avisos: Aviso[]): Aviso[] {
  return [...avisos].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Materiales agrupados por tema, respetando el orden en que el docente los puso. */
export function materialesPorTema(materiales: Material[]): [string, Material[]][] {
  const grupos = new Map<string, Material[]>();
  for (const m of materiales) {
    const t = m.tema.trim() || 'General';
    grupos.set(t, [...(grupos.get(t) ?? []), m]);
  }
  return [...grupos.entries()];
}

/**
 * Modo avanzado: un prompt para que el docente le pida a una IA su propio sitio.
 * Se le advierte que ese sitio NO guarda datos de alumnos: para eso enlaza a Antología.
 */
export function promptSitioPropio(p: PaginaClase, urlPagina: string, antologia: string): string {
  const color = COLORES[p.color];
  const secciones = (Object.keys(SECCIONES) as Seccion[]).filter(s => p.secciones[s]);
  const lineas = [
    `Quiero que me ayudes a crear un sitio web sencillo para mis clases de bachillerato.`,
    ``,
    `## Quién soy`,
    `- Nombre: ${p.nombre}`,
    p.escuela && `- Escuela: ${p.escuela}`,
    p.presentacion && `- Presentación para mis alumnos: ${p.presentacion}`,
    ``,
    `## Mis grupos`,
    ...(p.materias.length ? p.materias.map(m => `- ${m.nombre} · ${m.grupo}`) : ['- (sin grupos)']),
    ``,
    `## Cómo debe verse`,
    `- Estilo limpio y minimalista, como las páginas de Apple: fondo claro, mucho espacio, tipografía del sistema.`,
    `- Color principal: ${color.nombre} (${color.hex}). Ícono: ${p.icono}`,
    `- Que se vea bien en celular primero: casi todos mis alumnos lo abrirán desde el teléfono.`,
    ``,
    `## Secciones`,
    ...secciones.map(s => `- ${SECCIONES[s].nombre}: ${SECCIONES[s].ayuda}`),
    p.secciones.asesoria && p.asesoria && `- Texto de asesoría: ${p.asesoria}`,
    p.secciones.examenes && `- El botón de exámenes debe llevar a: ${antologia}/mis-examenes`,
    p.secciones.diagnostico && `- El botón de diagnóstico debe llevar a: ${antologia}/diagnostico`,
    ``,
    `## Reglas importantes`,
    `- El sitio NO debe pedir ni guardar datos de alumnos (nombres, CURP, calificaciones). Los exámenes y diagnósticos se contestan en Antología, que ya está conectada con mi cuaderno de EduPlan.`,
    `- Solo HTML, CSS y JavaScript sin servidor, para publicarlo gratis en Firebase Hosting o GitHub Pages.`,
    `- Explícame paso a paso cómo publicarlo; no soy programador.`,
    ``,
    `Mi página actual en EduPlan, por si quieres tomar ideas: ${urlPagina}`,
  ];
  return lineas.filter((l): l is string => typeof l === 'string').join('\n').replace(/\n{3,}/g, '\n\n');
}
