'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  ArrowLeft,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Tag,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Zap,
  ZoomIn,
  X,
  PackageCheck,
  AlertTriangle,
  PackageX,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/constants';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Lens } from '@/components/ui/Lens';
import { Product } from '@/lib/types';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const { products: storeProducts } = useAdminStore();

  const [product, setProduct] = useState<Product | null>(
    storeProducts.find((p) => p.slug === slug) || storeProducts[0] || null
  );

  useEffect(() => {
    const found = storeProducts.find((p) => p.slug === slug);
    if (found) setProduct(found);
  }, [storeProducts, slug]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // 1. Estados para Lens de Aceternity UI y Lightbox Modal
  const [isLensHovering, setIsLensHovering] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // 6. Estado para calificación únicamente de estrellas
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    async function loadProduct() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('slug', slug)
          .single();

        if (data) {
          setProduct(data);
        }
      } catch {
        // Fallback a datos de ejemplo de la plantilla
      }
    }
    loadProduct();
  }, [slug]);

  // Cerrar Lightbox con tecla Escape
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-heading">Producto no encontrado</h2>
        <Link href="/productos" className="text-[#00ff88] font-mono font-bold underline text-sm">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const stockPercent = isOutOfStock
    ? 0
    : Math.min(100, Math.max(12, Math.round((product.stock / 30) * 100)));

  const hasDiscount = Boolean(
    product.compare_at_price && product.compare_at_price > product.price
  );
  const savingsAmount =
    hasDiscount && product.compare_at_price
      ? product.compare_at_price - product.price
      : 0;
  const discountPercentage =
    hasDiscount && product.compare_at_price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : 0;
  const installmentAmount = product.price / 6;

  const galleryImages =
    product.images && product.images.length > 0 ? product.images : [];

  const variants =
    product.has_variants && product.variants && product.variants.length > 0
      ? product.variants
      : [];
  const activeVariant = variants[selectedVariantIndex] || null;

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, activeVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, activeVariant);
    router.push('/checkout');
  };

  const relatedProducts = storeProducts
    .filter((p) => p.active && p.id !== product.id)
    .slice(0, 4);

  const highlightItems = [
    {
      title: 'Descripción general',
      body: product.description,
    },
    {
      title: 'Disponibilidad e inventario',
      body:
        product.stock > 0
          ? `Stock disponible (${product.stock} unidades listas para despacho inmediato).`
          : 'Actualmente sin unidades disponibles en inventario.',
    },
    {
      title: 'Garantía y respaldo',
      body: 'Producto verificado con garantía directa y políticas de cambio o devolución simplificadas.',
    },
  ];

  const displayedStars = hoverRating ?? rating;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Migas de Pan / Botón Volver */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#b9cbb9] hover:text-[#00ff88] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        {product.sku && (
          <span className="text-[11px] font-mono font-semibold text-[#9cf0ff]">
            SKU: {product.sku}
          </span>
        )}
      </div>

      {/* Layout Principal: Galería Izquierda + Panel de Conversión Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Columna Izquierda: Miniaturas Verticales + Imagen Principal con Zoom y Lightbox */}
        <div className="lg:col-span-6 lg:sticky lg:top-28 flex flex-col-reverse sm:flex-row gap-4">
          {/* Tira Vertical de Miniaturas */}
          {galleryImages.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0">
              {galleryImages.map((img, idx) => {
                const isSelected = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseEnter={() => setSelectedImageIndex(idx)}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#0c0e11] ${
                      isSelected
                        ? 'border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.35)] scale-95'
                        : 'border-white/15 opacity-70 hover:opacity-100 hover:border-[#00e5ff]'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} vista ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Contenedor de Imagen Principal con Aceternity UI <Lens /> y Clic para Lightbox */}
          <div
            onClick={() => galleryImages.length > 0 && setIsLightboxOpen(true)}
            className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-[#0c0e11] border border-white/10 shadow-xl cursor-none group select-none"
          >
            {galleryImages[selectedImageIndex] ? (
              <Lens
                hovering={isLensHovering}
                setHovering={setIsLensHovering}
                zoomFactor={1.85}
                lensSize={190}
                className="w-full h-full"
              >
                <div className="relative w-full h-full aspect-square">
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt={product.title}
                    fill
                    priority
                    className={`object-cover transition-all duration-300 ${
                      isLensHovering ? 'brightness-90' : 'brightness-100'
                    }`}
                  />
                </div>
              </Lens>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#849585] text-sm font-mono">
                Sin Imagen
              </div>
            )}

            {/* Etiqueta de Categoría */}
            {product.category && (
              <span className="absolute top-4 left-4 z-30 px-3 py-1 rounded-lg bg-[#0c0e11]/90 backdrop-blur-md text-[#9cf0ff] font-mono font-bold text-[11px] uppercase tracking-wider border border-white/15 pointer-events-none">
                {product.category.name}
              </span>
            )}

            {/* Botón para abrir Lightbox a pantalla completa */}
            {galleryImages.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0c0e11]/90 hover:bg-[#1e2023] text-[#00ff88] shadow-md backdrop-blur-md border border-[#00ff88]/30 text-xs font-mono font-bold transition-all cursor-pointer"
                aria-label="Ampliar imagen"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="hidden sm:inline">Ampliar</span>
              </button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Título, Estrellas, Precio, Stock, Variantes y Resumen */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Título y Calificación (Solo Estrellas) */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug font-heading uppercase">
              {product.title}
            </h1>

            {/* 6. Calificación: Solo las estrellas (Interactivas y limpias) */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= displayedStars;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          isFilled
                            ? 'text-[#00ff88] fill-[#00ff88]'
                            : 'text-[#333538] fill-[#1e2023]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono font-bold text-[#00ff88]">
                {displayedStars.toFixed(1)}
              </span>
            </div>
          </div>

          {/* 2. Caja Destacada de Precio y Promoción */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#1a1c1f] shadow-lg">
            {hasDiscount ? (
              <div className="bg-[#00ff88] text-[#003919] px-5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-[#003919]" />
                  Oferta Especial Gaming House
                </span>
                <span className="text-[11px] font-mono font-bold bg-[#003919]/15 px-2.5 py-0.5 rounded-full">
                  -{discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <div className="bg-[#282a2d] text-[#e2e2e6] px-5 py-2 flex items-center justify-between border-b border-white/10">
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#00ff88]">
                  Precio Oficial
                </span>
                <span className="text-[11px] font-mono text-[#b9cbb9]">
                  Disponibilidad inmediata
                </span>
              </div>
            )}

            <div className="p-5 space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#00ff88] tracking-tight font-heading">
                  {formatPrice(product.price)}
                </span>

                {hasDiscount && (
                  <div className="flex flex-col">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 text-xs font-mono font-bold">
                      Ahorras {formatPrice(savingsAmount)}
                    </span>
                    <span className="text-xs text-[#849585] line-through font-mono mt-0.5">
                      Antes: {formatPrice(product.compare_at_price)}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#b9cbb9] font-mono pt-1">
                IVA incluido. Envío por Blue Express calculado en el checkout.
              </p>
            </div>
          </div>

          {/* 5. Indicador Visual de Nivel de Stock Sencillo con Íconos */}
          <div className="p-3.5 rounded-xl bg-[#1a1c1f] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 font-bold">
                {isOutOfStock ? (
                  <>
                    <PackageX className="w-4 h-4 text-[#ffb4ab] shrink-0" />
                    <span className="text-[#ffb4ab]">Sin stock disponible</span>
                  </>
                ) : isLowStock ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-300">
                      Últimas {product.stock} unidades en inventario
                    </span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4 text-[#00ff88] shrink-0" />
                    <span className="text-white">
                      Stock Inmediato ({product.stock} unidades)
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-[#9cf0ff]">
                {isOutOfStock ? 'Agotado' : isLowStock ? 'Pocas unidades' : 'Listo para despacho'}
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#0c0e11] rounded-full overflow-hidden">
              <div
                style={{ width: `${stockPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isOutOfStock
                    ? 'bg-[#333538]'
                    : isLowStock
                    ? 'bg-amber-400'
                    : 'bg-[#00ff88] shadow-[0_0_10px_#00ff88]'
                }`}
              />
            </div>
          </div>

          {/* 3. Barra de Beneficio Rápido */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/25 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-[#e2e2e6]">
                <Tag className="w-4 h-4 text-[#00e5ff] shrink-0" />
                <span>
                  Garantía Gaming House y envío con código OT Blue Express
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#00e5ff] shrink-0" />
            </div>
          </div>

          {/* 4. Selector de Variantes con Miniaturas */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#b9cbb9]">
                  Opción seleccionada:{' '}
                  <span className="font-bold text-[#00ff88]">
                    {activeVariant?.title}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {variants.map((variant, idx) => {
                  const isSelected = selectedVariantIndex === idx;
                  const thumbImg = galleryImages[idx % galleryImages.length];
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        if (galleryImages[idx]) {
                          setSelectedImageIndex(idx);
                        }
                      }}
                      className={`group flex items-center gap-2.5 p-2 pr-3.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_16px_rgba(0,255,136,0.2)]'
                          : 'border-white/15 bg-[#1a1c1f] hover:border-[#00e5ff]'
                      }`}
                    >
                      {thumbImg && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#0c0e11] border border-white/10 shrink-0">
                          <Image
                            src={thumbImg}
                            alt={variant.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <span className="block text-xs font-mono font-bold text-white">
                          {variant.title}
                        </span>
                        <span className="block text-[10px] font-mono text-[#b9cbb9]">
                          {variant.stock} en stock
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cantidad + Botones de Acción */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center justify-between border border-white/15 rounded-xl px-3 h-12 bg-[#0c0e11] sm:w-36 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 hover:bg-[#282a2d] rounded-lg text-[#b9cbb9] hover:text-white disabled:opacity-40 transition-colors"
                  disabled={isOutOfStock || quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-sm text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-1.5 hover:bg-[#282a2d] rounded-lg text-[#b9cbb9] hover:text-white disabled:opacity-40 transition-colors"
                  disabled={isOutOfStock || quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                isDisabled={isOutOfStock}
                onPress={handleAddToCart}
                startContent={
                  added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />
                }
                className="flex-1 h-12 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-[#00ff88] hover:bg-[#60ff99] text-[#003919] shadow-[0_0_24px_-4px_rgba(0,255,136,0.45)] transition-all"
              >
                {isOutOfStock
                  ? 'Agotado'
                  : added
                  ? '¡Agregado al Carrito!'
                  : 'Agregar al Carrito'}
              </Button>

              <Button
                isDisabled={isOutOfStock}
                onPress={handleBuyNow}
                variant="bordered"
                className="h-12 px-6 rounded-xl border border-[#00e5ff]/50 bg-[#161920] text-[#00e5ff] hover:bg-[#00e5ff]/10 hover:border-[#00e5ff] font-mono font-bold text-xs uppercase tracking-wider transition-all"
              >
                Comprar Ahora
              </Button>
            </div>
          </div>

          {/* Resumen de Puntos Clave del Artículo */}
          <div className="border-t border-white/10 pt-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00ff88]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                  Resumen del artículo
                </h3>
              </div>
              <p className="text-[11px] text-[#b9cbb9]">
                Información destacada y especificaciones principales del producto.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-[#b9cbb9] leading-relaxed">
              {highlightItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-bold text-white">{item.title}:</strong>{' '}
                    {item.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sello de Confianza Inferior */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-[11px] font-mono font-semibold text-[#b9cbb9]">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>Despacho rápido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#00e5ff] shrink-0" />
              <span>Garantía GH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>Pago 100% Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 border-t border-white/10 pt-12">
          <h3 className="text-xl font-black text-white uppercase tracking-tight font-heading">
            Productos Relacionados
          </h3>
          <ProductGrid products={relatedProducts} />
        </div>
      )}

      {/* 1. Modal Lightbox a Pantalla Completa para la Galería */}
      {isLightboxOpen && galleryImages[selectedImageIndex] && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-150"
        >
          {/* Barra Superior del Lightbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              {product.title} — {selectedImageIndex + 1} / {galleryImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Cerrar vista ampliada"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Imagen Central y Controles Anterior / Siguiente */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl aspect-square max-h-[70vh] flex items-center justify-center my-auto"
          >
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:-left-14 z-10 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
              <Image
                src={galleryImages[selectedImageIndex]}
                alt={product.title}
                fill
                className="object-contain"
              />
            </div>

            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:-right-14 z-10 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Miniaturas Inferiores dentro del Lightbox */}
          {galleryImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 overflow-x-auto max-w-full py-2"
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-white scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Miniatura ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
