import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { LessonPlan } from '../../types';

// ============================================
// TIPOS
// ============================================

export interface PlaneacionFirestore {
    id?: string;
    userId: string;
    schoolId: string;

    // Datos de la planeación
    title: string;
    subject: string;
    grade?: string;
    semester?: number;

    // Contenido
    content: any; // LessonPlan completo

    // Metadata
    createdAt: string | Timestamp;
    updatedAt: string | Timestamp;

    // Opcional
    tags?: string[];
    isPublic?: boolean;
}

export interface PlaneacionesStats {
    total: number;
    porMateria: Record<string, number>;
    porSemestre: Record<string, number>;
    ultimaCreada?: string;
}

// ============================================
// CREAR PLANEACIÓN
// ============================================

/**
 * Crea una nueva planeación con aislamiento por schoolId
 * @param plan - Datos de la planeación (LessonPlan)
 * @param userId - ID del usuario que crea
 * @param schoolId - ID de la escuela
 * @returns ID de la planeación creada
 */
export const crearPlaneacion = async (
    plan: LessonPlan,
    userId: string,
    schoolId: string
): Promise<string> => {
    try {
        if (!userId || !schoolId) {
            throw new Error('userId y schoolId son requeridos');
        }

        const planeacionData: PlaneacionFirestore = {
            userId,
            schoolId,
            title: plan.title || plan.subject || 'Sin título',
            subject: plan.subject || '',
            grade: plan.meta?.gradeGroup,
            semester: (plan.meta as any)?.semester,
            content: plan,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            tags: [],
            isPublic: false
        };

        const docRef = await addDoc(collection(db, 'planeaciones'), planeacionData);

        console.log('✅ Planeación creada:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error al crear planeación:', error);
        throw error;
    }
};

// ============================================
// OBTENER PLANEACIONES DEL DOCENTE
// ============================================

/**
 * Obtiene solo las planeaciones del docente actual
 * @param userId - ID del usuario
 * @param schoolId - ID de la escuela (para validación)
 * @returns Array de planeaciones
 */
export const getMisPlaneaciones = async (
    userId: string,
    schoolId: string
): Promise<PlaneacionFirestore[]> => {
    try {
        if (!userId || !schoolId) {
            throw new Error('userId y schoolId son requeridos');
        }

        const q = query(
            collection(db, 'planeaciones'),
            where('schoolId', '==', schoolId),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const planeaciones = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PlaneacionFirestore));

        console.log(`✅ Cargadas ${planeaciones.length} planeaciones del docente`);
        return planeaciones;
    } catch (error) {
        console.error('❌ Error al cargar planeaciones del docente:', error);
        throw error;
    }
};

// ============================================
// OBTENER PLANEACIONES DE LA ESCUELA (DIRECTOR)
// ============================================

/**
 * Obtiene todas las planeaciones de la escuela
 * Solo para directores o coordinadores
 * @param schoolId - ID de la escuela
 * @param limitCount - Límite de resultados (opcional)
 * @returns Array de planeaciones
 */
export const getPlaneacionesEscuela = async (
    schoolId: string,
    limitCount?: number
): Promise<PlaneacionFirestore[]> => {
    try {
        if (!schoolId) {
            throw new Error('schoolId es requerido');
        }

        let q = query(
            collection(db, 'planeaciones'),
            where('schoolId', '==', schoolId),
            orderBy('createdAt', 'desc')
        );

        if (limitCount) {
            q = query(q, limit(limitCount));
        }

        const snapshot = await getDocs(q);
        const planeaciones = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PlaneacionFirestore));

        console.log(`✅ Cargadas ${planeaciones.length} planeaciones de la escuela`);
        return planeaciones;
    } catch (error) {
        console.error('❌ Error al cargar planeaciones de la escuela:', error);
        throw error;
    }
};

// ============================================
// OBTENER UNA PLANEACIÓN POR ID
// ============================================

/**
 * Obtiene una planeación específica
 * Valida que pertenezca a la misma escuela
 * @param planId - ID de la planeación
 * @param schoolId - ID de la escuela (para validación)
 * @returns Planeación o null
 */
export const getPlaneacion = async (
    planId: string,
    schoolId: string
): Promise<PlaneacionFirestore | null> => {
    try {
        const docRef = doc(db, 'planeaciones', planId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.warn('⚠️ Planeación no encontrada:', planId);
            return null;
        }

        const planeacion = {
            id: docSnap.id,
            ...docSnap.data()
        } as PlaneacionFirestore;

        // Validar que pertenezca a la misma escuela
        if (planeacion.schoolId !== schoolId) {
            console.error('❌ Acceso denegado: planeación de otra escuela');
            throw new Error('No tienes permiso para ver esta planeación');
        }

        return planeacion;
    } catch (error) {
        console.error('❌ Error al obtener planeación:', error);
        throw error;
    }
};

// ============================================
// ACTUALIZAR PLANEACIÓN
// ============================================

/**
 * Actualiza una planeación existente
 * Valida ownership (solo el autor puede actualizar)
 * @param planId - ID de la planeación
 * @param updates - Datos a actualizar
 * @param userId - ID del usuario (para validación)
 * @param schoolId - ID de la escuela (para validación)
 */
export const actualizarPlaneacion = async (
    planId: string,
    updates: Partial<PlaneacionFirestore>,
    userId: string,
    schoolId: string
): Promise<void> => {
    try {
        // Primero verificar que existe y es del usuario
        const planeacion = await getPlaneacion(planId, schoolId);

        if (!planeacion) {
            throw new Error('Planeación no encontrada');
        }

        if (planeacion.userId !== userId) {
            throw new Error('No tienes permiso para editar esta planeación');
        }

        // Actualizar
        const docRef = doc(db, 'planeaciones', planId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });

        console.log('✅ Planeación actualizada:', planId);
    } catch (error) {
        console.error('❌ Error al actualizar planeación:', error);
        throw error;
    }
};

// ============================================
// ELIMINAR PLANEACIÓN
// ============================================

/**
 * Elimina una planeación
 * Valida ownership (solo el autor puede eliminar)
 * @param planId - ID de la planeación
 * @param userId - ID del usuario (para validación)
 * @param schoolId - ID de la escuela (para validación)
 */
export const eliminarPlaneacion = async (
    planId: string,
    userId: string,
    schoolId: string
): Promise<void> => {
    try {
        // Primero verificar que existe y es del usuario
        const planeacion = await getPlaneacion(planId, schoolId);

        if (!planeacion) {
            throw new Error('Planeación no encontrada');
        }

        if (planeacion.userId !== userId) {
            throw new Error('No tienes permiso para eliminar esta planeación');
        }

        // Eliminar
        const docRef = doc(db, 'planeaciones', planId);
        await deleteDoc(docRef);

        console.log('✅ Planeación eliminada:', planId);
    } catch (error) {
        console.error('❌ Error al eliminar planeación:', error);
        throw error;
    }
};

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Obtiene estadísticas de planeaciones del usuario
 * @param userId - ID del usuario
 * @param schoolId - ID de la escuela
 * @returns Estadísticas
 */
export const getEstadisticasPlaneaciones = async (
    userId: string,
    schoolId: string
): Promise<PlaneacionesStats> => {
    try {
        const planeaciones = await getMisPlaneaciones(userId, schoolId);

        const stats: PlaneacionesStats = {
            total: planeaciones.length,
            porMateria: {},
            porSemestre: {},
            ultimaCreada: planeaciones[0]?.createdAt?.toString()
        };

        // Contar por materia
        planeaciones.forEach(plan => {
            if (plan.subject) {
                stats.porMateria[plan.subject] = (stats.porMateria[plan.subject] || 0) + 1;
            }
            if (plan.semester) {
                const sem = plan.semester.toString();
                stats.porSemestre[sem] = (stats.porSemestre[sem] || 0) + 1;
            }
        });

        return stats;
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        throw error;
    }
};

// ============================================
// BUSCAR PLANEACIONES
// ============================================

/**
 * Busca planeaciones por materia o título
 * @param searchTerm - Término de búsqueda
 * @param schoolId - ID de la escuela
 * @param userId - ID del usuario (opcional, para filtrar solo las suyas)
 * @returns Array de planeaciones
 */
export const buscarPlaneaciones = async (
    searchTerm: string,
    schoolId: string,
    userId?: string
): Promise<PlaneacionFirestore[]> => {
    try {
        // Obtener todas las planeaciones relevantes
        const planeaciones = userId
            ? await getMisPlaneaciones(userId, schoolId)
            : await getPlaneacionesEscuela(schoolId);

        // Filtrar por término de búsqueda
        const term = searchTerm.toLowerCase();
        const filtered = planeaciones.filter(plan =>
            plan.title?.toLowerCase().includes(term) ||
            plan.subject?.toLowerCase().includes(term) ||
            plan.tags?.some(tag => tag.toLowerCase().includes(term))
        );

        console.log(`✅ Encontradas ${filtered.length} planeaciones para "${searchTerm}"`);
        return filtered;
    } catch (error) {
        console.error('❌ Error al buscar planeaciones:', error);
        throw error;
    }
};

// ============================================
// EXPORTAR SERVICIO
// ============================================

export const planeacionesService = {
    crear: crearPlaneacion,
    getMias: getMisPlaneaciones,
    getEscuela: getPlaneacionesEscuela,
    getById: getPlaneacion,
    actualizar: actualizarPlaneacion,
    eliminar: eliminarPlaneacion,
    getEstadisticas: getEstadisticasPlaneaciones,
    buscar: buscarPlaneaciones
};
