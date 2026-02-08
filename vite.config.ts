import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Base path: '/' para Netlify, '/EDUPLANMX/' para GitHub Pages
    // Netlify sirve desde la raíz, GitHub Pages desde subdirectorio
    // Base path: '/EDUPLANMX/' solo para GitHub Pages, '/' para el resto (Netlify, Local, Tunnel, etc.)
    base: process.env.GITHUB_PAGES === 'true' ? '/EDUPLANMX/' : '/',
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
    define: {
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
