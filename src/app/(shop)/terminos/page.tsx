import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#b9cbb9] hover:text-[#00ff88] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#00ff88]">
          INFORMACIÓN LEGAL Y PRIVACIDAD
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase font-heading">
          Términos y Condiciones
        </h1>
        <p className="text-xs text-[#b9cbb9]">
          Condiciones generales de uso, compra y protección de datos personales de{' '}
          <strong className="text-white">{SITE_CONFIG.name}</strong> conforme a la legislación vigente (Ley N° 19.496 y Ley N° 19.628).
        </p>
      </div>

      <div className="bg-[#1a1c1f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-[#b9cbb9] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            1. Aspectos Generales
          </h2>
          <p>
            Los presentes Términos y Condiciones regulan el acceso y las transacciones realizadas a través del sitio web de{' '}
            <strong className="text-white">{SITE_CONFIG.name}</strong>. Cualquier persona que realice una compra en este sitio declara conocer y aceptar estas condiciones, las cuales se rigen por las leyes de la República de Chile, en especial la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            2. Precios, Stock y Medios de Pago
          </h2>
          <p>
            Todos los precios publicados incluyen el Impuesto al Valor Agregado (IVA) salvo que se indique expresamente lo contrario. La disponibilidad de stock se valida al momento de confirmar el pedido. Los pagos se procesan mediante la pasarela oficial certificada Webpay Plus (Transbank), por lo que{' '}
            <strong className="text-white">{SITE_CONFIG.name}</strong> no almacena datos sensibles de tarjetas bancarias.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            3. Despacho y Entrega de Productos
          </h2>
          <p>
            Los despachos a domicilio en la Región Metropolitana y regiones de Chile se realizan a través de operadores logísticos externos (Blue Express, Starken o Chilexpress). Una vez entregado el paquete al courier, el comprador podrá consultar su número de Orden de Transporte (OT) en la sección de{' '}
            <Link href="/seguimiento" className="text-[#00ff88] font-bold underline">
              Seguimiento de Pedido
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white uppercase tracking-tight font-heading">
            4. Privacidad y Protección de Datos (Ley N° 19.628)
          </h2>
          <p>
            Los datos personales solicitados durante el proceso de compra (nombre, correo electrónico, teléfono y dirección de entrega) son utilizados única y exclusivamente para procesar el pedido, emitir la documentación tributaria correspondiente y coordinar la entrega con la empresa de transporte seleccionada.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-[#1e2023] border border-[#00ff88]/25 flex items-center gap-3 text-xs text-[#e2e2e6] font-mono font-semibold">
          <ShieldCheck className="w-5 h-5 text-[#00ff88] shrink-0" />
          <span>
            Sitio adaptado a los estándares de comercio electrónico y validación de pasarelas de pago en Chile.
          </span>
        </div>
      </div>
    </div>
  );
}
