'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { sanitizeInput } from '@/lib/security/sanitizer';
import { SITE_CONFIG, formatPrice } from '@/lib/constants';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { Product, Category } from '@/lib/types';
import { Checkbox, Pagination, Button, Chip } from '@heroui/react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpDown,
  ArrowUpRight,
  X,
  Check,
  Sparkles,
  Tag,
} from 'lucide-react';

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'name-asc', label: 'Nombre: A - Z' },
  { value: 'newest', label: 'Más recientes' },
];

const CATALOG_CAROUSEL_SLIDES = [
  {
    id: 'slide-1',
    title: 'PCS DE ESCRITORIO ARMADAS LISTAS PARA JUGAR',
    subtitle:
      'Enciende y juega sin ensamblar ni configurar. Equipos calibrados con pruebas de estrés reales y garantía Gaming House.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80',
  },
  {
    id: 'slide-2',
    title: 'PC GAMER ENTRADA & GAMA MEDIA',
    subtitle:
      'Configuraciones equilibradas para competitivo, eSports y juegos actuales con máximo rendimiento por cada peso invertido.',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80',
  },
  {
    id: 'slide-3',
    title: 'PC GAMER GAMA ALTA & STREAMING',
    subtitle:
      'Torres de alto rendimiento con refrigeración avanzada y gráficas dedicadas para máxima calidad visual y multitarea.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
  },
  {
    id: 'slide-4',
    title: 'PC TRABAJO, ESTUDIO & WORKSTATION',
    subtitle:
      'Equipos de escritorio silenciosos y veloces para arquitectura, edición de video, programación y productividad profesional.',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1600&q=80',
  },
];

const ITEMS_PER_PAGE = 6;

export function CatalogView() {
  const searchParams = useSearchParams();
  const initialQuery = sanitizeInput(searchParams.get('q') || '');
  const initialCategory = sanitizeInput(searchParams.get('category') || '');

  const { products: storeProducts, categories: storeCategories } = useAdminStore();
  const [allProducts, setAllProducts] = useState<Product[]>(
    storeProducts.filter((p) => p.active)
  );
  const [categories, setCategories] = useState<Category[]>(
    storeCategories.filter((c) => c.active)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Estado del Carrusel Superior (Auto-avance en bucle continuo cada 4s + control manual)
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CATALOG_CAROUSEL_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? CATALOG_CAROUSEL_SLIDES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % CATALOG_CAROUSEL_SLIDES.length);
  };

  useEffect(() => {
    setAllProducts(storeProducts.filter((p) => p.active));
    setCategories(storeCategories.filter((c) => c.active));
  }, [storeProducts, storeCategories]);

  // Estados de Búsqueda, Autocompletado, Filtros, Ordenamiento y Paginación
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);

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
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  // Cerrar menús desplegables (Ordenar y Autocompletado) al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setActiveSuggestionIdx(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    async function fetchCatalogData() {
      if (allProducts.length === 0) setIsLoading(true);
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

  // Sugerencias de autocompletado en vivo basadas en productos y categorías
  const searchSuggestions = useMemo(() => {
    const q = sanitizeInput(searchQuery).toLowerCase().trim();
    if (!q) {
      return allProducts.slice(0, 4);
    }
    return allProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.name.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [allProducts, searchQuery]);

  // Texto fantasma de autocompletado inline (cuando el título empieza con lo que escribe el usuario)
  const inlineAutocomplete = useMemo(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) return '';
    const match = allProducts.find((p) =>
      p.title.toLowerCase().startsWith(q.toLowerCase())
    );
    if (!match) return '';
    return searchQuery + match.title.slice(q.length);
  }, [allProducts, searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && inlineAutocomplete) {
      e.preventDefault();
      setSearchQuery(inlineAutocomplete);
      setIsSearchOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearchOpen(true);
      setActiveSuggestionIdx((prev) =>
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx((prev) =>
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
      e.preventDefault();
      const chosen = searchSuggestions[activeSuggestionIdx];
      if (chosen) {
        setSearchQuery(chosen.title);
        setIsSearchOpen(false);
        setActiveSuggestionIdx(-1);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setActiveSuggestionIdx(-1);
    }
  };

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
        !product.description.toLowerCase().includes(cleanSearch) &&
        !(product.sku && product.sku.toLowerCase().includes(cleanSearch))
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
    { label: 'Hasta $600.000', min: '', max: '600000' },
    { label: '$600.000 - $1.200.000', min: '600000', max: '1200000' },
    { label: 'Más de $1.200.000', min: '1200000', max: '' },
  ];

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Recomendados';

  const currentSlideObj = CATALOG_CAROUSEL_SLIDES[activeSlide];

  return (
    <div className="w-full">
      {/* Carrusel de Imágenes de Referencia a Ancho Completo de Pantalla (Compacto en altura y en bucle automático) */}
      <section className="relative w-full bg-[#0c0e11] border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-[#7000ff] z-30 opacity-90" />

        <div className="relative w-full h-[180px] sm:h-[210px] lg:h-[230px] flex items-center">
          {CATALOG_CAROUSEL_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center opacity-50 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-[#0c0e11]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e11] via-[#0c0e11]/65 to-transparent" />
            </div>
          ))}

          <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 py-5">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none font-heading">
                {currentSlideObj.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#b9cbb9] max-w-2xl leading-relaxed">
                {currentSlideObj.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full bg-[#0c0e11]/95 border-t border-white/10">
          <div className="w-full px-4 sm:px-8 lg:px-12 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {CATALOG_CAROUSEL_SLIDES.map((slide, idx) => {
                const isCurrent = idx === activeSlide;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Ir a imagen ${idx + 1}`}
                    className={`h-1.5 transition-all duration-300 ${isCurrent
                      ? 'w-10 bg-[#00ff88] shadow-[0_0_10px_#00ff88]'
                      : 'w-3 bg-[#333538] hover:bg-[#00ff88]/50'
                      }`}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#849585] mr-1 hidden sm:inline">
                0{activeSlide + 1} / 0{CATALOG_CAROUSEL_SLIDES.length}
              </span>
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Slide anterior"
                className="w-7 h-7 rounded-md bg-[#1e2023] hover:bg-[#00ff88]/20 border border-white/10 hover:border-[#00ff88] text-[#b9cbb9] hover:text-[#00ff88] flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Slide siguiente"
                className="w-7 h-7 rounded-md bg-[#1e2023] hover:bg-[#00ff88]/20 border border-white/10 hover:border-[#00ff88] text-[#b9cbb9] hover:text-[#00ff88] flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido del Catálogo a Ancho Completo de Pantalla */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Botón para mostrar filtros en móvil */}
          <div className="lg:hidden">
            <Button
              onPress={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              variant="bordered"
              startContent={<SlidersHorizontal className="w-4 h-4 text-[#00ff88]" />}
              className="w-full gh-btn-cyan h-10 rounded-md"
            >
              {mobileFiltersOpen ? 'Ocultar Matriz de Filtros' : 'Mostrar Matriz de Filtros'}
            </Button>
          </div>

          {/* Columna Izquierda: Panel de Filtros Cyberpunk */}
          <aside
            className={`lg:col-span-3 xl:col-span-3 2xl:col-span-2 gh-panel gh-panel-glow !rounded-lg divide-y divide-white/10 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'
              }`}
          >
            <div className="p-5 flex items-center justify-between bg-[#1e2023] rounded-t-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#00ff88]/15 border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="font-black text-xs uppercase tracking-wider text-white font-mono">
                    Matriz de Filtros
                  </h2>
                  <span className="block text-[10px] font-mono text-[#849585]">
                    PARÁMETROS DE BÚSQUEDA
                  </span>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-mono font-bold text-[#00ff88] hover:text-[#60ff99] flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
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
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#00ff88]">
                  01 // Categorías
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#b9cbb9] transition-transform ${openSections.categories ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.categories && (
                <div className="space-y-1.5 pt-1 max-h-56 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const count = allProducts.filter((p) => p.category?.slug === cat.slug).length;
                    const isChecked = selectedCategories.includes(cat.slug);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.slug)}
                        className={`group flex items-center justify-between py-2 px-2.5 rounded-md cursor-pointer border transition-all ${isChecked
                          ? 'bg-[#00ff88]/15 border-[#00ff88]/50 text-white shadow-[0_0_14px_rgba(0,255,136,0.15)]'
                          : 'bg-[#161920] border-white/5 hover:border-[#00ff88]/40 hover:bg-[#00ff88]/10'
                          }`}
                      >
                        <Checkbox
                          size="sm"
                          color="success"
                          isSelected={isChecked}
                          onValueChange={() => toggleCategory(cat.slug)}
                          classNames={{
                            base: 'max-w-full',
                            wrapper:
                              'before:border-white/30 group-hover:before:border-[#00ff88] after:bg-[#00ff88] after:text-[#003919]',
                            icon: 'text-[#003919]',
                            label:
                              'text-xs font-medium text-[#e2e2e6] group-hover:text-[#00ff88] transition-colors',
                          }}
                        >
                          {cat.name}
                        </Checkbox>
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-sm transition-colors ${isChecked
                            ? 'bg-[#00ff88] text-[#003919]'
                            : 'bg-[#0c0e11] text-[#00ff88] border border-white/10 group-hover:border-[#00ff88]/40'
                            }`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Filtro por Rango de Precios */}
            <div className="p-5 space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#00e5ff]">
                  02 // Rango CLP
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#b9cbb9] transition-transform ${openSections.price ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.price && (
                <div className="space-y-3 pt-1">
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
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono font-bold border transition-all ${isSelected
                            ? 'bg-[#00ff88] text-[#003919] border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.35)]'
                            : 'bg-[#0c0e11] text-[#b9cbb9] border-white/10 hover:border-[#00ff88]/50 hover:text-[#00ff88]'
                            }`}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-[#b9cbb9] block mb-1">
                        Mínimo
                      </label>
                      <div className="flex items-center gap-1.5 px-3 h-10 gh-input !rounded-md">
                        <span className="text-xs font-mono font-bold text-[#00ff88] select-none">
                          {SITE_CONFIG.currencySymbol}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="350000"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-transparent border-none outline-none focus:outline-none text-xs font-mono font-semibold text-white placeholder:text-[#849585] tabular-nums"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-[#b9cbb9] block mb-1">
                        Máximo
                      </label>
                      <div className="flex items-center gap-1.5 px-3 h-10 gh-input !rounded-md">
                        <span className="text-xs font-mono font-bold text-[#00ff88] select-none">
                          {SITE_CONFIG.currencySymbol}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="2500000"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-transparent border-none outline-none focus:outline-none text-xs font-mono font-semibold text-white placeholder:text-[#849585] tabular-nums"
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
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#d1bcff]">
                  03 // Disponibilidad
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#b9cbb9] transition-transform ${openSections.availability ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {openSections.availability && (
                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => setOnlyInStock(!onlyInStock)}
                    className={`group flex items-center justify-between py-2 px-2.5 rounded-md cursor-pointer border transition-all ${onlyInStock
                      ? 'bg-[#00ff88]/15 border-[#00ff88]/50'
                      : 'bg-[#161920] border-white/5 hover:border-[#00ff88]/40 hover:bg-[#00ff88]/10'
                      }`}
                  >
                    <Checkbox
                      size="sm"
                      color="success"
                      isSelected={onlyInStock}
                      onValueChange={setOnlyInStock}
                      classNames={{
                        wrapper: 'before:border-white/30 group-hover:before:border-[#00ff88] after:bg-[#00ff88]',
                        icon: 'text-[#003919]',
                        label: 'text-xs font-medium text-[#e2e2e6] group-hover:text-[#00ff88]',
                      }}
                    >
                      Solo productos en stock
                    </Checkbox>
                  </div>
                  <div
                    onClick={() => setOnlyDeals(!onlyDeals)}
                    className={`group flex items-center justify-between py-2 px-2.5 rounded-md cursor-pointer border transition-all ${onlyDeals
                      ? 'bg-[#00ff88]/15 border-[#00ff88]/50'
                      : 'bg-[#161920] border-white/5 hover:border-[#00ff88]/40 hover:bg-[#00ff88]/10'
                      }`}
                  >
                    <Checkbox
                      size="sm"
                      color="success"
                      isSelected={onlyDeals}
                      onValueChange={setOnlyDeals}
                      classNames={{
                        wrapper: 'before:border-white/30 group-hover:before:border-[#00ff88] after:bg-[#00ff88]',
                        icon: 'text-[#003919]',
                        label: 'text-xs font-medium text-[#e2e2e6] group-hover:text-[#00ff88]',
                      }}
                    >
                      En oferta / Con descuento
                    </Checkbox>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Columna Derecha: Barra Superior (Tamaños Uniformes + Autocompletado) y Grilla */}
          <div className="lg:col-span-9 xl:col-span-9 2xl:col-span-10 space-y-5">
            {/* Barra de Control Superior Cyberpunk — z-30 y overflow-visible para que ningún desplegable se tape */}
            <div className="relative z-30 gh-panel gh-panel-glow !rounded-lg p-3.5 sm:px-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 overflow-visible">
              {/* Buscador con Autocompletado Inline y Panel de Sugerencias */}
              <div ref={searchContainerRef} className="relative flex-1">
                <div className="relative flex items-center gap-2.5 w-full px-3.5 h-10 gh-input !rounded-md">
                  <Search className="w-4 h-4 text-[#00ff88] shrink-0" />

                  <div className="relative flex-1 h-full flex items-center">
                    {/* Texto fantasma de autocompletado inline */}
                    {inlineAutocomplete && (
                      <span className="absolute inset-y-0 left-0 flex items-center text-xs font-mono text-[#849585]/60 pointer-events-none select-none truncate">
                        {inlineAutocomplete}
                      </span>
                    )}
                    <input
                      type="text"
                      placeholder="Buscar por nombre, categoría o SKU..."
                      value={searchQuery}
                      onFocus={() => setIsSearchOpen(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                        setActiveSuggestionIdx(-1);
                      }}
                      onKeyDown={handleSearchKeyDown}
                      className="relative z-10 w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs font-mono text-white placeholder:text-[#849585]"
                    />
                  </div>

                  {inlineAutocomplete && (
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#1e2023] border border-white/10 text-[9px] font-mono text-[#9cf0ff] shrink-0">
                      TAB ↹
                    </span>
                  )}

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveSuggestionIdx(-1);
                      }}
                      className="p-1 rounded-md text-[#b9cbb9] hover:text-white hover:bg-[#282a2d] transition-colors shrink-0"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Desplegable de Sugerencias y Autocompletado en Vivo */}
                {isSearchOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-[#14181f] border border-[#00ff88]/40 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 overflow-hidden">
                    {/* Lista de Productos Sugeridos */}
                    <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                      <span className="block px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#849585]">
                        {searchQuery.trim()
                          ? `Sugerencias (${searchSuggestions.length})`
                          : 'Sugerencias de Productos'}
                      </span>

                      {searchSuggestions.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs font-mono text-[#849585]">
                          No hay coincidencias para &ldquo;{searchQuery}&rdquo;
                        </div>
                      ) : (
                        searchSuggestions.map((prod, idx) => {
                          const isHighlighted = idx === activeSuggestionIdx;
                          return (
                            <div
                              key={prod.id}
                              onMouseEnter={() => setActiveSuggestionIdx(idx)}
                              onClick={() => {
                                setSearchQuery(prod.title);
                                setIsSearchOpen(false);
                              }}
                              className={`flex items-center justify-between gap-3 p-2 rounded-md cursor-pointer transition-colors ${isHighlighted
                                ? 'bg-[#00ff88]/15 border border-[#00ff88]/40'
                                : 'hover:bg-[#1e2023] border border-transparent'
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-10 h-10 rounded bg-[#0c0e11] border border-white/10 overflow-hidden shrink-0">
                                  {prod.images?.[0] && (
                                    <Image
                                      src={prod.images[0]}
                                      alt={prod.title}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate font-heading uppercase">
                                    {prod.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#b9cbb9]">
                                    {prod.category && (
                                      <span className="text-[#00e5ff]">{prod.category.name}</span>
                                    )}
                                    {prod.sku && <span>• {prod.sku}</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs font-mono font-bold text-[#00ff88]">
                                  {formatPrice(prod.price)}
                                </span>
                                <Link
                                  href={`/productos/${prod.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded bg-[#1e2023] hover:bg-[#00ff88] text-[#9cf0ff] hover:text-[#003919] transition-colors"
                                  title="Ir a la ficha del producto"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ordenar por + Paginación Compacta Derecha (Altura uniforme h-10) */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#b9cbb9] flex items-center gap-1.5 whitespace-nowrap">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#00ff88]" />
                    Ordenar:
                  </span>

                  {/* Menú Desplegable Ordenar (z-50 para nunca taparse con las cards) */}
                  <div ref={sortDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSortOpen((prev) => !prev)}
                      className={`flex items-center justify-between gap-3 px-3.5 h-10 text-xs font-mono font-bold text-white transition-all min-w-[205px] gh-select !rounded-md ${isSortOpen ? 'border-[#00ff88]' : ''
                        }`}
                    >
                      <span className="truncate">{currentSortLabel}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#00ff88] shrink-0 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {isSortOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#14181f] border border-[#00ff88]/50 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-1.5 z-50">
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
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-mono transition-colors text-left ${isSelected
                                ? 'bg-[#00ff88] text-[#003919] font-bold shadow-[0_0_12px_rgba(0,255,136,0.35)]'
                                : 'text-[#e2e2e6] hover:bg-[#00ff88]/15 hover:text-[#00ff88]'
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

                {/* Paginación en Barra Superior — Altura uniforme h-10 */}
                {totalPages > 1 && (
                  <div className="border-l border-white/10 pl-4 hidden sm:flex items-center h-10">
                    <Pagination
                      total={totalPages}
                      page={currentPage}
                      onChange={setCurrentPage}
                      showControls
                      color="success"
                      size="sm"
                      radius="sm"
                      classNames={{
                        wrapper: 'gap-1.5',
                        item: 'bg-[#14181f] border border-[#00ff88]/30 text-[#b9cbb9] font-mono font-bold text-xs min-w-9 h-9 rounded-md hover:bg-[#00ff88]/15 hover:text-[#00ff88] hover:border-[#00ff88]',
                        cursor:
                          'bg-[#00ff88] text-[#003919] border border-[#00ff88] font-mono font-black text-xs min-w-9 h-9 rounded-md shadow-[0_0_16px_rgba(0,255,136,0.5)]',
                        prev: 'bg-[#14181f] border border-[#00ff88]/30 text-[#00ff88] min-w-9 h-9 rounded-md hover:bg-[#00ff88]/15 hover:border-[#00ff88]',
                        next: 'bg-[#14181f] border border-[#00ff88]/30 text-[#00ff88] min-w-9 h-9 rounded-md hover:bg-[#00ff88]/15 hover:border-[#00ff88]',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Chips de Filtros Activos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cbb9] mr-1">
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
                      className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 font-mono font-bold text-xs"
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
                    className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 font-mono font-bold text-xs"
                  >
                    CLP: {minPrice ? `${SITE_CONFIG.currencySymbol}${minPrice}` : '$0'} -{' '}
                    {maxPrice ? `${SITE_CONFIG.currencySymbol}${maxPrice}` : 'Máx'}
                  </Chip>
                )}
                {onlyInStock && (
                  <Chip
                    onClose={() => setOnlyInStock(false)}
                    variant="flat"
                    size="sm"
                    className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 font-mono font-bold text-xs"
                  >
                    En stock
                  </Chip>
                )}
                {onlyDeals && (
                  <Chip
                    onClose={() => setOnlyDeals(false)}
                    variant="flat"
                    size="sm"
                    className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/40 font-mono font-bold text-xs"
                  >
                    En oferta
                  </Chip>
                )}
              </div>
            )}

            {/* Sección de Cards: Encabezado integrado con las Cards + Grilla Uniforme */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between px-1 text-xs font-mono text-[#b9cbb9]">
                <div className="flex items-center gap-2">
                  <span>
                    Mostrando{' '}
                    <strong className="text-[#00ff88]">{paginatedProducts.length}</strong> de{' '}
                    <strong className="text-white">{filteredAndSortedProducts.length}</strong>{' '}
                    productos
                  </span>
                </div>
                <span className="text-[11px] text-[#849585]">
                  Página <strong className="text-[#00ff88]">{currentPage}</strong> de{' '}
                  <strong className="text-white">{totalPages}</strong>
                </span>
              </div>

              <ProductGrid products={paginatedProducts} isLoading={isLoading} columns={3} />
            </div>

            {/* Paginación Inferior — Paleta Verde */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                <span className="text-xs text-[#b9cbb9] font-mono">
                  Mostrando <strong className="text-[#00ff88]">{paginatedProducts.length}</strong> de{' '}
                  <strong className="text-white">{filteredAndSortedProducts.length}</strong> productos • Página{' '}
                  <strong className="text-[#00ff88]">{currentPage}</strong> de{' '}
                  <strong className="text-white">{totalPages}</strong>
                </span>
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                  color="success"
                  size="md"
                  radius="sm"
                  classNames={{
                    wrapper: 'gap-2',
                    item: 'bg-[#14181f] border border-[#00ff88]/30 text-[#b9cbb9] font-mono font-bold text-xs rounded-md hover:bg-[#00ff88]/15 hover:text-[#00ff88] hover:border-[#00ff88]',
                    cursor:
                      'bg-[#00ff88] text-[#003919] border border-[#00ff88] font-mono font-black text-xs rounded-md shadow-[0_0_18px_rgba(0,255,136,0.5)]',
                    prev: 'bg-[#14181f] border border-[#00ff88]/30 text-[#00ff88] rounded-md hover:bg-[#00ff88]/15 hover:border-[#00ff88]',
                    next: 'bg-[#14181f] border border-[#00ff88]/30 text-[#00ff88] rounded-md hover:bg-[#00ff88]/15 hover:border-[#00ff88]',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
