import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    User as FirebaseUser,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Usuario, LoginCredentials, RegisterData } from '../../types/auth';

const USUARIOS_COLLECTION = 'users';

/**
 * Servicio de Autenticación
 */
class AuthService {

    /**
     * Iniciar sesión con email y contraseña
     */
    async login(credentials: LoginCredentials): Promise<Usuario> {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            // Obtener datos del usuario desde Firestore
            const userData = await this.getUserData(userCredential.user.uid);

            if (!userData) {
                throw new Error('Usuario no encontrado en la base de datos');
            }

            if (!userData.activo) {
                throw new Error('Usuario inactivo. Contacta al administrador.');
            }

            // Actualizar último acceso
            await this.updateLastAccess(userCredential.user.uid);

            return userData;
        } catch (error: any) {
            console.error('Error en login:', error);

            // Mensajes de error amigables
            if (error.code === 'auth/user-not-found') {
                throw new Error('Usuario no encontrado');
            }
            if (error.code === 'auth/wrong-password') {
                throw new Error('Contraseña incorrecta');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('Email inválido');
            }
            if (error.code === 'auth/user-disabled') {
                throw new Error('Usuario deshabilitado');
            }

            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error en logout:', error);
            throw new Error('Error al cerrar sesión');
        }
    }

    /**
     * Iniciar sesión con Google
     */
    async loginWithGoogle(): Promise<Usuario> {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Verificar si el usuario ya existe en Firestore
            let userData = await this.getUserData(firebaseUser.uid);

            // Si no existe, crear el usuario automáticamente
            if (!userData) {
                // Extraer nombre y apellidos del displayName
                const nameParts = firebaseUser.displayName?.split(' ') || ['Usuario', 'Google'];
                const nombre = nameParts[0] || 'Usuario';
                const apellidoPaterno = nameParts[1] || 'Google';
                const apellidoMaterno = nameParts[2] || '';

                userData = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    nombre,
                    apellidoPaterno,
                    apellidoMaterno,
                    rol: 'maestro', // Por defecto, los usuarios de Google son maestros
                    activo: true,
                    fechaCreacion: new Date().toISOString(),
                    ultimoAcceso: new Date().toISOString(),
                    creadoPor: 'google-auth'
                };

                await setDoc(doc(db, USUARIOS_COLLECTION, firebaseUser.uid), userData);
                console.log('✅ Nuevo usuario creado desde Google:', userData.email);
            }

            if (userData.activo === false) {
                console.error('🚫 Acceso denegado: Usuario inactivo en Firestore', userData);
                throw new Error('Usuario inactivo. Contacta al administrador.');
            }

            // Actualizar último acceso
            await this.updateLastAccess(firebaseUser.uid);

            return userData;
        } catch (error: any) {
            console.error('Error en login con Google:', error);

            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Inicio de sesión cancelado');
            }
            if (error.code === 'auth/popup-blocked') {
                throw new Error('Popup bloqueado. Permite popups para este sitio.');
            }
            if (error.code === 'auth/cancelled-popup-request') {
                throw new Error('Inicio de sesión cancelado');
            }

            throw error;
        }
    }

    /**
     * Registrar nuevo usuario (solo para administradores)
     */
    async register(data: RegisterData, createdBy: string): Promise<Usuario> {
        try {
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            // Crear documento en Firestore
            const userData: Usuario = {
                id: userCredential.user.uid,
                email: data.email,
                nombre: data.nombre,
                apellidoPaterno: data.apellidoPaterno,
                apellidoMaterno: data.apellidoMaterno,
                rol: data.rol,
                institucionId: data.institucionId,
                gruposAsignados: [],
                activo: true,
                fechaCreacion: new Date().toISOString(),
                ultimoAcceso: new Date().toISOString(),
                creadoPor: createdBy
            };

            await setDoc(doc(db, USUARIOS_COLLECTION, userCredential.user.uid), userData);

            return userData;
        } catch (error: any) {
            console.error('Error en registro:', error);

            if (error.code === 'auth/email-already-in-use') {
                throw new Error('El email ya está registrado');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            throw error;
        }
    }

    /**
     * Obtener datos del usuario desde Firestore
     */
    async getUserData(uid: string): Promise<Usuario | null> {
        try {
            const userDoc = await getDoc(doc(db, USUARIOS_COLLECTION, uid));

            if (!userDoc.exists()) {
                return null;
            }

            return userDoc.data() as Usuario;
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            throw new Error('Error al obtener datos del usuario');
        }
    }

    /**
     * Actualizar último acceso
     */
    private async updateLastAccess(uid: string): Promise<void> {
        try {
            await updateDoc(doc(db, USUARIOS_COLLECTION, uid), {
                ultimoAcceso: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error al actualizar último acceso:', error);
            // No lanzar error, es solo metadata
        }
    }

    /**
     * Observar cambios en el estado de autenticación
     */
    onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
        return onAuthStateChanged(auth, callback);
    }

    /**
     * Obtener usuario actual de Firebase Auth
     */
    getCurrentUser(): FirebaseUser | null {
        return auth.currentUser;
    }
}

export const authService = new AuthService();
