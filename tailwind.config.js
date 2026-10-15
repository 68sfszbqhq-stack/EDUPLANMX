/** @type {import('tailwindcss').Config} */

// Paleta neutral estilo Apple (v2). En lugar de cambiar los colores pantalla por
// pantalla, se redefine aquí qué significa cada nombre de Tailwind:
// - grises: neutros, sin tinte azul
// - un solo acento: el azul de Apple (indigo, purple, violet, pink, etc. lo usan)
// - verde, rojo y naranja: solo para estados (éxito, error, aviso)
// Para volver a los colores originales basta con dejar `colors` vacío.

const gris = {
  50: '#f5f5f7',
  100: '#ececf0',
  200: '#e0e0e5',
  300: '#d2d2d7',
  400: '#aeaeb2',
  500: '#86868b',
  600: '#6e6e73',
  700: '#48484a',
  800: '#2c2c2e',
  900: '#1d1d1f',
  950: '#111113',
};

const azul = {
  50: '#f0f6ff',
  100: '#e1edff',
  200: '#c2dcff',
  300: '#8fc0ff',
  400: '#4d9bff',
  500: '#0a84ff',
  600: '#0071e3',
  700: '#0062c4',
  800: '#004f9e',
  900: '#003a75',
  950: '#00264d',
};

const verde = {
  50: '#effaf2',
  100: '#dcf4e2',
  200: '#b8e8c4',
  300: '#86d79c',
  400: '#4cc46d',
  500: '#34c759',
  600: '#28a745',
  700: '#248a3d',
  800: '#1d6e31',
  900: '#175627',
  950: '#0b3015',
};

const rojo = {
  50: '#fff2f1',
  100: '#ffe3e1',
  200: '#ffc9c5',
  300: '#ffa199',
  400: '#ff6b61',
  500: '#ff3b30',
  600: '#e0281d',
  700: '#c41e15',
  800: '#a11a13',
  900: '#851a15',
  950: '#480806',
};

const naranja = {
  50: '#fff8ec',
  100: '#ffefd2',
  200: '#ffdca4',
  300: '#ffc46b',
  400: '#ffa930',
  500: '#ff9500',
  600: '#e07b00',
  700: '#c25e00',
  800: '#9a4a06',
  900: '#7c3d0a',
  950: '#431e02',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: gris,
        gray: gris,
        zinc: gris,
        neutral: gris,
        stone: gris,
        indigo: azul,
        blue: azul,
        sky: azul,
        cyan: azul,
        violet: azul,
        purple: azul,
        fuchsia: azul,
        pink: azul,
        green: verde,
        emerald: verde,
        teal: verde,
        lime: verde,
        red: rojo,
        rose: rojo,
        amber: naranja,
        yellow: naranja,
        orange: naranja,
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Helvetica Neue"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
