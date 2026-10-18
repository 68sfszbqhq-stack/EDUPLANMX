import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RotateCcw, UserPlus } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { reiniciarMuestra } from '../src/demo/modoMuestra';

// Franja fija del modo muestra: recuerda que nada se guarda en una cuenta y ofrece reiniciar.
export default function AvisoMuestra() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmar, setConfirmar] = useState(false);
  if (user?.rol !== 'guest') return null;

  const volverAEmpezar = () => {
    reiniciarMuestra();
    window.location.reload();
  };

  return (
    <div className="px-4 md:px-8 py-2 bg-blue-50 border-b border-blue-200 text-sm text-blue-900 flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0" />
        <b>Modo muestra.</b> Escuela y grupo ficticios. Lo que cambies se queda solo en este navegador.
      </span>
      <span className="flex items-center gap-3 ml-auto">
        {confirmar ? (
          <>
            <span>¿Borrar tus cambios y cargar de nuevo los datos de muestra?</span>
            <button onClick={volverAEmpezar} className="font-semibold underline">Sí, volver a empezar</button>
            <button onClick={() => setConfirmar(false)} className="underline">Cancelar</button>
          </>
        ) : (
          <button onClick={() => setConfirmar(true)} className="flex items-center gap-1 font-semibold underline">
            <RotateCcw className="w-3.5 h-3.5" /> Volver a empezar
          </button>
        )}
        <button
          onClick={async () => { await logout(); navigate('/registro'); }}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          <UserPlus className="w-3.5 h-3.5" /> Crear mi cuenta
        </button>
      </span>
    </div>
  );
}
