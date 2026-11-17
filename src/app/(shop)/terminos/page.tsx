import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="border-b border-slate-200 pb-6 space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          INFORMACIÓN LEGAL Y PRIVACIDAD
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          Términos y Condiciones
        </h1>
        <p className="text-xs text-slate-500">
          Condiciones generales de uso, compra y protección de datos personales de{' '}
          <strong>{SITE_CONFIG.name}</strong> conforme a la legislación vigente (Ley N° 19.496 y Ley N° 19.628).
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
            1. Aspectos Generales
          </h2>
          <p>
            Los presentes Términos y Condiciones regulan el acceso y las transacciones realizadas a través del sitio web de{' '}
            <strong>{SITE_CONFIG.name}</strong>. Cualquier persona que realice una compra en este sitio declara conocer y aceptar estas condiciones, las cuales se rigen por las leyes de la República de Chile, en especial la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
            2. Precios, Stock y Medios de Pago
          </h2>
          <p>
            Todos los precios publicados incluyen el Impuesto al Valor Agregado (IVA) salvo que se indique expresamente lo contrario. La disponibilidad de stock se valida al momento de confirmar el pedido. Los pagos se procesan mediante pasarelas externas certificadas (Webpay Plus, Flow, Mercado Pago o Stripe), por lo que{' '}
            <strong>{SITE_CONFIG.name}</strong> no almacena datos sensibles de tarjetas bancarias.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
            3. Despacho y Entrega de Productos
          </h2>
          <p>
            Los despachos a domicilio en la Región Metropolitana y regiones de Chile se realizan a través de operadores logísticos externos (Blue Express, Starken o Chilexpress). Una vez entregado el paquete al courier, el comprador podrá consultar su número de Orden de Transporte (OT) en la sección de{' '}
            <Link href="/seguimiento" className="text-slate-900 font-bold underline">
              Seguimiento de Pedido
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
            4. Privacidad y Protección de Datos (Ley N° 19.628)
          </h2>
          <p>
            Los datos personales solicitados durante el proceso de compra (nombre, correo electrónico, teléfono y dirección de entrega) son utilizados única y exclusivamente para procesar el pedido, emitir la documentación tributaria correspondiente y coordinar la entrega con la empresa de transporte seleccionada.
          </p>
        </section>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-700 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Sitio adaptado a los estándares de comercio electrónico y validación de pasarelas de pago en Chile.
          </span>
        </div>
      </div>
    </div>
  );
}
