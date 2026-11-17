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
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
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
        backdrop: 'bg-slate-950/40 backdrop-blur-md',
        wrapper: 'justify-end',
        base: 'bg-white text-slate-900 sm:m-0 rounded-l-2xl rounded-r-none max-w-md w-full h-dvh max-h-dvh shadow-2xl border-l border-slate-200',
        closeButton: 'top-5 right-5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl p-2',
      }}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex items-center justify-between border-b border-slate-200 px-6 py-5 pr-14">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">
                    Tu Carrito
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {totalItems} {totalItems === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                  </p>
                </div>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Vaciar
                </button>
              )}
            </DrawerHeader>

            <DrawerBody className="px-6 py-5 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                      Tu carrito está vacío
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Explora el catálogo y agrega productos para iniciar tu pedido.
                    </p>
                  </div>
                  <Button
                    onPress={onClose}
                    as={Link}
                    href="/productos"
                    className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl"
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
                      className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 items-center transition-colors hover:border-slate-300"
                    >
                      <Link
                        href={`/productos/${product.slug}`}
                        onClick={onClose}
                        className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white border border-slate-200"
                      >
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
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
                              className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors truncate block"
                            >
                              {product.title}
                            </Link>
                            {variantTitle && (
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 mt-0.5">
                                {variantTitle}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(itemKey)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                            aria-label="Eliminar ítem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 font-semibold">
                          {formatPrice(product.price)} c/u
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, quantity - 1)}
                              className="p-1.5 hover:bg-slate-100 rounded-l-xl text-slate-700 transition-colors"
                              aria-label="Disminuir"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-black text-slate-900">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, quantity + 1)}
                              className="p-1.5 hover:bg-slate-100 rounded-r-xl text-slate-700 transition-colors"
                              aria-label="Aumentar"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-black text-slate-900">
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
              <DrawerFooter className="flex flex-col border-t border-slate-200 px-6 py-5 space-y-4 bg-slate-50/60">
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between w-full text-xs text-slate-500 font-medium">
                    <span>Envío</span>
                    <span>Calculado en el checkout</span>
                  </div>
                  <div className="flex items-center justify-between w-full pt-1">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Total Estimado
                    </span>
                    <span className="text-2xl font-black text-slate-900">
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
                    className="w-full border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider py-6 rounded-xl hover:bg-slate-100"
                  >
                    Ver Carrito
                  </Button>
                  <Button
                    as={Link}
                    href="/checkout"
                    onPress={onClose}
                    endContent={<ArrowRight className="w-4 h-4" />}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-6 rounded-xl shadow-md"
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
