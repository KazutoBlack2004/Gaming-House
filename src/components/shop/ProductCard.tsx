'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFooter, Button } from '@heroui/react';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatPrice } from '@/lib/constants';
import { THEME_CONFIG } from '@/lib/theme';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Card
      shadow="none"
      className="clean-card rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-slate-300 hover:shadow-md group"
    >
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sin Imagen
            </div>
          )}
        </Link>

        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-white shadow-xs"
              style={{ backgroundColor: THEME_CONFIG.colors.badgeSale }}
            >
              OFERTA
            </span>
          </div>
        )}
      </div>

      <CardBody className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {product.category && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              {product.category.name}
            </span>
          )}

          <Link href={`/productos/${product.slug}`} className="block">
            <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-1">
              {product.title}
            </h4>
          </Link>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base font-black text-slate-900">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </CardBody>

      <CardFooter className="p-4 pt-0 border-t-0 mt-auto">
        <Button
          size="sm"
          isDisabled={isOutOfStock}
          onClick={() => addItem(product)}
          startContent={<ShoppingBag className="w-4 h-4" />}
          className="w-full theme-btn-primary font-bold text-xs py-2"
          style={{
            backgroundColor: THEME_CONFIG.colors.primary,
            color: THEME_CONFIG.colors.primaryText,
          }}
        >
          {isOutOfStock ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
}
