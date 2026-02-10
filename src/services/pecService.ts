import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PECProject, ProblemPAEC } from '../../types';

export const pecService = {
    // Obtener proyectos activos del plantel (Adaptado para leer PAEC como Proyectos)
    getActiveProjects: async (schoolId: string): Promise<PECProject[]> => {
        if (!schoolId) return [];

        if (schoolId === 'demo') {
            return [
                {
                    id: 'demo-pec-1',
                    name: 'Proyecto Demo: Agua Limpia',
                    problemId: 'Escasez de agua',
                    generalObjective: 'Cultura del agua eficiente',
                    specificObjectives: [],
                    justification: 'Comunidad sin acceso regular',
                    duration: 'Ciclo 2026',
                    stages: [],
                    products: []
                }
            ] as unknown as PECProject[];
        }

        try {
            const docRef = doc(db, 'pmc', schoolId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // 1. Si hay proyectos PEC diseñados por el director, devolver esos primero
                if (data.pecProjects && Array.isArray(data.pecProjects) && data.pecProjects.length > 0) {
                    return data.pecProjects as PECProject[];
                }

                // 2. Si NO hay proyectos diseñados, adaptar las problemáticas PAEC como "proyectos sugeridos"
                // Esto es útil para la fase inicial donde solo hay diagnóstico
                const problems = (data.paec || []) as ProblemPAEC[];

                return problems.map(prob => {
                    const p = prob as any;
                    return {
                        id: p.id,
                        name: `Atención a: ${p.name || p.titulo}`, // Adaptar nombre
                        problemId: p.id,
                        justification: p.descripcion || 'Sin justificación',
                        generalObjective: `Contribuir a la solución de: ${p.name || p.titulo}`,
                        specificObjectives: [],
                        duration: 'Ciclo Escolar',
                        stages: [],
                        products: []
                    } as PECProject;
                });
            }

            return [];
        } catch (error) {
            console.error('Error al cargar proyectos PEC:', error);
            return [];
        }
    },

    getProjectById: async (schoolId: string, projectId: string): Promise<PECProject | undefined> => {
        const projects = await pecService.getActiveProjects(schoolId);
        return projects.find(p => p.id === projectId);
    }
};
