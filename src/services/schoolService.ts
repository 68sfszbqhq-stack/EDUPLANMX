import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
    School,
    CreateSchoolData,
    SchoolSearchResult,
    UserProfile,
    CompleteProfileData
} from '../../types/school';

const SCHOOLS_COLLECTION = 'schools';
const USERS_COLLECTION = 'users';

/**
 * Servicio para gestión de escuelas y perfiles de usuario
 */
class SchoolService {

    /**
     * Generar código de acceso único para la escuela
     */
    private generateAccessCode(cct: string): string {
        // Ejemplo: "15ECT0001A" → "15ECT001"
        const clean = cct.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        return clean.substring(0, 8);
    }

    /**
     * Crear nueva escuela
     */
    async createSchool(data: CreateSchoolData, userId: string): Promise<School> {
        try {
            const codigoAcceso = this.generateAccessCode(data.cct);

            // Verificar que no exista una escuela con el mismo CCT
            const existing = await this.getSchoolByCCT(data.cct);
            if (existing) {
                throw new Error('Ya existe una escuela registrada con este CCT');
            }

            const schoolData: Omit<School, 'id'> = {
                nombre: data.nombre,
                cct: data.cct.toUpperCase(),
                municipio: data.municipio,
                estado: data.estado,
                turno: data.turno,
                codigoAcceso,
                createdAt: new Date().toISOString(),
                createdBy: userId,
                activa: true,
                estadisticas: {
                    totalDocentes: 1, // El creador
                    totalPlaneaciones: 0,
                    ultimaActualizacion: new Date().toISOString()
                },
                directivos: [userId] // El creador es directivo
            };

            const docRef = await addDoc(collection(db, SCHOOLS_COLLECTION), schoolData);

            return {
                id: docRef.id,
                ...schoolData
            };
        } catch (error) {
            console.error('Error al crear escuela:', error);
            throw error;
        }
    }

    /**
     * Buscar escuela por CCT
     */
    async getSchoolByCCT(cct: string): Promise<School | null> {
        try {
            const q = query(
                collection(db, SCHOOLS_COLLECTION),
                where('cct', '==', cct.toUpperCase()),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as School;
        } catch (error) {
            console.error('Error al buscar escuela por CCT:', error);
            throw error;
        }
    }

    /**
     * Buscar escuela por código de acceso
     */
    async getSchoolByCode(codigo: string): Promise<School | null> {
        try {
            const q = query(
                collection(db, SCHOOLS_COLLECTION),
                where('codigoAcceso', '==', codigo.toUpperCase()),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            } as School;
        } catch (error) {
            console.error('Error al buscar escuela por código:', error);
            throw error;
        }
    }

    /**
     * Buscar escuelas por nombre (fuzzy search)
     */
    async searchSchools(searchTerm: string): Promise<SchoolSearchResult[]> {
        try {
            // Firestore no tiene búsqueda full-text nativa
            // Obtenemos todas las escuelas activas y filtramos en cliente
            const q = query(
                collection(db, SCHOOLS_COLLECTION),
                where('activa', '==', true),
                orderBy('nombre'),
                limit(50)
            );

            const snapshot = await getDocs(q);
            const allSchools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as School[];

            // Filtrar por término de búsqueda
            const searchLower = searchTerm.toLowerCase();
            const filtered = allSchools.filter(school =>
                school.nombre.toLowerCase().includes(searchLower) ||
                school.cct.toLowerCase().includes(searchLower) ||
                school.municipio.toLowerCase().includes(searchLower)
            );

            // Mapear a resultado de búsqueda
            return filtered.map(school => ({
                id: school.id,
                nombre: school.nombre,
                cct: school.cct,
                municipio: school.municipio,
                turno: school.turno,
                codigoAcceso: school.codigoAcceso,
                totalDocentes: school.estadisticas.totalDocentes
            }));
        } catch (error) {
            console.error('Error al buscar escuelas:', error);
            throw error;
        }
    }

    /**
     * Obtener escuela por ID
     */
    async getSchoolById(schoolId: string): Promise<School | null> {
        try {
            const docRef = doc(db, SCHOOLS_COLLECTION, schoolId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            } as School;
        } catch (error) {
            console.error('Error al obtener escuela:', error);
            throw error;
        }
    }

    /**
     * Crear perfil de usuario
     */
    async createUserProfile(
        userId: string,
        email: string,
        nombre: string,
        apellidoPaterno: string,
        schoolId: string,
        schoolName: string,
        profileData: CompleteProfileData
    ): Promise<UserProfile> {
        try {
            // Determinar rol basado en puesto
            const rol = ['Director', 'Subdirector'].includes(profileData.puesto)
                ? 'directivo'
                : 'maestro';

            const userProfile: Omit<UserProfile, 'id'> = {
                email,
                nombre,
                apellidoPaterno,
                schoolId,
                schoolName,
                puesto: profileData.puesto,
                rol,
                materias: profileData.materias,
                grados: profileData.grados,
                telefono: profileData.telefono,
                createdAt: new Date().toISOString(),
                ultimoAcceso: new Date().toISOString(),
                onboardingCompleto: true
            };

            // Guardar en Firestore con el mismo ID que Auth
            const userDocRef = doc(db, USERS_COLLECTION, userId);
            await setDoc(userDocRef, userProfile as any);

            // Actualizar contador de docentes en la escuela
            await this.incrementSchoolDocentes(schoolId);

            return {
                id: userId,
                ...userProfile
            };
        } catch (error) {
            console.error('Error al crear perfil de usuario:', error);
            throw error;
        }
    }

    /**
     * Obtener perfil de usuario
     */
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const docRef = doc(db, USERS_COLLECTION, userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return {
                id: docSnap.id,
                ...docSnap.data()
            } as UserProfile;
        } catch (error) {
            console.error('Error al obtener perfil de usuario:', error);
            throw error;
        }
    }

    /**
     * Incrementar contador de docentes en escuela
     */
    private async incrementSchoolDocentes(schoolId: string): Promise<void> {
        try {
            const schoolRef = doc(db, SCHOOLS_COLLECTION, schoolId);
            const schoolSnap = await getDoc(schoolRef);

            if (schoolSnap.exists()) {
                const currentCount = schoolSnap.data().estadisticas?.totalDocentes || 0;
                await updateDoc(schoolRef, {
                    'estadisticas.totalDocentes': currentCount + 1,
                    'estadisticas.ultimaActualizacion': new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error al incrementar docentes:', error);
            // No lanzar error, es solo estadística
        }
    }

    /**
     * Verificar si usuario necesita onboarding
     */
    async needsOnboarding(userId: string): Promise<boolean> {
        try {
            const profile = await this.getUserProfile(userId);
            return !profile || !profile.onboardingCompleto;
        } catch (error) {
            console.error('Error al verificar onboarding:', error);
            return true; // Por defecto, mostrar onboarding
        }
    }
}

export const schoolService = new SchoolService();
