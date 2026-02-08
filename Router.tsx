import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import App from './App';
import RegistroAlumnos from './pages/RegistroAlumnos';
import AdminDashboard from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import DirectorDashboard from './pages/director/Dashboard';
import Students from './pages/director/Students'; // Nuevo componente de alumnos
import UsuariosPage from './pages/admin/Usuarios';
import GuiaCurricular from './pages/maestro/GuiaCurricular';
import ProgramaMateria from './pages/maestro/ProgramaMateria';
import Herramientas from './pages/maestro/Herramientas';
import { OnboardingPage } from './pages/OnboardingPage';

// Componente para redirigir según el rol
const RoleBasedRedirect: React.FC = () => {
    const { user, loading } = useAuth();

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

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Superadmin NO necesita onboarding (administra el sistema, no una escuela)
    if ((user.rol as string) === 'superadmin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Verificar si necesita completar onboarding
    // Debe tener TODOS estos campos para considerar el onboarding completo
    const needsOnboarding =
        user.onboardingCompleto === false ||
        !user.schoolId ||
        !user.schoolName ||
        !user.nombre ||
        !user.apellidoPaterno;

    if (needsOnboarding) {
        console.info('ℹ️ Redirigiendo a onboarding - Completar perfil');
        return <Navigate to="/onboarding" replace />;
    }

    // Redirigir según el rol
    switch (user.rol as string) {
        case 'superadmin':
            return <Navigate to="/admin/dashboard" replace />;
        case 'directivo':
            return <Navigate to="/directivo/dashboard" replace />;
        case 'maestro':
            return <Navigate to="/maestro/dashboard" replace />;
        case 'alumno':
            return <Navigate to="/alumno/dashboard" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

const Router: React.FC = () => {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AuthProvider>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<RegistroAlumnos />} />

                    {/* Onboarding - Protegido pero accesible para usuarios autenticados */}
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute allowedRoles={['maestro', 'directivo', 'superadmin', 'alumno']}>
                                <OnboardingPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Ruta raíz - redirige según rol */}
                    <Route path="/" element={<RoleBasedRedirect />} />

                    {/* Rutas Protegidas - Maestro */}
                    <Route
                        path="/maestro/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['maestro', 'superadmin']}>
                                <App />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/maestro/guia-curricular"
                        element={
                            <ProtectedRoute allowedRoles={['maestro', 'superadmin']}>
                                <GuiaCurricular />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/maestro/guia-curricular/:materiaId"
                        element={
                            <ProtectedRoute allowedRoles={['maestro', 'superadmin']}>
                                <ProgramaMateria />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/maestro/herramientas"
                        element={
                            <ProtectedRoute allowedRoles={['maestro', 'superadmin']}>
                                <Herramientas />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas Protegidas - Directivo */}
                    <Route
                        path="/directivo/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['directivo', 'superadmin']}>
                                <DirectorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/directivo/alumnos"
                        element={
                            <ProtectedRoute allowedRoles={['directivo', 'superadmin']}>
                                <Students />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas Protegidas - Super Admin */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin']}>
                                <SuperAdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/usuarios"
                        element={
                            <ProtectedRoute allowedRoles={['superadmin']}>
                                <UsuariosPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rutas Protegidas - Alumno (futuro) */}
                    <Route
                        path="/alumno/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['alumno']}>
                                <div className="p-8">
                                    <h1 className="text-2xl font-bold">Dashboard Alumno</h1>
                                    <p className="text-slate-600 mt-2">En construcción...</p>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default Router;
