/** Los borradores sin autor de versiones anteriores NO se importan automáticamente. */
let cuenta: { uid: string; schoolId: string } | null = null;
let revision = 0;
export function activarAlmacenCuenta(uid?: string, schoolId = '') {
  if (cuenta?.uid === uid && cuenta?.schoolId === schoolId) return;
  cuenta = uid ? { uid, schoolId } : null;
  revision++;
  try { sessionStorage.removeItem('gemini_api_key'); } catch { /* sin almacenamiento */ }
}
export function obtenerAlmacenCuenta() {
  const actual = cuenta;
  const version = revision;
  const clave = (k: string) => actual?.uid === 'guest' ? k : `eduplan:cuenta:${JSON.stringify([actual?.uid, actual?.schoolId])}:${k}`;
  const vigente = () => !!actual && version === revision;
  return {
    getItem(k: string): string | null { return vigente() ? localStorage.getItem(clave(k)) : null; },
    setItem(k: string, v: string) { if (vigente()) localStorage.setItem(clave(k), v); },
    removeItem(k: string) { if (vigente()) localStorage.removeItem(clave(k)); },
    vigente,
  };
}
