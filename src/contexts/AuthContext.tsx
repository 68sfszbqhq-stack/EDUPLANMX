import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { analyticsService } from '../services/analyticsService';
import type { Usuario, AuthContextType, LoginCredentials } from '../../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Modo demo (QR del congreso, links compartidos): vive en sessionStorage para que
// sobreviva al callback de Firebase y a un refresh, y se borre al cerrar la pestaña.
const GUEST_FLAG = 'eduplan_modo_invitado';

const USUARIO_INVITADO = {
    id: 'guest',
    email: 'invitado@eduplan.mx',
    nombre: 'Maestro',
    apellidoPaterno: 'Invitado',
    apellidoMaterno: '',
    rol: 'guest',
    activo: true,
    fechaCreacion: new Date().toISOString(),
    ultimoAcceso: new Date().toISOString(),
    onboardingCompleto: true, // Saltamos onboarding
    schoolName: 'Escuela Demo',
    schoolId: 'demo'
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

    useEffect(() => {
        // Observar cambios en el estado de autenticación
        const unsubscribe = authService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    // 1. Obtener datos básicos del usuario desde Firestore
                    const userData = await authService.getUserData(firebaseUser.uid);

                    // 🚨 Modificación CRÍTICA para SuperAdmin
                    if (userData?.rol === 'superadmin') {
                        console.log('👑 SuperAdmin detectado - Saltando onboarding');
                        setUser({
                            ...userData,
                            onboardingCompleto: true,
                            schoolId: 'system',
                            schoolName: 'Sistema Central'
                        } as Usuario);
                        setLoading(false);
                        return; // Salir aquí para evitar lógica de escuelas
                    }

                    // 2. Importar schoolService dinámicamente
                    const { schoolService } = await import('../services/schoolService');

                    // 3. Verificar si necesita completar onboarding
                    const needsOnboarding = await schoolService.needsOnboarding(firebaseUser.uid);

                    if (needsOnboarding) {
                        // Usuario nuevo o sin onboarding completo
                        console.log('✋ Usuario necesita completar onboarding');
                        setUser({
                            ...userData,
                            onboardingCompleto: false
                        } as Usuario);
                    } else {
                        // Usuario con onboarding completo - cargar perfil completo
                        const profile = await schoolService.getUserProfile(firebaseUser.uid);

                        if (profile) {
                            console.log('✅ Usuario con onboarding completo:', profile.schoolName);

                            // 4. Intentar obtener el CCT de la escuela
                            let schoolCct = '';
                            try {
                                const schoolData = await schoolService.getSchoolById(profile.schoolId);
                                if (schoolData) {
                                    schoolCct = schoolData.cct;
                                }
                            } catch (e) {
                                console.error('Error al obtener datos de la escuela para CCT:', e);
                            }

                            setUser({
                                ...userData,
                                schoolId: profile.schoolId,
                                schoolName: profile.schoolName,
                                schoolCct: schoolCct, // Nuevo campo
                                puesto: profile.puesto,
                                onboardingCompleto: true
                            } as Usuario);
                        } else {
                            // Perfil no encontrado, necesita onboarding
                            setUser({
                                ...userData,
                                onboardingCompleto: false
                            } as Usuario);
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar datos del usuario:', error);
                    setUser(null);
                }
            } else {
                // Sin sesión de Firebase. Si la pestaña está en modo demo, conservamos al
                // invitado: de lo contrario este callback borraría la sesión que acaba de
                // crear "Probar la demo sin cuenta" y devolvería al visitante al inicio.
                setUser(hayModoInvitado() ? USUARIO_INVITADO : null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
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
            await authService.logout();
            setUser(null);
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
        setUser(USUARIO_INVITADO);
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
