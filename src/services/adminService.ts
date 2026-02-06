import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
    ApiUsageStats,
    SchoolStats,
    UserManagement,
    ApiQuota,
    BlockAction,
    SystemStats
} from '../../types/admin';

const USERS_COLLECTION = 'users';
const SCHOOLS_COLLECTION = 'schools';
const API_USAGE_COLLECTION = 'api_usage';
const QUOTAS_COLLECTION = 'api_quotas';

/**
 * Servicio para Super Admin
 */
class AdminService {

    /**
     * Obtener estadísticas globales del sistema
     */
    async getSystemStats(): Promise<SystemStats> {
        try {
            const [schools, users, apiUsage] = await Promise.all([
                getDocs(collection(db, SCHOOLS_COLLECTION)),
                getDocs(collection(db, USERS_COLLECTION)),
                getDocs(collection(db, API_USAGE_COLLECTION))
            ]);

            const totalApiRequests = apiUsage.docs.reduce((sum, doc) =>
                sum + (doc.data().totalRequests || 0), 0
            );

            const totalApiCost = apiUsage.docs.reduce((sum, doc) =>
                sum + (doc.data().estimatedCost || 0), 0
            );

            const blockedUsers = users.docs.filter(doc =>
                doc.data().isBlocked === true
            ).length;

            const blockedSchools = schools.docs.filter(doc =>
                doc.data().isBlocked === true
            ).length;

            return {
                totalSchools: schools.size,
                totalUsers: users.size,
                totalPlaneaciones: 0, // Calcular desde planeaciones
                totalApiRequests,
                totalApiCost,
                activeUsers: users.size - blockedUsers,
                blockedUsers,
                blockedSchools
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }

    /**
     * Obtener uso de API por usuario
     */
    async getApiUsageByUser(): Promise<ApiUsageStats[]> {
        try {
            const usageSnapshot = await getDocs(
                query(
                    collection(db, API_USAGE_COLLECTION),
                    orderBy('requestsThisMonth', 'desc'),
                    limit(100)
                )
            );

            const usageStats: ApiUsageStats[] = [];

            for (const usageDoc of usageSnapshot.docs) {
                const data = usageDoc.data();
                const userDoc = await getDoc(doc(db, USERS_COLLECTION, usageDoc.id));
                const userData = userDoc.data();

                if (userData) {
                    usageStats.push({
                        userId: usageDoc.id,
                        userName: `${userData.nombre} ${userData.apellidoPaterno}`,
                        schoolName: userData.schoolName || 'Sin escuela',
                        totalRequests: data.totalRequests || 0,
                        requestsThisMonth: data.requestsThisMonth || 0,
                        lastRequest: data.lastRequest || '',
                        estimatedCost: data.estimatedCost || 0
                    });
                }
            }

            return usageStats;
        } catch (error) {
            console.error('Error al obtener uso de API:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas por escuela
     */
    async getSchoolStats(): Promise<SchoolStats[]> {
        try {
            const schoolsSnapshot = await getDocs(collection(db, SCHOOLS_COLLECTION));
            const stats: SchoolStats[] = [];

            for (const schoolDoc of schoolsSnapshot.docs) {
                const schoolData = schoolDoc.data();

                // Obtener usuarios de esta escuela
                const usersQuery = query(
                    collection(db, USERS_COLLECTION),
                    where('schoolId', '==', schoolDoc.id)
                );
                const usersSnapshot = await getDocs(usersQuery);

                // Calcular uso de API de la escuela
                let apiRequestsThisMonth = 0;
                let estimatedCost = 0;

                for (const userDoc of usersSnapshot.docs) {
                    const usageDoc = await getDoc(doc(db, API_USAGE_COLLECTION, userDoc.id));
                    if (usageDoc.exists()) {
                        const usageData = usageDoc.data();
                        apiRequestsThisMonth += usageData.requestsThisMonth || 0;
                        estimatedCost += usageData.estimatedCost || 0;
                    }
                }

                stats.push({
                    schoolId: schoolDoc.id,
                    schoolName: schoolData.nombre,
                    totalUsers: usersSnapshot.size,
                    totalPlaneaciones: schoolData.estadisticas?.totalPlaneaciones || 0,
                    apiRequestsThisMonth,
                    estimatedCost,
                    isBlocked: schoolData.isBlocked || false,
                    blockedReason: schoolData.blockedReason,
                    blockedAt: schoolData.blockedAt
                });
            }

            return stats.sort((a, b) => b.apiRequestsThisMonth - a.apiRequestsThisMonth);
        } catch (error) {
            console.error('Error al obtener estadísticas de escuelas:', error);
            throw error;
        }
    }

    /**
     * Bloquear usuario
     */
    async blockUser(userId: string, reason: string, adminId: string): Promise<void> {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);

            await updateDoc(userRef, {
                isBlocked: true,
                blockedReason: reason,
                blockedAt: new Date().toISOString(),
                blockedBy: adminId
            });

            console.log(`✅ Usuario ${userId} bloqueado`);
        } catch (error) {
            console.error('Error al bloquear usuario:', error);
            throw error;
        }
    }

    /**
     * Desbloquear usuario
     */
    async unblockUser(userId: string): Promise<void> {
        try {
            const userRef = doc(db, USERS_COLLECTION, userId);

            await updateDoc(userRef, {
                isBlocked: false,
                blockedReason: null,
                blockedAt: null,
                blockedBy: null
            });

            console.log(`✅ Usuario ${userId} desbloqueado`);
        } catch (error) {
            console.error('Error al desbloquear usuario:', error);
            throw error;
        }
    }

    /**
     * Bloquear escuela completa
     */
    async blockSchool(schoolId: string, reason: string, adminId: string): Promise<void> {
        try {
            const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);

            await updateDoc(schoolRef, {
                isBlocked: true,
                blockedReason: reason,
                blockedAt: new Date().toISOString(),
                blockedBy: adminId
            });

            console.log(`✅ Escuela ${schoolId} bloqueada`);
        } catch (error) {
            console.error('Error al bloquear escuela:', error);
            throw error;
        }
    }

    /**
     * Desbloquear escuela
     */
    async unblockSchool(schoolId: string): Promise<void> {
        try {
            const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);

            await updateDoc(schoolRef, {
                isBlocked: false,
                blockedReason: null,
                blockedAt: null,
                blockedBy: null
            });

            console.log(`✅ Escuela ${schoolId} desbloqueada`);
        } catch (error) {
            console.error('Error al desbloquear escuela:', error);
            throw error;
        }
    }

    /**
     * Registrar uso de API
     */
    async logApiUsage(userId: string, cost: number = 0.001): Promise<void> {
        try {
            const usageRef = doc(db, API_USAGE_COLLECTION, userId);
            const usageDoc = await getDoc(usageRef);

            if (usageDoc.exists()) {
                // Actualizar existente
                await updateDoc(usageRef, {
                    totalRequests: increment(1),
                    requestsThisMonth: increment(1),
                    estimatedCost: increment(cost),
                    lastRequest: new Date().toISOString()
                });
            } else {
                // Crear nuevo
                await updateDoc(usageRef, {
                    totalRequests: 1,
                    requestsThisMonth: 1,
                    requestsToday: 1,
                    estimatedCost: cost,
                    lastRequest: new Date().toISOString(),
                    monthStart: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error al registrar uso de API:', error);
            // No lanzar error para no bloquear la funcionalidad principal
        }
    }

    /**
     * Verificar si usuario puede usar API
     */
    async canUseApi(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        try {
            // 1. Verificar si el usuario está bloqueado
            const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
            if (!userDoc.exists()) {
                return { allowed: false, reason: 'Usuario no encontrado' };
            }

            const userData = userDoc.data();

            if (userData.isBlocked) {
                return {
                    allowed: false,
                    reason: userData.blockedReason || 'Usuario bloqueado'
                };
            }

            // 2. Verificar si la escuela está bloqueada
            if (userData.schoolId) {
                const schoolDoc = await getDoc(doc(db, SCHOOLS_COLLECTION, userData.schoolId));
                if (schoolDoc.exists() && schoolDoc.data().isBlocked) {
                    return {
                        allowed: false,
                        reason: schoolDoc.data().blockedReason || 'Escuela bloqueada'
                    };
                }
            }

            // 3. Verificar cuota de API
            const usageDoc = await getDoc(doc(db, API_USAGE_COLLECTION, userId));
            if (usageDoc.exists()) {
                const usage = usageDoc.data();
                const MAX_REQUESTS_PER_MONTH = 1000; // Configurable

                if (usage.requestsThisMonth >= MAX_REQUESTS_PER_MONTH) {
                    return {
                        allowed: false,
                        reason: `Límite mensual alcanzado (${MAX_REQUESTS_PER_MONTH} solicitudes)`
                    };
                }
            }

            return { allowed: true };
        } catch (error) {
            console.error('Error al verificar permisos de API:', error);
            return { allowed: true }; // En caso de error, permitir (fail-open)
        }
    }

    /**
     * Obtener todos los usuarios para gestión
     */
    async getAllUsers(): Promise<UserManagement[]> {
        try {
            const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
            const users: UserManagement[] = [];

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const usageDoc = await getDoc(doc(db, API_USAGE_COLLECTION, userDoc.id));
                const usageData = usageDoc.exists() ? usageDoc.data() : {};

                users.push({
                    userId: userDoc.id,
                    email: userData.email,
                    nombre: `${userData.nombre} ${userData.apellidoPaterno}`,
                    schoolName: userData.schoolName || 'Sin escuela',
                    rol: userData.rol,
                    puesto: userData.puesto || 'N/A',
                    isBlocked: userData.isBlocked || false,
                    blockedReason: userData.blockedReason,
                    blockedAt: userData.blockedAt,
                    apiUsage: {
                        totalRequests: usageData.totalRequests || 0,
                        requestsThisMonth: usageData.requestsThisMonth || 0,
                        lastRequest: usageData.lastRequest || 'Nunca'
                    }
                });
            }

            return users.sort((a, b) =>
                b.apiUsage.requestsThisMonth - a.apiUsage.requestsThisMonth
            );
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }
}

export const adminService = new AdminService();
