'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Product, Category } from '@/lib/types';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { THEME_CONFIG } from '@/lib/theme';
import { formatPrice } from '@/lib/constants';

const formatCLP = formatPrice;
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const HERO_FLIP_WORDS = ['PARA GANAR.', 'SIN LÍMITES.', 'AL MÁXIMO.'];

const HIGHLIGHTS = [
  {
    id: 'rendimiento',
    tag: 'ENSAMBLAJE PROFESIONAL',
    title: 'PCs de escritorio armadas listas para rendir al máximo.',
    subtitle:
      'Cada equipo se entrega completamente ensamblado, con gestión de cables limpia, sistema configurado y testeado para usar desde el primer minuto.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80',
    icon: Sparkles,
  },
  {
    id: 'despacho',
    tag: 'ENVÍOS A TODO CHILE',
    title: 'Recibe tu PC armada en tu puerta con seguimiento en línea.',
    subtitle:
      'Despachamos a domicilio o Punto Blue / Copec mediante Blue Express con embalaje reforzado y código OT para que sigas tu pedido.',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80',
    icon: Truck,
  },
  {
    id: 'seguridad',
    tag: 'COMPRA PROTEGIDA',
    title: 'Pago oficial con Webpay Plus y garantía directa.',
    subtitle:
      'Paga con tranquilidad usando débito, crédito o prepago a través de Transbank, con respaldo técnico y garantía en Chile.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    icon: ShieldCheck,
  },
];

/* ============================================================================
   COMPONENTE 1: ACETERNITY UI <BackgroundBeams /> & <Spotlight />
   Haces de luz SVG animados y cono de luz diagonal sin impacto en el hilo principal
   ============================================================================ */
function HeroAmbientBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Spotlight Diagonal Estilo Aceternity UI */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
        className="absolute -top-36 -left-24 w-[130%] sm:w-[95%] h-[135%] opacity-45"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 3787 2842"
        fill="none"
      >
        <g filter="url(#gh-spotlight-filter)">
          <ellipse
            cx="1924.71"
            cy="273.501"
            rx="1924.71"
            ry="273.501"
            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
            fill="url(#gh-spotlight-grad)"
            fillOpacity="0.24"
          />
        </g>
        <defs>
          <filter
            id="gh-spotlight-filter"
            x="0.860352"
            y="0.838989"
            width="3785.16"
            height="2840.26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="151"
              result="effect1_foregroundBlur_1065_8"
            />
          </filter>
          <linearGradient
            id="gh-spotlight-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="60%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#7000ff" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Rejilla de Perspectiva Animada (Vengeance UI Perspective Grid) */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,255,136,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.14) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 100%)',
        }}
      />

      {/* Haces láser dinámicos (Aceternity Background Beams) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="beam-neon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ff88" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7000ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d="M-100 180 C 420 340, 880 40, 1540 260"
          stroke="url(#beam-neon)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
          animate={{
            pathLength: [0.25, 0.5, 0.25],
            pathOffset: [0, 1],
            opacity: [0, 0.85, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.path
          d="M-100 560 C 520 380, 960 660, 1540 420"
          stroke="url(#beam-cyan)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
          animate={{
            pathLength: [0.2, 0.45, 0.2],
            pathOffset: [0, 1],
            opacity: [0, 0.75, 0],
          }}
          transition={{
            duration: 9,
            delay: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}

/* ============================================================================
   COMPONENTE 2: ACETERNITY UI / VENGEANCE UI <SpotlightTiltCard />
   Tarjeta con inclinación 3D por resorte + foco radial que sigue el cursor
   (Usa MotionValues directos fuera del estado de React para 120fps reales)
   ============================================================================ */
function SpotlightTiltCard({
  children,
  className = '',
  tiltDegree = 7,
  spotlightColor = 'rgba(0, 255, 136, 0.22)',
  enableDepth = false,
}: {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  spotlightColor?: string;
  enableDepth?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);

  const rotateX = useSpring(rotateXRaw, { stiffness: 180, damping: 22, mass: 0.6 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 180, damping: 22, mass: 0.6 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current || shouldReduceMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);

    const xPct = x / rect.width - 0.5;
    const yPct = y / rect.height - 0.5;
    rotateXRaw.set(-yPct * tiltDegree * 2);
    rotateYRaw.set(xPct * tiltDegree * 2);
  };

  const handlePointerLeave = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  const spotlightBg = useMotionTemplate`radial-gradient(360px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformPerspective: 1100,
        transformStyle: enableDepth ? 'preserve-3d' : undefined,
      }}
      className={`group/tilt relative ${className}`}
    >
      {/* Halo Spotlight reactivo al puntero */}
      <motion.div
        style={{ background: spotlightBg }}
        className="pointer-events-none absolute -inset-px z-20 opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-300"
      />
      {children}
    </motion.div>
  );
}

export function HomeView() {
  const shouldReduceMotion = useReducedMotion();
  const { products: storeProducts, categories: storeCategories } = useAdminStore();

  const [products, setProducts] = useState<Product[]>(
    storeProducts.filter((p) => p.active)
  );
  const [categories, setCategories] = useState<Category[]>(
    storeCategories.filter((c) => c.active)
  );

  // Palabra cinética rotativa estilo Aceternity <FlipWords />
  const [flipWordIdx, setFlipWordIdx] = useState(0);

  // Producto destacado activo en el Hero + pausa en hover
  const [[heroIdx, heroDir], setHeroTuple] = useState<[number, number]>([0, 1]);
  const [isHeroCardHovered, setIsHeroCardHovered] = useState(false);

  // Pestaña activa en el catálogo de inicio
  const [activeTab, setActiveTab] = useState<'featured' | 'deals' | 'all'>('featured');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Selector interactivo de Experiencia Gaming House + auto-ciclo pausable
  const [[activeHighlight, highlightDir], setHighlightTuple] = useState<[number, number]>([
    0, 1,
  ]);
  const [isExperienceHovered, setIsExperienceHovered] = useState(false);

  // Cursor Spotlight global en el Hero
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const heroSpotlightOverlay = useMotionTemplate`radial-gradient(620px circle at ${heroMouseX}px ${heroMouseY}px, rgba(0, 255, 136, 0.11), rgba(0, 229, 255, 0.04) 45%, transparent 80%)`;

  useEffect(() => {
    setProducts(storeProducts.filter((p) => p.active));
    setCategories(storeCategories.filter((c) => c.active));
  }, [storeProducts, storeCategories]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
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

        if (productsData && productsData.length > 0) setProducts(productsData);
        if (categoriesData && categoriesData.length > 0) setCategories(categoriesData);
      } catch {
        // Fallback a datos locales
      }
    }
    loadData();
  }, []);

  // Rotación automática de <FlipWords /> en el titular del Hero
  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setFlipWordIdx((prev) => (prev + 1) % HERO_FLIP_WORDS.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  const spotlightProducts = useMemo(() => {
    const feat = products.filter((p) => p.featured);
    return (feat.length > 0 ? feat : products).slice(0, 5);
  }, [products]);

  const currentHeroProduct =
    spotlightProducts[heroIdx % Math.max(1, spotlightProducts.length)] || products[0];

  const cycleHero = (dir: 1 | -1) => {
    if (spotlightProducts.length <= 1) return;
    setHeroTuple(([prev]) => [
      (prev + dir + spotlightProducts.length) % spotlightProducts.length,
      dir,
    ]);
  };

  // Auto-rotación del producto destacado en el Hero cada 5s (se pausa al pasar el cursor)
  useEffect(() => {
    if (shouldReduceMotion || isHeroCardHovered || spotlightProducts.length <= 1) return;
    const timer = setInterval(() => {
      setHeroTuple(([prev]) => [(prev + 1) % spotlightProducts.length, 1]);
    }, 5000);
    return () => clearInterval(timer);
  }, [shouldReduceMotion, isHeroCardHovered, spotlightProducts.length]);

  // Auto-rotación de Experiencia Gaming House cada 5.5s (se pausa al interactuar)
  useEffect(() => {
    if (shouldReduceMotion || isExperienceHovered) return;
    const timer = setInterval(() => {
      setHighlightTuple(([prev]) => [(prev + 1) % HIGHLIGHTS.length, 1]);
    }, 5500);
    return () => clearInterval(timer);
  }, [shouldReduceMotion, isExperienceHovered, activeHighlight]);

  const selectHighlight = (idx: number) => {
    setHighlightTuple(([prev]) => [idx, idx >= prev ? 1 : -1]);
  };

  // Progreso de lectura global
  const { scrollYProgress: pageScroll } = useScroll();
  const smoothPageScroll = useSpring(pageScroll, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  // Parallax del Hero
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBgScale = useTransform(
    heroScroll,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [1.14, 1.0]
  );
  const heroBgY = useTransform(
    heroScroll,
    [0, 1],
    shouldReduceMotion ? ['0%', '0%'] : ['0%', '18%']
  );
  const heroTextY = useTransform(
    heroScroll,
    [0, 1],
    shouldReduceMotion ? ['0%', '0%'] : ['0%', '22%']
  );
  const heroCardY = useTransform(
    heroScroll,
    [0, 1],
    shouldReduceMotion ? ['0%', '0%'] : ['0%', '-12%']
  );
  const heroOpacity = useTransform(heroScroll, [0, 0.85], [1, 0]);

  const handleHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!heroRef.current || shouldReduceMotion) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMouseX.set(e.clientX - rect.left);
    heroMouseY.set(e.clientY - rect.top);
  };

  // Productos filtrados
  const displayedProducts = useMemo(() => {
    if (activeTab === 'featured') {
      const feat = products.filter((p) => p.featured);
      return feat.length > 0 ? feat.slice(0, 8) : products.slice(0, 8);
    }
    if (activeTab === 'deals') {
      const deals = products.filter(
        (p) => p.compare_at_price && p.compare_at_price > p.price
      );
      return deals.length > 0 ? deals.slice(0, 8) : products.slice(0, 8);
    }
    return products.slice(0, 8);
  }, [products, activeTab]);

  const currentHighlight = HIGHLIGHTS[activeHighlight];

  return (
    <div className="w-full overflow-x-hidden relative">
      {/* Barra superior minimalista de progreso de scroll */}
      <motion.div
        style={{ scaleX: smoothPageScroll, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-[#7000ff] z-50 pointer-events-none shadow-[0_0_12px_#00ff88]"
      />

      {/* =====================================================================
          1. HERO PRINCIPAL CON SPOTLIGHT, BACKGROUND BEAMS Y 3D CARD TILT
          ===================================================================== */}
      <section
        ref={heroRef}
        onPointerMove={handleHeroPointerMove}
        className="group/hero relative w-full min-h-[86vh] flex flex-col justify-between bg-[#0c0e11] border-b border-white/10 overflow-hidden"
      >
        <motion.div
          style={{ scale: heroBgScale, y: heroBgY }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <Image
            src={THEME_CONFIG.hero.bgImage}
            alt="Gaming House"
            fill
            priority
            className="object-cover object-center opacity-35 mix-blend-luminosity"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e11] via-[#0c0e11]/88 to-[#0c0e11]/40 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-transparent to-[#0c0e11]/60 z-10 pointer-events-none" />

        {/* Aceternity UI Spotlight + Background Beams + Perspective Grid */}
        <HeroAmbientBeams />

        {/* Luz radial reactiva al movimiento del puntero en todo el Hero */}
        <motion.div
          style={{ background: heroSpotlightOverlay }}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500"
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="w-full px-4 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-20 my-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Texto Principal con TextGenerateEffect + FlipWords */}
            <motion.div style={{ y: heroTextY }} className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className="inline-flex items-center gap-2.5 border-l-2 border-[#00ff88] pl-3"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#00ff88]">
                  GAMING HOUSE CHILE
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-[-0.03em] leading-[0.95] text-white uppercase font-heading">
                {/* Palabras que emergen con TextGenerateEffect (blur -> nítido) */}
                <span className="block">
                  {['TU', 'SETUP', 'LISTO'].map((word, wIdx) => (
                    <motion.span
                      key={word}
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : 18,
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                      }}
                      transition={{
                        duration: 0.55,
                        delay: wIdx * 0.08,
                        ease: EASE_OUT,
                      }}
                      className="inline-block mr-[0.26em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>

                {/* Aceternity UI <FlipWords /> para la frase de impacto */}
                <span className="relative block h-[1.08em] overflow-hidden mt-1">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={HERO_FLIP_WORDS[flipWordIdx]}
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : 28,
                        filter: 'blur(6px)',
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                      }}
                      exit={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : -28,
                        filter: 'blur(6px)',
                      }}
                      transition={{ duration: 0.42, ease: EASE_OUT }}
                      className="block bg-gradient-to-r from-[#00ff88] via-[#60ff99] to-[#00e5ff] bg-clip-text text-transparent"
                    >
                      {HERO_FLIP_WORDS[flipWordIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16, ease: EASE_OUT }}
                className="text-base sm:text-lg text-[#b9cbb9] max-w-[52ch] leading-relaxed"
              >
                PCs de escritorio armadas para gaming, streaming y trabajo profesional. Listas para enchufar y usar, con pago vía Webpay Plus y despacho a todo Chile.
              </motion.p>

              {/* Botones con Moving Border / Shimmer Beam */}
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease: EASE_OUT }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link
                  href="/productos"
                  className="gh-press gh-hover-lift gh-shimmer-after inline-flex items-center gap-3 px-8 h-12 bg-[#00ff88] hover:bg-[#60ff99] text-[#003919] font-mono text-xs font-black uppercase tracking-widest shadow-[0_0_32px_-4px_rgba(0,255,136,0.6)]"
                >
                  <span>Ver Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Botón con borde luminoso giratorio (Aceternity Moving Border) */}
                <Link
                  href="#destacados"
                  className="gh-press gh-hover-lift relative p-[1px] overflow-hidden inline-flex items-center justify-center h-12 group/btn"
                >
                  <span className="gh-moving-border absolute inset-[-180%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#00e5ff_50%,#00ff88_100%)] opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative inline-flex items-center gap-2.5 px-7 h-full bg-[#12161d] group-hover/btn:bg-[#161c26] text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors">
                    <span>Explorar Destacados</span>
                  </span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Tarjeta 3D Interactiva del Producto Destacado (Aceternity 3D Card Effect) */}
            {currentHeroProduct && (
              <motion.div
                style={{ y: heroCardY }}
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.12, ease: EASE_OUT }}
                onMouseEnter={() => setIsHeroCardHovered(true)}
                onMouseLeave={() => setIsHeroCardHovered(false)}
                className="lg:col-span-5"
              >
                <SpotlightTiltCard
                  tiltDegree={8}
                  enableDepth
                  spotlightColor="rgba(0, 255, 136, 0.25)"
                  className="bg-[#13171f]/95 backdrop-blur-md border border-white/15 hover:border-[#00ff88]/50 gh-specular overflow-hidden transition-colors"
                >
                  {/* Barra de auto-progreso láser en vivo */}
                  <div className="relative h-0.5 w-full bg-white/10 overflow-hidden">
                    <motion.div
                      key={`${currentHeroProduct.id}-${isHeroCardHovered ? 'paused' : 'play'}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isHeroCardHovered ? 0.35 : 1 }}
                      transition={{
                        duration: isHeroCardHovered ? 0.3 : 5,
                        ease: 'linear',
                      }}
                      style={{ transformOrigin: '0% 50%' }}
                      className="h-full w-full bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-[#7000ff]"
                    />
                  </div>

                  <div className="relative aspect-[16/11] w-full bg-[#0c0e11] overflow-hidden">
                    {/* Barrido óptico sutil */}
                    <div className="gh-scanline absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-transparent via-[#00ff88]/10 to-transparent pointer-events-none z-20" />

                    <AnimatePresence mode="popLayout" initial={false} custom={heroDir}>
                      <motion.div
                        key={currentHeroProduct.id}
                        custom={heroDir}
                        variants={{
                          initial: (d: number) => ({
                            opacity: 0,
                            x: shouldReduceMotion ? 0 : d * 24,
                            scale: 1.05,
                            filter: 'blur(4px)',
                          }),
                          animate: {
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            filter: 'blur(0px)',
                          },
                          exit: (d: number) => ({
                            opacity: 0,
                            x: shouldReduceMotion ? 0 : d * -24,
                            scale: 0.96,
                            filter: 'blur(4px)',
                          }),
                        }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.38, ease: EASE_OUT }}
                        className="absolute inset-0"
                      >
                        {currentHeroProduct.images?.[0] && (
                          <Image
                            src={currentHeroProduct.images[0]}
                            alt={currentHeroProduct.title}
                            fill
                            className="object-cover object-center opacity-90 group-hover/tilt:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-transparent to-transparent" />
                      </motion.div>
                    </AnimatePresence>

                    {currentHeroProduct.compare_at_price &&
                      currentHeroProduct.compare_at_price > currentHeroProduct.price && (
                        <div className="absolute top-3 left-3 z-20">
                          <span className="px-2.5 py-1 bg-[#00ff88] text-[#003919] font-mono text-[10px] font-black uppercase tracking-wider tabular-nums shadow-[0_0_16px_rgba(0,255,136,0.5)]">
                            -
                            {Math.round(
                              ((currentHeroProduct.compare_at_price -
                                currentHeroProduct.price) /
                                currentHeroProduct.compare_at_price) *
                                100
                            )}
                            % OFF
                          </span>
                        </div>
                      )}

                    {/* Indicadores de diapositiva */}
                    <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
                      {spotlightProducts.map((p, idx) => {
                        const active =
                          idx === heroIdx % Math.max(1, spotlightProducts.length);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              setHeroTuple(([prev]) => [idx, idx >= prev ? 1 : -1])
                            }
                            aria-label={`Ver producto ${idx + 1}`}
                            className={`h-1 transition-all duration-300 ${
                              active ? 'w-5 bg-[#00ff88]' : 'w-2 bg-white/30 hover:bg-white/60'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-5 flex items-center justify-between gap-4 bg-[#13171f] relative z-20">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#00e5ff] truncate">
                        {currentHeroProduct.category?.name || 'DESTACADO'}
                      </span>
                      <Link
                        href={`/productos/${currentHeroProduct.slug}`}
                        className="block text-lg font-black text-white hover:text-[#00ff88] transition-colors uppercase font-heading truncate"
                      >
                        {currentHeroProduct.title}
                      </Link>
                      <span className="block text-lg font-black font-mono text-[#00ff88] tabular-nums mt-0.5">
                        {formatCLP(currentHeroProduct.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => cycleHero(-1)}
                        aria-label="Anterior"
                        className="gh-press w-9 h-9 bg-[#0c0e11] hover:bg-[#00ff88] hover:text-[#003919] border border-white/15 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => cycleHero(1)}
                        aria-label="Siguiente"
                        className="gh-press w-9 h-9 bg-[#0c0e11] hover:bg-[#00ff88] hover:text-[#003919] border border-white/15 text-white flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </SpotlightTiltCard>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Barra de Confianza Simple con Hover Luminoso */}
        <div className="relative z-20 w-full border-t border-white/10 bg-[#090b0e]/90 backdrop-blur-md">
          <div className="w-full px-4 sm:px-8 lg:px-12 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-[#b9cbb9]">
            <div className="flex items-center gap-2.5 group/trust">
              <CreditCard className="w-4 h-4 text-[#00ff88] shrink-0 group-hover/trust:scale-110 transition-transform" />
              <span className="group-hover/trust:text-white transition-colors">
                Pago seguro con Webpay Plus (Transbank)
              </span>
            </div>
            <div className="flex items-center gap-2.5 group/trust">
              <Truck className="w-4 h-4 text-[#00e5ff] shrink-0 group-hover/trust:scale-110 transition-transform" />
              <span className="group-hover/trust:text-white transition-colors">
                Envíos a todo Chile vía Blue Express
              </span>
            </div>
            <div className="flex items-center gap-2.5 group/trust">
              <ShieldCheck className="w-4 h-4 text-[#00ff88] shrink-0 group-hover/trust:scale-110 transition-transform" />
              <span className="group-hover/trust:text-white transition-colors">
                Stock real y garantía directa
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. CATEGORÍAS VISUALES CON 3D GLARE & SPOTLIGHT TILT (ACETERNITY / VENGEANCE)
          ===================================================================== */}
      <section className="relative w-full px-4 sm:px-8 lg:px-12 py-20 border-b border-white/10 bg-[#111317] overflow-hidden">
        {/* Halo ambiental flotante */}
        <div className="gh-beam-glow absolute -right-32 -top-32 w-96 h-96 bg-[#00e5ff]/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="flex items-end justify-between gap-4"
          >
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#00ff88] block">
                CATEGORÍAS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-[-0.02em] font-heading mt-1">
                Explora por <span className="text-[#00ff88]">Línea</span>
              </h2>
            </div>

            <Link
              href="/productos"
              className="gh-press inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#00e5ff] hover:text-[#00ff88] transition-colors"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, index) => {
              const waveDelays = [0, 0.06, 0.11, 0.15];
              return (
                <motion.div
                  key={cat.id}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 24,
                    scale: shouldReduceMotion ? 1 : 0.96,
                  }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.55,
                    delay: waveDelays[index] ?? 0.15,
                    ease: EASE_OUT,
                  }}
                >
                  <SpotlightTiltCard
                    tiltDegree={6}
                    spotlightColor="rgba(0, 255, 136, 0.26)"
                    className="h-64 bg-[#161920] border border-white/10 hover:border-[#00ff88]/60 gh-specular overflow-hidden transition-colors"
                  >
                    <Link
                      href={`/productos?category=${cat.slug}`}
                      className="gh-press group relative w-full h-full block overflow-hidden"
                    >
                      {cat.image_url && (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          className="object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-[#0c0e11]/35 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 z-30 flex items-end justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight font-heading group-hover:text-[#00ff88] transition-colors">
                            {cat.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#00ff88] mt-1">
                            <span>Ver productos</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00ff88] to-[#00e5ff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-30 shadow-[0_0_12px_#00ff88]" />
                    </Link>
                  </SpotlightTiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. PRODUCTOS DESTACADOS Y OFERTAS (FOCO MAGNÉTICO & ENTRADA 3D)
          ===================================================================== */}
      <section
        id="destacados"
        className="relative w-full px-4 sm:px-8 lg:px-12 py-20 border-b border-white/10 bg-[#0c0e11] overflow-hidden"
      >
        <div className="gh-beam-glow absolute -left-32 top-1/3 w-96 h-96 bg-[#00ff88]/[0.05] rounded-full blur-[130px] pointer-events-none" />

        <div className="space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="pb-5"
            >
              <span className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#00ff88] block">
                CATÁLOGO DESTACADO
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-[-0.02em] font-heading mt-1">
                Elige tu <span className="text-[#00ff88]">Próximo Upgrade</span>
              </h2>
            </motion.div>

            {/* Pestañas con Hover Magnético + Línea Láser Spring (Aceternity Animated Tabs) */}
            <div
              onMouseLeave={() => setHoveredTab(null)}
              className="flex items-center gap-1 overflow-x-auto"
            >
              {[
                { id: 'featured', label: 'Destacados' },
                { id: 'deals', label: 'En Oferta' },
                { id: 'all', label: 'Ver Todos' },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const isHovered = hoveredTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onClick={() => setActiveTab(tab.id as 'featured' | 'deals' | 'all')}
                    className={`gh-press relative px-5 py-4 text-xs font-mono font-bold uppercase tracking-[0.15em] transition-colors shrink-0 focus:outline-none ${
                      isSelected ? 'text-[#00ff88]' : 'text-[#849585] hover:text-white'
                    }`}
                  >
                    {isHovered && (
                      <motion.div
                        layoutId="home-inventory-hover-bg"
                        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                        className="absolute inset-0 bg-white/[0.04] pointer-events-none"
                      />
                    )}
                    {isSelected && (
                      <motion.div
                        layoutId="home-inventory-active-bg"
                        transition={{ type: 'spring', duration: 0.42, bounce: 0.15 }}
                        className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/[0.1] to-transparent pointer-events-none"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="home-inventory-tab"
                        transition={{ type: 'spring', duration: 0.42, bounce: 0.15 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00ff88] shadow-[0_0_12px_#00ff88]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {displayedProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 22,
                    scale: shouldReduceMotion ? 1 : 0.96,
                  }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(idx, 4) * 0.05,
                    ease: EASE_OUT,
                  }}
                >
                  <SpotlightTiltCard
                    tiltDegree={4}
                    spotlightColor="rgba(0, 255, 136, 0.18)"
                    className="h-full rounded-2xl"
                  >
                    <ProductCard product={product} />
                  </SpotlightTiltCard>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="pt-4 flex justify-center">
            <Link
              href="/productos"
              className="gh-press gh-hover-lift gh-shimmer-after inline-flex items-center gap-3 px-8 h-12 bg-[#14171e] hover:bg-[#00ff88] text-[#00ff88] hover:text-[#003919] border border-[#00ff88]/40 font-mono text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. EXPERIENCIA GAMING HOUSE (AUTO-CICLO CON BARRA LÁSER & VISOR 3D)
          ===================================================================== */}
      <section
        onMouseEnter={() => setIsExperienceHovered(true)}
        onMouseLeave={() => setIsExperienceHovered(false)}
        className="relative w-full px-4 sm:px-8 lg:px-12 py-20 bg-[#111317] overflow-hidden"
      >
        <div className="gh-beam-glow absolute right-10 bottom-10 w-[420px] h-[420px] bg-[#00ff88]/[0.05] rounded-full blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10"
        >
          {/* Izquierda: 3 Beneficios Claros con Auto-Progreso Láser y Selección Instantánea */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#00ff88] block">
                POR QUÉ ELEGIRNOS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-[-0.02em] font-heading mt-1">
                Experiencia <span className="text-[#00ff88]">Gaming House</span>
              </h2>
            </div>

            <div className="relative pl-6 space-y-3">
              <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-white/10" />

              {HIGHLIGHTS.map((item, idx) => {
                const isCurrent = idx === activeHighlight;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectHighlight(idx)}
                    className={`gh-press relative w-full text-left p-4 border transition-colors focus:outline-none overflow-hidden ${
                      isCurrent
                        ? 'bg-[#161a22] border-[#00ff88]/45 gh-specular'
                        : 'bg-[#13161c]/40 border-transparent opacity-60 hover:opacity-95 hover:bg-[#161a22]/50'
                    }`}
                  >
                    {isCurrent && (
                      <motion.div
                        layoutId="experience-active-rail"
                        transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                        className="absolute -left-[25px] top-0 bottom-0 w-[2px] bg-[#00ff88] shadow-[0_0_12px_#00ff88]"
                      />
                    )}

                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.tag}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase font-heading mt-1">
                      {item.title}
                    </h3>

                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        className="text-xs text-[#b9cbb9] leading-relaxed mt-1.5"
                      >
                        {item.subtitle}
                      </motion.p>
                    )}

                    {/* Barra láser inferior de auto-avance (5.5s) */}
                    {isCurrent && !shouldReduceMotion && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
                        <motion.div
                          key={`${item.id}-${isExperienceHovered ? 'hold' : 'run'}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isExperienceHovered ? 0.4 : 1 }}
                          transition={{
                            duration: isExperienceHovered ? 0.25 : 5.5,
                            ease: 'linear',
                          }}
                          style={{ transformOrigin: '0% 50%' }}
                          className="h-full w-full bg-gradient-to-r from-[#00ff88] to-[#00e5ff]"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Derecha: Visor 3D con Spotlight Tilt y Transición Fluida */}
          <div className="lg:col-span-7">
            <SpotlightTiltCard
              tiltDegree={5}
              spotlightColor="rgba(0, 229, 255, 0.22)"
              className="w-full aspect-[16/10] bg-[#0c0e11] border border-white/15 hover:border-[#00ff88]/50 gh-specular overflow-hidden transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-transparent z-30" />

              {/* Barrido óptico sutil */}
              <div className="gh-scanline absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-[#00e5ff]/10 to-transparent pointer-events-none z-20" />

              <AnimatePresence mode="popLayout" initial={false} custom={highlightDir}>
                <motion.div
                  key={currentHighlight.id}
                  custom={highlightDir}
                  variants={{
                    initial: (d: number) => ({
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : d * 18,
                      scale: 1.05,
                      filter: 'blur(4px)',
                    }),
                    animate: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: 'blur(0px)',
                    },
                    exit: (d: number) => ({
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : d * -18,
                      scale: 0.97,
                      filter: 'blur(4px)',
                    }),
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentHighlight.image}
                    alt={currentHighlight.title}
                    fill
                    className="object-cover object-center opacity-85 group-hover/tilt:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-[#0c0e11]/30 to-transparent" />
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-30 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="max-w-lg">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00ff88]">
                    {currentHighlight.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-heading mt-0.5">
                    {currentHighlight.title}
                  </h3>
                </div>

                <Link
                  href="/productos"
                  className="gh-press gh-shimmer-after inline-flex items-center gap-2 px-5 h-10 bg-[#00ff88] hover:bg-[#60ff99] text-[#003919] font-mono text-xs font-black uppercase tracking-wider shrink-0 shadow-[0_0_20px_rgba(0,255,136,0.45)]"
                >
                  <span>Comprar Ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </SpotlightTiltCard>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
