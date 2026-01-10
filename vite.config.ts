import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Configuración para GitHub Pages
    base: mode === 'production' ? '/EDUPLANMX/' : '/',
    server: {
      port: 3000,
      open: false
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    define: {
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
