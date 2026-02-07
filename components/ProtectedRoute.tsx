import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-700">Cargando...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Superadmin NO necesita onboarding
    const isSuperAdmin = user.rol === 'superadmin';

    // Verificar si necesita completar onboarding (excepto superadmin y en la ruta de onboarding)
    const needsOnboarding =
        !isSuperAdmin && (
            user.onboardingCompleto === false ||
            !user.schoolId ||
            !user.schoolName ||
            !user.nombre ||
            !user.apellidoPaterno
        );

    if (needsOnboarding && location.pathname !== '/onboarding') {
        console.info('ℹ️ Redirigiendo a onboarding - Completar perfil. Path actual:', location.pathname);
        return <Navigate to="/onboarding" replace />;
    }

    // Si hay roles permitidos y el usuario no tiene el rol correcto
    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md border border-red-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceso Denegado</h2>
                    <p className="text-slate-600 mb-6">
                        No tienes permisos para acceder a esta sección.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        Tu rol: <span className="font-semibold text-indigo-600">{user.rol}</span>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // Usuario autenticado y con permisos correctos
    return <>{children}</>;
};

export default ProtectedRoute;
