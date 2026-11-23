import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Headphones, CreditCard } from 'lucide-react';
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
    <footer className="w-full bg-[#0c0e11] text-[#b9cbb9] border-t border-white/10">
      {/* 1. Barra de Propuesta de Valor Arquitectónica a Ancho Completo (Sin Cápsulas) */}
      <div className="w-full border-b border-white/10 bg-[#0f1217]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {THEME_CONFIG.valueProps.map((item, index) => (
            <div
              key={index}
              className="group relative px-6 lg:px-10 py-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="text-[#00ff88] pt-0.5 shrink-0 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(0,255,136,0.35)]">
                {iconMap[item.icon] || <Truck className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white group-hover:text-[#00ff88] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#849585] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Columnas Principales del Pie de Página a Ancho Completo (Sin Cápsulas) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Columna 1: Identidad Gaming House (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <svg
                viewBox="0 0 80 90"
                className="w-7 h-7 shrink-0 drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="footerNeonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00FF88" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M 40 5 L 75 25 L 75 65 L 40 85 L 5 65 L 5 25 Z"
                  fill="#111317"
                  stroke="url(#footerNeonGlow)"
                  strokeWidth="4.5"
                />
                <path
                  d="M 40 22 L 60 33 L 60 57 L 40 68 L 20 57 L 20 40 L 38 40 L 38 48 L 28 48 L 28 53 L 40 60 L 52 53 L 52 37 L 40 30 Z"
                  fill="url(#footerNeonGlow)"
                />
                <circle cx="40" cy="12" r="3" fill="#00FF88" />
              </svg>
              <span className="text-lg font-black uppercase tracking-tight text-white font-heading">
                GAMING{' '}
                <span className="bg-gradient-to-r from-[#00ff88] to-[#00e5ff] bg-clip-text text-transparent">
                  HOUSE
                </span>
              </span>
            </Link>

            <p className="text-xs text-[#849585] max-w-sm leading-relaxed">
              Tu setup listo para ganar. PCs de escritorio armadas para gaming, streaming, estudio y trabajo profesional con despacho a todo Chile.
            </p>

            {/* Indicador de estado lineal sin cápsula */}
            <div className="border-l-2 border-[#00ff88] pl-3 py-0.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#e2e2e6]">
                Servidores y Despachos Activos
              </span>
            </div>
          </div>

          {/* Columna 2: Navegación (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#00ff88] uppercase tracking-[0.15em]">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs text-[#b9cbb9] font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#00ff88] transition-colors inline-block"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="hover:text-[#00ff88] transition-colors inline-block"
                >
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/seguimiento"
                  className="hover:text-[#00ff88] transition-colors inline-block"
                >
                  Seguimiento de Pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="hover:text-[#00ff88] transition-colors inline-block"
                >
                  Carrito de Compras
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información Legal (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#00e5ff] uppercase tracking-[0.15em]">
              Información Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-[#b9cbb9] font-medium">
              <li>
                <Link
                  href="/terminos"
                  className="hover:text-[#00e5ff] transition-colors inline-block"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/devoluciones"
                  className="hover:text-[#00e5ff] transition-colors inline-block"
                >
                  Cambios y Devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Pago y Logística Sin Cápsulas (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-[0.15em]">
                Pago Oficial Protegido
              </h4>
              <div className="border-l-2 border-[#00ff88] pl-3 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00ff88]">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span>Webpay Plus (Transbank)</span>
                </div>
                <p className="text-[11px] font-mono text-[#849585]">
                  Redcompra Débito • Crédito • Prepago
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-[0.15em]">
                Logística y Envíos
              </h4>
              <div className="border-l-2 border-[#00e5ff] pl-3 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#9cf0ff]">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span>Blue Express Chile</span>
                </div>
                <p className="text-[11px] font-mono text-[#849585]">
                  Despacho a Domicilio • Punto Blue / Copec
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#849585] font-mono">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-[#00ff88]/80 tracking-wider">
            HIGH-PERFORMANCE CYBER-MINIMALISM • CHILE
          </p>
        </div>
      </div>
    </footer>
  );
}
