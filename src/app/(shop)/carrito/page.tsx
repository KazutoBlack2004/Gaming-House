'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@heroui/react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Lock,
  Truck,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatPrice } from '@/lib/constants';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Cálculo automático de ahorro si hay productos con descuento en el carrito
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
            <p className="text-[#b9cbb9] text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Aún no has agregado productos a tu pedido. Explora nuestro catálogo de hardware, periféricos y setups listos para usar.
            </p>
          </div>
          <Button
            as={Link}
            href="/productos"
            endContent={<ArrowRight className="w-4 h-4" />}
            className="gh-btn-primary uppercase text-xs tracking-wider px-8 h-11 rounded-xl"
          >
            Explorar Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-8">
      {/* Cabecera con Indicador de Flujo de Compra */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded bg-[#00ff88] text-[#003919] font-bold uppercase">
              01 // Carrito
            </span>
            <span className="text-[#849585]">→</span>
            <span className="px-2.5 py-1 rounded bg-[#1a1c1f] text-[#849585] border border-white/5 uppercase">
              02 // Despacho
            </span>
            <span className="text-[#849585]">→</span>
            <span className="px-2.5 py-1 rounded bg-[#1a1c1f] text-[#849585] border border-white/5 uppercase">
              03 // Webpay Plus
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase font-heading">
            Tu Carrito de <span className="text-[#00ff88]">Compras</span>
          </h1>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4">
          <span className="font-mono text-xs text-[#b9cbb9] bg-[#1a1c1f] border border-white/10 px-3.5 py-2 rounded-lg">
            <strong className="text-[#00ff88]">{totalItems}</strong>{' '}
            {totalItems === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'}
          </span>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#93000a]/25 hover:bg-[#93000a]/45 border border-[#ffb4ab]/25 text-[#ffb4ab] font-mono text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vaciar
          </button>
        </div>
      </div>

      {/* Grilla Principal: Lista de Productos (8 cols) + Panel Terminal de Pago (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Módulos de Producto */}
        <div className="lg:col-span-8 space-y-3.5">
          {items.map(({ cartItemId, product, quantity, variantTitle }) => {
            const itemKey = cartItemId || product.id;
            const hasDiscount = Boolean(
              product.compare_at_price && product.compare_at_price > product.price
            );
            const itemSubtotal = product.price * quantity;

            return (
              <div
                key={itemKey}
                className="group relative bg-[#161920] hover:bg-[#1a1e26] border border-white/10 hover:border-[#00ff88]/40 rounded-xl p-4 sm:p-5 shadow-lg transition-all overflow-hidden"
              >
                {/* Barra vertical neón izquierda */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#00ff88] via-[#00e5ff] to-transparent opacity-85" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pl-2">
                  {/* Bloque 1: Imagen + Información del Producto */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Link
                      href={`/productos/${product.slug}`}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#0c0e11] border border-white/10 shrink-0 block"
                    >
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#849585] font-mono">
                          Sin foto
                        </div>
                      )}
                    </Link>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {product.category && (
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#00e5ff]">
                            {product.category.name}
                          </span>
                        )}
                        {product.sku && (
                          <span className="font-mono text-[10px] text-[#849585]">
                            • {product.sku}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/productos/${product.slug}`}
                        className="font-bold text-white group-hover:text-[#00ff88] text-base sm:text-lg transition-colors block truncate font-heading uppercase tracking-tight"
                      >
                        {product.title}
                      </Link>

                      {variantTitle && (
                        <div>
                          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#282a2d] text-[#9cf0ff] border border-white/10">
                            Opción: {variantTitle}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-xs font-mono font-bold text-[#e2e2e6]">
                          {formatPrice(product.price)} c/u
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] font-mono text-[#849585] line-through">
                            {formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque 2: Cantidad + Subtotal + Eliminar */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    {/* Selector de Cantidad */}
                    <div className="flex flex-col items-start sm:items-center gap-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#849585]">
                        Cantidad
                      </span>
                      <div className="flex items-center bg-[#0c0e11] border border-white/15 rounded-lg p-0.5 h-9">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, quantity - 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-[#282a2d] rounded-md text-[#b9cbb9] hover:text-[#00ff88] transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-mono font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, quantity + 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-[#282a2d] rounded-md text-[#b9cbb9] hover:text-[#00ff88] transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal del Ítem */}
                    <div className="flex flex-col items-end min-w-[100px]">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#849585]">
                        Subtotal
                      </span>
                      <span className="font-black text-lg text-[#00ff88] font-heading leading-tight">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => removeItem(itemKey)}
                      className="w-9 h-9 rounded-lg bg-[#0c0e11] hover:bg-[#93000a]/40 border border-white/10 hover:border-[#ffb4ab]/40 text-[#849585] hover:text-[#ffb4ab] flex items-center justify-center transition-all"
                      aria-label="Eliminar producto"
                      title="Quitar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Botón inferior para volver al catálogo */}
          <div className="pt-2">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#b9cbb9] hover:text-[#00ff88] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Seguir agregando productos del catálogo</span>
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Resumen Terminal + Pago Exclusivo Webpay Plus */}
        <div className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="gh-panel gh-panel-glow !rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
                  CHECKOUT // RESUMEN
                </span>
                <h3 className="font-black text-lg text-white font-heading uppercase tracking-tight">
                  Resumen del Pedido
                </h3>
              </div>
              <ShoppingBag className="w-5 h-5 text-[#00ff88]" />
            </div>

            {/* Desglose de Montos con espaciado limpio */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between gap-4 text-[#b9cbb9]">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                <span className="font-bold text-white shrink-0">{formatPrice(totalPrice)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex items-center justify-between gap-4 text-[#00ff88]">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-[#00ff88]" />
                    Ahorro por ofertas
                  </span>
                  <span className="font-bold shrink-0">-{formatPrice(totalSavings)}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 text-[#b9cbb9]">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                  Despacho Blue Express
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#0c0e11] border border-white/10 text-[#9cf0ff] shrink-0">
                  En el siguiente paso
                </span>
              </div>
            </div>

            {/* Caja Destacada de Total */}
            <div className="bg-[#0c0e11] border border-[#00ff88]/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider block">
                  Total Estimado
                </span>
                <span className="font-mono text-[10px] text-[#849585]">IVA incluido</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#00ff88] tracking-tight leading-none font-heading">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Botón Principal de Checkout */}
            <Button
              as={Link}
              href="/checkout"
              endContent={<ArrowRight className="w-4 h-4" />}
              className="w-full gh-btn-primary h-12 rounded-xl text-xs uppercase tracking-wider"
            >
              Continuar a Datos de Envío
            </Button>

            {/* Sello Exclusivo Webpay Plus (Transbank) */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#b9cbb9] uppercase tracking-wider">
                  Pasarela Oficial
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#00ff88]">
                  <Lock className="w-3 h-3" /> SSL 256-Bit
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#14171e] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#00ff88]/15 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white font-heading uppercase">
                      Webpay Plus • Transbank
                    </span>
                    <span className="block text-[10px] font-mono text-[#b9cbb9]">
                      Redcompra Débito, Crédito y Prepago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
