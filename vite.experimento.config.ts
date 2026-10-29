import { defineConfig, loadEnv, mergeConfig } from 'vite';
import baseConfig from './vite.config';
import { puenteCodex } from './scripts/puente-codex';

export default defineConfig(entorno => {
  if (loadEnv(entorno.mode, process.cwd(), '').VITE_FIREBASE_PROJECT_ID !== 'eduplanmx-pruebas') {
    throw new Error('El experimento solo puede usar eduplanmx-pruebas.');
  }
  return mergeConfig(baseConfig(entorno), {
    server: { host: '127.0.0.1', port: 3014, strictPort: true },
    plugins: [puenteCodex()],
    define: {
      'import.meta.env.VITE_MOTOR_IA': JSON.stringify('terminal'),
      'import.meta.env.VITE_TERMINAL_PROVIDER': JSON.stringify('Codex'),
    },
  });
});
