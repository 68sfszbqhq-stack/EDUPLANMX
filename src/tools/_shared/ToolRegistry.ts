import { Tool } from './types';

/**
 * Registro central de todas las herramientas disponibles
 * Este array se irá poblando conforme se agreguen herramientas
 */
export const toolRegistry: Tool[] = [
    // Las herramientas se registrarán aquí automáticamente
    // al importarlas desde sus respectivas carpetas
];

/**
 * Obtener herramienta por ID
 */
export const getToolById = (id: string): Tool | undefined => {
    return toolRegistry.find(tool => tool.id === id);
};

/**
 * Obtener herramientas por categoría
 */
export const getToolsByCategory = (category: string): Tool[] => {
    if (category === 'all') return toolRegistry;
    return toolRegistry.filter(tool => tool.category === category);
};

/**
 * Buscar herramientas por texto
 */
export const searchTools = (query: string): Tool[] => {
    const lowerQuery = query.toLowerCase();
    return toolRegistry.filter(tool =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

/**
 * Registrar una nueva herramienta
 */
export const registerTool = (tool: Tool): void => {
    // Verificar que no exista ya
    const exists = toolRegistry.find(t => t.id === tool.id);
    if (exists) {
        console.warn(`Tool with id "${tool.id}" already registered`);
        return;
    }
    toolRegistry.push(tool);
};
