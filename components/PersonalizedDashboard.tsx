import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { StatsCards } from './dashboard/StatsCards';
import { QuickActions } from './dashboard/QuickActions';
import { RecentPlaneaciones } from './dashboard/RecentPlaneaciones';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/config/firebase';

interface PersonalizedDashboardProps {
    onNavigate: (view: string) => void;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [planeaciones, setPlaneaciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        promedioSemanal: 0
    });

    useEffect(() => {
        if (user?.id) {
            loadPlaneaciones();
        }
    }, [user]);

    const loadPlaneaciones = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Cargar planeaciones del usuario
            const q = query(
                collection(db, 'planeaciones'),
                where('userId', '==', user.id),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            const snapshot = await getDocs(q);
            const plans = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setPlaneaciones(plans);

            // Calcular estadísticas
            const total = plans.length;
            const promedioSemanal = calculateWeeklyAverage(plans);

            setStats({
                total,
                promedioSemanal
            });
        } catch (error) {
            console.error('Error al cargar planeaciones:', error);
            // Si hay error, usar datos de localStorage como fallback
            const savedPlans = localStorage.getItem('savedPlans');
            if (savedPlans) {
                const plans = JSON.parse(savedPlans);
                setPlaneaciones(plans);
                setStats({
                    total: plans.length,
                    promedioSemanal: 0
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateWeeklyAverage = (plans: any[]): number => {
        if (plans.length === 0) return 0;

        // Obtener la fecha más antigua
        const dates = plans.map(p => new Date(p.createdAt || p.fecha));
        const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const now = new Date();

        // Calcular semanas transcurridas
        const weeksDiff = Math.max(1, Math.ceil((now.getTime() - oldestDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));

        return plans.length / weeksDiff;
    };

    const handleViewPlaneacion = (id: string) => {
        // Navegar a la vista de la planeación
        onNavigate('library');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Personalizado */}
                <DashboardHeader user={user} />

                {/* Cards de Estadísticas */}
                <StatsCards
                    totalPlaneaciones={stats.total}
                    totalMaterias={user.materias?.length || 0}
                    totalSemestres={user.grados?.length || 0}
                    promedioSemanal={stats.promedioSemanal}
                />

                {/* Acciones Rápidas */}
                <QuickActions
                    onNewPlaneacion={() => onNavigate('generator')}
                    onViewPlaneaciones={() => onNavigate('library')}
                    onHerramientas={() => onNavigate('herramientas')}
                    onContexto={() => onNavigate('context')}
                />

                {/* Planeaciones Recientes */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <RecentPlaneaciones
                        planeaciones={planeaciones}
                        onView={handleViewPlaneacion}
                    />
                )}

                {/* Mensaje de Bienvenida si es nuevo */}
                {stats.total === 0 && !loading && (
                    <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-indigo-900 mb-2">
                            ¡Bienvenido a EDUPLANMX! 🎉
                        </h3>
                        <p className="text-indigo-700 mb-4">
                            Estás listo para comenzar a crear planeaciones didácticas personalizadas.
                            Tu información ya está configurada y lista para usar.
                        </p>
                        <button
                            onClick={() => onNavigate('generator')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Crear Mi Primera Planeación
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
