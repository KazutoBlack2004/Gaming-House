'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@heroui/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { createClient } from '@/lib/supabase/client';
import { Product, Category } from '@/lib/types';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { THEME_CONFIG } from '@/lib/theme';

export default function HomePage() {
  const { products: storeProducts, categories: storeCategories } = useAdminStore();
  const [products, setProducts] = useState<Product[]>(storeProducts);
  const [categories, setCategories] = useState<Category[]>(storeCategories);

  useEffect(() => {
    setProducts(storeProducts.filter((p) => p.active));
    setCategories(storeCategories.filter((c) => c.active));
  }, [storeProducts, storeCategories]);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
          supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('active', true)
            .limit(8),
          supabase
            .from('categories')
            .select('*')
            .eq('active', true)
            .limit(4),
        ]);

        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        }
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch {
        // Fallback a datos de ejemplo de la plantilla
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Banner Principal (Hero) */}
      <section className="relative min-h-[480px] lg:min-h-[540px] flex items-center bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-45">
          <Image
            src={THEME_CONFIG.hero.bgImage}
            alt="Hero Banner"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-16 w-full">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[11px] font-extrabold uppercase tracking-widest text-white border border-white/10">
              {THEME_CONFIG.hero.badge}
            </span>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white uppercase">
              {THEME_CONFIG.hero.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-lg">
              {THEME_CONFIG.hero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                as={Link}
                href="/productos"
                size="lg"
                endContent={<ArrowRight className="w-4 h-4" />}
                className="bg-white text-slate-950 font-black uppercase text-xs tracking-wider px-8 shadow-lg hover:bg-slate-200 rounded-xl"
              >
                {THEME_CONFIG.hero.ctaPrimaryText}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">EXPLORAR</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Categorías
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?category=${cat.slug}`}
              className="group relative h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 block shadow-xs"
            >
              {cat.image_url && (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                <h3 className="text-white font-black text-sm uppercase tracking-wider">{cat.name}</h3>
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mt-1 group-hover:text-white transition-colors">
                  Ver productos <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Productos Destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">CATÁLOGO</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Productos Destacados
            </h2>
          </div>
          <Button
            as={Link}
            href="/productos"
            variant="light"
            size="sm"
            endContent={<ArrowRight className="w-4 h-4" />}
            className="font-bold text-xs uppercase tracking-wider text-slate-800"
          >
            Ver Todo
          </Button>
        </div>

        <ProductGrid products={products} />
      </section>
    </div>
  );
}
