import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const input = 'w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 text-sm';
export const boton = 'inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm disabled:opacity-50';

/** Colores por categoría. Escritos completos para que Tailwind los incluya. */
export const COLOR: Record<string, { banda: string; chip: string; suave: string; punto: string }> = {
  rose: { banda: 'border-t-rose-500', chip: 'bg-rose-100 text-rose-800', suave: 'bg-rose-50', punto: 'bg-rose-500' },
  sky: { banda: 'border-t-sky-500', chip: 'bg-sky-100 text-sky-800', suave: 'bg-sky-50', punto: 'bg-sky-500' },
  amber: { banda: 'border-t-amber-500', chip: 'bg-amber-100 text-amber-800', suave: 'bg-amber-50', punto: 'bg-amber-500' },
  emerald: { banda: 'border-t-emerald-500', chip: 'bg-emerald-100 text-emerald-800', suave: 'bg-emerald-50', punto: 'bg-emerald-500' },
  slate: { banda: 'border-t-slate-400', chip: 'bg-slate-100 text-slate-700', suave: 'bg-slate-50', punto: 'bg-slate-400' },
  violet: { banda: 'border-t-violet-500', chip: 'bg-violet-100 text-violet-800', suave: 'bg-violet-50', punto: 'bg-violet-500' },
  fuchsia: { banda: 'border-t-fuchsia-500', chip: 'bg-fuchsia-100 text-fuchsia-800', suave: 'bg-fuchsia-50', punto: 'bg-fuchsia-500' },
};

/** Color de una nota según qué tanto del máximo alcanzó. */
export function colorNota(fraccion: number | null): string {
  if (fraccion === null) return '';
  if (fraccion < 0.6) return 'bg-rose-50 text-rose-800';
  if (fraccion < 0.8) return 'bg-amber-50 text-amber-900';
  return 'bg-emerald-50 text-emerald-900';
}

export function Panel({ titulo, onCerrar, children, ancho = 'max-w-2xl' }: { titulo: string; onCerrar: () => void; children: React.ReactNode; ancho?: string }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center p-4 overflow-y-auto" role="dialog" aria-label={titulo} onMouseDown={e => e.target === e.currentTarget && onCerrar()}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${ancho} p-5 space-y-3 my-8`}>
        <div className="flex justify-between items-center"><h3 className="font-bold text-slate-800">{titulo}</h3><button onClick={onCerrar} aria-label="Cerrar"><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}

/** Iniciales para el circulito del alumno. */
export const iniciales = (nombre: string) => nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
