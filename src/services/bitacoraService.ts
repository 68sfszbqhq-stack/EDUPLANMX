import { BitacoraEntry, SemaforoNivel } from '../../types';
import { UsuarioSync, puedeSincronizar, leerCampoUsuario, escribirCampoUsuario } from './nubeSync';
import { fusionarBitacoras } from './fusionBitacora';

export { fusionarBitacoras };

const STORAGE_KEY = 'bitacoraDocente';
const CAMPO_NUBE = 'bitacoraDocente';

// Tope de seguridad: un documento de Firestore admite 1 MB. Cada registro pesa
// ~300 bytes, así que 1500 entradas (varios años de bitácora diaria) van muy
// holgadas y evitan que el documento del usuario crezca sin control.
const MAX_ENTRADAS_NUBE = 1500;

export const SEMAFORO_INFO: Record<SemaforoNivel, { emoji: string; etiqueta: string; clase: string }> = {
    verde: { emoji: '🟢', etiqueta: 'Comprendido', clase: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
    amarillo: { emoji: '🟡', etiqueta: 'Persisten dudas', clase: 'bg-amber-50 border-amber-300 text-amber-800' },
    rojo: { emoji: '🔴', etiqueta: 'No se entendió', clase: 'bg-red-50 border-red-300 text-red-800' },
};

export const bitacoraService = {
    listar(): BitacoraEntry[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    },

    guardar(entrada: Omit<BitacoraEntry, 'id'>): BitacoraEntry[] {
        const nueva: BitacoraEntry = { ...entrada, id: `bit_${Date.now()}` };
        // Más reciente primero: es lo que el docente quiere ver al abrir
        const todas = [nueva, ...this.listar()];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todas));
        return todas;
    },

    eliminar(id: string): BitacoraEntry[] {
        const todas = this.listar().filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todas));
        // Recordamos el borrado para que la fusión con la nube no lo resucite
        try {
            const borrados: string[] = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_borrados`) || '[]');
            localStorage.setItem(`${STORAGE_KEY}_borrados`, JSON.stringify([...new Set([...borrados, id])]));
        } catch {
            // Sin registro de borrados el peor caso es que reaparezca una entrada
        }
        return todas;
    },

    idsBorrados(): string[] {
        try {
            const v = JSON.parse(localStorage.getItem(`${STORAGE_KEY}_borrados`) || '[]');
            return Array.isArray(v) ? v : [];
        } catch {
            return [];
        }
    },

    /**
     * Sube la bitácora completa a la nube (las más recientes primero).
     * Devuelve si el respaldo se escribió de verdad, para que la interfaz no
     * anuncie un respaldo que no ocurrió.
     */
    async respaldar(entradas: BitacoraEntry[], user?: UsuarioSync | null): Promise<boolean> {
        if (!puedeSincronizar(user)) return false;
        return escribirCampoUsuario(user.id, CAMPO_NUBE, entradas.slice(0, MAX_ENTRADAS_NUBE));
    },

    /**
     * Fusiona lo local con la nube por id de entrada. A diferencia del flujo, aquí
     * NO gana la versión más reciente: se unen ambas listas, porque el docente pudo
     * registrar sesiones distintas en la escuela y en su casa y ninguna debe perderse.
     */
    async sincronizar(user?: UsuarioSync | null): Promise<BitacoraEntry[]> {
        const locales = this.listar();
        if (!puedeSincronizar(user)) return locales;

        const remotas = await leerCampoUsuario<BitacoraEntry[]>(user.id, CAMPO_NUBE);
        if (!Array.isArray(remotas)) {
            if (locales.length > 0) await this.respaldar(locales, user);
            return locales;
        }

        const fusionadas = fusionarBitacoras(locales, remotas, this.idsBorrados());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fusionadas));
        await this.respaldar(fusionadas, user);
        return fusionadas;
    },

    /**
     * Conteo por nivel de semáforo. Cuando el rojo domina, la Ficha 07 del dossier
     * lo considera el mejor argumento —basado en evidencia— ante la Academia de Zona.
     */
    resumen(entradas: BitacoraEntry[]) {
        const conteo = { verde: 0, amarillo: 0, rojo: 0 };
        entradas.forEach(e => { conteo[e.semaforo]++; });
        const total = entradas.length;
        const porcentajeRojo = total > 0 ? Math.round((conteo.rojo / total) * 100) : 0;
        return { ...conteo, total, porcentajeRojo, alerta: total >= 3 && porcentajeRojo >= 40 };
    },

    /**
     * Convierte los hallazgos recientes en texto que alimenta el diagnóstico del grupo
     * en el siguiente parcial: así la Fase 1 del flujo no vuelve a empezar de cero.
     */
    generarResumenParaDiagnostico(entradas: BitacoraEntry[]): string {
        if (entradas.length === 0) return '';
        const ultimas = entradas.slice(0, 8);
        const problemas = ultimas
            .filter(e => e.semaforo !== 'verde' && e.queFallo.trim())
            .map(e => `${e.tema}: ${e.queFallo.trim()}`);
        const logros = ultimas
            .filter(e => e.semaforo === 'verde' && e.quePaso.trim())
            .map(e => `${e.tema}: ${e.quePaso.trim()}`);

        const partes: string[] = [];
        if (problemas.length > 0) {
            partes.push(`Dificultades observadas en sesiones recientes: ${problemas.slice(0, 4).join('; ')}.`);
        }
        if (logros.length > 0) {
            partes.push(`Temas que el grupo domina: ${logros.slice(0, 3).join('; ')}.`);
        }
        const acuerdos = ultimas.filter(e => e.queSigue.trim()).map(e => e.queSigue.trim());
        if (acuerdos.length > 0) {
            partes.push(`Ajustes pendientes: ${acuerdos.slice(0, 3).join('; ')}.`);
        }
        return partes.join(' ');
    },
};
