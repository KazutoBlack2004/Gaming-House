import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { THEME_CONFIG } from '@/lib/theme';

export function Footer() {
  const iconMap: Record<string, React.ReactNode> = {
    Truck: <Truck className="w-5 h-5" />,
    RotateCcw: <RotateCcw className="w-5 h-5" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5" />,
    Headphones: <Headphones className="w-5 h-5" />,
  };

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200">
      {/* 1. Barra de Propuesta de Valor */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {THEME_CONFIG.valueProps.map((item, index) => (
              <div key={index} className="flex items-center gap-3.5 p-2">
                <div className="p-3 rounded-xl shrink-0 text-slate-900 bg-white border border-slate-200 shadow-2xs">
                  {iconMap[item.icon] || <Truck className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Enlaces del Pie de Página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          <div className="space-y-3">
            <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
              {SITE_CONFIG.name}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Tienda online con despacho a todo el país y seguimiento de encomiendas en línea.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/" className="hover:text-slate-950 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-slate-950 transition-colors">
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link href="/seguimiento" className="hover:text-slate-950 transition-colors">
                  Seguimiento de Pedido
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-slate-950 transition-colors">
                  Carrito de Compras
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Información Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/terminos" className="hover:text-slate-950 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="hover:text-slate-950 transition-colors">
                  Cambios y Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Medios de Pago
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700 font-semibold">
                <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  Webpay Plus
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  Flow
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  Mercado Pago
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Logística y Envíos
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-700 font-semibold">
                <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  Blue Express Domicilio
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                  Punto Blue / Copec
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center sm:text-left text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
