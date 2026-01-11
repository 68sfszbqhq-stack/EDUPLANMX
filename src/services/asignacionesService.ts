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
import type { AsignacionMateria, CrearAsignacionData, HorarioMaestro } from '../../types/asignacion';
import { usuariosService } from './usuariosService';
import { materiasService } from './materiasService';

const ASIGNACIONES_COLLECTION = 'asignaciones';
const GRUPOS_COLLECTION = 'grupos';

/**
 * Servicio para gestión de asignaciones de materias
 */
class AsignacionesService {

    /**
     * Obtener todas las asignaciones
     */
    async obtenerTodas(): Promise<AsignacionMateria[]> {
        try {
            const asignacionesRef = collection(db, ASIGNACIONES_COLLECTION);
            const q = query(asignacionesRef, orderBy('fechaCreacion', 'desc'));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AsignacionMateria));
        } catch (error) {
            console.error('Error al obtener asignaciones:', error);
            throw new Error('Error al obtener asignaciones');
        }
    }

    /**
     * Obtener asignaciones por maestro
     */
    async obtenerPorMaestro(maestroId: string): Promise<AsignacionMateria[]> {
        try {
            const asignacionesRef = collection(db, ASIGNACIONES_COLLECTION);
            const q = query(
                asignacionesRef,
                where('maestroId', '==', maestroId),
                where('activa', '==', true)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AsignacionMateria));
        } catch (error) {
            console.error('Error al obtener asignaciones por maestro:', error);
            throw new Error('Error al obtener asignaciones por maestro');
        }
    }

    /**
     * Obtener asignaciones por materia
     */
    async obtenerPorMateria(materiaId: string): Promise<AsignacionMateria[]> {
        try {
            const asignacionesRef = collection(db, ASIGNACIONES_COLLECTION);
            const q = query(
                asignacionesRef,
                where('materiaId', '==', materiaId),
                where('activa', '==', true)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AsignacionMateria));
        } catch (error) {
            console.error('Error al obtener asignaciones por materia:', error);
            throw new Error('Error al obtener asignaciones por materia');
        }
    }

    /**
     * Crear nueva asignación
     */
    async crear(data: CrearAsignacionData, creadoPor: string): Promise<AsignacionMateria> {
        try {
            // Obtener datos del maestro
            const maestro = await usuariosService.obtenerPorId(data.maestroId);
            if (!maestro) {
                throw new Error('Maestro no encontrado');
            }

            // Obtener datos de la materia
            const materia = await materiasService.obtenerPorId(data.materiaId);
            if (!materia) {
                throw new Error('Materia no encontrada');
            }

            // Obtener nombres de grupos
            const gruposNombres: string[] = [];
            for (const grupoId of data.gruposIds) {
                const grupoDoc = await getDoc(doc(db, GRUPOS_COLLECTION, grupoId));
                if (grupoDoc.exists()) {
                    gruposNombres.push(grupoDoc.data().nombre);
                }
            }

            const asignacionData: Omit<AsignacionMateria, 'id'> = {
                maestroId: data.maestroId,
                maestroNombre: `${maestro.nombre} ${maestro.apellidoPaterno}`,
                materiaId: data.materiaId,
                materiaNombre: materia.nombre,
                materiaGrado: materia.grado,
                gruposIds: data.gruposIds,
                gruposNombres,
                cicloEscolar: data.cicloEscolar,
                activa: true,
                fechaCreacion: new Date().toISOString(),
                creadoPor
            };

            const docRef = await addDoc(collection(db, ASIGNACIONES_COLLECTION), asignacionData);

            return {
                id: docRef.id,
                ...asignacionData
            };
        } catch (error) {
            console.error('Error al crear asignación:', error);
            throw error;
        }
    }

    /**
     * Eliminar asignación
     */
    async eliminar(asignacionId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, ASIGNACIONES_COLLECTION, asignacionId));
        } catch (error) {
            console.error('Error al eliminar asignación:', error);
            throw new Error('Error al eliminar asignación');
        }
    }

    /**
     * Obtener horario de maestro
     */
    async obtenerHorarioMaestro(maestroId: string): Promise<HorarioMaestro> {
        try {
            const maestro = await usuariosService.obtenerPorId(maestroId);
            if (!maestro) {
                throw new Error('Maestro no encontrado');
            }

            const asignaciones = await this.obtenerPorMaestro(maestroId);

            // Calcular total de horas
            let totalHoras = 0;
            for (const asignacion of asignaciones) {
                const materia = await materiasService.obtenerPorId(asignacion.materiaId);
                if (materia) {
                    totalHoras += materia.horasSemanales * asignacion.gruposIds.length;
                }
            }

            // Contar grupos únicos
            const gruposUnicos = new Set<string>();
            asignaciones.forEach(a => a.gruposIds.forEach(g => gruposUnicos.add(g)));

            return {
                maestroId,
                maestroNombre: `${maestro.nombre} ${maestro.apellidoPaterno}`,
                asignaciones,
                totalHoras,
                totalGrupos: gruposUnicos.size
            };
        } catch (error) {
            console.error('Error al obtener horario:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de asignaciones
     */
    async obtenerEstadisticas() {
        try {
            const asignaciones = await this.obtenerTodas();

            const maestrosUnicos = new Set(asignaciones.map(a => a.maestroId));
            const materiasUnicas = new Set(asignaciones.map(a => a.materiaId));

            return {
                total: asignaciones.length,
                activas: asignaciones.filter(a => a.activa).length,
                maestrosConAsignaciones: maestrosUnicos.size,
                materiasAsignadas: materiasUnicas.size
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('Error al obtener estadísticas');
        }
    }
}

export const asignacionesService = new AsignacionesService();
