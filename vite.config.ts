import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: false
    },
    define: {
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});
