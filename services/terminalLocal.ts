/** Token efímero del servidor local; nunca se guarda en el navegador. */
export async function fetchTerminalLocal(path: '/api/ia/terminal' | '/api/ia/json', init: RequestInit): Promise<Response> {
  const sesion = await fetch('/api/ia/sesion', { headers: { 'X-Eduplan-Local': '1' }, cache: 'no-store', signal: init.signal });
  if (!sesion.ok) throw new Error('No se pudo verificar el servidor local. Recarga EduPlan.');
  const { token } = await sesion.json();
  return fetch(path, { ...init, headers: { ...init.headers, 'X-Eduplan-Token': token } });
}
