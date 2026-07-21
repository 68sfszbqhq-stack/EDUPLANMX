import type { BitacoraEntry } from '../../types';

/**
 * Une dos bitácoras por id de entrada, respetando los borrados locales.
 *
 * Vive en su propio módulo, sin dependencias de Firebase, porque es la parte
 * delicada de la sincronización —aquí es donde se perdería trabajo del docente
 * si estuviera mal— y así puede probarse sin red ni configuración.
 *
 * Reglas: ninguna entrada se pierde por estar solo en un lado; si la misma
 * entrada existe en ambos, gana la local (es la que el docente acaba de tocar);
 * lo borrado en este dispositivo no revive desde la nube. Más reciente primero.
 */
export function fusionarBitacoras(
    locales: BitacoraEntry[],
    remotas: BitacoraEntry[],
    idsBorrados: string[] = []
): BitacoraEntry[] {
    const borrados = new Set(idsBorrados);
    const porId = new Map<string, BitacoraEntry>();
    // Lo local se aplica al final para que gane si una entrada se editó aquí
    [...remotas, ...locales].forEach(e => {
        if (e?.id && !borrados.has(e.id)) porId.set(e.id, e);
    });
    return Array.from(porId.values())
        .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || b.id.localeCompare(a.id));
}
