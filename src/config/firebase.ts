import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBk7iQqIVRcleUkb5WjmR3qhcvwVt0bekM",
  authDomain: "eduplanmx.firebaseapp.com",
  projectId: "eduplanmx",
  storageBucket: "eduplanmx.firebasestorage.app",
  messagingSenderId: "144677335686",
  appId: "1:144677335686:web:cd82543b32b323e3ea5707"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
