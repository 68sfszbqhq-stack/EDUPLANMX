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
const SEMBRADO = 'muestra_sembrado_v2';

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

const LLEVAR_A_PLANEACION = `Situación actual del grupo ${GRUPO_MUESTRA} (Cultura Digital I), según el cuaderno del docente.
- Promedio del grupo: 7.6 (28 de 30 alumnos ya tienen calificación). 3 alumno(s) por debajo de 6.
- Actividades que más de un tercio no entregó: Video en casa · 1.5 (verificación en dos pasos a un familiar) (11).
- Asistencia promedio: 91%.
Lo que pasó en las últimas clases (diario del docente):
- 2026-10-21: Módulo 1.5 (seguridad digital). El resumen a mano salió bien; el debate sobre datos personales prendió al grupo. 19 de 30 entregaron el video en casa activando la verificación en dos pasos de WhatsApp a un familiar; quienes no tienen equipo lo explicaron en papel con capturas impresas.
- 2026-10-17: Varios confunden huella digital con «lo que publico»; no ubican la huella pasiva (lo que se registra sin que lo noten). Funcionó el ejemplo de la credencial del INE como llave: lo usaré para credenciales de acceso.
Resultados de Antología del grupo ${GRUPO_MUESTRA} (Cultura Digital I).
- Diagnóstico · Módulo 1.5 Normatividad y seguridad: contestaron 27 de 30 (90%), promedio 64%.
  Ejes con menor dominio: Protección de datos (48%).
- Diagnóstico · Módulo 1.6 Identidad digital y medio ambiente: contestaron 24 de 30 (80%), promedio 58%.
  Ejes con menor dominio: Contaminación digital (39%), Identidad digital (52%).
Quien no contestó es dato faltante, no bajo desempeño.`;

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
            materias: 'Cultura Digital I (1er semestre, Plan 2025). Cada módulo lo doy con mi Antología Digital en 5 pasos: diagnóstico de 10 reactivos, resultados por eje, La Clase, línea del tiempo y Tu Reto con rúbrica.',
            proyector: 'No es fijo: hay que apartarlo para las sesiones que lo necesitan.',
            internetAula: 'No hay internet en el salón',
            salaComputo: 'No hay sala de cómputo',
            equipoPropio: 'Mi laptop',
            accesoCasa: 'Como la mitad',
            grupos: 'Entre 25 y 40',
            ajustes: 'No, ninguno',
            gAutoridad: 5, gFacilitador: 5,
            mosston: ['reciproca', 'inclusion'],
            mejorClase: 'Cuando el concepto se vuelve algo que hacen en su vida: por ejemplo, en casa le activan la verificación en dos pasos de WhatsApp a un familiar.',
            nuncaFalta: 'Un ejemplo de la vida cotidiana, un dato duro con su fuente (INEGI, ONU, DOF) y un video corto que contextualiza.',
            nuncaHarias: 'Pedir una tarea que necesite internet o computadora para poder cumplirse.',
            comoTrabajan: 'En su cuaderno (resúmenes a mano); En equipos; Sin computadora durante la clase',
            evidencia: 'Video en casa enseñando a un familiar (quien tenga equipo); la versión en papel vale lo mismo; Un producto calificado con rúbrica',
            tarea: 'Transferencia a casa: aplicar lo visto con su familia o su comunidad',
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
                problematica: 'Huella digital y basura electrónica en la comunidad escolar: datos personales expuestos en redes y aparatos en desuso que nadie recicla.',
                asignaturas: ['Cultura Digital I', 'Ciencias Sociales I', 'Inglés I', 'Laboratorio de Investigación'],
                productoComunitario: 'Campaña escolar «Huella responsable»: material de difusión con datos verificables y una propuesta de acción para el plantel (acopio de aparatos en desuso, limpieza de huella digital), votada por la comunidad escolar.',
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
            fuente('muestra-paec', 'paec', 'PAEC 2026-2027: Campaña escolar «Huella responsable»',
                'Cultura Digital I. Contenidos formativos: Ciudadanía e identidad digital; Contaminación digital y tecnológica. Actividad de 4 semanas: 1) auditoría personal de huella digital y de aparatos en desuso en casa; 2) búsqueda de datos verificables sobre basura electrónica y consumo energético; 3) diseño en equipos del material de la campaña con una propuesta de acción para el plantel; 4) socialización y votación de la comunidad. Asignaturas articuladas: Ciencias Sociales I (consumo y desigualdad), Inglés I (mensajes bilingües), Laboratorio de Investigación (inventario escolar con gráficas).'),
            fuente('muestra-antologia', 'antologia', 'Antología Digital · Módulo 1.6 Identidad digital y medio ambiente',
                'Propósito formativo 6 (Plan 2025): Utiliza los recursos digitales a su alcance con fines personales, académicos y sociales para interactuar con seguridad y con consideración al medio ambiente. Secuencia del módulo (90 min, siempre los mismos 5 pasos): 1) Diagnóstico de 10 reactivos en 4 ejes (Identidad digital, Credenciales y seguridad, Contaminación digital, Ciudadanía digital); 2) Resultados por eje con consejo personalizado de qué repasar; 3) La Clase: apertura con datos duros (62 millones de toneladas de basura electrónica en 2022 y solo 22.3 % reciclado de forma documentada, Global E-waste Monitor 2024; 415 TWh de los centros de datos en 2024, Agencia Internacional de Energía 2025) y conceptos clave: identidad digital, huella activa y pasiva, reputación digital, credenciales como llave de la vida digital, contaminación digital, basura electrónica, obsolescencia programada y percibida, netiqueta y ciudadanía digital; 4) La Huella: línea del tiempo del primer correo electrónico a los 62 millones de toneladas; 5) Tu Reto «Campaña escolar de reducción de huella digital y electrónica»: buscar su nombre en modo incógnito y documentar lo que aparece, auditar y limpiar su almacenamiento, inventariar aparatos en desuso en casa y dónde se reciclan en su municipio, diseñar material de campaña con al menos 3 datos con fuente y una propuesta para el plantel con responsables y plazos. Rúbrica: rigor de la auditoría personal y de los datos 30 %, calidad y viabilidad de la propuesta 30 %, uso correcto de fuentes verificables 25 %, diseño, ortografía y presentación 15 %.'),
            fuente('muestra-pmc', 'pmc', 'Metas de la escuela 2026-2027',
                'Prioridades del plantel: contextualizar el currículo como eje del aprendizaje; evaluación formativa con portafolios, proyectos, listas de cotejo, autoevaluación y coevaluación; seguimiento cercano a estudiantes en riesgo de abandono.'),
            fuente('muestra-diagnostico', 'diagnostico', `Diagnóstico de ingreso ${GRUPO_MUESTRA} (datos de muestra)`,
                `Grupo ficticio de 30 estudiantes. Lenguaje: 3 de 30 identifican ideas principales; 5 de 30 organizan información en esquemas o tablas. Pensamiento crítico: 2 de 30 relacionan libertad con responsabilidad; 9 de 30 reconocen la importancia de las normas para la convivencia. Matemáticas: 18 de 30 en proceso.`, GRUPO_MUESTRA),
        ]);

        // Lo que agrega «Llevar a mi planeación» desde Mis clases (texto armado con
        // textoClaseParaPlaneacion y datos ficticios del Módulo 1.5 y 1.6 de Antología)
        escribir('diagnosticoGrupo', `Datos de muestra del ${GRUPO_MUESTRA} (30 estudiantes ficticios). Lectura: solo 3 de 30 identifican ideas principales y 5 organizan información en esquemas. Pensamiento crítico: 2 de 30 relacionan libertad con responsabilidad. Sin internet en el salón; la mitad tiene computadora en casa.

${LLEVAR_A_PLANEACION}`);

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
