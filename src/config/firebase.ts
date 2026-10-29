import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  memoryLocalCache,
  clearIndexedDbPersistence,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

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

// En equipos compartidos, los expedientes no deben persistir en IndexedDB.
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  ignoreUndefinedProperties: true,
});

void clearIndexedDbPersistence(db).catch(() => {
  console.warn('Cierra las otras pestañas de EduPlan y vuelve a abrirlo para retirar la caché antigua.');
});

export const auth = getAuth(app);

// Versión 2: con VITE_EMULADOR=1 la app habla con el simulador local de Firebase
// (npm run emulador), no con ninguna base en la nube. Solo para probar con datos
// sintéticos; en un build normal esta variable no existe.
if (import.meta.env.VITE_EMULADOR === '1') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

export default app;

