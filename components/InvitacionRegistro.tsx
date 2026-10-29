import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { crearInvitacionRegistro } from '../src/services/invitacionesRegistro';

export default function InvitacionRegistro() {
  const { user } = useAuth();
  const [enlace, setEnlace] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copiado, setCopiado] = useState(false);
  if (!user?.schoolId || user.rol === 'guest') return null;
  return <section className="bg-white rounded-xl border border-slate-200 p-4 my-4">
    <h3 className="font-semibold">Invitar a un alumno a registrarse</h3>
    <p className="text-sm text-slate-600">Cada enlace sirve para un alumno y vence en 7 días. Compártelo directamente con él.</p>
    <button disabled={busy} className="mt-3 rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-50" onClick={async () => {
      setBusy(true); setError(''); setCopiado(false);
      try { setEnlace(await crearInvitacionRegistro(user.schoolId!)); }
      catch { setError('No se pudo crear el enlace. Verifica tu conexión y que tu acceso al plantel esté aprobado.'); }
      finally { setBusy(false); }
    }}>{busy ? 'Creando…' : 'Crear enlace individual'}</button>
    {enlace && <div className="mt-3 flex gap-2"><input aria-label="Enlace individual de registro" readOnly value={enlace} className="w-full border rounded p-2 text-sm" />
      <button className="border rounded px-3" onClick={async () => { try { await navigator.clipboard.writeText(enlace); setCopiado(true); } catch { setError('Selecciona y copia el enlace del recuadro.'); } }}>{copiado ? 'Copiado' : 'Copiar'}</button></div>}
    {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
  </section>;
}
