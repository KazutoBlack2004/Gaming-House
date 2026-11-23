'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFooter, Button } from '@heroui/react';
import { ShoppingBag, Zap } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatPrice } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(
    product.compare_at_price && product.compare_at_price > product.price
  );
  const discountPct =
    hasDiscount && product.compare_at_price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : 0;

  return (
    <Card
      shadow="none"
      className="gh-card gh-panel-glow rounded-2xl overflow-hidden h-full flex flex-col group"
    >
      <div className="relative w-full aspect-square bg-[#0c0e11] overflow-hidden border-b border-white/5">
        <Link href={`/productos/${product.slug}`} className="block w-full h-full">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#849585] text-xs font-mono">
              Sin Imagen
            </div>
          )}
        </Link>

        {/* Solo Badge de Descuento / Oferta */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded gh-badge-neon text-[10px] flex items-center gap-1">
              <Zap className="w-3 h-3 fill-[#003919]" />-{discountPct}% OFF
            </span>
          </div>
        )}

        {/* Indicador sutil de Stock sin el punto */}
        <div className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-0.5 rounded bg-[#0c0e11]/90 backdrop-blur-md border border-white/10 text-[#e2e2e6] font-mono text-[10px] pointer-events-none">
          {isOutOfStock ? 'Agotado' : `Stock (${product.stock} un.)`}
        </div>
      </div>

      <CardBody className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            {product.category ? (
              <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase tracking-widest truncate">
                {product.category.name}
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-[#849585] uppercase tracking-widest">
                GAMING HOUSE
              </span>
            )}
            {product.sku && (
              <span className="text-[10px] font-mono text-[#849585] shrink-0">
                {product.sku}
              </span>
            )}
          </div>

          <Link href={`/productos/${product.slug}`} className="block">
            <h4 className="font-bold text-white text-base group-hover:text-[#00ff88] transition-colors line-clamp-1 font-heading uppercase tracking-tight">
              {product.title}
            </h4>
          </Link>

          <p className="text-xs text-[#b9cbb9] line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
          <div>
            <span className="block text-[10px] font-mono text-[#849585] uppercase">
              Precio Web
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#00ff88] font-heading">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#849585] line-through font-mono">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter className="p-4 pt-0 border-t-0 mt-auto">
        <Button
          size="sm"
          isDisabled={isOutOfStock}
          onPress={() => addItem(product)}
          startContent={<ShoppingBag className="w-4 h-4" />}
          className="w-full gh-btn-primary text-xs py-2.5 h-10 rounded-xl"
        >
          {isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
        </Button>
      </CardFooter>
    </Card>
  );
}
