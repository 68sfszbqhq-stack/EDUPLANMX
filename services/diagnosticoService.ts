
import { GoogleGenAI, Type } from "@google/genai";
import { db } from '../src/config/firebase';
import type { Alumno, DiagnosticoGrupal } from '../types/diagnostico';

const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const diagnosticoService = {

    async procesarDiagnosticoGrupal(alumnos: Alumno[]): Promise<DiagnosticoGrupal> {
        const model = 'gemini-2.0-flash-lite-preview-02-05'; // Modelo rápido y eficiente para análisis de datos

        // 1. Preparar el contexto de los alumnos para la IA
        // Convertimos la lista de alumnos en un resumen estadístico texto para no saturar tokens
        const resumenAlumnos = alumnos.map(a => ({
            situacion: a.datosNEM?.situacionFamiliar || 'Estudiante',
            estilo: a.datosNEM?.estiloAprendizaje || 'No definido',
            promedio: a.datosAdministrativos?.promedioSecundaria || 0,
            barreras: a.datosNEM?.barrerasAprendizaje || [],
            internet: a.datosNEM?.accesoInternet ? 'Sí' : 'No',
            intereses: a.datosNEM?.intereses || []
        }));

        const prompt = `
      Analiza los siguientes ${alumnos.length} perfiles de alumnos y genera un Diagnóstico Socioeducativo Grupal para el Programa de Mejora Continua (PMC) y el Programa Aula-Escuela-Comunidad (PAEC).

      DATOS DE LOS ALUMNOS (Muestra aleatoria):
      ${JSON.stringify(resumenAlumnos.slice(0, 50))} 
      (Nota: Si hay más de 50, generaliza basado en esta muestra).

      Genera un JSON con la siguiente estructura exacta:
      {
        "promedioGrupal": number (promedio general calculado con 1 decimal),
        "perfilAprendizaje": {
           "estilosDominantes": string[] (ej. ["Visual", "Kinestésico"]),
           "ganchosInteres": string[] (ej. ["Tecnología", "Fútbol"]),
           "recomendacionesDidacticas": string[] (3 estrategias concretas para este grupo)
        },
        "alertasAbandono": [
           { "alumnoId": "ID_X", "nombreAlumno": "Nombre (Inventado para proteger privacidad en este demo o usar ID)", "nivelRiesgo": "Alto" | "Medio", "factoresRiesgo": string[], "recomendaciones": string[] }
        ] (Identifica 3-5 casos hipotéticos en riesgo basado en bajos promedios o situación laboral),
        "problemaPAEC": {
           "problema": string (Problema central detectado ej. "Deserción por falta de recursos"),
           "frecuencia": number (estimado de alumnos afectados),
           "porcentaje": number (porcentaje estimado)
        },
        "problemasSecundarios": [
           { "problema": string, "porcentaje": number }
        ],
        "metasPMC": string[] (3 objetivos prioritarios para el plan de mejora),
        "contextoDigital": {
           "porcentajeConectividad": number (0-100),
           "conInternet": number (conteo),
           "sinInternet": number (conteo)
        }
      }
    `;

        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            promedioGrupal: { type: Type.NUMBER },
                            perfilAprendizaje: {
                                type: Type.OBJECT,
                                properties: {
                                    estilosDominantes: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    ganchosInteres: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    recomendacionesDidacticas: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            },
                            alertasAbandono: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        alumnoId: { type: Type.STRING },
                                        nombreAlumno: { type: Type.STRING },
                                        nivelRiesgo: { type: Type.STRING },
                                        factoresRiesgo: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        recomendaciones: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    }
                                }
                            },
                            problemaPAEC: {
                                type: Type.OBJECT,
                                properties: {
                                    problema: { type: Type.STRING },
                                    frecuencia: { type: Type.NUMBER },
                                    porcentaje: { type: Type.NUMBER }
                                }
                            },
                            problemasSecundarios: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        problema: { type: Type.STRING },
                                        porcentaje: { type: Type.NUMBER }
                                    }
                                }
                            },
                            metasPMC: { type: Type.ARRAY, items: { type: Type.STRING } },
                            contextoDigital: {
                                type: Type.OBJECT,
                                properties: {
                                    porcentajeConectividad: { type: Type.NUMBER },
                                    conInternet: { type: Type.NUMBER },
                                    sinInternet: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            });

            let texto = response.text;
            if (!texto) throw new Error("La respuesta de la IA llegó vacía.");

            // Limpieza de Markdown si la IA lo incluye (aunque usemos JSON mode)
            texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const diagnosticoGenerado = JSON.parse(texto) as DiagnosticoGrupal;
                return diagnosticoGenerado;
            } catch (jsonError) {
                console.error("❌ Error de sintaxis en JSON recibido de IA:", jsonError);
                console.log("📄 Texto crudo recibido:", texto); // Para depuración
                throw new Error("El diagnóstico generado tiene un formato inválido. Intenta de nuevo.");
            }

        } catch (e) {
            console.error("Error generando diagnóstico IA:", e);
            throw new Error("No se pudo generar el diagnóstico inteligente.");
        }
    }
};
