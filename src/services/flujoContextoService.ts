import { ContextoFlujo, BAPCategoriaId } from '../../types';
import { UsuarioSync, puedeSincronizar, leerCampoUsuario, escribirCampoUsuario } from './nubeSync';

const STORAGE_KEY = 'flujoContexto';
const CAMPO_NUBE = 'flujoContexto';

// Estrategias sugeridas por categoría de BAP, derivadas de la Ficha 08
// (prevención, minimización o eliminación de barreras) y del dossier de planeación situada.
export const ESTRATEGIAS_BAP: Record<BAPCategoriaId, { etiqueta: string; descripcion: string; estrategias: string[] }> = {
    didacticas: {
        etiqueta: 'Didácticas / metodológicas',
        descripcion: 'Secuencias poco claras, un solo formato de enseñanza, evaluación rígida.',
        estrategias: [
            'Ofrecer la actividad principal en 3 niveles (guiado, estándar, reto autónomo) según DUA',
            'Usar organizadores gráficos y apoyos visuales para contenidos abstractos',
            'Sustituir el examen único por portafolio de evidencias con retroalimentación por versión',
        ],
    },
    socioeconomicas: {
        etiqueta: 'Socioeconómicas',
        descripcion: 'Costo de materiales, alumnado que trabaja, ausentismo intermitente.',
        estrategias: [
            'Diseñar actividades que inician y concluyen dentro del aula (sin tarea que requiera gasto)',
            'Usar materiales reciclados o de bajo costo y organizar insumos en equipos solidarios',
            'Preparar rutas de recuperación breves para quien falta por trabajo (bitácora de avance)',
        ],
    },
    fisicas: {
        etiqueta: 'Físicas / de infraestructura',
        descripcion: 'Sin internet o dispositivos, espacios insuficientes, mobiliario inadecuado.',
        estrategias: [
            'Planear en modo offline: materiales predescargados, fichas físicas, pizarra portátil',
            'Compartir recursos por Bluetooth/ShareIt en lugar de plataformas en línea',
            'Adaptar la actividad al espacio real disponible (aula, patio, sombra) con rotación de equipos',
        ],
    },
    socioemocionales: {
        etiqueta: 'Socioemocionales',
        descripcion: 'Ansiedad, temor a exponerse, fatiga por doble jornada, clima de aula tenso.',
        estrategias: [
            'Abrir la sesión con chequeo emocional breve y pausas afectivas planificadas',
            'Permitir formatos alternativos de exposición (audio, cartel, en binas) para quien teme hablar',
            'Dosificar la intensidad de las actividades según la fatiga del turno y del trabajo del alumnado',
        ],
    },
};

export const FLUJO_VACIO: ContextoFlujo = {
    plantel: { aprobacion: '', abandono: '', eficienciaTerminal: '', conectividad: '', fortalezas: '' },
    grupo: { intereses: '', saberesPrevios: '', desafios: '', porcentajeTrabaja: '', estilosAprendizaje: '', socioemocional: '' },
    bap: {
        didacticas: { detectada: false, notas: '', estrategiasElegidas: [] },
        socioeconomicas: { detectada: false, notas: '', estrategiasElegidas: [] },
        fisicas: { detectada: false, notas: '', estrategiasElegidas: [] },
        socioemocionales: { detectada: false, notas: '', estrategiasElegidas: [] },
    },
    paec: { problematica: '', asignaturas: [], productoComunitario: '', actores: '' },
    actualizadoEl: '',
};

const tieneTexto = (...valores: string[]) => valores.some(v => v && v.trim().length > 0);

export const flujoContextoService = {
    load(): ContextoFlujo {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return structuredClone(FLUJO_VACIO);
            const parsed = JSON.parse(raw);
            // Merge defensivo por si el esquema creció desde que se guardó
            return {
                ...structuredClone(FLUJO_VACIO),
                ...parsed,
                plantel: { ...FLUJO_VACIO.plantel, ...parsed.plantel },
                grupo: { ...FLUJO_VACIO.grupo, ...parsed.grupo },
                bap: { ...structuredClone(FLUJO_VACIO.bap), ...parsed.bap },
                paec: { ...FLUJO_VACIO.paec, ...parsed.paec },
            };
        } catch {
            return structuredClone(FLUJO_VACIO);
        }
    },

    save(flujo: ContextoFlujo): ContextoFlujo {
        const sellado = { ...flujo, actualizadoEl: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sellado));
        return sellado;
    },

    /**
     * Sube la versión local a la nube. No bloquea: si falla, lo local queda intacto.
     * Devuelve si el respaldo realmente se escribió, para no anunciar al docente
     * que su trabajo está a salvo cuando no lo está.
     */
    async respaldar(flujo: ContextoFlujo, user?: UsuarioSync | null): Promise<boolean> {
        if (!puedeSincronizar(user)) return false;
        return escribirCampoUsuario(user.id, CAMPO_NUBE, flujo);
    },

    /**
     * Reconcilia lo local con la nube al abrir la app y devuelve la versión vigente.
     * Gana la más reciente por `actualizadoEl`: así el docente que capturó en la
     * escuela ve ese trabajo al abrir en su casa, y viceversa.
     */
    async sincronizar(user?: UsuarioSync | null): Promise<ContextoFlujo> {
        const local = this.load();
        if (!puedeSincronizar(user)) return local;

        const remoto = await leerCampoUsuario<ContextoFlujo>(user.id, CAMPO_NUBE);
        if (!remoto) {
            // Primera vez en la nube: subimos lo local si tiene algo
            if (this.fasesCompletas(local) > 0) await this.respaldar(local, user);
            return local;
        }

        const fechaLocal = local.actualizadoEl || '';
        const fechaRemota = remoto.actualizadoEl || '';

        if (fechaRemota > fechaLocal) {
            // La nube es más nueva: la adoptamos como copia local
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoto));
            return remoto;
        }

        // Lo local es igual o más nuevo: lo empujamos a la nube
        if (fechaLocal > fechaRemota) await this.respaldar(local, user);
        return local;
    },

    // Qué fases tienen información capturada (para palomitas y flechas del panel)
    fases(flujo: ContextoFlujo) {
        const plantel = tieneTexto(flujo.plantel.aprobacion, flujo.plantel.abandono, flujo.plantel.eficienciaTerminal, flujo.plantel.conectividad, flujo.plantel.fortalezas);
        const grupo = tieneTexto(flujo.grupo.intereses, flujo.grupo.saberesPrevios, flujo.grupo.desafios, flujo.grupo.porcentajeTrabaja, flujo.grupo.estilosAprendizaje, flujo.grupo.socioemocional);
        const bap = Object.values(flujo.bap).some(c => c.detectada);
        const paec = tieneTexto(flujo.paec.problematica, flujo.paec.productoComunitario, flujo.paec.actores) || flujo.paec.asignaturas.length > 0;
        return { plantel, grupo, bap, paec };
    },

    fasesCompletas(flujo: ContextoFlujo): number {
        const f = this.fases(flujo);
        return [f.plantel, f.grupo, f.bap, f.paec].filter(Boolean).length;
    },

    // Bloque de prompt que el PlanGenerator inyecta a la IA.
    // Solo incluye las fases con información: el prompt no crece en vano.
    generarBloquePrompt(flujo: ContextoFlujo): string {
        const f = this.fases(flujo);
        if (!f.plantel && !f.grupo && !f.bap && !f.paec) return '';

        const partes: string[] = ['CONTEXTO CAPTURADO EN EL FLUJO DE CONTEXTUALIZACIÓN (usar de forma OBLIGATORIA):'];

        if (f.plantel) {
            const p = flujo.plantel;
            partes.push(`- PLANTEL: ${[
                p.aprobacion && `aprobación ${p.aprobacion}`,
                p.abandono && `abandono ${p.abandono}`,
                p.eficienciaTerminal && `eficiencia terminal ${p.eficienciaTerminal}`,
                p.conectividad && `conectividad: ${p.conectividad}`,
                p.fortalezas && `fortalezas: ${p.fortalezas}`,
            ].filter(Boolean).join('; ')}.`);
        }

        if (f.grupo) {
            const g = flujo.grupo;
            partes.push(`- GRUPO: ${[
                g.intereses && `intereses: ${g.intereses}`,
                g.saberesPrevios && `saberes previos y familiares: ${g.saberesPrevios}`,
                g.desafios && `desafíos de aprendizaje: ${g.desafios}`,
                g.porcentajeTrabaja && `alumnado que trabaja: ${g.porcentajeTrabaja}`,
                g.estilosAprendizaje && `estilos de aprendizaje: ${g.estilosAprendizaje}`,
                g.socioemocional && `estado socioemocional: ${g.socioemocional}`,
            ].filter(Boolean).join('; ')}.
        INSTRUCCIÓN: la APERTURA debe partir de estos intereses y saberes reales (aprendizaje situado, Ficha 01).`);
        }

        if (f.bap) {
            const lineas = (Object.keys(flujo.bap) as BAPCategoriaId[])
                .filter(id => flujo.bap[id].detectada)
                .map(id => {
                    const cat = flujo.bap[id];
                    const estrategias = cat.estrategiasElegidas.length > 0 ? ` Estrategias acordadas: ${cat.estrategiasElegidas.join(' | ')}` : '';
                    return `  * ${ESTRATEGIAS_BAP[id].etiqueta}${cat.notas ? `: ${cat.notas}` : ''}.${estrategias}`;
                });
            partes.push(`- BARRERAS PARA EL APRENDIZAJE Y LA PARTICIPACIÓN (BAP) detectadas:\n${lineas.join('\n')}
        INSTRUCCIÓN: incorpora las estrategias acordadas como ajustes razonables DENTRO de la secuencia, marcados con la etiqueta "[Ajuste BAP]".`);
        }

        if (f.paec) {
            const pa = flujo.paec;
            partes.push(`- VÍNCULO COMUNITARIO / PAEC: ${[
                pa.problematica && `problemática del entorno: ${pa.problematica}`,
                pa.asignaturas.length > 0 && `asignaturas articuladas: ${pa.asignaturas.join(', ')}`,
                pa.productoComunitario && `producto comunitario esperado: ${pa.productoComunitario}`,
                pa.actores && `actores de la comunidad: ${pa.actores}`,
            ].filter(Boolean).join('; ')}.
        INSTRUCCIÓN: el CIERRE debe conectar con este producto de utilidad social.`);
        }

        return partes.join('\n');
    },
};
