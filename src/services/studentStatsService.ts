
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const getStudentContextSummary = async (): Promise<string> => {
    try {
        const snapshot = await getDocs(collection(db, 'alumnos'));
        const total = snapshot.size;
        if (total === 0) return "No hay alumnos registrados en la base de datos.";

        const alumnos = snapshot.docs.map(d => d.data());

        let visual = 0, auditivo = 0, kinestesico = 0, lecto = 0;
        let trabaja = 0;
        let promedioSum = 0;
        const intereses: Set<string> = new Set();

        alumnos.forEach((a: any) => {
            if (a.estiloAprendizaje === 'Visual') visual++;
            if (a.estiloAprendizaje === 'Auditivo') auditivo++;
            if (a.estiloAprendizaje === 'Kinestésico') kinestesico++;
            if (a.estiloAprendizaje === 'Lecto-escritor') lecto++;

            if (a.situacionLaboral?.includes('Trabaja')) trabaja++;
            promedioSum += parseFloat(a.promedioAnterior || '0');

            if (a.intereses && Array.isArray(a.intereses)) {
                a.intereses.forEach((i: string) => intereses.add(i));
            }
        });

        const promedio = (promedioSum / total).toFixed(1);
        const interesesTop = Array.from(intereses).slice(0, 5).join(', ');

        return `GRUPO CONFORMADO POR ${total} ESTUDIANTES REALES.
        Perfil de Aprendizaje: ${visual} Visuales, ${auditivo} Auditivos, ${kinestesico} Kinestésicos, ${lecto} Lecto-escritores.
        Contexto Socioeconómico: ${trabaja} alumnos trabajan y estudian (${Math.round((trabaja / total) * 100)}%).
        Nivel Académico: Promedio general de ${promedio}.
        Intereses Principales del Grupo: ${interesesTop}.
        
        IMPORTANTE: Adapta las estrategias didácticas a este perfil específico (ej. si hay muchos kinestésicos, incluye actividades prácticas).`;
    } catch (e: any) {
        console.error("Error fetching student stats", e);
        // Fallback para modo invitado o error de permisos
        if (e.code === 'permission-denied' || e.message?.includes('Missing or insufficient permissions')) {
            return `GRUPO DEMOSTRATIVO (MOCK):
            Perfil de Aprendizaje: 10 Visuales, 5 Auditivos, 15 Kinestésicos.
            Contexto: Grupo activo y participativo, intereses en tecnología y deportes.
            Nivel: Promedio 8.5.`;
        }
        return "Grupo estándar (Sin datos específicos).";
    }
}
