import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Materia, CrearMateriaData, Grado } from '../../types/materia';

const MATERIAS_COLLECTION = 'materias';

/**
 * Servicio para gestión de materias y guía curricular
 */
class MateriasService {

    /**
     * Obtener todas las materias
     */
    async obtenerTodas(): Promise<Materia[]> {
        try {
            const materiasRef = collection(db, MATERIAS_COLLECTION);
            const q = query(materiasRef, orderBy('nombre', 'asc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Materia));
        } catch (error) {
            console.error('Error al obtener materias:', error);
            throw new Error('Error al obtener materias');
        }
    }

    /**
     * Obtener materias por grado
     */
    async obtenerPorGrado(grado: Grado): Promise<Materia[]> {
        try {
            const materiasRef = collection(db, MATERIAS_COLLECTION);
            const q = query(
                materiasRef,
                where('grado', '==', grado),
                where('activa', '==', true),
                orderBy('nombre', 'asc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Materia));
        } catch (error) {
            console.error('Error al obtener materias por grado:', error);
            throw new Error('Error al obtener materias por grado');
        }
    }

    /**
     * Obtener una materia por ID con todo su contenido
     */
    async obtenerPorId(materiaId: string): Promise<Materia | null> {
        try {
            const materiaDoc = await getDoc(doc(db, MATERIAS_COLLECTION, materiaId));

            if (!materiaDoc.exists()) {
                return null;
            }

            return {
                id: materiaDoc.id,
                ...materiaDoc.data()
            } as Materia;
        } catch (error) {
            console.error('Error al obtener materia:', error);
            throw new Error('Error al obtener materia');
        }
    }

    /**
     * Crear nueva materia con contenido completo
     */
    async crear(data: CrearMateriaData, creadoPor: string): Promise<Materia> {
        try {
            const materiaData: Omit<Materia, 'id'> = {
                ...data,
                activa: true,
                fechaCreacion: new Date().toISOString(),
                creadoPor
            };

            const docRef = await addDoc(collection(db, MATERIAS_COLLECTION), materiaData);

            return {
                id: docRef.id,
                ...materiaData
            };
        } catch (error) {
            console.error('Error al crear materia:', error);
            throw new Error('Error al crear materia');
        }
    }

    /**
     * Actualizar materia
     */
    async actualizar(materiaId: string, datos: Partial<Materia>): Promise<void> {
        try {
            await updateDoc(doc(db, MATERIAS_COLLECTION, materiaId), datos);
        } catch (error) {
            console.error('Error al actualizar materia:', error);
            throw new Error('Error al actualizar materia');
        }
    }

    /**
     * Activar/desactivar materia
     */
    async cambiarEstado(materiaId: string, activa: boolean): Promise<void> {
        try {
            await updateDoc(doc(db, MATERIAS_COLLECTION, materiaId), {
                activa
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            throw new Error('Error al cambiar estado');
        }
    }

    /**
     * Eliminar materia
     */
    async eliminar(materiaId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, MATERIAS_COLLECTION, materiaId));
        } catch (error) {
            console.error('Error al eliminar materia:', error);
            throw new Error('Error al eliminar materia');
        }
    }

    /**
     * Obtener estadísticas de materias
     */
    async obtenerEstadisticas() {
        try {
            const materias = await this.obtenerTodas();

            return {
                total: materias.length,
                activas: materias.filter(m => m.activa).length,
                inactivas: materias.filter(m => !m.activa).length,
                porGrado: {
                    primero: materias.filter(m => m.grado === 1).length,
                    segundo: materias.filter(m => m.grado === 2).length,
                    tercero: materias.filter(m => m.grado === 3).length
                },
                totalHoras: materias.reduce((sum, m) => sum + m.horasSemanales, 0),
                totalUnidades: materias.reduce((sum, m) => sum + m.unidades.length, 0)
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }

    /**
     * Buscar materias por nombre
     */
    async buscar(termino: string): Promise<Materia[]> {
        try {
            const materias = await this.obtenerTodas();
            const terminoLower = termino.toLowerCase();

            return materias.filter(m =>
                m.nombre.toLowerCase().includes(terminoLower) ||
                m.clave.toLowerCase().includes(terminoLower)
            );
        } catch (error) {
            console.error('Error al buscar materias:', error);
            throw new Error('Error al buscar materias');
        }
    }

    /**
     * Obtener resumen de materia (sin contenido completo)
     */
    async obtenerResumen(materiaId: string) {
        try {
            const materia = await this.obtenerPorId(materiaId);
            if (!materia) return null;

            return {
                id: materia.id,
                nombre: materia.nombre,
                clave: materia.clave,
                grado: materia.grado,
                horasSemanales: materia.horasSemanales,
                totalHoras: materia.totalHoras,
                totalUnidades: materia.unidades.length,
                totalTemas: materia.unidades.reduce((sum, u) => sum + u.temas.length, 0),
                activa: materia.activa
            };
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            throw new Error('Error al obtener resumen');
        }
    }
}

export const materiasService = new MateriasService();
