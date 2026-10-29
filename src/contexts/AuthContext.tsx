import { activarAlmacenCuenta } from '../security/almacenCuenta';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { authService } from '../services/authService';
import { analyticsService } from '../services/analyticsService';
import type { Usuario, AuthContextType, LoginCredentials } from '../../types/auth';
import { BANDERA_MUESTRA, ESCUELA_MUESTRA, sembrarMuestra } from '../demo/modoMuestra';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Modo muestra (QR del congreso, links compartidos): vive en sessionStorage para que
// sobreviva al callback de Firebase y a un refresh, y se borre al cerrar la pestaña.
const GUEST_FLAG = BANDERA_MUESTRA;

const USUARIO_INVITADO = {
    id: 'guest',
    email: 'invitado@eduplan.mx',
    nombre: 'Docente',
    apellidoPaterno: 'de Muestra',
    apellidoMaterno: '',
    rol: 'guest',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    ultimoAcceso: new Date().toISOString(),
    onboardingCompleto: true, // Saltamos onboarding
    schoolName: ESCUELA_MUESTRA,
    schoolId: 'demo',
    materias: ['Cultura Digital I']
} as Usuario;

const hayModoInvitado = () => {
    try {
        return sessionStorage.getItem(GUEST_FLAG) === '1';
    } catch {
        return false;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Si la pestaña ya estaba en modo demo, restauramos al invitado desde el primer render
    const [user, setUser] = useState<Usuario | null>(() => hayModoInvitado() ? USUARIO_INVITADO : null);
    const [loading, setLoading] = useState(true);

    const publicarUsuario = (value: Usuario | null) => {
        activarAlmacenCuenta(value?.id, value?.schoolId || '');
        setUser(value);
    };

    useEffect(() => {
        let disposed = false;
        let version = 0;
        let previousUid: string | null = null;
        let mustClearMemory = false;
        let stopProfile: (() => void) | undefined;
        const unsubscribe = authService.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
            version++;
            if (previousUid && previousUid !== firebaseUser?.uid) mustClearMemory = true;
            previousUid = firebaseUser?.uid || null;
            stopProfile?.();
            stopProfile = undefined;
            publicarUsuario(null);
            if (!firebaseUser) {
                // Firestore conserva también una caché en memoria. Un documento nuevo
                // impide que otra cuenta recupere lecturas anteriores en modo offline.
                if (mustClearMemory) { window.location.reload(); return; }
                publicarUsuario(hayModoInvitado() ? USUARIO_INVITADO : null);
                setLoading(false);
                return;
            }
            try { sessionStorage.removeItem(GUEST_FLAG); } catch { /* almacenamiento no disponible */ }
            setLoading(true);
            // La desactivación en Firestore debe cerrar también una sesión abierta.
            stopProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), async snapshot => {
                const ticket = ++version;
                const current = () => !disposed && ticket === version && authService.getCurrentUser()?.uid === firebaseUser.uid;
                try {
                    if (!snapshot.exists()) {
                        // Google puede estar creando el perfil; el siguiente snapshot lo cargará.
                        if (current()) { publicarUsuario(null); setLoading(false); }
                        return;
                    }
                    // Esperar al perfil permite que un primer login con Google termine
                    // de crearlo antes de reiniciar por un cambio directo de cuenta.
                    if (mustClearMemory && current()) { window.location.reload(); return; }
                    const userData = { ...snapshot.data(), id: snapshot.id } as Usuario;
                    if (userData.activo !== true) {
                        if (current()) { publicarUsuario(null); await authService.logout(); }
                        return;
                    }
                    if (userData.rol === 'superadmin') {
                        if (current()) publicarUsuario({ ...userData, onboardingCompleto: true, schoolId: 'system', schoolName: 'Sistema Central' });
                        return;
                    }
                    const { schoolService } = await import('../services/schoolService');
                    const needsOnboarding = await schoolService.needsOnboarding(firebaseUser.uid);
                    if (!current()) return;
                    if (needsOnboarding) {
                        publicarUsuario({ ...userData, onboardingCompleto: false });
                        return;
                    }
                    const profile = await schoolService.getUserProfile(firebaseUser.uid);
                    const school = profile?.schoolId ? await schoolService.getSchoolById(profile.schoolId) : null;
                    if (current()) publicarUsuario(profile ? {
                        ...userData, schoolId: profile.schoolId, schoolName: profile.schoolName,
                        schoolCct: school?.cct || '', puesto: profile.puesto, onboardingCompleto: true
                    } : { ...userData, onboardingCompleto: false });
                } catch (error) {
                    console.error('No se pudo verificar la sesión:', error);
                    if (current()) publicarUsuario(null);
                } finally {
                    if (current()) setLoading(false);
                }
            }, () => {
                version++;
                publicarUsuario(null);
                setLoading(false);
            });
        });
        return () => { disposed = true; version++; stopProfile?.(); unsubscribe(); };
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            await authService.login({ email, password });
            analyticsService.trackLogin('password');
            // onAuthStateChanged se encargará de establecer el usuario y setLoading(false)
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            await authService.loginWithGoogle();
            analyticsService.trackLogin('google');
            // onAuthStateChanged se encargará de establecer el usuario y setLoading(false)
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            try { sessionStorage.removeItem(GUEST_FLAG); } catch { /* no bloquea el logout */ }
            publicarUsuario(null);
            await authService.logout();
        } catch (error) {
            throw error;
        }
    };
    const loginAsGuest = () => {
        try {
            sessionStorage.setItem(GUEST_FLAG, '1');
        } catch {
            // Sin sessionStorage el demo sigue funcionando hasta el próximo refresh
        }
        activarAlmacenCuenta('guest', 'demo');
        sembrarMuestra();
        publicarUsuario(USUARIO_INVITADO);
        setLoading(false);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        loginAsGuest, // Exportamos
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
