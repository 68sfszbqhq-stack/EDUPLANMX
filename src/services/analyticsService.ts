/**
 * Servicio de Analítica (Google Analytics para Firebase — GRATIS, plan Spark)
 *
 * Eventos que registra la plataforma:
 *  - login                → cada inicio de sesión (método: password | google)
 *  - planeacion_iniciada  → el docente abre el generador
 *  - planeacion_generada  → Gemini respondió OK (materia + duración de la llamada)
 *  - planeacion_impresa   → clic en PDF/Imprimir = planeación ENTREGABLE (métrica reina)
 *  - modulo_abierto       → qué sección del sidebar usan de verdad
 *
 * Requiere VITE_FIREBASE_MEASUREMENT_ID en .env (se obtiene activando
 * Google Analytics en Firebase Console → Configuración del proyecto → Integraciones).
 * Si la variable no existe, todos los eventos se ignoran silenciosamente:
 * la app funciona igual con o sin analítica.
 */

import { getAnalytics, logEvent, isSupported, Analytics } from 'firebase/analytics';
import app from '../config/firebase';

let analytics: Analytics | null = null;

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

if (measurementId) {
    isSupported()
        .then((supported) => {
            if (supported) {
                analytics = getAnalytics(app);
                console.log('📊 Analítica activada');
            }
        })
        .catch(() => {
            // Navegadores sin soporte (ej. sin cookies): la app sigue normal
        });
}

const track = (eventName: string, params?: Record<string, string | number | boolean>) => {
    try {
        if (analytics) {
            logEvent(analytics, eventName, params);
        }
    } catch {
        // La analítica nunca debe romper la experiencia del docente
    }
};

export const analyticsService = {
    /** Inicio de sesión exitoso */
    trackLogin(metodo: 'password' | 'google') {
        track('login', { method: metodo });
    },

    /** El docente abrió el generador de planeaciones */
    trackPlaneacionIniciada(materia?: string) {
        track('planeacion_iniciada', { materia: materia || 'sin_materia' });
    },

    /** Gemini generó la planeación con éxito */
    trackPlaneacionGenerada(materia: string, duracionSegundos: number) {
        track('planeacion_generada', {
            materia: materia || 'sin_materia',
            duracion_segundos: Math.round(duracionSegundos)
        });
    },

    /** El docente imprimió/descargó el PDF (planeación entregable) */
    trackPlaneacionImpresa(materia: string, tiempoTotalSegundos: number) {
        track('planeacion_impresa', {
            materia: materia || 'sin_materia',
            tiempo_total_segundos: Math.round(tiempoTotalSegundos)
        });
    },

    /** Navegación: qué módulo del sidebar se abre */
    trackModuloAbierto(modulo: string) {
        track('modulo_abierto', { modulo });
    }
};
