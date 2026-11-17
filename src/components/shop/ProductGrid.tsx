'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/types';
import { ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 3 | 4;
}

export function ProductGrid({ products, isLoading, columns = 4 }: ProductGridProps) {
  const gridColsClass =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid ${gridColsClass} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-slate-800">No se encontraron productos</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Intenta ajustar los filtros de búsqueda o el rango de precios seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridColsClass} gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
