import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white text-slate-900">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-900">
          <Compass className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono font-black text-xs uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Página no encontrada
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            La dirección que buscas no existe, fue movida o el producto ya no se encuentra disponible en el catálogo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir al Inicio
          </Link>

          <Link
            href="/productos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
