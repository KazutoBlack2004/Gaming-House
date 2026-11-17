'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/lib/store/useCartStore';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-1.5 bg-white max-w-[130px]">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
          disabled={isOutOfStock || quantity <= 1}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold text-sm text-slate-800">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
          disabled={isOutOfStock || quantity >= product.stock}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Button
        isDisabled={isOutOfStock}
        onClick={handleAdd}
        startContent={added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
        className={`font-semibold flex-1 ${
          added
            ? "bg-emerald-600 text-white"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {added ? "¡Agregado!" : "Agregar al Carrito"}
      </Button>
    </div>
  );
}
