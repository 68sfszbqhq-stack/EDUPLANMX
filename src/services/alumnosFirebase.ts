import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Alumno } from '../../types/diagnostico';

const COLLECTION_NAME = 'alumnos';

/**
 * Servicio para gestionar alumnos en Firestore
 */
export class AlumnosFirebaseService {

    /**
     * Guardar un nuevo alumno
     */
    async guardarAlumno(alumno: Omit<Alumno, 'id'>): Promise<string> {
        try {
            const alumnoData = {
                ...alumno,
                fechaRegistro: Timestamp.now().toDate().toISOString()
            };

            const docRef = await addDoc(collection(db, COLLECTION_NAME), alumnoData);
            return docRef.id;
        } catch (error) {
            console.error('Error al guardar alumno:', error);
            throw new Error('No se pudo guardar el alumno en Firebase');
        }
    }

    /**
     * Obtener todos los alumnos
     */
    async obtenerAlumnos(): Promise<Alumno[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                orderBy('fechaRegistro', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const alumnos: Alumno[] = [];

            querySnapshot.forEach((doc) => {
                alumnos.push({
                    id: doc.id,
                    ...doc.data()
                } as Alumno);
            });

            return alumnos;
        } catch (error) {
            console.error('Error al obtener alumnos:', error);
            throw new Error('No se pudieron obtener los alumnos de Firebase');
        }
    }

    /**
     * Actualizar un alumno existente
     */
    async actualizarAlumno(id: string, datos: Partial<Alumno>): Promise<void> {
        try {
            const alumnoRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(alumnoRef, datos);
        } catch (error) {
            console.error('Error al actualizar alumno:', error);
            throw new Error('No se pudo actualizar el alumno en Firebase');
        }
    }

    /**
     * Eliminar un alumno
     */
    async eliminarAlumno(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error('Error al eliminar alumno:', error);
            throw new Error('No se pudo eliminar el alumno de Firebase');
        }
    }

    /**
     * Sincronizar alumnos de localStorage a Firebase
     */
    async sincronizarDesdeLocalStorage(): Promise<void> {
        try {
            const alumnosLocal = localStorage.getItem('alumnos');
            if (!alumnosLocal) return;

            const alumnos: Alumno[] = JSON.parse(alumnosLocal);

            for (const alumno of alumnos) {
                // Guardar cada alumno en Firebase
                await this.guardarAlumno({
                    datosAdministrativos: alumno.datosAdministrativos,
                    datosNEM: alumno.datosNEM,
                    fechaRegistro: alumno.fechaRegistro
                });
            }

            console.log(`✅ ${alumnos.length} alumnos sincronizados a Firebase`);
        } catch (error) {
            console.error('Error al sincronizar alumnos:', error);
            throw new Error('No se pudieron sincronizar los alumnos');
        }
    }
}

export const alumnosService = new AlumnosFirebaseService();
