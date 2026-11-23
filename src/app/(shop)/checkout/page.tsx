'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  Lock,
  Truck,
  CreditCard,
  MapPin,
  Check,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { CheckoutSchema, CheckoutFormData } from '@/lib/security/schemas';
import { sanitizeObject } from '@/lib/security/sanitizer';
import {
  SITE_CONFIG,
  PAYMENT_METHODS,
  SHIPPING_CARRIERS_CHILE,
  CHILE_REGIONS,
  formatPrice,
} from '@/lib/constants';
import { calculateBlueExpressRate } from '@/lib/shipping/bluexpress';
import { ShippingCarrierId } from '@/lib/types';

const FIELD_LABEL =
  'block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cbb9] mb-1.5';
const FIELD_INPUT =
  'w-full h-11 px-3.5 rounded-lg gh-input text-xs font-mono font-semibold text-white placeholder:text-[#849585] outline-none transition-all';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { orders, addOrder } = useAdminStore();
  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();

  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrierId>('bluexpress');
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: 'Región Metropolitana',
    zipCode: '7500000',
    notes: '',
    paymentMethod: 'webpay',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Cálculo automático de ahorro si hay productos con descuento
  const totalSavings = items.reduce((acc, { product, quantity }) => {
    if (product.compare_at_price && product.compare_at_price > product.price) {
      return acc + (product.compare_at_price - product.price) * quantity;
    }
    return acc;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="gh-panel gh-panel-glow p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#1e2023] border border-[#00ff88]/30 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_24px_rgba(0,255,136,0.18)]">
            <ShoppingBag className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
              Tu carrito está vacío
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cbb9] max-w-md mx-auto">
              Agrega productos del catálogo antes de continuar al checkout.
            </p>
          </div>
          <Button
            onPress={() => router.push('/productos')}
            endContent={<ArrowRight className="w-4 h-4" />}
            className="gh-btn-primary text-xs uppercase tracking-wider rounded-xl px-8 h-11"
          >
            Ver Catálogo
          </Button>
        </div>
      </div>
    );
  }

  const activeCarrierObj =
    SHIPPING_CARRIERS_CHILE.find((c) => c.id === selectedCarrier) || SHIPPING_CARRIERS_CHILE[0];
  const shippingCost = calculateBlueExpressRate(selectedCarrier, formData.state);
  const finalTotal = subtotal + shippingCost;

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrors({});

    const payloadToValidate =
      selectedCarrier === 'retiro'
        ? {
            ...formData,
            paymentMethod: 'webpay' as const,
            street: formData.street || 'Retiro Presencial en Tienda Gaming House',
            city: formData.city || 'Santiago',
            zipCode: formData.zipCode || '0000000',
          }
        : {
            ...formData,
            paymentMethod: 'webpay' as const,
          };

    const sanitizedData = sanitizeObject(payloadToValidate);
    const validationResult = CheckoutSchema.safeParse(sanitizedData);

    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CheckoutFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsProcessing(false);
      return;
    }

    const nextOrderNumber = (orders[0]?.order_number || 1000) + 1;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingDetails: validationResult.data,
          shippingCarrier: selectedCarrier,
          shippingCost,
          cartItems: items.map((i) => ({
            productId: i.product.id,
            variantId: i.variantId,
            variantTitle: i.variantTitle,
            title: i.product.title,
            quantity: i.quantity,
            price: i.product.price,
          })),
          totalAmount: finalTotal,
        }),
      });

      const data = await response.json();

      addOrder({
        id: data.orderId || 'ord-' + Date.now(),
        order_number: nextOrderNumber,
        external_payment_id: data.orderId || 'WEBPAY-' + Date.now(),
        payment_method:
          PAYMENT_METHODS[0]?.name || 'Webpay Plus (Transbank)',
        payment_status: 'approved',
        shipping_status: 'unfulfilled',
        shipping_carrier: selectedCarrier,
        shipping_cost: shippingCost,
        total_amount: finalTotal,
        currency: SITE_CONFIG.currency,
        payer_email: validationResult.data.email,
        payer_name: validationResult.data.fullName,
        payer_phone: validationResult.data.phone,
        shipping_address: validationResult.data,
        items: items.map((i, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          order_id: data.orderId || 'ord-' + Date.now(),
          product_id: i.product.id,
          variant_id: i.variantId,
          variant_title: i.variantTitle,
          title: i.product.title,
          quantity: i.quantity,
          unit_price: i.product.price,
          total_price: i.product.price * i.quantity,
        })),
        created_at: new Date().toISOString(),
      });

      clearCart();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/checkout/respuesta?orderId=${nextOrderNumber}`);
      }
    } catch {
      clearCart();
      router.push(`/checkout/respuesta?orderId=${nextOrderNumber}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-8">
      {/* Cabecera con Indicador de Flujo de Compra (Alineada con /carrito) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <Link
              href="/carrito"
              className="px-2.5 py-1 rounded bg-[#1a1c1f] text-[#00ff88] border border-[#00ff88]/30 hover:bg-[#00ff88]/15 uppercase transition-colors"
            >
              ✓ 01 // Carrito
            </Link>
            <span className="text-[#00ff88]">→</span>
            <span className="px-2.5 py-1 rounded bg-[#00ff88] text-[#003919] font-bold uppercase shadow-[0_0_12px_rgba(0,255,136,0.35)]">
              02 // Despacho y Entrega
            </span>
            <span className="text-[#00ff88]">→</span>
            <span className="px-2.5 py-1 rounded bg-[#00e5ff]/15 text-[#9cf0ff] border border-[#00e5ff]/30 font-bold uppercase">
              03 // Webpay Plus
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase font-heading">
            Finalizar <span className="text-[#00ff88]">Compra</span>
          </h1>
        </div>

        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1c1f] hover:bg-[#282a2d] border border-white/10 text-xs font-mono font-bold text-[#b9cbb9] hover:text-[#00ff88] transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Carrito
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Los 3 Pasos del Checkout */}
        <div className="lg:col-span-8 space-y-6">
          {/* PASO 1: Modalidad de Despacho (Grilla de 3 columnas perfectamente alineada) */}
          <div className="gh-panel gh-panel-glow !rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
                    PASO 01 // LOGÍSTICA CHILE
                  </span>
                  <h3 className="font-black text-base text-white uppercase tracking-tight font-heading">
                    Modalidad de Despacho y Courier
                  </h3>
                </div>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#b9cbb9]">
                Región seleccionada: <strong className="text-[#00e5ff]">{formData.state}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {SHIPPING_CARRIERS_CHILE.map((carrier) => {
                const isSelected = selectedCarrier === carrier.id;
                const rateForRegion = calculateBlueExpressRate(carrier.id, formData.state);
                return (
                  <button
                    key={carrier.id}
                    type="button"
                    onClick={() => setSelectedCarrier(carrier.id)}
                    className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 overflow-hidden ${
                      isSelected
                        ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_20px_rgba(0,255,136,0.18)]'
                        : 'border-white/10 bg-[#14171e] hover:border-[#00ff88]/40 hover:bg-[#1a1e26]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00ff88]" />
                    )}

                    <div className="space-y-2 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-white font-heading leading-tight">
                          {carrier.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#00ff88] text-[#003919]'
                              : 'border border-white/20 bg-[#0c0e11]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#282a2d] text-[#9cf0ff]">
                          {carrier.estimatedDays}
                        </span>
                        <span className="text-sm font-mono font-black text-[#00ff88]">
                          {rateForRegion === 0 ? 'GRATIS' : formatPrice(rateForRegion)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#b9cbb9] leading-relaxed pt-1">
                        {carrier.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: Datos de Contacto y Dirección de Entrega */}
          <div className="gh-panel gh-panel-glow !rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[#00e5ff] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00e5ff]">
                  PASO 02 // DESTINATARIO
                </span>
                <h3 className="font-black text-base text-white uppercase tracking-tight font-heading">
                  Datos de Contacto y Entrega
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={FIELD_LABEL}>
                  Nombre y Apellido <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={FIELD_INPUT}
                  required
                />
                {errors.fullName && (
                  <span className="text-[11px] text-[#ffb4ab] font-mono mt-1 block">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div>
                <label className={FIELD_LABEL}>
                  Correo Electrónico (Para comprobante y OT) <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={FIELD_INPUT}
                  required
                />
                {errors.email && (
                  <span className="text-[11px] text-[#ffb4ab] font-mono mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label className={FIELD_LABEL}>
                  Teléfono / WhatsApp <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={FIELD_INPUT}
                  required
                />
                {errors.phone && (
                  <span className="text-[11px] text-[#ffb4ab] font-mono mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className={FIELD_LABEL}>
                  Región de Chile <span className="text-[#00ff88]">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={FIELD_INPUT}
                >
                  {CHILE_REGIONS.map((reg) => (
                    <option key={reg} value={reg} className="bg-[#111317] text-white">
                      {reg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCarrier !== 'retiro' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={FIELD_LABEL}>
                    Dirección (Calle, Número, Depto/Casa) <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Av. Providencia 1234, Depto 402"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className={FIELD_INPUT}
                    required
                  />
                  {errors.street && (
                    <span className="text-[11px] text-[#ffb4ab] font-mono mt-1 block">
                      {errors.street}
                    </span>
                  )}
                </div>

                <div>
                  <label className={FIELD_LABEL}>
                    Comuna / Ciudad <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Providencia"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={FIELD_INPUT}
                    required
                  />
                  {errors.city && (
                    <span className="text-[11px] text-[#ffb4ab] font-mono mt-1 block">
                      {errors.city}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#14171e] border border-[#00ff88]/30 flex items-center gap-3">
                <Store className="w-5 h-5 text-[#00ff88] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white block">
                    Retiro Presencial en Tienda Gaming House (Gratis)
                  </span>
                  <span className="text-[#b9cbb9] text-[11px]">
                    Te notificaremos por correo y WhatsApp apenas tu pedido esté listo para retirar.
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={FIELD_LABEL}>Notas o indicaciones de entrega (Opcional)</label>
              <input
                type="text"
                placeholder="Indicaciones para conserjería, Punto Blue o referencia de domicilio..."
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={FIELD_INPUT}
              />
            </div>
          </div>

          {/* PASO 3: Medio de Pago Oficial Exclusivo — Webpay Plus (Transbank) */}
          <div className="gh-panel gh-panel-glow !rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
                    PASO 03 // PASARELA OFICIAL CHILE
                  </span>
                  <h3 className="font-black text-base text-white uppercase tracking-tight font-heading">
                    Pago Seguro con Webpay Plus
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Transbank Oficial
              </span>
            </div>

            <div className="relative p-5 rounded-xl border border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_24px_rgba(0,255,136,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0c0e11] border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-base text-white font-heading uppercase">
                      Webpay Plus (Transbank)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#00ff88] text-[#003919] font-mono text-[10px] font-bold uppercase">
                      Activo
                    </span>
                  </div>
                  <p className="text-xs text-[#b9cbb9]">
                    Paga con cualquier tarjeta bancaria nacional de débito, crédito o prepago.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-[#0c0e11] text-[#00ff88] border border-white/10">
                      Redcompra Débito
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0c0e11] text-[#9cf0ff] border border-white/10">
                      Visa / Mastercard
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0c0e11] text-[#e2e2e6] border border-white/10">
                      Prepago (MACH / Tenpo)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#00ff88] text-[#003919] flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.5)]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen Terminal del Pedido */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="gh-panel gh-panel-glow !rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
                  ORDEN // DETALLE FINAL
                </span>
                <h3 className="font-black text-lg text-white uppercase tracking-tight font-heading">
                  Resumen de tu Compra
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#1e2023] border border-white/10 font-mono text-xs font-bold text-[#00ff88]">
                {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>

            {/* Lista de Productos en el Pedido con Miniatura */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(({ cartItemId, product, quantity, variantTitle }) => (
                <div
                  key={cartItemId || product.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#14171e] border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-md overflow-hidden bg-[#0c0e11] border border-white/10 shrink-0">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="truncate block font-bold text-xs text-white font-heading uppercase">
                        {product.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#b9cbb9]">
                        <span className="text-[#00ff88] font-bold">x{quantity}</span>
                        {variantTitle && (
                          <span className="text-[#9cf0ff] truncate">• {variantTitle}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#00ff88] shrink-0">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Desglose de Costos */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs font-mono">
              <div className="flex items-center justify-between gap-4 text-[#b9cbb9]">
                <span>Subtotal productos</span>
                <span className="font-bold text-white shrink-0">{formatPrice(subtotal)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex items-center justify-between gap-4 text-[#00ff88]">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-[#00ff88]" />
                    Ahorro aplicado
                  </span>
                  <span className="font-bold shrink-0">-{formatPrice(totalSavings)}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 text-[#b9cbb9]">
                <span className="truncate">Despacho ({activeCarrierObj.name})</span>
                <span
                  className={`font-bold shrink-0 ${
                    shippingCost === 0 ? 'text-[#00ff88]' : 'text-[#00e5ff]'
                  }`}
                >
                  {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                </span>
              </div>
            </div>

            {/* Caja Destacada Total a Pagar */}
            <div className="bg-[#0c0e11] border border-[#00ff88]/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
                  Total a Pagar
                </span>
                <span className="font-mono text-[10px] text-[#849585]">IVA incluido</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#00ff88] tracking-tight leading-none font-heading">
                {formatPrice(finalTotal)}
              </span>
            </div>

            {/* Botón Confirmar y Pagar con Webpay Plus */}
            <Button
              type="submit"
              isLoading={isProcessing}
              startContent={!isProcessing && <Lock className="w-4 h-4" />}
              endContent={!isProcessing && <ArrowRight className="w-4 h-4" />}
              className="w-full h-12 gh-btn-primary text-xs uppercase tracking-wider rounded-xl"
            >
              Pagar con Webpay Plus
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#849585]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88] shrink-0" />
              <span>Pago 100% protegido por Transbank Webpay Plus</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
