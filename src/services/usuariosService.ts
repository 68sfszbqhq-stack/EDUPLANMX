import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Usuario, UserRole } from '../../types/auth';

const USUARIOS_COLLECTION = 'usuarios';

/**
 * Servicio para gestión de usuarios (Super Admin)
 */
class UsuariosService {

    /**
     * Obtener todos los usuarios
     */
    async obtenerTodos(): Promise<Usuario[]> {
        try {
            const usuariosRef = collection(db, USUARIOS_COLLECTION);
            const q = query(usuariosRef, orderBy('fechaCreacion', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Usuario));
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw new Error('Error al obtener usuarios');
        }
    }

    /**
     * Obtener usuarios por rol
     */
    async obtenerPorRol(rol: UserRole): Promise<Usuario[]> {
        try {
            const usuariosRef = collection(db, USUARIOS_COLLECTION);
            const q = query(
                usuariosRef,
                where('rol', '==', rol),
                orderBy('fechaCreacion', 'desc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Usuario));
        } catch (error) {
            console.error('Error al obtener usuarios por rol:', error);
            throw new Error('Error al obtener usuarios por rol');
        }
    }

    /**
     * Obtener usuarios por institución
     */
    async obtenerPorInstitucion(institucionId: string): Promise<Usuario[]> {
        try {
            const usuariosRef = collection(db, USUARIOS_COLLECTION);
            const q = query(
                usuariosRef,
                where('institucionId', '==', institucionId),
                orderBy('fechaCreacion', 'desc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Usuario));
        } catch (error) {
            console.error('Error al obtener usuarios por institución:', error);
            throw new Error('Error al obtener usuarios por institución');
        }
    }

    /**
     * Obtener un usuario por ID
     */
    async obtenerPorId(userId: string): Promise<Usuario | null> {
        try {
            const userDoc = await getDoc(doc(db, USUARIOS_COLLECTION, userId));

            if (!userDoc.exists()) {
                return null;
            }

            return {
                id: userDoc.id,
                ...userDoc.data()
            } as Usuario;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw new Error('Error al obtener usuario');
        }
    }

    /**
     * Actualizar rol de usuario
     */
    async cambiarRol(userId: string, nuevoRol: UserRole): Promise<void> {
        try {
            await updateDoc(doc(db, USUARIOS_COLLECTION, userId), {
                rol: nuevoRol
            });
        } catch (error) {
            console.error('Error al cambiar rol:', error);
            throw new Error('Error al cambiar rol');
        }
    }

    /**
     * Actualizar usuario
     */
    async actualizar(userId: string, datos: Partial<Usuario>): Promise<void> {
        try {
            await updateDoc(doc(db, USUARIOS_COLLECTION, userId), datos);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw new Error('Error al actualizar usuario');
        }
    }

    /**
     * Activar/desactivar usuario
     */
    async cambiarEstado(userId: string, activo: boolean): Promise<void> {
        try {
            await updateDoc(doc(db, USUARIOS_COLLECTION, userId), {
                activo
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            throw new Error('Error al cambiar estado');
        }
    }

    /**
     * Eliminar usuario
     */
    async eliminar(userId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, USUARIOS_COLLECTION, userId));
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw new Error('Error al eliminar usuario');
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    async obtenerEstadisticas() {
        try {
            const usuarios = await this.obtenerTodos();

            return {
                total: usuarios.length,
                activos: usuarios.filter(u => u.activo).length,
                inactivos: usuarios.filter(u => !u.activo).length,
                porRol: {
                    superadmin: usuarios.filter(u => u.rol === 'superadmin').length,
                    directivo: usuarios.filter(u => u.rol === 'directivo').length,
                    maestro: usuarios.filter(u => u.rol === 'maestro').length,
                    alumno: usuarios.filter(u => u.rol === 'alumno').length
                }
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }
}

export const usuariosService = new UsuariosService();
