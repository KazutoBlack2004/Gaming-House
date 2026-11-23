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
    <Card
      shadow="none"
      className="bg-[#1a1c1f] border border-white/10 rounded-2xl text-center p-6 sm:p-10 shadow-2xl"
    >
      <CardBody className="space-y-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00ff88]/15 text-[#00ff88] flex items-center justify-center border border-[#00ff88]/40 shadow-[0_0_24px_rgba(0,255,136,0.25)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase font-heading">
            ¡Pedido Confirmado en Gaming House!
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cbb9] max-w-md mx-auto leading-relaxed">
            Tu compra ha sido registrada con éxito. Guarda tu número de orden para consultar el estado del despacho Blue Express en cualquier momento.
          </p>
        </div>

        <div className="bg-[#0c0e11] p-4 rounded-2xl w-full max-w-md space-y-2 text-xs text-[#b9cbb9] border border-white/10 font-mono">
          <div className="flex justify-between items-center">
            <span>Número de Pedido:</span>
            <span className="text-sm font-black text-[#00ff88]">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Estado del Pago:</span>
            <span className="font-bold text-[#00ff88]">Aprobado</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full max-w-md">
          <Button
            as={Link}
            href={`/seguimiento?orden=${encodeURIComponent(orderId)}`}
            size="lg"
            variant="bordered"
            startContent={<Truck className="w-4 h-4" />}
            className="w-full border-[#00e5ff]/40 text-[#00e5ff] hover:bg-[#00e5ff]/10 font-mono font-bold text-xs uppercase tracking-wider rounded-xl"
          >
            Seguir mi Pedido
          </Button>
          <Button
            as={Link}
            href="/"
            size="lg"
            className="w-full bg-[#00ff88] text-[#003919] font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#60ff99] shadow-[0_0_20px_-4px_rgba(0,255,136,0.4)]"
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
      <Suspense
        fallback={
          <div className="text-center py-12">
            <Spinner size="lg" />
          </div>
        }
      >
        <ResponseContent />
      </Suspense>
    </div>
  );
}
