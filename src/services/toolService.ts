import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { GeneratedTool, ToolUsageStats } from '../tools/_shared/types';
import { getToolById } from '../tools/_shared/ToolRegistry';
import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Servicio para gestionar herramientas educativas
 */
export class ToolService {

    /**
     * Ejecutar una herramienta y generar contenido con IA
     */
    async executeTool(
        toolId: string,
        inputs: Record<string, any>,
        userId: string,
        schoolId?: string,
        subjectId?: string
    ): Promise<string> {

        // Obtener definición de la herramienta
        const tool = getToolById(toolId);
        if (!tool) {
            throw new Error(`Herramienta "${toolId}" no encontrada`);
        }

        // Verificar límite mensual (si aplica)
        await this.checkUsageLimit(userId);

        // Construir prompt usando el builder de la herramienta
        const prompt = tool.promptBuilder(inputs);

        // Generar contenido con Gemini
        const result = await this.generateWithAI(prompt);

        // Guardar en historial
        await this.saveToHistory({
            toolId,
            userId,
            schoolId,
            subjectId,
            inputs,
            output: result,
            tags: tool.tags,
            isFavorite: false
        });

        // Actualizar contador de uso
        await this.updateUsageCount(userId, toolId);

        return result;
    }

    /**
     * Generar contenido con Gemini AI
     */
    private async generateWithAI(prompt: string): Promise<string> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: {
                    maxOutputTokens: 4096,
                    temperature: 0.7
                }
            });

            return response.text || 'No se pudo generar contenido';
        } catch (error: any) {
            console.error('Error generando con IA:', error);
            throw new Error('Error al generar contenido. Intenta de nuevo.');
        }
    }

    /**
     * Guardar resultado en historial
     */
    private async saveToHistory(data: Omit<GeneratedTool, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'herramientas_generadas'), {
                ...data,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error guardando en historial:', error);
            throw new Error('Error al guardar en historial');
        }
    }

    /**
     * Obtener historial de usuario
     */
    async getUserHistory(userId: string, toolId?: string): Promise<GeneratedTool[]> {
        try {
            let q = query(
                collection(db, 'herramientas_generadas'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            if (toolId) {
                q = query(q, where('toolId', '==', toolId));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate()
            })) as GeneratedTool[];
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    }

    /**
     * Marcar/desmarcar como favorito
     */
    async toggleFavorite(generatedId: string, isFavorite: boolean): Promise<void> {
        try {
            const docRef = doc(db, 'herramientas_generadas', generatedId);
            await updateDoc(docRef, {
                isFavorite,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error actualizando favorito:', error);
            throw new Error('Error al actualizar favorito');
        }
    }

    /**
     * Verificar límite mensual de uso
     */
    private async checkUsageLimit(userId: string): Promise<void> {
        // TODO: Implementar lógica de límites
        // Por ahora, permitir uso ilimitado
        return;
    }

    /**
     * Actualizar contador de uso
     */
    private async updateUsageCount(userId: string, toolId: string): Promise<void> {
        // TODO: Implementar contador en perfil de usuario
        return;
    }

    /**
     * Obtener estadísticas de uso
     */
    async getUsageStats(userId: string): Promise<ToolUsageStats[]> {
        try {
            const q = query(
                collection(db, 'herramientas_generadas'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            const statsMap = new Map<string, ToolUsageStats>();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const toolId = data.toolId;

                if (statsMap.has(toolId)) {
                    const stats = statsMap.get(toolId)!;
                    stats.count++;
                    if (data.createdAt.toDate() > stats.lastUsed) {
                        stats.lastUsed = data.createdAt.toDate();
                    }
                } else {
                    statsMap.set(toolId, {
                        toolId,
                        count: 1,
                        lastUsed: data.createdAt.toDate()
                    });
                }
            });

            return Array.from(statsMap.values());
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return [];
        }
    }
}

export const toolService = new ToolService();
