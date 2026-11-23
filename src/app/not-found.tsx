import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 gh-cyber-bg text-[#e2e2e6]">
      <div className="max-w-md w-full gh-panel gh-panel-glow p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-[#1e2023] border border-[#00ff88]/30 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_24px_rgba(0,255,136,0.2)]">
          <Compass className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full gh-badge-cyan text-xs">
            ERROR 404 // SECTOR NO ENCONTRADO
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase font-heading">
            Página no encontrada
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cbb9] leading-relaxed">
            La dirección que buscas no existe, fue movida o el producto ya no se encuentra disponible en Gaming House.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl gh-btn-cyan text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir al Inicio
          </Link>

          <Link
            href="/productos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl gh-btn-primary text-xs uppercase tracking-wider"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
