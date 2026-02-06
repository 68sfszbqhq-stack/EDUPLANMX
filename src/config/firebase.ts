import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase
// NOTA: Las API Keys de Firebase son públicas por diseño.
// La seguridad real viene de Firestore Rules y restricciones de dominio.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBk7iQqIVRcleUkb5WjmR3qhcvwVt0bekM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eduplanmx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eduplanmx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eduplanmx.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "144677335686",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:144677335686:web:cd82543b32b323e3ea5707"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

