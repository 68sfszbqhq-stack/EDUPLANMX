/**
 * MODO MUESTRA
 *
 * «Probar con datos de muestra» abre EduPlan con una escuela ficticia ya configurada:
 * cuestionario contestado, contexto escolar, flujo completo, cuaderno con fuentes revisadas
 * y una planeación de ejemplo. Todo vive en el navegador del visitante: no se lee ni se
 * escribe nada en Firebase, no se crean cuentas y no se gasta la cuota del proyecto.
 *
 * Para no pisar los datos de un docente real que use el mismo navegador, mientras la pestaña
 * está en modo muestra cada clave de localStorage se guarda con el prefijo «muestra:».
 * Al salir del modo muestra la app vuelve a leer las claves normales.
 */
import { FuenteEscolar } from '../features/cuaderno/model';
import planMuestra from './planMuestra.json';

export const BANDERA_MUESTRA = 'eduplan_modo_invitado';
const PREFIJO = 'muestra:';
const SEMBRADO = 'muestra_sembrado_v1';

export const ESCUELA_MUESTRA = 'Bachillerato General Oficial de Muestra';
export const GRUPO_MUESTRA = '1º A Vespertino';
export const PLAN_MUESTRA = planMuestra as any;

// Referencias originales: el parche de abajo no debe llamarse a sí mismo al leer la bandera
const original = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    key: Storage.prototype.key,
};

export const esModoMuestra = (): boolean => {
    try { return original.getItem.call(window.sessionStorage, BANDERA_MUESTRA) === '1'; } catch { return false; }
};

/** Se llama una vez al arrancar, antes de montar React. */
export function aislarAlmacenamiento() {
    const proto = Storage.prototype as any;
    if (proto.__eduplanMuestra) return;
    proto.__eduplanMuestra = true;
    // Firestore guarda su propio estado de pestañas en localStorage; ese se deja como está
    const clave = (almacen: Storage, k: string) =>
        almacen === window.localStorage && esModoMuestra() && !String(k).startsWith('firestore_') ? PREFIJO + k : k;
    proto.getItem = function (this: Storage, k: string) { return original.getItem.call(this, clave(this, k)); };
    proto.setItem = function (this: Storage, k: string, v: string) { return original.setItem.call(this, clave(this, k), v); };
    proto.removeItem = function (this: Storage, k: string) { return original.removeItem.call(this, clave(this, k)); };
}

const escribir = (k: string, v: unknown) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));

/** Carga la escuela ficticia. Sin `forzar`, respeta lo que el visitante ya cambió. */
export function sembrarMuestra(forzar = false) {
    if (!esModoMuestra()) return;
    try {
        if (!forzar && localStorage.getItem(SEMBRADO)) return;

        escribir('schoolContext', {
            schoolName: ESCUELA_MUESTRA,
            cct: '00EBH0000M',
            cycle: '2026-2027',
            shift: 'Vespertino',
            municipality: 'Puebla, Pue.',
            vision: 'Contextualizar el currículo en la realidad de los estudiantes, fortalecer la evaluación formativa (portafolios, proyectos, listas de cotejo, autoevaluación y coevaluación) y dar seguimiento cercano a quienes están en riesgo de abandono.',
            communityGoals: '',
            infrastructure: 'Aulas con pizarrón; un proyector que se aparta por sesión; sin internet en el salón; sin sala de cómputo.',
        });
        escribir('subjectContext', {
            subjectId: 'Cultura Digital I', subjectName: 'Cultura Digital I',
            formativePurpose: '', curriculumContent: '', mccemsCategory: '',
        });

        escribir('perfilDocente', {
            nombre: 'Docente de Muestra',
            materias: 'Cultura Digital I (1er semestre, 3 sesiones de 50 min por semana).',
            proyector: 'No es fijo: hay que apartarlo para las sesiones que lo necesitan.',
            internetAula: 'No hay internet en el salón',
            salaComputo: 'No hay sala de cómputo',
            equipoPropio: 'Mi laptop',
            accesoCasa: 'Como la mitad',
            grupos: 'Entre 25 y 40',
            ajustes: 'No, ninguno',
            gAutoridad: 5, gFacilitador: 5,
            mosston: ['reciproca', 'inclusion'],
            comoTrabajan: 'En su cuaderno; En equipos; Exponiendo al grupo',
            evidencia: 'Un producto calificado con rúbrica; El portafolio de evidencias',
            tarea: 'Solo para terminar lo de clase',
            sinRecursos: 'Trabaja en equipo con quien sí tiene; Le doy una versión en papel',
            error: 'Le hago preguntas para que lo descubra solo',
            queRevisan: 'Que coincida con el PAEC y con el formato de la supervisión.',
            actualizadoEn: new Date().toISOString(),
        });

        escribir('flujoContexto', {
            plantel: {
                aprobacion: '', abandono: '', eficienciaTerminal: '',
                conectividad: 'Sin internet en los salones; proyector que se aparta por sesión; sin sala de cómputo.',
                fortalezas: 'Docentes que conectan los contenidos con problemas reales de la comunidad; colectivo abierto al diálogo y a la retroalimentación.',
            },
            grupo: {
                intereses: 'Redes sociales, videojuegos, música y futbol.',
                saberesPrevios: 'Diagnóstico de ingreso (datos de muestra): Lenguaje 30% consolidado; Pensamiento crítico 70% en desarrollo; Matemáticas 60% en proceso.',
                desafios: 'Lectura: pocos identifican ideas principales o resumen un texto; casi nadie organiza información en esquemas. Pensamiento crítico: les cuesta relacionar libertad con responsabilidad.',
                porcentajeTrabaja: '',
                estilosAprendizaje: 'Visual y práctico; se dispersan con explicaciones largas.',
                socioemocional: 'Nervios al exponer frente al grupo.',
            },
            bap: {
                didacticas: { detectada: true, notas: 'Comprensión lectora baja en el diagnóstico de ingreso.', estrategiasElegidas: [
                    'Ofrecer la actividad principal en 3 niveles (guiado, estándar, reto autónomo) según DUA',
                    'Usar organizadores gráficos y apoyos visuales para contenidos abstractos'] },
                socioeconomicas: { detectada: false, notas: '', estrategiasElegidas: [] },
                fisicas: { detectada: true, notas: 'Sin internet en el salón ni sala de cómputo.', estrategiasElegidas: [
                    'Planear en modo offline: materiales predescargados, fichas físicas, pizarra portátil',
                    'Compartir recursos por Bluetooth/ShareIt en lugar de plataformas en línea'] },
                socioemocionales: { detectada: false, notas: '', estrategiasElegidas: [] },
            },
            paec: {
                problematica: 'Convivencia en redes sociales: ciberacoso escolar y situaciones de riesgo en redes.',
                asignaturas: ['Cultura Digital I', 'Ciencias Sociales I', 'Inglés I', 'Laboratorio de Investigación'],
                productoComunitario: 'Campaña «Paz en las redes»: carteles o infografías preventivas contra el ciberacoso, hechas en equipos y votadas por la comunidad escolar.',
                actores: 'Estudiantes de 1º A y comunidad escolar',
            },
            actualizadoEl: new Date().toISOString(),
        });

        const fuente = (id: string, kind: FuenteEscolar['kind'], title: string, text: string, group = ''): FuenteEscolar => ({
            id, schoolId: 'demo', authorId: 'guest', title, text, kind, cycle: '2026-2027', group,
            subject: kind === 'pmc' ? '' : 'Cultura Digital I', meeting: '', date: '2026-08-24', validUntil: '',
            origin: 'Datos de muestra de EduPlan', status: 'revisada', createdAt: '2026-08-24T12:00:00.000Z',
            reviewedBy: 'guest', reviewedAt: '2026-08-24T12:00:00.000Z',
        });
        escribir('eduplan:cuaderno:v1:demo:guest', [
            fuente('muestra-paec', 'paec', 'PAEC 2026-2027: Campaña «Paz en las redes»',
                'Cultura Digital I. Contenido formativo: Ciudadanía e identidad digital. Actividad de 4 semanas: 1) diagnóstico guiado de situaciones de riesgo en redes; 2) búsqueda confiable sobre netiqueta y mecanismos de reporte; 3) diseño en equipos de un cartel o infografía contra el ciberacoso; 4) socialización y concurso a votación. Asignaturas articuladas: Ciencias Sociales I (análisis social de la problemática), Inglés I (mensajes bilingües), Laboratorio de Investigación (diagnóstico de convivencia con gráficas).'),
            fuente('muestra-pmc', 'pmc', 'Metas de la escuela 2026-2027',
                'Prioridades del plantel: contextualizar el currículo como eje del aprendizaje; evaluación formativa con portafolios, proyectos, listas de cotejo, autoevaluación y coevaluación; seguimiento cercano a estudiantes en riesgo de abandono.'),
            fuente('muestra-diagnostico', 'diagnostico', `Diagnóstico de ingreso ${GRUPO_MUESTRA} (datos de muestra)`,
                `Grupo ficticio de 30 estudiantes. Lenguaje: 3 de 30 identifican ideas principales; 5 de 30 organizan información en esquemas o tablas. Pensamiento crítico: 2 de 30 relacionan libertad con responsabilidad; 9 de 30 reconocen la importancia de las normas para la convivencia. Matemáticas: 18 de 30 en proceso.`, GRUPO_MUESTRA),
        ]);

        escribir('diagnosticoGrupo', `Datos de muestra del ${GRUPO_MUESTRA} (30 estudiantes ficticios). Lectura: solo 3 de 30 identifican ideas principales y 5 organizan información en esquemas. Pensamiento crítico: 2 de 30 relacionan libertad con responsabilidad. Sin internet en el salón; la mitad tiene computadora en casa.`);

        escribir('savedPlans', PLAN_MUESTRA ? [PLAN_MUESTRA] : []);
        escribir(SEMBRADO, new Date().toISOString());
    } catch (e) {
        console.warn('No se pudieron cargar los datos de muestra:', e);
    }
}

/** «Volver a empezar»: borra lo que el visitante cambió y vuelve a cargar la escuela ficticia. */
export function reiniciarMuestra() {
    if (!esModoMuestra()) return;
    try {
        const borrar: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const k = original.key.call(window.localStorage, i);
            if (k && k.startsWith(PREFIJO)) borrar.push(k);
        }
        borrar.forEach(k => original.removeItem.call(window.localStorage, k));
    } catch { /* sin localStorage no hay nada que borrar */ }
    sembrarMuestra(true);
}
