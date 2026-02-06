import { LucideIcon } from 'lucide-react';

/**
 * Categorías de herramientas educativas
 */
export type ToolCategory =
    | 'planeacion'
    | 'actividades'
    | 'evaluacion'
    | 'materiales'
    | 'comunicacion';

/**
 * Props comunes para todas las herramientas
 */
export interface ToolProps {
    onComplete?: (result: string) => void;
    initialData?: Record<string, any>;
}

/**
 * Definición de una herramienta educativa
 */
export interface Tool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    icon: LucideIcon;
    tags: string[];
    isPro?: boolean;
    isNew?: boolean;
    component: React.ComponentType<ToolProps>;
    promptBuilder: (inputs: any) => string;
}

/**
 * Resultado generado por una herramienta
 */
export interface GeneratedTool {
    id: string;
    toolId: string;
    userId: string;
    schoolId?: string;
    subjectId?: string;
    inputs: Record<string, any>;
    output: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    isFavorite: boolean;
}

/**
 * Estadísticas de uso de herramientas
 */
export interface ToolUsageStats {
    toolId: string;
    count: number;
    lastUsed: Date;
}
