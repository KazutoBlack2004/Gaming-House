'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, Spinner } from '@heroui/react';
import { CheckCircle2, ArrowRight, Truck } from 'lucide-react';

function ResponseContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '1003';

  return (
    <Card shadow="none" className="clean-card rounded-2xl text-center p-6 sm:p-10">
      <CardBody className="space-y-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Tu compra ha sido registrada con éxito. Guarda tu número de orden para consultar el estado del despacho en cualquier momento.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl w-full max-w-md space-y-2 text-xs text-slate-600 border border-slate-200">
          <div className="flex justify-between items-center">
            <span>Número de Pedido:</span>
            <span className="font-mono text-sm font-black text-slate-900">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Estado del Pago:</span>
            <span className="font-bold text-emerald-600">Aprobado</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full max-w-md">
          <Button
            as={Link}
            href={`/seguimiento?orden=${encodeURIComponent(orderId)}`}
            size="lg"
            variant="bordered"
            startContent={<Truck className="w-4 h-4" />}
            className="w-full border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl"
          >
            Seguir mi Pedido
          </Button>
          <Button
            as={Link}
            href="/"
            size="lg"
            className="w-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Volver al Inicio
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function CheckoutResponsePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center py-12"><Spinner size="lg" /></div>}>
        <ResponseContent />
      </Suspense>
    </div>
  );
}
