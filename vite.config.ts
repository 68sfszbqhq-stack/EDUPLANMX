import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Único deploy: GitHub Pages (sirve desde /EDUPLANMX/). En desarrollo local se usa '/'.
    base: mode === 'production' ? '/EDUPLANMX/' : '/',
    server: {
      port: 3000,
      open: false,
      allowedHosts: true
    },
    preview: {
      allowedHosts: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    // NO se inyecta ninguna clave de IA al bundle: este sitio es estático y
    // público, así que cualquier valor definido aquí queda legible para quien
    // descargue el JavaScript. Cada docente aporta su clave desde la interfaz.
  };
});
