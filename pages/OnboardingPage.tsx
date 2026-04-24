import React from 'react';
import { Navigate } from 'react-router-dom';
import { OnboardingContainer } from '../components/onboarding';
import { useAuth } from '../src/contexts/AuthContext';

export const OnboardingPage: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-700">Verificando estado...</p>
                </div>
            </div>
        );
    }

    const needsOnboarding =
        user?.onboardingCompleto === false ||
        !user?.schoolId ||
        !user?.schoolName ||
        !user?.nombre ||
        !user?.apellidoPaterno;

    if (user && !needsOnboarding) {
        console.info('ℹ️ Usuario con onboarding completo. Redirigiendo al inicio...');
        return <Navigate to="/" replace />;
    }

    return <OnboardingContainer />;
};
