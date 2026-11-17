'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Divider } from '@heroui/react';
import { Lock, Truck, CreditCard, MapPin, Check } from 'lucide-react';
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
  'block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5';
const FIELD_INPUT =
  'w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { orders, addOrder } = useAdminStore();
  const subtotal = getTotalPrice();

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

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Tu carrito está vacío</h2>
        <p className="text-sm text-slate-500">Agrega productos antes de realizar la compra.</p>
        <Button
          onPress={() => router.push('/productos')}
          className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-6"
        >
          Ver Productos
        </Button>
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
            street: formData.street || 'Retiro en Punto de Entrega',
            city: formData.city || 'Santiago',
            zipCode: formData.zipCode || '0000000',
          }
        : formData;

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
        external_payment_id: data.orderId || 'TRX-' + Date.now(),
        payment_method:
          PAYMENT_METHODS.find((m) => m.id === validationResult.data.paymentMethod)?.name ||
          validationResult.data.paymentMethod,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          COMPRA RÁPIDA SIN REGISTRO
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mt-0.5">
          Finalizar Compra
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Operador de Envío en Chile */}
          <Card shadow="none" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    1. Modalidad de Despacho y Courier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona el servicio de transporte con código de seguimiento en línea.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {SHIPPING_CARRIERS_CHILE.map((carrier) => {
                  const isSelected = selectedCarrier === carrier.id;
                  const rateForRegion = calculateBlueExpressRate(carrier.id, formData.state);
                  return (
                    <button
                      key={carrier.id}
                      type="button"
                      onClick={() => setSelectedCarrier(carrier.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-sm text-slate-900">{carrier.name}</span>
                          <span className="text-xs font-black text-slate-900">
                            {rateForRegion === 0 ? 'GRATIS' : formatPrice(rateForRegion)}
                          </span>
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {carrier.badge} • {carrier.estimatedDays}
                        </span>
                        <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                          {carrier.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* 2. Datos del Comprador y Dirección */}
          <Card shadow="none" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    2. Datos de Contacto y Entrega
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enviaremos el comprobante y el número de seguimiento a tu correo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className={FIELD_LABEL}>
                    Nombre y Apellido <span className="text-rose-500">*</span>
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
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div>
                  <label className={FIELD_LABEL}>
                    Correo Electrónico <span className="text-rose-500">*</span>
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
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className={FIELD_LABEL}>
                    Teléfono / WhatsApp <span className="text-rose-500">*</span>
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
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div>
                  <label className={FIELD_LABEL}>
                    Región <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={FIELD_INPUT}
                  >
                    {CHILE_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCarrier !== 'retiro' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className={FIELD_LABEL}>
                      Dirección (Calle, Número, Depto/Casa) <span className="text-rose-500">*</span>
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
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {errors.street}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={FIELD_LABEL}>
                      Comuna / Ciudad <span className="text-rose-500">*</span>
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
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {errors.city}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className={FIELD_LABEL}>Notas de entrega (Opcional)</label>
                <input
                  type="text"
                  placeholder="Indicaciones para el repartidor o conserjería..."
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className={FIELD_INPUT}
                />
              </div>
            </CardBody>
          </Card>

          {/* 3. Método de Pago */}
          <Card shadow="none" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    3. Medio de Pago Seguro
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona la pasarela con la que deseas abonar tu pedido.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = formData.paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleChange('paymentMethod', method.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-black text-sm text-slate-900 block">
                          {method.name}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          {method.description}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Resumen Lateral del Pedido */}
        <Card
          shadow="none"
          className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs sticky top-28"
        >
          <CardBody className="p-6 space-y-5">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
              Resumen de tu Compra
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {items.map(({ cartItemId, product, quantity, variantTitle }) => (
                <div
                  key={cartItemId || product.id}
                  className="flex justify-between items-start gap-2 text-slate-700"
                >
                  <div className="min-w-0">
                    <span className="truncate block font-bold text-slate-900">
                      {product.title} (x{quantity})
                    </span>
                    {variantTitle && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        Opción: {variantTitle}
                      </span>
                    )}
                  </div>
                  <span className="font-bold shrink-0">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Divider />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal productos</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Despacho ({activeCarrierObj.name})</span>
                <span className="font-bold text-slate-900">
                  {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                </span>
              </div>
            </div>

            <Divider />

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-black uppercase tracking-wider text-slate-900">
                Total a Pagar
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatPrice(finalTotal)}
              </span>
            </div>

            <Button
              type="submit"
              isLoading={isProcessing}
              startContent={!isProcessing && <Lock className="w-4 h-4" />}
              className="w-full h-12 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 shadow-md"
            >
              Confirmar y Pagar
            </Button>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
