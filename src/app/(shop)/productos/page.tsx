'use client';

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { createClient } from '@/lib/supabase/client';
import { sanitizeInput } from '@/lib/security/sanitizer';
import { SITE_CONFIG } from '@/lib/constants';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { Product, Category } from '@/lib/types';
import {
  Spinner,
  Checkbox,
  Pagination,
  Button,
  Chip,
} from '@heroui/react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  ArrowUpDown,
  X,
  Check,
} from 'lucide-react';

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'name-asc', label: 'Nombre: A - Z' },
  { value: 'newest', label: 'Más recientes' },
];

const ITEMS_PER_PAGE = 6;

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = sanitizeInput(searchParams.get('q') || '');
  const initialCategory = sanitizeInput(searchParams.get('category') || '');

  const { products: storeProducts, categories: storeCategories } = useAdminStore();
  const [allProducts, setAllProducts] = useState<Product[]>(storeProducts.filter((p) => p.active));
  const [categories, setCategories] = useState<Category[]>(storeCategories.filter((c) => c.active));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAllProducts(storeProducts.filter((p) => p.active));
    setCategories(storeCategories.filter((c) => c.active));
  }, [storeProducts, storeCategories]);

  // Estados de Búsqueda, Filtros, Ordenamiento y Paginación
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Secciones colapsables del sidebar y vista móvil
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    availability: true,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  // Cerrar el menú de ordenamiento al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchCatalogData() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
          supabase.from('products').select('*, category:categories(*)').eq('active', true),
          supabase.from('categories').select('*').eq('active', true),
        ]);

        if (productsData && productsData.length > 0) {
          setAllProducts(productsData);
        }
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch {
        // Fallback a SAMPLE_PRODUCTS y SAMPLE_CATEGORIES
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalogData();
  }, []);

  // Reiniciar a la página 1 cuando cambian los filtros o el ordenamiento
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, minPrice, maxPrice, onlyInStock, onlyDeals, sortBy]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setOnlyDeals(false);
    setSortBy('recommended');
    setCurrentPage(1);
  };

  // Filtrado y Ordenamiento reactivo
  const filteredAndSortedProducts = useMemo(() => {
    const cleanSearch = sanitizeInput(searchQuery).toLowerCase().trim();
    const min = minPrice !== '' ? parseFloat(minPrice) : null;
    const max = maxPrice !== '' ? parseFloat(maxPrice) : null;

    const filtered = allProducts.filter((product) => {
      if (
        cleanSearch &&
        !product.title.toLowerCase().includes(cleanSearch) &&
        !product.description.toLowerCase().includes(cleanSearch)
      ) {
        return false;
      }

      if (selectedCategories.length > 0) {
        const productCatSlug = product.category?.slug || '';
        if (!selectedCategories.includes(productCatSlug)) {
          return false;
        }
      }

      if (min !== null && !isNaN(min) && product.price < min) {
        return false;
      }
      if (max !== null && !isNaN(max) && product.price > max) {
        return false;
      }

      if (onlyInStock && product.stock <= 0) {
        return false;
      }
      if (onlyDeals && (!product.compare_at_price || product.compare_at_price <= product.price)) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'recommended':
        default:
          return Number(b.featured) - Number(a.featured);
      }
    });
  }, [allProducts, searchQuery, selectedCategories, minPrice, maxPrice, onlyInStock, onlyDeals, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategories.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    onlyInStock ||
    onlyDeals;

  const quickPriceRanges = [
    { label: 'Hasta $25.000', min: '', max: '25000' },
    { label: '$25.000 - $50.000', min: '25000', max: '50000' },
    { label: 'Más de $50.000', min: '50000', max: '' },
  ];

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Recomendados';

  return (
    <div className="space-y-6">
      {/* Encabezado del Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            EXPLORAR TIENDA
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mt-0.5">
            Catálogo de Productos
          </h1>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          Mostrando <span className="text-slate-900 font-black">{paginatedProducts.length}</span> de{' '}
          <span className="text-slate-900 font-black">{filteredAndSortedProducts.length}</span> productos
        </p>
      </div>

      {/* Layout Principal: Sidebar de Filtros (Izquierda) + Contenido (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Botón para mostrar filtros en móvil */}
        <div className="lg:hidden">
          <Button
            onPress={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            variant="bordered"
            startContent={<SlidersHorizontal className="w-4 h-4" />}
            className="w-full border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl h-11"
          >
            {mobileFiltersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>

        {/* Columna Izquierda: Panel de Filtros */}
        <aside
          className={`lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden divide-y divide-slate-200/80 ${
            mobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Cabecera del Sidebar */}
          <div className="p-5 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-800" />
              <h2 className="font-black text-xs uppercase tracking-wider text-slate-900">
                Filtros
              </h2>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>

          {/* 1. Filtro por Categorías */}
          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Categorías
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.categories ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.categories && (
              <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const count = allProducts.filter((p) => p.category?.slug === cat.slug).length;
                  const isChecked = selectedCategories.includes(cat.slug);
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between py-1 hover:bg-slate-50 rounded-lg px-1 transition-colors"
                    >
                      <Checkbox
                        size="sm"
                        isSelected={isChecked}
                        onValueChange={() => toggleCategory(cat.slug)}
                        classNames={{
                          label: 'text-xs font-medium text-slate-700',
                        }}
                      >
                        {cat.name}
                      </Checkbox>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Filtro por Rango de Precios (Sin flechas nativas) */}
          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Rango de Precios
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.price ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.price && (
              <div className="space-y-3 pt-1">
                {/* Rangos Rápidos */}
                <div className="flex flex-wrap gap-1.5">
                  {quickPriceRanges.map((range) => {
                    const isSelected = minPrice === range.min && maxPrice === range.max;
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setMinPrice('');
                            setMaxPrice('');
                          } else {
                            setMinPrice(range.min);
                            setMaxPrice(range.max);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>

                {/* Inputs Mínimo y Máximo sin flechas nativas */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Mínimo
                    </label>
                    <div className="flex items-center gap-1.5 px-3 h-9 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
                      <span className="text-xs font-bold text-slate-400 select-none">
                        {SITE_CONFIG.currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-transparent border-none outline-none focus:outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Máximo
                    </label>
                    <div className="flex items-center gap-1.5 px-3 h-9 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
                      <span className="text-xs font-bold text-slate-400 select-none">
                        {SITE_CONFIG.currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Máx"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-transparent border-none outline-none focus:outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Disponibilidad y Estado */}
          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('availability')}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Disponibilidad
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.availability ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.availability && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <Checkbox
                    size="sm"
                    isSelected={onlyInStock}
                    onValueChange={setOnlyInStock}
                    classNames={{ label: 'text-xs font-medium text-slate-700' }}
                  >
                    Solo productos en stock
                  </Checkbox>
                </div>
                <div className="flex items-center justify-between">
                  <Checkbox
                    size="sm"
                    isSelected={onlyDeals}
                    onValueChange={setOnlyDeals}
                    classNames={{ label: 'text-xs font-medium text-slate-700' }}
                  >
                    En oferta / Con descuento
                  </Checkbox>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Columna Derecha: Barra Superior (Búsqueda + Ordenamiento + Paginación) y Grilla */}
        <div className="lg:col-span-9 space-y-6">
          {/* Barra de Control Superior */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 sm:px-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Buscador de Productos Limpio (Sin bordes internos dobles) */}
            <div className="flex items-center gap-2.5 flex-1 max-w-md bg-white border border-slate-200 hover:border-slate-300 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 rounded-xl px-3.5 h-10 shadow-2xs transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs font-medium text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ordenar por (Dropdown Personalizado Moderno) + Paginación Compacta Derecha */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  Ordenar por
                </span>

                {/* Menú Desplegable Moderno */}
                <div ref={sortDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    className={`flex items-center justify-between gap-3 bg-white border rounded-xl px-3.5 h-10 text-xs font-bold text-slate-800 shadow-2xs transition-all min-w-[195px] ${
                      isSortOpen
                        ? 'border-slate-900 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{currentSortLabel}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isSortOpen ? 'rotate-180 text-slate-900' : ''
                      }`}
                    />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      {SORT_OPTIONS.map((option) => {
                        const isSelected = sortBy === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSortBy(option.value);
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                              isSelected
                                ? 'bg-slate-900 text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span>{option.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Paginación en Barra Superior */}
              {totalPages > 1 && (
                <div className="border-l border-slate-200 pl-4 hidden sm:block">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    size="sm"
                    radius="full"
                    classNames={{
                      wrapper: 'gap-1',
                      item: 'bg-white border border-slate-200 text-slate-700 font-bold text-xs min-w-8 h-8',
                      cursor: 'bg-slate-900 text-white font-black text-xs min-w-8 h-8 shadow-xs',
                      prev: 'bg-white border border-slate-200 text-slate-700 min-w-8 h-8',
                      next: 'bg-white border border-slate-200 text-slate-700 min-w-8 h-8',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chips de Filtros Activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Filtros activos:
              </span>
              {selectedCategories.map((slug) => {
                const catName = categories.find((c) => c.slug === slug)?.name || slug;
                return (
                  <Chip
                    key={slug}
                    onClose={() => toggleCategory(slug)}
                    variant="flat"
                    size="sm"
                    className="bg-slate-100 text-slate-800 font-bold text-xs"
                  >
                    {catName}
                  </Chip>
                );
              })}
              {(minPrice || maxPrice) && (
                <Chip
                  onClose={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  variant="flat"
                  size="sm"
                  className="bg-slate-100 text-slate-800 font-bold text-xs"
                >
                  Precio: {minPrice ? `${SITE_CONFIG.currencySymbol}${minPrice}` : '$0'} -{' '}
                  {maxPrice ? `${SITE_CONFIG.currencySymbol}${maxPrice}` : 'Máx'}
                </Chip>
              )}
              {onlyInStock && (
                <Chip
                  onClose={() => setOnlyInStock(false)}
                  variant="flat"
                  size="sm"
                  className="bg-slate-100 text-slate-800 font-bold text-xs"
                >
                  En stock
                </Chip>
              )}
              {onlyDeals && (
                <Chip
                  onClose={() => setOnlyDeals(false)}
                  variant="flat"
                  size="sm"
                  className="bg-slate-100 text-slate-800 font-bold text-xs"
                >
                  En oferta
                </Chip>
              )}
            </div>
          )}

          {/* Grilla de Productos */}
          <ProductGrid products={paginatedProducts} isLoading={isLoading} columns={3} />

          {/* Paginación Inferior */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Página <strong className="text-slate-900">{currentPage}</strong> de{' '}
                <strong className="text-slate-900">{totalPages}</strong>
              </span>
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                size="md"
                radius="full"
                classNames={{
                  wrapper: 'gap-1.5',
                  item: 'bg-white border border-slate-200 text-slate-700 font-bold text-xs',
                  cursor: 'bg-slate-900 text-white font-black text-xs shadow-sm',
                  prev: 'bg-white border border-slate-200 text-slate-700',
                  next: 'bg-white border border-slate-200 text-slate-700',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense
        fallback={
          <div className="text-center py-16">
            <Spinner size="lg" />
          </div>
        }
      >
        <CatalogContent />
      </Suspense>
    </div>
  );
}
