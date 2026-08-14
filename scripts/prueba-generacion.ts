/**
 * Prueba de humo de la generación de planeaciones.
 *
 * PARA QUÉ SIRVE
 * Cada campo que se le agrega al esquema es más texto que el modelo debe producir
 * en un presupuesto fijo (maxOutputTokens). Si se pasa, la respuesta se corta a la
 * mitad, el JSON no parsea y el docente recibe un error en vez de su planeación.
 * Este script hace una llamada real y revisa dos cosas:
 *   1. que la respuesta no se haya truncado
 *   2. que vengan los campos que exige la lista de cotejo de la ATP
 *
 * USO
 *   npm run prueba:generacion                 # fundamental, 5 sesiones (caso pesado)
 *   npm run prueba:generacion -- 3            # con otro número de sesiones
 *   npm run prueba:generacion -- 3 laboral    # Formación Laboral
 *
 * La clave sale de VITE_API_KEY en .env y nunca se imprime.
 * Consume cuota de la API: no lo corras en bucle.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { PLAN_RESPONSE_SCHEMA, construirSystemInstruction } from '../services/planSchema';
import { PLAN_LABORAL_RESPONSE_SCHEMA, construirSystemInstructionLaboral } from '../services/planSchemaLaboral';
import type { ProgramaLaboral } from '../types/formacionLaboral';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function leerApiKey(): string {
    let env = '';
    try {
        env = readFileSync(resolve(raiz, '.env'), 'utf8');
    } catch {
        throw new Error('No se encontró .env en la raíz del proyecto.');
    }
    const linea = env.split('\n').find(l => l.trim().startsWith('VITE_API_KEY='));
    const clave = linea?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    if (!clave) throw new Error('No hay VITE_API_KEY en .env');
    return clave;
}

/** Campos que la lista de cotejo de la ATP revisa, según el componente de formación. */
const CAMPOS_COMUNES: Array<{ ruta: string; etiqueta: string }> = [
    { ruta: 'products', etiqueta: 'Productos a realizar' },
    { ruta: 'collaborativeWork', etiqueta: 'Trabajo colaborativo' },
    { ruta: 'references', etiqueta: 'Referencias' },
    { ruta: 'resources', etiqueta: 'Materiales y recursos' },
    { ruta: 'fundamento.transversalityLink', etiqueta: 'Transversalidad' },
    { ruta: 'evaluationTable', etiqueta: 'Tabla de evaluación' },
    { ruta: 'feedbackCycle.howToGetThere', etiqueta: 'Ciclo de retroalimentación' },
];

const CAMPOS_FUNDAMENTAL = [
    ...CAMPOS_COMUNES,
    { ruta: 'curricularElements.contents', etiqueta: 'Contenidos a abordar' },
    { ruta: 'curricularElements.trajectoryLearning', etiqueta: 'Aprendizajes de trayectoria' },
    { ruta: 'curricularElements.learningGoals', etiqueta: 'Metas de aprendizaje' },
    { ruta: 'independentStudy.feedbackStrategy', etiqueta: 'Retroalimentación (modalidad y momento)' },
    { ruta: 'independentStudy.activities', etiqueta: 'Estudio independiente' },
];

const CAMPOS_LABORAL = [
    ...CAMPOS_COMUNES,
    { ruta: 'laboral.competenciaLaboralBasica', etiqueta: 'Competencia Laboral Básica (Resultado de Aprendizaje)' },
    { ruta: 'laboral.actividadClave', etiqueta: 'Actividad Clave' },
    { ruta: 'laboral.competenciasLaborales', etiqueta: 'Competencias laborales' },
    { ruta: 'laboral.contenidos', etiqueta: 'Contenidos a abordar' },
    { ruta: 'laboral.habilidadesVidaTrabajo', etiqueta: 'Habilidades para la Vida y el Trabajo' },
    { ruta: 'laboral.desarrolloSostenible', etiqueta: 'Educación para el Desarrollo Sostenible' },
    { ruta: 'feedbackStrategy', etiqueta: 'Retroalimentación (modalidad y momento)' },
];

const valorEn = (obj: any, ruta: string) =>
    ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const tieneContenido = (v: any) =>
    Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim().length > 0 : v != null;

/** Contexto oficial de un submódulo laboral, igual que el que arma el servicio. */
function contextoLaboralDePrueba(): { contexto: string; uac: string; submodulo: string } {
    const programas: ProgramaLaboral[] = JSON.parse(
        readFileSync(resolve(raiz, 'data/programas_laborales.json'), 'utf8')
    );
    const programa = programas.find(p => p.calidadExtraccion === 'BUENA') || programas[0];
    const modulo = programa.modulos[0];
    const submodulo = modulo.submodulos[0];

    const partes = [
        `PROGRAMA OFICIAL: Formación Laboral Básica en ${programa.nombre}`,
        `MÓDULO ${modulo.numero}: ${modulo.nombre}`,
        `  Propósito del módulo: ${modulo.proposito}`,
        `SUBMÓDULO ${submodulo.numero}: ${submodulo.nombre}`,
        `  Horas: ${submodulo.horasMediacionDocente} de mediación docente, ${submodulo.horasEstudioIndependiente} de estudio independiente.`,
        `COMPETENCIA LABORAL BÁSICA A DESARROLLAR (texto oficial, no lo reformules):`,
        `  "${submodulo.competenciaLaboralBasica}"`,
        `ACTIVIDAD CLAVE (texto oficial, la planeación debe desarrollarla, no sustituirla):`,
        `  "${submodulo.actividadClave}"`,
    ];
    return { contexto: partes.join('\n'), uac: programa.nombre, submodulo: submodulo.nombre };
}

async function main() {
    const sesiones = Number(process.argv[2]) || 5;
    const esLaboral = (process.argv[3] || '').toLowerCase().startsWith('lab');
    const ai = new GoogleGenAI({ apiKey: leerApiKey() });
    const model = 'gemini-2.5-flash';

    const lab = esLaboral ? contextoLaboralDePrueba() : null;
    const uac = lab ? lab.uac : 'Humanidades I';

    const prompt = `
      Genera una planeación didáctica para "${uac}"${lab ? '' : ' (Semestre 1)'}.
      CONFIGURACIÓN TÉCNICA:
      - Sesiones: ${sesiones} (Duración estricta: 50 min por sesión).
      - Estrategia Base: "Aprendizaje Basado en Proyectos"
      - Evaluación: "Formativa y sumativa"
      La planeación se vincula al Proyecto Escolar Comunitario del plantel.
    `;

    const escuela = {
        schoolName: 'Bachillerato General Oficial de prueba',
        vision: 'Formación integral con sentido comunitario',
    };

    const systemInstruction = lab
        ? construirSystemInstructionLaboral({ contextoOficial: lab.contexto, school: escuela, prompt })
        : construirSystemInstruction({
            contextoOficial:
                'Humanidades I. Progresión 1: Explora a partir de la pregunta "¿Por qué estoy aquí?" ' +
                'para acercarse a los saberes, recursos, prácticas y aplicaciones de las humanidades.',
            school: escuela,
            prompt,
        });

    console.log(`Componente: ${lab ? 'FORMACIÓN LABORAL' : 'Currículum Fundamental'}`);
    if (lab) console.log(`UAC: ${lab.uac} · Submódulo: ${lab.submodulo}`);
    console.log(`Generando planeación de ${sesiones} sesiones…`);
    console.log(`Tamaño del prompt de sistema: ${systemInstruction.length} caracteres\n`);

    const inicio = Date.now();
    const response = await ai.models.generateContent({
        model,
        contents: lab
            ? `Genera la planeación completa del submódulo "${lab.submodulo}" desarrollando su Actividad Clave oficial. Respeta el número de sesiones solicitado.`
            : 'Genera la planeación completa para Humanidades I basándote en el prompt estructurado. Respeta el número de sesiones solicitado.',
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: 16384,
            responseSchema: (lab ? PLAN_LABORAL_RESPONSE_SCHEMA : PLAN_RESPONSE_SCHEMA) as any,
        },
    });
    const segundos = ((Date.now() - inicio) / 1000).toFixed(1);

    const texto = response.text || '';
    const uso: any = (response as any).usageMetadata || {};
    const razonCorte = (response as any).candidates?.[0]?.finishReason;

    console.log(`Respondió en ${segundos}s`);
    console.log(`Tokens de salida: ${uso.candidatesTokenCount ?? '?'} de 16384 permitidos`);
    console.log(`Motivo de término: ${razonCorte ?? '?'}`);
    console.log(`Caracteres recibidos: ${texto.length}\n`);

    // 1) ¿Se truncó?
    if (razonCorte && razonCorte !== 'STOP') {
        console.error(`FALLA: la respuesta terminó por "${razonCorte}", no por STOP.`);
        console.error('El modelo se quedó sin presupuesto. Hay que partir la generación en dos llamadas.');
        process.exit(1);
    }

    let plan: any;
    try {
        plan = JSON.parse(texto);
    } catch {
        console.error('FALLA: el JSON vino cortado y no se pudo leer.');
        console.error('Últimos 200 caracteres:', texto.slice(-200));
        process.exit(1);
    }
    console.log('JSON completo y válido.\n');

    // 2) ¿Trae lo que revisa la ATP?
    console.log('Campos de la lista de cotejo:');
    const faltantes: string[] = [];
    for (const { ruta, etiqueta } of (lab ? CAMPOS_LABORAL : CAMPOS_FUNDAMENTAL)) {
        const ok = tieneContenido(valorEn(plan, ruta));
        console.log(`  ${ok ? 'OK  ' : 'FALTA'} ${etiqueta}`);
        if (!ok) faltantes.push(etiqueta);
    }

    // 3) Revisiones que la ATP hace de cabeza
    console.log('\nRevisiones puntuales:');
    const numSesiones = plan.sessions?.length ?? 0;
    console.log(`  ${numSesiones === sesiones ? 'OK  ' : 'FALTA'} Sesiones generadas: ${numSesiones} de ${sesiones} pedidas`);

    const tabla = plan.evaluationTable || [];
    const suma = tabla.reduce((s: number, f: any) => s + (Number(f.percentage) || 0), 0);
    console.log(`  ${suma === 100 ? 'OK  ' : 'FALTA'} La ponderación suma ${suma}%`);

    const momentosOk = tabla.length > 0 && tabla.every((f: any) => !!f.moment?.trim());
    const agentesOk = tabla.length > 0 && tabla.every((f: any) =>
        /auto|co|hetero/i.test(f.agent || ''));
    console.log(`  ${momentosOk ? 'OK  ' : 'FALTA'} Todos los renglones declaran momento`);
    console.log(`  ${agentesOk ? 'OK  ' : 'FALTA'} Todos los renglones declaran agente`);

    const estrategia = (plan.independentStudy?.feedbackStrategy || plan.feedbackStrategy || '').toLowerCase();
    const modalidadOk = /individual|grupal|grupo|equipo|pares/.test(estrategia);
    const momentoOk = /sesión|sesion|clase|cierre|inicio|semana|antes|después|despues|al final|durante/.test(estrategia);
    console.log(`  ${modalidadOk && momentoOk ? 'OK  ' : 'FALTA'} La retroalimentación dice modalidad y momento`);

    const problemas = faltantes.length + (numSesiones === sesiones ? 0 : 1) + (suma === 100 ? 0 : 1)
        + (momentosOk ? 0 : 1) + (agentesOk ? 0 : 1) + (modalidadOk && momentoOk ? 0 : 1);

    console.log(problemas === 0
        ? '\nTodo en orden: la planeación cumple la lista de cotejo y no se truncó.'
        : `\n${problemas} punto(s) por revisar.`);
    process.exit(problemas === 0 ? 0 : 1);
}

main().catch(e => {
    console.error('Error en la prueba:', e.message);
    process.exit(1);
});
