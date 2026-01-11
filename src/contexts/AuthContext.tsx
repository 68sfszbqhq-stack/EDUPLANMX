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
                    // Obtener datos completos del usuario desde Firestore
                    const userData = await authService.getUserData(firebaseUser.uid);
                    setUser(userData);
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

    const value: AuthContextType = {
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
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
