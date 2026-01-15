import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { PMCDiagnosis, PMCGoal } from '../../types';

const DIAGNOSIS_COLLECTION = 'pmc_diagnosis';
const GOALS_COLLECTION = 'pmc_metas';
// Usaremos un ID fijo para la demo, pero esto debería ser el ID del plantel
const SCHOOL_ID = 'plantel-demo-1';

export const pmcService = {
    // --- DIAGNÓSTICO PMC ---
    getDiagnosis: async (): Promise<PMCDiagnosis | null> => {
        try {
            const docRef = doc(db, DIAGNOSIS_COLLECTION, SCHOOL_ID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as PMCDiagnosis;
            }
            return null;
        } catch (error) {
            console.error("Error obteniendo diagnóstico PMC:", error);
            return null;
        }
    },

    saveDiagnosis: async (diagnosis: PMCDiagnosis): Promise<void> => {
        try {
            const docRef = doc(db, DIAGNOSIS_COLLECTION, SCHOOL_ID);
            await setDoc(docRef, diagnosis, { merge: true });
        } catch (error) {
            console.error("Error guardando diagnóstico PMC:", error);
            throw error;
        }
    },

    // --- METAS PMC ---
    getGoals: async (): Promise<PMCGoal[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, GOALS_COLLECTION));
            if (querySnapshot.empty) return [];
            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            } as PMCGoal));
        } catch (error) {
            console.error("Error obteniendo metas PMC:", error);
            return [];
        }
    },

    createGoal: async (goal: Omit<PMCGoal, 'id'>): Promise<PMCGoal> => {
        try {
            const docRef = await addDoc(collection(db, GOALS_COLLECTION), goal);
            return { ...goal, id: docRef.id };
        } catch (error) {
            console.error("Error creando meta PMC:", error);
            throw error;
        }
    },

    updateGoal: async (id: string, goal: Partial<PMCGoal>): Promise<void> => {
        if (!id) return;
        try {
            const docRef = doc(db, GOALS_COLLECTION, id);
            await updateDoc(docRef, goal);
        } catch (error) {
            console.error("Error actualizando meta PMC:", error);
            throw error;
        }
    },

    deleteGoal: async (id: string): Promise<void> => {
        if (!id) return;
        try {
            await deleteDoc(doc(db, GOALS_COLLECTION, id));
        } catch (error) {
            console.error("Error eliminando meta PMC:", error);
            throw error;
        }
    }
};
