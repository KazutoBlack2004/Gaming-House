import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#b9cbb9] hover:text-[#00ff88] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00e5ff]">
          GARANTÍA Y POST-VENTA
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase font-heading">
          Política de Cambios y Devoluciones
        </h1>
        <p className="text-xs text-[#b9cbb9]">
          Normativa de cambios, retracto y Garantía Legal aplicable a las compras en{' '}
          <strong className="text-white">{SITE_CONFIG.name}</strong>.
        </p>
      </div>

      <div className="bg-[#1a1c1f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#b9cbb9] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            1. Garantía Legal (6 Meses - Ley del Consumidor Chile)
          </h2>
          <p>
            Conforme a la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores en Chile, si el producto adquirido presenta fallas de fabricación, defectos de calidad o no cumple con las especificaciones informadas, el comprador cuenta con un plazo de <strong className="text-white">6 meses</strong> desde la recepción del producto para optar entre:
          </p>
          <ul className="space-y-1.5 pl-4 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>El cambio gratuito del producto por uno nuevo.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>La reparación gratuita del artículo.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>La devolución íntegra del dinero abonado.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            2. Cambios Voluntarios y Satisfacción
          </h2>
          <p>
            Para cambios voluntarios de producto u opción, el cliente dispone de un plazo de <strong className="text-white">10 días corridos</strong> desde la fecha de entrega. El producto debe encontrarse sin uso, con su embalaje original intacto, etiquetas y comprobante de compra o número de pedido.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            3. Procedimiento de Devolución por Courier
          </h2>
          <p>
            Para gestionar un cambio o devolución desde cualquier región de Chile, el comprador debe indicar su <strong className="text-white">Número de Pedido</strong> y motivo de la solicitud. Se coordinará el envío de retorno mediante sucursal de Blue Express, Starken o Chilexpress.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-[#1e2023] border border-[#00e5ff]/25 flex items-center gap-3 text-xs text-[#e2e2e6] font-mono font-semibold">
          <RotateCcw className="w-5 h-5 text-[#00e5ff] shrink-0" />
          <span>
            Recuerda conservar tu número de orden para agilizar cualquier gestión de post-venta en Gaming House.
          </span>
        </div>
      </div>
    </div>
  );
}
