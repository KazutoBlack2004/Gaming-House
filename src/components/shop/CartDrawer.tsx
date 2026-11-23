'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from '@heroui/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatPrice } from '@/lib/constants';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="right"
      backdrop="blur"
      size="md"
      classNames={{
        backdrop: 'bg-black/65 backdrop-blur-md',
        wrapper: 'justify-end',
        base: 'bg-[#111317] text-[#e2e2e6] sm:m-0 rounded-l-2xl rounded-r-none max-w-md w-full h-dvh max-h-dvh shadow-2xl border-l border-white/10',
        closeButton: 'top-5 right-5 text-[#b9cbb9] hover:bg-[#282a2d] hover:text-white rounded-xl p-2',
      }}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex items-center justify-between border-b border-white/10 px-6 py-5 pr-14 bg-[#0c0e11]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,255,136,0.2)]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white uppercase tracking-tight font-heading">
                    Mi Carrito
                  </h3>
                  <p className="text-xs text-[#b9cbb9] font-mono">
                    {totalItems} {totalItems === 1 ? 'producto listo' : 'productos listos'}
                  </p>
                </div>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-mono font-bold text-[#ffb4ab] hover:bg-[#93000a]/40 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Vaciar
                </button>
              )}
            </DrawerHeader>

            <DrawerBody className="px-6 py-5 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#1e2023] border border-white/10 flex items-center justify-center text-[#00ff88]">
                    <ShoppingBag className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-lg text-white uppercase tracking-tight font-heading">
                      Tu carrito está vacío
                    </h4>
                    <p className="text-xs text-[#b9cbb9] max-w-xs mx-auto leading-relaxed">
                      Explora el catálogo de Gaming House y agrega productos para armar tu pedido.
                    </p>
                  </div>
                  <Button
                    onPress={onClose}
                    as={Link}
                    href="/productos"
                    className="bg-[#00ff88] text-[#003919] font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-[0_0_20px_-4px_rgba(0,255,136,0.4)]"
                  >
                    Ver Catálogo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(({ cartItemId, product, quantity, variantTitle }) => {
                    const itemKey = cartItemId || product.id;
                    return (
                      <div
                        key={itemKey}
                        className="relative overflow-hidden flex gap-4 p-3.5 rounded-2xl bg-[#1a1c1f] border border-white/10 items-center transition-colors hover:border-[#00ff88]/40"
                      >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-transparent opacity-80" />

                        <Link
                          href={`/productos/${product.slug}`}
                          onClick={onClose}
                          className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#0c0e11] border border-white/10"
                        >
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[#849585]">
                              Sin foto
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/productos/${product.slug}`}
                                onClick={onClose}
                                className="font-bold text-sm text-white hover:text-[#00ff88] transition-colors truncate block font-heading"
                              >
                                {product.title}
                              </Link>
                              {variantTitle && (
                                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#282a2d] text-[#9cf0ff] mt-0.5">
                                  {variantTitle}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(itemKey)}
                              className="p-1 text-[#b9cbb9] hover:text-[#ffb4ab] hover:bg-[#93000a]/30 rounded-lg transition-colors shrink-0"
                              aria-label="Eliminar ítem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-[#b9cbb9] font-mono">
                            {formatPrice(product.price)} c/u
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center border border-white/10 rounded-lg bg-[#0c0e11]">
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemKey, quantity - 1)}
                                className="p-1.5 hover:bg-[#282a2d] rounded-l-lg text-[#b9cbb9] hover:text-white transition-colors"
                                aria-label="Disminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-mono font-bold text-white">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(itemKey, quantity + 1)}
                                className="p-1.5 hover:bg-[#282a2d] rounded-r-lg text-[#b9cbb9] hover:text-white transition-colors"
                                aria-label="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-sm font-black text-[#00ff88] font-mono">
                              {formatPrice(product.price * quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </DrawerBody>

            {items.length > 0 && (
              <DrawerFooter className="flex flex-col border-t border-white/10 px-6 py-5 space-y-4 bg-[#0c0e11]">
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between w-full text-xs text-[#b9cbb9] font-mono">
                    <span>Despacho Blue Express</span>
                    <span className="text-[#00e5ff]">Calculado en el checkout</span>
                  </div>
                  <div className="flex items-center justify-between w-full pt-1">
                    <span className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                      Total Estimado
                    </span>
                    <span className="text-2xl font-black text-[#00ff88] font-heading">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  <Button
                    variant="bordered"
                    as={Link}
                    href="/carrito"
                    onPress={onClose}
                    className="w-full border-[#00e5ff]/40 text-[#00e5ff] font-mono font-bold text-xs uppercase tracking-wider py-6 rounded-xl hover:bg-[#00e5ff]/10"
                  >
                    Ver Carrito
                  </Button>
                  <Button
                    as={Link}
                    href="/checkout"
                    onPress={onClose}
                    endContent={<ArrowRight className="w-4 h-4" />}
                    className="w-full bg-[#00ff88] hover:bg-[#60ff99] text-[#003919] font-mono font-bold text-xs uppercase tracking-wider py-6 rounded-xl shadow-[0_0_24px_-4px_rgba(0,255,136,0.4)]"
                  >
                    Finalizar Compra
                  </Button>
                </div>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
