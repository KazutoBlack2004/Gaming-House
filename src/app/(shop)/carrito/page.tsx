'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, CardBody, Divider } from '@heroui/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatPrice } from '@/lib/constants';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tu carrito está vacío</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Explora los productos disponibles y agrégalos al carrito.
        </p>
        <Button as={Link} href="/productos" className="bg-slate-900 text-white font-medium px-6">
          Explorar Productos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Carrito de Compras
        </h1>
        <Button color="danger" variant="light" size="sm" onClick={clearCart}>
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Lista de Ítems */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ cartItemId, product, quantity, variantTitle }) => {
            const itemKey = cartItemId || product.id;
            return (
            <Card key={itemKey} shadow="none" className="clean-card rounded-xl">
              <CardBody className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Sin foto</div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h4 className="font-semibold text-slate-900 text-sm">{product.title}</h4>
                  {variantTitle && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {variantTitle}
                    </span>
                  )}
                  <p className="text-xs text-slate-500 font-medium">
                    {formatPrice(product.price)} c/u
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                    <button
                      onClick={() => updateQuantity(itemKey, quantity - 1)}
                      className="p-1 hover:bg-slate-100 rounded-l-lg text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(itemKey, quantity + 1)}
                      className="p-1 hover:bg-slate-100 rounded-r-lg text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-bold text-sm text-slate-900 min-w-[60px] text-right">
                    {formatPrice(product.price * quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(itemKey)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardBody>
            </Card>
          );
          })}
        </div>

        {/* Resumen */}
        <Card shadow="none" className="clean-card rounded-xl">
          <CardBody className="p-6 space-y-5">
            <h3 className="font-bold text-base text-slate-900">Resumen</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Button
              as={Link}
              href="/checkout"
              endContent={<ArrowRight className="w-4 h-4" />}
              className="w-full bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Continuar la Compra
            </Button>
          </CardBody>
        </Card>

      </div>

    </div>
  );
}
