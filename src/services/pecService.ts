import { PECProject, ProblemPAEC } from '../../types';

// Datos de Ejemplo (Hardcoded por ahora para Fase 1)
const MOCK_PROBLEMS: ProblemPAEC[] = [
    {
        id: 'prob-1',
        name: "Contaminación del río local",
        severity: "Alta",
        affected: ["Estudiantes", "Familias", "Comerciantes"],
        causes: ["Falta de cultura ambiental", "Basura doméstica"],
        resources: ["Plantel tiene conocimientos de ciencias", "Hay organizaciones ambientales cercanas"]
    }
];

const MOCK_PROJECTS: PECProject[] = [
    {
        id: 'pec-atoyac-2024',
        name: "Rescate del Río Atoyac",
        problemId: 'prob-1',
        justification: "El río atraviesa nuestra comunidad y está muy contaminado...",
        generalObjective: "Sensibilizar a la comunidad sobre el cuidado del río",
        specificObjectives: ["Jornadas de limpieza", "Campaña digital"],
        duration: "Ciclo 2024-2025",
        stages: [
            { name: "Diagnóstico", period: "Agosto 2024", activities: ["Medición de calidad"] },
            { name: "Limpieza", period: "Octubre 2024", activities: ["Recolección de basura"] }
        ],
        products: ["Videos educativos", "5 toneladas de basura"]
    }
];

export const pecService = {
    // Obtener proyectos activos del plantel
    getActiveProjects: async (): Promise<PECProject[]> => {
        // Simular delay de red
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_PROJECTS), 500);
        });
    },

    getProjectById: (id: string) => {
        return MOCK_PROJECTS.find(p => p.id === id);
    }
};
