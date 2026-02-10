import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import type { Usuario, AuthContextType, LoginCredentials } from '../../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Usuario | null>(null);
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
                            setUser({
                                ...userData,
                                schoolId: profile.schoolId,
                                schoolName: profile.schoolName,
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
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const userData = await authService.login({ email, password });
            setUser(userData);
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            const userData = await authService.loginWithGoogle();
            setUser(userData);
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            throw error;
        }
    };
    const loginAsGuest = () => {
        setUser({
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
        } as Usuario);
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
