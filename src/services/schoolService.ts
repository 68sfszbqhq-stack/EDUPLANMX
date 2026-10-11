import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    deleteDoc,
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

export interface Membresia {
    uid: string;
    nombre: string;
    email: string;
    rol: 'docente' | 'directivo';
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    codigo?: string;
    creadoEn: string;
    revisadoPor?: string;
    revisadoEn?: string;
}
const USERS_COLLECTION = 'users';

/**
 * Servicio para gestión de escuelas y perfiles de usuario
 */
class SchoolService {

    /**
     * Generar código de acceso único para la escuela
     */
    /**
     * Código secreto de la escuela: 8 caracteres al azar, sin 0/O/1/I/L para
     * que se dicte sin confusiones. Antes era el inicio del CCT, que es público:
     * cualquiera lo adivinaba. Vive en schools/{id}/privado/acceso y solo lo ven
     * los directivos de esa escuela.
     */
    generarCodigo(): string {
        const alfabeto = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
        const azar = crypto.getRandomValues(new Uint32Array(8));
        return Array.from(azar, n => alfabeto[n % alfabeto.length]).join('');
    }

    /**
     * Crear nueva escuela
     */
    async createSchool(data: CreateSchoolData, userId: string): Promise<School> {
        try {
            const codigo = this.generarCodigo();

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
            // Quien registra la escuela queda como su directivo, con el código para invitar.
            await setDoc(doc(db, SCHOOLS_COLLECTION, docRef.id, 'privado', 'acceso'), { codigo });
            await setDoc(doc(db, SCHOOLS_COLLECTION, docRef.id, 'miembros', userId), {
                uid: userId, nombre: data.nombreCreador ?? '', email: data.emailCreador ?? '',
                rol: 'directivo', estado: 'aprobado', creadoEn: new Date().toISOString(),
            });

            return {
                id: docRef.id,
                ...schoolData
            } as School;
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

            // Guardar en Firestore con el mismo ID que Auth (usar merge: true para no borrar 'activo')
            const userDocRef = doc(db, USERS_COLLECTION, userId);
            await setDoc(userDocRef, userProfile as any, { merge: true });

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
    // ─── Membresía verificada ──────────────────────────────────────────────

    async miMembresia(schoolId: string, uid: string): Promise<Membresia | null> {
        const s = await getDoc(doc(db, SCHOOLS_COLLECTION, schoolId, 'miembros', uid));
        return s.exists() ? (s.data() as Membresia) : null;
    }

    /**
     * Pide entrar a una escuela. Con el código correcto entra aprobado al
     * instante; sin código queda pendiente hasta que un directivo lo apruebe.
     * Lanza 'codigo-incorrecto' si el código no coincide (lo decide Firestore).
     */
    async unirseAEscuela(schoolId: string, u: { uid: string; nombre: string; email: string }, codigo?: string): Promise<Membresia> {
        const previa = await this.miMembresia(schoolId, u.uid).catch(() => null);
        if (previa && !(previa.estado === 'pendiente' && codigo)) return previa;
        const m: Membresia = {
            uid: u.uid, nombre: u.nombre.slice(0, 120), email: u.email.slice(0, 200), rol: 'docente',
            estado: codigo ? 'aprobado' : 'pendiente', creadoEn: new Date().toISOString(),
            ...(codigo ? { codigo: codigo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') } : {}),
        };
        try {
            await setDoc(doc(db, SCHOOLS_COLLECTION, schoolId, 'miembros', u.uid), m);
        } catch (e: any) {
            if (codigo && e?.code === 'permission-denied') throw new Error('codigo-incorrecto');
            throw e;
        }
        return m;
    }

    async listarMiembros(schoolId: string): Promise<Membresia[]> {
        const s = await getDocs(collection(db, SCHOOLS_COLLECTION, schoolId, 'miembros'));
        return s.docs.map(d => d.data() as Membresia).sort((a, b) => (a.estado === 'pendiente' ? -1 : 1) - (b.estado === 'pendiente' ? -1 : 1) || a.nombre.localeCompare(b.nombre, 'es'));
    }

    async revisarMiembro(schoolId: string, m: Membresia, cambios: Pick<Membresia, 'estado' | 'rol'>, revisor: string) {
        await setDoc(doc(db, SCHOOLS_COLLECTION, schoolId, 'miembros', m.uid), { ...m, ...cambios, revisadoPor: revisor, revisadoEn: new Date().toISOString() });
    }

    async quitarMiembro(schoolId: string, uid: string) {
        await deleteDoc(doc(db, SCHOOLS_COLLECTION, schoolId, 'miembros', uid));
    }

    async leerCodigo(schoolId: string): Promise<string | null> {
        const s = await getDoc(doc(db, SCHOOLS_COLLECTION, schoolId, 'privado', 'acceso'));
        return s.exists() ? (s.data().codigo as string) : null;
    }

    /** Código nuevo (por si el anterior circuló de más). Quien ya entró no pierde su acceso. */
    async cambiarCodigo(schoolId: string): Promise<string> {
        const codigo = this.generarCodigo();
        await setDoc(doc(db, SCHOOLS_COLLECTION, schoolId, 'privado', 'acceso'), { codigo });
        return codigo;
    }

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
