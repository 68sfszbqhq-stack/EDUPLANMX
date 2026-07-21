import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase
// NOTA: Las API Keys de Firebase son públicas por diseño.
// La seguridad real viene de Firestore Rules y restricciones de dominio.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduplanmx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduplanmx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduplanmx.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "144677335686",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:144677335686:web:cd82543b32b323e3ea5707",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Para Google Analytics (opcional)
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Firestore con caché offline persistente.
//
// Los planteles trabajan con internet intermitente: con esto, las planeaciones,
// materias y demás datos ya vistos siguen disponibles sin conexión, y las
// escrituras hechas offline se sincronizan solas al volver la red.
// persistentMultipleTabManager evita que se rompa si el docente abre la app en
// varias pestañas. Si el navegador no soporta IndexedDB (modo privado antiguo),
// Firestore cae solo a memoria, así que no hace falta un try/catch.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);

export default app;

