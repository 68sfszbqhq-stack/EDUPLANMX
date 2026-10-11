import { defineConfig, loadEnv, mergeConfig } from 'vite';
import baseConfig from './vite.config';
import { puenteIA } from './scripts/puente-ia';

// Version 2 (pruebas): mismo proyecto, pero en el puerto 3002 y con un candado
// que impide arrancar si el .env apunta a la base de datos real de los docentes.
const PROYECTO_PRUEBAS = 'eduplanmx-pruebas';

export default defineConfig((entorno) => {
  const env = loadEnv(entorno.mode, process.cwd(), '');
  if (env.VITE_FIREBASE_PROJECT_ID !== PROYECTO_PRUEBAS) {
    throw new Error(
      `La version 2 solo puede usar el proyecto "${PROYECTO_PRUEBAS}", ` +
      `pero el .env dice "${env.VITE_FIREBASE_PROJECT_ID || '(vacio -> produccion)'}".`
    );
  }
  return mergeConfig(baseConfig(entorno), {
    server: { port: 3002 },
    // Las planeaciones se generan con Claude por la terminal (scripts/puente-ia.ts),
    // no con Gemini. Solo en este servidor local: el build de producción no cambia.
    plugins: [puenteIA()],
    define: { 'import.meta.env.VITE_MOTOR_IA': JSON.stringify('terminal') },
  });
});
