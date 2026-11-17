'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Spinner } from '@heroui/react';
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { SHIPPING_CARRIERS_CHILE, formatPrice } from '@/lib/constants';
import { Order } from '@/lib/types';
import {
  buildBlueExpressCheckpoints,
  getBlueExpressOfficialUrl,
} from '@/lib/shipping/bluexpress';

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get('orden') || '';

  const { orders } = useAdminStore();
  const [queryOrder, setQueryOrder] = useState(initialOrderParam || '1002');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearchOrder = (orderNumStr: string) => {
    const clean = orderNumStr.trim();
    const cleanNum = clean.replace(/[^0-9]/g, '');
    // Permite buscar tanto por N° de Pedido (#1002) como por N° de OT Blue Express (7100293841)
    const match = orders.find(
      (o) =>
        o.order_number.toString() === cleanNum ||
        (o.tracking_number && o.tracking_number === cleanNum) ||
        o.id.toLowerCase() === clean.toLowerCase()
    );
    setFoundOrder(match || null);
    setSearched(true);
  };

  useEffect(() => {
    if (initialOrderParam) {
      handleSearchOrder(initialOrderParam);
    } else if (orders.length > 0) {
      const sampleShipped = orders.find((o) => o.order_number === 1002) || orders[0];
      setFoundOrder(sampleShipped);
      setQueryOrder(sampleShipped.order_number.toString());
      setSearched(true);
    }
  }, [initialOrderParam, orders]);

  const carrierInfo = foundOrder
    ? SHIPPING_CARRIERS_CHILE.find((c) => c.id === foundOrder.shipping_carrier) ||
      SHIPPING_CARRIERS_CHILE[0]
    : null;

  const blueTrackingDetails =
    foundOrder && foundOrder.tracking_number
      ? buildBlueExpressCheckpoints(
          foundOrder.tracking_number,
          foundOrder.shipping_status,
          foundOrder.shipping_address.city,
          foundOrder.shipping_address.state,
          foundOrder.created_at
        )
      : null;

  const steps = [
    { key: 'unfulfilled', label: 'Pedido Recibido', desc: 'Pago verificado', icon: Clock },
    {
      key: 'processing',
      label: 'Admitido Blue Express',
      desc: 'Recepcionado en sucursal',
      icon: Package,
    },
    {
      key: 'shipped',
      label: 'En Tránsito / Reparto',
      desc: 'En ruta Blue Express',
      icon: Truck,
    },
    { key: 'delivered', label: 'Entregado', desc: 'Recibido en destino', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: Order['shipping_status']) => {
    switch (status) {
      case 'unfulfilled':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeStepIdx = foundOrder ? getStepIndex(foundOrder.shipping_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Encabezado */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
          SEGUIMIENTO LOGÍSTICO BLUE EXPRESS CHILE
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          Rastrea tu Pedido
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ingresa tu <strong>N° de Pedido</strong> (ej. <code className="text-slate-800">1002</code>) o tu{' '}
          <strong>N° de Orden de Transporte (OT)</strong> de Blue Express (ej.{' '}
          <code className="text-slate-800">7100293841</code>).
        </p>
      </div>

      {/* Buscador de Orden o OT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchOrder(queryOrder);
        }}
        className="max-w-lg mx-auto flex gap-2.5"
      >
        <div className="flex items-center gap-2.5 flex-1 bg-white border border-slate-200 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 rounded-xl px-4 h-12 shadow-2xs transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="N° de Pedido (1002) o N° OT Blue Express..."
            value={queryOrder}
            onChange={(e) => setQueryOrder(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 shadow-sm"
        >
          Consultar
        </Button>
      </form>

      {/* No encontrado */}
      {searched && !foundOrder && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">
            No encontramos el pedido u OT #{queryOrder}
          </h3>
          <p className="text-xs text-slate-500">
            Verifica que el número ingresado coincida con el comprobante enviado al confirmar tu compra.
          </p>
        </div>
      )}

      {foundOrder && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-200/80">
          {/* Cabecera del Pedido */}
          <div className="p-6 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ORDEN CONFIRMADA
              </span>
              <h2 className="text-xl font-black text-slate-900 font-mono">
                Pedido #{foundOrder.order_number}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Destinatario: <strong className="text-slate-800">{foundOrder.payer_name}</strong> •{' '}
                {new Date(foundOrder.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                SERVICIO DE TRANSPORTE
              </span>
              <span className="text-sm font-black text-slate-900">
                {carrierInfo?.name || 'Blue Express a Domicilio'}
              </span>
              {foundOrder.tracking_number ? (
                <span className="block text-xs font-mono font-black text-blue-600 mt-0.5">
                  OT Blue Express: {foundOrder.tracking_number}
                </span>
              ) : (
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  OT se asignará al entregar el paquete a Blue Express
                </span>
              )}
            </div>
          </div>

          {/* Línea de Tiempo de 4 Etapas + Historial de Eventos Blue Express */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= activeStepIdx;
                const isCurrent = index === activeStepIdx;

                return (
                  <div
                    key={step.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/60 text-slate-900'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isCurrent
                            ? 'bg-white/15 text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200/70 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        Paso {index + 1}
                      </span>
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-wider">{step.label}</h4>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isCurrent
                          ? 'text-slate-300'
                          : isCompleted
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Historial detallado de movimientos en Blue Express */}
            {blueTrackingDetails && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      Historial de Movimientos Blue Express (OT {foundOrder.tracking_number})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Estado actual: <strong>{blueTrackingDetails.statusLabel}</strong>
                    </span>
                  </div>

                  <a
                    href={getBlueExpressOfficialUrl(foundOrder.tracking_number || '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    <span>Ver en Blue.cl</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-3">
                  {blueTrackingDetails.checkpoints.map((chk, idx) => (
                    <div
                      key={chk.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 text-xs"
                    >
                      <div className="mt-0.5">
                        {idx === 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-slate-900">
                            {chk.status} —{' '}
                            <span className="text-blue-600 font-semibold">{chk.location}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{chk.date}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{chk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detalle de Destino e Ítems */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Dirección de Entrega
              </h4>
              <p className="text-xs font-bold text-slate-900">
                {foundOrder.shipping_address.street}
              </p>
              <p className="text-xs text-slate-600">
                {foundOrder.shipping_address.city}, {foundOrder.shipping_address.state}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Resumen del Pedido
              </h4>
              <div className="space-y-1.5 text-xs">
                {foundOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-700">
                    <span>
                      {item.title} {item.variant_title ? `(${item.variant_title})` : ''} x
                      {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900">
                  <span>Total Pagado</span>
                  <span>{formatPrice(foundOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
